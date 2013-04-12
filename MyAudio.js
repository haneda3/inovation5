function MyAudio() {
    this.initialize.apply(this, arguments);
}

MyAudio.prototype = {
    audios: {},
    enabled: true,
    titanium: false,
    initialize: function () {
    },
    load: function (key, path, loop) {
        if (typeof(loop) === 'undefined') loop = false;
        
        if (this.enabled == false) return;

		if (this.titanium) {
			Ti.App.fireEvent("Audio_load", {key:key, path:path, loop:loop});
			return;
		}

        var audio = new Audio(path);
        audio.autoplay = false;
        audio.loop = loop;
        this.audios[key] = audio;
    },
    play: function (key) {
        if (this.enabled == false) return;

		if (this.titanium) {
			Ti.App.fireEvent("Audio_play", {key:key});
			return;
		}
		
        this.audios[key].play();
    },
    stop: function (key) {
        if (this.enabled == false) return;

		if (this.titanium) {
			Ti.App.fireEvent("Audio_stop", {key:key});
			return;
		}
		
        var audio = this.audios[key];
        if (audio.ended == false) {
            audio.pause();
            audio.currentTime = 0;
        }
    },
    setVolume: function (key, volume) {
        if (this.enabled == false) return;

		if (this.titanium) {
			Ti.App.fireEvent("Audio_setVolume", {key:key, volume:volume});
			return;
		}
		
        var audio = this.audios[key];
        audio.volume = volume;
    },
    // duration(ms)
    stopWithFade: function (key, duration) {
        if (this.enabled == false) return;

		if (this.titanium) {
			return;
		}
		
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
    setEnabled: function(enabled) {
    	this.audio.enabled = enabled;
    },
    setTitaniumMode: function(enabled) {
    	if (enabled) {
	    	this.setEnabled(true);
	    	this.audio.titanium = true;
	    }
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
    setEnabled: function(enabled) {
    	this.audio.enabled = enabled;
    },
    setTitaniumMode: function(enabled) {
    	if (enabled) {
	    	this.setEnabled(true);
	    	this.audio.titanium = true;
	    }
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
