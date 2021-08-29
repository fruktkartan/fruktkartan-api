/**
 * Endpoint for updating an existing tree.
 */
const { Client } = require("pg")
const {
  InvalidArgumentError,
  MissingParameterError,
  InternalServerError,
  NotFoundError,
} = require("restify-errors")
const { isValidCoords, sanitizeText, userHash } = require("./utils")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  if (!req.params.key) {
    return next(new MissingParameterError("Missing key!"))
  }

  client.connect()

  let idx = 1
  let query = ["UPDATE trees SET added_at = now()"]
  let values = []

  query.push(`, added_by = $${idx}`)
  values.push(userHash(req))
  idx++

  const idx_noparams = idx

  if ("type" in req.params) {
    // TODO should do some validation here? Allowing any tree type, for now.
    // Idea:
    // if (!validTreeTypes.includes(req.params.type)) {
    //   return next(
    //     new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
    //   )
    // }
    query.push(`, type = $${idx}`)
    values.push(req.params.type)
    idx++
  }

  if ("desc" in req.params) {
    query.push(`, description = $${idx}`)
    values.push(sanitizeText(req.params.desc || ""))
    idx++
  }

  // Expects req.params.file to be passed also when the image is deleted (which
  // the frontend does).
  if ("file" in req.params) {
    query.push(`, img = $${idx}`)
    values.push(req.params.file || "")
    idx++
  }

  const lat = req.params.lat || ""
  const lon = req.params.lon || ""
  if (lat || lon) {
    if (!lat || !lon || !isValidCoords(lat, lon)) {
      return next(new InvalidArgumentError("Invalid coordinates"))
    }
    query.push(`, point = ST_MakePoint($${idx}, $${idx + 1})`)
    values.push(lon, lat)
    idx += 2
  }

  if (idx == idx_noparams) {
    return next(new MissingParameterError("Nothing to update"))
  }

  const key = req.params.key
  query.push(` WHERE ssm_key = $${idx}`)
  values.push(key)
  idx++

  client.query(query.join(" "), values, (err, response) => {
    client.end()
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    if (response.rowCount === 0) {
      return next(new NotFoundError(`No tree found to update for key ${key}`))
    }
    res.json({})
  })
}
module.exports = endpoint
