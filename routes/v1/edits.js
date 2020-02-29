const { Client } = require("pg")
const { InternalServerError } = require("restify-errors")

let endpoint = (req, res, next) => {
  let onlyDeleted = req.params.deleted ? true : false

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  client.connect()
  let query =
    "SELECT ssm_key, description, img, type," +
    "       ST_Y(point) AS lat, ST_X(point) AS lon," +
    "       deleted_at, deleted_by, added_at, added_by" +
    "  FROM trees"
  if (onlyDeleted) {
    query += " WHERE deleted_at IS NOT NULL"
  }
  client.query(query, (err, data) => {
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    let edits = data.rows
      .map(x => {
        x.time = x.added_at || x.deleted_at
        return x
      })
      .map(x => {
        x.ssm_key = x.ssm_key.trim()
        return x
      })
      .sort((a, b) => (a.time < b.time ? 1 : -1))
    client.end()
    res.json(edits)
    return next()
  })
}
module.exports = endpoint
