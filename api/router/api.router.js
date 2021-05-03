const apiController = require('../controller/api.controller')
const middlewareController = require('../../middleware/index.middleware')
function api(app){
    app.get('/api/messages/:id', middlewareController.checkAuth, apiController.message)
    app.get('/api/group-receiver/:receiver', middlewareController.checkAuth, apiController.groupReceiver)
    app.get('/api/user', middlewareController.checkAuth, apiController.user)
    app.get('/api/receivers', middlewareController.checkAuth, apiController.receiverChatList)
    app.get('/api/groups', middlewareController.checkAuth, apiController.groups)
    app.get('/api/group-chat-list', middlewareController.checkAuth, apiController.groupChatList)
    app.get('/api/users', apiController.users)
}

module.exports = api
