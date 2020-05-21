const { Client } = require("pg")
const { InternalServerError, NotFoundError } = require("restify-errors")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  const key = req.params.key
  client.connect()
  const query = "DELETE FROM trees WHERE ssm_key = $1"
  client.query(query, [key], (err, response) => {
    client.end()
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    if (response.rowCount === 0) {
      return next(new NotFoundError(`No such tree to delete: ${key}`))
    }
    res.json({})
    return next()
  })
}
module.exports = endpoint
