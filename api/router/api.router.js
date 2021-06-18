const apiController = require('../controller/api.controller')
const middlewareController = require('../../middleware/index.middleware')
function api(app){
    app.get('/api/current-user', middlewareController.checkAuth, apiController.currentUser)
    app.get('/api/total-user', apiController.totalUser)
    app.get('/api/total-group', middlewareController.checkAuth, apiController.totalGroup)
    app.get('/api/idroom-online', middlewareController.checkAuth, apiController.idRoomOnline)
    // app.get('/api/room-nearest', middlewareController.checkAuth, apiController.getIdRoomNearest)
    app.get('/api/checked-user', middlewareController.checkAuth, apiController.checkedUser)
    app.get('/api/checked-group', middlewareController.checkAuth, apiController.checkedGroup)

    app.get('/api/user-host-room/:id', middlewareController.checkAuth, apiController.hostUserInRoom)
    app.get('/api/user-in-group/:id', middlewareController.checkAuth, apiController.userInRoom);
    app.get('/api/total-group/:receiver', middlewareController.checkAuth, apiController.totalGroupByUsername)
    app.get('/api/messages/:id', middlewareController.checkAuth, apiController.message)
    app.get('/api/group/:id', middlewareController.checkAuth, apiController.groupCurrentUserByIdRoom)
    app.get('/api/length-group/:id', middlewareController.checkAuth, apiController.getLengthGroupByIdRoom)

    app.get('/api/is-host/:username/:id', middlewareController.checkAuth, apiController.isHost)

}

module.exports = api
