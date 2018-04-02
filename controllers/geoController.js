'use strict'

const cacheRepository = require('../core/repositories/cacheRepository')
const geoRepository = require('../core/repositories/geoRepository')
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

  this.getPointsES = request => {
    let topLeft = request.input.body.topLeft
    let bottomRight = request.input.body.bottomRight

    let geoHashes = geoHelper.getGeoHashGridFromViewport(topLeft, bottomRight)

    let accumulator = []

    return geoRepository.searchByGeoHashes(geoHashes, accumulator, null)
    .then(results => {
      let total = 0
      let data = []
      
      results.forEach(result => {
        total += result.accumulator.length
        result.accumulator.forEach(offer => {
          data.push({id: offer._id, pos: offer._source.jobPosition})
        })        
      })

      return {total, data}
    })
  }

  return this
}

module.exports = new geoController()
