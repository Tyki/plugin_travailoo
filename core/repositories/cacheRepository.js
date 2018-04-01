const pluginContext = require('../classes/pluginContext')

function cacheRepository () {
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
      return {total: data.length, data}
    })
  }

  return this
}

module.exports = new cacheRepository()