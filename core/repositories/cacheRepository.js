const pluginContext = require('../classes/pluginContext')
const geoRepository = require('./geoRepository')

function cacheRepository () {
  /**
   * Search offers in the given square
   * @param {Object} topLeft 
   * @param {Object} bottomRight 
   */
  this.warmupGeoHashes = (geoHashes, promise) => {
    if (!Array.isArray(geoHashes)) {
      return Promise.throw('Wrong argument. This is not an array of squares')
    }
    
    // End recursivity
    if (geoHashes.length === 0) {
      return promise
    } else {
      // Pop the first square of the array 
      let geoHash = geoHashes.shift()

      if (!promise) {
        // First call of the method, start the search with the new square
        // Give the promise (AKA waiting that the first search is done to do the next one) to the recursive loop
        var newPromise = geoRepository.searchAGeoHash(geoHash)

        return this.warmupGeoHashes(geoHashes, newPromise)
      } else {
        // Start a square search but with the promise chain from the last one
        // Give the promise (AKA waiting that the first search is done to do the next one) to the recursive loop        

        return promise
          .then(result => this.cacheGeohash(result.geoHash, result.accumulator))
          .then(() => {
          var newPromise = geoRepository.searchAGeoHash(geoHash)

          return this.warmupGeoHashes(geoHashes, newPromise)
        })
        
      }
    }
  }

  /**
   * Cache the results in Redis
   */
  this.cacheGeohash = (geoHash, result) => {
    const request = new (pluginContext.get()).constructors.Request({
      controller: 'ms',
      action: 'set',
      _id: geoHash,
      body: {
        value: JSON.stringify(result)
      }
    })

    return (pluginContext.get()).accessors.execute(request)
    .catch(error => {
      console.error(error)
    })    
  }

  this.getCachedGeoHash = (geoHash, request) => {
    const msRequest = new (pluginContext.get()).constructors.Request({
      controller: 'ms',
      action: 'get',
      _id: geoHash
    })

    return (pluginContext.get()).accessors.execute(msRequest)
    .then(response => {
      let data = JSON.parse(response.result)
      if (data) {
        return {total: data.length, data}
      } else {
        return {total: 0, data: []}
      }
    })
  }

  return this
}

module.exports = new cacheRepository()