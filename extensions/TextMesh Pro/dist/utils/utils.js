"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTMFFile = exports.enableCustomImporter = exports.portIsOccupied = exports.wait = exports.applyI18N = void 0;
const fs_1 = __importDefault(require("fs"));
const settings_1 = require("./settings");
function applyI18N(node) {
    if (!node) {
        return;
    }
    if (node.innerText && node.innerText.startsWith("i18n:")) {
        node.innerText = Editor.I18n.t(node.innerText.replace("i18n:", ""));
    }
    let child = node.firstElementChild;
    while (child) {
        if (child instanceof HTMLElement) {
            applyI18N(child);
        }
        child = node.firstElementChild;
    }
}
exports.applyI18N = applyI18N;
async function wait(timeMS) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeMS);
    });
}
exports.wait = wait;
const net = require('net');
function portIsOccupied(port) {
    const server = net.createServer().listen(port);
    return new Promise((resolve, reject) => {
        server.on('listening', () => {
            console.log(`the server is runnint on port ${port}`);
            server.close();
            // 返回可用端口
            resolve(port);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                //注意这句，如占用端口号+1
                resolve(portIsOccupied(port + 1));
                console.log(`this port ${port} is occupied.try another.`);
            }
            else {
                reject(err);
            }
        });
    });
}
exports.portIsOccupied = portIsOccupied;
function enableCustomImporter() {
    return !!Editor.Module.importProjectModule;
}
exports.enableCustomImporter = enableCustomImporter;
function isTMFFile(filename) {
    let fileData = fs_1.default.readFileSync(filename, "utf-8");
    return fileData.startsWith(settings_1.Settings.TMF_Prefix);
}
exports.isTMFFile = isTMFFile;
