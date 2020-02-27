const { Client } = require("pg")
const { InvalidArgumentError, InternalServerError } = require("restify-errors")
const groupMap = require("./tree-group-map.json")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  let bbox = [-90, -180, 90, 180]
  if ("bbox" in req.params) {
    bbox = req.params.bbox.split(",").map(x => parseFloat(x.trim()))

    if (bbox.length < 4 || bbox.some(x => Number.isNaN(x))) {
      return next(
        new InvalidArgumentError(`Invalid bbox argument: ${req.params.bbox}`)
      )
    }
  }

  client.connect()
  const query = {
    name: "trees",
    text:
      "SELECT ssm_key, description, img, type," +
      "       ST_Y(point) AS lat, ST_X(point) AS lon" +
      "  FROM trees" +
      "  WHERE deleted_at IS NULL" +
      "        AND type != ''" +
      "        AND ST_Contains(ST_MakeEnvelope($1, $2, $3, $4), point)",
    //       lon_min, lat_min, lon_max, lat_max
    values: [bbox[1], bbox[0], bbox[3], bbox[2]],
  }
  client.query(query, (err, data) => {
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
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
    res.json(trees)
    return next()
  })
}
module.exports = endpoint
