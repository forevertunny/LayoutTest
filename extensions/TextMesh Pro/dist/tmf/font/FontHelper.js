"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontHelper = void 0;
const tinysdf_1 = __importDefault(require("../libs/tinysdf"));
const const_1 = require("./const");
class FontHelper {
    static getSDF(tmFont) {
        let size = `${tmFont.fontFamily}_${tmFont.fontSize}_${tmFont.padding}_${tmFont.dynamic ? 1 : 0}`;
        if (this._sdfs[size]) {
            return this._sdfs[size];
        }
        return this._sdfs[size] = new tinysdf_1.default({
            fontSize: tmFont.fontSize,
            fontFamily: this.getFontFamily(tmFont),
            buffer: tmFont.padding
        });
    }
    static getFontFamily(tmFont) {
        return tmFont.fontFamily || 'Arial';
    }
    static getKey(code, tmFont) {
        return `${tmFont.fontFamily}_${code}`;
    }
    static createSDFChar(code, tmFont) {
        let sdf = this.getSDF(tmFont);
        return sdf.draw(code, this.getFontFamily(tmFont));
    }
    static getRoundLine(code, tmFont) {
        let sdf = this.getSDF(tmFont);
        let scale = 1;
        let info = sdf.draw(const_1.CharConst.RoundLine, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
            ctx.clearRect(0, 0, width, height);
            let lineHeight = (height - tmFont.padding * 2) * scale;
            let half = lineHeight / 2;
            ctx.lineCap = "round";
            ctx.strokeStyle = "white";
            ctx.lineWidth = lineHeight;
            ctx.beginPath();
            ctx.moveTo(sx, sy + half);
            ctx.lineTo(width, sy + half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        return info;
    }
    static getRectLine(code, tmFont) {
        let sdf = this.getSDF(tmFont);
        let scale = 1;
        let info = sdf.draw(const_1.CharConst.RoundLine, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
            ctx.clearRect(0, 0, width, height);
            let lineHeight = (height - tmFont.padding * 2) * scale;
            let half = lineHeight / 2;
            ctx.lineCap = "butt";
            ctx.strokeStyle = "white";
            ctx.lineWidth = lineHeight;
            ctx.beginPath();
            ctx.moveTo(sx, sy + half);
            ctx.lineTo(width, sy + half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        return info;
    }
    static getNoneChar(code, tmFont) {
        let sdf = this.getSDF(tmFont);
        let scale = 0.15;
        let info = sdf.draw(code, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
            ctx.clearRect(0, 0, width, height);
            let lineHeight = (height - tmFont.padding * 2) * scale;
            let half = lineHeight / 2;
            ctx.lineCap = "butt";
            ctx.strokeStyle = "white";
            ctx.lineWidth = lineHeight;
            ctx.beginPath();
            ctx.moveTo(half, half);
            ctx.lineTo(width - half, half);
            ctx.lineTo(width - half, height - half);
            ctx.lineTo(half, height - half);
            ctx.lineTo(half, half);
            ctx.lineTo(width - half, height - half);
            ctx.moveTo(width - half, half);
            ctx.lineTo(half, height - half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        return info;
    }
}
exports.FontHelper = FontHelper;
FontHelper._sdfs = {};
