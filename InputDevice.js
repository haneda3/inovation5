KEY_CODE = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 32,
    SPACE: 13
}

KEY_CODE_UP_ICADE = {
    RIGHT: 67, //'c',
    LEFT: 81, // 'q',
    UP: 69, // 'e',
    DOWN: 90,// 'z',
    ENTER: 70, // 'f',
    SPACE: 86 // 'v'
}

KEY_CODE_DOWN_ICADE = {
    LEFT: 65, //'a',
    RIGHT: 68, //'d',
    UP: 87, //'w',
    DOWN: 88, //'x',
    ENTER: 85, //'u',
    SPACE: 76 //'l'
}

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

function myTouchEvent(evt) {
    var touches = evt.changedTouches;
    console.log("Atouchstart: " + touches.length);
    for (var i = 0; i < touches.length; i++) {
        var touch = touches[i];
        console.log(touch.identifier + " x:" + touch.pageX + " y:" + touch.pageY);

        var x = touch.pageX - evt.target.getBoundingClientRect().left;
        var y = touch.pageY - evt.target.getBoundingClientRect().top;
        if (x < 40) {
            self.touchArrow = INPUT_BIT.LEFT;
        } else {
            self.touchArrow = INPUT_BIT.RIGHT;
        }
        self.keyFlags |= self.touchArrow;
    }

    evt.preventDefault();
}

InputDevice.prototype = {
    keyFlags: 0x00,
    keyFlagsPrev: 0x00,
     touchId: null,
     touchArrow: 0x00,

    initialize: function(inputField, touchTargetArrow, touchTargetAction) {
        var self = this;
        inputField.addEventListener('keydown',function(evt) {self.keydown(evt); },true);
        inputField.addEventListener('keyup',function(evt) {self.keyup(evt); },true);

        touchTargetArrow.addEventListener("touchstart", function(evt) {self.myTouchEvent(evt); }, false);
        touchTargetArrow.addEventListener("touchmove", function(evt) {self.myTouchEventMove(evt); }, false);
        touchTargetArrow.addEventListener("touchend", function(evt) {self.myTouchEventEnd(evt); }, false);

        touchTargetAction.addEventListener("touchstart", function(evt) {self.myTouchEventAction(evt); }, false);
        touchTargetAction.addEventListener("touchend", function(evt) {self.myTouchEventActionEnd(evt); }, false);
    },

    myTouchEvent: function(evt) {
        var touches = evt.changedTouches;
        console.log("Atouchstart: " + touches.length);
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            console.log(touch.identifier + " x:" + touch.pageX + " y:" + touch.pageY);

            var x = touch.pageX - evt.target.getBoundingClientRect().left;
            var y = touch.pageY - evt.target.getBoundingClientRect().top;
            if (x < 40) {
                this.touchArrow = INPUT_BIT.LEFT;
                evt.target.className = "padArrow padArrowLeft";
            } else {
                this.touchArrow = INPUT_BIT.RIGHT;
                evt.target.className = "padArrow padArrowRight";
            }
//            this.touchArrow = nextArrow;
            this.keyFlags |= this.touchArrow;
        }

        evt.preventDefault();
    },

    myTouchEventMove: function(evt) {
        var touches = evt.changedTouches;
        console.log("Atouchmove: " + touches.length);
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            console.log(touch.identifier + " x:" + touch.pageX + " y:" + touch.pageY);

            var x = touch.pageX - evt.target.getBoundingClientRect().left;
            var y = touch.pageY - evt.target.getBoundingClientRect().top;

            var nextArrow = 0x00;
            if (x < 40) {
                nextArrow = INPUT_BIT.LEFT;
                evt.target.className = "padArrow padArrowLeft";
            } else {
                nextArrow = INPUT_BIT.RIGHT;
                evt.target.className = "padArrow padArrowRight";
            }

            if (nextArrow != self.touchArrow) {
                this.keyFlags &= ~this.touchArrow;
                this.touchArrow = nextArrow;
                this.keyFlags |= this.touchArrow;
            }
        }

        evt.preventDefault();
    },

    myTouchEventEnd: function(evt) {
        var touches = evt.changedTouches;
        console.log("Atouchend: " + touches.length);
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            console.log(touch.identifier + " x:" + touch.pageX + " y:" + touch.pageY);

            var x = touch.pageX - evt.target.getBoundingClientRect().left;
            var y = touch.pageY - evt.target.getBoundingClientRect().top;

            evt.target.className = "padArrow";

            /*
            if (x < 40) {
                self.touchArrow = INPUT_BIT.LEFT;
            } else {
                self.touchArrow = INPUT_BIT.RIGHT;
            }
            self.keyFlags |= self.touchArrow;
            */
            this.keyFlags &= ~this.touchArrow;
            this.touchArrow = 0x00;
        }

        evt.preventDefault();
    },

    myTouchEventAction: function(evt) {
        var touches = evt.changedTouches;
        console.log("touchstart: " + touches.length);
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            console.log(touch.identifier);

            evt.target.className = "padAction padActionFocus";

            // action
            this.keyFlags |= INPUT_BIT.SPACE;
        }
        evt.preventDefault();
    },
    myTouchEventActionEnd: function(evt) {
        var touches = evt.changedTouches;
        console.log("touchend: " + touches.length);
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            console.log(touch.identifier);

            evt.target.className = "padAction";

            // action
            this.keyFlags &= ~INPUT_BIT.SPACE;
        }
        evt.preventDefault();
    },
    keydown: function(event) {
        var keyCode = event.keyCode;

        // for iCade
        bit = this.getICadeKeyBitUp(keyCode);
        if (bit != null) {
            this.keyFlags &= ~bit;
            event.preventDefault();
            return;
        }

        bit = this.getICadeKeyBitDown(keyCode);
        if (bit == null) {
            bit = this.getKeyBit(keyCode);
        }

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
    getICadeKeyBitUp: function(keyCode) {
        switch (keyCode) {
            case KEY_CODE_UP_ICADE.ENTER:    return INPUT_BIT.ENTER;
            case KEY_CODE_UP_ICADE.SPACE:    return INPUT_BIT.SPACE;
            case KEY_CODE_UP_ICADE.LEFT:    return INPUT_BIT.LEFT;
            case KEY_CODE_UP_ICADE.RIGHT:    return INPUT_BIT.RIGHT;
            case KEY_CODE_UP_ICADE.UP:    return INPUT_BIT.UP;
            case KEY_CODE_UP_ICADE.DOWN:    return INPUT_BIT.DOWN;
            default:    return null;
        }
    },
    getICadeKeyBitDown: function(keyCode) {
        switch (keyCode) {
            case KEY_CODE_DOWN_ICADE.ENTER:    return INPUT_BIT.ENTER;
            case KEY_CODE_DOWN_ICADE.SPACE:    return INPUT_BIT.SPACE;
            case KEY_CODE_DOWN_ICADE.LEFT:    return INPUT_BIT.LEFT;
            case KEY_CODE_DOWN_ICADE.RIGHT:    return INPUT_BIT.RIGHT;
            case KEY_CODE_DOWN_ICADE.UP:    return INPUT_BIT.UP;
            case KEY_CODE_DOWN_ICADE.DOWN:    return INPUT_BIT.DOWN;
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

