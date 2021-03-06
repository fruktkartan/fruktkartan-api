/**
 * Utility functions for AWS S3 interaction
 *
 */
const { InternalServerError } = require("restify-errors")
const { S3 } = require("aws-sdk")

/**
 * Create all the data a client need to upload a file to AWS S3.
 */
function getSignedRequest(key, bucket, region) {
  return new Promise((resolve, reject) => {
    const s3 = new S3({ signatureVersion: "v4", region })
    const s3Params = {
      Bucket: bucket,
      Key: key,
    }
    s3.getSignedUrlPromise("putObject", s3Params, (err, data) => {
      if (err) {
        reject(
          new InternalServerError(`Error creating AWS S3 upload token: ${err}`)
        )
      }
      resolve({
        filename: key,
        signedRequest: data,
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
      })
    })
  })
}

module.exports = { getSignedRequest }
