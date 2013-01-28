function Font() {
    this.initialize.apply(this, arguments);
}

Font.prototype = {
    fonts: {},
    initialize: function() {
    },
    load: function(path, finishCallback) {
        var xn = new Array();
        for (var n = 32 ; n < 128 ; n ++) {
            xn.push(function(i, path, fonts) {
                return function(callback) {
                    var img = new Image();
                    img.src = path + "/" + i + ".png";
                    img.onload = (function(fonts, index) {
                        return function() {
                            fonts[index] = img;
                            callback();
                        };
                    }(fonts, i));

                    img.onerror = function() {
                        callback();
                    }
                }
            }(n, path, this.fonts));
        }
        async.series(xn);
    }
}
