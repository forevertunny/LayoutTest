"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAssetMenu = exports.onCreateMenu = void 0;
const package_json_1 = __importDefault(require("../../package.json"));
function onCreateMenu(assetInfo) {
    return [
        {
            label: `i18n:${package_json_1.default.name}.menu.name`,
            click() {
                if (!assetInfo) {
                    console.log('get create command from header menu');
                }
                else {
                    console.log('get create command, the detail of diretory asset is:');
                    console.log(assetInfo);
                }
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'i18n:extend-assets-demo.menu.assetCommandParent',
            submenu: [
                {
                    label: 'i18n:extend-assets-demo.menu.assetCommand1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'i18n:extend-assets-demo.menu.assetCommand2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
}
exports.onAssetMenu = onAssetMenu;
;
