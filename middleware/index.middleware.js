class indexMiddleware{
    checkAuth(req, res, next){
        if (req.session.isAuth){
            res.locals.username = req.session.username
            res.locals.password = req.session.password
            next()
        }
        else{
            console.log("ve nha")
            res.render('home', {
                username: '',
                password: '',
                messageError: 'You need to login '
            })
        }
    }
}

module.exports = new indexMiddleware()
