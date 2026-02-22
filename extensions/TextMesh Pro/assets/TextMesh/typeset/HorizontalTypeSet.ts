import { TextMeshLabel } from "../label/TextMeshLabel";
import { EScriptType, ETextHorizontalAlign, ETextOverflow, ETextVerticalAlign } from "../label/types";
import { CharInfo } from "../label/CharInfo";
import { isCJK } from "../libs/hanzi/isCJK";
import { LayoutResult } from "../types/ITypeSet";
import { ItalicSkewFactor } from "../utils/Const";
import { director, v3, Vec2, Vec3 } from "cc";
import { HitTestResult } from "../types/types";
import { ALLBIAODIAN, LINEBREAKING, LINELEADING, NOTBREAKING } from "../libs/hanzi/code";
import { BaseTypeSet } from "./BaseTypeSet";
import { TextStyle } from "../label/TextStyle";

const vec3_temp1 = v3();
const vec3_temp = v3();

// 定義一個介面來描述字元測量結果
interface ICharMetrics {
    w: number;
    h: number;
    sw: number;
    sw1: number;
    realWidth: number;
    realHeight: number;
    lineHeight: number;
    descent: number;
    ascent: number;
    isBreak: boolean;
}

export class HorizontalTypeSet extends BaseTypeSet {
    hitTest(comp: TextMeshLabel, touchPos: Vec2): HitTestResult {
        let utr = comp.uiTransform;
        var camera = director.root!.batcher2D.getFirstRenderCamera(comp.node);

        vec3_temp.set(touchPos.x, touchPos.y, 0);
        camera.screenToWorld(vec3_temp1, vec3_temp);
        utr.convertToNodeSpaceAR(vec3_temp1, vec3_temp);

        let x = vec3_temp.x - comp.globalOffsetX;
        let y = vec3_temp.y - comp.globalOffsetY;

        let layout = comp.layoutResult;
        let ey = 0;
        let sy = ey;
        let yIdx = -1;
        for (let li = 0; li < layout.lines.length; li++) {
            ey = ey - layout.linesHeight[li];
            if (y <= sy && y >= ey) {
                yIdx = li;
                break;
            }
            sy = ey;
        }

        if (yIdx >= 0) {
            let line = layout.lines[yIdx];

            this.hitTestResult.result = false;
            for (let ci = line[0]; ci <= line[1]; ci++) {
                let char = comp.charInfos[ci];

                // 【核心修正：移除 offsetX】
                // 點擊檢測應該基於「邏輯排版框 (char.x)」，而不是「視覺偏移後的墨水位置」。
                // 這樣能保證點擊該字元分配到的任何空間（包含左右留白）都能觸發點擊。
                if (x >= char.x && x <= char.x + char.w + char.sw) { // <--- 這裡改了
                    this.hitTestResult.result = true;
                    this.hitTestResult.accurate = false;
                    this.hitTestResult.charInfo = char;

                    // Y 軸判斷保持不變 (因為 offsetY 我們已經歸零了)
                    if (y >= char.y + char.offsetY && y <= char.y + char.offsetY + char.h + comp.lineSpace) {
                        this.hitTestResult.accurate = true;
                    }
                    return this.hitTestResult;
                }
            }
        }

        return null;
    }

    private processRTL(comp: TextMeshLabel, from: number, to: number) {
        // if(comp.RTL) {
        let chars = comp.charInfos;
        let allWords: number[][] = [];
        let word: number[] = [];
        let lastWhitSpaceIdx = -1;
        for (let i = from; i <= to; i++) {
            let last = i == to;
            let charInfo = chars[i];

            if (ALLBIAODIAN.indexOf(charInfo.char.code) >= 0) {
                if (lastWhitSpaceIdx < 0) {
                    allWords.push(word);
                    word = [];
                    lastWhitSpaceIdx = i;
                }
                word.push(i);
            } else {
                if (lastWhitSpaceIdx >= 0) {
                    allWords.push(word);
                    word = [];
                    lastWhitSpaceIdx = -1;
                }
                word.push(i);
            }

            if (last) {
                word.push(i);
                allWords.push(word);
            }
        }

        let width = 0;
        allWords.reverse();
        let len = allWords.length;
        for (let i = 0; i < len; i++) {
            let word = allWords[i];
            for (let j = 0; j < word.length; j++) {
                let char = comp.charInfos[word[j]];
                char.x = width;
                width += char.w;
                if (char.style.italic && j + 1 < word.length) {
                    let nchar = comp.charInfos[word[j + 1]];
                    if (!nchar.style.italic) {
                        width += char.sw;
                    }
                }
            }
        }
        // }
    }

