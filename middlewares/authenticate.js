const axios = require('axios')

module.exports = () => {
    return (async (req, res, next) => {
        let { cookie } = req.headers

        if(!cookie) {
            cookie = null
        }
        
        try {
            const { data } = await axios({
                method: 'get',
                headers: {
                    cookie: cookie
                },
                url: 'http://localhost:3003/getUser/'
            })

            req.session = data
        } catch (err) {
            console.log(`Error authenticating: ${err}`)
        }
        
        next()
    })
}