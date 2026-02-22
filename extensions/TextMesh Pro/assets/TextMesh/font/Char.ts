import { IChar } from "../types/IChar";
import { TMFCharInfo, TMFontInfo } from "./FontParser";

export class Char implements IChar{
    static: boolean = false;
    
    code: string = "";
    ref: number = 0;
    index: number = 0;
    
    /**
     * 左下，右下，左上，右上
     */
    uvs: Float32Array = new Float32Array;
    glyphWidth: number = 0;
    glyphHeight: number = 0;
    glyphAdvance: number = 0;
    glyphRight: number = 0;
    glyphLeft: number = 0;
    width: number = 0;
    height: number = 0;
    size: number = 0;
    ascent: number = 0;
    descent: number = 0;
    scale: number = 0;
    /**
     * channel id[0,3]
     */
    cid: number = 0;

    static fromTMFCharInfo(code: string, tmfFont: TMFontInfo, charInfo: TMFCharInfo) {
        let char = new Char;
        char.code = code;
        let u0 = charInfo.x / tmfFont.atlasWidth;
        let v0 = charInfo.y / tmfFont.atlasHeight;
        let u1 = (charInfo.x + charInfo.width) / tmfFont.atlasWidth;
        let v1 = (charInfo.y + charInfo.height) / tmfFont.atlasHeight;
        char.uvs = new Float32Array([u0, v0, u1, v0, u0, v1, u1, v1]);
        char.glyphWidth = charInfo.glyphWidth;
        char.glyphHeight = charInfo.glyphHeight;
        char.glyphAdvance = charInfo.glyphAdvance;
        char.glyphRight = charInfo.glyphRight;
        char.glyphLeft = charInfo.glyphLeft;
        char.width = charInfo.width;
        char.height = charInfo.height;
        char.size = charInfo.size;
        char.ascent = charInfo.ascent;
        char.descent = charInfo.descent;
        char.scale = charInfo.scale;
        char.cid = charInfo.channelID;
        return char;
    }
}

export type CharSet = { [code: string]: Char };