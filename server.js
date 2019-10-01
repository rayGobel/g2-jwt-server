require('dotenv').config()

const Hapi = require('@hapi/hapi')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const jwt = require('jsonwebtoken')

const ephDatabase = []

const hashPassword = function (password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

const validate = async function (decoded, req, h) {
  // This function will validate decoded JWT against database
  const user = ephDatabase.find(user => user.id === decoded.id)
  if (user && user.id) {
    return { valid: true }
  } else {
    return { valid: false }
  }
}

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello, World!'
    }
  },
  {
    method: 'POST',
    path: '/api/users',
    handler: async (request, h) => {
      const user = {
        id: uuid(),
        name: request.payload.username,
        email: request.payload.email,
        hash: await hashPassword(request.payload.password)
      }

      // Save to DB
      ephDatabase.push(user)
      console.log(`db.query: ${JSON.stringify(ephDatabase)}`)
      // Return signed token
      const token = jwt.sign({ id: user.id, scopes: 'user' }, process.env.SERVER_KEY)
      return h.response({ token }).code(201)
    }
  }
]

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

  await server.start()
  console.log(`server is running on ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
