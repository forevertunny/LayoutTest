"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const cc_1 = require("cc");
const cc_2 = __importDefault(require("cc"));
const _regions = [new cc_1.gfx.BufferTextureCopy()];
class Utils {
    static readTexturePixels(src, rect, buffer) {
        rect = rect || new cc_1.Rect(0, 0, src.width, src.height);
        rect.x = Math.floor(rect.x);
        rect.y = Math.floor(rect.y);
        rect.width = Math.floor(rect.width);
        rect.height = Math.floor(rect.height);
        const gfxTexture = src.getGFXTexture();
        if (!gfxTexture) {
            (0, cc_1.errorID)(7606);
            return null;
        }
        const needSize = 4 * rect.width * rect.height;
        if (buffer === undefined) {
            buffer = new Uint8Array(needSize);
        }
        else if (buffer.length < needSize) {
            (0, cc_1.errorID)(7607, needSize);
            return null;
        }
        const bufferViews = [];
        const regions = [];
        const region0 = new cc_1.gfx.BufferTextureCopy();
        region0.texOffset.x = rect.x;
        region0.texOffset.y = rect.y;
        region0.texExtent.width = rect.width;
        region0.texExtent.height = rect.height;
        regions.push(region0);
        bufferViews.push(buffer);
        const gfxDevice = src["_getGFXDevice"]();
        gfxDevice === null || gfxDevice === void 0 ? void 0 : gfxDevice.copyTextureToBuffers(gfxTexture, bufferViews, regions);
        return buffer;
    }
    static uploadData(target, source, rect, level = 0, arrayIndex = 0) {
        let gfxTexture = target.getGFXTexture();
        //@ts-ignore
        if (!gfxTexture || target._mipmapLevel <= level) {
            return;
        }
        //@ts-ignore
        const gfxDevice = target._getGFXDevice();
        if (!gfxDevice) {
            return;
        }
        const region = _regions[0];
        if (rect) {
            region.texOffset.x = rect.x;
            region.texOffset.y = rect.y;
            //@ts-ignore
            region.texExtent.width = rect.width >> level;
            //@ts-ignore
            region.texExtent.height = rect.height >> level;
        }
        else {
            region.texOffset.x = 0;
            region.texOffset.y = 0;
            //@ts-ignore
            region.texExtent.width = target._textureWidth >> level;
            //@ts-ignore
            region.texExtent.height = target._textureHeight >> level;
        }
        region.texSubres.mipLevel = level;
        region.texSubres.baseArrayLayer = arrayIndex;
        if (cc_2.default.DebugMode) {
            if (source instanceof HTMLElement) {
                if (source.height > region.texExtent.height
                    || source.width > region.texExtent.width) {
                    (0, cc_1.error)(`Image source(${target.name}) bounds override.`);
                }
            }
        }
        if (ArrayBuffer.isView(source)) {
            gfxDevice.copyBuffersToTexture([source], gfxTexture, _regions);
        }
        else {
            gfxDevice.copyTexImagesToTexture([source], gfxTexture, _regions);
        }
    }
    static until(condition) {
        return new Promise((resolve, reject) => {
            let func = () => {
                if (condition()) {
                    cc_1.director.off(cc_1.Director.EVENT_BEGIN_FRAME, func, this);
                    resolve();
                }
            };
            cc_1.director.on(cc_1.Director.EVENT_BEGIN_FRAME, func, this);
        });
    }
}
exports.Utils = Utils;
