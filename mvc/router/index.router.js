const homeRouter = require('./home.router')
const authRouter = require('./auth.router')
const middleware = require('../../middleware/index.middleware')
function connect(app){
    app.use('/', homeRouter)
    app.use('/auth', authRouter)
   
}

module.exports = connect