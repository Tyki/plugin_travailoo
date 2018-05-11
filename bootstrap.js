if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()

  const fixtures = require('./tools/fixtures/fixtures')

  fixtures()
}
