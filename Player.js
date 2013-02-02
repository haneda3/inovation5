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

function Player(game) {
    this.game = game;
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
    game: null,
    view: null,
    playerData: null,
    initialize: function() {
        this.state = PLAYERSTATE.NORMAL;
        this.timer = 0;
        this.wait_timer = 0;

        this.jump_cnt = 0;
        this.speed = {x: 0.0, y: 0.0};
        this.direction = 0;

        this.playerData = this.game.playerData;
        this.life = this.playerData.life_max * LIFE_RATIO;
        var startPoint = this.game.field.getStartPoint();
        this.position = startPoint;
        this.jumped_point = {x: startPoint.x, y:startPoint.y};

        this.field = this.game.field;
        this.view = new View();
        this.view.setPosition(this.position);
        this.game.bgm.play("bgm0");
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
        switch(this.state) {
            case PLAYERSTATE.START:			// 開始
                this.wait_timer++;
                if(this.wait_timer > START_WAIT_INTERVAL) this.state = PLAYERSTATE.NORMAL;
                break;
            case PLAYERSTATE.NORMAL:			// 通常
                this.moveByInput();
                this.moveNormal();

                // ライフ自動回復
                if(this.life < this.playerData.life_max * LIFE_RATIO){
                    var o_life = this.life;
                    this.life++;
                    if (~~(this.life / LIFE_RATIO) != ~~(o_life / LIFE_RATIO)) {
                        this.game.se.play("heal");
                    }
                }
                break;

            case PLAYERSTATE.ITEMGET:			// アイテム取ったどー!
                this.moveItemGet();

                // クリアチェック
                if (this.state != PLAYERSTATE.ITEMGET) {
                    if (this.playerData.isGameClear()) {
                        this.game.gameState.setMsg(GAMESTATE.MSG_REQ_ENDING);
                    }
                }

                break;

            case PLAYERSTATE.MUTEKI:			// 無敵時間
                this.moveByInput();
                this.moveNormal();

                this.wait_timer++;
                if(this.wait_timer > MUTEKI_INTERVAL) this.state = PLAYERSTATE.NORMAL;
                break;

            case PLAYERSTATE.DEAD:			// 死亡
                this.moveNormal();

                this.game.bgm.stop();
                if(this.game.key.isPressAction() && this.wait_timer > 15) {
                    this.game.gameState.setMsg(GAMESTATE.MSG_REQ_TITLE);
                }
                break;
            default:
                break;
        }

        if (this.life < LIFE_RATIO){			// 死亡
            if(this.state != PLAYERSTATE.DEAD) this.wait_timer = 0;
            this.state = PLAYERSTATE.DEAD;
            this.direction = 0;
            this.wait_timer++;
        }
    },

    moveNormal: function() {
        this.timer++;
        this.playerData.playtime = (this.timer / 50);

        // 移動＆落下
        this.speed.y += PLAYER_GRAVITY;
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

        if(this.speed.y > PLAYER_FALL_SPEEDMAX) this.speed.y = PLAYER_FALL_SPEEDMAX;

        if(this.state == PLAYERSTATE.NORMAL) this.checkCollision();

        // ATARI判定
        var hitLeft = false , hitRight = false , hitUpper = false;
        if(this.onWall() && this.speed.y >= 0){			// 着地判定
            if(this.playerData.lunker_mode){	// ランカー・モード
                if(this.position.y - this.jumped_point.y > LUNKER_JUMP_DAMAGE1){
                    this.state = PLAYERSTATE.MUTEKI;
                    this.wait_timer = 0;
                    this.life -= LIFE_RATIO;
                    this.game.se.play("damage");
                }
                if(this.position.y - this.jumped_point.y > LUNKER_JUMP_DAMAGE2){
                    this.state = PLAYERSTATE.MUTEKI;
                    this.wait_timer = 0;
                    this.life -= LIFE_RATIO * 99;
                    this.game.se.play("damage");
                }
            }

            if(this.game.key.isPressAction() && this.game.key.isPressDown() && this.isFallable()){
                // 落下
            }else{
                if(this.speed.y > 0) this.speed.y = 0;
                this.position.y = CHAR_SIZE * this.toFieldY();
                this.jump_cnt = 0;
            }

            this.jumped_point.x = this.position.x;
            this.jumped_point.y = this.position.y;
        }
        if(this.isLeftWall() && this.speed.x < 0) hitLeft = true;		// 左壁
        if(this.isRightWall() && this.speed.x > 0) hitRight = true;	// 右壁
        if(this.isUpperWall() && this.speed.y <= 0) hitUpper = true;	// 上壁


        if(hitUpper && !hitLeft && !hitRight)	this.normalizeToUpper();
        if(!hitUpper && hitLeft)		this.normalizeToLeft();
        if(!hitUpper && hitRight) 		this.normalizeToRight();
        if(hitUpper && hitRight){
            if(this.isUpperWallBoth()){
                this.normalizeToUpper();
            }else{
                if(this.toFieldOfsX() > this.toFieldOfsY()){
                    this.normalizeToRight();
                }else{
                    this.normalizeToUpper();
                }
            }
        }
        if(hitUpper && hitLeft){
            if(this.isUpperWallBoth()){
                this.normalizeToUpper();
            }else{
                if(CHAR_SIZE - this.toFieldOfsX() > this.toFieldOfsY()){
                    this.normalizeToLeft();
                }else{
                    this.normalizeToUpper();
                }
            }
        }

        // 床特殊効果
        switch(this.getOnField()){
            case FIELD.SCROLL_L:
                this.speed.x = this.speed.x * (1.0 - PLAYER_GRD_ACCRATIO) + (this.direction * PLAYER_SPEED - this.field.SCROLLPANEL_SPEED) * PLAYER_GRD_ACCRATIO;
                break;
            case FIELD.SCROLL_R:
                this.speed.x = this.speed.x * (1.0 - PLAYER_GRD_ACCRATIO) + (this.direction * PLAYER_SPEED + this.field.SCROLLPANEL_SPEED) * PLAYER_GRD_ACCRATIO;
                break;
            case FIELD.SLIP:
                break;
            case FIELD.NONE:
                this.speed.x = this.speed.x * (1.0 - PLAYER_AIR_ACCRATIO) + this.direction * PLAYER_SPEED * PLAYER_AIR_ACCRATIO;
                break;
            default:
                this.speed.x = this.speed.x * (1.0 - PLAYER_GRD_ACCRATIO) + this.direction * PLAYER_SPEED * PLAYER_GRD_ACCRATIO;
                break;
        }

        // ビューの更新
        var v = this.view.getPosition();
        v.x = v.x * 0.95 + (this.position.x + this.speed.x * VIEW_DIRECTION_OFFSET) * 0.05;
        v.y = v.y * 0.95 + this.position.y * 0.05;
        this.view.setPosition(v);
    },
    moveItemGet: function() {
        if(this.wait_timer < WAIT_TIMER_INTERVAL){
            this.wait_timer ++;
            return;
        }

        if(this.game.key.isPressAction()){
            this.state = PLAYERSTATE.NORMAL;

            this.game.bgm.play("bgm0");
        }
    },
    moveByInput: function() {
        if(this.game.key.isPressLeft()) this.direction = -1;
        if(this.game.key.isPressRight()) this.direction = 1;

        if(this.game.key.isPushAction()) {
            if (((this.playerData.jump_max > this.jump_cnt) || this.onWall()) && (this.game.key.isPressDown() == false)){
                this.speed.y = PLAYER_JUMP;		// ジャンプ
                if(!this.onWall()) this.jump_cnt++;

                if(Math.abs(this.speed.x) < 0.1){
                    if(this.speed.x < 0) this.speed.x -= 0.02;
                    if(this.speed.x > 0) this.speed.x += 0.02;
                }

                this.game.se.play("jump");

                this.jumped_point.x = this.position.x;
                this.jumped_point.y = this.position.y;
            }
        }
    },

    // 各種接触処理
    checkCollision: function() {
        for(var xx=0;xx<2;xx++){
            for(var yy=0;yy<2;yy++){
                // アイテム獲得(STATE_ITEMGETへ遷移)
                if(this.field.isItem(this.toFieldX() + xx, this.toFieldY() + yy)){
                    // 隠しアイテムは条件が必要
                    if(!this.field.isItemGetable(this.toFieldX() + xx , this.toFieldY() + yy)) continue;

                    this.state = PLAYERSTATE.ITEMGET;

                    // アイテム効果
                    this.item_get = this.field.getField(this.toFieldX() + xx , this.toFieldY() + yy);
                    switch(this.field.getField(this.toFieldX() + xx , this.toFieldY() + yy))
                    {
                        case FIELD.ITEM_POWERUP:
                            this.playerData.jump_max++;
                            break;
                        case FIELD.ITEM_LIFE:
                            this.playerData.life_max++;
                            this.life = this.playerData.life_max * LIFE_RATIO;
                            break;
                        default:
                            this.playerData.itemGetFlags[this.item_get] = true;
                            break;
                    }
                    this.field.eraseField(this.toFieldX() + xx, this.toFieldY() + yy);
                    this.wait_timer = 0;

                    this.game.bgm.stop();
                    if(this.playerData.isItemForClear(this.item_get) || this.item_get == Field.FIELD_ITEM_POWERUP){
                        this.game.se.play("itemget");
                    }else{
                        this.game.se.play("itemget2");
                    }
                    return;
                }
                // トゲ(ダメージ)
                if(this.field.isSpike(this.toFieldX() + xx, this.toFieldY() + yy)){
                    this.state = PLAYERSTATE.MUTEKI;
                    this.wait_timer = 0;
                    this.life -= LIFE_RATIO;
                    this.speed.y = PLAYER_JUMP;
                    this.jump_cnt = -1;			// ダメージ・エキストラジャンプ

                    this.game.se.play("damage");

                    return;
                }
            }
        }
    },
    // 乗っているものを返す
    getOnField: function() {
        if(!this.onWall())return FIELD.NONE;
        if(this.toFieldOfsX() < CHAR_SIZE / 2){
            if(this.field.isRidable( this.toFieldX()	  ,this.toFieldY() + 1 )){
                return this.field.getField( this.toFieldX() , this.toFieldY() + 1);
            }else{
                return this.field.getField( this.toFieldX() + 1 , this.toFieldY() + 1);
            }
        }else{
            if(this.field.isRidable( this.toFieldX() + 1,this.toFieldY() + 1 )){
                return this.field.getField( this.toFieldX() + 1 , this.toFieldY() + 1);
            }else{
                return this.field.getField( this.toFieldX() , this.toFieldY() + 1);
            }
        }
    },
    draw: function(game) {
        var v = this.view.toScreenPosition(this.position);
        if (this.state == PLAYERSTATE.DEAD){					// 死亡
            var anime = (~~(this.timer / 6) % 4);
            if(this.playerData.lunker_mode){
                game.draw("ino", v.x , v.y , CHAR_SIZE * (2 + anime) , 128 + CHAR_SIZE * 2 , CHAR_SIZE,CHAR_SIZE);
            }else{
                game.draw("ino", v.x , v.y , CHAR_SIZE * (2 + anime) , 128 , CHAR_SIZE, CHAR_SIZE);
            }
        } else {								// 生存
            if(this.state != PLAYERSTATE.MUTEKI || this.timer % 10 < 5){
                var anime = (~~(this.timer / 6) % 2);
                if(!this.onWall()) anime = 0;
                if(this.direction < 0){
                    if(this.playerData.lunker_mode){
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE * 2 , CHAR_SIZE,CHAR_SIZE);
                    }else{
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 , CHAR_SIZE,CHAR_SIZE);
                    }
                }else{
                    if(this.playerData.lunker_mode){
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE * 3 , CHAR_SIZE,CHAR_SIZE);
                    }else{
                        game.draw("ino" , v.x , v.y , CHAR_SIZE * anime , 128 + CHAR_SIZE , CHAR_SIZE,CHAR_SIZE);
                    }
                }
            }
        }

        /*	// でばぐ
         Hell_drawFont(" I:" ~ std.string.toString(playerdata.getItemCount()) , 0,16);
         Hell_drawFont(" J:" ~ std.string.toString(jump_cnt) ~ " MJ:" ~ std.string.toString(jump_max) , 0,9);
         Hell_drawFont(" X:" ~ std.string.toString(cast(int)position.x) ~ " FX:" ~ std.string.toString(toFieldX()) ~ " OX:" ~ std.string.toString(toFieldOfsX()) , 0,18);
         Hell_drawFont(" Y:" ~ std.string.toString(cast(int)position.y) ~ " FY:" ~ std.string.toString(toFieldY()) ~ " OY:" ~ std.string.toString(toFieldOfsY()) , 0,27);
         */

        // ライフ表示
        for(var t=0;t<this.playerData.life_max;t++){
            if(this.life < LIFE_RATIO * 2 && this.timer % 10 < 5 && this.playerData.life_max > 1) continue;

            if(this.life >= (t + 1) * LIFE_RATIO){
                game.draw("ino" , CHAR_SIZE * t , 0 , CHAR_SIZE * 3 , 128 + CHAR_SIZE * 1 , CHAR_SIZE,CHAR_SIZE);
            }else{
                game.draw("ino" , CHAR_SIZE * t , 0 , CHAR_SIZE * 4 , 128 + CHAR_SIZE * 1 , CHAR_SIZE,CHAR_SIZE);
            }
        }

        // 取ったアイテム一覧
        for(var t=FIELD.ITEM_FUJI ; t<FIELD.ITEM_MAX ; t++){
            if(!this.playerData.itemGetFlags[t]){
                game.draw("ino" , g_width - CHAR_SIZE / 4 * (FIELD.ITEM_MAX - 2 - t) , 0 ,	// 無
                    CHAR_SIZE * 5 , 128 + CHAR_SIZE , CHAR_SIZE / 4 , CHAR_SIZE / 2);
            }else{
				if( this.playerData.isItemForClear(t)){
					// クリア条件アイテムは専用グラフィック
					for(var i=0 ; i < this.playerData.clearFlagItems.length ; i++){
						if(this.playerData.clearFlagItems[i] == t){
							game.draw("ino" , g_width - CHAR_SIZE / 4 * (FIELD.ITEM_MAX - 2 - t) , 0 ,
								CHAR_SIZE * 5 + CHAR_SIZE / 4 * (i + 2) , 128 + CHAR_SIZE  , CHAR_SIZE / 4 , CHAR_SIZE / 2);
						}
					}
				}else{
					game.draw("ino" , g_width - CHAR_SIZE / 4 * (FIELD.ITEM_MAX - 2 - t) , 0 ,	// 有
						CHAR_SIZE * 5 + CHAR_SIZE / 4 , 128 + CHAR_SIZE  , CHAR_SIZE / 4 , CHAR_SIZE / 2);
				}
            }
        }


        // アイテム獲得メッセージ
        if(this.state == PLAYERSTATE.ITEMGET){
            var t = WAIT_TIMER_INTERVAL - this.wait_timer;
            game.draw("msg" , (g_width - 256) / 2 , (g_height - 96) / 2 - t * t + 24 ,
                256 , 96 * (this.item_get - FIELD.ITEM_BORDER - 1), 256 , 96);
            game.fillRect((g_width - 32) / 2 , (g_height - 96) / 2 - t * t - 24 ,32,32,0,0,0);
            game.fillRect((g_width - 32) / 2  + 2, (g_height - 96) / 2 - t * t - 24 + 2,32 - 4,32 - 4,255,255,255);

            var it = this.item_get - (FIELD.ITEM_BORDER + 1);
            game.draw("ino" , (g_width - 16) / 2 , (g_height - 96) / 2 - t * t - 16 ,
                (it % 16) * CHAR_SIZE, (~~(it / 16) + 4) * CHAR_SIZE , CHAR_SIZE , CHAR_SIZE);
        }

        // ゲーム開始メッセージ
        if(this.state == PLAYERSTATE.START) game.draw("msg", (g_width - 256) / 2 ,  64+(g_height-240)/2 , 0 , 96 , 256 , 32);
        // ゲームオーバーメッセージ
        if(this.state == PLAYERSTATE.DEAD) game.draw("msg", (g_width - 256) / 2 ,  64+(g_height-240)/2 , 0 , 128 , 256 , 32);
    }
}
