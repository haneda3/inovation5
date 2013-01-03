KEY_CODE = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
};

INPUT_BIT = {
    LEFT: 0x01,
    RIGHT: 0x02,
    UP: 0x04,
    DOWN: 0x08
}

function Key() {
    this.initialize.apply(this, arguments);
}

Key.prototype = {
    keyFlags: 0x00,
    initialize: function() {
        var self = this;
        window.addEventListener('keydown',function(evt) {self.keydown(evt); },true);
        window.addEventListener('keyup',function(evt) {self.keyup(evt); },true);
    },
    keydown: function(event) {
        var code = event.keyCode;

        switch (code) {
            case KEY_CODE.LEFT:
                this.keyFlags |= INPUT_BIT.LEFT;
                event.preventDefault();
                break;
            case KEY_CODE.RIGHT:
                this.keyFlags |= INPUT_BIT.RIGHT;
                event.preventDefault();
                break;
            case KEY_CODE.UP:
                this.keyFlags |= INPUT_BIT.UP;
                event.preventDefault();
                break;
            case KEY_CODE.DOWN:
                this.keyFlags |= INPUT_BIT.DOWN;
                event.preventDefault();
                break;
        }
    },

    keyup: function(event) {
        switch (event.keyCode) {
            case KEY_CODE.LEFT:
                this.keyFlags &= ~INPUT_BIT.LEFT;
                event.preventDefault();
                break;
            case KEY_CODE.RIGHT:
                this.keyFlags &= ~INPUT_BIT.RIGHT;
                event.preventDefault();
                break;
            case KEY_CODE.UP:
                this.keyFlags &= ~INPUT_BIT.UP;
                event.preventDefault();
                break;
            case KEY_CODE.DOWN:
                this.keyFlags &= ~INPUT_BIT.DOWN;
                event.preventDefault();
                break;
        }
    },

    isLeft: function() {
        return (this.keyFlags & INPUT_BIT.LEFT);
    },
    isRight: function() {
        return (this.keyFlags & INPUT_BIT.RIGHT);
    },
    isUp: function() {
        return (this.keyFlags & INPUT_BIT.UP);
    },
    isDown: function() {
        return (this.keyFlags & INPUT_BIT.DOWN);
    }
}

