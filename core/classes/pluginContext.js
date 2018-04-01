'use strict'

const pluginContext = function() {

    let pluginContext

    this.get = function() {
        return pluginContext;
    }

    this.set = function(newPluginContext) {
        pluginContext = newPluginContext
    }

    return this
}

module.exports = new pluginContext()