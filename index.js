'use strict'

const pluginContext = require('./core/classes/pluginContext')
const geoController = require('./controllers/geoController')
const cacheController = require('./controllers/cacheController')

class TravailooPlugin {
  constructor () {
    this.context = null
    this.config = {}

    this.hooks = require('./config/hooks')
    this.controllers = require('./config/controllers')
    this.routes = require('./config/routes')

    this.warmupCache = cacheController.warmupCache
    this.updateCache = cacheController.updateCache

    this.getPoints = geoController.getPoints
    this.getPointsES = geoController.getPointsES
  }
  
  init (customConfig, context) {
    this.config = Object.assign(this.config, customConfig)

    pluginContext.set(context)

    cacheController.warmupCache()
  }
}

module.exports = TravailooPlugin 