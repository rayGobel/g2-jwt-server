require('dotenv').config()

const Hapi = require('@hapi/hapi')
const glob = require('glob')
const path = require('path')
const ephDatabase = require('./db.js')

const validate = async function (decoded, req, h) {
  // This function will validate decoded JWT against database
  let now = Date.now()
  now = Number(now.toString().substring(0, 10))
  const user = ephDatabase.find(user => user.id === decoded.id)
  const isValidUser = user && user.id
  const isExpired = now - decoded.iat > 5 * 60 // 5 min

  console.log('Now: ', now)
  console.log('Decoded: ', decoded.iat)

  if (isValidUser && !isExpired) {
    return { isValid: true }
  } else {
    return { isValid: false }
  }
}

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello, World!'
    }
  }
]

const registerApiRoutes = (server) => {
  return new Promise((resolve, reject) => {
    glob('api/**/routes.js', { root: __dirname }, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      files.forEach(file => {
        const route = require(path.join(__dirname, file))
        server.route(route)
      })
      resolve()
    })
  })
}

const init = async () => {
  const server = Hapi.server({
    port: process.env.SERVER_PORT || 6969,
    host: process.env.SERVER_HOST || 'localhost'
  })

  // Register plugins
  await server.register({
    plugin: require('hapi-auth-jwt2')
  })

  // Define authentication method
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.SERVER_KEY,
    validate
  })

  // Register routes
  server.route(routes)

  // Register routes under api
  await registerApiRoutes(server)

  await server.start()
  console.log(`server is running on ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