    layout(comp: TextMeshLabel): LayoutResult {
        if (!comp.font) {
            return null;
        }

        this.reset();

        let result: LayoutResult = null;
        switch (comp.overflow) {
            case ETextOverflow.None:
                result = this.updateInResizeWidthMode(comp);
                break;
            case ETextOverflow.Clamp:
                result = this.updateInClampMode(comp);
                break;
            case ETextOverflow.ResizeHeight:
                result = this.updateInResizeHeightMode(comp);
                break;
            case ETextOverflow.Shrink:
                result = this.updateInShrinkMode(comp);
                break;
        }

        if (comp.charInfos.length > 0) {
            this.updateGloabl(comp);
            this.horizontalLayout(comp, result);
            this.verticalLayout(comp, result);
            this.layoutSlots(comp, result);
        }

        return result;
    }

    /**
     * [新增] 核心優化：虛擬測量函式
     * @param comp
     * @param fontSize
     * @returns
     */
    measure(comp: TextMeshLabel, fontSize: number): { width: number, height: number } {
        if (!comp.font || comp.charInfos.length === 0) {
            return { width: 0, height: 0 };
        }

        const autoWarp = comp.overflow === ETextOverflow.ResizeHeight || comp.autoWarp;
        const maxWidth = comp.uiTransform.width - comp.padding.left - comp.padding.right;
        const letterSpace = comp.letterSpace;

        let currentX = 0;
        let totalWidth = 0;
        let totalHeight = 0;
        let currentLineHeight = 0;
        let isNewLine = true;

        // 創建一個臨時的 style 物件來進行計算，避免污染原始 style
        const tempStyle = comp.style.clone();
        tempStyle.setFontSize(fontSize);

        for (let i = 0; i < comp.charInfos.length; i++) {
            const charInfo = comp.charInfos[i];
            // 使用與該字元關聯的樣式，但強制設定測試的字體大小
            const style = charInfo.style === comp.style ? tempStyle : charInfo.style.clone();
            if (charInfo.style !== comp.style) {
                style.setFontSize(fontSize);
            }

            const metrics = this._calculateCharMetrics(comp, charInfo, style, 1.0, fontSize);

            if (isNewLine) {
                currentX = 0;
                currentLineHeight = 0;
                isNewLine = false;
            }

            // 換行檢查
            if (metrics.isBreak || (autoWarp && currentX > 0 && currentX + metrics.w > maxWidth)) {
                totalWidth = Math.max(totalWidth, currentX);
                // 【核心修正 1】在 measure 函式中模擬 lineSpace 的計算
                // 讓 autoSize 能正確估算富文本行高
                if (totalHeight > 0) {
                    const lineSpace = charInfo.style.lineSpace ?? comp.lineSpace;
                    totalHeight += lineSpace;
                }
                totalHeight += currentLineHeight;
                currentX = 0;
                currentLineHeight = 0;
                if (metrics.isBreak) {
                    isNewLine = true;
                    continue;
                }
            }

            currentX += metrics.w + letterSpace;
            currentLineHeight = Math.max(currentLineHeight, metrics.lineHeight);
        }

        // 加入最後一行
        totalWidth = Math.max(totalWidth, currentX);
        totalHeight += currentLineHeight;

        return { width: totalWidth, height: totalHeight };
    }

