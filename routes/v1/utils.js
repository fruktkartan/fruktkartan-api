let utils = {}

utils.isValidCoords = (lat, lon) => {
  return (
    parseFloat(lat) &&
    parseFloat(lon) &&
    parseFloat(lat) > -90 &&
    parseFloat(lat) < 90 &&
    parseFloat(lon) > -180 &&
    parseFloat(lon) < 180
  )
}

/**
 * Remove things that look like html tags from text.
 */
utils.sanitizeTezt = rawText => {
  let text = rawText.replace(/<[^>]+>/g, "")
  text = text.normalize("NFC") // Unicode NFC
  return text
}

module.exports = utils
