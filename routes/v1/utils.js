const murmurhash = require("murmurhash")

let utils = {}

utils.isValidCoords = (lat, lon) => {
  return (
    parseFloat(lat) &&
    parseFloat(lon) &&
    parseFloat(lat) >= -90 &&
    parseFloat(lat) <= 90
  )
}

/**
 * Remove things that look like html tags from text.
 */
utils.sanitizeText = rawText => {
  let text = rawText.replace(/<[^>]+>/g, "")
  text = text.normalize("NFC") // Unicode normalize
  return text
}

/**
 * Hash a user IP
 */
utils.userHash = req => {
  return murmurhash.v3(
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  )
}

module.exports = utils
