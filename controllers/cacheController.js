'use strict'

function cacheController () {
  /**
   * Warmup the cache with all the points
   * Hard hit on ES to put them in Redis
   * @param {KuzzleRequest} request 
   */
  this.warmupCache = () => {
    console.log('[Travailoo] Starting to warmup the cache')

    console.log('[Travailoo] Done warming up the cache')
  }

  /**
   * Update the cache after an update in offers
   * @param {KuzzleRequest} request 
   */
  this.updateCache = () => {
    return Promise.resolve()
  }
}

module.exports = new cacheController()
