'use strict'

const pluginContext = require('../classes/pluginContext')
const cacheRepository = require('./cacheRepository')
const GeoHashConverter = require('latlon-geohash')

const offersIndex = 'offers'
const offersCollection = 'data'

function geoRepository () {

  this.searchByGeoHashes = (geoHashes, accumulator, promise) => {
    if (geoHashes.length === 0) {
      return promise
      .then(result => {
        accumulator.push(result)

        return accumulator
      })
    }

    let geoHash = geoHashes.shift()

    if (!promise) {
      var newPromise = this.searchAGeoHash(geoHash)

      return this.searchByGeoHashes(geoHashes, accumulator, newPromise)
    } else {
      return promise
      .then(result => {
        accumulator.push(result)

        var newPromise = this.searchAGeoHash(geoHash)

        return this.searchByGeoHashes(geoHashes, accumulator, newPromise)
      })
    }
  }

  /**
   * 
   * @param {Object} square 
   * @param {Promise} promise 
   */
  this.searchAGeoHash = (geoHash) => {
    let bounds = GeoHashConverter.bounds(geoHash)

    const request = new (pluginContext.get()).constructors.Request({
      controller: 'document',
      action: 'search',
      index: offersIndex,
      collection: offersCollection,
      body: {
        query: {
          bool: {
            must: {
              match_all: {}
            },
            filter: {
              geo_bounding_box: {
                jobPosition: {
                  "top_right": bounds.ne,
                  "bottom_left": bounds.sw
                }
              }
            }
          }
        }
      },
      from: 0,
      size: 9999,
      scroll: '5s'
    })

    let accumulator = []
    return (pluginContext.get()).accessors.execute(request)
    .then(response => {      
      if (response.result.total !== 0) {
        console.log(`[${geoHash}] count : ${response.result.total}`)
        response.result.hits.forEach(hit => {
          accumulator.push(hit)
        })

        if (response.result.total === accumulator.length) {
          console.log(`[${geoHash}] Done searching`)
          return {
            geoHash,
            accumulator
          }  
        } 

        return this.scrollSearchAGeoHash(response.result._scroll_id, geoHash, accumulator)
      } else {
        console.log(`[${geoHash}] Done searching`)
        return {
          geoHash,
          accumulator
        }
      }
    })
  }

  this.scrollSearchAGeoHash = (scrollId, geoHash, accumulator) => {
    const request = new (pluginContext.get()).constructors.Request({
      controller: 'document',
      action: 'scroll',
      scrollId,
      scroll: '5s'
    })

    return (pluginContext.get()).accessors.execute(request)
    .then(response => {
      if (response.result.hits.length !== 0) {
        response.result.hits.forEach(hit => {
          accumulator.push(hit)
        })
        console.log(`[${geoHash}] Scrolling`)
        return this.scrollSearchAGeoHash(response.result._scroll_id, geoHash, accumulator)
      } else {
        console.log(`[${geoHash}] Done searching after a scroll`)
        return {
          geoHash,
          accumulator
        }
      }
    })
  }

  return this
}

module.exports = new geoRepository()
