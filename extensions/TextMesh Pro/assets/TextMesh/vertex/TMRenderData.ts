import { Color, IRenderData, Pool } from "cc";
import { Char } from "../font/Char";
import { CharInfo, putCharInfoToPool } from "../label/CharInfo";
import { TextStyle } from "../label/TextStyle";
import { ETMQuadType } from "./ETMQuadType";

export class TMRenderData implements IRenderData {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    u: number = 0;
    v: number = 0;
    u1: number = 0;
    v1: number = 0;

    color: Color = Color.WHITE.clone();

    textureId: number = 0;

    // 边线宽度
    stroke: number = 0;
    strokeBlur: number = 0.1;

    // fill
    fill = 0.2;

    // 边线颜色
    strokeColor: Color = new Color(0, 255, 255, 255);
    // 影子颜色
    shadowColor: Color = new Color(128, 128, 128, 255);
    
    // 影子宽度
    shadow: number = 0;
    shadowBlur: number = 0;
    shadowOffsetX: number = 1;
    shadowOffsetY: number = 0.1;

    char: Char = null;
    type: ETMQuadType = ETMQuadType.Char;
    style: TextStyle;
}

export var TMRenderDataPool = new Pool(() => new TMRenderData(), 128);
export type TMRenderDataArray = TMRenderData[];

export class TMQuadRenderData {
    charInfo: CharInfo = null;
    type: ETMQuadType = ETMQuadType.Char;
    startIndex: number;
    endIndex: number;
    length: number;
    height: number;
    maxHeight: number;

    reset() {
        this.charInfo = null;
        this.type = ETMQuadType.Char;
        this.startIndex = 0;
        this.endIndex = 0;
        this.length = 0;
        this.height = 0;
        this.maxHeight = 0;
    }
}

export var TMQuadRenderDataPool = new Pool(()=>new TMQuadRenderData, 10);
export var putTMQuadRenderDataToPool = (quad: TMQuadRenderData) => {
    if(quad.charInfo) {
        putCharInfoToPool(quad.charInfo);
    }
    quad.reset();
    TMQuadRenderDataPool.free(quad);
}