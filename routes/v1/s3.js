/**
 * Utility functions for AWS S3 interaction
 *
 */
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

/**
 * Create all the data a client need to upload a file to AWS S3.
 */
async function getSignedRequest(key, bucket, region) {
  const clientParams = { region }
  const putObjectParams = {
    Bucket: bucket,
    Key: key,
  }
  const client = new S3Client(clientParams)
  const command = new PutObjectCommand(putObjectParams)
  const url = await getSignedUrl(client, command, { expiresIn: 3600 })
  return {
    filename: key,
    signedRequest: url,
    url: `https://${bucket}.s3.amazonaws.com/${key}`,
  }
}

export { getSignedRequest }
