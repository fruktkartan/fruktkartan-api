import murmurhash from "murmurhash"

const isValidCoords = (lat, lon) => {
  return (
    !isNaN(parseFloat(lat)) &&
    !isNaN(parseFloat(lon)) &&
    parseFloat(lat) >= -90 &&
    parseFloat(lat) <= 90 &&
    parseFloat(lon) >= -180 &&
    parseFloat(lon) <= 180
  )
}

/**
 * Remove things that look like html tags from text.
 */
const sanitizeText = rawText => {
  let text = rawText.replace(/<[^>]+>/g, "")
  text = text.normalize("NFC") // Unicode normalize
  return text
}

/**
 * Hash a user IP
 */
const userHash = req => {
  return murmurhash.v3(
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  )
}

export { isValidCoords, sanitizeText, userHash }
