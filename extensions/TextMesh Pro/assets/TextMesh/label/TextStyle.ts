import { Color, Pool } from "cc";
import { TMFont } from "../font/TMFont";
import { StyleMapper } from "./StyleMapper";
import {EScriptType, ETextHorizontalAlign, ETextOverflow, ETextVerticalAlign} from "./types";

/**
 * ubb style
 * <b/i/u/style>
 * <style b i u>content</style>
 */
export type ColorType = number | string;

const colorMap = {
    'red': Color.RED,
    'green': Color.GREEN,
    'blue': Color.BLUE,
    'yellow': Color.YELLOW,
    'cyan': Color.CYAN,
    'magenta': Color.MAGENTA,
    'black': Color.BLACK,
    'white': Color.WHITE,
    'gray': Color.GRAY,
    'transparent': Color.TRANSPARENT,
};

export enum ECornerType {
    LT,
    RT,
    LB,
    RB,
}

export class TextStyle {  
    [key:string]:any;
    
    // 文本颜色
    private _$color: ColorType;
    private _$colorLT: ColorType;
    private _$colorLB: ColorType;
    private _$colorRT: ColorType;
    private _$colorRB: ColorType;
  
    private _shadow: number = 0;
    private _shadowBlur: number = 0;
    private _shadowOffsetX: number = 0;
    private _shadowOffsetY: number = 0;
    private _$shadow: number;
    private _$shadowColor:ColorType;
    private _$shadowOffsetX: number = 0;
    private _$shadowOffsetY: number = 0;
    private _$shadowBlur:number;
      
    private _$stroke:number;
    private _$strokeBlur: number;
    private _$strokeColor:ColorType;

    private _$enableGlow: boolean;
    private _$glowColor: ColorType;
    private _$glowInner: number;
    private _$glowOuter: number;
    private _$glowPower: number;
    private _$glowOffsetX: number;
    private _$glowOffsetY: number;

    private _$backgroundColor: ColorType;
    private _$maskColor: ColorType;
  
    private _$fontSize: number;
    private _$fontSmoothness: number;
  
    private _$dilate: number;
    private _$scriptType:EScriptType;
    
    // 删除线
    private _$strike: boolean;
    private _$strikeColor: ColorType;
    private _$underline: boolean;
    private _$underlineColor: ColorType;
    private _$bold: boolean;
    private _$italic: boolean;
    private _$background: boolean;
    private _$mask: boolean;

    private _$enableColorLT: boolean;
    private _$enableColorLB: boolean;
    private _$enableColorRT: boolean;
    private _$enableColorRB: boolean;

    private _$autoWarp: boolean;
    private _$equalWidth: boolean;
    private _$fixedLineHeight: boolean;
    private _$horizontalAlign: number;
    private _$verticalAlign: number;
    private _$overflow: number;
    private _$fontAutoSize: boolean;
    private _$fontMiniSize: number;
    private _$fontMaxSize: number;

    private _$lineSpace: number;
    private _$letterSpace: number;
    private _$paddingLeft: number;
    private _$paddingRight: number;
    private _$paddingTop: number;
    private _$paddingBottom: number;
    private _$aspect: number;
    private _$charVisibleRatio: number;
    private _$breakWestern: boolean;

    private _tmFont: TMFont;

    private _fontSize: number = 18;
    private _dilate: number = 0.25;
    private _fontSmoothness : number = 0;
    private _background: boolean = false;
    private _mask: boolean = false;
    private _italic: boolean = false;
    private _bold: boolean = false;
    private _scriptType: EScriptType = EScriptType.None;
    private _strike: boolean = false;
    private _strikeRGBA: Color = new Color(0, 0, 0, 255);
    private _underline: boolean = false;
    private _underlineRGBA: Color = new Color(0, 0, 0, 255);

    private _fillRGBA: Color = new Color(0, 0, 0, 255);
    private _enableColorLT = false;
    private _enableColorLB = false;
    private _enableColorRT = false;
    private _enableColorRB = false;
    private _colorLT: Color = new Color();

