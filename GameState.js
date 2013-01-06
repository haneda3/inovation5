GAMESTATE = {
    MSG_NONE: 0,
    MSG_REQ_TITLE: 1,
    MSG_REQ_GAME: 2,
    MSG_REQ_OPENING: 3,
    MSG_REQ_ENDING: 4,
    MSG_REQ_SECRET1: 5,
    MSG_REQ_SECRET2: 6
};

function GameState(game) {
//    var self = this;
    this.game = game;
    this.msg = GAMESTATE.MSG_NONE;
}

GameState.prototype = {
    msg: 0,
    game: null,
    getMsg: function() {
        return this.msg;
    },
    setMsg: function(m) {
        this.msg = m;
    },
    draw: function() {
        console.log("GameState draw");
    },
    update: function() {
        console.log("GameState update");
    }
}

