KEY_CODE = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 32,
    SPACE: 13
};

INPUT_BIT = {
    LEFT: 0x01,
    RIGHT: 0x02,
    UP: 0x04,
    DOWN: 0x08,
    ENTER: 0x10,
    SPACE: 0x20
}

function InputDevice() {
    this.initialize.apply(this, arguments);
}

InputDevice.prototype = {
    keyFlags: 0x00,
    keyFlagsPrev: 0x00,
    initialize: function() {
        var self = this;
        window.addEventListener('keydown',function(evt) {self.keydown(evt); },true);
        window.addEventListener('keyup',function(evt) {self.keyup(evt); },true);
    },
    keydown: function(event) {
        var keyCode = event.keyCode;
        var bit = this.getKeyBit(keyCode);
        if (bit == null) {
            return;
        }
        this.keyFlags |= bit;
        event.preventDefault();
    },

    keyup: function(event) {
        var keyCode = event.keyCode;
        var bit = this.getKeyBit(keyCode);
        if (bit == null) {
            return;
        }
        this.keyFlags &= ~bit;
        event.preventDefault();
    },

    isPressLeft: function() {
        return this.isPressKey(KEY_CODE.LEFT);
    },
    isPushLeft: function() {
        return this.isPushKey(KEY_CODE.LEFT);
    },
    isPressRight: function() {
        return this.isPressKey(KEY_CODE.RIGHT);
    },
    isPushRight: function() {
        return this.isPushKey(KEY_CODE.RIGHT);
    },
    isPressUp: function() {
        return this.isPressKey(KEY_CODE.UP);
    },
    isPushUp: function() {
        return this.isPushKey(KEY_CODE.UP);
    },
    isPressDown: function() {
        return this.isPressKey(KEY_CODE.DOWN);
    },
    isPushDown: function() {
        return this.isPushKey(KEY_CODE.DOWN);
    },
    isPressEnter: function() {
        return this.isPressKey(KEY_CODE.ENTER);
    },
    isPushEnter: function() {
        return this.isPushKey(KEY_CODE.ENTER);
    },
    isPressSpace: function() {
        return this.isPressKey(KEY_CODE.SPACE);
    },
    isPushSpace: function() {
        return this.isPushKey(KEY_CODE.SPACE);
    },
    isPushAction: function() {
        return (this.isPushEnter() || this.isPushSpace());
    },
    isPressAction: function() {
        return (this.isPressEnter() || this.isPressSpace());
    },
    getKeyBit: function(keyCode) {
        switch (keyCode) {
            case KEY_CODE.ENTER:    return INPUT_BIT.ENTER;
            case KEY_CODE.SPACE:    return INPUT_BIT.SPACE;
            case KEY_CODE.LEFT:    return INPUT_BIT.LEFT;
            case KEY_CODE.RIGHT:    return INPUT_BIT.RIGHT;
            case KEY_CODE.UP:    return INPUT_BIT.UP;
            case KEY_CODE.DOWN:    return INPUT_BIT.DOWN;
            default:    return null;
        }
    },
    isPressKey: function(keyCode) {
        return (this.keyFlags & this.getKeyBit(keyCode));
    },
    isPressPrevKey: function(keyCode) {
        return (this.keyFlagsPrev & this.getKeyBit(keyCode));
    },
    isPushKey: function(keyCode) {
        if (this.isPressKey(keyCode) && (this.isPressPrevKey(keyCode) == false)) {
            return true;
        }
        return false;
    },
    update: function() {
        this.keyFlagsPrev = this.keyFlags;
    }
}

