/**
 * Endpoint for updating an existing tree.
 */
import pg from "pg"
import { isValidCoords, sanitizeText, userHash } from "./utils.js"

export default (req, reply) => {
  if (!req.params.key) {
    reply.badRequest("Missing key!")
  }
  if (!req.body) {
    reply.badRequest("Request body missing in call to post-tree!")
  }

  let idx = 1
  let query = ["UPDATE trees SET added_at = now()"]
  let values = []

  query.push(`, added_by = $${idx}`)
  values.push(userHash(req))
  idx++

  const idx_noparams = idx

  if ("type" in req.body) {
    // TODO should do some validation here? Allowing any tree type, for now.
    // Idea:
    // if (!validTreeTypes.includes(req.params.type)) {
    //   return next(
    //     new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
    //   )
    // }
    query.push(`, type = $${idx}`)
    values.push(req.body.type)
    idx++
  }

  if ("desc" in req.body) {
    query.push(`, description = $${idx}`)
    values.push(sanitizeText(req.body.desc || ""))
    idx++
  }

  // Expects req.params.file to be passed also when the image is deleted (which
  // the frontend does).
  if ("file" in req.body) {
    query.push(`, img = $${idx}`)
    values.push(req.body.file || "")
    idx++
  }

  if ("lat" in req.body && "lon" in req.body) {
    const lat = req.body.lat
    const lon = req.body.lon
    if (!isValidCoords(lat, lon)) {
      reply.badRequest(`Invalid coordinates: ${lat}, ${lon}`)
    }
    query.push(`, point = ST_MakePoint($${idx}, $${idx + 1})`)
    values.push(lon, lat)
    idx += 2
  }

  if (idx == idx_noparams) {
    reply.badRequest("Nothing to update")
  }

  const key = req.params.key
  query.push(` WHERE ssm_key = $${idx}`)
  values.push(key)
  idx++

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect()
  client.query(query.join(" "), values, (err, res) => {
    if (err) {
      reply.internalServerError(`Error connecting to database: ${err}`)
    }
    if (!res.rowCount) {
      reply.notFound(`Nothing found to update for key ${key}`)
    }
    client.end()
    reply.code(204).send()
  })
}
