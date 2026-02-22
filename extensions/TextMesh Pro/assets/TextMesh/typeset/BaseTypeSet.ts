import { TextMeshLabel } from "../label/TextMeshLabel";
import { CharInfo, getCharInfoFromPool } from "../label/CharInfo";
import { TMQuadRenderDataPool } from "../vertex/TMRenderData";
import { ITypeSet, LayoutResult } from "../types/ITypeSet";
import { Vec2 } from "cc";
import { HitTestResult } from "../types/types";
import { ETMQuadType } from "../vertex/ETMQuadType";
import { ETextOverflow } from "db://text-mesh/label/types";

class AddtiveLineInfo {
    startIndex: number = -1;
    lineLength: number = 0;
    lineHeight: number = 0;
    boundHeight: number = 0;
    startY: number = 0;
    existInLine: boolean = false;

    reset() {
        this.startIndex = -1;
        this.lineLength = 0;
        this.lineHeight = 0;
        this.boundHeight = 0;
        this.existInLine = false;
        this.startY = 0;
    }
}

type BeginUpdateHandler = (comp: TextMeshLabel, index: number, newLine: boolean)=>void;
type EndUpdateHandler = (comp: TextMeshLabel, index: number)=>void;

export class BaseTypeSet implements ITypeSet {
    protected hitTestResult: {
        result?: boolean;
        accurate?: boolean,
        charInfo?: CharInfo
    } = {};
    
    protected breakLineInfo: {
        lineIndex?: number,
        index?: number,
        lineHeight?: number,
        maxDescent?: number;
        maxAscent?: number;
        maxHeight?: number;
    } = {
        lineIndex:-1,
        /**break index */
        index:-1,
        lineHeight: 0,
        maxDescent: 0,
        maxAscent: 0,
        maxHeight: 0,
    };

    protected underLineInfo = new AddtiveLineInfo();
    protected strikeInfo = new AddtiveLineInfo();
    protected backgroundInfo = new AddtiveLineInfo();
    protected maskInfo = new AddtiveLineInfo();

    protected beginUpdateHandlers: BeginUpdateHandler[] = [];
    protected endUpdateHandlers: EndUpdateHandler[] = [];

    constructor() {
        this.registUpdates();
    }

    protected registUpdates() {
        this.beginUpdateHandlers = [
            this.updateUnderLineInBegin,
            this.updateStrickInBegin,
            this.updateBackgroundInBegin,
            this.updateMaskInBegin,
        ];

        this.endUpdateHandlers = [
            this.updateUnderLineInEnd,
            this.updateStrickInEnd,
            this.updateBackgroundInEnd,
            this.updateMaskInEnd,
        ];
    }

    hitTest(comp: TextMeshLabel, touchPos: Vec2): HitTestResult {       
        return null;
    }

    layout(comp: TextMeshLabel): LayoutResult {
        return null;
    }

    measure(comp: TextMeshLabel, fontSize: number): { width: number; height: number; } {
        return { width: 0, height: 0 };
    }

    protected reset() {
        this.underLineInfo.reset();
        this.strikeInfo.reset();
        this.backgroundInfo.reset();
        this.maskInfo.reset();
    }

    protected getWidth(comp: TextMeshLabel, sidx: number, eidx: number) {
        let schar = comp.charInfos[sidx];
        let echar = comp.charInfos[eidx];

        // 處理末尾空格不計入寬度的邏輯
        if(eidx > sidx && echar.char.code == " ") {
            echar = comp.charInfos[eidx-1];
        }

        // 【核心修正】：使用字元的邏輯終點 (x + w) 減去 起點 (x)
        // 這樣才能包含字體設計完整的 Advance Width，而非僅僅是「墨水部分」
        let width = (echar.x + echar.w) - schar.x;

        // 如果是斜體，補償最後一個字元的傾斜溢出
        if (echar.style.italic) {
            width += echar.sw;
        }

        return width;
    }

    private calcLineInfo(comp: TextMeshLabel, line: AddtiveLineInfo, charInfo: CharInfo) {
        if(line.startIndex >= 0) {
            line.lineLength += charInfo.w;
            if(charInfo.visibleChar) {
                if(comp.fixedLineHeight) {
                    line.lineHeight = comp.lineHeight;
                }else{
                    line.lineHeight = Math.max(line.lineHeight, charInfo.h);
                }
            }
        }
    }

