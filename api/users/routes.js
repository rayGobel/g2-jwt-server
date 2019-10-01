const uuid = require('uuid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Boom = require('@hapi/boom')
const ephDatabase = require('../../db.js')

const hashPassword = function (password) {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

const verifyUniqueUser = function (request, h) {
  const index = ephDatabase
    .findIndex(user => {
      return user.name === request.payload.name ||
        user.email === request.payload.email
    })

  if (index >= 0) {
    throw Boom.badRequest('username or email taken!')
  }

  return h.continue
}

const routes = [
  {
    method: 'POST',
    path: '/api/users',
    config: {
      pre: [{ method: verifyUniqueUser }]
    },
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

module.exports = routes
