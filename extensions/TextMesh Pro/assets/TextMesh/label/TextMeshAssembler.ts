// 檔案：ErrorTextMesh/label/TextMeshAssembler.ts
// 【最終優化版】

import { Color, IAssembler, Mat4, Vec3, __private, Node, RenderData } from "cc"; // 引入 Node
import { JSB } from "cc/env";
import { TextMeshSettings } from "../settings";
import { LayoutResult } from "../types/ITypeSet";
import { ItalicSkewFactor } from "../utils/Const";
import { ETMQuadType } from "../vertex/ETMQuadType";
import { CharInfo, getCharInfoFromPool } from "./CharInfo";
import { TextMeshLabel } from "./TextMeshLabel";
import { EScriptType, ETextOverflow } from "./types";

const MaxQuadLimit = Math.ceil(65535 / 6);
const QuadIndices = [0, 1, 2, 2, 1, 3];
const vec3_temp = new Vec3();
const _worldMatrix = new Mat4();

export class TextMeshAssembler implements IAssembler {
    // --- 以下是之前修正過的所有 public 方法，保持不變 ---
    public static createData (comp: TextMeshLabel) {
        const renderData = comp.requestRenderData()!;
        const MAX_CHAR_COUNT = 128; // 您可以根據需求調整預設大小
        const vertsPerChar = 4;
        const indicesPerChar = 6;
        const vertexCount = MAX_CHAR_COUNT * vertsPerChar;
        const indexCount = MAX_CHAR_COUNT * indicesPerChar;
        renderData.resize(vertexCount, indexCount);
        renderData.dataLength = 0;
        return renderData;
    }

    public static fillBuffers (comp: TextMeshLabel, renderer: __private._cocos_2d_renderer_i_batcher__IBatcher) {
        if (!comp.renderData || !comp.font) {
            return;
        }

        const chunk = comp.renderData!.chunk;
        if(!chunk) {
            return;
        }

        comp.node.updateWorldTransform();
        comp.node.getWorldMatrix(_worldMatrix);
        this._fillElementBuffers(comp, renderer, false, 0);
    }

    // ---【核心優化點】---
    private static _fillElementBuffers(comp: TextMeshLabel, renderer: __private._cocos_2d_renderer_i_batcher__IBatcher, shadow: boolean = false, vertexOffset: number = 0) {
        const node = comp.node; // 獲取節點本身
        const chunk = comp.renderData!.chunk;

        const vData = chunk.vb;
        const floatStride = comp.renderData!.floatStride;

        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(chunk.bufferId);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);

        // 使用引擎內建的 hasChangedFlags 進行判斷
        const isTransformDirty = (node.hasChangedFlags & Node.TransformBit.TRS) || comp.transformDirty;

