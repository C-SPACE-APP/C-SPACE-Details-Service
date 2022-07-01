const startBackend = require('./utils/backendStarter')
const initializeDatabase = require('./utils/initializeDatabase')


const port = process.env.PORT || 3009


if(initializeDatabase())
    startBackend(port)

