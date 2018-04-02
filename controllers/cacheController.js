'use strict'

const cacheRepository = require('../core/repositories/cacheRepository')
const geoHelper = require('../core/helpers/geoHelper')

function cacheController () {
  /**
   * Warmup the cache with all the points
   * Hard hit on ES to put them in Redis
   * @param {KuzzleRequest} request 
   */
  this.warmupCache = () => {
    console.log('[Warmup] Starting to warmup the cache')

    const topLeftFrance = {
      lat: 51.209922,
      lon: -5.983665
    }
    
    const bottomRightFrance = {
      lat: 41.110475,
      lon: 10.309282
    }

    let geoHashes = geoHelper.getGeoHashGridFromViewport(topLeftFrance, bottomRightFrance, 4)
    let start = new Date().getTime()
    return cacheRepository.warmupGeoHashes(geoHashes, null)
    .then(() => {
      let duration = new Date().getTime() - start
      console.log(`[Warmup][${duration}ms] Done warming-up all geohashes for France`)
    })
  }

  /**
   * Update the cache after an update in offers
   * @param {KuzzleRequest} request 
   */
  this.updateCache = () => {
    return Promise.resolve()
  }

  return this
}

module.exports = new cacheController()
