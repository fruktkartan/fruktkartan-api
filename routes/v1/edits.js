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
  let query = [
    "SELECT ssm_key, description, img, type",
    "       , ST_Y(point) AS lat, ST_X(point) AS lon",
    "       , added_at, added_by",
    "  FROM trees",
    "  ORDER BY added_at",
  ].join(" ")
  client.query(query, (err, data) => {
    client.end()
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    let edits = data.rows
      .map(x => {
        x.ssm_key = x.ssm_key.trim()
        return x
      })
      .sort((a, b) => (a.added_at < b.added_at ? 1 : -1))
    res.json(edits)
    return next()
  })
}
module.exports = endpoint
