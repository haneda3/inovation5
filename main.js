function Game() {
    this.initialize.apply(this, arguments);
}

Game.prototype = {
    px: 0,
    initialize: function() {
        this.px = 100;
    },
    run: function() {
        this.update();
        if (this.key.isRight()) {
            this.px ++;
        }
        if (this.key.isLeft()) {
            this.px --;
        }
    },
    update: function() {
        this.context.drawImage(this.img, 0, 16 * 8, 16, 16, this.px, 0, 16, 16);
    },
    start: function() {
        var self = this;
//        this._intervalId = setInterval(self.run, 1000 / this.fps);
        this._intervalId = setInterval(function() {self.run();}, 1000 / self.fps);
    }
}

function init() {
    var canvas = document.getElementById('canvas');
    if (!canvas || !canvas.getContext) {
        return false;
    }

    var game = new Game();
    game.fps = 30;
    game.context = canvas.getContext('2d');

    var key = new Key();
    game.key = key;

    var img = new Image();
    img.src = "resource/image/ino.png";
    img.onload = function () {
//                ctx.drawImage(img, 0, 0);
//                ctx.drawImage(img, 0, 16 * 8, 16, 16, 0, 0, 32, 16);
        game.img = img;
        game.start();
    }
}
