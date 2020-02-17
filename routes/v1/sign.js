/**
 * Endpoint for retrieving temporary credentials for uploading an image to Amazon S3
 */
const { S3 } = require("aws-sdk")

module.exports = (req, res, next) => {
  const s3 = new S3()
  const fileName = req.query["file-name"]
  const bucket = process.env.S3_BUCKET
  const s3Params = {
    Bucket: bucket,
    Key: fileName,
    // Expires: 60,
  }

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      res
        .status(500)
        .send(
          `Något gick snett när vi försökte skaffa en tillfällig uppladdningsnyckel: ${err}`
        )
      return
    }
    const returnData = {
      signedRequest: data,
      url: `https://${bucket}.s3.amazonaws.com/${fileName}`,
    }
    res.json(returnData)
  })
}
