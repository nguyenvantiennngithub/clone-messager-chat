const db = require('../../db/connect.db')
class homeController{
    home(req, res){
        res.render('home', {
            messageError: '',
            username: '',
            password: '',
        })
    }
    chat(req, res){
        
        res.render("chat")
    }

    
}

module.exports = new homeController()