    /**
     * [新增] 提取出的共用字元尺寸計算邏輯
     */
    private _calculateCharMetrics(comp: TextMeshLabel, charInfo: CharInfo, style: TextStyle, scale: number, overrideFontSize?: number): ICharMetrics {
        const metrics: Partial<ICharMetrics> = {};
        const isBreak = charInfo.char.code === '\n';
        const isSpace = charInfo.char.code === ' ';

        metrics.isBreak = isBreak;
        const fontSize = overrideFontSize ?? style.realFontSize;
        const ratio = charInfo.slot ? 1 : fontSize / (comp.font.fontSize * charInfo.char.scale) * scale;
        const realScale = ratio;
        const scaleX = realScale * comp.aspect;

        if (isBreak || isSpace) {
            metrics.w = isBreak ? 0 : charInfo.char.width * scaleX;
            metrics.h = fontSize;
            metrics.realWidth = metrics.w;
            metrics.realHeight = metrics.h;
            metrics.sw = 0;
            metrics.sw1 = 0;
            metrics.descent = 0;
            metrics.ascent = 0;
            metrics.lineHeight = comp.fixedLineHeight ? comp.lineHeight : metrics.h;
            return metrics as ICharMetrics;
        }

        let width = charInfo.char.width;
        let height = charInfo.char.height;
        let glyphAdvance = charInfo.char.glyphAdvance;
        let glyphHeight = charInfo.char.glyphHeight;
        let descent = charInfo.char.descent;
        let ascent = charInfo.char.ascent;

        if (charInfo.slot) {
            width = charInfo.slot.width * scale;
            height = charInfo.slot.height * scale;
            glyphAdvance = width;
            glyphHeight = height;
            descent = 0;
            ascent = height;
        }

        metrics.ascent = ascent * ratio;
        metrics.descent = descent * ratio;
        metrics.realWidth = width * scaleX;
        metrics.realHeight = height * realScale;
        metrics.w = glyphAdvance * scaleX;
        metrics.h = glyphHeight * ratio;
        metrics.lineHeight = comp.fixedLineHeight ? comp.lineHeight : metrics.h;

        if (comp.equalWidth) {
            metrics.w = fontSize;
        }

        if (style.stroke > 0) {
            const strokePixelWidth = style.stroke * fontSize;
            metrics.w += strokePixelWidth * 0.25;
        }

        metrics.sw = 0;
        if (style.italic) {
            metrics.sw = metrics.realHeight * ItalicSkewFactor;
            metrics.sw1 = metrics.descent * ItalicSkewFactor;
        }

        // 【最終修正：標點符號防禦】
        // 舊代碼直接賦值 realWidth 會導致寬符號變窄。
        // 改用 Math.max，保證符號至少有它自己原本的空間，甚至更多，絕不重疊。
        if (ALLBIAODIAN.indexOf(charInfo.char.code) >= 0) {
            metrics.w = Math.max(metrics.w, metrics.realWidth);
        }

        return metrics as ICharMetrics;
    }


    private updateGloabl(comp: TextMeshLabel) {
        let trans = comp.uiTransform;
        comp.localOffsetX = 0;
        comp.localOffsetY = 0;
        comp.globalOffsetX = -trans.width * trans.anchorX || 0;
        comp.globalOffsetY = trans.height * (1 - trans.anchorY) || 0;
    }

    private updateInClampMode(comp: TextMeshLabel): LayoutResult {
        return this.updateInWarpMode(comp, 1, comp.autoWarp);
    }

