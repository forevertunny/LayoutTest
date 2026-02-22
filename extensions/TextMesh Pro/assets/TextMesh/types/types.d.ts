import { Char } from "../font/Char";
import { CharInfo } from "../label/CharInfo";

type GlyphInfo = {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    size: number;
    glyphWidth: number;
    glyphHeight: number;
    glyphLeft: number;
    glyphRight: number;
    glyphAdvance: number;
    ascent: number;
    descent: number;
    scale: number;
}

type SpaceInfo = {
    index: number;
    cid: number;
    row: number;
    col: number;
    width: number;
    height: number;
    x: number;
    y: number;
    char: Char;
}

type HitTestResult = {
    result?: boolean;
    accurate?: boolean;
    charInfo?: CharInfo;
}