GAMEMODE = {
    NORMAL: 0,
    LUNKER: 1
}

function PlayerData() {
    this.initialize.apply(this, arguments);
}

PlayerData.prototype = {
    itemGetFlags: null,
    playtime: 0,
    jump_max: 0,
    life_max: 0,
    lunker_mode: false,
    initialize: function(gameMode) {
        this.itemGetFlags = {};
        for (var t=0;t<FIELD.ITEM_MAX;t++) {
            this.itemGetFlags[t] = false;
        }
        this.playtime = 0;
        this.jump_max = 0;

        switch(gameMode){
            case GAMEMODE.NORMAL:
                // ノーマルモード
                this.life_max = 3;
                this.lunker_mode = false;
                break;
            case GAMEMODE.LUNKER:
                // ランカー・モード
                this.life_max = 1;
                this.lunker_mode = true;
                this.jump_max = 1;		// 追加最大ジャンプ
                break;
            default:
                this.life_max = 3;
                this.lunker_mode = false;
                break;
        }
    }
}
