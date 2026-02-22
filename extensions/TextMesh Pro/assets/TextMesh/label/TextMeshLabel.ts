import {
    __private,
    _decorator,
    Asset,
    assetManager,
    Color,
    Enum,
    EventTouch,
    Graphics,
    instantiate,
    isValid,
    Material,
    math,
    Node,
    Prefab,
    Quat,
    RenderData,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
    Texture2D,
    UIRenderer,
    UITransform,
    v2,
    Vec3
} from "cc";
import { getStringArray } from "../font/FontUtils";
import { TMFont } from "../font/TMFont";
import { putTMQuadRenderDataToPool, TMQuadRenderData } from "../vertex/TMRenderData";
import { vfmtTMVertex } from "../vertex/VertexFormat";
import { ITypeSet, LayoutResult } from "../types/ITypeSet";
import { TypeSetFactory } from "../typeset/TypeSetFactory";
import dfs from "../utils/dfs";
import { TagNode, UBBParser } from "../utils/UBBParser";
import { TextMeshAssembler } from "./TextMeshAssembler";
import { TextStyle } from "./TextStyle";
import { ETextDirection, ETextHorizontalAlign, ETextOverflow, ETextVerticalAlign, Margin } from "./types";
import { CharInfo, getCharInfoFromPool, putCharInfoToPool } from "./CharInfo";
import { StyleMapper } from "./StyleMapper";
import { Clickable, ESlotSizeType, ESlotType, isSlotType, Slot, SlotTypeMap } from "./LayoutTypes";
import { ResManager } from "../utils/ResManger";
import { click_char_event } from "./events";
import { EDITOR } from "cc/env";
import { StyleManager } from "./StyleManager";
import { SlotConnector } from "./SlotConnector";
import { TextMeshSettings } from "../settings";
import { FM } from "../font/FontManager";
import { FontType } from "db://text-mesh/font/FontType";
import { ITextMeshAllSettings } from "db://text-mesh/label/setting/ITextMeshAllSettings";
import { ITextMeshLabelSpriteAsset } from "db://text-mesh/label/setting/ITextMeshLabelSpriteAsset";

const { ccclass, property, executeInEditMode, executionOrder } = _decorator;

export type SlotHandlerType = (comp: TextMeshLabel, slotNode: Node, slot: Slot) => void;
export type SlotSpriteFrameHandlerType = (name: string) => SpriteFrame | Promise<SpriteFrame>;
export type SlotPrefabHandlerType = (name: string) => Prefab | Promise<Prefab>;

const vec2_temp = v2();

export enum EDirtyFlag {
    None = 0,
    Text = 1 << 1,
    Style = 1 << 2,
    Layout = 1 << 3,
    Property = 1 << 4,
    Slot = 1 << 5,
    All = Text | Style | Layout | Property | Slot,
}

const quat = new Quat();

@ccclass("TextMeshLabel")
@executeInEditMode
@executionOrder(1)
export class TextMeshLabel extends UIRenderer {
    static CHAR_CLICK_EVENT = "CHAR_CLICK_EVENT";

    private _slotCreateHandlers: { [slotType: number]: SlotHandlerType } = {};
    private _slotSpriteFrameCreateHandler: SlotSpriteFrameHandlerType = null;
    private _slotPrefabCreateHandler: SlotPrefabHandlerType = null;

    @property({ serializable: true })
    private _saveTag = 0;

    @property({ visible: false, serializable: true })
    protected _fontName: string = "Arial";

    @property({ visible: false, serializable: true })
    protected _string = 'text mesh';

    @property({ visible: false, serializable: true })
    protected _color = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _rich = false;

    @property({ visible: false, serializable: true })
    protected _direction = ETextDirection.Horizontal;

    @property({ visible: false, serializable: true })
    protected _horizontalAlign: ETextHorizontalAlign = ETextHorizontalAlign.Center;

    @property({ visible: false, serializable: true })
    protected _verticalAlign: ETextVerticalAlign = ETextVerticalAlign.Middle;

    @property({ visible: false, serializable: true })
    protected _overflow: ETextOverflow = ETextOverflow.Shrink;

    @property({ visible: false, serializable: true })
    protected _enableItalic = false;

    @property({ visible: false, serializable: true })
    protected _enableUnderline = false;

    @property({ visible: false, serializable: true })
    protected _enableStrike = false;

    @property({ visible: false, serializable: true })
    protected _enableBackground = false;

    @property({ visible: false, serializable: true })
    protected _enableMask = false;

    @property({ visible: false, serializable: true })
    protected _lineSpace = 5;

    @property({ visible: false, serializable: true })
    protected _letterSpace = 0;

    @property({ visible: false, serializable: true })
    protected _enableColorRT = false;

    @property({ visible: false, serializable: true })
    protected _colorRT = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _enableColorRB = false;

    @property({ visible: false, serializable: true })
    protected _colorRB = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _enableColorLT = false;

    @property({ visible: false, serializable: true })
    protected _colorLT = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _enableColorLB = false;

    @property({ visible: false, serializable: true })
    protected _colorLB = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _backgroundColor = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _maskColor = new Color(255, 255, 255, 128);

    @property({ visible: false, serializable: true })
    protected _strokeColor = new Color(0, 0, 0, 255);

    @property({ visible: false, serializable: true })
    protected _shadow = 0;

    @property({ visible: false, serializable: true })
    protected _shadowOffsetX = 0;

    @property({ visible: false, serializable: true })
    protected _shadowOffsetY = 0;

    @property({ visible: false, serializable: true })
    protected _shadowBlur = 0.1;

    @property({ visible: false, serializable: true })
    protected _shadowColor = new Color(0, 0, 0, 255);

    @property({ visible: false, serializable: true })
    protected _useCustomShadowAlpha: boolean = false;

    @property({ visible: false, serializable: true })
    protected _handleTouchEvent = false;

    @property({ visible: false, serializable: true })
    protected _autoWarp = true;

    @property({ visible: false, serializable: true })
    protected _lineHeight = 40;

    @property({ visible: false, serializable: true })
    protected _fixedLineHeight = false;

    @property({ type: Margin, visible: false, serializable: true })
    protected _padding: Margin = new Margin;

    @property({ visible: false, serializable: true })
    protected _dilate: number = 0.2;

    @property({ visible: false, serializable: true })
    protected _stroke: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _strokeBlur: number = 0;

    @property({ visible: false, serializable: true })
    protected _useCustomStrokeAlpha: boolean = false;

    @property({ visible: false, serializable: true })
    protected _aspect: number = 1;

    @property({ visible: false, serializable: true })
    protected _charVisibleRatio = 1;

    @property({ visible: false, serializable: true })
    protected _equalWidth = false;

    @property({ visible: false, serializable: true })
    protected _overlayTexture: Texture2D = null;

    @property({ visible: false, serializable: true })
    protected _enableGlow = false;

    @property({ visible: false, serializable: true })
    protected _glowColor = new Color(255, 255, 255, 255);

    @property({ visible: false, serializable: true })
    protected _glowInner: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _glowOuter: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _glowPower: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _glowOffsetX: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _glowOffsetY: number = 0.0;

    @property({ visible: false, serializable: true })
    protected _breakWestern = false;

    @property({ visible: false, serializable: true })
    protected _enableBold: boolean = false;

    @property({ visible: false, serializable: true })
    protected _useFontPreset: boolean = TextMeshSettings.defaultUseFontPreset;

    @property({ visible: false, serializable: true })
    protected _fontSmoothness: number = 0;

    @property({ visible: false, serializable: true })
    private _fontAutoSize: boolean = false;

    @property({ visible: false, serializable: true })
    private _fontMiniSize: number = 10;

    @property({ visible: false, serializable: true })
    private _fontMaxSize: number = 40;

    @property({ visible: false, serializable: true })
    private _autoFontSize: number = 40;

    private _style: TextStyle = new TextStyle();

    private _clicks: Clickable[] = [];

    private _slots: Slot[] = [];

    // 【新增】Slot 節點回收池
    private _slotPool: { [type: string]: Node[] } = {};

    globalOffsetX = 0;
    globalOffsetY = 0;
    localOffsetX = 0;
    localOffsetY = 0;
    slotOffsetX = 0;
    slotOffsetY = 0;

    private _layoutResult: LayoutResult;
    private _dirtyFlag = EDirtyFlag.None;
    private _uiTransform: UITransform;
    private _ready = false;
    private _slotCount = 0;
    private _needUpdateAfterSlotLoaded = false;
    private _lastOpacity: number = 1;

    private _transformDirty: boolean = true;

    get transformDirty() {
        return this._transformDirty;
    }

    set transformDirty(value: boolean) {
        this._transformDirty = value;
    }

    get ready() {
        return this._ready;
    }

    get slots() {
        return this._slots;
    }

    private incrSaveTag() {
        this._saveTag++;
        this._saveTag = this._saveTag % 100000;
    }

    public get style() {
        return this._style;
    }

    get layoutResult() {
        return this._layoutResult;
    }

    private _font: TMFont;
    get font() {
        return this._font;
    }

    private _underLineInfos: TMQuadRenderData[] = [];
    get underLineInfos() {
        return this._underLineInfos;
    }

    private _strikeInfos: TMQuadRenderData[] = [];
    get strikeInfos() {
        return this._strikeInfos;
    }

    private _backgroundInfos: TMQuadRenderData[] = [];
    get backgroundInfos() {
        return this._backgroundInfos;
    }

    private _maskInfos: TMQuadRenderData[] = [];
    get maskInfos() {
        return this._maskInfos;
    }

    private _charInfos: CharInfo[] = [];
    private _tempCharInfos: CharInfo[] = [];

    get charInfos(): CharInfo[] {
        return this._charInfos;
    }

    private _typeSet: ITypeSet;
    get typeSet(): ITypeSet {
        return this._typeSet;
    }

    set font(value) {
        if (this._font === value) {
            return;
        }
        this._font = value;
        this._style.font = value;

        this.addDirtyFlag(EDirtyFlag.All);
    }

    @property({ type: Asset, visible: false, serializable: true })
    private _spriteAsset: Asset | null = null;

    @property({
        type: Asset,
        tooltip: 'ScriptAsset 的 Style 設置',
        group: { name: "StyleAsset", id: "99", displayOrder: 1 }
    })
    get spriteAsset(): Asset {
        return this._spriteAsset;
    }

