import pg from "pg"
import { isValidCoords } from "./utils.js"
import groupMap from "./tree-group-map.js"

export default (req, reply) => {
  let bbox = [-90, -180, 90, 180]
  if ("bbox" in req.query) {
    bbox = req.query.bbox.split(",").map(x => parseFloat(x.trim()))

    if (
      bbox.length < 4 ||
      !isValidCoords(bbox[0], bbox[1]) ||
      !isValidCoords(bbox[2], bbox[3])
    ) {
      reply.badRequest(`Invalid bbox argument: ${req.query.bbox}`)
    }
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect()
  const query = {
    name: "trees",
    text: [
      "SELECT ssm_key, description, img, type",
      "       , ST_Y(point) AS lat, ST_X(point) AS lon",
      "  FROM trees",
      "  WHERE type != ''",
      "        AND ST_Contains(ST_MakeEnvelope($1, $2, $3, $4), point)",
    ].join(" "),
    //       lon_min, lat_min, lon_max, lat_max
    values: [bbox[1], bbox[0], bbox[3], bbox[2]],
  }
  client.query(query, (err, data) => {
    if (err) {
      reply.internalServerError(`Error connecting to database: ${err}`)
    }
    let trees = data.rows.map(x => ({
      key: x.ssm_key.trim(),
      lat: x.lat,
      lng: x.lon,
      desc: x.description !== "",
      img: x.img !== "",
      type: x.type.trim(),
      group: groupMap[x.type.trim()] || "tree",
    }))
    client.end()
    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(trees)
  })
}
