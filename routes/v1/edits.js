const {Client} = require("pg")
const {InvalidArgumentError, InternalServerError} = require("restify-errors")


let endpoint = (req, res, next) => {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })


  client.connect()
  let query = "SELECT ssm_key, description, img, type, lat, lon, deleted_at, deleted_by, added_at, added_by FROM trees;"
  client.query(query, (err, data) => {
    if (err) {
      return next(new InternalServerError(`Error connecting to database: ${err}`))
    }
    let edits = data.rows
      .map(x => {x.time = x.added_at || x.deleted_at; return x})
      .sort((a, b) => (a.time < b.time ? 1 : -1))
    client.end()
    res.json(edits)
    return next()
  })
  
}
module.exports = endpoint
