const homeRouter = require('./home.router')
const authRouter = require('./auth.router')
const apiRouter = require('./api.router')

function connect(app){
    app.use('/', homeRouter)
    app.use('/auth', authRouter)
    app.use('/api', apiRouter)
}

module.exports = connect