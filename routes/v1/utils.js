let utils = {}

utils.isValidCoords = (lat, lon) => {
  return (
    parseFloat(lat.trim()) &&
    parseFloat(lon.trim()) &&
    parseFloat(lat.trim()) > -90 &&
    parseFloat(lat.trim()) < 90 &&
    parseFloat(lon.trim()) > -180 &&
    parseFloat(lon.trim()) < 180
  )
}

module.exports = utils
