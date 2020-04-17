/**
 * Endpoint for retrieving temporary credentials for uploading an image to Amazon S3
 */
const { getSignedRequest } = require("./s3")
const murmurhash = require("murmurhash")

module.exports = (req, res, next) => {
  const fileName = req.query["file-name"]
  const newFileName = murmurhash.v3(fileName, Date.now()) + fileName.split(".").pop()

  getSignedRequest(newFileName, process.env.S3_BUCKET, process.env.S3_REGION)
    .then(data => res.json(data))
    .catch(error => next(error))
}
