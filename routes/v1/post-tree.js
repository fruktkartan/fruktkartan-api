/**
 * Endpoint for updating an existing tree. Does not currently allow the tree
 * to be moved.
 */
const { Client } = require("pg")
const { MissingParameterError, InternalServerError } = require("restify-errors")
const { sanitizeText, userHash } = require("./utils")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  if (!("type" in req.params)) {
    return next(new MissingParameterError("Missing type!"))
  }
  if (!req.params.key) {
    return next(new MissingParameterError("Missing key!"))
  }
  /*
  Allow any tree type, for now.
  if (!validTreeTypes.includes(req.params.type)) {
    return next(
      new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
    )
  }
  */
  const type = req.params.type // TODO some validation here
  const desc = req.params.desc || ""
  const key = req.params.key
  const img = req.params.file || ""
  const user_ip = userHash(req)

  client.connect()
  const query = [
    "UPDATE trees",
    "  SET type = $1, description = $2, img = $3, added_by = $4, added_at = now()",
    "  WHERE ssm_key = $4",
  ].join(" ")
  client.query(
    query,
    [type, sanitizeText(desc), img, key, user_ip],
    (err, response) => {
      client.end()
      if (err) {
        return next(
          new InternalServerError(`Error connecting to database: ${err}`)
        )
      }
      if (response.rowCount === 0) {
        return next(
          new InternalServerError(`No tree found to update for key ${key}`)
        )
      }
      res.json({})
    }
  )
}
module.exports = endpoint
