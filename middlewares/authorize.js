module.exports = (type) => {
    return (async (req, res, next) => {

        /**
         * Check if logged in
         */
        if(!req.session.User) {
            return res.status(401).json({ message: `Not logged in` })
        }

        /**
         * Check if logged in user owns data to be accessed
         */
        if(type === 'OWNER') {
            const { _id } = req.session.User
            const { id } = req.params

            if(_id !== id) return res.status(403).json({ message: `User ${_id} unauthorized accessed on ${id}`})
        }

        next()
    })
}