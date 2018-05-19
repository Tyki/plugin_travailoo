const Kuzzle = require('kuzzle-sdk')
const parse = require('csv-parse')
const bluebird = require('bluebird')
const fs = require('fs')
const randomWords = require('random-words')
const uuidv4 = require('uuid/v4')
const randomFloat = require('random-float')
const randomInt = require('random-int')

const host = process.env.KUZZLE_HOST || 'api.travailoo.fr'
let kuzzle = new Kuzzle(host)

let output = []

let data = []
let offers = []

function createFixtures () {
  try {
    // Create the parser
    let parser = parse({delimiter: ','})

    // Use the writable stream api
    parser.on('readable', function () {
      let record
      /* eslint-disable no-cond-assign */
      while (record = parser.read()) {
        output.push(record)
      }
    })

    // Catch any error
    parser.on('error', function (err) {
      console.error(err.message)
    })

    // When we are done, import the parsed content
    parser.on('finish', function () {
      output.forEach(row => {
        let category = row[0]
        let midCategory = row[1]
        let subCategory = row[2]
        let name = row[3]
        let code = row[4]

        if (midCategory === '' && subCategory === '' && code === '') {
          // Category
          data.push({
            create: {
              _index: 'labels',
              _type: 'categories',
              _id: category
            }
          })
          data.push({name, category})
        } else if (midCategory !== '' && subCategory === '' && code === '') {
          data.push({
            create: {
              _index: 'labels',
              _type: 'midCategories',
              _id: category + '-' + midCategory
            }
          })
          data.push({
            category,
            midCategory,
            name
          })
          // midCategory
        } else if (midCategory !== '' && subCategory !== '' && code === '') {
          // subCategory
          data.push({
            create: {
              _index: 'labels',
              _type: 'subCategories',
              _id: category + '-' + midCategory + '-' + subCategory
            }
          })
          data.push({
            category,
            midCategory,
            subCategory,
            name
          })
        } else {
          // Job
          data.push({
            create: {
              _index: 'labels',
              _type: 'jobs',
              _id: code
            }
          })
          data.push({
            category,
            midCategory,
            subCategory,
            code,
            name,
            lowerCasedName: name.toLowerCase(),
            fullIdentifier: category + '-' + midCategory + '-' + subCategory
          })
        }
      })

      insertData()
    })

    fs.readFile('tools/fixtures/jobs.csv', {flags: 'r'}, (error, data) => {
      if (error) console.error(error)
      parser.write(data.toString())
      parser.end()
    })
  } catch (e) {
    console.error(e)
  }
}

function createOffersFixtures () {
  offers = []
  var count = 1

  for (var i = 0; i < 10000; i++) {
    /**
     Ref GPS POINT
    'lat': 43.62613531177415,
    'lon': 3.9056396484375
    */
    var document = {
      'jobCode': randomInt(10200, 10500),
      'jobPosition': {
        'lat': '',
        'lon': ''
      },
      'title': randomWords({min: 3, max: 10, join: ' '}),
      'description': randomWords({min: 30, max: 80, join: ' '}),
      'societyName': randomWords(),
      'societyAddress': randomWords({min: 3, max: 10, join: ' '}),
      'societyWebsite': '',
      'experience': [],
      'salary': getRandomInt(120000)
    }

    var lat
    var lon
    if (count === 1) {
      lat = 43.62613531177415 + randomFloat(4)
      lon = 3.9056396484375 + randomFloat(4)
      count++
    } else if (count === 2) {
      lat = 43.62613531177415 - randomFloat(4)
      lon = 3.9056396484375 - randomFloat(4)
      count++
    } else if (count === 3) {
      lat = 43.62613531177415 - randomFloat(4)
      lon = 3.9056396484375 + randomFloat(4)
      count++
    } else if (count === 4) {
      lat = 43.62613531177415 + randomFloat(4)
      lon = 3.9056396484375 - randomFloat(4)
      count++
    } else {
      count = 1
    }

    document.jobPosition.lat = lat
    document.jobPosition.lon = lon

    var experience = getRandomInt(4)
    if (experience === 0) {
      experience = 1
    }
    document.experience.push(experience)

    var offerType = getRandomInt(8)
    if (offerType === 0) {
      offerType = 1
    }
    document.offerType = offerType

    offers.push({
      create: {
        _id: uuidv4(),
        _index: 'offers',
        _type: 'data'
      }
    })
    offers.push(document)
  }

  return kuzzle.queryPromise({controller: 'bulk', action: 'import', index: 'offers', collection: 'data'}, {body: {bulkData: offers}})
}

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function insertData () {
  kuzzle.loginPromise('local', {username: 'admin', password: 'admin'}, '1h')
    .then(() => kuzzle.queryPromise({index: 'labels'}, {controller: 'index', action: 'delete'}))
    .catch(error => {
    })
    .then(() => kuzzle.queryPromise({index: 'offers'}, {controller: 'index', action: 'delete'}))
    .catch(error => {
    })
    .then(() => kuzzle.createIndexPromise('offers'))
    .then(() => kuzzle.collection('data', 'offers').createPromise())
    .then(() => kuzzle.createIndexPromise('labels'))
    .then(() => kuzzle.collection('data', 'offers').collectionMapping({'jobPosition': {type: 'geo_point', index: 'analyzed'}}).applyPromise())
    .then(() => kuzzle.collection('categories', 'labels').createPromise())
    .then(() => kuzzle.collection('midCategories', 'labels').createPromise())
    .then(() => kuzzle.collection('subCategories', 'labels').createPromise())
    .then(() => kuzzle.collection('jobs', 'labels').createPromise())
    .then(() => kuzzle.queryPromise({controller: 'bulk', action: 'import'}, {body: {bulkData: data}}))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(() => createOffersFixtures())
    .then(response => {
      console.log('done !')
      process.exit(0)
    }).catch(error => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = createFixtures