    private _enableGlow: boolean = false;
    private _glowColor: Color = new Color(255, 255, 255, 255);
    private _glowInner: number = 0.0;
    private _glowOuter: number = 0.0;
    private _glowPower: number = 0.0;
    private _glowOffsetX: number = 0.0;
    private _glowOffsetY: number = 0.0;
    private _colorLB: Color = new Color();
    private _colorRT: Color = new Color();
    private _colorRB: Color = new Color();

    private _autoWarp: boolean = true;
    private _equalWidth: boolean = false;
    private _fixedLineHeight: boolean = false;
    private _horizontalAlign: ETextHorizontalAlign = ETextHorizontalAlign.Left;
    private _verticalAlign: ETextVerticalAlign = ETextVerticalAlign.Top;
    private _overflow: ETextOverflow = ETextOverflow.None;
    private _fontAutoSize: boolean = false;
    private _fontMiniSize: number = 10;
    private _fontMaxSize: number = 40;

    private _lineSpace: number = 0;
    private _letterSpace: number = 0;
    private _paddingLeft: number = 0;
    private _paddingRight: number = 0;
    private _paddingTop: number = 0;
    private _paddingBottom: number = 0;
    private _aspect: number = 1;
    private _charVisibleRatio: number = 1;
    private _breakWestern: boolean = false;
    private _stroke: number = 0;
    private _strokeRGBA: Color = new Color(0, 0, 0, 255);
    private _shadowRGBA: Color = new Color(0, 0, 0, 255);
    private _backgroundRGBA: Color = new Color(0, 0, 0, 255);
    private _maskRGBA: Color = new Color(0, 0, 0, 128);

    private _realFontSize: number = 18;

    constructor(tmFont?: TMFont) {
        this._tmFont = tmFont;
    }

    get font() {
        return this._tmFont;
    }

    set font(value: TMFont) {
        if(this._tmFont !== value) {
            this._tmFont = value;
        }
    }

    get realFontSize() {
        return this._realFontSize;
    }

    reset() {  
        this._$color = null;
    
        this._$shadow = null;
        this._$shadowColor = null;
        this._$shadowBlur = null; // shadow-blur
        this._$shadowOffsetX = null;    // shadow-offset-x
        this._$shadowOffsetY = null;    // shadow-offset-y
    
        this._$stroke = null;
        this._$strokeColor = null;
        this._$strokeBlur = null;

        this._$enableGlow = null;
        this._$glowColor = null;
        this._$glowInner = null;
        this._$glowOuter = null;
        this._$glowPower = null;
        this._$glowOffsetX = null;
        this._$glowOffsetY = null;

        this._$backgroundColor = null;
        this._$maskColor = null;
    
        this._$fontSize = null;
        this._$fontSmoothness = null;
    
        this._$italic = null;
        this._$bold = null;
        this._$mask = null;
        this._$dilate = null;
        this._$strike= null;
        this._$strikeColor= null;
        this._$underline= null;
        this._$underlineColor= null;

        this._$scriptType = null;

        this._enableColorLB = false;
        this._enableColorLT = false;
        this._enableColorRB = false;
        this._enableColorRT = false;

        this._enableGlow = false;
        this._glowColor.set(255, 255, 255, 255);
        this._glowInner = 0.0;
        this._glowOuter = 0.0;
        this._glowPower = 0.0;
        this._glowOffsetX = 0.0;
        this._glowOffsetY = 0.0;

        this._$enableColorLT = null;
        this._$enableColorLB = null;
        this._$enableColorRT = null;
        this._$enableColorRB = null;

        this._$autoWarp = null;
        this._$equalWidth = null;
        this._$fixedLineHeight = null;
        this._$horizontalAlign = null;
        this._$verticalAlign = null;
        this._$overflow = null;
        this._$fontAutoSize = null;
        this._$fontMiniSize = null;
        this._$fontMaxSize = null;

        this._$lineSpace = null;
        this._$letterSpace = null;
        this._$paddingLeft = null;
        this._$paddingRight = null;
        this._$paddingTop = null;
        this._$paddingBottom = null;
        this._$aspect = null;
        this._$charVisibleRatio = null;
        this._$breakWestern = null;
    }

