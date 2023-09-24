/**
 * Endpoint for retrieving temporary credentials for uploading an image to Amazon S3
 */
import { getSignedRequest } from "./s3.js"
import murmurhash from "murmurhash"

export default async (req, reply) => {
  const fileName = req.body["file-name"]
  const newFileName =
    murmurhash.v3(fileName, Date.now()) + "." + fileName.split(".").pop()

  const data = await getSignedRequest(
    newFileName,
    process.env.S3_BUCKET,
    process.env.S3_REGION
  )
  reply
    .code(200)
    .header("Content-Type", "application/json; charset=utf-8")
    .send(data)
}
