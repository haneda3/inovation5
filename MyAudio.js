function MyAudio() {
    this.initialize.apply(this, arguments);
}

MyAudio.prototype = {
    audios: {},
    initialize: function() {
    },
    load: function(key, path, loop) {
        if (typeof(loop) === 'undefined') loop = false;

        var audio = new Audio(path);
        audio.autoplay = false;
        audio.loop = loop;
        this.audios[key] = audio;
    },
    play: function(key) {
        this.audios[key].play();
    },
    stop: function(key) {
        var audio = this.audios[key];
        if (audio.ended == false) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
}

function SoundEffect() {
    this.initialize.apply(this, arguments);
}

SoundEffect.prototype = {
    audio: new MyAudio(),
    initialize: function() {
    },
    load: function(key, path) {
        this.audio.load(key, path, false);
    },
    play: function(key) {
        this.audio.play(key);
    },
    stop: function(key) {
        this.audio.stop(key);
    }
}

function BGM() {
    this.initialize.apply(this, arguments);
}

BGM.prototype = {
    audio: new MyAudio(),
    initialize: function() {
    },
    load: function(key, path) {
        this.audio.load(key, path, true);
    },
    play: function(key) {
        for (var k in this.audio.audios) {
            this.audio.stop(k);
        }
        this.audio.play(key);
    },
    stop: function() {
        for (var k in this.audio.audios) {
            this.audio.stop(k);
        }
    }
}
