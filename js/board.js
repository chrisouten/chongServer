var cls = require("./lib/class"),
    _ = require("underscore"),
    MessageTypes = require("./messagetypes"),
    BoardTypes = require("./boardtypes"),
    redis = require("redis"),
    client = redis.createClient();

client.select(1);

module.exports = Board = cls.Class.extend({
    init: function(player, id) {
        var self = this;
        
        client.get("board" +id, function (err, obj) {
            if (obj !== null) {
                self.load(obj);
            } else {
                self.createNewBoard(player, id);
            }
        });
    },
    
    createNewBoard : function(player, id) {
        this.players = [player];
        this.player1 = null;
        this.player2 = null;
        
        this.player1Blocks = 6;
        this.player2Blocks = 7;
        
        this.winner = null;
        
        this.player1Pawn = [7,4];
        this.player2Pawn = [0,3];
        
        this.board = [];
        this.currentTurn = 0;
        this.id = id;
        
        createBoard();
        
        
        
    },
    
    createBoard : function() {
        for (var i=0; i < 8; i++) {
            this.board[i] = [];
            for (var j=0; j < 8; j++) {
            	this.board[i][j] = BoardTypes.EMPTY;
            	if (i == this.player1Pawn[0] && j == this.player1Pawn[1])
            		this.board[i][j] = BoardTypes.PLAYER1PAWN;
            	if (i == this.player2Pawn[0] && j == this.player2Pawn[1])
            		this.board[i][j] = BoardTypes.PLAYER2PAWN;
            }
        }
    },
    
    save : function() {
        
        
    },
    
    load : function(savedBoard) {
        var board_data = JSON.parse(savedBoard);
    }
});