"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_json_1 = require("../config.json");
var namesMap_1 = __importDefault(require("./helpers/namesMap"));
var names = namesMap_1.default(config_json_1.targetFile);
var app = express_1.default();
app.get("/name-count", function (req, res) {
    var name = req.query.name;
    if (!name || !names.hasOwnProperty(name)) {
        res.status(404);
        res.send('Name is not found');
        return;
    }
    res.status(200);
    res.json({ name: name, count: names[name] });
});
app.all("*", function (req, res) {
    res.status(404);
    res.send("Page is not found");
});
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(500);
    res.send('Server is not responsible');
});
app.listen(config_json_1.port, function () {
    console.log("server started at http://localhost:" + config_json_1.port);
});
//# sourceMappingURL=index.js.map