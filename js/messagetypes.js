Messages = {
    HELLO : 0,
    WELCOME : 1,
    PLAYER_JOINED : 2,
    PLAYER_LEFT : 3,
    WHO : 4,
    GAME_LIST : 5,
    CREATE_GAME : 6,
    JOIN_GAME : 7,
    BOARD_UPDATE : 8,
    SEND_MOVE : 9,
    GAME_CHAT : 10,
    LOBBY_CHAT : 11,
    INSTANT_MESSAGE : 12,
    GAME_OVER : 13,
    ERROR : 99
}

if(!(typeof exports === 'undefined')) {
    module.exports = Messages;
}