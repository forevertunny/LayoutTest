"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
//@ts-ignore
const package_json_1 = __importDefault(require("../package.json"));
const fs_extra_1 = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
async function install(zipName) {
    const projectDir = Editor.Project.path;
    let srcDir = path_1.default.join(__dirname, `../samples/${zipName}.zip`);
    let destDir = path_1.default.join(projectDir, `./assets/${zipName}`);
    let inst = true;
    if ((0, fs_extra_1.existsSync)(destDir)) {
        inst = (await Editor.Dialog.warn(`${destDir} 已经存在，是否继续?`, { default: 0, cancel: 1, buttons: ["Yes", "No"] })).response == 0;
    }
    if (!inst) {
        return;
    }
    await Editor.Utils.File.unzip(srcDir, destDir);
    Editor.Message.request("asset-db", "refresh-asset", "db://assets");
}
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    async selected(data, uuid) {
        const options = {
            name: package_json_1.default.name,
            method: 'selected',
            args: [data, uuid],
        };
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
    openPanel: () => {
        // console.log(packageJSON.name);
        Editor.Panel.open(package_json_1.default.name);
    },
    openCreateFontPanel: (uuid) => {
        Editor.Panel.open(`${package_json_1.default.name}.create-font`, uuid);
    },
    async createLabel() {
        const options = {
            name: package_json_1.default.name,
            method: 'createLabel',
            args: [],
        };
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
    async createButton() {
        const options = {
            name: package_json_1.default.name,
            method: 'createButton',
            args: [],
        };
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
    async createLabel3D() {
        const options = {
            name: package_json_1.default.name,
            method: 'createLabel3D',
            args: [],
        };
        const result = await Editor.Message.request('scene', 'execute-scene-script', options);
    },
    async installSample() {
        install("textmesh-sample");
    }
};
let _modify = false;
async function onAssetAdd(uuid, data) {
    if (_modify) {
        _modify = false;
        return;
    }
    if (data.file.endsWith(".tmf") && data.importer != "tmf") {
        data.importer = "tmf";
        data.files = [".json"];
        _modify = true;
        let metaFile = await Editor.Message.request("asset-db", "query-path", uuid) + ".meta";
        let metaInfo = fs_extra_1.default.readJSONSync(metaFile);
        metaInfo.importer = "tmf";
        metaInfo.files = [".json"];
        fs_extra_1.default.writeFileSync(metaFile, JSON.stringify(metaInfo));
        await Editor.Message.request("asset-db", "refresh-asset", path_1.default.dirname(data.file));
        console.log(path_1.default.dirname(data.file));
    }
    _modify = false;
}
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () {
    Editor.Message.addBroadcastListener("asset-db:asset-add", onAssetAdd);
    Editor.Message.addBroadcastListener("asset-db:asset-change", onAssetAdd);
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
    Editor.Message.removeBroadcastListener("asset-db:asset-add", onAssetAdd);
    Editor.Message.removeBroadcastListener("asset-db:asset-change", onAssetAdd);
};
exports.unload = unload;
