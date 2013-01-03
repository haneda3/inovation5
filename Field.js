FIELD = {
    NONE: 0,		// なし
    HIDEPATH: 1,		// 隠しルート(見えるけど判定のないブロック)
    UNVISIBLE: 2,	// 不可視ブロック(見えないけど判定があるブロック)
    BLOCK : 3,		// 通常ブロック
    BLOCK : 3,    // 通常ブロック
    BAR : 4,    // 床。降りたり上ったりできる
    SCROLL_L : 5,   // ベルト床左
    SCROLL_R : 6,   // ベルト床右
    SPIKE : 7,    // トゲ
    SLIP : 8,   // すべる
    ITEM_BORDER : 9,  // アイテムチェック用
    ITEM_POWERUP : 10, // パワーアップ
    ITEM_FUJI : 11,  // ふじ系
    ITEM_BUSHI : 12,
    ITEM_APPLE : 13,
    ITEM_V : 14,
    ITEM_TAKA : 15,  // たか系
    ITEM_SHUOLDER : 16,
    ITEM_DAGGER : 17,
    ITEM_KATAKATA : 18,
    ITEM_NASU : 19,  // なす系
    ITEM_BONUS : 20,
    ITEM_NURSE : 21,
    ITEM_NAZUNA : 22,
    ITEM_GAMEHELL : 23,  // くそげー系
    ITEM_GUNDAM : 24,
    ITEM_POED : 25,
    ITEM_MILESTONE : 26,
    ITEM_1YEN : 27,
    ITEM_TRIANGLE : 28,
    ITEM_OMEGA : 29, // 隠し
    ITEM_LIFE : 30,  // ハート
    ITEM_STARTPOINT : 31,  // 開始地点
    ITEM_MAX : 32
}

function Field() {
    this.initialize.apply(this, arguments);
}

Field.prototype = {
    field: null,
    timer: 0,
    FIELD_X_MAX: 128,
    FIELD_Y_MAX: 128,
    GRAPHIC_OFFSET_X: -16 - 16*2,
    GRAPHIC_OFFSET_Y:  8 - 16*2,
    initialize: function() {
        this.field = new Array(this.FIELD_X_MAX * this.FIELD_Y_MAX);
        this.timer = 0;
    },
    loadFieldData: function(data) {
        var xm = data.split('\n');
        var decoder = " HUB~<>*I PabcdefghijklmnopqrzL@";

        var xx, yy;
        for (yy = 0 ; yy < xm.length ; yy ++) {
            var line = xm[yy];
            for (xx = 0 ; xx < line.length ; xx ++) {
                var c = line[xx];
                var n = decoder.indexOf(c);
                this.field[yy * this.FIELD_X_MAX + xx] = n;
            }
        }
    },
    move: function() {
//        this.timer ++;
    },
    getStartPoint: function() {
        var v = {x:0, y:0};
        for(var yy = 0 ;yy < this.FIELD_Y_MAX;yy++){
            for(var xx = 0;xx < this.FIELD_X_MAX;xx++){
                console.log("" + xx + "," + yy + " " + this.getField(xx, yy));
                if(this.getField(xx,yy) == FIELD.ITEM_STARTPOINT){
                    v.x = xx * CHAR_SIZE;
                    v.y = yy * CHAR_SIZE;
                    this.eraseField(xx,yy);
                    console.log("hit");
                }
            }
        }
        return v;
    },
    isWall: function(x, y) {
        if(this.field[y * this.FIELD_X_MAX + x] != FIELD.NONE &&
            this.field[y * this.FIELD_X_MAX + x] != FIELD.HIDEPATH &&
            this.field[y * this.FIELD_X_MAX + x] != FIELD.BAR &&
            !this.isItem(x,y)) return true;
        return false;
    },
    isRidable:function(x, y) {
        if(this.field[y * this.FIELD_X_MAX + x] != FIELD.NONE &&
           this.field[y * this.FIELD_X_MAX + x] != FIELD.HIDEPATH &&
           !this.isItem(x,y)) return true;
        return false;
    },
    isSpike: function(x, y) {
        if(this.field[y * this.FIELD_X_MAX + x] == FIELD.SPIKE) return true;
        return false;
    },
    getField: function(x,y) {
        return this.field[y * this.FIELD_X_MAX + x];
    },
    isItem: function(x, y) {
        if(this.field[y * this.FIELD_X_MAX + x] < FIELD.ITEM_BORDER ||
           this.field[y * this.FIELD_X_MAX + x] == FIELD.ITEM_STARTPOINT) return false;
        return true;
    },
    isItemGetable: function(x, y) {
        if(!this.isItem(x,y)) return false;
        if(this.field[y * this.FIELD_X_MAX + x] == FIELD.ITEM_OMEGA && this.isHiddenSecret()) return false;
        return true;
    },
    isHiddenSecret: function() {
//        if(playerdata.getItemCount() < 15) return true;
        return false;
    },
    eraseField: function(x,y) {
        this.field[y * this.FIELD_X_MAX + x] = FIELD.NONE;
    },
    draw: function(game, viewPosition) {
        game.fillRect(0,0,g_width,g_height,255,255,255);
//        Vec2D v = gamemain.view.getPosition();
//        var v = {x: 100, y: 100};
        var v = {x: viewPosition.x, y: viewPosition.y};
        var ofs_x = CHAR_SIZE - (v.x) % CHAR_SIZE;
        var ofs_y = CHAR_SIZE - (v.y) % CHAR_SIZE;
        for (var xx = -(~~(g_width/CHAR_SIZE/2) + 2);xx < (~~(g_width/CHAR_SIZE/2) + 2);xx++){
            var fx = xx + ~~(v.x / CHAR_SIZE);
            if(fx < 0 || fx >= this.FIELD_X_MAX ) continue;
            for(var yy = -(~~(g_height/CHAR_SIZE/2) + 2);yy < (~~(g_height/CHAR_SIZE/2) + 2);yy++){
                var fy = yy + ~~(v.y / CHAR_SIZE);
                if( fy < 0 || fy >= this.FIELD_Y_MAX) continue;

                var gy = (this.timer / 10) % 4;
                var gx = this.field[fy * this.FIELD_X_MAX + fx];

                if(this.isItem(fx,fy)){
                    gx = gx - (FIELD.ITEM_BORDER + 1);
                    gy = 4 + (gx / 16);
                    gx = gx % 16;
                }

                if(this.isHiddenSecret() && this.field[fy * this.FIELD_X_MAX + fx] == FIELD.ITEM_OMEGA) continue;

                game.draw("ino" ,
                    (xx + 12)* CHAR_SIZE + ofs_x + this.GRAPHIC_OFFSET_X + (g_width - 320)/2,
                    (yy + 8) * CHAR_SIZE + ofs_y + this.GRAPHIC_OFFSET_Y + (g_height - 240)/2,
                    gx * 16 , gy * 16 , 16,16);

                /*	// デバッグ用
                 Hell_drawFont(std.string.toString(field[fy * FIELD_X_MAX + fx]),
                 (xx + 12)* CHAR_SIZE + ofs_x + GRAPHIC_OFFSET_X,
                 (yy + 8) * CHAR_SIZE + ofs_y + GRAPHIC_OFFSET_Y);
                 */
            }
        }
    }
}


