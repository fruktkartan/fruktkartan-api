const { Client } = require("pg")
const {
  InvalidArgumentError,
  MissingParameterError,
  InternalServerError,
} = require("restify-errors")
const murmurhash = require("murmurhash")
const { isValidCoords, sanitizeText, userHash } = require("./utils")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  if (["lat", "lon", "type"].some(x => !(x in req.params))) {
    return next(
      new MissingParameterError(
        "Missing parameter! lat, lon and type are all required"
      )
    )
  }
  /*
  Allow any tree type, for now.
  if (!validTreeTypes.includes(req.params.type)) {
    return next(
      new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
    )
  }*/
  if (!isValidCoords(req.params.lat, req.params.lon)) {
    return next(new InvalidArgumentError("Invalid coordinates"))
  }
  const lat = parseFloat(req.params.lat)
  const lon = parseFloat(req.params.lon)
  const type = req.params.type // TODO some validation here
  const desc = req.params.desc || ""
  const key = murmurhash.v3("" + req.params.lat + req.params.lon, Date.now())
  const user_ip = userHash(req)
  const img = req.params.file || ""

  client.connect()
  const query = [
    "INSERT INTO trees",
    "  (ssm_key, description, img, type, added_by, point)",
    "  VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7))",
  ].join(" ")
  client.query(
    query,
    [key, sanitizeText(desc), img, type, user_ip, lon, lat],
    err => {
      client.end()
      if (err) {
        return next(
          new InternalServerError(`Error connecting to database: ${err}`)
        )
      }
      res.json({})
    }
  )
}
module.exports = endpoint