    /***********underline**************/
    private appendUnderLineData(comp: TextMeshLabel, startIndex: number, endIndex: number) {
        if(startIndex >= 0 && endIndex >= startIndex) {
            let length = this.getWidth(comp, startIndex, endIndex);
            if(length <= 0) {
                return;
            }

            let rt = TMQuadRenderDataPool.alloc();
            if(!rt.charInfo) {
                rt.charInfo = getCharInfoFromPool();                
            }
            rt.charInfo.char = comp.font.fontData.getRoundLine();
            rt.charInfo.style = comp.charInfos[startIndex].style;            

            rt.startIndex = startIndex;
            rt.endIndex = endIndex;
            rt.type = ETMQuadType.UnderLine;
            rt.length = length;
            rt.height = this.underLineInfo.lineHeight;
            rt.maxHeight = this.breakLineInfo.maxHeight;
            comp.underLineInfos.push(rt);
        }
    }

    protected updateUnderLineInBegin(comp: TextMeshLabel, index: number, newLine: boolean) {
        const chars = comp.charInfos;
        const charInfo = chars[index];
        if(!newLine) {
            if(this.underLineInfo.startIndex >= 0) {
                // 判断是否需要添加下划线
                let pv = chars[index-1];
                if(pv.style.underline != charInfo.style.underline) {
                    this.appendUnderLineData(comp, this.underLineInfo.startIndex, index-1);
                    this.underLineInfo.lineLength = 0;
                    this.underLineInfo.startIndex = -1;
                }
            }
        }

        if(this.underLineInfo.startIndex < 0 && charInfo.style.underline) {
            this.underLineInfo.startIndex = index;                
            this.underLineInfo.existInLine = true;
        }

        this.calcLineInfo(comp, this.underLineInfo, charInfo);
    }

    protected updateUnderLineInEnd(comp: TextMeshLabel, index: number) {
        const chars = comp.charInfos;
        const charInfo = chars[index];

        if(this.underLineInfo.startIndex >= 0) {
            this.underLineInfo.lineLength += charInfo.sw;
            this.appendUnderLineData(comp, this.underLineInfo.startIndex, index);
        }

        this.underLineInfo.reset();
    }
    /**************deleteline******************/  

    private appendStrickData(comp: TextMeshLabel, startIndex: number, endIndex: number) {
        if(startIndex >= 0 && endIndex >= startIndex) {
            let length = this.getWidth(comp, startIndex, endIndex);
            if(length <= 0) {
                return;
            }

            let rt = TMQuadRenderDataPool.alloc();
            if(!rt.charInfo) {
                rt.charInfo = getCharInfoFromPool();                
            }
            rt.charInfo.char = comp.font.fontData.getRoundLine();
            rt.charInfo.style = comp.charInfos[startIndex].style;

            rt.startIndex = startIndex;
            rt.endIndex = endIndex;
            rt.type = ETMQuadType.DeleteLine;
            rt.length = length;
            rt.height = this.strikeInfo.lineHeight;
            rt.maxHeight = this.breakLineInfo.maxHeight;
            comp.strikeInfos.push(rt);
        }
    }

    protected updateStrickInBegin(comp: TextMeshLabel, index: number, newLine: boolean) {
        const chars = comp.charInfos;
        const charInfo = chars[index];
        if(!newLine) {
            if(this.strikeInfo.startIndex >= 0) {
                // 判断是否需要添加刪除线
                let pv = chars[index-1];
                if(pv.style.strike != charInfo.style.strike || pv.style.strike == charInfo.style.strike && pv.style.fontSize != charInfo.style.fontSize) {
                    this.appendStrickData(comp, this.strikeInfo.startIndex, index-1);
                    this.strikeInfo.lineLength = 0;
                    this.strikeInfo.startIndex = -1;
                }
            }
        }

        if(this.strikeInfo.startIndex < 0 && charInfo.style.strike) {
            this.strikeInfo.startIndex = index;                
            this.strikeInfo.existInLine = true;
        }

        this.calcLineInfo(comp, this.strikeInfo, charInfo);
    }

    protected updateStrickInEnd(comp: TextMeshLabel, index: number) {
        const chars = comp.charInfos;
        const charInfo = chars[index];

        if(this.strikeInfo.startIndex >= 0) {
            this.strikeInfo.lineLength += charInfo.sw;
            this.appendStrickData(comp, this.strikeInfo.startIndex, index);
        }

        this.strikeInfo.reset();
    }
    