    private preProcessVertex(comp: TextMeshLabel, charInfo: CharInfo, scale: number) {
        let hasCalced = charInfo.cjk != null;
        if (hasCalced) return;

        charInfo.cjk = isCJK(charInfo.char.code);

        const metrics = this._calculateCharMetrics(comp, charInfo, charInfo.style, scale);

        // 賦值基本屬性
        charInfo.w = metrics.w;
        charInfo.h = metrics.h;
        charInfo.sw = metrics.sw;
        charInfo.sw1 = metrics.sw1;
        charInfo.realWidth = metrics.realWidth;
        charInfo.realHeight = metrics.realHeight;
        charInfo.descent = metrics.descent;
        charInfo.ascent = metrics.ascent;
        charInfo.scale = scale;

        // 【核心修復 1：消滅斷行線條】
        // 這是你遇到「斷行出現一條線」的根本原因。
        // 必須明確告訴渲染器：換行符和空格不需要畫出來！
        if (metrics.isBreak) {
            charInfo.visibleChar = false;
            charInfo.glyphLeft = charInfo.glyphRight = 0;
            charInfo.offsetX = charInfo.offsetY = 0;
            return;
        }

        // 確保 visibleChar 屬性與實際內容同步
        if (!charInfo.visibleChar) {
            charInfo.glyphLeft = charInfo.glyphRight = 0;
            charInfo.offsetX = charInfo.offsetY = 0;
            return;
        }

        const fontSize = charInfo.style.realFontSize;
        const ratio = charInfo.slot ? 1 : fontSize / (comp.font.fontSize * charInfo.char.scale) * scale;
        const scaleX = ratio * comp.aspect;

        if (charInfo.slot) {
            charInfo.glyphLeft = 0;
            charInfo.glyphRight = 0;
            charInfo.offsetX = 0;
        } else {
            // 保留 glyphLeft 計算供斷行邏輯參考
            charInfo.glyphLeft = charInfo.char.glyphLeft * scaleX;

            let glyphAdvance = charInfo.char.glyphAdvance;
            let glyphWidth = charInfo.char.glyphWidth;
            if (glyphAdvance < glyphWidth) {
                charInfo.glyphRight = (glyphWidth - glyphAdvance - charInfo.char.glyphLeft) * scaleX;
            } else {
                charInfo.glyphRight = 0;
            }

            // 【核心修復 2：幾何自動置中】
            // 放棄不準確的 glyphLeft，改用數學公式：(格子總寬 - 墨水寬) / 2
            // 這讓所有字元（不管中英文）都絕對居中於它的邏輯位置。
            charInfo.offsetX = (charInfo.w - charInfo.realWidth) * 0.5;
        }

        charInfo.fixedOffsetY = comp.font.offsetY * ratio;

        // 【核心修復 3：Y 軸穩定】
        // 保持 Y 軸偏移為 0，這解決了你說的「往下偏」問題
        charInfo.offsetY = 0;

        // 等寬模式下的雙重保險
        if (comp.equalWidth) {
            charInfo.offsetX = (charInfo.w - charInfo.realWidth) * 0.5;
            charInfo.glyphLeft = charInfo.offsetX;
            charInfo.glyphRight = 0;
        }
    }

