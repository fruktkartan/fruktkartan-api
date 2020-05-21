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
  const query = [
    "SELECT description, added_at, type, img",
    "  FROM trees",
    "  WHERE ssm_key = $1",
  ].join(" ")
  client.query(query, [req.params.key], (err, data) => {
    client.end()
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    if (!data.rows.length) {
      return next(
        new InternalServerError(`Could not find tree with id ${req.params.key}`)
      )
    }
    let tree = data.rows[0]
    res.json({
      type: tree.type.trim(),
      file: tree.img,
      desc: tree.description,
      added: tree.added_at,
    })
    return next()
  })
}
module.exports = endpoint
