const {Client} = require("pg")
const {InvalidArgumentError, MissingParameterError, InternalServerError} = require("restify-errors")
const murmurhash = require("murmurhash")
const validTreeTypes = require("./validTreeTypes.json")
const {isValidCoords} = require("./utils.js")

let endpoint = (req, res, next) => {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  if (["lat", "lon", "type"].some(x => !(x in req.params))) {
    return next(new MissingParameterError("Missing parameter! lat, lon and type are all required"))
  }
  if (!validTreeTypes.includes(req.params.type)) {
    return next(new InvalidArgumentError(`${req.params.type} is not a valid tree type.`))
  }
  if (!isValidCoords(req.params.lat, req.params.lon)) {
    return next(new InvalidArgumentError("Invalid coordinates"))    
  }
  const lat = parseFloat(req.params.lat)
  const lon = parseFloat(req.params.lon)
  const desc = req.params.desc || ""
  const key = murmurhash.v3(req.params.lat + req.params.lon + Date.now())
  const user_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress
  
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

  client.connect()
  let query = "INSERT INTO trees (ssm_key, description, lat, lon, added_by) VALUES $1, $2, $3, $4, $5"
  client.query(query, [key, desc, lat, lon, user_ip], (err) => {
    if (err) {
      return next(new InternalServerError(`Error connecting to database: ${err}`))
    }
    res.json({key})
    return next()
  })
}
module.exports = endpoint
