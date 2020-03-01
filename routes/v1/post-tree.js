/**
 * Endpoint for updating an existing tree. Does not currently allow the tree
 * to be moved.
 */
const { Client } = require("pg")
const {
  InvalidArgumentError,
  MissingParameterError,
  InternalServerError,
} = require("restify-errors")
const validTreeTypes = require("./validTreeTypes.json")
const { s3Credentials } = require("./s3.js")

let endpoint = (req, res, next) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  if (!("type" in req.params)) {
    return next(
      new MissingParameterError("Missing type!")
    )
  }
  if (!("key" in req.params)) {
    return next(
      new MissingParameterError("Missing key!")
    )
  }
  /*
  Allow any tree type, for now.
  if (!validTreeTypes.includes(req.params.type)) {
    return next(
      new InvalidArgumentError(`${req.params.type} is not a valid tree type.`)
    )
  }
  */
  const type = req.params.type // TODO some validation here
  const desc = req.params.desc || ""
  const key = req.params.key
  const user_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress

  const s3Params = s3Credentials(
    {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
    },
    {
      filename: key + ".jpg",
    }
  )

  client.connect()
  const query =
    "UPDATE trees" +
    "  SET type = $1, description = $2" +
    "  WHERE ssm_key = $3"
  client.query(query, [type, desc, key], (err, response) => {
    if (err) {
      return next(
        new InternalServerError(`Error connecting to database: ${err}`)
      )
    }
    if (response.rowCount === 0) {
      return next(
        new InternalServerError(`No tree found to update for key ${key}`)
      )
    }
    res.json({
      key,
      filename: key + ".jpg",
      filetype: "image/jpeg",
      fileEndpoint: s3Params.endpoint_url,
      fileParams: s3Params.params,
    })
    return next()
  })
}
module.exports = endpoint
