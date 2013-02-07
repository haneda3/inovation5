var g_width = 320;
var g_height = 240;
var CHAR_SIZE = 16;

function TitleMain(game) {
    GameState.call(this, game);
}

TitleMain.prototype = new GameState;

TitleMain.prototype.timer = 0;
TitleMain.prototype.offset_x = 0;
TitleMain.prototype.offset_y = 0;
TitleMain.prototype.lunker_mode = GAMEMODE.NORMAL;
TitleMain.prototype.lunker_command = 0;

TitleMain.prototype.update = function () {
    this.timer++;
    if (this.timer % 5 == 0) {
        this.offset_x = (Math.random() * 3000 / 11) % 5 - 3;
        this.offset_y = (Math.random() * 3000 / 11) % 5 - 3;
    }

    var key = this.game.key;
    if (key.isPushAction() && this.timer > 5) {
        this.setMsg(GAMESTATE.MSG_REQ_OPENING);

        if (this.lunker_mode) {
            this.game.playerData.initialize(GAMEMODE.LUNKER);
        } else {
            this.game.playerData.initialize(GAMEMODE.NORMAL);
        }
    }

    // ランカー・モード・コマンド
    switch (~~this.lunker_command) {
        case 0:
        case 1:
        case 2:
        case 6:
            if (key.isPushLeft()) {
                this.lunker_command++;
            } else if (key.isPushRight() || key.isPushUp() || key.isPushDown()) {
                this.lunker_command = 0;
            }
            break;
        case 3:
        case 4:
        case 5:
        case 7:
            if (key.isPushRight()) {
                this.lunker_command++;
            } else if (key.isPushLeft() || key.isPushUp() || key.isPushDown()) {
                this.lunker_command = 0;
            }
            break;
        default:
            break;
    }
    if (this.lunker_command > 7) {
        this.lunker_command = 0;
        this.lunker_mode = !this.lunker_mode;
    }
}

TitleMain.prototype.draw = function () {
    if(this.lunker_mode) {
		this.game.draw("bg", 0, 0, 0, 240, 320, 240);
		this.game.draw("msg", (g_width - 256) / 2 + this.offset_x, 160 + this.offset_y + (g_height - 240) / 2, 0, 64, 256, 16);
	}else{
		this.game.draw("bg", 0, 0, 0, 0, 320, 240);
		this.game.draw("msg", (g_width - 256) / 2 + this.offset_x, 160 + this.offset_y + (g_height - 240) / 2, 0, 64+16, 256, 16);
    }

    this.game.draw("msg", (g_width - 256) / 2, 32 + (g_height - 240) / 2, 0, 0, 256, 64);
}

function OpeningMain(game) {
    GameState.call(this, game);

    this.game.bgm.play("bgm1");
}

OpeningMain.prototype = new GameState;
OpeningMain.prototype.timer = 0;
OpeningMain.prototype.SCROLL_LEN = 416;
OpeningMain.prototype.SCROLL_SPEED = 3;

OpeningMain.prototype.update = function () {
    this.timer++;

    if (this.game.key.isPressAction()) this.timer += 20;
    if (this.timer / this.SCROLL_SPEED > this.SCROLL_LEN + g_height) {
        this.setMsg(GAMESTATE.MSG_REQ_GAME);
        this.game.bgm.stop();
    }
}

OpeningMain.prototype.draw = function () {
	this.game.draw("bg", 0, 0, 0, 480, 320, 240);
	
    this.game.draw("msg", (g_width - 256) / 2, g_height - (this.timer / this.SCROLL_SPEED), 0, 160, 256, this.SCROLL_LEN);
}

ENDINGMAIN_STATE = {
    STAFFROLL: 0,
    RESULT: 1
}

function EndingMain(game) {
    GameState.call(this, game);

    this.game.bgm.play("bgm1");
}