    clone() {
        return TextStyle.copy(this);
    }

    copyFrom(from: TextStyle, onlyChanged = true) {

        let fields = onlyChanged ? from.changedFields : null;

        let keys = fields || Object.keys(from);
        for(let key of keys) {
            let value = from[key];
            if(value instanceof Color) {
                this[key].set(value);
            }else{
                this[key] = from[key];
            }
        }
        return this;
    }

    static copy(from: TextStyle) {
        let style = new TextStyle();
        let keys = Object.keys(from);
        for(let key of keys) {
            let value = from[key];
            if(value instanceof Color) {
                style[key].set(value);
            }else{
                style[key] = from[key];
            }
        }
        return style;
    }

    private calcFontSize() {
        this._realFontSize = this._fontSize;
        if(this._scriptType != EScriptType.None) {
            this._realFontSize = this._fontSize * (this.font ? this.font.scriptThickness : 0.3);
        }
    }

    private getColor(color:ColorType, outColor?: Color): Color {
        outColor = outColor || new Color();
        if (typeof color === 'string') {
            color = color.toLocaleLowerCase();
            if (colorMap[color]) {
                return colorMap[color];
            }
            
            let hex = color.replace('0x', '#');
            Color.fromHEX(outColor, hex);
        }else if (typeof color === 'number') {
            let r = (color >> 24) & 0xff;
            let g = (color >> 16) & 0xff;
            let b = (color >> 8) & 0xff;
            let a = color & 0xff;
            outColor.set(r, g, b, a);
        }
        return outColor;
    }

