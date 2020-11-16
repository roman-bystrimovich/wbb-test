"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../config.json");
exports.default = (function (fileName) {
    var file = path_1.default.resolve(config_json_1.filesDir, fileName);
    if (!fs_1.default.existsSync(file)) {
        throw new Error("File " + fileName + " doesn't exist");
    }
    var names = {};
    var textBuffer = fs_1.default.readFileSync(file);
    var text = textBuffer.toString();
    text.split('\n').forEach(function (line) {
        var _a = line.split(':'), name = _a[0], count = _a[1];
        names[name] = parseInt(count, 10);
    });
    return names;
});
//# sourceMappingURL=namesMap.js.map