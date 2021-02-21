class indexMiddleware{
    checkAuth(req, res, next){
        // console.log('isauth: ', req.session.isAuth)
        if (req.session.isAuth){
            res.locals.username = req.session.username
            next()
        }
        else{
            res.render('home', {
                username: '',
                password: '',
                messageError: 'You need to login'
            })
        }
    }
}

module.exports = new indexMiddleware()