    private calcNextBreakInfo(comp: TextMeshLabel, index: number, currentX: number, maxWidth: number, scale: number, autoBreak: boolean) {
        const chars = comp.charInfos;
        currentX += chars[index].glyphLeft;

        let totalWidth = currentX;
        let oldTotalWidth = totalWidth;
        let oldIndex = -1;
        let oldHeight = 0;
        let oldDescent = 0;
        let oldAscent = 0;
        let oldMaxHeight = 0;
        let continueSpace = 0;
        let letterSpace = comp.letterSpace;

        let updateLineInfo = (charInfo: CharInfo) => {
            this.breakLineInfo.lineHeight = comp.fixedLineHeight ? comp.lineHeight : Math.max(charInfo.h, this.breakLineInfo.lineHeight);
            this.breakLineInfo.maxDescent = Math.max(charInfo.descent, this.breakLineInfo.maxDescent);
            this.breakLineInfo.maxAscent = Math.max(charInfo.ascent, this.breakLineInfo.maxAscent);
            this.breakLineInfo.maxHeight = Math.max(this.breakLineInfo.maxHeight, charInfo.realHeight);
        };

        for (let vi = index; vi < chars.length; vi++) {
            let preChar = vi - 1 >= 0 ? chars[vi - 1] : null;
            let charInfo = chars[vi];

            this.preProcessVertex(comp, charInfo, scale);

            if (charInfo.visibleChar) {
                updateLineInfo(charInfo);
            }

            // 【核心修正 1】讓 \n 必定觸發換行，不再檢查 multiline
            let isBreak = charInfo.char.code == "\n";
            if (isBreak && vi == index) {
                this.breakLineInfo.index = vi;
                if (vi + 1 < chars.length) {
                    let nextChar = chars[vi + 1];
                    if (nextChar.char.code == "\n") {
                        updateLineInfo(charInfo);
                    }
                }
                break;
            }

            let isSpace = charInfo.char.code == " ";
            if (isSpace) {
                continueSpace++;
            } else {
                continueSpace = 0;
            }

            // 行宽超过最大宽度
            if (autoBreak && continueSpace != 1 && totalWidth + charInfo.w + charInfo.sw + letterSpace + charInfo.glyphRight > maxWidth) {
                let useOld = oldIndex >= 0;
                // 下一行再显示
                this.breakLineInfo.index = useOld ? oldIndex : vi - 1;
                totalWidth = oldTotalWidth;
                if (!useOld) {
                    totalWidth += charInfo.sw + charInfo.glyphRight;
                }
                if (vi == index) {
                    this.breakLineInfo.index = vi;
                } else {
                    this.breakLineInfo.lineHeight = oldHeight;
                    this.breakLineInfo.maxDescent = oldDescent;
                    this.breakLineInfo.maxAscent = oldAscent;
                    this.breakLineInfo.maxHeight = oldMaxHeight;
                }
                break;
            }

            // 判断宽度后，判断是否需要清除单词换行信息
            if (isSpace || preChar && (preChar.cjk != charInfo.cjk || preChar.cjk && charInfo.cjk || NOTBREAKING.indexOf(preChar.char.code) >= 0)) {
                oldIndex = -1;
            }

            // 更新old信息
            totalWidth += charInfo.w;
            oldHeight = this.breakLineInfo.lineHeight;
            oldDescent = this.breakLineInfo.maxDescent;
            oldAscent = this.breakLineInfo.maxAscent;
            oldMaxHeight = this.breakLineInfo.maxHeight;

            // 检查单词换行
            let isBreaking = LINEBREAKING.indexOf(charInfo.char.code) >= 0;
            let isLeading = LINELEADING.indexOf(charInfo.char.code) >= 0;
            let charDifference = comp.breakWestern && preChar && preChar.cjk != charInfo.cjk;
            if (vi != index && !isLeading && comp.autoWarp && (isBreaking || charDifference)) {
                let offset = 0;
                let offsetWidth = 0;
                let usePreChar = isSpace || charDifference;
                // 右对齐，末尾空格在下一行显示
                if (usePreChar && !(comp.horizontalAlign == ETextHorizontalAlign.Right && vi > index)) {
                    offset = -1;
                    offsetWidth = -charInfo.w;
                }

                // 单词结束，表示可以在当前行显示
                oldIndex = vi + offset;
                oldTotalWidth = totalWidth + offsetWidth;
                oldHeight = this.breakLineInfo.lineHeight;
                oldDescent = this.breakLineInfo.maxDescent;
                oldAscent = this.breakLineInfo.maxAscent;
                oldMaxHeight = this.breakLineInfo.maxHeight;
            }

            if (vi + 1 < chars.length) {
                totalWidth += letterSpace;

                let nextChar2 = chars[vi + 1];
                this.preProcessVertex(comp, nextChar2, scale);

                // 【核心修正 2】同樣，讓 \n 必定觸發換行
                isBreak = nextChar2.char.code == "\n";
                totalWidth += this.getWidthExt(charInfo, nextChar2);
                let isNextLeading = false;
                let isNextBreaking = false;

                // 如果最后一个字符遇到前置字符，提前换行
                if (isBreak ||
                    autoBreak &&
                    (totalWidth + nextChar2.w + nextChar2.sw + nextChar2.glyphRight > maxWidth) &&
                    (
                        (isNextLeading = LINELEADING.indexOf(nextChar2.char.code) >= 0) ||
                        (isNextBreaking = LINEBREAKING.indexOf(nextChar2.char.code) >= 0)
                    )) {
                    // 如果最后一个字符是换行符，直接换行
                    let useOld = oldIndex >= 0 && !isBreak;
                    // 下一行再显示
                    this.breakLineInfo.index = useOld ? oldIndex : vi;
                    if (isNextBreaking && comp.autoWarp) {
                        this.breakLineInfo.index++;
                    }
                    totalWidth = oldTotalWidth;
                    if (useOld) {
                        totalWidth += charInfo.sw + charInfo.glyphRight;
                        this.breakLineInfo.index = oldIndex;
                    }

                    this.breakLineInfo.lineHeight = oldHeight;
                    this.breakLineInfo.maxDescent = oldDescent;
                    this.breakLineInfo.maxAscent = oldAscent;
                    this.breakLineInfo.maxHeight = oldMaxHeight;
                    break;
                }
            } else {
                this.breakLineInfo.index = vi;
                totalWidth += charInfo.sw;
                break;
            }
        }

        this.breakLineInfo.lineIndex++;
        return this.breakLineInfo;
    }

