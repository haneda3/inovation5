
var g_width = 320;
var g_height = 240;
var CHAR_SIZE = 16;

function TitleMain(game) {
//    this.initialize.apply(this, arguments);
    GameState.call(this, game);
}

TitleMain.prototype = new GameState;

TitleMain.prototype.timer = 0;
TitleMain.prototype.offset_x = 0;
TitleMain.prototype.offset_y = 0;
TitleMain.prototype.lunker_mode = GAMEMODE.NORMAL;
TitleMain.prototype.lunker_command = 0;

TitleMain.prototype.update = function () {
    this.timer ++;
    if(this.timer % 5 == 0){
        this.offset_x = (Math.random() * 3000 / 11) % 5 - 3;
        this.offset_y = (Math.random() * 3000 / 11) % 5 - 3;
    }

    var key = this.game.key;
    if(key.isPushAction() && this.timer > 5){
        this.setMsg(GAMESTATE.MSG_REQ_OPENING);

        if (this.lunker_mode) {
            this.game.playerData.initialize(GAMEMODE.LUNKER);
        }else{
            this.game.playerData.initialize(GAMEMODE.NORMAL);
        }
    }

    // ランカー・モード・コマンド
    switch(~~this.lunker_command){
        case 0:
        case 1:
        case 2:
        case 6:
            if(key.isPushLeft()){
                this.lunker_command++;
            }else if(key.isPushRight() || key.isPushUp() || key.isPushDown()){
                this.lunker_command = 0;
            }
            break;
        case 3:
        case 4:
        case 5:
        case 7:
            if(key.isPushRight()){
                this.lunker_command++;
            }else if(key.isPushLeft() || key.isPushUp() || key.isPushDown()){
                this.lunker_command = 0;
            }
            break;
        default:
            break;
    }
    if(this.lunker_command > 7){
        this.lunker_command = 0;
        this.lunker_mode = !this.lunker_mode;
    }}

TitleMain.prototype.draw = function() {
    if(this.lunker_mode) {
		this.game.draw("bg", 0, 0, 0, 240, 320, 240);
		this.game.draw("msg", (g_width - 256) / 2 + this.offset_x  , 160 + this.offset_y + (g_height-240)/2 , 0 , 64 , 256 , 16);
	}else{
		this.game.draw("bg", 0, 0, 0, 0, 320, 240);
		this.game.draw("msg", (g_width - 256) / 2 + this.offset_x  , 160 + this.offset_y + (g_height-240)/2 , 0 , 64 + 16 , 256 , 16);
    }

    this.game.draw("msg", (g_width - 256) / 2 ,  32 + (g_height-240)/2 , 0 , 0 , 256 , 64);
}

function OpeningMain(game) {
//    this.initialize.apply(this, arguments);
    GameState.call(this, game);

    this.game.bgm.play("bgm1");
}

OpeningMain.prototype = new GameState;
OpeningMain.prototype.timer = 0;
OpeningMain.prototype.SCROLL_LEN = 416;
OpeningMain.prototype.SCROLL_SPEED = 3;

OpeningMain.prototype.update = function () {
    this.timer ++;

    if( this.game.key.isPressAction() ) this.timer+=20;
    if( this.timer / this.SCROLL_SPEED > this.SCROLL_LEN + g_height){
        this.setMsg(GAMESTATE.MSG_REQ_GAME);
        this.game.bgm.stop();
    }
}

OpeningMain.prototype.draw = function () {
	this.game.draw("bg", 0, 0, 0, 480, 320, 240);

    this.game.draw("msg" , (g_width - 256) / 2 , g_height - (this.timer / this.SCROLL_SPEED) ,0 , 160, 256 , this.SCROLL_LEN);
}

function GameMain(game) {
//    this.initialize.apply(this, arguments);
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
    initialize: function() {
        this.playerData = new PlayerData(GAMEMODE.NORMAL);

    },
    start: function() {
        var self = this;
        this.self = self;

        this.player = new Player(this);

        this._intervalId = setInterval(function() {self.loop();}, 1000 / self.fps);
    },
    loop: function() {
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
            }
        }
        this.gameState.update();
        this.gameState.draw();
        this.key.update();
    },
    fillRect: function(x, y, w, h, r, g, b) {
        this.context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        this.context.fillRect(x, y, w, h);
    },
    draw: function(key, px, py, sx, sy, sw, sh) {
        this.context.drawImage(this.img[key], sx, sy, sw, sh, px, py, sw, sh);
    }
}

function init() {
    var canvas = document.getElementById('canvas');
    if (!canvas || !canvas.getContext) {
        return false;
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

    game.key = new InputDevice();
    game.se = se;
    game.bgm = bgm;

    game.img = {};
    var img = new Image();
    img.src = "resource/image/ino.png";
    img.onload = function() {
        game.img['ino'] = img;
        var ximg = new Image();
        ximg.src = "resource/image/msg.png";
        ximg.onload = function() {
            game.img['msg'] = ximg;
			var bgimg = new Image();
			bgimg.src = "resource/image/bg.png";
			bgimg.onload = function() {
				game.img['bg'] = bgimg;
				game.start();
			}
        }
    }
}
