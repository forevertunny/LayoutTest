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
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importStar(require("path"));
const vue_1 = require("vue");
const FontHelper_1 = require("../../tmf/font/FontHelper");
const utils_1 = require("../../utils/utils");
const maxrects_packer_1 = require("maxrects-packer");
const package_json_1 = __importDefault(require("../../../package.json"));
const settings_1 = require("../../utils/settings");
const FontParser_1 = require("../../utils/FontParser");
const const_1 = require("../../tmf/font/const");
const player_prefs_1 = require("../../utils/player-prefs");
const weakMap = new WeakMap();
const _fontFaces = {};
var _canvas;
var _context;
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
    template: fs_extra_1.default.readFileSync((0, path_1.join)(__dirname, '../../../static/template/create-font/index.html'), 'utf-8'),
    style: fs_extra_1.default.readFileSync((0, path_1.join)(__dirname, '../../../static/style/create-font/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    update(assetList, metaList) {
        let data = assetList[0];
        console.log('update', data, metaList);
    },
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        error: "",
                        inGenerating: false,
                        progress: 0,
                        optFontSize: 1,
                        sizeOptions: [
                            128,
                            256,
                            512,
                            1024,
                            2048,
                            4096,
                        ],
                        optPaddingMode: 1,
                        channelSizeOptions: [0, 1, 2, 3, 4],
                        model: {
                            usesystem_font: false,
                            font: "",
                            atlas: "",
                            fontFamily: "Arial",
                            fontSize: 46,
                            padding: 4,
                            padTrim: false,
                            atlasWidth: 1024,
                            atlasHeight: 1024,
                            dynamic: true,
                            staticChannelCount: 3,
                            charset: "",
                            tmfFontFile: "",
                            enableAutoFree: false,
                            offsetY: 0,
                            normalWeight: 0.14,
                            boldWeightScale: 1.2,
                            strokeScale: 2,
                            strokeBlur: 0,
                            shadowSize: 0.03,
                            shadowBlur: 0,
                            underLineOffset: -0.2,
                            keepUnlderLineSpace: false,
                            underLineThickness: 0.15,
                            strikeOffset: 0.3,
                            strikeThickness: 0.1,
                            scriptThickness: 0.3,
                        },
                        // ttf file path
                        ttfFile: "",
                        // tmf file path
                        fontFile: "",
                        isNewTMF: false,
                    };
                },
                watch: {
                    model: {
                        handler(value, oldValue) {
                        },
                        deep: true,
                    }
                },
                mounted() {
                    let uuid = player_prefs_1.PlayerPrefs.get("selected-tmf-uuid");
                    if (uuid) {
                        this.onFontFileChanged(uuid);
                        player_prefs_1.PlayerPrefs.remove("selected-tmf-uuid");
                    }
                },
                methods: {
                    I18N(t) {
                        return Editor.I18n.t(t);
                    },
                    async onTTFChanged(ttfUUID) {
                        this.model.font = ttfUUID || "";
                        if (this.$refs.fontAsset) {
                            this.$refs.fontAsset.value = ttfUUID;
                        }
                        if (!ttfUUID) {
                            this.ttfFile = "";
                        }
                        else {
                            this.ttfFile = await Editor.Message.request("asset-db", "query-path", ttfUUID);
                        }
                    },
                    async _setTMFFile(tmfUUID) {
                        this.model.tmfFontFile = tmfUUID;
                        this.$refs.fontFile.value = tmfUUID;
                        if (!tmfUUID) {
                            this.fontFile = "";
                        }
                        else {
                            this.fontFile = await Editor.Message.request("asset-db", "query-path", tmfUUID);
                        }
                    },
                    onDynamicChanged(value) {
                        this.model.dynamic = value;
                    },
                    onPadTrimChanged(value) {
                        this.model.padTrim = value;
                    },
                    async onFontFileChanged(fontUUID) {
                        if (!fontUUID) {
                            this.$refs.fontFile.value = "";
                            this.model.tmfFontFile = "";
                            return;
                        }
                        let file = await Editor.Message.request("asset-db", "query-path", fontUUID);
                        if (!(0, utils_1.isTMFFile)(file)) {
                            console.error(this.I18N("text-mesh.messages.tmfFontFile_error"));
                            this._setTMFFile("");
                        }
                        else {
                            this._setTMFFile(fontUUID);
                            let fontStr = fs_extra_1.default.readFileSync(file, "utf-8");
                            let fontData = FontParser_1.FontParser.parse(fontStr);
                            this.model.charset = fontData.charset;
                            this.onTTFChanged(fontData.font);
                            this.model.fontFamily = fontData.fontFamily;
                            this.model.optFontSize = fontData.fontSize == 46 ? 1 : 2;
                            this.model.padding = fontData.padding;
                            this.model.padTrim = fontData.padTrim == 1;
                            this.model.atlas = fontData.atlas;
                            this.model.atlasWidth = fontData.atlasWidth;
                            this.model.atlasHeight = fontData.atlasHeight;
                            this.model.dynamic = fontData.dynamic == 1;
                            this.model.staticChannelCount = this.isNone(fontData.staticChannels) ? 3 : fontData.staticChannels;
                            this.model.enableAutoFree = this.isNone(fontData.enableAutoFree) ? true : fontData.enableAutoFree == 1;
                            this.model.offsetY = this.isNone(fontData.offsetY) ? 0 : fontData.offsetY;
                            this.model.normalWeight = this.isNone(fontData.normalWeight) ? 0.14 : fontData.normalWeight;
                            this.model.boldWeightScale = this.isNone(fontData.boldWeightScale) ? 1.2 : fontData.boldWeightScale;
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
                            this.model.usesystem_font = !this.model.fontFamily;
                        }
                    },
                    isNone(value) {
                        return value === null || value === undefined || Number.isNaN(value);
                    },
                    async checkInputs() {
                        if (this.model.usesystem_font) {
                            this.model.staticChannelCount = 0;
                            this.model.dynamic = true;
                            this.model.font = "";
                            this.model.fontFamily = this.$refs.fontFamily.value;
                        }
                        if (!this.model.usesystem_font && !this.model.font) {
                            console.error(this.I18N("text-mesh.messages.need_font"));
                            return false;
                        }
                        if (!this.model.charset && this.model.staticChannelCount != 0) {
                            console.error(this.I18N("text-mesh.messages.need_charset"));
                            return false;
                        }
                        this.isNewTMF = !this.model.tmfFontFile;
                        if (this.isNewTMF) {
                            let fontName = this.model.usesystem_font ? this.model.fontFamily : path_1.default.basename(this.ttfFile.replace(/\.ttf$/gi, ""));
                            let ret = await Editor.Dialog.save({
                                type: "file",
                                title: this.I18N("text-mesh.messages.save"),
                                path: path_1.default.join(Editor.Project.path, "assets", fontName + ".tmf.bin"),
                                extensions: ".bin",
                                filters: [{
                                        name: "TMF",
                                        extensions: ["tmf.bin"],
                                    }],
                            });
                            if (ret.canceled) {
                                return false;
                            }
                            fs_extra_1.default.writeFileSync(ret.filePath, settings_1.Settings.TMF_Prefix);
                            await Editor.Message.request("asset-db", "refresh-asset", ret.filePath);
                            let uuid = await Editor.Message.request("asset-db", "query-uuid", ret.filePath);
                            if (!uuid) {
                                console.error(this.I18N("text-mesh.messages.can_not_found_asset"));
                                return false;
                            }
                            this.$refs.fontFile.value = uuid;
                            this.model.tmfFontFile = uuid;
                            this.fontFile = ret.filePath;
                        }
                        return true;
                    },
                    _loadFont(fontPath, uuid) {
                        if (!fontPath) {
                            console.error(this.I18N("text-mesh.messages.need_font"));
                            return;
                        }
                        let fontName = path_1.default.basename(fontPath).replace(/\.ttf/gi, "");
                        const fontFamilyName = this.getFontFamily(fontName);
                        if (_fontFaces[fontFamilyName]) {
                            return fontFamilyName;
                        }
                        fontPath = fontPath.replace(/\\/g, "/");
                        const style = document.createElement("style");
                        style.attributes["type"] = "text/css";
                        style.attributes["rel"] = "stylesheet";
                        style.innerHTML = `
                                @font-face{
                                    font-family:'${fontFamilyName}';
                                    src:url('${fontPath}') format('truetype');
                                }
                            `;
                        document.head.appendChild(style);
                        const div = document.createElement("div");
                        div.style.fontFamily = fontFamilyName;
                        div.style.fontSize = "10px";
                        div.style.position = "absolute";
                        div.style.top = "-1000px";
                        div.style.left = "-1000px";
                        div.innerHTML = ".";
                        document.body.appendChild(div);
                        _fontFaces[fontFamilyName] = true;
                        return fontFamilyName;
                    },
                    getFontFamily(fontHandle) {
                        return fontHandle.toUpperCase() + "_TTF";
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
                    _initImageData(imageData) {
                        for (let i = 0; i < imageData.width; i++) {
                            for (let j = 0; j < imageData.height; j++) {
                                let index = (j * imageData.width + i) * 4;
                                // imageData.data[index] = 0;     
                                // imageData.data[index + 1] = 0; 
                                // imageData.data[index + 2] = 0;
                                imageData.data[index + 3] = 255;
                            }
                        }
                    },
                    _writeToImageData(x, y, glyhp, imageData, cid = 0) {
                        for (let i = 0; i < glyhp.width; i++) {
                            for (let j = 0; j < glyhp.height; j++) {
                                let index = ((j + y) * imageData.width + i + x) * 4;
                                if (i < glyhp.width && j < glyhp.height) {
                                    let value = glyhp.data[i + j * glyhp.width];
                                    imageData.data[index + cid] = value;
                                }
                                else {
                                    imageData.data[index + cid] = 0;
                                }
                                // imageData.data[index + 3] = 255;
                            }
                        }
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
                    saveImage(filename, base64Image) {
                        const base64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
                        const path = filename;
                        fs_extra_1.default.writeFileSync(path, base64, 'base64');
                    },
                    _isVisableChar(char) {
                        return char != "\r" && char != "\n";
                    },
                    _parseCode(code) {
                        code = code.replace(/\\u/g, "0x");
                        if (code.startsWith("0x")) {
                            return parseInt(code, 16);
                        }
                        return parseInt(code);
                    },
                    _parseCharset(data) {
                        let lines = data.split("\n");
                        let allChars = [
                            const_1.CharConst.RoundLine,
                            const_1.CharConst.RectLine,
                            const_1.CharConst.NoneChar,
                        ];
                        let charMap = {};
                        for (let i = 0; i < lines.length; i++) {
                            let line = lines[i];
                            if (line.startsWith("[R]")) {
                                let ranges = line.substring(3).split(",");
                                for (let ir = 0; ir < ranges.length; ir++) {
                                    let rangeStrs = ranges[ir].split("-");
                                    if (rangeStrs.length == 1) {
                                        let code = this._parseCode(rangeStrs[0]);
                                        if (!Number.isNaN(code)) {
                                            let char = String.fromCharCode(code);
                                            if (!charMap[char] && this._isVisableChar(char)) {
                                                allChars.push(char);
                                                charMap[char] = true;
                                            }
                                        }
                                        else if (rangeStrs[0] != "\r") {
                                            console.warn(this.I18N("text-mesh.messages.error_range_hex"), rangeStrs[0]);
                                        }
                                    }
                                    else if (rangeStrs.length == 2) {
                                        let scode = this._parseCode(rangeStrs[0]);
                                        let ecode = this._parseCode(rangeStrs[1]);
                                        if (!Number.isNaN(scode) && !Number.isNaN(ecode)) {
                                            for (let code = scode; code <= ecode; code++) {
                                                let char = String.fromCharCode(code);
                                                if (!charMap[char] && this._isVisableChar(char)) {
                                                    allChars.push(char);
                                                    charMap[char] = true;
                                                }
                                            }
                                        }
                                        else if (ranges[ir] != "\r") {
                                            console.warn(this.I18N("text-mesh.messages.error_range_hex"), ranges[ir]);
                                        }
                                    }
                                    else if (ranges[ir] != "\r") {
                                        console.warn(this.I18N("text-mesh.messages.error_range_hex"), ranges[ir]);
                                    }
                                }
                            }
                            else {
                                for (let i = 0; i < line.length; i++) {
                                    let char = line[i];
                                    if (char != null && char != "" && !charMap[char] && this._isVisableChar(char)) {
                                        allChars.push(char);
                                        charMap[char] = true;
                                    }
                                }
                            }
                        }
                        return allChars;
                    },
                    round(value, precision) {
                        var multiplier = Math.pow(10, precision || 0);
                        return Math.round(value * multiplier) / multiplier;
                    },
                    async writeTMF(writedRects, atlasUuid) {
                        let lines = [];
                        lines.push(settings_1.Settings.TMF_Prefix);
                        lines.push(`version=${package_json_1.default.version}`);
                        lines.push(`font=${this.model.font || ""}`);
                        lines.push(`atlas=${atlasUuid || ""}`);
                        lines.push(`charset=${this.model.charset}`);
                        lines.push(`fontFamily=${this.model.fontFamily ? this.model.fontFamily.replace('\r', '') : ""}`);
                        lines.push(`fontSize=${this.model.fontSize}`);
                        lines.push(`padding=${this.model.padding || 0}`);
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
                        for (let i = 0; i < writedRects.length; i++) {
                            let rect = writedRects[i];
                            let char = rect.data;
                            lines.push("char=" +
                                [
                                    rect.data.code,
                                    rect.channelID,
                                    rect.x,
                                    rect.y,
                                    rect.width,
                                    rect.height,
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
                        let tmf = await Editor.Message.request("asset-db", "query-path", this.model.tmfFontFile);
                        fs_extra_1.default.writeFileSync(tmf, lines.join("\n"));
                    },
                    async generateFont() {
                        if (!this.inGenerating) {
                            if (!await this.checkInputs()) {
                                return;
                            }
                            if (this.model.staticChannelCount > 0) {
                                let fontFamily = this._loadFont(this.ttfFile, this.model.font);
                                let tfFont = {
                                    fontFamily,
                                    fontSize: parseInt(this.model.fontSize),
                                    padding: parseInt(this.model.padding),
                                    textureWidth: parseInt(this.model.atlasWidth),
                                    textureHeight: parseInt(this.model.atlasHeight),
                                    padTrim: this.model.padTrim,
                                    dynamic: this.model.dynamic,
                                    staticChannelCount: parseInt(this.model.staticChannelCount),
                                };
                                this.getCanvas();
                                let charsetFile = "";
                                if (this.model.charset) {
                                    charsetFile = await Editor.Message.request("asset-db", "query-path", this.model.charset);
                                }
                                else {
                                    console.error(this.I18N("text-mesh.messages.need_charset"));
                                    return;
                                }
                                let charset = fs_extra_1.default.readFileSync(charsetFile, 'utf-8');
                                let allChars = this._parseCharset(charset);
                                this.inGenerating = true;
                                const options = {
                                    smart: true,
                                    pot: true,
                                    square: false,
                                    allowRotation: false,
                                    tag: false,
                                    border: 0
                                }; // Set packing options
                                let packer = new maxrects_packer_1.MaxRectsPacker(tfFont.textureWidth, tfFont.textureHeight, 2, options);
                                let unRecodeChars = [];
                                let len = allChars.length;
                                for (let i = 0; i < len; i++) {
                                    this.progress = i / len * 70;
                                    if (i % 100 == 0) {
                                        await (0, utils_1.wait)(10);
                                    }
                                    if (packer.bins.length <= this.model.staticChannelCount) {
                                        let code = allChars[i];
                                        if (code === "") {
                                            continue;
                                        }
                                        let glyph;
                                        if (code == const_1.CharConst.RectLine) {
                                            glyph = FontHelper_1.FontHelper.getRectLine(code, tfFont);
                                        }
                                        else if (code == const_1.CharConst.RoundLine) {
                                            glyph = FontHelper_1.FontHelper.getRoundLine(code, tfFont);
                                        }
                                        else if (code == const_1.CharConst.NoneChar) {
                                            glyph = FontHelper_1.FontHelper.getNoneChar(code, tfFont);
                                        }
                                        else {
                                            glyph = FontHelper_1.FontHelper.createSDFChar(code, tfFont);
                                        }
                                        //@ts-ignore
                                        glyph.code = allChars[i];
                                        packer.add(glyph.width, glyph.height, glyph);
                                        if (!this.inGenerating) {
                                            break;
                                        }
                                    }
                                    else {
                                        unRecodeChars.push(allChars[i]);
                                    }
                                }
                                let writedRects = [];
                                if (this.inGenerating) {
                                    packer.repack(false);
                                    let imageData = _context.createImageData(tfFont.textureWidth, tfFont.textureHeight);
                                    this._initImageData(imageData);
                                    let count = 0;
                                    for (let iB = 0; iB < packer.bins.length; iB++) {
                                        let bin = packer.bins[iB];
                                        for (let iR = 0; iR < bin.rects.length; iR++) {
                                            let rect = bin.rects[iR];
                                            if (iB < this.model.staticChannelCount) {
                                                this._writeToImageData(rect.x, rect.y, rect.data, imageData, iB);
                                                count++;
                                                this.progress = count / len * 30 + 70;
                                                //@ts-ignore
                                                rect.channelID = iB;
                                                writedRects.push(rect);
                                            }
                                            else {
                                                unRecodeChars.push(rect.data.code);
                                            }
                                            if (!this.inGenerating) {
                                                break;
                                            }
                                        }
                                        if (!this.inGenerating) {
                                            break;
                                        }
                                    }
                                    if (this.inGenerating) {
                                        _context.putImageData(imageData, 0, 0);
                                        var base64 = await this.canvasEncodeTexture(_canvas);
                                        let name = path_1.default.basename(this.fontFile.replace(/\.bin$/gi, ""));
                                        let atlasFilename = path_1.default.join(path_1.default.dirname(this.fontFile), name + ".png");
                                        if (this.model.staticChannelCount > 0) {
                                            this.saveImage(atlasFilename, base64);
                                            await Editor.Message.request("asset-db", "refresh-asset", atlasFilename);
                                            let atlasUuid = await Editor.Message.request("asset-db", "query-uuid", atlasFilename);
                                            await Editor.Message.request("asset-db", "refresh-asset", atlasUuid);
                                            this.model.fontFamily = fontFamily;
                                            this.writeTMF(writedRects, atlasUuid);
                                            for (let i = 0; i < this.model.staticChannelCount; i++) {
                                                this.genChannelImage(imageData, i, atlasUuid);
                                            }
                                        }
                                        else {
                                            if (fs_extra_1.default.existsSync(atlasFilename)) {
                                                fs_extra_1.default.unlinkSync(atlasFilename);
                                            }
                                            this.writeTMF([], null);
                                        }
                                    }
                                    if (unRecodeChars.length > 0) {
                                        console.warn("Need More Space, Unencode chars:", unRecodeChars);
                                    }
                                    else {
                                        console.log("Generate Success");
                                    }
                                }
                            }
                            else {
                                this.writeTMF([], null);
                                console.log("Generate Success");
                            }
                            this.inGenerating = false;
                        }
                        else {
                            this.inGenerating = false;
                        }
                    },
                    async genChannelImage(imageData, channelID, uuid) {
                        let tempDir = path_1.default.join(Editor.Project.tmpDir, "text-mesh");
                        if (!fs_extra_1.default.existsSync(tempDir)) {
                            fs_extra_1.default.mkdirSync(tempDir);
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
                    }
                },
                computed: {
                    auto_font_size() {
                        return this.optFontSize == 1;
                    }
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
