const {Client} = require("pg")
const {InvalidArgumentError, InternalServerError} = require("restify-errors")


let endpoint = (req, res, next) => {
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  })

  let bbox = [-90, -180, 90, 180]
  if ("bbox" in req.params) {
    bbox = req.params.bbox
      .split(",")
      .map(x => parseFloat(x.trim()))

    if (bbox.length < 4 || bbox.some(x => Number.isNaN(x))) {
      return next(new InvalidArgumentError(`Invalid bbox argument: ${req.params.bbox}`))
    }

  }

  client.connect()
  let query = "SELECT ssm_key, description, img, type, lat, lon FROM trees WHERE deleted_at IS NULL;"
  client.query(query, (err, data) => {
    if (err) {
      return next(new InternalServerError(`Error connecting to database: ${err}`))
    }
    let trees = data.rows
      .filter(x => (
        bbox[0] < x.lat &&
        x.lat < bbox[2] &&
        bbox[1] < x.lon &&
        x.lon < bbox[3]
      ))
      .map(x => ({
        key: x.ssm_key.trim(),
        lat: x.lat,
        lon: x.lon,
        desc: (x.description !== ""),
        img: (x.img !== ""),
      }))
    client.end()
    res.json(trees)
    return next()
  })
  
}
module.exports = endpoint
