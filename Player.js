PLAYERSTATE = {
    START: 0,
    NORMAL: 1,
    ITEMGET: 2,
    MUTEKI: 3,
    DEAD: 4
}

function View() {
    this.initialize.apply(this, arguments);
}

View.prototype = {
    position: null,
    initialize: function() {
        this.position = {x: 0, y:0};
    },
    toScreenPosition: function(v) {
        var x = v.x - this.position.x + g_width / 2;
        var y = v.y - this.position.y + g_height / 2;
        return {x: x, y: y};
    },
    getPosition: function() {
        return {x: this.position.x, y: this.position.y};
    },
    setPosition: function(v) {
        this.position.x = v.x;
        this.position.y = v.y;
    }
}

function Player() {
    this.initialize.apply(this, arguments);
}

var PLAYER_SPEED = 2.0;
var PLAYER_GRD_ACCRATIO = 0.04;
var PLAYER_AIR_ACCRATIO = 0.01;
var PLAYER_JUMP = -4.0;
var PLAYER_GRAVITY = 0.2;
var PLAYER_FALL_SPEEDMAX = 4.0;
var VIEW_DIRECTION_OFFSET = 30.0;
var WAIT_TIMER_INTERVAL = 10;
var LIFE_RATIO = 400;
var MUTEKI_INTERVAL = 50;
var START_WAIT_INTERVAL = 50;

var LUNKER_JUMP_DAMAGE1 = 40.0;
var LUNKER_JUMP_DAMAGE2 = 96.0;

Player.prototype = {
    life: 0,
    jump_cnt: 0,
    timer: 0,
    position: null,
    speed: null,
    direction: 0,
    jumped_point: null,
    field: null,
    state: 0,
    item_get: 0,
    wait_timer: 0,
    view: null,
    initialize: function(field) {
        //gamemain = gm;
        this.timer = 0;
        this.wait_timer = 0;

        this.jump_cnt = 0;
        this.speed = {x: 0.0, y: 0.0};
        this.direction = 0;

        //playerdata = gamemain.playerdata;
        this.life = 100;//playerdata.life_max * LIFE_RATIO;
        //field = gamemain.field;
        var startPoint = field.getStartPoint();
        this.position = startPoint;
        this.jumped_point = {x: startPoint.x, y:startPoint.y};

        this.field = field;
        this.view = new View();
        this.view.setPosition(this.position);
//        gamemain.view.setPosition(position);

//        Hell_playBgm("./resource/sound/ino1.ogg");
    },

    onWall: function(){			// 壁に乗っているか
        if(this.toFieldOfsY() > CHAR_SIZE / 4) return false;
        if(this.field.isRidable(this.toFieldX()	,this.toFieldY() + 1 ) && this.toFieldOfsX() < CHAR_SIZE * 7 / 8)	return true;
        if(this.field.isRidable(this.toFieldX() + 1	,this.toFieldY() + 1 ) && this.toFieldOfsX() > CHAR_SIZE / 8)	return true;
        return false;
    },
    isFallable: function() {		// 落ちれるか
        if(!this.onWall()) return false;
        if(this.field.isWall(this.toFieldX()	,this.toFieldY() + 1 ) && this.toFieldOfsX() < CHAR_SIZE * 7 / 8)	return false;
        if(this.field.isWall(this.toFieldX() + 1	,this.toFieldY() + 1 ) && this.toFieldOfsX() > CHAR_SIZE / 8)	return false;
        return true;
    },
    isUpperWallBoth: function() {		// 頭上確認(２マスとも壁)
        if(this.toFieldOfsY() < CHAR_SIZE / 2) return false;
        if(this.field.isWall( this.toFieldX()	,this.toFieldY() 	) && this.field.isWall( this.toFieldX() + 1	,this.toFieldY()	))	return true;
        return false;
    },
    isUpperWall: function() {		// 頭上確認
        if(this.toFieldOfsY() < CHAR_SIZE / 2) return false;
        if(this.field.isWall( this.toFieldX()	,this.toFieldY() 	) && this.toFieldOfsX() < CHAR_SIZE * 7 / 8)	return true;
        if(this.field.isWall( this.toFieldX() + 1	,this.toFieldY()	) && this.toFieldOfsX() > CHAR_SIZE / 8)	return true;
        return false;
    },
    isLeftWall: function() {		// 左壁確認
        if(this.field.isWall(this.toFieldX(),this.toFieldY() 	))	return true;
        if(this.field.isWall(this.toFieldX(),this.toFieldY() + 1	) && this.toFieldOfsY() > CHAR_SIZE / 8)	return true;
        return false;
    },
    isRightWall: function() {		// 右壁確認
        if(this.field.isWall( this.toFieldX() + 1	,this.toFieldY() 	))	return true;
        if(this.field.isWall( this.toFieldX() + 1	,this.toFieldY() + 1	) && this.toFieldOfsY() > CHAR_SIZE / 8)	return true;
        return false;
    },
    normalizeToRight: function() {	// 右壁にあたって停止
        this.position.x = this.toFieldX() * CHAR_SIZE;
        this.speed.x = 0;
    },
    normalizeToLeft: function() { // 左壁にあたって停止
        this.position.x = (this.toFieldX() + 1) * CHAR_SIZE;
        this.speed.x = 0;
    },
    normalizeToUpper: function() {	// 上壁にあたって停止
        if(this.speed.y < 0) this.speed.y = 0;
        this.position.y = CHAR_SIZE * (this.toFieldY() + 1);
    },

    // フィールドマップ座標系へ変換
    toFieldX: function() {
        return ~~(this.position.x / CHAR_SIZE);
    },
    toFieldY: function() {
        return ~~(this.position.y / CHAR_SIZE);
    },
    // フィールドマップ座標系変換の余り
    toFieldOfsX: function() {
        return ~~this.position.x % CHAR_SIZE;
    },
    toFieldOfsY: function() {
        return ~~this.position.y % CHAR_SIZE;
    },

    move: function() {
        
    },
    draw: function(game) {
        var v = this.view.toScreenPosition(this.position);
        if (this.state == PLAYERSTATE.DEAD){					// 死亡
            var anime = ((this.timer / 6) % 4);
            //if(playerdata.lunker_mode){
            //    Hell_draw("ino" , cast(int)v.x , cast(int)v.y , CHAR_SIZE * (2 + anime) , 128 + CHAR_SIZE * 2 , CHAR_SIZE,CHAR_SIZE);
            //}else{
                game.draw("ino" , v.x , v.y , CHAR_SIZE * (2 + anime) , 128 , CHAR_SIZE, CHAR_SIZE);
            //}
        } else {								// 生存
            if(this.state != PLAYERSTATE.MUTEKI || this.timer % 10 < 5){
                var anime = ((this.timer / 6) % 2);
                if(!this.onWall()) anime = 0;
                if(this.direction < 0){
                    //if(playerdata.lunker_mode){
                    //    Hell_draw("ino" , cast(int)v.x , cast(int)v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE * 2 , CHAR_SIZE,CHAR_SIZE);
                    //}else{
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 , CHAR_SIZE,CHAR_SIZE);
                    //}
                }else{
                    //if(playerdata.lunker_mode){
                    //    Hell_draw("ino" , cast(int)v.x , cast(int)v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE * 3 , CHAR_SIZE,CHAR_SIZE);
                    //}else{
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE , CHAR_SIZE,CHAR_SIZE);
                    //}
                }
            }
        }
    }
}