EndingMain.prototype = new GameState;
EndingMain.prototype.timer = 0;
EndingMain.prototype.state = ENDINGMAIN_STATE.STAFFROLL;
EndingMain.prototype.SCROLL_LEN = 1088;
EndingMain.prototype.SCROLL_SPEED = 3;

EndingMain.prototype.update = function () {
    this.timer++;
    switch (this.state) {
        case ENDINGMAIN_STATE.STAFFROLL:
            if (this.game.key.isPressAction()) {
                this.timer += 20;
            }
            if (this.timer / this.SCROLL_SPEED > this.SCROLL_LEN + g_height) {
                this.timer = 0;
                this.state = ENDINGMAIN_STATE.RESULT;

                this.game.bgm.stopWithFade(5000);
            }
            break;
        case ENDINGMAIN_STATE.RESULT:
            if (this.game.key.isPushAction() && this.timer > 5) {
                // 条件を満たしていると隠し画面へ
                if (this.game.playerData.isGetOmega()) {
                    if (this.game.playerData.lunker_mode) {
                        this.setMsg(GAMESTATE.MSG_REQ_SECRET2);
                    } else {
                        this.setMsg(GAMESTATE.MSG_REQ_SECRET1);
                    }
                } else {
                    this.setMsg(GAMESTATE.MSG_REQ_TITLE);
                }
            }
            break;
        default:
            break;
    }
}

EndingMain.prototype.draw = function () {
	this.game.draw("bg", 0, 0, 0, 480, 320, 240);

    switch (this.state) {
        case ENDINGMAIN_STATE.STAFFROLL:
            this.game.draw("msg", (g_width - 256) / 2, g_height - (this.timer / this.SCROLL_SPEED),
                0, 576, 256, this.SCROLL_LEN);
            break;
        case ENDINGMAIN_STATE.RESULT:
            this.game.draw("msg", (g_width - 256) / 2, (g_height - 160) / 2, 0, 1664, 256, 160);

            this.game.drawFont("" + this.game.playerData.getItemCount(), (g_width - 10 * 0)/ 2,  (g_height - 160) / 2 + 13 * 5 + 2);
            this.game.drawFont("" + this.game.playerData.playtime, (g_width - 13)/ 2 ,  (g_height - 160) / 2 + 13 * 8 + 2);
            break;
        default:
            break;
    }
}

function SecretMain(game, number) {
    GameState.call(this, game);

    this.game.bgm.play("bgm1");
    this.number = number;
}

SecretMain.prototype = new GameState;
SecretMain.prototype.timer = 0;

SecretMain.prototype.update = function () {
    this.timer++;
    if(this.game.key.isPushAction() && this.timer > 5) this.setMsg(GAMESTATE.MSG_REQ_TITLE);
}

SecretMain.prototype.draw = function () {
	this.game.draw("bg", 0, 0, 0, 240, 320, 240);

    if(this.number == 1){
        this.game.draw("msg" , (g_width - 256) / 2 , (g_height - 96) / 2 ,
            0 , 2048 - 96 * 2 , 256 , 96);
    }else{
        this.game.draw("msg" , (g_width - 256) / 2 , (g_height - 96) / 2 ,
            0 , 2048 - 96 , 256 , 96);
    }
}

function GameMain(game) {
    GameState.call(this, game);

    var f = new Field(this.game.playerData);
    f.loadFieldData(field_data);
    this.game.field = f;
    this.game.player.initialize();
}

GameMain.prototype = new GameState;

GameMain.prototype.update = function () {
    this.game.field.move();
    this.game.player.move();
}

GameMain.prototype.draw = function () {
    if(this.game.playerData.lunker_mode) {
		this.game.draw("bg", 0, 0, 0, 240, 320, 240);
	}else{
		this.game.draw("bg", 0, 0, 0, 0, 320, 240);
    }
	
    this.game.field.draw(this.game, this.game.player.view.getPosition());
    this.game.player.draw(this.game);
}

function Game() {
    this.initialize.apply(this, arguments);
}

