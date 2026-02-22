'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const asset_db_1 = require("@editor/asset-db");
// import { Asset as ccAsset } from 'cc';
class TMFImporter extends asset_db_1.Importer {
    // 版本号如果变更，则会强制重新导入
    get version() {
        return '1.0.0';
    }
    // importer 的名字，用于指定 importer as 等
    get name() {
        return 'tmf';
    }
    // 引擎内对应的类型
    get assetType() {
        return 'cc.Asset';
    }
    /**
     * 检查文件是否适用于这个 importer
     * @param asset
     */
    async validate(asset) {
        return !await asset.isDirectory();
    }
    /**
     * 实际导入流程
     *
     * 返回是否导入成功的标记
     * 如果返回 false，则 imported 标记不会变成 true
     * 后续的一系列操作都不会执行
     * @param asset
     */
    async import(asset) {
        //@ts-ignore
        console.log("module,", Editor.Module);
        // 获取自定义类型
        // Get the custom type
        // @ts-ignore
        const { TMFont } = await Editor.Module.importProjectModule('db://text-mesh/TextMesh/font/TMFont.ts');
        // If the current resource is not imported, the system starts to import the current resource
        await asset.copyToLibrary(asset.extname, asset.source);
        const nAsset = new TMFont();
        nAsset.name = asset.basename;
        nAsset._setRawAsset(asset.extname);
        await asset.saveToLibrary('.json', EditorExtends.serialize(nAsset));
        return true;
    }
}
exports.default = TMFImporter;
