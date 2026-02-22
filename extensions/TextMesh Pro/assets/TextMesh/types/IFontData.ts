import { Texture2D } from "cc";
import { Char, CharSet } from "../font/Char";
import { ITMFont } from "./ITMFont";
import { GlyphInfo } from "./types";

export interface IFontData {
    tmFont: ITMFont;
    texture: Texture2D;
    spaceSize: number;
    safePadding: number;
    enableAutoFree: boolean;

    initial(): void;
    getCharInfo(code: string, charRender?:(code: string, tmFont: ITMFont) => GlyphInfo): Char;
    getRoundLine(): Char;
    getRectLine(): Char;
    removeDynamicChar(code: string): void;
}