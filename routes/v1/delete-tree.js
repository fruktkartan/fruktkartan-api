const { Client } = require("pg")
const { InternalServerError } = require("restify-errors")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  client.connect()
  const user_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  const time = new Date()
  const query = [
    "UPDATE trees",
    "  SET deleted_at = $2, deleted_by = $3",
    "  WHERE ssm_key = $1",
  ].join(" ")
  client.query(query, [req.params.key, time, user_ip], err => {
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    res.json({})
    return next()
  })
}
module.exports = endpoint