    private getWidthExt(preChar: CharInfo, charInfo: CharInfo) {
        if (preChar) {
            if (preChar.style.scriptType != EScriptType.SuperScript && charInfo.style.scriptType == EScriptType.SuperScript) {
                return preChar.sw;
            } else if (preChar.style.scriptType != EScriptType.SubScript && charInfo.style.scriptType == EScriptType.SubScript) {
                return preChar.sw1;
            }

            if (!charInfo.style.italic && preChar.style.italic) {
                return preChar.sw;
            }
        }
        return 0;
    }

    private _getCharAdvance(charInfo: CharInfo, scale: number, comp: TextMeshLabel): number {
        if (charInfo.slot) {
            return charInfo.w + (comp.slotSpace * scale);
        }
        // 【標點符號間距優化】
        // 如果當前字元是標點符號，我們已經在 _calculateCharMetrics 中將其寬度設為實際寬度，
        // 所以這裡不再添加 letterSpace，避免過度壓縮。
        if (ALLBIAODIAN.indexOf(charInfo.char.code) >= 0) {
            return charInfo.w + 2 * scale;
        }
        return charInfo.w + (comp.letterSpace * scale);
    }

    private updateInWarpMode(comp: TextMeshLabel, scale = 1, autoBreak = true): LayoutResult {
        // 初始化
        comp.globalOffsetX = comp.globalOffsetY = 0;

        this.breakLineInfo.lineIndex = 0;

        const trans = comp.uiTransform!;
        let maxWidth = trans.width - comp.padding.left - comp.padding.right;

        let lineHeight = 0;
        let maxHeight = 0;

        let chars = comp.charInfos;
        let totalX = comp.padding.left;
        let baseY = -comp.padding.top;
        let startY = baseY;
        let line:[number, number] = [0, 0];
        let lines:number[][] = [line];
        let newLine = true;
        let boundHeight = 0;
        let boundWidth = 0;
        let lastMaxDescent = 0;
        let lastMaxAscent = 0;

        let linesHeight: number[] = [];
        let linesWidth: number[] = [];
        let linesDescent: number[] = [];

        let lineBaseY = 0;
        for(let i=0;i<chars.length;i++) {
            let charInfo = chars[i];

            if(newLine) {
                this.calcNextBreakInfo(comp, i, totalX, maxWidth, scale, autoBreak);
            }

            maxHeight = this.breakLineInfo.maxHeight;
            lineHeight = this.breakLineInfo.lineHeight;

            if(newLine) {
                newLine = false;
                startY = baseY;
                baseY = baseY - lineHeight;
                lineBaseY = (maxHeight - lineHeight) * 0.5;
            }

            line[1] = i;
            charInfo.line = lines.length - 1;
            charInfo.inline = line[1] - line[0];

            let lastChar = i == chars.length - 1;

            if(this.breakLineInfo.index >= 0 && i == this.breakLineInfo.index) {
                newLine = true;
            }

            // --- 座標計算邏輯 ---
            if (line[0] === i) { // 如果是行首字元
                charInfo.x = comp.padding.left;
            } else {
                const preChar = chars[i - 1];
                const advance = this._getCharAdvance(preChar, scale, comp);
                const widthExt = this.getWidthExt(preChar, charInfo);
                charInfo.x = preChar.x + advance + widthExt;
            }

            charInfo.baseY = baseY;
            charInfo.y = -lineBaseY + charInfo.fixedOffsetY;
            charInfo.startY = startY;

            if(newLine) {
                let offsetHeight = 0;
                if(lines.length > 0 && lineHeight > 0) {
                    const prevLine = lines[lines.length - 1];
                    const lastCharOfPrevLine = chars[prevLine[1]];
                    const style = lastCharOfPrevLine.style;
                    offsetHeight = style.lineSpace ?? comp.lineSpace;
                }
                baseY = baseY - offsetHeight;
            }

            if(charInfo.style.scriptType == EScriptType.SuperScript) {
                charInfo.y += lineHeight - charInfo.h * 0.5;
            }else if(charInfo.style.scriptType == EScriptType.SubScript) {
                charInfo.y += charInfo.descent;
            }

            for(let iu = 0;iu < this.beginUpdateHandlers.length;iu++) {
                this.beginUpdateHandlers[iu].call(this, comp, i, newLine);
            }

            if (newLine || lastChar) {
                // 【核心修正：精準計算行寬】
                // getWidth 本身只算到最後一格的邏輯終點，我們需要補上視覺溢出。
                let lineWidth = this.getWidth(comp, line[0], line[1]);

                // 取得這一行最後一個字元
                const lastCharOfLine = chars[line[1]];
                if (lastCharOfLine) {
                    // 1. 補償斜體帶來的右側偏移 (sw)
                    if (lastCharOfLine.style.italic) {
                        lineWidth += lastCharOfLine.sw;
                    }
                    // 2. 補償字體設計原本帶有的右側留白 (glyphRight)
                    lineWidth += lastCharOfLine.glyphRight;
                }

                linesWidth.push(lineWidth);
                linesHeight.push(lineHeight);
                linesDescent.push(this.breakLineInfo.maxDescent);
                boundHeight += lineHeight;

                if(lines.length > 1 && lineHeight > 0) {
                    const prevLine = lines[lines.length - 1];
                    const lastCharOfPrevLine = chars[prevLine[1]];
                    const style = lastCharOfPrevLine.style;
                    boundHeight += style.lineSpace ?? comp.lineSpace;
                }

                // 【關鍵】更新整體的最大寬度
                boundWidth = Math.max(lineWidth, boundWidth);

                if(i + 1 < chars.length) {
                    line = [i + 1, 0];
                    lines.push(line);
                }

                if(lastChar && this.underLineInfo.startIndex >= 0 && charInfo.font.keepUnlderLineSpace){
                    let startChar = chars[this.underLineInfo.startIndex];
                    let unlderLineOffset = Math.max(0, startChar.style.fontSize * comp.font.underLineThickness - startChar.style.fontSize * comp.font.underLineOffset);
                    boundHeight += unlderLineOffset;
                }

                for(let iu = 0;iu < this.endUpdateHandlers.length;iu++) {
                    this.endUpdateHandlers[iu].call(this, comp, i);
                }

                lineHeight = 0;
                lastMaxDescent = this.breakLineInfo.maxDescent;
                lastMaxAscent = this.breakLineInfo.maxAscent;

                this.breakLineInfo.index = -1;
                this.breakLineInfo.lineHeight = 0;
                this.breakLineInfo.maxDescent = 0;
                this.breakLineInfo.maxHeight = 0;
                this.breakLineInfo.maxAscent = 0;
            }
        }

        return {
            lines,
            maxWidth: boundWidth,
            maxHeight: boundHeight,
            linesHeight,
            linesWidth,
            linesDescent,
            lastMaxDescent,
        };
    }

