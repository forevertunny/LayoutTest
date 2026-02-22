'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
const utils_1 = require("../utils/utils");
const tmx_impoter_1 = __importDefault(require("./importers/tmx-impoter"));
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
exports.methods = {
    registerTMFImporter() {
        if ((0, utils_1.enableCustomImporter)()) {
            return {
                extname: ['.tmf'],
                importer: tmx_impoter_1.default,
            };
        }
        else {
            return {};
        }
    },
};
