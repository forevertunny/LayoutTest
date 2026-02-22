"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPrefs = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getPlayerPrefsData() {
    let tempDir = path_1.default.join(Editor.Project.tmpDir, "text-mesh");
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir);
    }
    let prefFile = path_1.default.join(tempDir, `player-prefs.json`);
    if (!fs_1.default.existsSync(prefFile)) {
        return [prefFile, {}];
    }
    let prefData = fs_1.default.readFileSync(prefFile, "utf-8");
    return [prefFile, JSON.parse(prefData)];
}
function set(key, value) {
    let [prefFile, prefData] = getPlayerPrefsData();
    prefData[key] = value;
    fs_1.default.writeFileSync(prefFile, JSON.stringify(prefData));
}
function get(key) {
    let [prefFile, prefData] = getPlayerPrefsData();
    return prefData[key];
}
function remove(key) {
    let [prefFile, prefData] = getPlayerPrefsData();
    delete prefData[key];
    fs_1.default.writeFileSync(prefFile, JSON.stringify(prefData));
}
exports.PlayerPrefs = {
    set,
    get,
    remove,
};
