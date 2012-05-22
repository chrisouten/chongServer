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
        this.id = id;
		
        client.get("board" +id, function (err, obj) {
            if (obj !== null) {
                self.load(obj);
            } else {
                self.createNewBoard(player, id);
            }
        });
    },
    
    createNewBoard : function(playerId, id) {
		this.owner = playerId;
        this.player1 = null;
        this.player2 = null;
        
        this.player1Blocks = 6;
        this.player2Blocks = 7;
        
        this.winner = null;
        
        this.board = [];
		this.validMoves = [];
        this.currentTurn = 0;
        
        this.createBoard();
		this.setValidMoves()
        
        
        
    },
    
    createBoard : function() {
		var self = this;
        for (var i=0; i < 8; i++) {
            this.board[i] = [];
            for (var j=0; j < 8; j++) {
            	this.board[i][j] = BoardTypes.EMPTY;
            }
        }
		this.board[7][4] = BoardTypes.PLAYER1PAWN;
		this.board[0][3] = BoardTypes.PLAYER2PAWN;
    },
    
    save : function() {
        var save_data = {
			'board': this.board,
			'currentTurn': this.currentTurn,
			'player1Blocks': this.player1Blocks,
			'player2Blocks': this.player2Blocks,
			'owner' : this.owner,
			'player1' : this.player1,
			'player2' : this.player2,
			'validMoves': this.validMoves
		}
		client.set('board' + this.id, JSON.stringify(save_data));
        
    },
    
    load : function(savedBoard) {
        var board_data = JSON.parse(savedBoard);
		this.board = board_data.board;
		this.validMoves = board_data.validMoves;
		this.currentTurn = board_data.currentTurn;
		this.player1Blocks = board_data.player1Blocks;
		this.player2Blocks = board_data.player2Blocks;
		this.owner = board_data.owner;
		this.player1 = board_data.player1;
		this.player2 = board_data.player2;
    },
	
	getPlayerPosition : function(playerIndex) {
		var	returnVal = [],
			boardType = playerIndex == 0 ? BoardTypes.PLAYER1PAWN : BoardTypes.PLAYER2PAWN;
		_.find(this.board, function(row, rIndex) {
            return _.find(row, function(col, cIndex) {
                if (col == boardType) {
                     returnVal = [rIndex, cIndex]
                     return true;
                }
            });
        });            
               
		return returnVal;
	},
	
	setValidMoves : function() {
		var self = this,
			pawnPosition = this.getPlayerPosition(this.currentTurn),
			blockType = BoardTypes.PLAYER1BLOCK;
		if (this.currentTurn == 1) {
			blockType = BoardTypes.PLAYER2BLOCK;
		}
		var check_positions = [
			[1,0],[0,1],[-1,0],[0,-1]],
		jump_positions = [
			[1,0],[0,1],[-1,0],[0,-1],
			[1,1],[-1,1],[-1,-1],[1,-1]
		];
		_.each(check_positions, function (cp) {
			var x = pawnPosition[0] + cp[0];
			var y = pawnPosition[1] + cp[1];
			if (x > -1 && x < 8 && y > -1 && y < 8 && board[x][y] == BoardTypes.EMPTY)
				self.validMoves.push(cp);
		});
		_.each(jump_positions, function(jp) {
			var x = pawnPosition[0] + jp[0];
			var y = pawnPosition[1] + jp[1];
			var x2 = x + jp[0];
			var y2 = y + jp[1];
			if (x > -1 && x < 8 && y > -1 && y < 8 &&
				x2 > -1 && x2 < 8 && y2 > -1 && y2 < 8 &&
				board[x][y] == blockType &&
				board[x2][y2] == BoardTypes.EMPTY)
					self.validMoves.push(cp);
		});
	},
	
	makeMove : function(moveData) {
		var valid = true;
		// If the space isn't empty just return false
		if (this.board[moveData.x][moveData.y] != BoardTypes.EMPTY)
			return false;
		// Lets check to see if it is in our valid moves space if its a player move
		// or a block move that isn't on the home rows and they have enough
		if (moveData.moveType == BoardTypes.PLAYER1PAWN || moveData.moveType == BoardTypes.PLAYER2PAWN) {
			valid = _.any(this.validMoves, function(vm) {
			            return block[0] == x && block[1] == y;         
			        });
		} else {
			valid = (((moveData.moveType == BoardTypes.PLAYER1BLOCK  && this.player1Blocks > 0 )||
					  (moveData.moveType == BoardTypes.PLAYER2BLOCK && this.player2Blocks > 0))
					 && moveData.x != 8 && moveData.x != 0)
					 
		}
		// So its either a valid player move or a block placement so we submit it
		if (valid) {
			this.board[moveData.x][moveData.y] = moveData.moveType;
			if (moveData.moveType == BoardTypes.PLAYER1BLOCK)
				this.player1Blocks -= 1;
			if (moveData.moveType == BoardTypes.PLAYER2BLOCK)
				this.player2Blocks -= 1;
		}
		this.currentTurn = this.currentTurn == 1 ? 0 : 1;
		this.setValidMoves();
		return valid;
		}
	},
	
	checkWin = function () {
	    if (this.getPlayerPosition(0)[0] == 0)
	        return 1;
	    if (this.getPlayerPosition(1)[0] == 7)
	        return 2;
	    return null;
	}
});