    private updateInResizeHeightMode(comp: TextMeshLabel): LayoutResult {
        // 對於 ResizeHeight 模式，其核心是讓高度適應內容，這必須在允許自動換行的前提下進行。
        // 因此，我們強制傳遞 true 給排版引擎，以忽略外部 autoWarp 的設定。
        let result = this.updateInWarpMode(comp, 1, true);
        const trans = comp.uiTransform!;
        let offsetY = (result.maxHeight - trans.height) * trans.anchorY;
        trans.height = result.maxHeight || 0;
        comp.globalOffsetY += offsetY;
        return result;
    }

    private updateInResizeWidthMode(comp: TextMeshLabel): LayoutResult {
        let result = this.updateInWarpMode(comp, 1, false);
        const trans = comp.uiTransform!;
        trans.width = result.maxWidth || 0;
        trans.height = result.maxHeight || 0;
        return result;
    }

    private updateInShrinkMode(comp: TextMeshLabel): LayoutResult {
        // 步驟 1: 先用原始字體大小和 autoWarp 設定進行一次完整的排版，嘗試換行。
        let result = this.updateInWarpMode(comp, 1, comp.autoWarp);
        const trans = comp.uiTransform!;
        let scale = 1;
        let needsRescale = false;

        // 步驟 2: 根據 multiline 狀態決定是比較寬度還是高度。
        if (comp.autoWarp) { // 【核心修正 3】使用 autoWarp 來判斷是否為多行縮放模式
            // 多行模式：優先判斷高度是否溢出。
            if (result.maxHeight > trans.height && trans.height > 0) {
                scale = trans.height / result.maxHeight;
                needsRescale = true;
            }
        } else {
            // 非自動換行模式下，比較寬度。
            if (result.maxWidth > trans.width && trans.width > 0) {
                scale = trans.width / result.maxWidth;
                needsRescale = true;
            }
        }

        if (needsRescale) {
            // 步驟 3: 如果需要縮放，則用新的 scale 和 autoWarp 設定來進行最終排版。
            result = this.updateInWarpMode(comp, scale, comp.autoWarp);
            result.linesDescent = result.linesDescent; // 修正：確保 linesDescent 被傳遞
        }

        return result;
    }

