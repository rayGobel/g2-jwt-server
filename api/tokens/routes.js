const jwt = require('jsonwebtoken')
const ephDatabase = require('../../db.js')

const routes = [
  {
    method: 'GET',
    path: '/api/tokens/refresh',
    config: { auth: 'jwt' },
    handler: (request, h) => {
      console.log('request cred: ', request.auth.credentials)
      const decoded = request.auth.credentials
      const user = ephDatabase.find(user => user.id === decoded.id)
      const newToken = jwt.sign({ id: user.id, scopes: 'user' }, process.env.SERVER_KEY)
      return h.response({ token: newToken }).code(201)
    }
  }
]

module.exports = routes
