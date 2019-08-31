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

module.exports = utils
