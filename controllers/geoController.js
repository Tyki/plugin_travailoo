'use strict'

const cacheRepository = require('../core/repositories/cacheRepository')
const geoHelper = require('../core/helpers/geoHelper')

function geoController () {
  /**
   * Restore points from cache
   * @param {KuzzleRequest} request 
   */
  this.getPoints = request => {

    // Get the points 
    let topLeft = request.input.body.topLeft
    let bottomRight = request.input.body.bottomRight

    let geoHashes = geoHelper.getGeoHashGridFromViewport(topLeft, bottomRight)
    
    let promises = geoHashes.map(geoHash => cacheRepository.getCachedGeoHash(geoHash, request))
    return Promise.all(promises)
    .then(results => {
      let total = 0
      let data = []
      results.forEach(result => {
        total += result.total
        result.data.forEach(offer => {
          data.push({id: offer._id, pos: offer._source.jobPosition})
        })
      })

      return {total, data}
    })
  }

  return this
}

module.exports = new geoController()
