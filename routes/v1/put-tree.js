const {Client} = require('pg')
const {InvalidArgumentError, MissingParameterError, InternalServerError} = require('restify-errors')
const murmurhash = require("murmurhash")
const validTreeTypes = require("./validTreeTypes.json")


let endpoint = (req, res, next) => {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  console.log(req.params)
  if (["lat", "lon", "type"].some(x => !(x in req.params))) {
    return next(new MissingParameterError("Missing parameter! lat, lon and type are all required"))
  }
  if (!validTreeTypes.includes(req.params.type)) {
    return next(new InvalidArgumentError(`${req.params.type} is not a valid tree type.`))
  }
  let desc = req.params.desc || ""
  let key = murmurhash.v3(req.params.lat + req.params.lon + desc)
  
  /*
  client.connect()
  let query = "INSERT INTO trees (ssm_key, description, lat, lon, img, img_200, img_400, img_600, img_200) VALUES $1, $2, $3, $4, $5, $6, $7, $8, $9"
  client.query(query, [key, description, lat, lon, img, img_200, img_400, img_600, img_200], (err, data) => {
    if (err) {
      return next(new InternalServerError(`Error connecting to database: ${err}`))
    }
    res.json({key})
    return next()
  })
  */

  res.json({key})
}
module.exports = endpoint
