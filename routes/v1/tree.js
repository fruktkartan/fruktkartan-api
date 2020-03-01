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
    "SELECT description, added_at, img, img_200, img_400, img_800, type",
    "  FROM trees",
    "  WHERE ssm_key=$1",
  ].join(" ")
  client.query(query, [req.params.key], (err, data) => {
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
    client.end()
    res.json({
      img: tree.img
        ? `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${tree.img}`
        : null,
      desc: tree.description,
      type: tree.type.trim(),
      added: tree.added_at,
    })
    return next()
  })
}
module.exports = endpoint
