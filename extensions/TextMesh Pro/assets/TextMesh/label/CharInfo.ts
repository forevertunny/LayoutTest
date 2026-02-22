import { Color, Pool, __private } from "cc";
import { TMFont } from "../font/TMFont";
import { Char } from "../font/Char";
import { TextStyle } from "./TextStyle";
import { Slot, Clickable } from "./LayoutTypes";
import { ETMQuadType } from "../vertex/ETMQuadType";

export class CharVertex {
    x: number = 0;
    y: number = 0;
    z: number = 0;

    // real x
    rx: number = 0;
    // real y
    ry: number = 0;

    worldX: number = 0;
    worldY: number = 0;
    worldZ: number = 0;

    scale: number = 1;
    rot: number = 0;

    u: number = 0;
    v: number = 0;
    u1: number = 0;
    v1: number = 0;

    uw: number = 0;
    vh: number = 0;

    type: ETMQuadType = ETMQuadType.Char;
}
let _charVertexPool = new Pool(() => new CharVertex(), 128);

export class CharInfo {
    index: number = 0;
    font: TMFont;
    blendMode: number;
    char: Char;
    visible: boolean = true;
    dirty: boolean = true;

    style: TextStyle;

    /**
     * 顶点坐标：左下、右下、左上、右上
     */
    vertexData: CharVertex[] = [];

    alpha: number;

    x: number;
    y: number;
    // 底部Y位置
    baseY: number;
    // 顶部Y开始位置
    startY: number;

    rotate?: boolean;

    ascent: number = 0;
    descent: number = 0;
    realWidth: number = 0;
    realHeight: number = 0;
    fontSize: number = 0;

    offsetX: number = 0;
    offsetY: number = 0;
    fixedOffsetY:number = 0;

    w: number = 0;
    h: number = 0;

    glyphLeft: number = 0;
    // 文字范围到最右边的距离
    glyphRight: number = 0;

    // 基线上倾斜宽度
    sw: number = 0;
    // 基线下倾斜宽度
    sw1: number = 0;
    cjk: boolean = null;
    scale: number = 1;
    slot: Slot = null;
    click: Clickable = null;

    // 行号
    line: number = 0;
    // 行内编号
    inline: number = 0;

    visibleChar: boolean = true;

    shadowChar: CharInfo = null;

    addVertex() {
        let vertex = _charVertexPool.alloc();
        this.vertexData.push(vertex);
        return vertex;
    }

    copyFrom(charInfo: CharInfo) {
        this.index = charInfo.index;
        this.dirty = true;
        this.font = charInfo.font;
        this.blendMode = charInfo.blendMode;
        this.char = charInfo.char;
        this.visible = charInfo.visible;
        this.style = charInfo.style;
        this.alpha = charInfo.alpha;
        this.x = charInfo.x;
        this.y = charInfo.y;
        this.startY = charInfo.startY;
        this.baseY = charInfo.baseY;
        this.rotate = charInfo.rotate;
        this.ascent = charInfo.ascent;
        this.descent = charInfo.descent;
        this.realWidth = charInfo.realWidth;
        this.realHeight = charInfo.realHeight;
        this.fontSize = charInfo.fontSize;
        this.offsetX = charInfo.offsetX;
        this.offsetY = charInfo.offsetY;
        this.w = charInfo.w;
        this.h = charInfo.h;
        this.glyphLeft = charInfo.glyphLeft;
        this.glyphRight = charInfo.glyphRight;
        this.sw = charInfo.sw;
        this.sw1 = charInfo.sw1;
        this.cjk = charInfo.cjk;
        this.scale = charInfo.scale;
        this.slot = charInfo.slot;
        this.click = charInfo.click;
        this.line = charInfo.line;
        this.inline = charInfo.inline;
        this.visibleChar = charInfo.visibleChar;
        this.fixedOffsetY = charInfo.fixedOffsetY;
    }

    clear() {
      if(this.style.shadow > 0 && !this.shadowChar) {
        this.shadowChar = CharInfoPool.alloc();
        this.shadowChar.copyFrom(this);
      }else if(this.shadowChar) {
        putCharInfoToPool(this.shadowChar);
        this.shadowChar = null;
      }
    }

    reset() {
      resetCharInfo(this, false);
    }
  }

  var CharInfoPool = new Pool(()=>new CharInfo(), 128);
  export function putCharInfoToPool(charInfo: CharInfo) {
    charInfo.font?.freeChar(charInfo.char);
    
    for(let i=0;i<charInfo.vertexData.length;i++) {
      _charVertexPool.free(charInfo.vertexData[i]);
    }
    charInfo.vertexData.length = 0;
    CharInfoPool.free(charInfo);   

    if(charInfo.shadowChar) {
      putCharInfoToPool(charInfo.shadowChar);
      charInfo.shadowChar = null;
    }
  }

  export function getCharInfoFromPool() {
    let charInfo = CharInfoPool.alloc();
    resetCharInfo(charInfo);
    return charInfo;
  }

  export function resetCharInfo(charInfo: CharInfo, clearAll = true) {    
    if(!clearAll) {
      for(let i=0;i<charInfo.vertexData.length;i++) {
        _charVertexPool.free(charInfo.vertexData[i]);
      }
      charInfo.vertexData.length = 0;      
      charInfo.cjk = null; 
      return;     
    }
    
    charInfo.char = null;
    charInfo.style = null;
    charInfo.slot = null;
    charInfo.click = null;
    charInfo.index = 0;
    charInfo.font = null;
    charInfo.blendMode = 0;
    charInfo.alpha = 1;
    charInfo.x = 0;
    charInfo.y = 0;
    charInfo.baseY = 0;
    charInfo.rotate = false;
    charInfo.realWidth = 0;
    charInfo.realHeight = 0;
    charInfo.fontSize = 0;
    charInfo.offsetX = 0;
    charInfo.offsetY = 0;
    charInfo.w = 0;
    charInfo.h = 0;
    charInfo.glyphLeft = 0;
    charInfo.glyphRight = 0;
    charInfo.sw = 0;
    charInfo.sw1 = 0;
    charInfo.scale = 1;
    charInfo.line = 0;
    charInfo.inline = 0;
    charInfo.vertexData.length = 0;
    charInfo.visibleChar = true;
    charInfo.shadowChar = null;
    charInfo.fixedOffsetY = 0;
    charInfo.visible = true;
    charInfo.startY = 0;
    charInfo.ascent = 0;
    charInfo.descent = 0;
    charInfo.cjk = null;
}