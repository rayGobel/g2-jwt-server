const routes = [
  {
    method: 'GET',
    path: '/api/restricted',
    config: { auth: 'jwt' },
    handler: async (request, h) => {
      const response = h.response({ text: 'Access granted!' })
      response.header('Authorization', request.headers.authorization)
      return response
    }
  }
]

module.exports = routes
