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
    this.initialize.apply(this, arguments);
}

GameState.prototype = {
    msg: 0,
    game: null,
    initialize: function(game) {
        var self = this;
        this.game = game;
        msg = GAMESTATE.MSG_NONE;
    },
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