        const len = comp.getRenderElementCount();
        let vIndex = vertexOffset;
        for(let i=0;i<len;i++) {
            let charInfo = comp.getRenderElement(i);
            if(!charInfo || !charInfo.visible) {
                continue;
            }

            if(shadow) {
                charInfo = charInfo.shadowChar;
                if(!charInfo) {
                    continue;
                }
            }

            for(let vi = 0; vi < charInfo.vertexData.length; vi++) {
                const v = charInfo.vertexData[vi];

                // 【優化後的判斷邏輯】
                // 只有在節點的變換矩陣發生變化，或字元本身需要更新時，才重新計算
                if(isTransformDirty || charInfo.dirty) {
                    vec3_temp.set(v.rx, v.ry, 0);
                    Vec3.transformMat4(vec3_temp, vec3_temp, _worldMatrix);
                    v.worldX = vec3_temp.x;
                    v.worldY = vec3_temp.y;
                    v.worldZ = vec3_temp.z;
                }

                let idx = floatStride * vIndex;
                vData[idx] = v.worldX;
                vData[idx + 1] = v.worldY;
                vData[idx + 2] = v.worldZ;

                if(vIndex % 4 == 0) {
                    let vOffset = vIndex + vid;
                    let idxOffset = meshBuffer.indexOffset;
                    ib[idxOffset++] = vOffset;
                    ib[idxOffset++] = vOffset + 1;
                    ib[idxOffset++] = vOffset + 2;
                    ib[idxOffset++] = vOffset + 2;
                    ib[idxOffset++] = vOffset + 1;
                    ib[idxOffset++] = vOffset + 3;
                    meshBuffer.indexOffset = idxOffset;
                }
                vIndex++;
            }
            charInfo.dirty = false;
        }
        meshBuffer.setDirty();
        return vIndex;
    }

    // ... 其他所有 public static 方法保持不變 ...
    public static updateUVs(comp: TextMeshLabel) {
        const chunk = comp.renderData!.chunk;
        if(!chunk) {
            return;
        }

        // 陰影和文字使用相同的UV，一次更新即可
        this._updateUVs(comp, false, 0);
    }

    private static _needCheckShdaow(comp: TextMeshLabel) {
        if(comp.rich) {
            return true;
        }
        return comp.style.shadow > 0.0001;
    }

    private static _updateUVs(comp: TextMeshLabel, shadow: boolean = false, vertexOffset: number = 0) {
        const chunk = comp.renderData!.chunk;
        const vData = chunk.vb;
        const len = comp.getRenderElementCount();
        const floatStride = comp.renderData!.floatStride;

        let vIndex = vertexOffset;
        for(let i=0;i<len;i++) {
            let charInfo = comp.getRenderElement(i);
            if(!charInfo || !charInfo.visible) {
                continue;
            }

            if(shadow) {
                charInfo = charInfo.shadowChar;
                if(!charInfo) {
                    continue;
                }
            }

            for(let vi = 0; vi < charInfo.vertexData.length; vi++) {
                const v = charInfo.vertexData[vi];
                let idx = floatStride * vIndex;
                vData[idx + 3 ] = v.u;
                vData[idx + 4 ] = v.v;
                vData[idx + 5 ] = v.u1;
                vData[idx + 6 ] = v.v1;
                vIndex++;
            }
        }
        return vIndex;
    }

    public static updateColor(comp: TextMeshLabel, charInfo?: CharInfo, colors?: Color | Color[]) {
        const chunk = comp.renderData!.chunk;
        if(!chunk) {
            return;
        }
        if(this._needCheckShdaow(comp)) {
            this._updateColor(comp, charInfo, colors, true);
        }
        this._updateColor(comp, charInfo, colors);
    }

    private static _updateColor(comp: TextMeshLabel, charInfo: CharInfo, colors: Color | Color[], shadow: boolean = false) {
        if(!charInfo || !charInfo.visible) {
            return;
        }
        const chunk = comp.renderData!.chunk;
        const vData = chunk.vb;
        const vertexOffset = comp.renderData!.floatStride;
        let style = charInfo.style;
        let isArray = Array.isArray(colors);
        for(let vi = 0; vi < charInfo.vertexData.length; vi++) {
            let vIndex = vi + charInfo.index * 4;
            let idx = vertexOffset * vIndex;
            let color: Color = null;
            if(shadow) {
                color = style.shadowRGBA;
            }else{
                color = !!colors ? (isArray ? colors[vi] : colors) : style.getFillColor(vi % 4);
            }
            vData[idx + 7 ] = color.x;
            vData[idx + 8 ] = color.y;
            vData[idx + 9 ] = color.z;
            vData[idx + 10] = color.w;
        }
    }

    public static updateColors(comp: TextMeshLabel) {
        const chunk = comp.renderData!.chunk;
        if(!chunk) {
            return;
        }
        // 陰影和文字的顏色是分開處理的，一次更新即可
        this._updateColors(comp, false, 0);
    }

    private static _updateColors(comp: TextMeshLabel, shadow: boolean = false, vertexOffset: number = 0) {
        const chunk = comp.renderData!.chunk;
        const vData = chunk.vb;
        const len = comp.getRenderElementCount();
        const floatStride = comp.renderData!.floatStride;
        let vIndex = vertexOffset;
        for(let i=0;i<len;i++) {
            let charInfo = comp.getRenderElement(i);
            if(!charInfo || !charInfo.visible) {
                continue;
            }
            let style = charInfo.style;
            for(let vi = 0; vi < charInfo.vertexData.length; vi++) {
                let v = charInfo.vertexData[vi];
                let idx = floatStride * vIndex;
                let color: Color = null;
                if(v.type == ETMQuadType.Shadow) {
                    color = style.shadowRGBA;
                }else{
                    color = style.getFillColor(vi % 4);
                }
                vData[idx + 7 ] = color.x;
                vData[idx + 8 ] = color.y;
                vData[idx + 9 ] = color.z;
                vData[idx + 10] = color.w;
                vIndex++;
            }
        }
        return vIndex;
    }

    public static updateOthers(comp: TextMeshLabel) {
        const chunk = comp.renderData!.chunk;
        if(!chunk) {
            return;
        }
        // 陰影和文字的 "other" 屬性是分開處理的，一次更新即可
        this._updateOthers(comp, false, 0);
    }

    private static _updateOthers(comp: TextMeshLabel, shadow: boolean = false, vertexOffset: number = 0) {
        const chunk = comp.renderData!.chunk;
        const vData = chunk.vb;
        const len = comp.getRenderElementCount();
        let vIndex = vertexOffset;
        for(let i=0;i<len;i++) {
            let charInfo = comp.getRenderElement(i);
            if(!charInfo || !charInfo.visible) {
                continue;
            }

            const char = charInfo.char;
            const floatStride = comp.renderData!.floatStride;
            let style = charInfo.style;
            for(let vi = 0; vi < charInfo.vertexData.length; vi++) {
                const v = charInfo.vertexData[vi];
                const isShadowQuad = v.type === ETMQuadType.Shadow;

                let idx = floatStride * vIndex;
                vData[idx + 11] = char?.cid || 0;
                vData[idx + 12] = style.dilate * TextMeshSettings.dilateScale;

                // 【核心修正】根據頂點類型決定描邊/陰影的顏色
                let color: Color;
                if (isShadowQuad) {
                    color = style.shadowRGBA; // 陰影使用 shadowColor
                } else {
                    color = style.strokeRGBA; // 普通文字使用 strokeColor
                }

                // 【核心修正】移除此處的縮放，直接使用 style 物件中已經處理好的值
                vData[idx + 13] = isShadowQuad ? style.shadow : style.stroke;
                vData[idx + 14] = isShadowQuad ? style.shadowBlur : style.strokeBlur;
                vData[idx + 15] = color.x;
                vData[idx + 16] = color.y;
                vData[idx + 17] = color.z;

                if (isShadowQuad) {
                    // 這裡的 1.0 會被 Shader 的 step(1.0, a_strokeColor1.y) 捕捉
                    let shadowAlpha = style.shadowRGBA.w;
                    if (shadowAlpha >= 1.0) shadowAlpha = 0.9999;
                    vData[idx + 18] = 1.0 + shadowAlpha;
                } else {
                    let strokeAlpha = style.strokeRGBA.w;
                    if (strokeAlpha >= 1.0) strokeAlpha = 0.9999;
                    vData[idx + 18] = 0.0 + strokeAlpha;
                }

                vIndex++;
            }
        }
        return vIndex;
    }

    private static updateVertexData (comp: TextMeshLabel) {
        if (!comp.renderData || !comp.font) { return; }
        comp.node.updateWorldTransform();
        if(comp.typeSet) {
            let len = 0;
            const layout = comp.layoutResult;
            if(comp.backgroundColor.a > 0) {
                len = comp.backgroundInfos.length;
                for(let i=0;i<len;i++) { this.refreshBackgroundInfo(comp, i, layout); }
            }
            len = comp.charInfos.length;
            for(let i=0;i<len;i++) {
                let char = comp.charInfos[i];
                if(!char.visibleChar) { continue; }
                this.refreshCharInfo(comp, i, char);
            }
            if(comp.font.strikeThickness > 0) {
                len = comp.strikeInfos.length;
                for(let i=0;i<len;i++) { this.refreshStrikeInfo(comp, i, layout); }
            }
            if(comp.font.underLineThickness > 0) {
                len = comp.underLineInfos.length;
                for(let i=0;i<len;i++) { this.refreshUnderlineInfo(comp, i, layout); }
            }
            if(comp.maskColor.a > 0) {
                len = comp.maskInfos.length;
                for(let i=0;i<len;i++) { this.refreshMaskInfo(comp, i, layout); }
            }
        }
    }

    public static refreshCharInfo(comp: TextMeshLabel, index: number, charInfo: CharInfo) {
        const width = charInfo.realWidth;
        const height = charInfo.realHeight;

        // 【核心修正】必須加上 charInfo.offsetX 和 charInfo.offsetY
        // 這樣才能將 HorizontalTypeSet 計算出的精確排版應用到網格上
        const offsetX = charInfo.x + charInfo.offsetX;
        const offsetY = charInfo.baseY + charInfo.y;

        const italic = charInfo.style.italic;
        const skewFactor = italic ? ItalicSkewFactor : 0;
        this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo, charInfo.char.uvs, ETMQuadType.Char);
    }


    private static _clipInfo = { xy: 0, uv: 0, len: 0 };
    private static _clipX(comp: TextMeshLabel, value: number, min: number, max: number, width: number, isMin: boolean) {
        let tr = comp.uiTransform;
        this._clipInfo.xy = value; this._clipInfo.len = width; let dist = max - min;
        if(isMin) {
            if(value < 0) { this._clipInfo.uv = min - dist * value / width; this._clipInfo.xy = 0; this._clipInfo.len += value; }
            else{ this._clipInfo.uv = min; }
        } else {
            let rxy = value + width; let size = tr.width;
            if(rxy > size) { let dw = rxy - size; this._clipInfo.uv = max - dist * dw / width; this._clipInfo.len -= dw; }
            else{ this._clipInfo.uv = max; }
        }
        return this._clipInfo;
    }
    private static _clipY(comp: TextMeshLabel, value: number, min: number, max: number, height: number, isMin: boolean) {
        let tr = comp.uiTransform;
        this._clipInfo.xy = value; this._clipInfo.len = height; let dist = max - min;
        if(isMin) {
            let top = value + height;
            if(top > 0) { this._clipInfo.uv = min + dist * top / height; this._clipInfo.len -= top; }
            else{ this._clipInfo.uv = min; }
        } else {
            let size = tr.height;
            if(value < -size) { let dh = size + value; this._clipInfo.uv = max + dist * dh / height; this._clipInfo.xy = -size; this._clipInfo.len += dh; }
            else{ this._clipInfo.uv = max; }
        }
        return this._clipInfo;
    }

    private static appendQuad(comp: TextMeshLabel, width: number, height: number, offsetX: number, offsetY: number, skewFactor: number, charInfo: CharInfo, uvs: Float32Array, type: ETMQuadType = ETMQuadType.Char) {
        // 【核心重構】在產生普通四邊形的同時，檢查並產生陰影四邊形
        const style = charInfo.style;
        if (type !== ETMQuadType.Shadow && style.shadow > 0.0001) {
            const shadowOffsetX = offsetX + style.shadowOffsetX * TextMeshSettings.shadowScale;
            const shadowOffsetY = offsetY - style.shadowOffsetY * TextMeshSettings.shadowScale;
            this._appendQuad(comp, width, height, shadowOffsetX, shadowOffsetY, skewFactor, charInfo, uvs, ETMQuadType.Shadow);
        }
        this._appendQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo, uvs, type);
    }

    private static _appendQuad(comp: TextMeshLabel, width: number, height: number, offsetX: number, offsetY: number, skewFactor: number, charInfo: CharInfo, uvs: Float32Array, type: ETMQuadType = ETMQuadType.Char) {
        const renderData = comp.renderData;
        if (!renderData) { return; }
        let uv0 = uvs[0], uv1 = uvs[1], uv2 = uvs[2], uv3 = uvs[3], uv4 = uvs[4], uv5 = uvs[5], uv6 = uvs[6], uv7 = uvs[7];
        if(charInfo.slot) { uv0 = uv1 = uv2 = uv3 = uv4 = uv5 = uv6 = uv7 = 0; }
        else if(comp.overflow == ETextOverflow.Clamp) {
            offsetX += comp.localOffsetX; offsetY += comp.localOffsetY;
            let clip = this._clipX(comp, offsetX, uvs[0], uvs[2], width, true);
            offsetX = clip.xy; width = clip.len; uv0 = uv4 = clip.uv; if(width <= 0) { return; }
            clip = this._clipX(comp, offsetX, uvs[0], uvs[2], width, false);
            width = clip.len; uv2 = uv6 = clip.uv; if(width <= 0) { return; }
            clip = this._clipY(comp, offsetY, uvs[1], uvs[5], height, true);
            height = clip.len; uv1 = uv3 = clip.uv; if(height <= 0) { return; }
            clip = this._clipY(comp, offsetY, uvs[1], uvs[5], height, false);
            height = clip.len; offsetY = clip.xy; uv5 = uv7 = clip.uv; if(height <= 0) { return; }
            offsetX -= comp.localOffsetX; offsetY -= comp.localOffsetY;
        }
        offsetX += comp.globalOffsetX; offsetY += comp.globalOffsetY;
        if (renderData.dataLength + 4 > renderData.vertexCount) {
            const increment = 32 * 4;
            const newVertexCount = renderData.vertexCount + increment;
            const newIndexCount = newVertexCount / 4 * 6;
            renderData.resize(newVertexCount, newIndexCount);
        }
        renderData.dataLength += 4;
        const a = 1, b = 0, c = skewFactor, d = 1, tx = -skewFactor, ty = 0;
        let w0 = 0, w1 = 0, h0 = 0, h1 = 0;
        w1 = 0; w0 = w1 + width; h0 = 0; h1 = h1 + height;
        let x0 = (a * w1) + (c * h1) + tx + offsetX, y0 = (d * h1) + (b * w1) + ty + offsetY;
        let x1 = (a * w0) + (c * h1) + tx + offsetX, y1 = (d * h1) + (b * w0) + ty + offsetY;
        let x2 = (a * w1) + (c * h0) + tx + offsetX, y2 = (d * h0) + (b * w1) + ty + offsetY;
        let x3 = (a * w0) + (c * h0) + tx + offsetX, y3 = (d * h0) + (b * w0) + ty + offsetY;
        let vt;
        vt = charInfo.addVertex(); vt.rx = vt.x = x0; vt.ry = vt.y = y0; vt.u = uv0; vt.v = uv1; vt.u1 = 0; vt.v1 = 0; vt.type = type;
        vt = charInfo.addVertex(); vt.rx = vt.x = x1; vt.ry = vt.y = y1; vt.u = uv2; vt.v = uv3; vt.u1 = 1; vt.v1 = 0; vt.type = type;
        vt = charInfo.addVertex(); vt.rx = vt.x = x2; vt.ry = vt.y = y2; vt.u = uv4; vt.v = uv5; vt.u1 = 0; vt.v1 = 1; vt.type = type;
        vt = charInfo.addVertex(); vt.rx = vt.x = x3; vt.ry = vt.y = y3; vt.u = uv6; vt.v = uv7; vt.u1 = 1; vt.v1 = 1; vt.type = type;
    }

    public static refreshUnderlineInfo(comp: TextMeshLabel, index: number, layout: LayoutResult) {
        const font = comp.font;
        let info = comp.underLineInfos[index];
        let startChar = comp.charInfos[info.startIndex];
        let width = info.length, height = Math.max(4, startChar.style.fontSize * font.underLineThickness);
        let offsetX = startChar.x, offsetY = startChar.baseY + startChar.y - comp.font.underLineOffset + height * 0.5;
        let uvs = info.charInfo.char.uvs, uDist = uvs[2] - uvs[0];
        RECT_UVS[1] = uvs[1]; RECT_UVS[3] = uvs[3]; RECT_UVS[5] = uvs[5]; RECT_UVS[7] = uvs[7];
        RECT_UVS[0] = RECT_UVS[4] = uvs[0] + uDist * 0.4; RECT_UVS[2] = RECT_UVS[6] = uvs[0] + uDist * 0.6;
        this.appendQuad(comp, width, height, offsetX, offsetY, 0, info.charInfo, RECT_UVS, ETMQuadType.UnderLine);
    }

    public static refreshStrikeInfo(comp: TextMeshLabel, index: number, layout: LayoutResult) {
        const font = comp.font;
        let info = comp.strikeInfos[index];
        let startChar = comp.charInfos[info.startIndex];
        let width = info.length, height = Math.max(4, startChar.style.fontSize * font.strikeThickness);
        let offsetX = startChar.x + startChar.offsetX;
        let offsetY = startChar.baseY + startChar.y + info.height * 0.5 - comp.font.strikeOffset;
        let uvs = info.charInfo.char.uvs, uDist = uvs[2] - uvs[0];
        RECT_UVS[1] = uvs[1]; RECT_UVS[3] = uvs[3]; RECT_UVS[5] = uvs[5]; RECT_UVS[7] = uvs[7];
        RECT_UVS[0] = RECT_UVS[4] = uvs[0] + uDist * 0.4; RECT_UVS[2] = RECT_UVS[6] = uvs[0] + uDist * 0.6;
        this.appendQuad(comp, width, height, offsetX, offsetY, 0, info.charInfo, RECT_UVS, ETMQuadType.DeleteLine);
    }

    private static getRectUVs(uvs: Float32Array) {
        let uDist = uvs[2] - uvs[0], vDist = uvs[5] - uvs[1];
        let leftU = uvs[0] + uDist * 0.3, topU = uvs[1] + vDist * 0.3;
        RECT_UVS[0] = RECT_UVS[4] = leftU; RECT_UVS[2] = RECT_UVS[6] = leftU + uDist * 0.1;
        RECT_UVS[1] = RECT_UVS[5] = topU; RECT_UVS[3] = RECT_UVS[7] = topU + vDist * 0.1;
        return RECT_UVS;
    }

    public static refreshBackgroundInfo(comp: TextMeshLabel, index: number, layout: LayoutResult) {
        let info = comp.backgroundInfos[index];
        let startChar = comp.charInfos[info.startIndex];
        let width = info.length, height = info.height;
        let offsetX = startChar.x + startChar.offsetX, offsetY = startChar.startY - info.height;
        let uvs = this.getRectUVs(info.charInfo.char.uvs);
        this.appendQuad(comp, width, height, offsetX, offsetY, 0, info.charInfo, uvs, ETMQuadType.Background);
    }

    public static refreshMaskInfo(comp: TextMeshLabel, index: number, layout: LayoutResult) {
        let info = comp.maskInfos[index];
        let startChar = comp.charInfos[info.startIndex];
        let width = info.length, height = info.height;
        let offsetX = startChar.x + startChar.offsetX, offsetY = startChar.startY - info.height;
        let uvs = this.getRectUVs(info.charInfo.char.uvs);
        this.appendQuad(comp, width, height, offsetX, offsetY, 0, info.charInfo, uvs, ETMQuadType.Mask);
    }

    public static updateRenderData (comp: TextMeshLabel) {
        if (!comp.renderData || !comp.font) {
            return;
        }
        if(comp.renderData.vertDirty) {
            if(comp.dirtyFlag == 0) {
                return;
            }
            this.updateVertexData(comp);
            this.updateUVs(comp);
            this.updateColors(comp);
            this.updateOthers(comp);
            comp.updateMaterial();
            comp.renderData!.vertDirty = false;
            comp.markForUpdateRenderData(false);
        }
    }
}
var RECT_UVS: Float32Array = new Float32Array(8);
