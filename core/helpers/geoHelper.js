const GeoHashConverter = require('latlon-geohash')

function geoHelper () {
  /**
   * Returns an array of geohashes that are in the viewport (AKA between topLeft and bottomRight)
   * @param {Object} topLeft 
   * @param {Object} bottomRight 
   */
  this.getGeoHashGridFromViewport = (topLeft, bottomRight, precision) => {
    const topRight = {
      lat: topLeft.lat,
      lon: bottomRight.lon
    }

    const bottomLeft = {
      lat: bottomRight.lat,
      lon: topLeft.lon
    }

    let geoHashes = []

    let topLeftGeoHash = GeoHashConverter.encode(topLeft.lat, topLeft.lon, precision)
    let topRightGeoHash = GeoHashConverter.encode(topRight.lat, topRight.lon, precision)
    let bottomLeftGeoHash = GeoHashConverter.encode(bottomLeft.lat, bottomLeft.lon, precision)
    let bottomRightGeoHash = GeoHashConverter.encode(bottomRight.lat, bottomRight.lon, precision)

    let currentGeoHash = topLeftGeoHash
    let startingGeoHashLine = topLeftGeoHash

    let collumns = 0
    let rows = 0
    for (var i = topLeftGeoHash; i !== topRightGeoHash; i = GeoHashConverter.adjacent(i, 'E')) {
      collumns++
    }

    for (var i = topLeftGeoHash; i !== bottomLeftGeoHash; i = GeoHashConverter.adjacent(i, 'S')) {
      rows++
    }

    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < collumns; j++) {
        geoHashes.push(currentGeoHash)
        currentGeoHash = GeoHashConverter.adjacent(currentGeoHash, 'E')
      }

      currentGeoHash = GeoHashConverter.adjacent(startingGeoHashLine, 'S')
      startingGeoHashLine = currentGeoHash
    }

    return geoHashes
  }

  return this
}

module.exports = new geoHelper()