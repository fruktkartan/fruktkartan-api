import pg from "pg"
import murmurhash from "murmurhash"
import { isValidCoords, sanitizeText, userHash } from "./utils.js"

export default (req, reply) => {
  if (["lat", "lon", "type"].some(x => !(x in req.body))) {
    reply.badRequest("Missing parameter! lat, lon and type are all required")
  }
  // Allow any tree type, for now.
  // if (!validTreeTypes.includes(req.params.type)) {
  //   return next(
  //     new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
  //   )
  // }
  if (!isValidCoords(req.body.lat, req.body.lon)) {
    reply.badRequest("Invalid coordinates")
  }
  const lat = parseFloat(req.body.lat)
  const lon = parseFloat(req.body.lon)
  const type = req.body.type // TODO some validation here
  const desc = req.body.desc || ""
  const key = murmurhash.v3("" + req.body.lat + req.body.lon, Date.now())
  const user_ip = userHash(req)
  const img = req.body.file || ""

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect()
  const query = [
    "INSERT INTO trees",
    "  (ssm_key, description, img, type, added_by, point)",
    "  VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7))",
  ].join(" ")
  client.query(
    query,
    [key, sanitizeText(desc), img, type, user_ip, lon, lat],
    err => {
      client.end()
      if (err) {
        reply.internalServerError(`Error connecting to database: ${err}`)
      }
      reply.code(200).send({ key })
    }
  )
}
