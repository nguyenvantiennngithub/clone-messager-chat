const apiController = require('../controller/api.controller')
const middlewareController = require('../../middleware/index.middleware')
function api(app){
    app.get('/api/current-user', middlewareController.checkAuth, apiController.currentUser)
    app.get('/api/total-user', apiController.totalUser)
    app.get('/api/total-group', middlewareController.checkAuth, apiController.totalGroup)
    app.get('/api/idroom-online', middlewareController.checkAuth, apiController.idRoomOnline)
    app.get('/api/checked-user', middlewareController.checkAuth, apiController.checkedUser)
    app.get('/api/checked-group', middlewareController.checkAuth, apiController.checkedGroup)
    app.get('/api/idRoom-nearest', middlewareController.checkAuth, apiController.idRoomNearest)
    
    app.get('/api/message-oldest/:idroom', middlewareController.checkAuth, apiController.messageOldest);
    app.get('/api/message-nearest/:idroom', middlewareController.checkAuth, apiController.messageNearest);
        

    app.get('/api/user-by-username/:username', middlewareController.checkAuth, apiController.userByUsername);
    app.get('/api/user-host-room/:id', middlewareController.checkAuth, apiController.hostUserInRoom)
    app.get('/api/user-in-group/:id', middlewareController.checkAuth, apiController.userInRoom);
    app.get('/api/total-group/:receiver', middlewareController.checkAuth, apiController.totalGroupByUsername)
    app.get('/api/messages/:id', middlewareController.checkAuth, apiController.message)
    app.get('/api/group/:id', middlewareController.checkAuth, apiController.groupCurrentUserByIdRoom)
    app.get('/api/length-group/:id', middlewareController.checkAuth, apiController.getLengthGroupByIdRoom)
    app.get('/api/user-in-room/:username/:id', middlewareController.checkAuth, apiController.getUserInRoomByUsernameIdRoom)

}

module.exports = api