    set spriteAsset(asset: Asset) {

        if (!asset) {
            this._spriteAsset = null;
            return;
        }

        if (this.isSpriteAsset(asset)) {

            if (asset.isValidAsset) {
                this._spriteAsset = asset;
                this.addDirtyFlag(EDirtyFlag.All);
            } else
                this._spriteAsset = null;

        } else {
            console.warn('傳入的 Asset 不符合 TextMeshLabelAsset 規格或已被刪除');
            this._spriteAsset = null;
        }
    }

    @property({ type: Asset, visible: false, serializable: true })
    private _styleAsset: Asset | null = null;

    @property({
        type: Asset,
        tooltip: 'ScriptAsset 的 Style 設置',
        group: { name: "StyleAsset", id: "99", displayOrder: 1 }
    })
    get styleAsset(): Asset {
        return this._styleAsset;
    }

    set styleAsset(asset: Asset) {

        if (!asset) {
            this._styleAsset = null;
            return;
        }

        if (this.isTextMeshSettings(asset)) {

            if (asset.isValidAsset) {
                this._styleAsset = asset;
                this.applyStyleSetting(asset);
            } else
                this._styleAsset = null;

        } else {
            console.warn('傳入的 Asset 不符合 TextMeshSettings 規格或已被刪除');
            this._styleAsset = null;
        }
    }

    @property({
        displayName: "Apply Style to TextMeshLabel",
        tooltip: '點擊以將當前樣式應用到 TextMeshLabel 中',
        group: { name: "StyleAsset", id: "99", displayOrder: 2 }
    })
    get applyStyle() {
        return false;
    }

    set applyStyle(value: boolean) {
        if (EDITOR && value) {
            if (!this._styleAsset) {
                console.error('[TextMeshLabel] 請先在 Inspector 中無 StyleAsset。');
                return;
            }

            if (this.isTextMeshSettings(this._styleAsset)) {
                this.applyStyleSetting(this._styleAsset);
            }
        }
    }

    @property({
        displayName: "Save Setting to Style Asset",
        tooltip: '點擊以將當前樣式儲存到 StyleAsset 中',
        group: { name: "StyleAsset", id: "99", displayOrder: 3 }
    })
    get saveStyle() {
        return false;
    }

    set saveStyle(value: boolean) {
        if (EDITOR && value) {
            if (!this._styleAsset) {
                console.error('[TextMeshLabel] 請先在 Inspector 中無 StyleAsset。');
                return;
            }

            if (this.isTextMeshSettings(this._styleAsset)) {
                this.saveStyleSetting(this._styleAsset);
            }
        }
    }

    private applyStyleSetting(settings: ITextMeshAllSettings) {
        if (!settings) {
            return;
        }

        //normal
        this.color = settings.normal.color.clone();
        // this.dilate = settings.normal.dilate;
        // this.fontSize = settings.normal.fontSize;
        // this.fontSmoothness = settings.normal.fontSmoothness;
        // this.enableItalic = settings.normal.italic;
        // this.enableUnderline = settings.normal.underline;
        // this.enableStrike = settings.normal.strike;
        // this.enableBold = settings.normal.bold;

        //layout
        // this.horizontalAlign = settings.layout.horizontalAlign;
        // this.verticalAlign = settings.layout.verticalAlign;
        // this.overflow = settings.layout.overflow;
        // this.autoWarp = settings.layout.autoWarp;
        // this.fontAutoSize = settings.layout.fontAutoSize;
        // this.fontMiniSize = settings.layout.fontMiniSize;
        // this.fontMaxSize = settings.layout.fontMaxSize;
        // this.equalWidth = settings.layout.equalWidth;
        // this.fixedLineHeight = settings.layout.fixedLineHeight;
        // this.lineHeight = settings.layout.lineHeight;
        // this.lineSpace = settings.layout.lineSpace;
        // this.letterSpace = settings.layout.letterSpace;
        // this.slotSpace = settings.layout.slotSpace;
        // this.padding = settings.layout.padding;
        // this.aspect = settings.layout.aspect;
        // this.charVisibleRatio = settings.layout.charVisibleRatio;
        // this.breakWestern = settings.layout.breakWestern;

        //style
        this.enableColorLT = settings.style.styleCorner.enableColorLT;
        this.enableColorLB = settings.style.styleCorner.enableColorLB;
        this.enableColorRT = settings.style.styleCorner.enableColorRT;
        this.enableColorRB = settings.style.styleCorner.enableColorRB
        this.colorLT = settings.style.styleCorner.colorLT.clone();
        this.colorLB = settings.style.styleCorner.colorLB.clone();
        this.colorRT = settings.style.styleCorner.colorRT.clone();
        this.colorRB = settings.style.styleCorner.colorRB.clone();
        this.enableBackground = settings.style.styleBackground.enableBackground;
        this.backgroundColor = settings.style.styleBackground.backgroundColor.clone();
        this.enableMask = settings.style.styleMask.enableMask;
        this.maskColor = settings.style.styleMask.maskColor.clone();
        this.enableGlow = settings.style.styleGlow.enableGlow;
        this.glowColor = settings.style.styleGlow.glowColor.clone();
        this.glowInner = settings.style.styleGlow.glowInner;
        this.glowOuter = settings.style.styleGlow.glowOuter;
        this.glowPower = settings.style.styleGlow.glowPower;
        this.glowOffsetX = settings.style.styleGlow.glowOffsetX;
        this.glowOffsetY = settings.style.styleGlow.glowOffsetY;

        this.stroke = settings.effect.effectStroke.stroke;
        this.useCustomStrokeAlpha = settings.effect.effectStroke.useCustomStrokeAlpha;
        this.strokeColor = settings.effect.effectStroke.strokeColor.clone();
        this.strokeBlur = settings.effect.effectStroke.strokeBlur;

        this.shadow = settings.effect.effectShadow.shadow;
        this.useCustomShadowAlpha = settings.effect.effectShadow.useCustomShadowAlpha;
        this.shadowColor = settings.effect.effectShadow.shadowColor.clone();
        this.shadowOffsetX = settings.effect.effectShadow.shadowOffsetX;
        this.shadowOffsetY = settings.effect.effectShadow.shadowOffsetY;
        this.shadowBlur = settings.effect.effectShadow.shadowBlur;

        this.addDirtyFlag(EDirtyFlag.All);
    }

    private saveStyleSetting(settings: ITextMeshAllSettings) {

        // normal
        settings.normal.color = this.color.clone();
        // settings.normal.dilate = this.dilate;
        // settings.normal.fontSize = this.fontSize;
        // settings.normal.fontSmoothness = this.fontSmoothness;
        // settings.normal.italic = this.enableItalic;
        // settings.normal.underline = this.enableUnderline;
        // settings.normal.strike = this.enableStrike;
        // settings.normal.bold = this.enableBold;

        // layout
        // settings.layout.horizontalAlign = this.horizontalAlign;
        // settings.layout.verticalAlign = this.verticalAlign;
        // settings.layout.overflow = this.overflow;
        // settings.layout.autoWarp = this.autoWarp;
        // settings.layout.fontAutoSize = this.fontAutoSize;
        // settings.layout.fontMiniSize = this.fontMiniSize;
        // settings.layout.fontMaxSize = this.fontMaxSize;
        // settings.layout.equalWidth = this.equalWidth;
        // settings.layout.fixedLineHeight = this.fixedLineHeight;
        // settings.layout.lineHeight = this.lineHeight;
        // settings.layout.lineSpace = this.lineSpace;
        // settings.layout.letterSpace = this.letterSpace;
        // settings.layout.slotSpace = this.slotSpace;
        // settings.layout.padding = this.padding;
        // settings.layout.aspect = this.aspect;
        // settings.layout.charVisibleRatio = this.charVisibleRatio;
        // settings.layout.breakWestern = this.breakWestern;

        // style
        settings.style.styleCorner.enableColorLT = this.enableColorLT;
        settings.style.styleCorner.enableColorLB = this.enableColorLB;
        settings.style.styleCorner.enableColorRT = this.enableColorRT;
        settings.style.styleCorner.enableColorRB = this.enableColorRB;
        settings.style.styleCorner.colorLT = this.colorLT.clone();
        settings.style.styleCorner.colorLB = this.colorLB.clone();
        settings.style.styleCorner.colorRT = this.colorRT.clone();
        settings.style.styleCorner.colorRB = this.colorRB.clone();
        settings.style.styleBackground.enableBackground = this.enableBackground;
        settings.style.styleBackground.backgroundColor = this.backgroundColor.clone();
        settings.style.styleMask.enableMask = this.enableMask;
        settings.style.styleMask.maskColor = this.maskColor.clone();
        settings.style.styleGlow.enableGlow = this.enableGlow;
        settings.style.styleGlow.glowColor = this.glowColor.clone();
        settings.style.styleGlow.glowInner = this.glowInner;
        settings.style.styleGlow.glowOuter = this.glowOuter;
        settings.style.styleGlow.glowPower = this.glowPower;
        settings.style.styleGlow.glowOffsetX = this.glowOffsetX;
        settings.style.styleGlow.glowOffsetY = this.glowOffsetY;

        // effect
        settings.effect.effectStroke.stroke = this.stroke;
        settings.effect.effectStroke.useCustomStrokeAlpha = this.useCustomStrokeAlpha;
        settings.effect.effectStroke.strokeColor = this.strokeColor.clone();
        settings.effect.effectStroke.strokeBlur = this.strokeBlur;

        settings.effect.effectShadow.shadow = this.shadow;
        settings.effect.effectShadow.useCustomShadowAlpha = this.useCustomShadowAlpha;
        settings.effect.effectShadow.shadowColor = this.shadowColor.clone();
        settings.effect.effectShadow.shadowOffsetX = this.shadowOffsetX;
        settings.effect.effectShadow.shadowOffsetY = this.shadowOffsetY;
        settings.effect.effectShadow.shadowBlur = this.shadowBlur;

        settings.save();
    }

    @property({ type: Node, displayOrder: 3, tooltip: 'i18n:text-mesh.label.slotsContainer' })
    public slotsContainer: Node = null;

    //#region "Group Normal"

    /**
     * @en
     * Content string of label.
     *
     * @zh
     * 标签显示的文本内容。
     */
    @property({ displayOrder: 2, tooltip: '', multiline: true, group: { name: "Normal", id: "1" } })
    get string() {
        return this._string;
    }

    set string(value) {
        if (value === null || value === undefined) {
            value = '';
        } else {
            value = value.toString();
        }

        // 【核心修正】將字串中手動輸入的 "\\n" 轉換為真正的換行符 "\n"
        value = value.replace(/\\n/g, '\n');

        if (this._string === value) {
            return;
        }

        this._string = value;

        this.addDirtyFlag(EDirtyFlag.Text | EDirtyFlag.Layout);
    }