    private horizontalLayout(comp: TextMeshLabel, result: LayoutResult) {
        if (comp.horizontalAlign == ETextHorizontalAlign.Left) {
            return;
        }

        let align = 0;
        if (comp.horizontalAlign == ETextHorizontalAlign.Center) {
            align = 0.5;
        } else if (comp.horizontalAlign == ETextHorizontalAlign.Right) {
            align = 1;
        }

        const trans = comp.uiTransform!;
        for (let i = 0; i < result.lines.length; i++) {
            let line = result.lines[i];
            let endIdx = line[1];
            let offsetX = (trans.width - result.linesWidth[i]) * align;
            for (let wi = line[0]; wi <= endIdx; wi++) {
                let v = comp.charInfos[wi];
                v.x += offsetX;
            }
        }
    }

    private verticalLayout(comp: TextMeshLabel, result: LayoutResult) {
        // 如果是自動調整高度或頂部對齊，則不處理
        if (comp.overflow == ETextOverflow.ResizeHeight || comp.verticalAlign == ETextVerticalAlign.Top) {
            return;
        }

        const trans = comp.uiTransform!;
        let align = 0;
        if (comp.verticalAlign == ETextVerticalAlign.Middle) {
            align = 0.5;
        } else if (comp.verticalAlign == ETextVerticalAlign.Bottom) {
            align = 1;
        }

        // 【核心修正】：全文總高度必須包含 paddingTop 和 paddingBottom
        // 否則在 Middle 對齊下，文字會因為 padding 的存在而向下或向上偏移
        let realMaxHeight = comp.padding.top + result.maxHeight + comp.padding.bottom;

        // 計算剩餘空間的分配偏移量
        comp.localOffsetY = (realMaxHeight - trans.height) * align;

        // 將此偏移應用到全域偏移中
        comp.globalOffsetY += comp.localOffsetY;
    }

    private layoutSlots(comp: TextMeshLabel, result: LayoutResult) {
        for (let i = 0; i < comp.slots.length; i++) {
            let slot = comp.slots[i];
            // 直接獲取對應 slot 的 CharInfo，它的座標在 updateInWarpMode 中已經被精確計算完畢
            const char = comp.charInfos[slot.index];
            const layoutScale = char.scale || 1;

            slot.node.setScale(layoutScale, layoutScale, layoutScale);

            slot.node.setPosition(
                char.x + comp.globalOffsetX + comp.slotOffsetX,
                char.baseY + char.y + result.linesDescent[char.line] + comp.globalOffsetY + comp.slotOffsetY,
                0
            );
        }
    }
}
