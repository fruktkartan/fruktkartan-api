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

module.exports = utils