    preset() {
        if(this._$color && typeof this._$color === 'string') {
            let colors = this._$color.split(',');
            this._$color = colors[0];
            
            if(colors.length == 4) {
                if(this._$colorLT == null) {
                    this._$colorLT = colors[0];
                }
                if(this._$colorLB == null) {
                    this._$colorLB = colors[1];
                }
                if(this._$colorRT == null) {
                    this._$colorRT = colors[2];
                }
                if(this._$colorRB == null) {
                    this._$colorRB = colors[3];
                }
            }else if(colors.length == 3) {
                if(this._$colorLT == null) {
                    this._$colorLT = colors[0];
                }
                if(this._$colorRT == null) {
                    this._$colorRT = colors[1];
                }
                if(this._$colorRB == null) {
                    this._$colorRB = colors[2];
                }
                if(this._$colorLB == null) {
                    this._$colorLB = colors[1];
                }
            }else if(colors.length == 2) {
                if(this._$colorLT == null) {
                    this._$colorLT = colors[0];
                }
                if(this._$colorRB == null) {
                    this._$colorRB = colors[1];
                }
                if(this._$colorRT == null) {
                    this._$colorRT = colors[0];
                }
                if(this._$colorLB == null) {
                    this._$colorLB = colors[1];
                }
            }
        }

        this._fillRGBA = this.getColor(this._$color, this._fillRGBA);
        this._strokeRGBA = this.getColor(this._$strokeColor, this._strokeRGBA);
        this._shadowRGBA = this.getColor(this._$shadowColor, this._shadowRGBA);
        this._backgroundRGBA = this.getColor(this._$backgroundColor, this._backgroundRGBA);
        this._glowColor = this.getColor(this._$glowColor, this._glowColor);
        this._maskRGBA = this.getColor(this._$maskColor, this._maskRGBA);
        this._strikeRGBA = this.getColor(this._$strikeColor || this._$color, this._strikeRGBA);
        this._underlineRGBA = this.getColor(this._$underlineColor || this._$color, this._underlineRGBA);

        this._presetValue('_fontSize', this._$fontSize);
        this._presetValue('_fontSmoothness', this._$fontSmoothness);
        this._presetValue('_shadow', this._$shadow, 0);
        this._presetValue('_shadowOffsetX', this._$shadowOffsetX, 0);
        this._presetValue('_shadowOffsetY', this._$shadowOffsetY, 0);
        this._presetValue('_shadowBlur', this._$shadowBlur);
        this._presetValue('_stroke', this._$stroke);
        this._presetValue('_strokeBlur', this._$strokeBlur);
        this._presetValue('_dilate', this._$dilate);
        this._presetValue('_background', this._$background);
        this._presetValue('_mask', this._$mask);
        this._presetValue('_italic', this._$italic);
        this._presetValue('_bold', this._$bold);
        this._presetValue('_strike', this._$strike);
        this._presetValue('_underline', this._$underline);
        this._presetValue('_scriptType', this._$scriptType);

        this._presetValue('_enableGlow', this._$enableGlow);
        this._presetValue('_glowInner', this._$glowInner);
        this._presetValue('_glowOuter', this._$glowOuter);
        this._presetValue('_glowPower', this._$glowPower);
        this._presetValue('_glowOffsetX', this._$glowOffsetX);
        this._presetValue('_glowOffsetY', this._$glowOffsetY);

        this._presetValue('_enableColorLT', this._$enableColorLT);
        this._presetValue('_enableColorLB', this._$enableColorLB);
        this._presetValue('_enableColorRT', this._$enableColorRT);
        this._presetValue('_enableColorRB', this._$enableColorRB);

        this._presetValue('_autoWarp', this._$autoWarp);
        this._presetValue('_equalWidth', this._$equalWidth);
        this._presetValue('_fixedLineHeight', this._$fixedLineHeight);
        this._presetValue('_horizontalAlign', this._$horizontalAlign);
        this._presetValue('_verticalAlign', this._$verticalAlign);
        this._presetValue('_overflow', this._$overflow);
        this._presetValue('_fontAutoSize', this._$fontAutoSize);
        this._presetValue('_fontMiniSize', this._$fontMiniSize);
        this._presetValue('_fontMaxSize', this._$fontMaxSize);

        this._presetValue('_lineSpace', this._$lineSpace);
        this._presetValue('_letterSpace', this._$letterSpace);
        this._presetValue('_paddingLeft', this._$paddingLeft);
        this._presetValue('_paddingRight', this._$paddingRight);
        this._presetValue('_paddingTop', this._$paddingTop);
        this._presetValue('_paddingBottom', this._$paddingBottom);

        this._presetValue('_aspect', this._$aspect);
        this._presetValue('_charVisibleRatio', this._$charVisibleRatio);
        this._presetValue('_breakWestern', this._$breakWestern);

        if(this._$colorLB) {
            this._colorLB = this.getColor(this._$colorLB, this._colorLB);
        }
        if(this._$colorLT) {
            this._colorLT = this.getColor(this._$colorLT, this._colorLT);
        }
        if(this._$colorRB) {
            this._colorRB = this.getColor(this._$colorRB, this._colorRB);
        }
        if(this._$colorRT) {
            this._colorRT = this.getColor(this._$colorRT, this._colorRT);
        }

        this.calculate();
    }  

    /**
     * 輔助函式：如果 rawValue (來自樣式標籤) 存在，則更新 targetField，否則保持不變。
     * @param targetField 要更新的目標屬性名稱 (e.g., '_bold')
     * @param rawValue    從樣式標籤解析出的原始值 (e.g., this._$bold)
     */
    private _presetValue<T>(targetField: keyof this, rawValue: T, defaultValue?: T) {
        if (rawValue != null) {
            this[targetField] = rawValue as any;
        } else if (defaultValue !== undefined) {
            this[targetField] = defaultValue as any;
        }
    }

    calculate() {
        this.calcGamma();
        this.calcFontSize();
    }

    private calcGamma() {
        this._gamma = 2 * 1.4142 / (this.realFontSize * ((this._strokeRGBA.a <= 0) ? 1 : 1.8));
    }  

    get fontSize() {
        return this._fontSize;
    }

    setFontSize(fontSize: number, focus = false) {
        if(this._$fontSize == null || focus) {
            this._fontSize = fontSize;
        }
    }

    get fontSmoothness() {
        return this._fontSmoothness;
    }

    setFontSmoothness(value: number, focus: boolean = false) {
        if(this._$fontSmoothness == null || focus) {
            this._fontSmoothness = value;
        }
    }

    get shadow() {
        return this._shadow;
    }
    setShadow(value: number, focus: boolean = false) {
        if(this._$shadow == null || focus) {
            this._shadow = value;
        }
    }

