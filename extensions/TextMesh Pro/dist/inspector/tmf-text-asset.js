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
const fs_extra_1 = require("fs-extra");
const path_1 = __importStar(require("path"));
const vue_1 = require("vue");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils/utils");
const FontParser_1 = require("../utils/FontParser");
const settings_1 = require("../utils/settings");
const weakMap = new WeakMap();
const package_json_1 = __importDefault(require("../../package.json"));
const player_prefs_1 = require("../utils/player-prefs");
var showApp;
var hideApp;
var _canvas;
var _context;
var selectedAsset;
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
        },
        hide() {
        },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/template/tmf-asset/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/style/tmf-asset/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    update(assetList, metaList) {
        let data = assetList[0];
        if (showApp) {
            selectedAsset = data;
            if ((0, utils_1.isTMFFile)(data.file)) {
                showApp();
            }
            else {
                hideApp();
            }
        }
    },
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        show: false,
                        optFontSize: 1,
                        sizeOptions: [
                            128,
                            256,
                            512,
                            1024,
                            2048,
                            4096,
                        ],
                        model: {
                            usesystem_font: false,
                            font: "",
                            atlas: "",
                            fontFamily: "Arial",
                            fontSize: 46,
                            padding: 4,
                            atlasWidth: 1024,
                            atlasHeight: 1024,
                            dynamic: true,
                            staticChannelCount: 3,
                            charset: "",
                            tmfFontFile: "",
                            enableAutoFree: false,
                            offsetY: 0,
                            normalWeight: 0.14,
                            boldWeightScale: 0.2,
                            strokeScale: 2,
                            strokeBlur: 0,
                            shadowSize: 0.03,
                            shadowBlur: 0,
                            underLineOffset: -0.1,
                            keepUnlderLineSpace: false,
                            underLineThickness: 0.15,
                            strikeOffset: 0.3,
                            strikeThickness: 0.1,
                            scriptThickness: 0.3,
                            chars: {},
                        },
                        channels: [],
                        currentChannelID: -1,
                        currentChannelImg: "",
                        curChar: null,
                        searchChar: "",
                        curCharInfo: "",
                        currentCharImg: "",
                        charRect: {
                            x: 0,
                            y: 0,
                            w: 0,
                            h: 0,
                        },
                    };
                },
                watch: {
                    model: {
                        handler(value, oldValue) {
                            this.onTMFValueChanged();
                        },
                        deep: true,
                    },
                },
                methods: {
                    onTMFValueChanged() {
                        Editor.Message.broadcast("textmesh:tmf-refresh", selectedAsset.uuid, JSON.stringify({
                            enableAutoFree: this.model.enableAutoFree,
                            offsetY: this.model.offsetY,
                            normalWeight: this.model.normalWeight,
                            boldWeightScale: this.model.boldWeightScale,
                            strokeScale: this.model.strokeScale,
                            strokeBlur: this.model.strokeBlur,
                            shadowSize: this.model.shadowSize,
                            shadowBlur: this.model.shadowBlur,
                            underLineOffset: this.model.underLineOffset,
                            keepUnlderLineSpace: this.model.keepUnlderLineSpace,
                            underLineThickness: this.model.underLineThickness,
                            strikeOffset: this.model.strikeOffset,
                            strikeThickness: this.model.strikeThickness,
                            scriptThickness: this.model.scriptThickness,
                        }));
                    },
                    hide() {
                        this.show = false;
                    },
                    I18N(t) {
                        return Editor.I18n.t(t);
                    },
                    async _setTMFFile(tmfUUID) {
                        this.$refs.fontFile.value = tmfUUID;
                    },
                    async _setTTFChanged(ttfUUID) {
                        this.$refs.fontAsset.value = ttfUUID;
                    },
                    onSearchChar(value) {
                        this.searchChar = value;
                        this.curChar = this.model.chars[value];
                        if (this.curChar) {
                            let keys = Object.keys(this.curChar);
                            let infos = [];
                            for (let i = 0; i < keys.length; i++) {
                                let key = keys[i];
                                let val = this.curChar[key];
                                infos.push(`${key}:${val}`);
                            }
                            this.curCharInfo = infos.join("\n");
                            this._selectChar(value, this.curChar);
                        }
                        else {
                            this.curCharInfo = "";
                            this.searchChar = "";
                        }
                    },
                    getCanvas() {
                        if (!_canvas) {
                            _canvas = document.createElement('canvas');
                            _context = _canvas.getContext("2d");
                        }
                        _canvas.width = this.model.atlasWidth;
                        _canvas.height = this.model.atlasHeight;
                        return _canvas;
                    },
                    async _selectChar(char, charInfo) {
                        if (!char) {
                            this.currentCharImg = "";
                            return;
                        }
                        let img = this.$refs.preview;
                        let sw = img.width / this.model.atlasWidth;
                        let sh = img.height / this.model.atlasHeight;
                        let cr = {};
                        let borderSize = 4;
                        cr.x = charInfo.x * sw;
                        cr.y = charInfo.y * sh;
                        cr.w = charInfo.width * sw - borderSize;
                        cr.h = charInfo.height * sh - borderSize;
                        this.charRect = cr;
                        this.onChannelClick(charInfo.channelID);
                    },
                    async _saveCharFile(char, charInfo) {
                        if (!char) {
                            this.currentCharImg = "";
                            return;
                        }
                        this.getCanvas();
                        let tempDir = path_1.default.join(Editor.Project.tmpDir, "text-mesh");
                        if (!fs_1.default.existsSync(tempDir)) {
                            return;
                        }
                        let channelFile = path_1.default.join(tempDir, `${this.model.atlas}_${charInfo.channelID}.png`);
                        let img = new Image;
                        img.src = channelFile;
                        img.onload = async () => {
                            _canvas.width = this.model.atlasWidth;
                            _canvas.height = this.model.atlasHeight;
                            _context.drawImage(img, 0, 0);
                            const imgData = _context.getImageData(charInfo.x, charInfo.y, charInfo.width, charInfo.height);
                            _context.putImageData(imgData, 0, 0);
                            _canvas.width = charInfo.width;
                            _canvas.height = charInfo.height;
                            var base64 = await this.canvasEncodeTexture(_canvas);
                            let charImg = path_1.default.join(tempDir, `char.png`);
                            this.saveImage(charImg, base64);
                            this.currentCharImg = charImg + `?${Date.now()}`;
                            img = null;
                        };
                    },
                    saveImage(filename, base64Image) {
                        const base64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
                        const path = filename;
                        fs_1.default.writeFileSync(path, base64, 'base64');
                    },
                    canvasEncodeTexture(canvas, quality = 1) {
                        return new Promise((resolve) => {
                            if (canvas.toDataURL) {
                                resolve(canvas.toDataURL("image/png", quality));
                            }
                            else {
                                canvas.toBlob((blob) => {
                                    var reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onload = (e) => {
                                        resolve(e.target.result);
                                    };
                                }, "image/png", quality);
                            }
                        });
                    },
                    async onChannelClick(channelID) {
                        this.currentChannelID = channelID;
                        let tempDir = path_1.default.join(Editor.Project.tmpDir, "text-mesh");
                        let channelImg = path_1.default.join(tempDir, `${this.model.atlas}_${channelID}.png`);
                        if (!fs_1.default.existsSync(channelImg)) {
                            if (!this.model.atlas) {
                                return;
                            }
                            let atlasFile = await Editor.Message.request("asset-db", "query-path", this.model.atlas);
                            if (!fs_1.default.existsSync(atlasFile)) {
                                return;
                            }
                            await new Promise((resolve) => {
                                this.getCanvas();
                                let img = new Image;
                                img.src = atlasFile;
                                img.onload = async () => {
                                    _canvas.width = this.model.atlasWidth;
                                    _canvas.height = this.model.atlasHeight;
                                    _context.drawImage(img, 0, 0);
                                    const imageData = _context.getImageData(0, 0, img.width, img.height);
                                    _context.putImageData(imageData, 0, 0);
                                    for (let i = 0; i < this.model.staticChannelCount; i++) {
                                        this.genChannelImage(imageData, i, this.model.atlas);
                                    }
                                    resolve(0);
                                    img = null;
                                };
                            });
                        }
                        this.currentChannelImg = channelImg + "?" + Date.now();
                    },
                    _calcAtlasChannels() {
                        let channels = [];
                        for (let i = 0; i < this.model.staticChannelCount; i++) {
                            channels.push(i);
                        }
                        this.channels = channels;
                    },
                    async genChannelImage(imageData, channelID, uuid) {
                        let tempDir = path_1.default.join(Editor.Project.tmpDir, "text-mesh");
                        if (!fs_1.default.existsSync(tempDir)) {
                            fs_1.default.mkdirSync(tempDir);
                        }
                        let channelImageData = _context.createImageData(imageData.width, imageData.height);
                        for (let i = 0; i < imageData.width; i++) {
                            for (let j = 0; j < imageData.height; j++) {
                                let index = (j * imageData.width + i) * 4;
                                let v = imageData.data[index + channelID];
                                channelImageData.data[index] = v;
                                channelImageData.data[index + 1] = v;
                                channelImageData.data[index + 2] = v;
                                channelImageData.data[index + 3] = 255;
                            }
                        }
                        _context.putImageData(channelImageData, 0, 0);
                        var base64 = await this.canvasEncodeTexture(_canvas);
                        let filename = path_1.default.join(tempDir, `${uuid}_${channelID}.png`);
                        this.saveImage(filename, base64);
                    },
                    async modifyTMF() {
                        await Editor.Message.request("text-mesh", "textmesh:open-create-font-panel", selectedAsset.uuid);
                        player_prefs_1.PlayerPrefs.set("selected-tmf-uuid", selectedAsset.uuid);
                    },
                    round(value, precision) {
                        let multiplier = Math.pow(10, precision || 0);
                        return Math.round(value * multiplier) / multiplier;
                    },
                    async saveTMF() {
                        let lines = [];
                        lines.push(settings_1.Settings.TMF_Prefix);
                        lines.push(`version=${package_json_1.default.version}`);
                        lines.push(`font=${this.model.font}`);
                        lines.push(`atlas=${this.model.atlas || ""}`);
                        lines.push(`charset=${this.model.charset}`);
                        lines.push(`fontFamily=${this.model.fontFamily.replace('\r', '')}`);
                        lines.push(`fontSize=${this.model.fontSize}`);
                        lines.push(`padding=${this.model.padding}`);
                        lines.push(`padTrim=${this.model.padTrim ? 1 : 0}`);
                        lines.push(`atlasWidth=${this.model.atlasWidth}`);
                        lines.push(`atlasHeight=${this.model.atlasHeight}`);
                        lines.push(`dynamic=${this.model.dynamic ? 1 : 0}`);
                        lines.push(`staticChannels=${this.model.staticChannelCount}`);
                        lines.push(`enableAutoFree=${this.model.enableAutoFree ? 1 : 0}`);
                        lines.push(`offsetY=${this.model.offsetY}`);
                        lines.push(`normalWeight=${this.model.normalWeight}`);
                        lines.push(`boldWeightScale=${this.model.boldWeightScale}`);
                        lines.push(`strokeScale=${this.model.strokeScale}`);
                        lines.push(`strokeBlur=${this.model.strokeBlur}`);
                        lines.push(`shadowSize=${this.model.shadowSize}`);
                        lines.push(`shadowBlur=${this.model.shadowBlur}`);
                        lines.push(`underLineOffset=${this.model.underLineOffset}`);
                        lines.push(`keepUnlderLineSpace=${this.model.keepUnlderLineSpace ? 1 : 0}`);
                        lines.push(`underLineThickness=${this.model.underLineThickness}`);
                        lines.push(`strikeOffset=${this.model.strikeOffset}`);
                        lines.push(`strikeThickness=${this.model.strikeThickness}`);
                        lines.push(`scriptThickness=${this.model.scriptThickness}`);
                        let keys = Object.keys(this.model.chars);
                        for (let i = 0; i < keys.length; i++) {
                            let code = keys[i];
                            if (code === "") {
                                continue;
                            }
                            let char = this.model.chars[code];
                            lines.push("char=" +
                                [
                                    code,
                                    char.channelID,
                                    char.x,
                                    char.y,
                                    char.width,
                                    char.height,
                                    char.size,
                                    Math.round(char.glyphWidth),
                                    Math.round(char.glyphHeight),
                                    Math.round(char.glyphAdvance),
                                    Math.round(char.glyphLeft),
                                    Math.round(char.glyphRight),
                                    Math.round(char.ascent),
                                    Math.round(char.descent),
                                    this.round(char.scale, 3),
                                ].join(","));
                        }
                        fs_1.default.writeFileSync(selectedAsset.file, lines.join("\n"));
                        console.log("save tmf file success");
                    },
                    isNone(value) {
                        return value === null || value === undefined || Number.isNaN(value);
                    },
                    onKeepUpderlineSpace(val) {
                        this.model.keepUnlderLineSpace = val;
                    },
                    onEnableAutoFree(val) {
                        this.model.enableAutoFree = val;
                    }
                },
                computed: {
                    auto_font_size() {
                        return this.optFontSize == 1;
                    },
                },
                mounted() {
                    showApp = async () => {
                        this.show = true;
                        let file = selectedAsset.file;
                        // let fontUUID = await Editor.Message.request("asset-db", "query-uuid", file);
                        if (!(0, utils_1.isTMFFile)(file)) {
                            console.error(this.I18N("text-mesh.messages.tmfFontFile_error"));
                            this._setTMFFile("");
                        }
                        else {
                            // this._setTMFFile(fontUUID);
                            let fontStr = fs_1.default.readFileSync(file, "utf-8");
                            let fontData = FontParser_1.FontParser.parse(fontStr);
                            this._setTTFChanged(fontData.font);
                            this.model.charset = fontData.charset;
                            this.model.atlas = fontData.atlas;
                            this.model.font = fontData.font;
                            this.model.fontFamily = fontData.fontFamily;
                            this.model.fontSize = fontData.fontSize;
                            this.model.padding = fontData.padding;
                            this.model.atlasWidth = fontData.atlasWidth;
                            this.model.atlasHeight = fontData.atlasHeight;
                            this.model.dynamic = fontData.dynamic == 1;
                            this.model.staticChannelCount = this.isNone(fontData.staticChannels) ? 3 : fontData.staticChannels;
                            this.model.enableAutoFree = this.isNone(fontData.enableAutoFree) ? false : fontData.enableAutoFree == 1;
                            this.model.offsetY = this.isNone(fontData.offsetY) ? 0 : fontData.offsetY;
                            this.model.normalWeight = this.isNone(fontData.normalWeight) ? 0.14 : fontData.normalWeight;
                            this.model.boldWeightScale = this.isNone(fontData.boldWeightScale) ? 0.2 : fontData.boldWeightScale;
                            this.model.strokeScale = this.isNone(fontData.strokeScale) ? 2 : fontData.strokeScale;
                            this.model.strokeBlur = this.isNone(fontData.strokeBlur) ? 0.0 : fontData.strokeBlur;
                            this.model.shadowSize = this.isNone(fontData.shadowSize) ? 0.03 : fontData.shadowSize;
                            this.model.shadowBlur = this.isNone(fontData.shadowBlur) ? 0.0 : fontData.shadowBlur;
                            this.model.underLineOffset = this.isNone(fontData.underLineOffset) ? -6.9 : fontData.underLineOffset;
                            this.model.keepUnlderLineSpace = this.isNone(fontData.keepUnlderLineSpace) ? false : fontData.keepUnlderLineSpace == 1;
                            this.model.underLineThickness = this.isNone(fontData.underLineThickness) ? 0.15 : fontData.underLineThickness;
                            this.model.strikeOffset = this.isNone(fontData.strikeOffset) ? 0.4 : fontData.strikeOffset;
                            this.model.strikeThickness = this.isNone(fontData.strikeThickness) ? 0.1 : fontData.strikeThickness;
                            this.model.scriptThickness = this.isNone(fontData.scriptThickness) ? 0.3 : fontData.scriptThickness;
                            this.model.chars = fontData.chars;
                            this.onChannelClick(0);
                            this._calcAtlasChannels();
                        }
                    };
                    hideApp = () => {
                        this.show = false;
                    };
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            weakMap.set(this, app);
        }
    },
    beforeClose() {
    },
    close() {
        const app = weakMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