    @property({ type: Enum(FontType), displayOrder: 1, tooltip: '', group: { name: "Normal", id: "1" } })
    public get fontName() {
        return this._fontName;
    }

    public set fontName(value: string) {

        if (this._fontName === value) {
            return;
        }

        this._fontName = value;
        if (value) {
            this._loadFont();
        } else {
            this._font = null;
        }
    }

    private _loadFont() {

        if (!this._fontName) {
            this._onTMFLoaded(null);
            return;
        }

        let fnt = FM.getFont(this._fontName);

        if (fnt) {
            this._onTMFLoaded(fnt);
        } else {
            FM.getFontAsync(this._fontName).then((font: TMFont) => {
                this._onTMFLoaded(font);
            });
        }
    }

    @property({ type: Color, displayOrder: 3, override: true, group: { name: "Normal", id: "1" } })
    get color() {
        return this._color;
    }

    set color(value: Color) {
        if (this._color.equals(value)) {
            return;
        }
        this._color.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);

        // this._updateColor();
        if (EDITOR) {
            const clone = value.clone();
            this.node.emit(Node.EventType.COLOR_CHANGED, clone);
        }
    }

    @property({ visible: false, serializable: true })
    private _fontSize = 24;

    /**
     * @en
     * font size
     *
     * @zh
     * 字体大小。
     */
    @property({ displayOrder: 3, tooltip: '', group: { name: "Normal", id: "1" } })
    get fontSize() {
        // if (this._autoSize) {
        //     return this._autoFontSize;
        // }
        return this._fontSize;
    }

    get autoFontSize() {
        if (this._autoFontSize) {
            return this._autoFontSize;
        }

        return this._fontSize;
    }

    set fontSize(val: number) {
        if (this._fontSize != val) {
            this._fontSize = val;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return !this._useFontPreset;
        }, displayOrder: 5, min: 0, max: 1, step: 0.01, slide: true, group: { name: "Normal", id: "1" }
    })
    get dilate() {
        return this._dilate;
    }

    set dilate(value: number) {
        if (value != this._dilate) {
            this._dilate = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        displayOrder: 4,
        min: 0,
        max: 100, // <-- 修改最大值
        step: 1,  // <-- 修改步長
        slide: true,
        group: { name: "Normal", id: "1" },
        tooltip: '控制原始字體邊緣的柔和度(輸入1代表0.01)，不受描邊影響。' // <-- 修改提示文字
    })
    get fontSmoothness() {
        return this._fontSmoothness;
    }

    set fontSmoothness(value: number) {
        if (this._fontSmoothness === value) {
            return;
        }
        this._fontSmoothness = value;
        this.addDirtyFlag(EDirtyFlag.Property);
    }

    @property({ displayOrder: 5, group: { name: "Normal", id: "1" } })
    get rich() {
        return this._rich;
    }

    set rich(value) {
        value = !!value;

        if (this._rich === value) {
            return;
        }

        this._rich = value;

        this.addDirtyFlag(EDirtyFlag.Text | EDirtyFlag.Layout);
    }

    @property({ displayOrder: 9, group: { name: "Normal", id: "1" } })
    get enableItalic() {
        return this._enableItalic;
    }

    set enableItalic(value: boolean) {
        if (value != this._enableItalic) {
            this._enableItalic = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 10, group: { name: "Normal", id: "1" } })
    get enableUnderline() {
        return this._enableUnderline;
    }

    set enableUnderline(value: boolean) {
        if (value != this._enableUnderline) {
            this._enableUnderline = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 11, group: { name: "Normal", id: "1" } })
    get enableStrike() {
        return this._enableStrike;
    }

    set enableStrike(value: boolean) {
        if (value != this._enableStrike) {
            this._enableStrike = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    //#endregion

    //#region "Layout"

    @property({ type: ETextHorizontalAlign, displayOrder: 12, group: "Layout" })
    get horizontalAlign() {
        return this._horizontalAlign;
    }

    set horizontalAlign(value: ETextHorizontalAlign) {
        if (value != this._horizontalAlign) {
            this._horizontalAlign = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ type: ETextVerticalAlign, displayOrder: 13, group: "Layout" })
    get verticalAlign() {
        return this._verticalAlign;
    }

    set verticalAlign(value: ETextVerticalAlign) {
        if (value != this._verticalAlign) {
            this._verticalAlign = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ type: ETextOverflow, displayOrder: 14, group: "Layout" })
    get overflow() {
        return this._overflow;
    }

    set overflow(value: ETextOverflow) {
        if (value != this._overflow) {
            this._overflow = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 15, group: "Layout" })
    get autoWarp() {
        return this._autoWarp;
    }

    set autoWarp(value: boolean) {
        if (value != this._autoWarp) {
            this._autoWarp = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        displayOrder: 16, group: "Layout",
        visible: function () {
            return this._overflow === ETextOverflow.Shrink;
        }
    })
    get fontAutoSize() {
        return this._fontAutoSize;
    }

    set fontAutoSize(value: boolean) {
        if (this._fontAutoSize !== value) {
            this._fontAutoSize = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        displayOrder: 17, group: "Layout",
        visible: function () {
            return this._overflow === ETextOverflow.Shrink && this._autoSize;
        }
    })
    get fontMiniSize() {
        return this._fontMiniSize;
    }

    set fontMiniSize(value: number) {
        if (this._fontMiniSize !== value) {
            this._fontMiniSize = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        displayOrder: 18, group: "Layout",
        visible: function () {
            return this._overflow === ETextOverflow.Shrink && this._autoSize;
        }
    })
    get fontMaxSize() {
        return this._fontMaxSize;
    }

    set fontMaxSize(value: number) {
        if (this._fontMaxSize !== value) {
            this._fontMaxSize = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        displayOrder: 19, group: "Layout",
        readonly: true,
        visible: function () {
            return this._overflow === ETextOverflow.Shrink && this._autoSize;
        }
    })
    get curAutoFontSize() {
        return this._autoFontSize;
    }

    @property({ displayOrder: 20, group: "Layout" })
    get equalWidth() {
        return this._equalWidth;
    }

    set equalWidth(value: boolean) {
        if (value != this._equalWidth) {
            this._equalWidth = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 21, group: "Layout" })
    get fixedLineHeight() {
        return this._fixedLineHeight;
    }

    set fixedLineHeight(value: boolean) {
        if (value != this._fixedLineHeight) {
            this._fixedLineHeight = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return this._fixedLineHeight
        }, displayOrder: 22, group: "Layout"
    })
    get lineHeight() {
        return this._lineHeight;
    }

    set lineHeight(value: number) {
        if (value != this._lineHeight) {
            this._lineHeight = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 27, group: "Layout" })
    get lineSpace() {
        return this._lineSpace;
    }

    set lineSpace(value: number) {
        if (value != this._lineSpace) {
            this._lineSpace = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 28, group: "Layout" })
    get letterSpace() {
        return this._letterSpace;
    }

    set letterSpace(value: number) {
        if (value != this._letterSpace) {
            this._letterSpace = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ serializable: true })
    protected _slotSpace = 5;

    /**
     * @zh
     * Slot (圖片或 Prefab) 與後續文字的額外間距。
     */
    @property({
        displayOrder: 29, // 讓它顯示在 letterSpace 後面
        group: "Layout",
        tooltip: 'Slot (圖片或 Prefab) 與後續文字的額外間距'
    })
    get slotSpace() {
        return this._slotSpace;
    }

    set slotSpace(value: number) {
        if (this._slotSpace !== value) {
            this._slotSpace = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 29, group: "Layout" })
    get padding() {
        return this._padding;
    }

    set padding(value: Margin) {
        if (value != this._padding) {
            this._padding = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    //#endregion

    //#region "Style"

    @property({ displayOrder: 4, group: "Style" })
    get enableColorRT() {
        return this._enableColorRT;
    }

    set enableColorRT(value: boolean) {
        if (value != this._enableColorRT) {
            this._enableColorRT = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._enableColorRT
        }, type: Color, displayOrder: 5, group: "Style"
    })
    get colorRT() {
        return this._colorRT;
    }

    set colorRT(value: Color) {
        if (this._colorRT.equals(value)) {
            return;
        }

        this._colorRT.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 6, group: "Style" })
    get enableColorRB() {
        return this._enableColorRB;
    }

    set enableColorRB(value: boolean) {
        if (value != this._enableColorRB) {
            this._enableColorRB = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._enableColorRB
        }, type: Color, displayOrder: 7, group: "Style"
    })
    get colorRB() {
        return this._colorRB;
    }

    set colorRB(value: Color) {
        if (this._colorRB.equals(value)) {
            return;
        }

        this._colorRB.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 8, group: "Style" })
    get enableColorLT() {
        return this._enableColorLT;
    }

    set enableColorLT(value: boolean) {
        if (value != this._enableColorLT) {
            this._enableColorLT = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._enableColorLT
        }, type: Color, displayOrder: 9, group: "Style"
    })
    get colorLT() {
        return this._colorLT;
    }

    set colorLT(value: Color) {
        if (this._colorLT.equals(value)) {
            return;
        }

        this._colorLT.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 10, group: "Style" })
    get enableColorLB() {
        return this._enableColorLB;
    }

    set enableColorLB(value: boolean) {
        if (value != this._enableColorLB) {
            this._enableColorLB = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._enableColorLB
        }, type: Color, displayOrder: 11, group: "Style"
    })
    get colorLB() {
        return this._colorLB;
    }

    set colorLB(value: Color) {
        if (this._colorLB.equals(value)) {
            return;
        }

        this._colorLB.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 15, group: "Style" })
    get enableBackground() {
        return this._enableBackground;
    }

    set enableBackground(value: boolean) {
        if (value != this._enableBackground) {
            this._enableBackground = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return this._enableBackground
        }, displayOrder: 16, group: "Style"
    })
    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(value: Color) {
        if (this._backgroundColor.equals(value)) {
            return;
        }

        this._backgroundColor.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 17, group: "Style" })
    get enableMask() {
        return this._enableMask;
    }

    set enableMask(value: boolean) {
        if (value != this._enableMask) {
            this._enableMask = value;

            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return this._enableMask
        }, displayOrder: 18, group: "Style"
    })
    get maskColor() {
        return this._maskColor;
    }

    set maskColor(value: Color) {
        if (this._maskColor.equals(value)) {
            return;
        }

        this._maskColor.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    //#endregion


    @property({ displayOrder: 30, min: 0, max: 1, step: 0.001, slide: true, group: "Stroke" })
    get stroke() {
        return this._stroke;
    }

    set stroke(value: number) {
        if (value != this._stroke) {
            this._stroke = value;
            this.addDirtyFlag(EDirtyFlag.Style | EDirtyFlag.Layout);
        }
    }

    @property({
        displayName: "Use Custom Alpha",
        tooltip: 'If true, use the alpha from the stroke color. If false, use the alpha from the main font color.',
        visible: function () {
            return this._stroke > 0;
        }, displayOrder: 31, group: "Stroke"
    })
    get useCustomStrokeAlpha() {
        return this._useCustomStrokeAlpha;
    }

    set useCustomStrokeAlpha(value: boolean) {
        if (this._useCustomStrokeAlpha !== value) {
            this._useCustomStrokeAlpha = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._stroke > 0;
        }, displayOrder: 32, min: 0, max: 1, step: 0.001, slide: true, group: "Stroke"
    })
    get strokeBlur() {
        return this._strokeBlur;
    }

    set strokeBlur(value: number) {
        if (value !== this._strokeBlur) {
            this._strokeBlur = value;
            this.addDirtyFlag(EDirtyFlag.Style | EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () { // Now depends on useCustomStrokeColor
            return this._stroke > 0;
        }, type: Color, displayOrder: 33, group: "Stroke"
    })
    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value: Color) {
        if (this._strokeColor.equals(value)) {
            return;
        }

        this._strokeColor.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 34, min: 0, max: 1, step: 0.001, slide: true, group: "Shadow" })
    get shadow() {
        return this._shadow;
    }

    set shadow(value: number) {
        if (value != this._shadow) {
            this._shadow = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        displayName: "Use Custom Alpha",
        tooltip: 'If true, use the alpha from the shadow color. If false, use the alpha from the main font color.',
        visible: function () {
            return this._shadow > 0;
        }, displayOrder: 35, group: "Shadow"
    })
    get useCustomShadowAlpha() {
        return this._useCustomShadowAlpha;
    }

    set useCustomShadowAlpha(value: boolean) {
        if (this._useCustomShadowAlpha !== value) {
            this._useCustomShadowAlpha = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._shadow > 0
        }, displayOrder: 35, min: 0, max: 1, step: 0.001, slide: true, group: "Shadow"
    })
    get shadowBlur() {
        return this._shadowBlur;
    }

    set shadowBlur(value: number) {
        if (value != this._shadowBlur) {
            this._shadowBlur = value;
            this.addDirtyFlag(EDirtyFlag.Style);
        }
    }

    @property({
        visible: function () {
            return this._shadow > 0;
        }, displayOrder: 36, min: -100, max: 100, step: 0.1, slide: true, group: "Shadow"
    })
    get shadowOffsetX() {
        return this._shadowOffsetX;
    }

    set shadowOffsetX(value: number) {
        if (value != this._shadowOffsetX) {
            this._shadowOffsetX = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return this._shadow > 0;
        }, displayOrder: 37, min: -100, max: 100, step: 0.1, slide: true, group: "Shadow"
    })
    get shadowOffsetY() {
        return this._shadowOffsetY;
    }

    set shadowOffsetY(value: number) {
        if (value != this._shadowOffsetY) {
            this._shadowOffsetY = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({
        visible: function () {
            return this._shadow > 0;
        }, type: Color, displayOrder: 38, group: "Shadow"
    })
    get shadowColor() {
        return this._shadowColor;
    }

    set shadowColor(value: Color) {
        if (this._shadowColor.equals(value)) {
            return;
        }

        this._shadowColor.set(value);
        this.addDirtyFlag(EDirtyFlag.Style);
    }

    @property({ displayOrder: 39, min: 0, max: 3, step: 0.01, slide: true, group: "Layout" })
    get aspect() {
        return this._aspect;
    }

    set aspect(value: number) {
        if (value != this._aspect) {
            this._aspect = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ displayOrder: 40, min: 0, max: 1, step: 0.01, slide: true, group: "Layout" })
    get charVisibleRatio() {
        return this._charVisibleRatio;
    }

    set charVisibleRatio(value: number) {
        if (this._charVisibleRatio != value) {
            this._charVisibleRatio = math.clamp01(value);

            let showIndex = this._charInfos.length * this._charVisibleRatio;
            for (let i = 0; i < this._charInfos.length; i++) {
                let charInfo = this._charInfos[i];
                let visible = i < showIndex;
                if (charInfo.slot) {
                    charInfo.slot.node.active = visible;
                }
                charInfo.visible = visible;
            }
        }
    }

    @property({ type: Texture2D, displayOrder: 41, group: "Style" })
    get overlayTexture() {
        return this._overlayTexture;
    }

    set overlayTexture(value: Texture2D) {
        if (value != this._overlayTexture) {
            this._overlayTexture = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({ displayOrder: 42, group: "Style" })
    get enableGlow() {
        return this._enableGlow;
    }

    set enableGlow(value: boolean) {
        if (value != this._enableGlow) {
            this._enableGlow = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 43, group: "Style"
    })
    get glowColor() {
        return this._glowColor;
    }

    set glowColor(value: Color) {
        if (this._glowColor.equals(value)) {
            return;
        }

        this._glowColor.set(value);
        this.addDirtyFlag(EDirtyFlag.Property);
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 44, min: 0, max: 1, step: 0.01, slide: true, group: "Style"
    })
    get glowInner() {
        return this._glowInner;
    }

    set glowInner(value: number) {
        if (value != this._glowInner) {
            this._glowInner = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 45, min: 0, max: 1, step: 0.01, slide: true, group: "Style"
    })
    get glowOuter() {
        return this._glowOuter;
    }

    set glowOuter(value: number) {
        if (value != this._glowOuter) {
            this._glowOuter = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 46, min: 0, max: 10, step: 0.01, slide: true, group: "Style"
    })
    get glowPower() {
        return this._glowPower;
    }

    set glowPower(value: number) {
        if (value != this._glowPower) {
            this._glowPower = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 47,
        min: -100,
        max: 100,
        step: 0.1,
        slide: true,
        group: "Style",
        tooltip: '控制光暈的水平偏移'
    })
    get glowOffsetX() {
        return this._glowOffsetX;
    }

    set glowOffsetX(value: number) {
        if (value != this._glowOffsetX) {
            this._glowOffsetX = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({
        visible: function () {
            return this._enableGlow
        }, displayOrder: 48,
        min: -100,
        max: 100,
        step: 0.1,
        slide: true,
        group: "Style",
        tooltip: '控制光暈的垂直偏移'
    })
    get glowOffsetY() {
        return this._glowOffsetY;
    }

    set glowOffsetY(value: number) {
        if (value != this._glowOffsetY) {
            this._glowOffsetY = value;
            this.addDirtyFlag(EDirtyFlag.Property);
        }
    }

    @property({ visible: true, group: "Layout" })
    get breakWestern() {
        return this._breakWestern;
    }

    set breakWestern(value: boolean) {
        if (value != this._breakWestern) {
            this._breakWestern = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ visible: true, group: { name: "Normal", id: "1" } })
    get enableBold() {
        return this._enableBold;
    }

    set enableBold(value: boolean) {
        if (value != this._enableBold) {
            this._enableBold = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    @property({ visible: true, displayOrder: 3 })
    get useFontPreset() {
        return this._useFontPreset;
    }

    set useFontPreset(value: boolean) {
        if (value != this._useFontPreset) {
            this._useFontPreset = value;
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
    }

    get handleTouchEvent() {
        return this._handleTouchEvent;
    }

    set handleTouchEvent(value) {
        if (this._handleTouchEvent === value) {
            return;
        }

        this._handleTouchEvent = value;
        if (this.enabledInHierarchy) {
            if (this.handleTouchEvent) {
                this._addEventListeners();
            } else {
                this._removeEventListeners();
            }
        }
    }

    get uiTransform() {
        return this._uiTransform;
    }

    get renderEntity() {
        return this._renderEntity;
    }

    onLoad() {
        this._uiTransform = this.node.getComponent(UITransform);

        this._assembler = TextMeshAssembler;

        this.node.on(Node.EventType.LAYER_CHANGED, this._applyLayer, this);
        this.node.on(Node.EventType.ANCHOR_CHANGED, this._onAnchorChanged, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this._onTransformChanged, this);

        this._style.preset();
        this._typeSet = TypeSetFactory.get("horizontal");

        this._padding.onChanged = (() => {
            this.addDirtyFlag(EDirtyFlag.Layout);
        }).bind(this);

        this.clearEditorSlots();

        this._loadFont();
    }

    public onFocusInEditor() {
        this._loadFont();
    }

    private clearEditorSlots() {
        var children = this.node.children.slice();
        children.forEach((child) => {
            if (child.name.startsWith("slot_(")) {
                child.removeFromParent();
                child.destroy();
            }
        });

        if (this.slotsContainer) {
            children = this.slotsContainer.children.slice();
            children.forEach((child) => {
                if (child.name.startsWith("slot_(")) {
                    let conn = child.getComponent(SlotConnector);
                    if (!conn || conn.labelNode == this.node) {
                        child.removeFromParent();
                        child.destroy();
                    }
                }
            });
        }
    }

    private _onTMFLoaded(font: TMFont) {
        this._font = font;
        this._style.font = font;
        if (font) {
            this.customMaterial = font.material;
        }

        this.addDirtyFlag(EDirtyFlag.All);
    }

    private _updateStyle(style: TextStyle) {
        const font = this._font;
        const fontSize = this.autoFontSize;
        style.setFontSize(fontSize);

        const cascadeOpacity = this._lastOpacity;

        const finalColor = this._color.clone();
        finalColor.a = Math.floor(this._color.a * cascadeOpacity);
        style.setFillColor(finalColor);

        const scale = fontSize / font.fontSize;
        style.setStroke((this._stroke * this.font.strokeScale) / 4.0);
        style.setStrokeBlur(this._stroke > 0 ? this._strokeBlur : 0);

        const finalStrokeColor = this._strokeColor.clone();
        if (!this._useCustomStrokeAlpha) {
            finalStrokeColor.a = finalColor.a;
        } else {
            finalStrokeColor.a = Math.floor(this._strokeColor.a * cascadeOpacity);
        }
        style.setStrokeColor(finalStrokeColor);

        // 3. 陰影顏色
        style.setShadow(this._shadow);
        const finalShadowColor = this._shadowColor.clone();
        if (!this._useCustomShadowAlpha) {
            finalShadowColor.a = finalColor.a;
        } else {
            finalShadowColor.a = Math.floor(this._shadowColor.a * cascadeOpacity);
        }
        style.setShadowColor(finalShadowColor);

        // 4. 其餘裝飾顏色 (背景/遮罩)
        if (this._enableBackground) {
            const finalBgColor = this._backgroundColor.clone();
            finalBgColor.a = Math.floor(this._backgroundColor.a * cascadeOpacity);
            style.setBackgroundColor(finalBgColor);
        }

        if (this._enableMask) {
            const finalMaskColor = this._maskColor.clone();
            finalMaskColor.a = Math.floor(this._maskColor.a * cascadeOpacity);
            style.setMaskColor(finalMaskColor);
        }

        if (this._enableColorLB) {
            const c = this._colorLB.clone();
            c.a = Math.floor(this._colorLB.a * cascadeOpacity);
            style.setColorLB(c);
        }
        if (this._enableColorLT) {
            const c = this._colorLT.clone();
            c.a = Math.floor(this._colorLT.a * cascadeOpacity);
            style.setColorLT(c);
        }
        if (this._enableColorRT) {
            const c = this._colorRT.clone();
            c.a = Math.floor(this._colorRT.a * cascadeOpacity);
            style.setColorRT(c);
        }
        if (this._enableColorRB) {
            const c = this._colorRB.clone();
            c.a = Math.floor(this._colorRB.a * cascadeOpacity);
            style.setColorRB(c);
        }

        style.setShadowOffsetX(this._shadowOffsetX, true);
        style.setShadowOffsetY(this._shadowOffsetY, true);
        style.setUnderline(this._enableUnderline);
        style.setBackground(this._enableBackground);
        style.setItalic(this._enableItalic);
        style.setStrike(this._enableStrike);
        style.setLetterSpace(this._letterSpace, true);
        style.setLineSpace(this._lineSpace, true);

        if (this._useFontPreset) {
            style.setDilate(this._enableBold ? font.normalWeight * this._font.boldWeightScale : font.normalWeight);
            style.setShadowBlur(font.shadowBlur * scale);
        } else {
            style.setDilate(this._enableBold ? this._dilate * this._font.boldWeightScale : this._dilate);
            style.setShadowBlur(this._shadowBlur * scale);
        }

        style.calculate();
    }


    private _updateAllStyles(needResetChar?: boolean) {
        let style = this._style;
        this._updateStyle(style);

        for (let i = 0; i < this._backgroundInfos.length; i++) {
            let info = this._backgroundInfos[i];
            let infoStyle = info.charInfo.style;
            if (infoStyle != style) {
                infoStyle.setBackground(this._enableBackground);
                infoStyle.setBackgroundColor(this._backgroundColor);
                infoStyle.setColorLB(this._backgroundColor);
                infoStyle.setColorLT(this._backgroundColor);
                infoStyle.setColorRT(this._backgroundColor);
                infoStyle.setColorRB(this._backgroundColor);
            }
        }

        for (let i = 0; i < this._charInfos.length; i++) {
            let charInfo = this._charInfos[i];
            if (style != charInfo.style) {
                this._updateStyle(charInfo.style);
                style = charInfo.style;
            }
        }

        for (let i = 0; i < this._maskInfos.length; i++) {
            let info = this._maskInfos[i];
            let infoStyle = info.charInfo.style;
            if (infoStyle.style != style) {
                infoStyle.setMask(this._enableMask);
                infoStyle.setMaskColor(this._maskColor);
                infoStyle.setColorLB(this._maskColor);
                infoStyle.setColorLT(this._maskColor);
                infoStyle.setColorRT(this._maskColor);
                infoStyle.setColorRB(this._maskColor);
            }
        }

        let assembler = this._assembler;
        assembler.updateColors(this);
        assembler.updateOthers(this);
    }

    onEnable() {
        super.onEnable();

        if (this.handleTouchEvent) {
            this._addEventListeners();
        }

        if (this._styleAsset && this.isTextMeshSettings(this._styleAsset)) {
            this.applyStyleSetting(this._styleAsset);
        } else {
            this._lastOpacity = this._getFinalCascadeOpacity();
            this.addDirtyFlag(EDirtyFlag.All);
        }
    }

    onDisable() {
        super.onDisable();

        if (this.handleTouchEvent) {
            this._removeEventListeners();
        }
    }

    onDestroy() {
        super.onDestroy();

        this.node.off(Node.EventType.LAYER_CHANGED, this._applyLayer, this);
        this.node.off(Node.EventType.ANCHOR_CHANGED, this._onAnchorChanged, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);

        if (EDITOR) {
            //@ts-ignore
            Editor.Message.removeBroadcastListener("textmesh:tmf-refresh", this._onEditorTMFChanged.bind(this));
        }

        this._slots.length = 0;
        this._slotPool = {};
    }

    private _addEventListeners() {
        this.node.on('touch-end', this._onTouchEnded, this);

        if (EDITOR) {
            //@ts-ignore
            Editor.Message.addBroadcastListener("textmesh:tmf-refresh", this._onEditorTMFChanged.bind(this));
        }
    }

    private _removeEventListeners() {
        this.node.off('touch-end', this._onTouchEnded, this);
        if (EDITOR) {
            //@ts-ignore
            Editor.Message.removeBroadcastListener("textmesh:tmf-refresh", this._onEditorTMFChanged.bind(this));
        }
    }

    private _onEditorTMFChanged(uuid: string, model: any) {
        if (this._font && this._font.uid == uuid) {
            this.incrSaveTag();

            let data = JSON.parse(model);
            let font = this._font;
            //@ts-ignore
            font._underLineOffset = data.underLineOffset || 0;
            //@ts-ignore
            font._keepUnlderLineSpace = data.keepUnlderLineSpace || false;
            //@ts-ignore
            font._underLineThickness = data.underLineThickness || 0;
            //@ts-ignore
            font._strikeOffset = data.strikeOffset || 0;
            //@ts-ignore
            font._strikeThickness = data.strikeThickness || 0;
            //@ts-ignore
            font._scriptThickness = data.scriptThickness || 0;

            this.addDirtyFlag(EDirtyFlag.All);
        }
    }

    protected _onTouchEnded(event: EventTouch) {
        let pos = event.getLocation(vec2_temp);
        let info = this._typeSet.hitTest(this, pos);
        if (info?.result) {
            click_char_event.accurate = info.accurate;
            click_char_event.charInfo = info.charInfo;
            this.node.emit(TextMeshLabel.CHAR_CLICK_EVENT, click_char_event, event);
        }
        // event.propagationStopped = true;
    }

    private _setLayer(node: Node, layer: number) {
        if (node) {
            node.layer = layer;
            for (let i = 0; i < node.children.length; i++) {
                this._setLayer(node.children[i], layer);
            }
        }
    }

    protected _applyLayer() {
        for (const slot of this._slots) {
            this._setLayer(slot.node, this.node.layer);
        }
    }

    protected _onAnchorChanged() {
        this.addDirtyFlag(EDirtyFlag.Layout);
    }

    protected _onSizeChanged() {
        this.addDirtyFlag(EDirtyFlag.Layout);
    }

    protected _onTransformChanged() {
        this._transformDirty = true;
    }

    protected _render(render: __private._cocos_2d_renderer_i_batcher__IBatcher) {
        // 【核心修正】：獲取級聯透明度
        const finalOpacity = this._getFinalCascadeOpacity();

        // 如果透明度發生變化，標記 Style 為髒，觸發頂點顏色更新
        if (finalOpacity !== this._lastOpacity) {
            this._lastOpacity = finalOpacity;
            this.addDirtyFlag(EDirtyFlag.Style);
        }

        //@ts-ignore
        render.commitComp(this, this.renderData, this._font?.fontData.texture, this._assembler!, null);
    }

    public requestRenderData(drawInfoType = 0) {
        const data: any = RenderData.add(vfmtTMVertex);
        if (data.requestRenderData) {
            data.initRenderDrawInfo(this, drawInfoType);
        }
        this._renderData = data;
        return data;
    }

    getRenderElementCount() {
        return this._backgroundInfos.length +
            this._underLineInfos.length +
            this._charInfos.length +
            this._strikeInfos.length +
            this._maskInfos.length;
    }

    getRenderElement(index: number) {
        if (index < this._backgroundInfos.length) {
            return this._backgroundInfos[index].charInfo;
        }
        index -= this._backgroundInfos.length;
        if (index < this._underLineInfos.length) {
            return this._underLineInfos[index].charInfo;
        }
        index -= this._underLineInfos.length;
        if (index < this._charInfos.length) {
            return this._charInfos[index];
        }
        index -= this._charInfos.length;
        if (index < this._strikeInfos.length) {
            return this._strikeInfos[index].charInfo;
        }
        index -= this._strikeInfos.length;
        if (index < this._maskInfos.length) {
            return this._maskInfos[index].charInfo;
        }
    }

    protected _flushAssembler() {
        const assembler = this._assembler;
        if (!assembler) {
            return;
        }

        if (!this._renderData) {
            if (assembler.createData) {
                this._renderData = assembler.createData(this) as RenderData;
                this._renderData!.material = this.getRenderMaterial(0);
            }
        }
    }

    /**
     * 修复合批问题
     * @param index
     * @returns
     */
    public getRenderMaterial(index: number): Material | null {
        if (!this.renderData) {
            return null;
        }

        return this.renderData.material || this._materialInstances[index] || this._materials[index];
    }

    markForUpdateRenderData(enable: boolean = true) {
        super.markForUpdateRenderData(enable);
    }

    updateRenderData(force = false) {
        if (force || !this._renderData) {
            this._flushAssembler();
            this._applyFontTexture();

            if (this.renderData) {
                this.renderData.vertDirty = true;
            }
        }

        if (this._assembler) {
            this._assembler.updateRenderData(this);
        }
    }

    setSlotCreateHandler(type: ESlotType, handler: SlotHandlerType) {
        this._slotCreateHandlers[type] = handler;
    }

    setSlotSpriteFrameCreateHandler(handler: SlotSpriteFrameHandlerType) {
        this._slotSpriteFrameCreateHandler = handler;
    }

    setSlotPrefabCreateHandler(handler: SlotPrefabHandlerType) {
        this._slotPrefabCreateHandler = handler;
    }

    makeDirty(dirtyFlag: EDirtyFlag) {
        this.dirtyFlag |= dirtyFlag;
    }

    updateMaterial(): void {
        //@ts-ignore
        super.updateMaterial();
        if (!this._customMaterial) {
            return;
        }

        let material = this.getMaterialInstance(0);

        if (!material)
            return;

        const useOverlay = this._overlayTexture != null;

        // Pass 0: 光暈模式 (IS_GLOW_PASS = true, IS_SHADOW_PASS = false)
        material.recompileShaders({
            "IS_SHADOW_PASS": false,
            "IS_GLOW_PASS": true,
            "USE_GLOW": this._enableGlow,
            "USE_OVERLAY_TEXTURE": false
        }, 0);

        // Pass 1: 陰影模式 (IS_SHADOW_PASS = true, 其他關閉)
        material.recompileShaders({
            "IS_SHADOW_PASS": true,
            "IS_GLOW_PASS": false,
            "USE_GLOW": false,
            "USE_OVERLAY_TEXTURE": false
        }, 1);

        // Pass 2: 主體模式 (所有效果 Pass 標籤設為 false)
        material.recompileShaders({
            "IS_SHADOW_PASS": false,
            "IS_GLOW_PASS": false,
            "USE_GLOW": false, // 主體 Pass 不需要計算 Glow
            "USE_OVERLAY_TEXTURE": useOverlay
        }, 2);

        // 更新具體屬性數值 (Property)
        this._updateMaterialProperties(material);

        if (this._renderData) {
            this._renderData.material = material;
        }
        this.markForUpdateRenderData();
    }

    private _updateMaterialProperties(material: Material) {
        // 處理 Glow 數值
        if (this._enableGlow) {
            const finalGlowColor = this._glowColor.clone();
            material.setProperty("glowColor", finalGlowColor);
            material.setProperty("glowInner", this._glowInner);
            material.setProperty("glowOuter", this._glowOuter);
            material.setProperty("glowPower", this._glowPower);
            material.setProperty("glowOffset", v2(this._glowOffsetX, this._glowOffsetY));
        }

        // 處理 Overlay 紋理
        if (this._overlayTexture) {
            material.setProperty("overlayTexture", this._overlayTexture);
        }

        // 處理字體平滑度 (注意除以 100 的邏輯)
        material.setProperty('fontSmoothness', this._fontSmoothness / 100.0);

        return true;
    }

    private _applyFontTexture() {
    }

    private _updateLayout() {
        // 步驟 1：計算出最終應該使用的字體大小 (finalSize)
        let finalSize: number;

        if (this._overflow === ETextOverflow.Shrink && this._fontAutoSize) {
            const { width: containerWidth, height: containerHeight } = this._uiTransform.contentSize;
            const miniSize = this._fontMiniSize; // 使用一個常數來避免混淆
            const maxSize = this._fontMaxSize;

            let low = miniSize;
            let high = maxSize;

            // 💡 關鍵修正 1：將 bestFitSize 預設為 miniSize
            // 如果最小字體都溢出，我們應使用最小值
            let bestFitSize = miniSize;

            // **在開始二分搜尋前，先快速檢查最大字體是否可行**
            const maxMeasured = this.typeSet.measure(this, maxSize);
            const maxIsOverflowing = (!this.autoWarp && maxMeasured.width > containerWidth) || (maxMeasured.height > containerHeight);

            // 如果最大字體可行，則從最大值開始搜索 (這是二分法的標準起點)
            if (!maxIsOverflowing) {
                bestFitSize = maxSize;
            } else {
                // 如果連最大字體都溢出，則從 low=miniSize, high=maxSize 開始搜索
                // bestFitSize 保持為 miniSize，等待迴圈找到第一個可行解
            }

            // 使用二分搜尋法
            for (let i = 0; i < 10; i++) {
                if (high - low < 0.5) {
                    break;
                }

                const mid = low + (high - low) / 2;
                const measured = this.typeSet.measure(this, mid);
                const isOverflowing = (!this.autoWarp && measured.width > containerWidth) || (measured.height > containerHeight);

                if (isOverflowing) {
                    // 字體太大，縮小搜尋範圍的上限
                    high = mid;
                } else {
                    // 尺寸可行，將其存為目前最佳解，並嘗試尋找更大的尺寸
                    bestFitSize = mid;
                    low = mid;
                }
            }

            // 💡 關鍵修正 2：確保最終結果不會小於 _fontMiniSize (儘管在迴圈開始前已設定)
            // 並且如果最佳解是最小字體，但最小字體仍然溢出，我們仍然返回最小值。
            finalSize = Math.max(bestFitSize, miniSize);

            // 執行四捨五入/精度處理
            finalSize = Math.floor(finalSize * 1000) / 1000;
        } else {
            // 如果 autoSize 關閉，就直接使用手動設定的 fontSize
            finalSize = this._fontSize;
        }
        // --- 關鍵的最終更新流程 ---
        this._autoFontSize = finalSize;
        this._updateAllStyles(); // 使用最終確定的字體大小，更新所有 charInfo 的樣式
        this._layoutResult = this.typeSet.layout(this); // 執行最後一次真正用於渲染的排版
    }

    public forceUpdate() {
        this.lateUpdate(0);
    }

    private _updateText() {
        if (this._font == null) {
            console.warn("font is null");
            return;
        }

        this._clearSlots();
        this._preFreeCharInfos();

        if (this._rich) {
            this._parseRich(this._string);
        } else {
            this._parse(this._string);
        }

        // 【新增】解析完畢後，清理掉沒有被重用的節點
        this._cleanupUnusedSlots();

        this._freeCharInfos();
    }

    public clearLayoutInfo() {
        for (let i = 0; i < this._charInfos.length; i++) {
            let charInfo = this._charInfos[i];
            charInfo.reset();
        }
        this._clearAdditions();
    }

    _clearAdditions() {
        for (let i = 0; i < this._underLineInfos.length; i++) {
            putTMQuadRenderDataToPool(this._underLineInfos[i]);
        }
        this._underLineInfos.length = 0;

        for (let i = 0; i < this._strikeInfos.length; i++) {
            putTMQuadRenderDataToPool(this._strikeInfos[i]);
        }
        this._strikeInfos.length = 0;

        for (let i = 0; i < this._backgroundInfos.length; i++) {
            putTMQuadRenderDataToPool(this._backgroundInfos[i]);
        }
        this._backgroundInfos.length = 0;

        for (let i = 0; i < this._maskInfos.length; i++) {
            putTMQuadRenderDataToPool(this._maskInfos[i]);
        }
        this._maskInfos.length = 0;
    }

    private _resetAdditions() {
        for (let i = 0; i < this._underLineInfos.length; i++) {
            this._underLineInfos[i].reset();
        }

        for (let i = 0; i < this._strikeInfos.length; i++) {
            this._strikeInfos[i].reset();
        }

        for (let i = 0; i < this._backgroundInfos.length; i++) {
            this._backgroundInfos[i].reset();
        }

        for (let i = 0; i < this._maskInfos.length; i++) {
            this._maskInfos[i].reset();
        }
    }

    private _preFreeCharInfos() {
        this._tempCharInfos = this._charInfos.concat();
        this._charInfos.length = 0;

        this._clearAdditions();
    }

    private _freeCharInfos() {
        for (let i = 0; i < this._tempCharInfos.length; i++) {
            putCharInfoToPool(this._tempCharInfos[i]);
        }
        this._tempCharInfos.length = 0;
    }

    // 【重構】修改 _clearSlots 為回收邏輯
    private _clearSlots() {
        this._slotCount = 0;
        this._needUpdateAfterSlotLoaded = false;

        // 將現有 active 的 slots 移入回收池並隱藏
        for (let i = 0; i < this._slots.length; i++) {
            let slot = this._slots[i];
            if (slot.node && slot.node.isValid) {
                const poolKey = slot.type.toString();
                if (!this._slotPool[poolKey]) {
                    this._slotPool[poolKey] = [];
                }
                slot.node.active = false; // 先隱藏，等待重用或銷毀
                this._slotPool[poolKey].push(slot.node);
            }
        }
        this._slots.length = 0;
    }

    // 【新增】清理未被重用的 Slot 節點
    private _cleanupUnusedSlots() {
        for (const key in this._slotPool) {
            const pool = this._slotPool[key];
            while (pool.length > 0) {
                pool.pop().destroy();
            }
        }
    }

    private _parse(text: string) {
        if (this._font == null) {
            return;
        }

        this._updateStyle(this._style);
        let end = text.length;

        for (let i = 0; i < end; i++) {
            var vertexInfo = getCharInfoFromPool();
            vertexInfo.index = this._charInfos.length;
            vertexInfo.click = null;
            vertexInfo.slot = null;
            vertexInfo.cjk = null;
            vertexInfo.style = this.style;
            vertexInfo.char = this.font.getCharInfo(text[i]);
            vertexInfo.font = this.font;
            // vertexInfo.reset();
            this._charInfos.push(vertexInfo);
        }
    }

    private _parseSlot(charIndex: number, node: TagNode, type: ESlotType, fontSize: number) {
        let slot = new Slot();

        slot.index = charIndex;
        let keys = Object.keys(slot);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (node.attributes[key] !== undefined) {
                slot[key] = node.attributes[key];
            }
        }
        slot.type = type;

        this._createSlot(slot, fontSize);
        return slot;
    }

    /**
     * slot 格式：[包名|resources目录无需包名][://资源路径|资源路径]
     * 2.+ 修改格式为：db://[包名|resources目录无需包名]/资源路径
     * @param slot
     * @param fontSize
     * @returns
     */
    private async _createSlot(slot: Slot, fontSize: number) {
        // 1. 從回收池獲取或新建節點
        const poolKey = slot.type.toString();
        let node: Node = null;

        if (this._slotPool[poolKey] && this._slotPool[poolKey].length > 0) {
            node = this._slotPool[poolKey].pop()!;
            node.removeAllChildren();
            const g = node.getComponent(Graphics);
            if (g) g.clear();
        } else {
            node = new Node();
        }

        // 2. 基礎屬性初始化
        node.layer = this.node.layer;
        node.name = `slot_(${this.node.name}_${slot.type}_${slot.name})`;
        slot.node = node;
        node.active = false;

        // 3. 掛載容器處理
        if (this.slotsContainer) {
            this.slotsContainer.addChild(node);
            let conn = node.getComponent(SlotConnector) || node.addComponent(SlotConnector);
            conn.labelNode = this.node;
            this.slotOffsetX = this.node.worldPosition.x - node.worldPosition.x;
            this.slotOffsetY = this.node.worldPosition.y - node.worldPosition.y;
        } else {
            this.node.addChild(node);
            this.slotOffsetX = 0;
            this.slotOffsetY = 0;
        }

        let urt = node.getComponent(UITransform) || node.addComponent(UITransform);
        urt.setAnchorPoint(0, 0);

        // 4. 設定初始佔位尺寸
        const hasW = slot.width != null;
        const hasH = slot.height != null;
        slot.width = hasW ? slot.width : fontSize;
        slot.height = hasH ? slot.height : fontSize;
        if (slot.sizeType == ESlotSizeType.None && hasW && hasH) {
            slot.sizeType = ESlotSizeType.FontSize;
        }

        // 5. 資源加載邏輯
        if (slot.src && slot.type === ESlotType.Image) {
            let sp: SpriteFrame | null = null;

            // 【同步優先】從手動管理的 spriteAsset 或 richTextImageAtlas 拿取
            if (this._spriteAsset && this.isSpriteAsset(this._spriteAsset)) {
                sp = this._spriteAsset.getSprite(slot.src);
            }

            if (sp) {
                // 同步路徑直接完成
                this._setupSpriteNode(node, slot, sp, false);
                node.active = true;
                this._applyLayer();
                this._slotCount++;
                this._checkAndRefreshLayout();
                return;
            }

            try {
                let asyncSp: SpriteFrame | null = null;
                if (this._slotSpriteFrameCreateHandler) {
                    const res = this._slotSpriteFrameCreateHandler(slot.src);
                    asyncSp = res instanceof Promise ? await res : res;
                }

                if (asyncSp && isValid(node)) {
                    // 關鍵：在 Build 下必須確保 setup 完成才算加載成功
                    this._setupSpriteNode(node, slot, asyncSp);
                    node.active = true;
                    this._applyLayer();
                }
            } catch (e) {
                console.warn(`[TextMeshLabel] Async image load failed: ${slot.src}`);
            }
            this._slotCount++;
            this._checkAndRefreshLayout();
        }
        else if (slot.src && slot.type === ESlotType.Prefab) {
            // Prefab 加載邏輯
            try {
                let prefab: Prefab | null = null;
                if (this._slotPrefabCreateHandler) {
                    const res = this._slotPrefabCreateHandler(slot.src);
                    prefab = res instanceof Promise ? await res : res;
                } else {
                    let src = slot.src.substring(5);
                    let index = src.indexOf('/');
                    prefab = await ResManager.getAsync(src.substring(0, index), src.substring(index + 1), Prefab);
                }
                if (prefab && isValid(node)) {
                    this._setupPrefabNode(node, slot, prefab);
                    node.active = true;
                    this._applyLayer();
                }
            } catch (e) { }
            this._slotCount++;
            this._checkAndRefreshLayout();
        } else {
            node.active = true;
            this._slotCount++;
            this._checkAndRefreshLayout();
        }
    }

    /** 輔助：檢查是否所有 Slot 到位並強制刷新排版解決寬度異常 */
    private _checkAndRefreshLayout() {
        if (this.isValid && this._slotCount >= this._slots.length && this._needUpdateAfterSlotLoaded) {
            this.addDirtyFlag(EDirtyFlag.Layout);
            this.updateRenderData(true);
        }
    }

    /**
     * 設定 Slot 的 Sprite 內容與尺寸
     * 【核心修復】：讀取 spriteFrame.rect 以解決 Build 版本寬度變 9.14 的問題
     * @param node Slot 的根節點
     * @param slot Slot 數據對象
     * @param spriteFrame 載入成功的 SpriteFrame
     * @param isInternal 是否為非同步回調內部的靜默更新 (設為 true 可防止 Editor 死循環)
     */
    private _setupSpriteNode(node: Node, slot: Slot, spriteFrame: SpriteFrame, isInternal: boolean = false) {
        if (!isValid(node) || !spriteFrame) return;

        // 1. 確保子節點存在且 Layer 與主節點同步
        let spNode = node.getChildByName("sprite");
        if (!spNode) {
            spNode = new Node("sprite");
            node.addChild(spNode);
        }
        spNode.layer = node.layer;

        const spUrt = spNode.getComponent(UITransform) || spNode.addComponent(UITransform);
        spUrt.setAnchorPoint(0, 0);

        const sprite = spNode.getComponent(Sprite) || spNode.addComponent(Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;

        // 2. 【致命 Bug 修復點】：讀取 rect 寬高而非 width/height
        // 在 Build 版中，spriteFrame.width 常會返回大圖集尺寸 (如 126x386)
        // spriteFrame.rect.width 則保證返回該小圖的裁剪尺寸 (如 28x28)
        const spriteRect = spriteFrame.rect;
        let texW = spriteRect.width;
        let texH = spriteRect.height;

        // 防禦邏輯：如果 rect 數據異常，才嘗試回退到原始屬性
        if (texW <= 0 || texH <= 0) {
            texW = spriteFrame.width;
            texH = spriteFrame.height;
        }

        // 3. 比例與尺寸計算
        if (slot.sizeType === ESlotSizeType.None) {
            const charInfo = this._charInfos[slot.index];
            // 獲取該位置對應的字體大小 (例如 28)
            const targetFontSize = charInfo?.style?.fontSize || this.fontSize;

            if (texH > 0) {
                // 當 texH 是正確的 28 時，ratio 會是 1，計算出的 width 就會是正確的 28
                const ratio = targetFontSize / texH;
                slot.height = targetFontSize;
                slot.width = texW * ratio;
            } else {
                slot.width = slot.height = targetFontSize;
            }
        } else if (slot.sizeType == ESlotSizeType.WidthFirst) {
            const ratio = texH / texW;
            slot.height = slot.width * ratio;
        } else if (slot.sizeType == ESlotSizeType.HeightFirst) {
            const ratio = texW / texH;
            slot.width = slot.height * ratio;
        }

        // 4. 套用尺寸到 UITransform
        spUrt.setContentSize(slot.width, slot.height);
        const parentUrt = node.getComponent(UITransform)!;

        if (isInternal) {
            // 【關鍵】：靜默更新尺寸，避開 SIZE_CHANGED 事件以防止 Editor 創建/刪除死循環
            // @ts-ignore
            parentUrt._contentSize.width = slot.width;
            // @ts-ignore
            parentUrt._contentSize.height = slot.height;
        } else {
            parentUrt.setContentSize(slot.width, slot.height);
        }

        if (slot.sizeType == ESlotSizeType.None) {
            slot.fixed = true;
            // 標記需要排版更新，確保後續文字被正確推開
            this._needUpdateAfterSlotLoaded = true;
        }

        // 5. 【Editor 專用】：強制觸發渲染更新，確保 Sprite 立即顯現
        if (EDITOR) {
            this.markForUpdateRenderData();
            // @ts-ignore 強制編輯器底層 RenderEntity 重繪
            spNode._renderEntity?.markForUpdateRenderData();
        }
    }

    private _setupPrefabNode(node: Node, slot: Slot, prefab: Prefab) {
        if (!isValid(node)) return;

        const inst = instantiate(prefab) as Node;
        node.addChild(inst);
        let pTR = inst.getComponent(UITransform);
        if (pTR == null) {
            pTR = inst.addComponent(UITransform);
        }
        pTR.setAnchorPoint(0, 0);

        if (slot.sizeType == ESlotSizeType.WidthFirst) {
            var scale = slot.width / pTR.width;
            inst.setScale(scale, scale);
        } else if (slot.sizeType == ESlotSizeType.HeightFirst) {
            var scale = slot.height / pTR.height;
            inst.setScale(scale, scale);
        } else if (slot.sizeType == ESlotSizeType.FontSize) {
            pTR.width = slot.width;
            pTR.height = slot.height;
        } else {
            slot.width = pTR.width;
            slot.height = pTR.height;
            slot.fixed = true;
            // 重置，需要重新計算
            if (this._charInfos[slot.index]) {
                this._charInfos[slot.index].cjk = null;
            }
            this._needUpdateAfterSlotLoaded = true;
        }
    }

    private _parseClick(node: TagNode) {
        let clickable = new Clickable;
        if (node.attributes) {
            clickable.name = node.attributes["name"] as string;
            clickable.value = node.attributes["value"] as string;
        }
        return clickable;
    }

    private async _parseRich(text: string) {
        this._updateStyle(this._style);

        this._clicks.length = 0;

        let ast = UBBParser.inst.parse(text);
        let lastDepth = 0;
        let currentStyle = this._style;
        let prevStyle = this._style;
        const styleStack = [currentStyle];
        let nodeStack: TagNode[] = [];
        let clickStack: Clickable[] = [];
        const tagMap = StyleMapper['tagMap'] || {};
        for (const [node, depth] of dfs(ast)) {
            if (depth < lastDepth) {
                for (let i = lastDepth - depth; i >= 0; i--) {
                    currentStyle = styleStack.pop() || this._style;
                    prevStyle = currentStyle;
                }
                let pnode = nodeStack.pop();
                if (pnode?.name == "click") {
                    clickStack.pop();
                }
            } else if (depth == lastDepth) {
                currentStyle = prevStyle;
                nodeStack.push(node);
            }

            let tagNode = node as TagNode;

            if (tagNode.type != 'text') {
                if (depth > lastDepth) {
                    styleStack.push(currentStyle);
                }

                prevStyle = currentStyle;
                currentStyle = currentStyle.clone();
                if (isSlotType(node.name)) { // 判斷是否為 Slot 標籤 (如 img, prefab)
                    // 【核心修正】增加前置檢查：只有當 <img> 標籤包含 src 屬性時，才將其視為有效的 Slot
                    if (node.name === 'img' && (!node.attributes || !node.attributes['src'])) {
                        // 對於不完整的 <img> 標籤，暫不處理，避免報錯
                        // 可以在這裡選擇將其當作普通文字輸出，方便使用者看到自己輸入的內容
                        // this._addCharInfo(node.source, currentStyle, clickStack.length > 0);
                    } else {
                        let slot = this._parseSlot(this._charInfos.length, node, SlotTypeMap[node.name], currentStyle.fontSize);
                        this._slots.push(slot);
                        this._addCharInfo('', currentStyle, clickStack.length > 0, this._slots[this._slots.length - 1]);
                    }
                } else if (node.name == "click") {
                    let clickable = this._parseClick(node);
                    this._clicks.push(clickable);
                    clickStack.push(clickable);
                } else {
                    const mapper = StyleMapper[node.name];
                    if (mapper) {
                        if (mapper.field) {
                            if (node.value != null) {
                                currentStyle[mapper.field] = node.value;
                            } else {
                                currentStyle[mapper.field] = mapper.value;
                            }
                        }

                        if (node.attributes && mapper.attributes) {
                            let keys = Object.keys(node.attributes);
                            for (let i = 0; i < keys.length; i++) {
                                let key = keys[i];
                                let attr = mapper.attributes[key];
                                if (attr) {
                                    if (attr.field) {
                                        currentStyle[attr.field] = node.attributes[key];
                                    } else if (attr.mapper) {
                                        let fieldMappler = StyleMapper[attr.mapper];
                                        if (fieldMappler) {
                                            if (fieldMappler.field) {
                                                currentStyle[fieldMappler.field] = node.attributes[key];
                                            }
                                        } else {
                                            console.error("can not find mapper", attr.mapper);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (tagNode.name == "style") {
                        let styleStr = tagNode.value as string;
                        let styles = styleStr.split(/[ ;,]/gi);
                        for (let i = 0; i < styles.length; i++) {
                            if (!styles[i]) {
                                continue;
                            }
                            let style = await StyleManager.getStyle(styles[i]);
                            if (style) {
                                currentStyle.copyFrom(style);
                            } else {
                                console.error("can not find style named ", styles[i]);
                            }
                        }
                    } else if (tagMap[tagNode.name]) {
                        this._addCharInfo(tagMap[tagNode.name], currentStyle, clickStack.length > 0);
                    } else if (StyleManager.getTagStyle(tagNode.name)) {
                        let style = await StyleManager.getTagStyle(tagNode.name);
                        currentStyle.copyFrom(style);
                    } else {
                        let field = `_$${node.name}`;
                        if (Object.keys(currentStyle).indexOf(field) >= 0) {
                            if (typeof currentStyle[field] == "boolean") {
                                currentStyle[field] = true;
                            } else {
                                currentStyle[field] = (node.value === undefined) ? true : node.value;
                            }
                        }
                    }
                }

                if (currentStyle != this._style) {
                    currentStyle.preset();
                }
            }

            if (tagNode.text) {
                const content = tagNode.text;
                let chars = getStringArray(content);
                let end = chars.length;

                for (let i = 0; i < end; i++) {
                    this._addCharInfo(chars[i], currentStyle, clickStack.length > 0);
                }
            }

            lastDepth = depth;
        }
    }

    private _addCharInfo(char: string, style: TextStyle, inClick: boolean, slot?: Slot) {
        var vertexInfo = getCharInfoFromPool();
        vertexInfo.index = this._charInfos.length;
        vertexInfo.style = style;
        vertexInfo.char = this.font.getCharInfo(char);
        vertexInfo.font = this.font;
        vertexInfo.click = inClick ? this._clicks[this._clicks.length - 1] : null;
        vertexInfo.slot = slot;
        // vertexInfo.reset();
        this._charInfos.push(vertexInfo);
    }

    private resetRenderData() {
        // if(this._renderData) {
        //     this._renderData.dataLength = 0;
        //     this._renderData.resize(0, 0);
        // }
        this.destroyRenderData();
    }

    lateUpdate(dt: number): void {
        if (!this.enabledInHierarchy || !this._font) {
            return;
        }

        if (this.dirtyFlag != EDirtyFlag.None) {
            this._ready = false;

            const needsFullUpdate = (this.dirtyFlag & (EDirtyFlag.Text | EDirtyFlag.Layout | EDirtyFlag.Slot | EDirtyFlag.All));

            if (needsFullUpdate) {
                this._updateText();
                this._updateLayout();
                this.resetRenderData();
                this.updateRenderData(true);
            } else if (this.dirtyFlag & EDirtyFlag.Style) {
                this._updateAllStyles();
                this.markForUpdateRenderData(true);
            }

            if (this.dirtyFlag & EDirtyFlag.Property) {
                this.updateMaterial();
            }

            this.dirtyFlag = EDirtyFlag.None;
            this._ready = true;
            this._transformDirty = true;
        }
    }

    get dirtyFlag(): EDirtyFlag {
        return this._dirtyFlag;
    }

    set dirtyFlag(value: EDirtyFlag) {
        if (this.dirtyFlag != value) {
            this._transformDirty = true;
            this._dirtyFlag = value;
        }
    }

    addDirtyFlag(flag: EDirtyFlag) {
        this.dirtyFlag |= flag;
    }

    clearDirtyFlag() {
        this.dirtyFlag = EDirtyFlag.None;
    }

    /**
     * 获取文本内容
     * @param index
     * @returns
     */
    getCharInfo(index: number) {
        if (index >= 0 && index < this._charInfos.length) {
            return this._charInfos[index];
        }

        console.error("index out of range", index);
        return null;
    }

    /**
     *
     * @param charInfo
     * @param colors 设置统一颜色，或者设置单个顶点
     * @returns
     */
    setCharColor(charInfo: CharInfo, colors?: Color | Color[]) {
        if (!charInfo) {
            return;
        }

        TextMeshAssembler.updateColor(this, charInfo, colors);
    }

    /**
     * 设置文本偏移、旋转、缩放
     * @param charInfo
     * @param dx x偏移
     * @param dy y偏移
     * @param rotation 旋转角度，弧度
     * @param scale 缩放值
     * @returns
     */
    setCharTransform(charInfo: CharInfo, dx: number, dy: number, rotation: number, scale: number) {
        if (!charInfo) {
            return;
        }

        if (charInfo.slot) {
            let node = charInfo.slot.node;
            node.setScale(scale, scale, scale);

            let urt = node._uiProps.uiTransformComp;
            let hx = urt.width * (0.5 - urt.anchorX);
            let hy = urt.height * (0.5 - urt.anchorY);
            node.setPosition(charInfo.x + this.globalOffsetX,
                charInfo.y + this.globalOffsetY,
                0);

            Quat.fromEuler(quat, 0, 0, rotation * 180 / Math.PI);
            node.setRotation(quat);

            let pos = new Vec3(urt.width * urt.anchorX, urt.height * urt.anchorY, 0);
            let center = new Vec3(hx, hy, 0);
            Vec3.rotateZ(pos, pos, center, rotation);
            node.setPosition(node.position.x + pos.x, node.position.y + pos.y, 0);
            return;
        } else if (charInfo.vertexData.length == 0) {
            return;
        }

        let center = new Vec3();
        let vs = charInfo.vertexData;
        center.x = (vs[0].x + vs[1].x + vs[2].x + vs[3].x) / 4;
        center.y = (vs[0].y + vs[1].y + vs[2].y + vs[3].y) / 4;

        for (let j = 0; j < 4; j++) {
            let pos: Vec3 = new Vec3();
            Vec3.subtract(pos, vs[j], center);
            pos.multiplyScalar(scale);
            Vec3.add(pos, center, pos);
            if (rotation != 0) {
                Vec3.rotateZ(pos, pos, center, rotation);
            }

            vs[j].rx = pos.x + dx;
            vs[j].ry = pos.y + dy;
        }

        charInfo.dirty = true;
    }

    setCustomMaterialByUUID(uuid: string) {
        if (uuid) {
            assetManager.loadAny({ uuid: uuid }, (err, asset) => {
                if (err) {
                    console.error(err);
                    return;
                }

                this.customMaterial = asset;
            });
        }
    }

    protected _canRender() {
        return !(!super._canRender() || !this._string || !this._font);


    }

    /**
     * @zh
     * 獲取文字內容經過排版後的首選尺寸。
     * 注意：此方法會觸發一次完整的排版計算，如果有效能考量，請謹慎使用。
     * @returns {math.Size} 包含寬和高的尺寸物件。
     */
    public getPreferredSize(): math.Size {
        if (this.dirtyFlag !== EDirtyFlag.None) {
            this.forceUpdate();
        }
        return this._layoutResult ? new math.Size(this._layoutResult.maxWidth, this._layoutResult.maxHeight) : new math.Size(0, 0);
    }

    /**
     * @zh
     * 獲取文字內容經過排版後的首選高度。
     * @returns {number} 首選高度。
     */
    public getPreferredHeight(): number {
        return this.getPreferredSize().height;
    }

    /**
     * [編輯器專用] 根據您的專案路徑規則，解析出 Bundle 名稱和相對路徑。
     * 規則：從後往前找到第一個 'assets' 資料夾，其父資料夾名稱 + '_assets' 即為 Bundle 名。
     * @param assetUrl - 資源的 db:// 路徑 (e.g., "db://assets/feature/backpacks/assets/sprite/auto-atlas.pac")
     * @returns { bundleName: string, relativePath: string }
     */
    private _extractBundleInfoFromPath(assetUrl: string): { bundleName: string, relativePath: string } {
        const cleanedPath = assetUrl.startsWith('db://') ? assetUrl.substring('db://'.length) : assetUrl;

        const assetsMarker = '/assets/';
        const lastAssetsIndex = cleanedPath.lastIndexOf(assetsMarker);

        if (lastAssetsIndex <= 0) {
            const relativePath = cleanedPath.startsWith('assets/') ? cleanedPath.substring('assets/'.length) : cleanedPath;
            return { bundleName: 'main', relativePath: relativePath };
        }

        const pathBeforeAssets = cleanedPath.substring(0, lastAssetsIndex);

        const lastSlashIndex = pathBeforeAssets.lastIndexOf('/');
        if (lastSlashIndex === -1) {
            // 理論上不會發生，因為至少有根 'assets/'
            return { bundleName: 'main', relativePath: cleanedPath };
        }

        const bundleKey = pathBeforeAssets.substring(lastSlashIndex + 1);

        const bundleName = `${bundleKey}_assets`;
        let relativePath = cleanedPath.substring(lastAssetsIndex + assetsMarker.length);


        const lastSlashInRelative = relativePath.lastIndexOf('/');
        if (lastSlashInRelative !== -1) {
            relativePath = relativePath.substring(0, lastSlashInRelative + 1);
        }

        return { bundleName, relativePath };
    }

    private _getFinalCascadeOpacity(): number {
        let opacity = 1.0;
        let curr: Node | null = this.node;
        while (curr) {
            // @ts-ignore 直接讀取 localOpacity 避開 getComponent 的效能開銷
            const local = curr._uiProps?.localOpacity ?? 1.0;
            opacity *= local;
            curr = curr.parent;
        }
        return opacity;
    }

    public isTextMeshSettings(asset: any): asset is ITextMeshAllSettings {
        if (!asset) return false;

        return (
            typeof asset.isValidAsset !== 'undefined' &&
            typeof asset.save === 'function' &&
            asset.normal !== undefined &&
            asset.style !== undefined &&
            asset.effect !== undefined
        );
    }

    public isSpriteAsset(asset: any): asset is ITextMeshLabelSpriteAsset {
        if (!asset) return false;

        return (
            typeof asset.isValidAsset !== 'undefined' &&
            typeof asset.getSprite === 'function' &&
            typeof asset.save === 'function'
        );
    }
}