    get shadowOffsetX() {
        return this._shadowOffsetX;
    }
    setShadowOffsetX(value: number, focus: boolean = false) {
        if(this._$shadowOffsetX == null || focus) {
            this._shadowOffsetX = value;
        }
    }

    get shadowOffsetY() {
        return this._shadowOffsetY;
    }

    setShadowOffsetY(value: number, focus: boolean = false) {
        if(this._$shadowOffsetY == null || focus) {
            this._shadowOffsetY = value;
        }
    }

    get fillRGBA() {
        return this._fillRGBA;
    }
    
    /**
     * 设置文本颜色
     * @param color 
     * @param focus 如果为false，且颜色未通过样式设置过时，才可以改变
     */
    setFillColor(color: Color, focus: boolean = false) {
        if(this._$color == null || focus) {
            this._fillRGBA.set(color);
        }
    }


    get isColorLBAvailable() {
        return this._enableColorLB || !!this._$colorLB;
    }
    get enableColorLB() {
        return this._enableColorLB
    }
    set enableColorLB(value: boolean) {
        this._enableColorLB = value;
    }
    get isColorLTAvailable() {
        return this._enableColorLT || !!this._$colorLT;
    }
    get enableColorLT() {
        return this._enableColorLT;
    }
    set enableColorLT(value: boolean) {
        this._enableColorLT = value;
    }
    get isColorRBAvailable() {
        return this._enableColorRB || !!this._$colorRB;
    }
    get enableColorRB() {
        return this._enableColorRB;
    }
    set enableColorRB(value: boolean) {
        this._enableColorRB = value;
    }
    get isColorRTAvailable() {
        return this._enableColorRT || !!this._$colorRT;
    }
    get enableColorRT() {
        return this._enableColorRT;
    }
    set enableColorRT(value: boolean) {
        this._enableColorRT = value;
    }
    getFillColor(corner: ECornerType) {
        switch(corner) {
            case ECornerType.LB:
                return this.isColorLBAvailable ? this._colorLB : this._fillRGBA;
            case ECornerType.LT:
                return this.isColorLTAvailable ? this._colorLT : this._fillRGBA;
            case ECornerType.RB:
                return this.isColorRBAvailable ? this._colorRB : this._fillRGBA;
            case ECornerType.RT:
                return this.isColorRTAvailable ? this._colorRT : this._fillRGBA;
        }
    }

    get colorLB() {
        return this._colorLB;
    }
    setColorLB(color: Color, focus: boolean = false) {
        if(this._$colorLB == null || focus) {
            this._enableColorLB = true;
            this._colorLB.set(color);
        }
    }

    get colorLT() {
        return this._colorLT;
    }
    setColorLT(color: Color, focus: boolean = false) {
        if(this._$colorLT == null || focus) {
            this._enableColorLT = true;
            this._colorLT.set(color);
        }
    }

    get colorRB() {
        return this._colorRB;
    }
    setColorRB(color: Color, focus: boolean = false) {
        if(this._$colorRB == null || focus) {
            this._enableColorRB = true;
            this._colorRB.set(color);
        }
    }

    get colorRT() {
        return this._colorRT;
    }
    setColorRT(color: Color, focus: boolean = false) {
        if(this._$colorRT == null || focus) {
            this._enableColorRT = true;
            this._colorRT.set(color);
        }
    }

    get strokeRGBA() {
        return this._strokeRGBA;
    }
    setStrokeColor(color: Color, focus: boolean = false) {
        if(this._$strokeColor == null || focus) {
            this._strokeRGBA.set(color);
        }
    }

    get shadowRGBA() {
        return this._shadowRGBA;
    }
    setShadowColor(color: Color, focus: boolean = false) {
        if(this._$shadowColor == null || focus) {
            this._shadowRGBA.set(color);
        }
    }

    get backgroundRGBA() {
        return this._backgroundRGBA;
    }

    setBackgroundColor(color: Color, focus: boolean = false) {
        if(this._$backgroundColor == null || focus) {
            this._backgroundRGBA.set(color);
        }
    }

