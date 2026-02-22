"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Char = void 0;
class Char {
    constructor() {
        this.code = "";
        /**
         * 左下，右下，左上，右上
         */
        this.uvs = new Float32Array;
        this.glyphWidth = 0;
        this.glyphHeight = 0;
        this.glyphAdvance = 0;
        this.glyphRight = 0;
        this.glyphLeft = 0;
        this.width = 0;
        this.height = 0;
        this.size = 0;
        this.ascent = 0;
        this.descent = 0;
        /**
         * channel id[0,3]
         */
        this.cid = 0;
    }
}
exports.Char = Char;