Game.prototype = {
    gameState: null,
    self: null,
    field: null,
    player: null,
    playerData: null,
    key: null,
    initialize: function () {
        this.playerData = new PlayerData(GAMEMODE.NORMAL);

    },
    start: function () {
        var self = this;
        this.self = self;

        this.player = new Player(this);

        this._intervalId = setInterval(function () {
            self.loop();
        }, 1000 / self.fps);
    },
    loop: function () {
        if (this.gameState == null) {
            this.gameState = new TitleMain(this.self);
        } else {
            switch (this.gameState.getMsg()) {
                case GAMESTATE.MSG_REQ_TITLE:
                    this.gameState = new TitleMain(this);
                    break;
                case GAMESTATE.MSG_REQ_OPENING:
                    this.gameState = new OpeningMain(this);
                    break;
                case GAMESTATE.MSG_REQ_GAME:
                    this.gameState = new GameMain(this);
                    break;
                case GAMESTATE.MSG_REQ_ENDING:
                    this.gameState = new EndingMain(this);
                    break;
                case GAMESTATE.MSG_REQ_SECRET1:
                    this.gameState = new SecretMain(this, 1);
                    break;
                case GAMESTATE.MSG_REQ_SECRET2:
                    this.gameState = new SecretMain(this, 2);
                    break;
            }
        }
        this.gameState.update();
        this.gameState.draw();
        this.key.update();
    },
    fillRect: function (x, y, w, h, r, g, b) {
        this.context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        this.context.fillRect(x, y, w, h);
    },
    draw: function (key, px, py, sx, sy, sw, sh) {
        this.context.drawImage(this.img[key], ~~sx, ~~sy, sw, sh, ~~px, ~~py, sw, sh);
    },
    drawFont: function (msg, x, y) {
        var len = msg.length;
        for (var n = 0 ; n < len ; n ++) {
            var c = msg.charCodeAt(n);

            var idx = ~~c;
            if(idx == 32)
            {
                x += 9; // スペース
                continue;
            }
            var img = this.font.fonts[idx];

            if (typeof img != "undefined") {
                this.context.drawImage(img, x, y);
                x += this.font.fonts[idx].width;
            } else {
                x += 9;
            }
        }
    }
}

function init(gameMode, inputField) {
    var canvas = document.getElementById('canvas');
    if (!canvas || !canvas.getContext) {
        return false;
    }

    if (typeof(inputField) === 'undefined') {
        inputField = window;
    }

    var se = new SoundEffect();
    se.load("heal", "resource/sound/heal.wav");
    se.load("itemget", "resource/sound/itemget.wav");
    se.load("itemget2", "resource/sound/itemget2.wav");
    se.load("damage", "resource/sound/damage.wav");
    se.load("jump", "resource/sound/jump.wav");

    var bgm = new BGM();
    bgm.load("bgm0", "resource/sound/ino1.ogg");
    bgm.load("bgm1", "resource/sound/ino2.ogg");

    var game = new Game();
    game.fps = 50;
    game.context = canvas.getContext('2d');
//    alert('cx');

    game.key = new InputDevice(inputField);
    game.se = se;
    game.bgm = bgm;

    game.img = {};

    imgDir = "color";
    if (gameMode == "mono") {
        imgDir = "mono";
    }
    imgDir = "resource/image/" + imgDir;

    async.waterfall([
        function (callback) {
            var img = new Image();
            img.src =  imgDir + "/ino.png";
            img.onload = function () {
                game.img['ino'] = img;
                callback();
            }
        },
        function (callback) {
            var img = new Image();
            img.src = imgDir + "/msg.png";
            img.onload = function () {
                game.img['msg'] = img;
                callback();
            }
        },
        function (callback) {
            var img = new Image();
            img.src = imgDir + "/bg.png";
            img.onload = function () {
                game.img['bg'] = img;
                callback();
            }
        },
        function (callback) {
            var font = new Font();
            font.load("resource/font");
            game.font = font;
            callback();
        },
        function () {
            game.start();
        }
    ], function(err, result) {

    });
}
