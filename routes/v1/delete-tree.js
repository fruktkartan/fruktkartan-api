const {Client} = require("pg")
const {InternalServerError} = require("restify-errors")


let endpoint = (req, res, next) => {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  client.connect()
  let query = "UPDATE trees SET deleted_at = $1, deleted_by = $2 WHERE ssm_key=$1;"
  client.query(query, [req.params.key], (err) => {
    if (err) {
      return next(new InternalServerError(`Error connecting to database: ${err}`))
    }
    res.json({})
    return next()
  })
}
module.exports = endpoint
