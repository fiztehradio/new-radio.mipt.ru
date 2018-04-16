define("js/modules/Player", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Player = (function () {
        function Player() {
            this.keypressed = false;
            this.element = $("#player");
            this.init();
        }
        Player.prototype.init = function () {
            var _this = this;
            var volume = $('.volume-control');
            volume.on('mousedown', function () { return _this.keypressed = true; });
            volume.on('mousedown', function () { return console.log('down'); });
            volume.on('mouseup', function () { return _this.keypressed = false; });
            $(document).on('mousemove', function (e) {
                if (!_this.keypressed) {
                    return;
                }
                console.log(e);
            });
        };
        return Player;
    }());
    exports.Player = Player;
});
define("js/modules/index", ["require", "exports", "js/modules/Player"], function (require, exports, Player_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    $(function () {
        var player = new Player_1.Player();
    });
});
//# sourceMappingURL=build.js.map