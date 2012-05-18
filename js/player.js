
var cls = require("./lib/class"),
    _ = require("underscore"),
    MessageTypes = require("./messagetypes"),
    redis = require("redis"),
    client = redis.createClient();

module.exports = Player = cls.Class.extend({
    init: function(connection) {
        var self = this;
        
        this.connection = connection;
        this.server = connection._server;
        this.loggedIn = false;
        this.username = null;
        console.log(this.connection.id);
        
        this.connection.listen(function(message) {
            var messageType = message.type;
            // If you are not logged in I need to say hello first
            if (!self.loggedIn && messageType != MessageTypes.HELLO) {
                self.connection.close("Are you not going to say hello first?");
                return;
            }
            // Can only say hello once, we've already met you know
            if (self.loggedIn && messageType == MessageTypes.HELLO) {
                self.connection.close("We've already met once...");
                return;
            }
            
            if (messageType == MessageTypes.HELLO) {
                var username = message.username;
                var apiToken = message.apiToken;
                client.hget([username, "apiToken"], function (err, object) {
                    if (err) {
                        //TODO:  REDIS POOPED
                    }
                    if (object == apiToken) {
                        self.loggedIn = true;
                        self.username = username;
                        self.server.addPlayer(self);
                        self.sendWelcome(username);
                        self.sendPlayerList();
                    } else {
                        self.sendUserNotFound();
                    }
                    
                });
            }
            if (messageType == MessageTypes.WHO) {
                self.sendPlayerList();
            }
        });
    },
    _sendMessage : function(msg) {
        this.connection.send(msg);
    },
    
    _broadCast : function(msg) {
        this.connection._server.broadcast(msg);  
    },
    
    sendWelcome : function(name) {
        var msg = {};
        msg.type = MessageTypes.WELCOME;
        msg.name = name;
        this._sendMessage(msg);
    },
    
    sendPlayerList : function() {
        var msg = {};
        msg.type = MessageTypes.WHO;
        msg.players = this.server.getPlayerList(this);
        this._sendMessage(msg);
    },
    
    sendUserNotFound : function() {
        var msg = {};
        msg.type = MessageTypes.ERROR;
        msg.message = "Sorry, invalid login credintials, please login again";
        this._sendMessage(msg);
    }
});