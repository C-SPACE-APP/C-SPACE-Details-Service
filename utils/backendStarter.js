const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')
const Router = require('../routes/routes')
const {Authenticate} = require('../middlewares')


const app = express()




const startBackend = port =>
{
    app.use(bodyparser.json())
    app.use(cors({
        credentials: true,
        origin: 'http://localhost:3000'
    }))


    // entry point of endpoints
    app.use('/', Router)
    // app.use(Authenticate())
    app.listen(port, (err) => {

        if (err) 
        { 
            console.log(`Error starting app: ${err}`)
            return 
        }
    
    
        console.log(`Server started at port ${port}`) 
    })
}

module.exports = startBackend