    /*************background*******************/
    private appendBackgroundData(comp: TextMeshLabel, startIndex: number, endIndex: number) {
        if(startIndex >= 0 && endIndex >= startIndex) {
            let length = this.getWidth(comp, startIndex, endIndex);
            if(length <= 0) {
                return;
            }

            let rt = TMQuadRenderDataPool.alloc();
            if(!rt.charInfo) {
                rt.charInfo = getCharInfoFromPool();                
            }
            rt.charInfo.char = comp.font.fontData.getRectLine();
            rt.charInfo.style = comp.charInfos[startIndex].style.clone();
            rt.charInfo.style.font = comp.font;
            rt.charInfo.style.setFillColor(comp.backgroundColor);
            rt.charInfo.style.setDilate(1, true);

            rt.startIndex = startIndex;
            rt.endIndex = endIndex;
            rt.type = ETMQuadType.Background;
            rt.length = length;
            rt.height = this.backgroundInfo.lineHeight;
            rt.maxHeight = this.breakLineInfo.maxHeight;
            comp.backgroundInfos.push(rt);
        }
    }

    protected updateBackgroundInBegin(comp: TextMeshLabel, index: number, newLine: boolean) {
        const chars = comp.charInfos;
        const charInfo = chars[index];
        if(!newLine) {
            if(this.backgroundInfo.startIndex >= 0) {
                // 判断是否需要添加背景
                let pv = chars[index-1];
                if(pv.style.background != charInfo.style.background || 
                    pv.style.background == charInfo.style.background && pv.style.fontSize != charInfo.style.fontSize) {
                    this.appendBackgroundData(comp, this.backgroundInfo.startIndex, index-1);
                    this.backgroundInfo.lineLength = 0;
                    this.backgroundInfo.startIndex = -1;
                }
            }
        }

        if(this.backgroundInfo.startIndex < 0 && charInfo.style.background) {
            this.backgroundInfo.startIndex = index;                
            this.backgroundInfo.existInLine = true;
        }
        
        this.calcLineInfo(comp, this.backgroundInfo, charInfo);
    }

    protected updateBackgroundInEnd(comp: TextMeshLabel, index: number) {
        const chars = comp.charInfos;
        const charInfo = chars[index];

        if(this.backgroundInfo.startIndex >= 0) {
            this.backgroundInfo.lineLength += charInfo.sw;
            this.appendBackgroundData(comp, this.backgroundInfo.startIndex, index);
        }

        this.backgroundInfo.reset();
    }
    /*************mask*******************/
    private appendMaskData(comp: TextMeshLabel, startIndex: number, endIndex: number) {
        if(startIndex >= 0 && endIndex >= startIndex) {
            let length = this.getWidth(comp, startIndex, endIndex);
            if(length <= 0) {
                return;
            }

            let rt = TMQuadRenderDataPool.alloc();
            if(!rt.charInfo) {
                rt.charInfo = getCharInfoFromPool();                
            }
            rt.charInfo.char = comp.font.fontData.getRectLine();
            rt.charInfo.style = comp.charInfos[startIndex].style.clone();
            rt.charInfo.style.font = comp.font;
            rt.charInfo.style.setFillColor(comp.maskColor);
            rt.charInfo.style.setDilate(1, true);

            rt.startIndex = startIndex;
            rt.endIndex = endIndex;
            rt.type = ETMQuadType.Mask;
            rt.length = length;
            rt.height = this.maskInfo.lineHeight;
            rt.maxHeight = this.breakLineInfo.maxHeight;
            comp.maskInfos.push(rt);
        }
    }

    protected updateMaskInBegin(comp: TextMeshLabel, index: number, newLine: boolean) {
        const chars = comp.charInfos;
        const charInfo = chars[index];
        if(!newLine) {
            if(this.maskInfo.startIndex >= 0) {
                // 判断是否需要添加遮罩
                let pv = chars[index-1];
                if(pv.style.mask != charInfo.style.mask || pv.style.mask == charInfo.style.mask && pv.style.fontSize != charInfo.style.fontSize) {
                    this.appendMaskData(comp, this.maskInfo.startIndex, index-1);
                    this.maskInfo.lineLength = 0;
                    this.maskInfo.startIndex = -1;
                }
            }
        }

        if(this.maskInfo.startIndex < 0 && charInfo.style.mask) {
            this.maskInfo.startIndex = index;                
            this.maskInfo.existInLine = true;
        }

        // 累计遮罩宽度
        this.calcLineInfo(comp, this.maskInfo, charInfo);
    }

    protected updateMaskInEnd(comp: TextMeshLabel, index: number) {
        const chars = comp.charInfos;
        const charInfo = chars[index];

        if(this.maskInfo.startIndex >= 0) {
            this.maskInfo.lineLength += charInfo.sw;
            this.appendMaskData(comp, this.maskInfo.startIndex, index);
        }

        this.maskInfo.reset();
    }    
    /**********************************/
}