    get maskRGBA() {
        return this._maskRGBA;
    }

    setMaskColor(color: Color, focus: boolean = false) {
        if(this._$maskColor == null || focus) {
            this._maskRGBA.set(color);
        }
    }

    get dilate() {
        return this._dilate;
    }
    setDilate(value: number, focus: boolean = false) {
        if(this._$dilate == null || focus) {
            this._dilate = value;
        }
    }

    get stroke() {
        return this._stroke;
    }
    setStroke(value: number, focus: boolean = false) {
        if(this._$stroke == null || focus) {
            this._stroke = value;
        }
    }

    get strokeBlur() {
        return this._strokeBlur;
    }

    setStrokeBlur(value: number, focus: boolean = false) {
        if(this._$strokeBlur == null || focus) {
            this._strokeBlur = value;
        }
    }

    get gamma() {
        return this._gamma;
    }

    get background() {
        return this._background;
    }

    setBackground(value: boolean, focus: boolean = false) {
        if(this._$background == null || focus) {
            this._background = value;
        }
    }

    get mask() {
        return this._mask;
    }

    setMask(value: boolean, focus: boolean = false) {
        if(this._$mask == null || focus) {
            this._mask = value;
        }
    }

    get shadowBlur() {
        return this._shadowBlur;
    }
    setShadowBlur(value: number, focus: boolean = false) {
        if(this._$shadowBlur == null || focus) {
            this._shadowBlur = value;
        }
    }

    get italic() {
        return this._italic;
    }

    setItalic(value: boolean, focus: boolean = false) {
        if(this._$italic == null || focus) {
            this._italic = value;
        }
    }

    get bold() {
        return this._bold;
    }

    setBold(value: boolean, focus: boolean = false) {
        if(this._$bold == null || focus) {
            this._bold = value;
        }
    }

    get scriptType() {
        return this._scriptType;
    }

    setScriptType(value: EScriptType, focus: boolean = false) {
        if(this._$scriptType == null || focus) {
            this._scriptType = value;
        }
    }

    get strike() {
        return this._strike;
    }

    setStrike(value: boolean, focus: boolean = false) {
        if(this._$strike == null || focus) {
            this._strike = value;
        }
    }

    get strikeRGBA() {
        return this._strikeRGBA;
    }

    setStrikeColor(color: Color, focus: boolean = false) {
        if(this._$strikeColor == null || focus) {
            this._strikeRGBA.set(color);
        }
    }

    get underline() {
        return this._underline;
    }

    setUnderline(value: boolean, focus: boolean = false) {
        if(this._$underline == null || focus) {
            this._underline = value;
        }
    }

    get underlineRGBA() {
        return this._underlineRGBA;
    }

    setUnderlineColor(color: Color, focus: boolean = false) {
        if(this._$underlineColor == null || focus) {
            this._underlineRGBA.set(color);
        }
    }

    get enableGlow() {
        return this._enableGlow;
    }
    setEnableGlow(value: boolean, focus: boolean = false) {
        if(this._$enableGlow == null || focus) {
            this._enableGlow = value;
        }
    }

    get glowColor() {
        return this._glowColor;
    }
    setGlowColor(color: Color, focus: boolean = false) {
        if(this._$glowColor == null || focus) {
            this._glowColor.set(color);
        }
    }

    get glowInner() {
        return this._glowInner;
    }
    setGlowInner(value: number, focus: boolean = false) {
        if(this._$glowInner == null || focus) {
            this._glowInner = value;
        }
    }

    get glowOuter() {
        return this._glowOuter;
    }
    setGlowOuter(value: number, focus: boolean = false) {
        if(this._$glowOuter == null || focus) {
            this._glowOuter = value;
        }
    }

    get glowPower() {
        return this._glowPower;
    }
    setGlowPower(value: number, focus: boolean = false) {
        if(this._$glowPower == null || focus) {
            this._glowPower = value;
        }
    }

    get glowOffsetX() {
        return this._glowOffsetX;
    }
    setGlowOffsetX(value: number, focus: boolean = false) {
        if(this._$glowOffsetX == null || focus) {
            this._glowOffsetX = value;
        }
    }

