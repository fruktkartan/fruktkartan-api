const { Client } = require("pg")
const {
  InternalServerError,
  NotFoundError,
  InvalidArgumentError,
} = require("restify-errors")

let endpoint = (req, res, next) => {
  const key = req.params.key
  if (!key) {
    return next(new InvalidArgumentError("Key missing"))
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  client.connect()
  const query = [
    "SELECT description, added_at, type, img",
    "       , ST_Y(point) AS lat, ST_X(point) AS lon",
    "  FROM trees",
    "  WHERE ssm_key = $1",
  ].join(" ")
  client.query(query, [key], (err, data) => {
    client.end()
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    if (!data.rows.length) {
      return next(new NotFoundError(`Could not find tree with id ${key}`))
    }
    let tree = data.rows[0]
    res.json({
      type: tree.type.trim(),
      file: tree.img,
      desc: tree.description,
      added: tree.added_at,
      lat: tree.lat,
      lon: tree.lon,
    })
    return next()
  })
}
module.exports = endpoint
