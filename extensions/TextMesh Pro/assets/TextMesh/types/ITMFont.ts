import { TTFFont } from "cc";
import { Char } from "../font/Char";
import { IFontData } from "./IFontData";

export interface ITMFont {
    font: TTFFont;
    fontFamily: string;
    fontSize: number;
    padding: number;
    // 是否裁剪padding
    padTrim: boolean;
    textureWidth: number;
    textureHeight: number;
    // 静态通道数量
    staticChannels: number;
    fontData: IFontData;
    dynamic: boolean;    

    underLineOffset?: number;
    keepUnlderLineSpace?: boolean;
    underLineThickness?: number;
    strikeOffset?: number;
    strikeThickness?: number;
    scriptThickness?: number;
    
    getCharInfo(code: string): Char;
}