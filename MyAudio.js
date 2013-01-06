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
