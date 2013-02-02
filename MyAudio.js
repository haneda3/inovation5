function MyAudio() {
    this.initialize.apply(this, arguments);
}

MyAudio.prototype = {
    audios: {},
    initialize: function () {
    },
    load: function (key, path, loop) {
        if (typeof(loop) === 'undefined') loop = false;

        var audio = new Audio(path);
        audio.autoplay = false;
        audio.loop = loop;
        this.audios[key] = audio;
    },
    play: function (key) {
        this.audios[key].play();
    },
    stop: function (key) {
        var audio = this.audios[key];
        if (audio.ended == false) {
            audio.pause();
            audio.currentTime = 0;
        }
    },
    setVolume: function (key, volume) {
        var audio = this.audios[key];
        audio.volume = volume;
    },
    // duration(ms)
    stopWithFade: function (key, duration) {
        var audio = this.audios[key];

        var interval = 50; // ms
        var d = 1 / (duration / 1000);
        var t = 0;

        var timerId = setInterval(
            (function (self) {
                return function () {
                    //console.log("t:" + t / 1000 + " d:" + d + " " + t / 1000 * d);
                    var vl = 1 - (t / 1000 * d);
                    if (vl <= 0.0) {
                        self.stop(key);
                        self.setVolume(key, 1.0);

                        clearInterval(timerId);
                    } else {
                        audio.volume = vl;
                    }
                    t += interval;
                }
            })(this), interval);
    }
}

function SoundEffect() {
    this.initialize.apply(this, arguments);
}

SoundEffect.prototype = {
    audio: new MyAudio(),
    initialize: function () {
    },
    load: function (key, path) {
        this.audio.load(key, path, false);
    },
    play: function (key) {
        this.audio.play(key);
    },
    stop: function (key) {
        this.audio.stop(key);
    }
}

function BGM() {
    this.initialize.apply(this, arguments);
}

BGM.prototype = {
    audio: new MyAudio(),
    playingKey: null,
    initialize: function () {
    },
    load: function (key, path) {
        this.audio.load(key, path, true);
    },
    play: function (key) {
        this.stop();
        this.audio.setVolume(key, 1.0);
        this.audio.play(key);
        this.playingKey = key;
    },
    stop: function () {
        if (this.playingKey != null) {
            this.audio.stop(this.playingKey);
            this.playingKey = null;
        }
    },
    stopWithFade: function (duration) {
        if (this.playingKey != null) {
            this.audio.stopWithFade(this.playingKey, duration);
            this.playingKey = null;
        }
    }
}
