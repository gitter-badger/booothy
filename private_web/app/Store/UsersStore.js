var ApiConstants  = require('../Constant/ApiConstants');
var AppDispatcher = require('../Dispatcher/AppDispatcher');
var assign        = require('object-assign');
var EventEmitter  = require('events').EventEmitter;

var USER_CONFIRMED_EVENT   = 'user_confirmed';
var USER_NOT_ALLOWED_EVENT = 'user_now_allowed';
var USERS_LOADED_EVENT     = 'users_loaded';
var _users                 = [];
var _current_user          = {};

var UsersStore = assign({}, EventEmitter.prototype, {
    getCurrentUser : function () {
        return _current_user;
    },

    getUsersCollection : function () {
        return _users;
    },

    emitEvent : function (event) {
        this.emit(event);
    },

    addUserConfirmedListener : function (callback) {
        this.on(USER_CONFIRMED_EVENT, callback);
    },

    addUserDisallowedListener : function (callback) {
        this.on(USER_NOT_ALLOWED_EVENT, callback);
    },

    removeUserConfirmedListener : function (callback) {
        this.removeListener(USER_CONFIRMED_EVENT, callback);
    },

    addUsersLoadedListener : function (callback) {
        this.on(USERS_LOADED_EVENT, callback);
    }
});

AppDispatcher.register(function (action) {
    switch (action.actionType) {
        case ApiConstants.API_USERS_GET_COLLECTION:
            switch (action.response) {
                case ApiConstants.API_TIMEOUT:
                case ApiConstants.API_ERROR:
                case ApiConstants.API_USERS_GET_COLLECTION_PENDING:
                    break;

                default:
                    _users = action.response;
                    UsersStore.emitEvent(USERS_LOADED_EVENT);
            }

            break;

        case ApiConstants.API_USERS_GET_RESOURCE:
            switch (action.response) {
                case ApiConstants.API_TIMEOUT:
                case ApiConstants.API_USERS_GET_RESOURCE_PENDING:
                    break;

                case ApiConstants.API_ERROR:
                    UsersStore.emitEvent(USER_NOT_ALLOWED_EVENT);
                    break;

                default:
                    _current_user = action.response;
                    UsersStore.emitEvent(USER_CONFIRMED_EVENT);
            }

            break;
    }

    return true;
});

module.exports = UsersStore;