    get glowOffsetY() {
        return this._glowOffsetY;
    }
    setGlowOffsetY(value: number, focus: boolean = false) {
        if(this._$glowOffsetY == null || focus) {
            this._glowOffsetY = value;
        }
    }

    get autoWarp() {
        return this._autoWarp;
    }

    get equalWidth() {
        return this._equalWidth;
    }

    get fixedLineHeight() {
        return this._fixedLineHeight;
    }

    get horizontalAlign() {
        return this._horizontalAlign;
    }

    get verticalAlign() {
        return this._verticalAlign;
    }

    get overflow() {
        return this._overflow;
    }

    get fontAutoSize() {
        return this._fontAutoSize;
    }

    get fontMiniSize() {
        return this._fontMiniSize;
    }

    get fontMaxSize() {
        return this._fontMaxSize;
    }

    get lineSpace() {
        return this._lineSpace;
    }

    setLineSpace(value: number, focus: boolean = false) {
        if(this._$lineSpace == null || focus) {
            this._lineSpace = value;
        }
    }

    get letterSpace() {
        return this._letterSpace;
    }
    setLetterSpace(value: number, focus: boolean = false) {
        if(this._$letterSpace == null || focus) {
            this._letterSpace = value;
        }
    }

    get paddingLeft(){
        return this._paddingLeft;
    }

    get paddingRight() {
        return this._paddingRight;
    }

    get paddingTop() {
        return this._paddingTop;
    }

    get paddingBottom() {
        return this._paddingBottom;
    }

    get aspect() {
        return this._aspect;
    }

    get charVisibleRatio() {
        return this._charVisibleRatio;
    }

    get breakWestern() {
        return this._breakWestern;
    }

    setBreakWestern(value: boolean, focus: boolean = false) {
        if(this._$breakWestern == null || focus) {
            this._breakWestern = value;
        }
    }


    private setAttributeFromObject(obj: any, prefix?: string, changedFields?: string[]) {
        if(obj == null) {
            return;
        }

        let keys = Object.keys(obj);
        for(let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = obj[key];

            if(key == "enables" && Array.isArray(value)) {
                for(let j = 0; j < value.length; j++) {
                    let item = value[j];
                    let attr = StyleMapper[item];
                    if(attr != null) {
                        this[attr.field] = attr.value;
                        if(changedFields != null) {
                            changedFields.push(attr.field);
                        }
                    }else{
                        console.warn("StyleMapper not found: " + item);
                    }
                }
                continue;
            }

            if(value == null) {
                continue;
            }

            let attr = StyleMapper[key];
            if(attr == null) {
                if(StyleMapper.valueKeys.indexOf(key) >= 0) {
                    this[key] = value;
                    continue;
                }

                // If not found, try to handle nested objects like shadow: { x: 1 } -> shadow-x
                if(prefix) {
                    key = `${prefix}-${key}`;
                }
    
                if(typeof value === "object") {
                    this.setAttributeFromObject(value, key, changedFields);
                } else {
                    console.warn(`StyleMapper[${key}] is null`);
                }

                continue;
            }else{
                if(attr.field) {
                    this[attr.field] = value != null ? value : attr.value;
                    if(changedFields != null) {
                        changedFields.push(attr.field);
                    }
                }else if(attr.mapper){
                    let fieldMappler = StyleMapper[attr.mapper];
                    if(fieldMappler) {
                        if(fieldMappler.field) {
                            this[fieldMappler.field] = value != null ? value : attr.value;
                            if(changedFields != null) {
                                changedFields.push(fieldMappler.field);
                            }
                        }
                    }else{
                        console.error("can not find mapper", attr.mapper);
                    }
                }
            }
        }
    }

    parseFromJson(json: object) {       
        let changedFields: string[] = [];
        this.changedFields = changedFields;
        this.setAttributeFromObject(json, null, changedFields);
        this.preset();
    }

    parseFromJsonStr(style: string) {
        let json = JSON.parse(style); 
        let changedFields: string[] = [];
        this.changedFields = changedFields;       
        this.setAttributeFromObject(json, null, changedFields);
        this.preset();
    }
}
