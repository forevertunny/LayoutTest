import TinySDF from "../libs/tinysdf";
import { ITMFont } from "../types/ITMFont";
import { GlyphInfo } from "../types/types";
import { CharConst } from "./const";

export class FontHelper {
    private static _sdfs: {[key:string]:TinySDF} = {};
    static getSDF(tmFont: ITMFont): TinySDF {
        let fontFamily = this.getFontFamily(tmFont);
        let key = `${fontFamily}_${tmFont.fontSize}_${tmFont.padding}`;

        if(this._sdfs[key]) {
            return this._sdfs[key];
        }

        return this._sdfs[key] = new TinySDF({
            fontSize: tmFont.fontSize, 
            fontFamily: fontFamily,
            buffer: tmFont.padding,
            trimBuffer: tmFont.padTrim,
        });
    }

    private static getFontFamily(tmFont: ITMFont): string {
        if(tmFont["_finalFontFamily"]) {
            return tmFont["_finalFontFamily"];
        }

        let fontFamily = tmFont.font?._nativeAsset || tmFont.font?._fontFamily || tmFont.fontFamily || 'Arial';
        tmFont["_finalFontFamily"] = fontFamily;
        return fontFamily;
    }

    static getKey(code: string, tmFont: ITMFont): string {
        return `${tmFont.font.name}_${code}`;
    }

    static createSDFChar(code: string, tmFont: ITMFont): GlyphInfo {
        let sdf = this.getSDF(tmFont);
        return sdf.draw(code, this.getFontFamily(tmFont));
    }

    static getRoundLine(code: string, tmFont: ITMFont): GlyphInfo {
        let sdf = this.getSDF(tmFont);
        let scale = 1;
        let info = sdf.draw(CharConst.RoundLine, this.getFontFamily(tmFont), CharConst.MeasureText, (canvas, ctx, width, height, sx, sy)=>{
            ctx.clearRect(0, 0, width, height);

            let lineHeight = (height-tmFont.padding*2) * scale;
            let half = lineHeight/2;

            ctx.lineCap="round";
            ctx.strokeStyle="white" ;
            ctx.lineWidth = lineHeight;

            ctx.beginPath();
            ctx.moveTo(sx, sy+half);
            ctx.lineTo(width, sy+half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        
        return info;
    }

    static getRectLine(code: string, tmFont: ITMFont): GlyphInfo {
        let sdf = this.getSDF(tmFont);
        let scale = 1;
        let info = sdf.draw(CharConst.RoundLine, this.getFontFamily(tmFont), CharConst.MeasureText, (canvas, ctx, width, height, sx, sy)=>{
            ctx.clearRect(0, 0, width, height);

            let lineHeight = (height-tmFont.padding*2) * scale;
            let half = lineHeight/2;

            ctx.lineCap="butt";
            ctx.strokeStyle="white";
            ctx.lineWidth = lineHeight; 

            ctx.beginPath();
            ctx.moveTo(sx, sy+half);  
            ctx.lineTo(width, sy+half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        
        return info;
    }

    static getNoneChar(code: string, tmFont: ITMFont): GlyphInfo {
        let sdf = this.getSDF(tmFont);
        let scale = 0.15;
        let info = sdf.draw(code, this.getFontFamily(tmFont), CharConst.MeasureText, (canvas, ctx, width, height, sx, sy)=>{
            ctx.clearRect(0, 0, width, height);

            let lineHeight = (height-tmFont.padding*2) * scale;
            let half = lineHeight/2;

            ctx.lineCap="butt";
            ctx.strokeStyle="white";
            ctx.lineWidth = lineHeight; 

            ctx.beginPath();
            ctx.moveTo(half, half);  
            ctx.lineTo(width-half, half);
            ctx.lineTo(width-half, height-half);
            ctx.lineTo(half, height-half);
            ctx.lineTo(half, half);            
            ctx.lineTo(width-half, height-half);
            ctx.moveTo(width-half, half);
            ctx.lineTo(half, height-half);
            ctx.closePath();
            ctx.stroke();
        }, true);
        
        return info;
    }
}