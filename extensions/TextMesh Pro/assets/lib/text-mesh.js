var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("TextMesh/types/IChar", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("TextMesh/font/FontParser", ["require", "exports", "cc/env"], function (require, exports, env_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontParser = void 0;
    class FontParser {
        static parse(uuid, data) {
            if (!env_1.EDITOR) {
                let fontInfo = this._fonts[uuid];
                if (fontInfo) {
                    return fontInfo;
                }
            }
            let result = {
                chars: {},
            };
            let lines = data.split("\n");
            for (let i = 0; i < lines.length; i++) {
                let arr = lines[i].split("=");
                if (arr.length == 2) {
                    let field = arr[0];
                    if (field != "char") {
                        if (field != "version" && field != "font" && field != "atlas" && field != "charset" && field != "fontFamily") {
                            result[field] = parseFloat(arr[1]);
                        }
                        else {
                            result[field] = arr[1].replace(/[\r\n]/gi, "");
                        }
                    }
                    else {
                        let parms = arr[1].split(",");
                        result.chars[parms[0]] = {
                            channelID: parseInt(parms[1]),
                            x: parseInt(parms[2]),
                            y: parseInt(parms[3]),
                            width: parseInt(parms[4]),
                            height: parseInt(parms[5]),
                            size: parseInt(parms[6]),
                            glyphWidth: parseInt(parms[7]),
                            glyphHeight: parseInt(parms[8]),
                            glyphAdvance: parseFloat(parms[9]),
                            glyphLeft: parseFloat(parms[10]),
                            glyphRight: parseFloat(parms[11]),
                            ascent: parseFloat(parms[12]),
                            descent: parseFloat(parms[13]),
                            scale: parseFloat(parms[14]),
                        };
                    }
                }
            }
            result.id = ++this._sid;
            this._fonts[uuid] = result;
            return result;
        }
    }
    exports.FontParser = FontParser;
    FontParser._sid = 0;
    FontParser._fonts = {};
});
define("TextMesh/font/Char", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Char = void 0;
    class Char {
        constructor() {
            this.static = false;
            this.code = "";
            /**
             * 左下，右下，左上，右上
             */
            this.uvs = new Float32Array;
            this.glyphWidth = 0;
            this.glyphHeight = 0;
            this.glyphAdvance = 0;
            this.glyphRight = 0;
            this.glyphLeft = 0;
            this.width = 0;
            this.height = 0;
            this.size = 0;
            this.ascent = 0;
            this.descent = 0;
            this.scale = 0;
            /**
             * channel id[0,3]
             */
            this.cid = 0;
        }
        static fromTMFCharInfo(code, tmfFont, charInfo) {
            let char = new Char;
            char.code = code;
            let u0 = charInfo.x / tmfFont.atlasWidth;
            let v0 = charInfo.y / tmfFont.atlasHeight;
            let u1 = (charInfo.x + charInfo.width) / tmfFont.atlasWidth;
            let v1 = (charInfo.y + charInfo.height) / tmfFont.atlasHeight;
            char.uvs = new Float32Array([u0, v0, u1, v0, u0, v1, u1, v1]);
            char.glyphWidth = charInfo.glyphWidth;
            char.glyphHeight = charInfo.glyphHeight;
            char.glyphAdvance = charInfo.glyphAdvance;
            char.glyphRight = charInfo.glyphRight;
            char.glyphLeft = charInfo.glyphLeft;
            char.width = charInfo.width;
            char.height = charInfo.height;
            char.size = charInfo.size;
            char.ascent = charInfo.ascent;
            char.descent = charInfo.descent;
            char.scale = charInfo.scale;
            char.cid = charInfo.channelID;
            return char;
        }
    }
    exports.Char = Char;
});
define("TextMesh/label/types", ["require", "exports", "cc"], function (require, exports, cc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Margin = exports.EScriptType = exports.ETextOverflow = exports.ETextVerticalAlign = exports.ETextHorizontalAlign = exports.ETextDirection = void 0;
    const { ccclass, property } = cc_1._decorator;
    var ETextDirection;
    (function (ETextDirection) {
        ETextDirection[ETextDirection["Horizontal"] = 0] = "Horizontal";
        ETextDirection[ETextDirection["Vertical"] = 1] = "Vertical";
    })(ETextDirection = exports.ETextDirection || (exports.ETextDirection = {}));
    ;
    (0, cc_1.ccenum)(ETextDirection);
    var ETextHorizontalAlign;
    (function (ETextHorizontalAlign) {
        ETextHorizontalAlign[ETextHorizontalAlign["Left"] = 0] = "Left";
        ETextHorizontalAlign[ETextHorizontalAlign["Center"] = 1] = "Center";
        ETextHorizontalAlign[ETextHorizontalAlign["Right"] = 2] = "Right";
    })(ETextHorizontalAlign = exports.ETextHorizontalAlign || (exports.ETextHorizontalAlign = {}));
    ;
    (0, cc_1.ccenum)(ETextHorizontalAlign);
    var ETextVerticalAlign;
    (function (ETextVerticalAlign) {
        ETextVerticalAlign[ETextVerticalAlign["Top"] = 0] = "Top";
        ETextVerticalAlign[ETextVerticalAlign["Middle"] = 1] = "Middle";
        ETextVerticalAlign[ETextVerticalAlign["Bottom"] = 2] = "Bottom";
    })(ETextVerticalAlign = exports.ETextVerticalAlign || (exports.ETextVerticalAlign = {}));
    ;
    (0, cc_1.ccenum)(ETextVerticalAlign);
    /**
     * @en Enum for Overflow.
     *
     * @zh 文本超载类型。
     */
    var ETextOverflow;
    (function (ETextOverflow) {
        /**
         * @en None.
         *
         * @zh 此模式下，组件宽度是自动变化的
         */
        ETextOverflow[ETextOverflow["None"] = 0] = "None";
        /**
         * @en In CLAMP mode, when label content goes out of the bounding box, it will be clipped.
         *
         * @zh CLAMP 模式中，当文本内容超出边界框时，多余的会被截断。
         */
        ETextOverflow[ETextOverflow["Clamp"] = 1] = "Clamp";
        /**
         * @en In SHRINK mode, the font size will change dynamically to adapt the content size.
         * This mode may takes up more CPU resources when the label is refreshed.
         *
         * @zh SHRINK 模式，字体大小会动态变化，以适应内容大小。这个模式在文本刷新的时候可能会占用较多 CPU 资源。
         */
        ETextOverflow[ETextOverflow["Shrink"] = 2] = "Shrink";
        /**
         * @en In RESIZE_HEIGHT mode, you can only change the width of label and the height is changed automatically.
         *
         * @zh 在 RESIZE_HEIGHT 模式下，只能更改文本的宽度，高度是自动改变的。
         */
        ETextOverflow[ETextOverflow["ResizeHeight"] = 3] = "ResizeHeight";
    })(ETextOverflow = exports.ETextOverflow || (exports.ETextOverflow = {}));
    (0, cc_1.ccenum)(ETextOverflow);
    var EScriptType;
    (function (EScriptType) {
        EScriptType[EScriptType["None"] = 0] = "None";
        EScriptType[EScriptType["SuperScript"] = 1] = "SuperScript";
        EScriptType[EScriptType["SubScript"] = 2] = "SubScript";
    })(EScriptType = exports.EScriptType || (exports.EScriptType = {}));
    let Margin = class Margin {
        constructor() {
            this._left = 0;
            this._right = 0;
            this._top = 0;
            this._bottom = 0;
        }
        get left() {
            return this._left;
        }
        set left(val) {
            if (this._left != val) {
                this._left = val;
                this.onChanged && this.onChanged();
            }
        }
        get right() {
            return this._right;
        }
        set right(val) {
            if (this._right != val) {
                this._right = val;
                this.onChanged && this.onChanged();
            }
        }
        get top() {
            return this._top;
        }
        set top(val) {
            if (this._top != val) {
                this._top = val;
                this.onChanged && this.onChanged();
            }
        }
        get bottom() {
            return this._bottom;
        }
        set bottom(val) {
            if (this._bottom != val) {
                this._bottom = val;
                this.onChanged && this.onChanged();
            }
        }
    };
    __decorate([
        property({ visible: false, serializable: true })
    ], Margin.prototype, "_left", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], Margin.prototype, "_right", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], Margin.prototype, "_top", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], Margin.prototype, "_bottom", void 0);
    __decorate([
        property
    ], Margin.prototype, "left", null);
    __decorate([
        property
    ], Margin.prototype, "right", null);
    __decorate([
        property
    ], Margin.prototype, "top", null);
    __decorate([
        property
    ], Margin.prototype, "bottom", null);
    Margin = __decorate([
        ccclass("Margin")
    ], Margin);
    exports.Margin = Margin;
});
define("TextMesh/label/StyleMapper", ["require", "exports", "TextMesh/label/types"], function (require, exports, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleMapper = void 0;
    exports.StyleMapper = {
        "tagMap": {
            "br": "\n",
        },
        "sup": {
            field: "_$scriptType",
            value: types_1.EScriptType.SuperScript,
        },
        "sub": {
            field: "_$scriptType",
            value: types_1.EScriptType.SubScript,
        },
        "u": {
            field: "_$underline",
            value: true,
        },
        "s": {
            field: "_$strike",
            value: true,
        },
        "i": {
            field: "_$italic",
            value: true,
        },
        "b": {
            field: "_$dilate",
            value: 0.6,
        },
        "bg": {
            field: "_$background",
            value: true,
        },
        "color-lt": {
            field: "_$colorLT",
        },
        "color-lb": {
            field: "_$colorLB",
        },
        "color-rt": {
            field: "_$colorRT",
        },
        "color-rb": {
            field: "_$colorRB",
        },
        "color": {
            field: "_$color",
            value: 0xffffff,
            attributes: {
                "lt": {
                    mapper: "color-lt",
                },
                "lb": {
                    mapper: "color-lb",
                },
                "rt": {
                    mapper: "color-rt",
                },
                "rb": {
                    mapper: "color-rb",
                },
            }
        },
        "shadow-color": {
            field: "_$shadowColor",
        },
        "shadow-x": {
            field: "_$shadowX",
        },
        "shadow-y": {
            field: "_$shadowY",
        },
        "shadow-blur": {
            field: "_$shadowBlur",
        },
        "shadow": {
            field: "_$shadow",
            value: 0.1,
            attributes: {
                color: {
                    mapper: "shadow-color",
                },
                x: {
                    mapper: "shadow-x",
                },
                y: {
                    mapper: "shadow-y",
                },
                blur: {
                    mapper: "shadow-blur",
                    // field: "_$shadowBlur",
                }
            }
        },
        "stroke-color": {
            field: "_$strokeColor",
        },
        "stroke-blur": {
            field: "_$strokeBlur",
        },
        "stroke": {
            field: "_$stroke",
            attributes: {
                color: {
                    mapper: "stroke-color",
                },
                blur: {
                    mapper: "stroke-blur",
                }
            }
        },
        "outline-color": {
            field: "_$strokeColor",
        },
        "outline-blur": {
            field: "_$strokeBlur",
        },
        "outline": {
            field: "_$stroke",
            attributes: {
                color: {
                    mapper: "stroke-color",
                },
                blur: {
                    mapper: "stroke-blur",
                }
            }
        },
        "dilate": {
            field: "_$dilate",
        },
        "background-color": {
            field: "_$backgroundColor",
        },
        "background": {
            field: "_$background",
            value: true,
            attributes: {
                color: {
                    mapper: "background-color",
                },
            },
        },
        "mask-color": {
            field: "_$maskColor",
        },
        "mask": {
            field: "_$mask",
            value: true,
            attributes: {
                color: {
                    mapper: "mask-color",
                },
            },
        },
        "font-size": {
            field: "_$fontSize",
        },
        "font": {
            field: "_$font",
            value: true,
            attributes: {
                size: {
                    mapper: "font-size",
                },
            },
        },
    };
});
define("TextMesh/label/TextStyle", ["require", "exports", "cc", "TextMesh/label/StyleMapper", "TextMesh/label/types"], function (require, exports, cc_2, StyleMapper_1, types_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextStyle = exports.ECornerType = void 0;
    const colorMap = {
        'red': cc_2.Color.RED,
        'green': cc_2.Color.GREEN,
        'blue': cc_2.Color.BLUE,
        'yellow': cc_2.Color.YELLOW,
        'cyan': cc_2.Color.CYAN,
        'magenta': cc_2.Color.MAGENTA,
        'black': cc_2.Color.BLACK,
        'white': cc_2.Color.WHITE,
        'gray': cc_2.Color.GRAY,
        'transparent': cc_2.Color.TRANSPARENT,
    };
    var ECornerType;
    (function (ECornerType) {
        ECornerType[ECornerType["LT"] = 0] = "LT";
        ECornerType[ECornerType["RT"] = 1] = "RT";
        ECornerType[ECornerType["LB"] = 2] = "LB";
        ECornerType[ECornerType["RB"] = 3] = "RB";
    })(ECornerType = exports.ECornerType || (exports.ECornerType = {}));
    class TextStyle {
        constructor(tmFont) {
            this._fontSize = 18;
            this._dilate = 0.25;
            this._background = false;
            this._mask = false;
            this._italic = false;
            this._scriptType = types_2.EScriptType.None;
            this._strike = false;
            this._strikeRGBA = new cc_2.Color(0, 0, 0, 255);
            this._underline = false;
            this._underlineRGBA = new cc_2.Color(0, 0, 0, 255);
            this._fillRGBA = new cc_2.Color(0, 0, 0, 255);
            this._enableColorLT = false;
            this._enableColorLB = false;
            this._enableColorRT = false;
            this._enableColorRB = false;
            this._colorLT = new cc_2.Color();
            this._colorLB = new cc_2.Color();
            this._colorRT = new cc_2.Color();
            this._colorRB = new cc_2.Color();
            this._strokeRGBA = new cc_2.Color(0, 0, 0, 255);
            this._shadowRGBA = new cc_2.Color(0, 0, 0, 255);
            this._backgroundRGBA = new cc_2.Color(0, 0, 0, 255);
            this._maskRGBA = new cc_2.Color(0, 0, 0, 128);
            this._stroke = 0;
            this._strokeBlur = 0;
            this._gamma = 1;
            this._shadow = 0;
            this._shadowBlur = 0;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._realFontSize = 18;
            this._tmFont = tmFont;
        }
        get font() {
            return this._tmFont;
        }
        set font(value) {
            if (this._tmFont !== value) {
                this._tmFont = value;
            }
        }
        get realFontSize() {
            return this._realFontSize;
        }
        reset() {
            this._$color = null;
            this._$shadowColor = null;
            this._$shadowBlur = null;
            this._shadowOffsetX = null;
            this._shadowOffsetY = null;
            this._$stroke = null;
            this._$strokeColor = null;
            this._$strokeBlur = null;
            this._$backgroundColor = null;
            this._$maskColor = null;
            this._$fontSize = null;
            this._fontSize = null;
            this._$italic = null;
            this._$dilate = null;
            this._$strike = null;
            this._$strikeColor = null;
            this._$underline = null;
            this._$underlineColor = null;
            this._$scriptType = null;
            this._scriptType = null;
            this._enableColorLB = false;
            this._enableColorLT = false;
            this._enableColorRB = false;
            this._enableColorRT = false;
        }
        clone() {
            return TextStyle.copy(this);
        }
        copyFrom(from, onlyChanged = true) {
            let fields = onlyChanged ? from.changedFields : null;
            let keys = fields || Object.keys(from);
            for (let key of keys) {
                let value = from[key];
                if (value instanceof cc_2.Color) {
                    this[key].set(value);
                }
                else {
                    this[key] = from[key];
                }
            }
            return this;
        }
        static copy(from) {
            let style = new TextStyle();
            let keys = Object.keys(from);
            for (let key of keys) {
                let value = from[key];
                if (value instanceof cc_2.Color) {
                    style[key].set(value);
                }
                else {
                    style[key] = from[key];
                }
            }
            return style;
        }
        calcFontSize() {
            this._realFontSize = this._fontSize;
            if (this._scriptType != types_2.EScriptType.None) {
                this._realFontSize = this._fontSize * (this.font ? this.font.scriptThickness : 0.2);
            }
        }
        getColor(color, outColor) {
            outColor = outColor || new cc_2.Color();
            if (typeof color === 'string') {
                color = color.toLocaleLowerCase();
                if (colorMap[color]) {
                    return colorMap[color];
                }
                let hex = color.replace('0x', '#');
                cc_2.Color.fromHEX(outColor, hex);
            }
            else if (typeof color === 'number') {
                let r = (color >> 24) & 0xff;
                let g = (color >> 16) & 0xff;
                let b = (color >> 8) & 0xff;
                let a = color & 0xff;
                outColor.set(r, g, b, a);
            }
            return outColor;
        }
        preset() {
            this._fillRGBA = this.getColor(this._$color, this._fillRGBA);
            this._strokeRGBA = this.getColor(this._$strokeColor, this._strokeRGBA);
            this._shadowRGBA = this.getColor(this._$shadowColor, this._shadowRGBA);
            this._backgroundRGBA = this.getColor(this._$backgroundColor, this._backgroundRGBA);
            this._maskRGBA = this.getColor(this._$maskColor, this._maskRGBA);
            this._strikeRGBA = this.getColor(this._$strikeColor || this._$color, this._strikeRGBA);
            this._underlineRGBA = this.getColor(this._$underlineColor || this._$color, this._underlineRGBA);
            this._fontSize = this._$fontSize == null ? this._fontSize : this._$fontSize;
            this._shadow = this._$shadow == null ? this._shadow : this._$shadow;
            this._shadowOffsetX = this._$shadowX == null ? this._shadowOffsetX : this._$shadowX;
            this._shadowOffsetY = this._$shadowY == null ? this._shadowOffsetY : this._$shadowY;
            this._stroke = this._$stroke == null ? this._stroke : this._$stroke;
            this._strokeBlur = this._$strokeBlur == null ? this._strokeBlur : this._$strokeBlur;
            this._dilate = this._$dilate == null ? this._dilate : this._$dilate;
            this._background = this._$background == null ? this._background : this._$background;
            this._mask = this._$mask == null ? this._mask : this._$mask;
            this._italic = this._$italic == null ? this._italic : this._$italic;
            this._strike = this._$strike == null ? this._strike : this._$strike;
            this._underline = this._$underline == null ? this._underline : this._$underline;
            this._scriptType = this._$scriptType == null ? this._scriptType : this._$scriptType;
            if (this._$colorLB) {
                this._enableColorLB = true;
                this._colorLB = this.getColor(this._$colorLB, this._colorLB);
            }
            if (this._$colorLT) {
                this._enableColorLT = true;
                this._colorLT = this.getColor(this._$colorLT, this._colorLT);
            }
            if (this._$colorRB) {
                this._enableColorRB = true;
                this._colorRB = this.getColor(this._$colorRB, this._colorRB);
            }
            if (this._$colorRT) {
                this._enableColorRT = true;
                this._colorRT = this.getColor(this._$colorRT, this._colorRT);
            }
            this.calculate();
        }
        calculate() {
            this.calcGamma();
            this.calcFontSize();
        }
        calcGamma() {
            this._gamma = 2 * 1.4142 / (this.realFontSize * ((this._strokeRGBA.a <= 0) ? 1 : 1.8));
        }
        get fontSize() {
            return this._fontSize;
        }
        setFontSize(fontSize, focus = false) {
            if (this._$fontSize == null || focus) {
                this._fontSize = fontSize;
            }
        }
        get shadow() {
            return this._shadow;
        }
        setShadow(value, focus = false) {
            if (this._$shadow == null || focus) {
                this._shadow = value;
            }
        }
        get shadowOffsetX() {
            return this._shadowOffsetX;
        }
        setShadowOffsetX(value, focus = false) {
            if (this._$shadowX == null || focus) {
                this._shadowOffsetX = value;
            }
        }
        get shadowOffsetY() {
            return this._shadowOffsetY;
        }
        setShadowOffsetY(value, focus = false) {
            if (this._$shadowY == null || focus) {
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
        setFillColor(color, focus = false) {
            if (this._$color == null || focus) {
                this._fillRGBA.set(color);
            }
        }
        get enableColorLB() {
            return this._enableColorLB || !!this._$colorLB;
        }
        set enableColorLB(value) {
            this._enableColorLB = value;
        }
        get enableColorLT() {
            return this._enableColorLT || !!this._$colorLT;
        }
        set enableColorLT(value) {
            this._enableColorLT = value;
        }
        get enableColorRB() {
            return this._enableColorRB || !!this._$colorRB;
        }
        set enableColorRB(value) {
            this._enableColorRB = value;
        }
        get enableColorRT() {
            return this._enableColorRT || !!this._$colorRT;
        }
        set enableColorRT(value) {
            this._enableColorRT = value;
        }
        getFillColor(corner) {
            switch (corner) {
                case ECornerType.LB:
                    return this.enableColorLB ? this._colorLB : this._fillRGBA;
                case ECornerType.LT:
                    return this.enableColorLT ? this._colorLT : this._fillRGBA;
                case ECornerType.RB:
                    return this.enableColorRB ? this._colorRB : this._fillRGBA;
                case ECornerType.RT:
                    return this.enableColorRT ? this._colorRT : this._fillRGBA;
            }
        }
        get colorLB() {
            return this._colorLB;
        }
        setColorLB(color, focus = false) {
            if (this._$colorLB == null || focus) {
                this._enableColorLB = true;
                this._colorLB.set(color);
            }
        }
        get colorLT() {
            return this._colorLT;
        }
        setColorLT(color, focus = false) {
            if (this._$colorLT == null || focus) {
                this._enableColorLT = true;
                this._colorLT.set(color);
            }
        }
        get colorRB() {
            return this._colorRB;
        }
        setColorRB(color, focus = false) {
            if (this._$colorRB == null || focus) {
                this._enableColorRB = true;
                this._colorRB.set(color);
            }
        }
        get colorRT() {
            return this._colorRT;
        }
        setColorRT(color, focus = false) {
            if (this._$colorRT == null || focus) {
                this._enableColorRT = true;
                this._colorRT.set(color);
            }
        }
        get strokeRGBA() {
            return this._strokeRGBA;
        }
        setStrokeColor(color, focus = false) {
            if (this._$strokeColor == null || focus) {
                this._strokeRGBA.set(color);
            }
        }
        get shadowRGBA() {
            return this._shadowRGBA;
        }
        setShadowColor(color, focus = false) {
            if (this._$shadowColor == null || focus) {
                this._shadowRGBA.set(color);
            }
        }
        get backgroundRGBA() {
            return this._backgroundRGBA;
        }
        setBackgroundColor(color, focus = false) {
            if (this._$backgroundColor == null || focus) {
                this._backgroundRGBA.set(color);
            }
        }
        get maskRGBA() {
            return this._maskRGBA;
        }
        setMaskColor(color, focus = false) {
            if (this._$maskColor == null || focus) {
                this._maskRGBA.set(color);
            }
        }
        get dilate() {
            return this._dilate;
        }
        setDilate(value, focus = false) {
            if (this._$dilate == null || focus) {
                this._dilate = value;
            }
        }
        get stroke() {
            return this._stroke;
        }
        setStroke(value, focus = false) {
            if (this._$stroke == null || focus) {
                this._stroke = value;
            }
        }
        get strokeBlur() {
            return this._strokeBlur;
        }
        setStrokeBlur(value, focus = false) {
            if (this._$strokeBlur == null || focus) {
                this._strokeBlur = value;
            }
        }
        get gamma() {
            return this._gamma;
        }
        get background() {
            return this._background;
        }
        setBackground(value, focus = false) {
            if (this._$background == null || focus) {
                this._background = value;
            }
        }
        get mask() {
            return this._mask;
        }
        setMask(value, focus = false) {
            if (this._$mask == null || focus) {
                this._mask = value;
            }
        }
        get shadowBlur() {
            return this._shadowBlur;
        }
        setShadowBlur(value, focus = false) {
            if (this._$shadowBlur == null || focus) {
                this._shadowBlur = value;
            }
        }
        get italic() {
            return this._italic;
        }
        setItalic(value, focus = false) {
            if (this._$italic == null || focus) {
                this._italic = value;
            }
        }
        get scriptType() {
            return this._scriptType;
        }
        setScriptType(value, focus = false) {
            if (this._$scriptType == null || focus) {
                this._scriptType = value;
            }
        }
        get strike() {
            return this._strike;
        }
        setStrike(value, focus = false) {
            if (this._$strike == null || focus) {
                this._strike = value;
            }
        }
        get strikeRGBA() {
            return this._strikeRGBA;
        }
        setStrikeColor(color, focus = false) {
            if (this._$strikeColor == null || focus) {
                this._strikeRGBA.set(color);
            }
        }
        get underline() {
            return this._underline;
        }
        setUnderline(value, focus = false) {
            if (this._$underline == null || focus) {
                this._underline = value;
            }
        }
        get underlineRGBA() {
            return this._underlineRGBA;
        }
        setUnderlineColor(color, focus = false) {
            if (this._$underlineColor == null || focus) {
                this._underlineRGBA.set(color);
            }
        }
        setAttributeFromObject(obj, prefix, changedFields) {
            if (obj == null) {
                return;
            }
            let keys = Object.keys(obj);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let value = obj[key];
                if (key == "enables" && Array.isArray(value)) {
                    for (let j = 0; j < value.length; j++) {
                        let item = value[j];
                        let attr = StyleMapper_1.StyleMapper[item];
                        if (attr != null) {
                            this[attr.field] = attr.Value;
                            if (changedFields != null) {
                                changedFields.push(attr.field);
                            }
                        }
                        else {
                            console.warn("StyleMapper not found: " + item);
                        }
                    }
                    continue;
                }
                if (value == null) {
                    continue;
                }
                if (prefix) {
                    key = `${prefix}-${key}`;
                }
                if (typeof value === "object") {
                    this.setAttributeFromObject(value, key, changedFields);
                    continue;
                }
                let attr = StyleMapper_1.StyleMapper[key];
                if (attr == null) {
                    console.warn(`StyleMapper[${key}] is null`);
                }
                else {
                    if (attr.field) {
                        this[attr.field] = value != null ? value : attr.Value;
                        if (changedFields != null) {
                            changedFields.push(attr.field);
                        }
                    }
                    else if (attr.mapper) {
                        let fieldMappler = StyleMapper_1.StyleMapper[attr.mapper];
                        if (fieldMappler) {
                            if (fieldMappler.field) {
                                this[fieldMappler.field] = value != null ? value : attr.Value;
                                if (changedFields != null) {
                                    changedFields.push(fieldMappler.field);
                                }
                            }
                        }
                        else {
                            console.error("can not find mapper", attr.mapper);
                        }
                    }
                }
            }
        }
        parseFromJson(json) {
            let changedFields = [];
            this.changedFields = changedFields;
            this.setAttributeFromObject(json, null, changedFields);
            this.preset();
        }
        parseFromJsonStr(style) {
            let json = JSON.parse(style);
            let changedFields = [];
            this.changedFields = changedFields;
            this.setAttributeFromObject(json, null, changedFields);
            this.preset();
        }
    }
    exports.TextStyle = TextStyle;
});
define("TextMesh/label/LayoutTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Slot = exports.ESlotSizeType = exports.isSlotType = exports.SlotTypeMap = exports.SlotTAG = exports.PrefabTAG = exports.ImageTAG = exports.ESlotType = exports.Clickable = void 0;
    class Clickable {
    }
    exports.Clickable = Clickable;
    var ESlotType;
    (function (ESlotType) {
        ESlotType[ESlotType["Custom"] = 0] = "Custom";
        ESlotType[ESlotType["Image"] = 1] = "Image";
        ESlotType[ESlotType["Prefab"] = 2] = "Prefab";
    })(ESlotType = exports.ESlotType || (exports.ESlotType = {}));
    exports.ImageTAG = "img";
    exports.PrefabTAG = "pb";
    exports.SlotTAG = "slot";
    exports.SlotTypeMap = {};
    exports.SlotTypeMap[exports.ImageTAG] = ESlotType.Image;
    exports.SlotTypeMap[exports.PrefabTAG] = ESlotType.Prefab;
    exports.SlotTypeMap[exports.SlotTAG] = ESlotType.Custom;
    function isSlotType(type) {
        return type == exports.ImageTAG || type == exports.PrefabTAG || type == exports.SlotTAG;
    }
    exports.isSlotType = isSlotType;
    var ESlotSizeType;
    (function (ESlotSizeType) {
        ESlotSizeType[ESlotSizeType["None"] = 0] = "None";
        ESlotSizeType[ESlotSizeType["HeightFirst"] = 1] = "HeightFirst";
        ESlotSizeType[ESlotSizeType["WidthFirst"] = 2] = "WidthFirst";
    })(ESlotSizeType = exports.ESlotSizeType || (exports.ESlotSizeType = {}));
    class Slot {
        constructor() {
            this.type = ESlotType.Image;
            this.tag = "";
            this.name = "";
            this.src = "";
            this.width = null;
            this.height = null;
            this.node = null;
            this.dx = 0;
            this.dy = 0;
            this.fixed = false;
            this.sizeType = 0;
        }
    }
    exports.Slot = Slot;
});
define("TextMesh/vertex/ETMQuadType", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ETMQuadType = void 0;
    var ETMQuadType;
    (function (ETMQuadType) {
        ETMQuadType[ETMQuadType["Char"] = 0] = "Char";
        ETMQuadType[ETMQuadType["UnderLine"] = 1] = "UnderLine";
        ETMQuadType[ETMQuadType["DeleteLine"] = 2] = "DeleteLine";
        ETMQuadType[ETMQuadType["Background"] = 3] = "Background";
        ETMQuadType[ETMQuadType["Mask"] = 4] = "Mask";
        ETMQuadType[ETMQuadType["Shadow"] = 5] = "Shadow";
    })(ETMQuadType = exports.ETMQuadType || (exports.ETMQuadType = {}));
});
define("TextMesh/label/CharInfo", ["require", "exports", "cc", "TextMesh/vertex/ETMQuadType"], function (require, exports, cc_3, ETMQuadType_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCharInfoFromPool = exports.putCharInfoToPool = exports.CharInfo = exports.CharVertex = void 0;
    class CharVertex {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            // real x
            this.rx = 0;
            // real y
            this.ry = 0;
            this.scale = 1;
            this.rot = 0;
            this.u = 0;
            this.v = 0;
            this.u1 = 0;
            this.v1 = 0;
            this.uw = 0;
            this.vh = 0;
            this.type = ETMQuadType_1.ETMQuadType.Char;
        }
    }
    exports.CharVertex = CharVertex;
    let _charVertexPool = new cc_3.Pool(() => new CharVertex(), 128);
    class CharInfo {
        constructor() {
            this.index = 0;
            this.visible = true;
            /**
             * 顶点坐标：左下、右下、左上、右上
             */
            this.vertexData = [];
            this.ascent = 0;
            this.descent = 0;
            this.realWidth = 0;
            this.realHeight = 0;
            this.fontSize = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.fixedY = 0;
            this.w = 0;
            this.h = 0;
            this.glyphLeft = 0;
            // 文字范围到最右边的距离
            this.glyphRight = 0;
            // 基线上倾斜宽度
            this.sw = 0;
            // 基线下倾斜宽度
            this.sw1 = 0;
            this.cjk = null;
            this.scale = 1;
            this.slot = null;
            this.click = null;
            // 行号
            this.line = 0;
            // 行内编号
            this.inline = 0;
            this.visibleChar = true;
            this.shadowChar = null;
        }
        addVertex() {
            let vertex = _charVertexPool.alloc();
            this.vertexData.push(vertex);
            return vertex;
        }
        copyFrom(charInfo) {
            this.index = charInfo.index;
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
            this.fixedY = charInfo.fixedY;
        }
        reset() {
            if (this.style.shadow > 0 && !this.shadowChar) {
                this.shadowChar = CharInfoPool.alloc();
                this.shadowChar.copyFrom(this);
            }
            else if (this.shadowChar) {
                putCharInfoToPool(this.shadowChar);
                this.shadowChar = null;
            }
        }
    }
    exports.CharInfo = CharInfo;
    var CharInfoPool = new cc_3.Pool(() => new CharInfo(), 128);
    function putCharInfoToPool(charInfo) {
        for (let i = 0; i < charInfo.vertexData.length; i++) {
            _charVertexPool.free(charInfo.vertexData[i]);
        }
        charInfo.vertexData.length = 0;
        CharInfoPool.free(charInfo);
        if (charInfo.shadowChar) {
            putCharInfoToPool(charInfo.shadowChar);
            charInfo.shadowChar = null;
        }
    }
    exports.putCharInfoToPool = putCharInfoToPool;
    function getCharInfoFromPool() {
        let charInfo = CharInfoPool.alloc();
        charInfo.index = 0;
        charInfo.font = null;
        charInfo.blendMode = 0;
        charInfo.char = null;
        charInfo.style = null;
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
        charInfo.cjk = null;
        charInfo.scale = 1;
        charInfo.slot = null;
        charInfo.click = null;
        charInfo.line = 0;
        charInfo.inline = 0;
        charInfo.vertexData.length = 0;
        charInfo.visibleChar = true;
        charInfo.shadowChar = null;
        charInfo.fixedY = 0;
        charInfo.visible = true;
        charInfo.startY = 0;
        charInfo.ascent = 0;
        charInfo.descent = 0;
        return charInfo;
    }
    exports.getCharInfoFromPool = getCharInfoFromPool;
});
define("TextMesh/types/IFontData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("TextMesh/types/ITMFont", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("TextMesh/font/TextureChannel", ["require", "exports", "lru-cache"], function (require, exports, lru_cache_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextureChannel = void 0;
    lru_cache_1 = __importDefault(lru_cache_1);
    class TextureChannel {
        constructor(tmFont, index, isDynamic, lru) {
            this._disposedSpaces = [];
            this._count = 0;
            this._tmFont = tmFont;
            this._index = index;
            this._isDynamic = isDynamic;
            this._size = tmFont.fontData.spaceSize;
            this._colSize = Math.floor(tmFont.textureWidth / this._size);
            this._rowSize = Math.floor(tmFont.textureHeight / this._size);
            this._capacity = this._colSize * this._rowSize;
            if (isDynamic) {
                this._lru = lru || new lru_cache_1.default({
                    max: this._capacity,
                    dispose: (value, key) => {
                        this._disposedSpaces.push(value);
                        this._tmFont.removeDynamicChar(key);
                    }
                });
            }
        }
        get index() {
            return this._index;
        }
        get isDynamic() {
            return this._isDynamic;
        }
        get count() {
            return this._count;
        }
        get rowSize() {
            return this._rowSize;
        }
        get colSize() {
            return this._colSize;
        }
        get capacity() {
            return this._capacity;
        }
        get lru() {
            return this._lru;
        }
        isFull() {
            return this._count >= this._capacity;
        }
        /**
         * 分配新的字符空位
         * @param code 字符编码
         * @returns 空位信息
         */
        spanEmptySpace(code) {
            let ret;
            if (this.isFull()) {
                // 如果是动态字体，则从缓存中获取空位
                if (this._lru) {
                    ret = this._lru.get(code);
                    if (ret) {
                        return ret;
                    }
                    if (this._disposedSpaces.length > 0) {
                        ret = this._disposedSpaces.pop();
                        this._lru.set(code, ret);
                        return ret;
                    }
                }
                else {
                    return null;
                }
            }
            let row = Math.floor(this._count / this._colSize);
            let col = this._count % this._rowSize;
            let x = col * this._size;
            let y = row * this._size;
            let width = this._size;
            let height = this._size;
            this._count++;
            ret = {
                code,
                cid: this._index,
                row,
                col,
                width,
                height,
                x,
                y,
            };
            if (this._lru) {
                this._lru.set(code, ret);
            }
            return ret;
        }
    }
    exports.TextureChannel = TextureChannel;
});
define("TextMesh/utils/CanvasPool", ["require", "exports", "cc"], function (require, exports, cc_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CanvasPool = void 0;
    let _canvasPool;
    class CanvasPool {
        constructor() {
            this.pool = [];
        }
        static getInstance() {
            if (!_canvasPool) {
                _canvasPool = new CanvasPool();
            }
            return _canvasPool;
        }
        get() {
            let data = this.pool.pop();
            if (!data) {
                const canvas = cc_4.cclegacy._global.window.document.createElement('canvas');
                const context = canvas.getContext('2d');
                data = {
                    canvas,
                    context,
                };
            }
            return data;
        }
        put(canvas) {
            if (this.pool.length >= cc_4.macro.MAX_LABEL_CANVAS_POOL_SIZE) {
                return;
            }
            this.pool.push(canvas);
        }
    }
    exports.CanvasPool = CanvasPool;
});
define("TextMesh/utils/LetterRenderTexture", ["require", "exports", "cc"], function (require, exports, cc_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LetterRenderTexture = void 0;
    class LetterRenderTexture extends cc_5.Texture2D {
        /**
         * @en
         * Init the render texture with size.
         * @zh
         * 初始化 render texture。
         * @param [width]
         * @param [height]
         * @param [string]
         */
        initWithSize(width, height, format = 35) {
            this.reset({
                width,
                height,
                format,
            });
        }
        /**
         * @en Draw a texture to the specified position
         * @zh 将指定的图片渲染到指定的位置上。
         * @param {Texture2D} image
         * @param {Number} x
         * @param {Number} y
         */
        drawTextureAt(image, x, y) {
            const gfxTexture = this.getGFXTexture();
            if (!image || !gfxTexture) {
                return;
            }
            const gfxDevice = this._getGFXDevice();
            if (!gfxDevice) {
                console.warn('Unable to get device');
                return;
            }
            const region = new cc_5.gfx.BufferTextureCopy();
            region.texOffset.x = x;
            region.texOffset.y = y;
            region.texExtent.width = image.width;
            region.texExtent.height = image.height;
            gfxDevice.copyTexImagesToTexture([image.data], gfxTexture, [region]);
        }
    }
    exports.LetterRenderTexture = LetterRenderTexture;
});
define("TextMesh/libs/tinysdf/index", ["require", "exports", "cc", "TextMesh/utils/CanvasPool", "TextMesh/utils/LetterRenderTexture"], function (require, exports, cc_6, CanvasPool_1, LetterRenderTexture_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const INF = 1e20;
    const temp_rect = new cc_6.Rect;
    const temp_buff = new Uint8Array;
    var SUPPORT_FULL_METRICS = null;
    class TinySDF {
        constructor({ fontSize = 24, buffer = 3, radius = 8, cutoff = 0.15, fontFamily = 'sans-serif', fontWeight = 'normal', fontStyle = 'normal', cacheCanvas = true, trimBuffer = false, } = {}) {
            this.fontFamily = 'sans-serif';
            this.cacheCanvas = true;
            this.trimBuffer = false;
            this.antiAlis = false; //TextMeshSettings.antiAlis;
            this.resolution = 2;
            this.supportGetData = true;
            this.buffer = buffer;
            this.cutoff = cutoff;
            this.radius = radius;
            this.trimBuffer = trimBuffer;
            this.fontFamily = fontFamily;
            this.fontSize = fontSize;
            this.fontWeight = fontWeight;
            this.fontStyle = fontStyle;
            this.cacheCanvas = cacheCanvas;
            if (this.antiAlis) {
                this.resolution = 2;
            }
            else {
                this.resolution = 1;
            }
            this.fontSize *= this.resolution;
            // make the canvas size big enough to both have the specified buffer around the glyph
            // for "halo", and account for some glyphs possibly being larger than their font size
            const size = this.size = TinySDF.calcuteFontSize(this.fontSize, buffer);
            // const canvas = this._createCanvas(size);
            // const ctx = this.ctx = canvas.getContext('2d', {willReadFrequently: true});        
            // temporary arrays for the distance transform
            this.gridOuter = new Float64Array(size * size);
            this.gridInner = new Float64Array(size * size);
            this.f = new Float64Array(size);
            this.z = new Float64Array(size + 1);
            this.v = new Uint16Array(size);
            if (this.cacheCanvas) {
                this.beforeDraw();
            }
        }
        static calcuteFontSize(fontSize, buffer) {
            return fontSize + buffer * 2;
        }
        setFontFamily(fontFamily) {
            this.fontFamily = fontFamily || this.fontFamily;
        }
        _createCanvas(size) {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            return canvas;
        }
        beforeDraw() {
            const canvasInst = CanvasPool_1.CanvasPool.getInstance().get();
            const canvas = canvasInst.canvas;
            canvas.width = canvas.height = this.size;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx.getContextAttributes) {
                ctx.getContextAttributes().willReadFrequently = true;
            }
            ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
            ctx.fillStyle = 'black';
            ctx.lineJoin = 'round';
            this.canvasInst = canvasInst;
            this.ctx = ctx;
            this.canvas = canvas;
            this.image = new cc_6.ImageAsset();
            this.image.reset(canvas);
        }
        afterDraw() {
            CanvasPool_1.CanvasPool.getInstance().put(this.canvasInst);
            this.image = null;
        }
        draw(char, fontFamily, measureText, onDraw, trimBuffer) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.fontFamily = fontFamily || this.fontFamily;
            if (!this.cacheCanvas) {
                this.beforeDraw();
            }
            else {
                this.ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
            }
            const metric = this.ctx.measureText(char || measureText) || {};
            if (SUPPORT_FULL_METRICS == null) {
                SUPPORT_FULL_METRICS = metric.actualBoundingBoxAscent != null;
            }
            let glyphAdvance = metric.width || 0;
            let actualBoundingBoxAscent = (_a = metric.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : this.fontSize;
            let actualBoundingBoxDescent = (_b = metric.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : this.buffer;
            let actualBoundingBoxLeft = (_c = metric.actualBoundingBoxLeft) !== null && _c !== void 0 ? _c : 0;
            let actualBoundingBoxRight = (_d = metric.actualBoundingBoxRight) !== null && _d !== void 0 ? _d : glyphAdvance;
            const scale = Math.min(this.fontSize / (actualBoundingBoxDescent + actualBoundingBoxAscent), this.fontSize / glyphAdvance);
            if (char.length == 1) {
                // 需要缩放字体
                if (scale < 1) {
                    this.ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize * scale}px ${this.fontFamily}`;
                    const metric = this.ctx.measureText(char) || {};
                    glyphAdvance = metric.width || 0;
                    actualBoundingBoxAscent = (_e = metric.fontBoundingBoxAscent) !== null && _e !== void 0 ? _e : this.fontSize;
                    actualBoundingBoxDescent = (_f = metric.fontBoundingBoxDescent) !== null && _f !== void 0 ? _f : this.buffer;
                    actualBoundingBoxLeft = (_g = metric.actualBoundingBoxLeft) !== null && _g !== void 0 ? _g : 0;
                    actualBoundingBoxRight = (_h = metric.actualBoundingBoxRight) !== null && _h !== void 0 ? _h : glyphAdvance;
                }
            }
            // const {
            //     width: glyphAdvance,
            //     actualBoundingBoxAscent,
            //     actualBoundingBoxDescent,
            //     actualBoundingBoxLeft,
            //     actualBoundingBoxRight,
            //     fontBoundingBoxAscent,
            //     fontBoundingBoxDescent,
            // } = metric;
            // console.log(this.ctx.font)
            // console.log(metric);
            // console.log(`${measureText ?? char} ${glyphAdvance} actualBoundingBoxAscent:${actualBoundingBoxAscent} ${actualBoundingBoxDescent} ${actualBoundingBoxLeft} ${actualBoundingBoxRight}`)
            // The integer/pixel part of the top alignment is encoded in metrics.glyphTop
            // The remainder is implicitly encoded in the rasterization
            const glyphTop = Math.ceil(actualBoundingBoxAscent);
            let glyphLeft = actualBoundingBoxLeft;
            let glyphRight = actualBoundingBoxRight;
            // If the glyph overflows the canvas size, it will be clipped at the bottom/right
            var glyphWidth = Math.min(this.size - this.buffer * 2, Math.ceil(actualBoundingBoxRight + actualBoundingBoxLeft));
            var glyphHeight = Math.min(this.size - this.buffer * 2, Math.ceil(glyphTop + actualBoundingBoxDescent));
            glyphWidth += (glyphWidth % this.resolution);
            glyphHeight += (glyphHeight % this.resolution);
            var width = glyphWidth + 2 * this.buffer;
            var height = glyphHeight + 2 * this.buffer;
            width -= (width % this.resolution);
            height -= (height % this.resolution);
            const len = Math.max(width * height, 0);
            const data = new Uint8ClampedArray(len);
            const size = this.size;
            const glyph = { data, width, height, glyphWidth, glyphHeight, size, glyphLeft, glyphRight, glyphAdvance, ascent: glyphTop, descent: actualBoundingBoxDescent, scale };
            if (char == "") {
                glyph.ascent = 0;
                glyph.descent = 0;
                glyph.glyphAdvance = 0;
                glyph.glyphHeight = 0;
                glyph.glyphLeft = 0;
                glyph.glyphRight = 0;
                glyph.glyphWidth = 0;
                glyph.height = 0;
                glyph.width = 0;
            }
            if (glyphWidth === 0 || glyphHeight === 0) {
                glyph.glyphWidth = glyph.glyphRight = glyph.size = glyph.width = Math.floor(glyph.glyphAdvance);
                glyph.glyphHeight = glyph.height = 1;
                return glyph;
            }
            const { ctx, buffer, gridInner, gridOuter } = this;
            ctx.clearRect(buffer, buffer, glyphWidth, glyphHeight);
            if (onDraw != null) {
                onDraw(this.canvas, ctx, width, height, buffer, buffer);
            }
            else {
                let startX = 0;
                let startY = 0;
                if (SUPPORT_FULL_METRICS) {
                    startX = buffer + actualBoundingBoxLeft;
                    startY = size - buffer - actualBoundingBoxDescent;
                }
                else {
                    startX = (size - this.fontSize) / 2;
                    startY = size - buffer - actualBoundingBoxDescent;
                }
                ctx.fillText(char, startX, startY);
            }
            let imgBytesData = null;
            if (this.supportGetData && ctx.getImageData) {
                let imgData = null;
                try {
                    imgData = ctx.getImageData(buffer, buffer, glyphWidth, glyphHeight);
                }
                catch (e) {
                    this.supportGetData = false;
                }
                if (!imgData) {
                    this.supportGetData = false;
                }
                else {
                    imgBytesData = imgData.data;
                }
            }
            if (imgBytesData == null) {
                if (!this.texture) {
                    this.texture = new LetterRenderTexture_1.LetterRenderTexture();
                }
                this.texture.initWithSize(size, size);
                this.texture.drawTextureAt(this.image, 0, 0);
                temp_rect.set(buffer, buffer, glyphWidth, glyphHeight);
                imgBytesData = this.readTexturePixels(this.texture, temp_rect);
            }
            // Initialize grids outside the glyph range to alpha 0
            gridOuter.fill(INF, 0, len);
            gridInner.fill(0, 0, len);
            for (let y = 0; y < glyphHeight; y++) {
                for (let x = 0; x < glyphWidth; x++) {
                    const a = imgBytesData[4 * (y * glyphWidth + x) + 3] / 255; // alpha value
                    if (a === 0)
                        continue; // empty pixels
                    const j = (y + buffer) * width + x + buffer;
                    if (a === 1) { // fully drawn pixels
                        gridOuter[j] = 0;
                        gridInner[j] = INF;
                    }
                    else { // aliased pixels
                        const d = 0.5 - a;
                        gridOuter[j] = d > 0 ? d * d : 0;
                        gridInner[j] = d < 0 ? d * d : 0;
                    }
                }
            }
            imgBytesData = null;
            edt(gridOuter, 0, 0, width, height, width, this.f, this.v, this.z);
            edt(gridInner, buffer, buffer, glyphWidth, glyphHeight, width, this.f, this.v, this.z);
            for (let i = 0; i < len; i++) {
                const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
                data[i] = Math.round(255 - 255 * (d / this.radius + this.cutoff));
            }
            if (this.antiAlis) {
                const ratio = 1 / this.resolution;
                const w = width * ratio;
                const h = height * ratio;
                glyph.ascent *= ratio;
                glyph.descent *= ratio;
                glyph.glyphAdvance *= ratio;
                glyph.glyphHeight *= ratio;
                glyph.glyphLeft *= ratio;
                glyph.glyphRight *= ratio;
                glyph.glyphWidth *= ratio;
                glyph.height = h;
                glyph.width = w;
                const rawData = new Uint8ClampedArray(w * h);
                for (let y = 0; y < h; y++) {
                    let iy = y * w;
                    let iy0 = y * this.resolution * width;
                    let iy1 = iy0 + width;
                    for (let x = 0; x < w; x++) {
                        let ix = x * this.resolution;
                        rawData[iy + x] = (data[iy0 + ix] + data[iy0 + ix + 1] + data[iy1 + ix] + data[iy1 + ix + 1]) * 0.25;
                        // rawData[iy + ix] = data[iy0];
                    }
                }
                glyph.data = rawData;
            }
            if (!this.cacheCanvas) {
                this.afterDraw();
            }
            return glyph;
        }
        /**
         * 通过纹理读取制定区域的像素值
         * @param src 纹理
         * @param rect 区域，为空表示全部区域
         * @param buffer 返回数组
         * @returns 返回数组
         */
        readTexturePixels(src, rect, buffer) {
            rect = rect || new cc_6.Rect(0, 0, src.width, src.height);
            rect.x = Math.floor(rect.x);
            rect.y = Math.floor(rect.y);
            rect.width = Math.floor(rect.width);
            rect.height = Math.floor(rect.height);
            const gfxTexture = src.getGFXTexture();
            if (!gfxTexture) {
                (0, cc_6.errorID)(7606);
                return null;
            }
            const needSize = 4 * rect.width * rect.height;
            if (buffer === undefined) {
                buffer = new Uint8Array(needSize);
            }
            else if (buffer.length < needSize) {
                (0, cc_6.errorID)(7607, needSize);
                return null;
            }
            const bufferViews = [];
            const regions = [];
            const region0 = new cc_6.gfx.BufferTextureCopy();
            region0.texOffset.x = rect.x;
            region0.texOffset.y = rect.y;
            region0.texExtent.width = rect.width;
            region0.texExtent.height = rect.height;
            regions.push(region0);
            bufferViews.push(buffer);
            const gfxDevice = src["_getGFXDevice"]();
            gfxDevice === null || gfxDevice === void 0 ? void 0 : gfxDevice.copyTextureToBuffers(gfxTexture, bufferViews, regions);
            return buffer;
        }
        round(x, resolution) {
            resolution = Math.pow(10, resolution);
            return Math.round(x * resolution) / resolution;
        }
        _trimBuffer(glyhp, char) {
            let w = glyhp.width;
            let h = glyhp.height;
            let minx = 1000000;
            let maxy = -1;
            let miny = 1000000;
            let maxx = -1;
            let minPadding = 2;
            for (let y = 0; y < h; y++) {
                let iy = y * w;
                for (let x = 0; x < w; x++) {
                    let val = glyhp.data[iy + x];
                    if (val > 0) {
                        minx = Math.min(minx, x - minPadding);
                        miny = Math.min(miny, y - minPadding);
                        maxx = Math.max(maxx, x + minPadding);
                        maxy = Math.max(maxy, y + minPadding);
                    }
                }
            }
            minx = Math.max(0, minx);
            miny = Math.max(0, miny);
            maxx = Math.min(w - 1, maxx);
            maxy = Math.min(h - 1, maxy);
            if (maxx <= 0 || maxy <= 0) {
                console.warn("empty char data:" + char);
                return glyhp;
            }
            let oldWidth = glyhp.width;
            let oldHeight = glyhp.height;
            glyhp.width = maxx - minx;
            glyhp.height = maxy - miny;
            let scaleWidth = oldWidth / glyhp.width;
            let scaleHeight = oldHeight / glyhp.height;
            glyhp.glyphLeft = this.round(glyhp.glyphLeft * scaleWidth, 2);
            glyhp.glyphRight = this.round(glyhp.glyphRight * scaleWidth, 2);
            glyhp.glyphWidth = this.round(glyhp.glyphWidth * scaleWidth, 2);
            glyhp.glyphHeight = this.round(glyhp.glyphHeight * scaleHeight, 2);
            glyhp.ascent = this.round(glyhp.ascent * scaleHeight, 2);
            glyhp.descent = this.round(glyhp.descent * scaleHeight, 2);
            glyhp.glyphAdvance = this.round(glyhp.glyphAdvance * scaleWidth, 2);
            glyhp.size = Math.max(glyhp.width, glyhp.height);
            let data = new Uint8ClampedArray(glyhp.width * glyhp.height);
            for (let y = 0; y <= glyhp.height; y++) {
                let iy = y * glyhp.width;
                let riy = (y + miny) * w;
                for (let x = 0; x < glyhp.width; x++) {
                    data[iy + x] = glyhp.data[riy + x + minx];
                }
            }
            glyhp.data = data;
        }
    }
    exports.default = TinySDF;
    // 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
    function edt(data, x0, y0, width, height, gridSize, f, v, z) {
        for (let x = x0; x < x0 + width; x++)
            edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
        for (let y = y0; y < y0 + height; y++)
            edt1d(data, y * gridSize + x0, 1, width, f, v, z);
    }
    // 1D squared distance transform
    function edt1d(grid, offset, stride, length, f, v, z) {
        v[0] = 0;
        z[0] = -INF;
        z[1] = INF;
        f[0] = grid[offset];
        for (let q = 1, k = 0, s = 0; q < length; q++) {
            f[q] = grid[offset + q * stride];
            const q2 = q * q;
            do {
                const r = v[k];
                s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
            } while (s <= z[k] && --k > -1);
            k++;
            v[k] = q;
            z[k] = s;
            z[k + 1] = INF;
        }
        for (let q = 0, k = 0; q < length; q++) {
            while (z[k + 1] < q)
                k++;
            const r = v[k];
            const qr = q - r;
            grid[offset + q * stride] = f[r] + qr * qr;
        }
    }
});
define("TextMesh/font/const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CharConst = void 0;
    exports.CharConst = {
        RoundLine: "roundline",
        RectLine: "rectline",
        NoneChar: "nonechar",
        MeasureText: "中",
    };
});
define("TextMesh/font/FontHelper", ["require", "exports", "TextMesh/libs/tinysdf/index", "TextMesh/font/const"], function (require, exports, tinysdf_1, const_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontHelper = void 0;
    tinysdf_1 = __importDefault(tinysdf_1);
    class FontHelper {
        static getSDF(tmFont) {
            let fontFamily = this.getFontFamily(tmFont);
            let key = `${fontFamily}_${tmFont.fontSize}_${tmFont.padding}`;
            if (this._sdfs[key]) {
                return this._sdfs[key];
            }
            return this._sdfs[key] = new tinysdf_1.default({
                fontSize: tmFont.fontSize,
                fontFamily: fontFamily,
                buffer: tmFont.padding,
                trimBuffer: tmFont.padTrim,
            });
        }
        static getFontFamily(tmFont) {
            var _a, _b;
            if (tmFont["_finalFontFamily"]) {
                return tmFont["_finalFontFamily"];
            }
            let fontFamily = ((_a = tmFont.font) === null || _a === void 0 ? void 0 : _a._nativeAsset) || ((_b = tmFont.font) === null || _b === void 0 ? void 0 : _b._fontFamily) || tmFont.fontFamily || 'Arial';
            tmFont["_finalFontFamily"] = fontFamily;
            return fontFamily;
        }
        static getKey(code, tmFont) {
            return `${tmFont.font.name}_${code}`;
        }
        static createSDFChar(code, tmFont) {
            let sdf = this.getSDF(tmFont);
            return sdf.draw(code, this.getFontFamily(tmFont));
        }
        static getRoundLine(code, tmFont) {
            let sdf = this.getSDF(tmFont);
            let scale = 1;
            let info = sdf.draw(const_1.CharConst.RoundLine, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
                ctx.clearRect(0, 0, width, height);
                let lineHeight = (height - tmFont.padding * 2) * scale;
                let half = lineHeight / 2;
                ctx.lineCap = "round";
                ctx.strokeStyle = "white";
                ctx.lineWidth = lineHeight;
                ctx.beginPath();
                ctx.moveTo(sx, sy + half);
                ctx.lineTo(width, sy + half);
                ctx.closePath();
                ctx.stroke();
            }, true);
            return info;
        }
        static getRectLine(code, tmFont) {
            let sdf = this.getSDF(tmFont);
            let scale = 1;
            let info = sdf.draw(const_1.CharConst.RoundLine, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
                ctx.clearRect(0, 0, width, height);
                let lineHeight = (height - tmFont.padding * 2) * scale;
                let half = lineHeight / 2;
                ctx.lineCap = "butt";
                ctx.strokeStyle = "white";
                ctx.lineWidth = lineHeight;
                ctx.beginPath();
                ctx.moveTo(sx, sy + half);
                ctx.lineTo(width, sy + half);
                ctx.closePath();
                ctx.stroke();
            }, true);
            return info;
        }
        static getNoneChar(code, tmFont) {
            let sdf = this.getSDF(tmFont);
            let scale = 0.15;
            let info = sdf.draw(code, this.getFontFamily(tmFont), const_1.CharConst.MeasureText, (canvas, ctx, width, height, sx, sy) => {
                ctx.clearRect(0, 0, width, height);
                let lineHeight = (height - tmFont.padding * 2) * scale;
                let half = lineHeight / 2;
                ctx.lineCap = "butt";
                ctx.strokeStyle = "white";
                ctx.lineWidth = lineHeight;
                ctx.beginPath();
                ctx.moveTo(half, half);
                ctx.lineTo(width - half, half);
                ctx.lineTo(width - half, height - half);
                ctx.lineTo(half, height - half);
                ctx.lineTo(half, half);
                ctx.lineTo(width - half, height - half);
                ctx.moveTo(width - half, half);
                ctx.lineTo(half, height - half);
                ctx.closePath();
                ctx.stroke();
            }, true);
            return info;
        }
    }
    exports.FontHelper = FontHelper;
    FontHelper._sdfs = {};
});
define("TextMesh/utils/Utils", ["require", "exports", "cc", "cc/env"], function (require, exports, cc_7, env_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utils = void 0;
    const _regions = [new cc_7.gfx.BufferTextureCopy()];
    class Utils {
        static readTexturePixels(src, rect, buffer) {
            rect = rect || new cc_7.Rect(0, 0, src.width, src.height);
            rect.x = Math.floor(rect.x);
            rect.y = Math.floor(rect.y);
            rect.width = Math.floor(rect.width);
            rect.height = Math.floor(rect.height);
            const gfxTexture = src.getGFXTexture();
            if (!gfxTexture) {
                (0, cc_7.errorID)(7606);
                return null;
            }
            const needSize = 4 * rect.width * rect.height;
            if (buffer === undefined) {
                buffer = new Uint8Array(needSize);
            }
            else if (buffer.length < needSize) {
                (0, cc_7.errorID)(7607, needSize);
                return null;
            }
            const bufferViews = [];
            const regions = [];
            const region0 = new cc_7.gfx.BufferTextureCopy();
            region0.texOffset.x = rect.x;
            region0.texOffset.y = rect.y;
            region0.texExtent.width = rect.width;
            region0.texExtent.height = rect.height;
            regions.push(region0);
            bufferViews.push(buffer);
            const gfxDevice = src["_getGFXDevice"]();
            gfxDevice === null || gfxDevice === void 0 ? void 0 : gfxDevice.copyTextureToBuffers(gfxTexture, bufferViews, regions);
            return buffer;
        }
        static uploadData(target, source, rect, level = 0, arrayIndex = 0) {
            let gfxTexture = target.getGFXTexture();
            //@ts-ignore
            if (!gfxTexture || target._mipmapLevel <= level) {
                return;
            }
            //@ts-ignore
            const gfxDevice = target._getGFXDevice();
            if (!gfxDevice) {
                return;
            }
            const region = _regions[0];
            if (rect) {
                region.texOffset.x = rect.x;
                region.texOffset.y = rect.y;
                //@ts-ignore
                region.texExtent.width = rect.width >> level;
                //@ts-ignore
                region.texExtent.height = rect.height >> level;
            }
            else {
                region.texOffset.x = 0;
                region.texOffset.y = 0;
                //@ts-ignore
                region.texExtent.width = target._textureWidth >> level;
                //@ts-ignore
                region.texExtent.height = target._textureHeight >> level;
            }
            region.texSubres.mipLevel = level;
            region.texSubres.baseArrayLayer = arrayIndex;
            if (env_2.DEV) {
                if (source instanceof HTMLElement) {
                    if (source.height > region.texExtent.height
                        || source.width > region.texExtent.width) {
                        (0, cc_7.error)(`Image source(${target.name}) bounds override.`);
                    }
                }
            }
            if (ArrayBuffer.isView(source)) {
                gfxDevice.copyBuffersToTexture([source], gfxTexture, _regions);
            }
            else {
                gfxDevice.copyTexImagesToTexture([source], gfxTexture, _regions);
            }
        }
        static until(condition) {
            return new Promise((resolve, reject) => {
                let func = () => {
                    if (condition()) {
                        cc_7.director.off(cc_7.Director.EVENT_BEGIN_FRAME, func, this);
                        resolve();
                    }
                };
                cc_7.director.on(cc_7.Director.EVENT_BEGIN_FRAME, func, this);
            });
        }
        static async wait(time) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, time);
            });
        }
        static async waitframe() {
            return new Promise((resolve, reject) => {
                cc_7.director.once(cc_7.Director.EVENT_BEGIN_FRAME, () => {
                    resolve();
                });
            });
        }
        static arrayBufferToString(buffer, begin = 0) {
            var buf = new Uint8Array(buffer);
            var i = 0;
            var pos = 0;
            var str = "";
            var unicode = 0;
            var flag = 0;
            for (pos = begin; pos < buf.length;) {
                flag = buf[pos];
                if ((flag >>> 7) === 0) {
                    str += String.fromCharCode(buf[pos]);
                    pos += 1;
                }
                else if ((flag & 0xFC) === 0xFC) {
                    unicode = (buf[pos] & 0x3) << 30;
                    unicode |= (buf[pos + 1] & 0x3F) << 24;
                    unicode |= (buf[pos + 2] & 0x3F) << 18;
                    unicode |= (buf[pos + 3] & 0x3F) << 12;
                    unicode |= (buf[pos + 4] & 0x3F) << 6;
                    unicode |= (buf[pos + 5] & 0x3F);
                    str += String.fromCharCode(unicode);
                    pos += 6;
                }
                else if ((flag & 0xF8) === 0xF8) {
                    unicode = (buf[pos] & 0x7) << 24;
                    unicode |= (buf[pos + 1] & 0x3F) << 18;
                    unicode |= (buf[pos + 2] & 0x3F) << 12;
                    unicode |= (buf[pos + 3] & 0x3F) << 6;
                    unicode |= (buf[pos + 4] & 0x3F);
                    str += String.fromCharCode(unicode);
                    pos += 5;
                }
                else if ((flag & 0xF0) === 0xF0) {
                    unicode = (buf[pos] & 0xF) << 18;
                    unicode |= (buf[pos + 1] & 0x3F) << 12;
                    unicode |= (buf[pos + 2] & 0x3F) << 6;
                    unicode |= (buf[pos + 3] & 0x3F);
                    str += String.fromCharCode(unicode);
                    pos += 4;
                }
                else if ((flag & 0xE0) === 0xE0) {
                    unicode = (buf[pos] & 0x1F) << 12;
                    ;
                    unicode |= (buf[pos + 1] & 0x3F) << 6;
                    unicode |= (buf[pos + 2] & 0x3F);
                    str += String.fromCharCode(unicode);
                    pos += 3;
                }
                else if ((flag & 0xC0) === 0xC0) { //110
                    unicode = (buf[pos] & 0x3F) << 6;
                    unicode |= (buf[pos + 1] & 0x3F);
                    str += String.fromCharCode(unicode);
                    pos += 2;
                }
                else {
                    str += String.fromCharCode(buf[pos]);
                    pos += 1;
                }
            }
            return str;
        }
    }
    exports.Utils = Utils;
});
define("TextMesh/font/FontData", ["require", "exports", "cc", "TextMesh/font/Char", "TextMesh/font/TextureChannel", "TextMesh/font/FontHelper", "TextMesh/libs/tinysdf/index", "TextMesh/utils/Utils", "TextMesh/font/const"], function (require, exports, cc_8, Char_1, TextureChannel_1, FontHelper_1, tinysdf_2, Utils_1, const_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontData = void 0;
    tinysdf_2 = __importDefault(tinysdf_2);
    class FontData {
        constructor(tmFont, texture, channels, tmfInfo) {
            this._texture = null;
            this._letters = {};
            this._staticLetters = {};
            this._actualSize = 0;
            this._fontRect = new cc_8.Rect();
            this._safePadding = 2;
            this._tmFont = tmFont;
            this._dynamicChannels = channels || [];
            if (!texture) {
                this._texture = new cc_8.Texture2D();
                this._texture.reset({
                    mipmapLevel: 0,
                    format: cc_8.Texture2D.PixelFormat.RGBA8888,
                    width: tmFont.textureWidth,
                    height: tmFont.textureHeight,
                });
            }
            else {
                this._texture = texture;
            }
            this._actualSize = tinysdf_2.default.calcuteFontSize(tmFont.fontSize, tmFont.padding);
            this._fontRect.set(0, 0, this.spaceSize, this.spaceSize);
            if (tmfInfo) {
                let keys = Object.keys(tmfInfo.chars);
                for (let i = 0; i < keys.length; i++) {
                    let code = keys[i];
                    let char = Char_1.Char.fromTMFCharInfo(code, tmfInfo, tmfInfo.chars[code]);
                    char.static = true;
                    this._staticLetters[code] = char;
                }
            }
        }
        get tmFont() {
            return this._tmFont;
        }
        get texture() {
            return this._texture;
        }
        get chars() {
            return this._letters;
        }
        get spaceSize() {
            return this._actualSize;
        }
        get safePadding() {
            return this._safePadding;
        }
        initial() {
            this.createDynamicChannels();
        }
        createDynamicChannels() {
            this._dynamicChannels = [];
            if (!this._tmFont.dynamic || this._tmFont.staticChannels == 4) {
                return;
            }
            let lru = null;
            for (let i = this._tmFont.staticChannels; i < 4; i++) {
                let channel = new TextureChannel_1.TextureChannel(this._tmFont, i, true, lru);
                lru = channel.lru;
                this._dynamicChannels.push(channel);
            }
        }
        removeDynamicChar(code) {
            let char = this._letters[code];
            if (char && !char.static) {
                delete this._letters[code];
            }
        }
        getRoundLine() {
            return this.getCharInfo(const_2.CharConst.RoundLine, FontHelper_1.FontHelper.getRoundLine, FontHelper_1.FontHelper);
        }
        getRectLine() {
            return this.getCharInfo(const_2.CharConst.RectLine, FontHelper_1.FontHelper.getRectLine, FontHelper_1.FontHelper);
        }
        getNoneChar() {
            return this.getCharInfo(const_2.CharConst.NoneChar, FontHelper_1.FontHelper.getNoneChar, FontHelper_1.FontHelper);
        }
        getCharInfo(code, charRender, thisRender) {
            // 从静态字符集中获取字符信息
            let char = this._staticLetters[code];
            if (char) {
                return char;
            }
            if (!this.tmFont.dynamic) {
                console.warn(`font ${this.tmFont.fontFamily} is not dynamic, can not get char ${code}`);
                if (charRender == null) {
                    return this.getNoneChar();
                }
            }
            // 从动态字符集中获取字符信息
            char = this._letters[code];
            if (char) {
                return char;
            }
            if (!this.tmFont.dynamic || this.tmFont.staticChannels == 4) {
                if (charRender == null) {
                    // 静态字符集已满，无法获取字符信息， 返回占位符
                    return this.getNoneChar();
                }
            }
            if (charRender && this._dynamicChannels.length == 0) {
                return null;
            }
            // 获取一个动态通道
            let space = null;
            let channel = null;
            let totalChannel = this._dynamicChannels.length;
            for (let i = 0; i < totalChannel; i++) {
                channel = this._dynamicChannels[i];
                if (!channel.isFull()) {
                    if (channel.count == 0) {
                        this.clearChannel(channel.index);
                    }
                    break;
                }
            }
            if (!channel) {
                space = this._dynamicChannels[0].spanEmptySpace(code);
                channel = this._dynamicChannels.find(c => space.cid == c.index);
            }
            else {
                space = channel.spanEmptySpace(code);
            }
            delete this._letters[code];
            let glyph = charRender ? charRender.call(thisRender, code, this._tmFont) : FontHelper_1.FontHelper.createSDFChar(code, this._tmFont);
            char = new Char_1.Char();
            char.code = code;
            char.glyphWidth = glyph.glyphWidth;
            char.glyphHeight = glyph.glyphHeight;
            char.glyphAdvance = glyph.glyphAdvance;
            char.glyphRight = glyph.glyphRight;
            char.glyphLeft = glyph.glyphLeft;
            char.width = glyph.width;
            char.height = glyph.height;
            char.size = glyph.size;
            char.ascent = glyph.ascent;
            char.descent = glyph.descent;
            char.scale = glyph.scale;
            let u0 = (space.x + this._safePadding) / this.tmFont.textureWidth;
            let v0 = (space.y + this._safePadding) / this.tmFont.textureHeight;
            let v1 = v0 + glyph.height / this.tmFont.textureHeight;
            let u1 = u0 + glyph.width / this.tmFont.textureWidth;
            char.uvs = new Float32Array([u0, v0, u1, v0, u0, v1, u1, v1]);
            char.cid = channel.index;
            this._fontRect.set(space.x, space.y, this.spaceSize, this.spaceSize);
            this.writeToTexture(code, channel.index, glyph);
            this._letters[code] = char;
            return char;
        }
        /**
         * 隐患：微信开放域开启后，不能读取纹理数据
         * @param cid
         */
        clearChannel(cid) {
            let width = this._texture.width;
            let height = this._texture.height;
            let rect = new cc_8.Rect(0, 0, width, height);
            this._buffer = Utils_1.Utils.readTexturePixels(this._texture, rect, this._buffer);
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    let index = (j * width + i) * 4;
                    this._buffer[index + cid] = 0;
                }
            }
            Utils_1.Utils.uploadData(this._texture, this._buffer, rect);
        }
        writeToTexture(code, cid, glyhp) {
            this._buffer = Utils_1.Utils.readTexturePixels(this._texture, this._fontRect, this._buffer);
            for (let i = 0; i < this._fontRect.width; i++) {
                for (let j = 0; j < this._fontRect.height; j++) {
                    let index = (j * this._fontRect.width + i) * 4;
                    if (i >= this._safePadding && i < glyhp.width + this._safePadding &&
                        j >= this._safePadding && j < glyhp.height + this._safePadding) {
                        let gi = i - this._safePadding;
                        let gj = j - this._safePadding;
                        let value = glyhp.data[gi + gj * glyhp.width];
                        this._buffer[index + cid] = value;
                    }
                    else {
                        this._buffer[index + cid] = 0;
                    }
                    // for debug
                    // this._buffer[index + 3] = 255;
                }
            }
            delete glyhp.data;
            Utils_1.Utils.uploadData(this._texture, this._buffer, this._fontRect);
        }
    }
    exports.FontData = FontData;
});
define("TextMesh/utils/ResManger", ["require", "exports", "cc", "cc/env", "TextMesh/utils/Utils"], function (require, exports, cc_9, env_3, Utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResManager = void 0;
    const RESOURCES = "resources";
    class ResManager {
        static async preload(uuid, progress) {
            return new Promise((resolve, reject) => {
                cc_9.assetManager.preloadAny(uuid, (p) => {
                    progress && progress(p);
                }, (err, res) => {
                    resolve(res);
                });
            });
        }
        static async loadAB(abName, progress) {
            return new Promise((resolve, reject) => {
                cc_9.assetManager.loadBundle(abName, (p) => {
                    progress && progress(p);
                }, (err, res) => {
                    resolve(res);
                });
            });
        }
        static getBundle(abName) {
            if (!abName || abName == RESOURCES) {
                return cc_9.resources;
            }
            let ab = cc_9.assetManager.getBundle(abName);
            if (!ab) {
                console.error(`can not find asset bundle named ${abName}`);
            }
            return ab;
        }
        static getBundleAsync(abName) {
            return new Promise((resolve, reject) => {
                let ab = this.getBundle(abName);
                if (ab) {
                    resolve(ab);
                }
                else {
                    cc_9.assetManager.loadBundle(abName, (p) => { }, (err, res) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(res);
                        }
                    });
                }
            });
        }
        static async getByUUIDAsync(uuid, type) {
            let next = false;
            let res = null;
            cc_9.assetManager.loadAny(uuid, { type: type }, null, (err, data) => {
                next = true;
                res = data;
                if (err) {
                    console.log(`load ${uuid} data err:${err}`);
                }
            });
            await Utils_2.Utils.until(() => next);
            return res;
        }
        static get(abName, url, type) {
            let ab = this.getBundle(abName);
            if (!ab) {
                return null;
            }
            if (typeof url == "string") {
                let res = ab.get(url, type);
                return res;
            }
            else {
                let ress = [];
                for (let i = 0; i < url.length; i++) {
                    let res = ab.get(url[i], type);
                    ress.push(res);
                }
                return ress;
            }
        }
        static async getAsync(abName, url, type) {
            let res = this.get(abName, url, type);
            if (res) {
                return res;
            }
            let next = false;
            let err = "";
            this.load(abName, url, type).then(r => {
                res = r;
                next = true;
            }).catch(e => {
                err = e;
                next = true;
            });
            await Utils_2.Utils.until(() => next);
            if (err) {
                console.log(`load ${abName}:${url} data err:${err}`);
            }
            return res;
        }
        static load(abName, url, type, onProgress) {
            return new Promise((resolve, reject) => {
                let ab = this.getBundle(abName);
                ab.load(url, type, onProgress, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        }
        static loadDir(abName, url, onProgress) {
            return new Promise((resolve, reject) => {
                let ab = this.getBundle(abName);
                ab.loadDir(url, onProgress, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        }
        /**
         * 编辑器下加载资源
         * @param url db://assets/
         */
        static editorLoad(url) {
            // log(url);
            return new Promise((resolve, reject) => {
                if (!env_3.EDITOR) {
                    resolve(null);
                    return;
                }
                //@ts-ignore
                Editor.Message.request("asset-db", "query-uuid", `db://assets/${url}`).then((uuid) => {
                    // log(uuid);
                    if (!uuid) {
                        resolve(null);
                        console.warn(`uuid查询失败 url: ${url}`);
                        return;
                    }
                    cc_9.assetManager.loadAny(uuid, (error, result) => {
                        // log(error);
                        // log(result);
                        if (error || !result) {
                            resolve(null);
                            console.warn(`资源加载失败 url: ${url}`);
                            return;
                        }
                        resolve(result);
                    });
                });
            });
        }
    }
    exports.ResManager = ResManager;
});
define("TextMesh/font/TMFont", ["require", "exports", "cc", "TextMesh/font/FontData", "TextMesh/utils/Utils", "TextMesh/font/FontParser", "TextMesh/utils/ResManger"], function (require, exports, cc_10, FontData_1, Utils_3, FontParser_1, ResManger_1) {
    "use strict";
    var TMFont_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TMFont = void 0;
    const { ccclass, property, executeInEditMode } = cc_10._decorator;
    let TMFont = TMFont_1 = class TMFont extends cc_10.Asset {
        constructor() {
            super();
            this._fontSize = 45;
            this._padding = 60;
            this._atlasWidth = 1024;
            this._atlasHeight = 1024;
            this._staticChannels = 3;
            this._dynamic = true;
            this._padTrim = false;
            this._normalWeight = 0.14;
            this._boldWeightScale = 1.2;
            this._strokeScale = 0.1;
            this._strokeBlur = 0;
            this._shadowSize = 0.03;
            this._shadowBlur = 0.0;
            this._underLineOffset = -6.9;
            this._keepUnlderLineSpace = false;
            this._underLineThickness = 0.15;
            this._strikeOffset = 0.4;
            this._strikeThickness = 0.1;
            this._scriptThickness = 0.3;
            this._chars = {};
        }
        get version() {
            return this._version;
        }
        get material() {
            return this._material;
        }
        get uid() {
            return this._uid;
        }
        get font() {
            return this._font;
        }
        get fontFamily() {
            return this._fontFamily;
        }
        get fontSize() {
            return this._fontSize;
        }
        get padding() {
            return this._padding;
        }
        get textureWidth() {
            return this._atlasWidth;
        }
        get textureHeight() {
            return this._atlasHeight;
        }
        get dynamic() {
            return this._dynamic;
        }
        get staticChannels() {
            return this._staticChannels;
        }
        get fontData() {
            return this._fontData;
        }
        get normalWeight() {
            return this._normalWeight;
        }
        get boldWeightScale() {
            return this._boldWeightScale;
        }
        get strokeScale() {
            return this._strokeScale;
        }
        get strokeBlur() {
            return this._strokeBlur;
        }
        get shadowSize() {
            return this._shadowSize;
        }
        get shadowBlur() {
            return this._shadowBlur;
        }
        get underLineOffset() {
            return this._underLineOffset;
        }
        get underLineThickness() {
            return this._underLineThickness;
        }
        get keepUnlderLineSpace() {
            return this._keepUnlderLineSpace;
        }
        get strikeOffset() {
            return this._strikeOffset;
        }
        /**
         * 删除线宽度（百分比：0-1）
         */
        get strikeThickness() {
            return this._strikeThickness;
        }
        get scriptThickness() {
            return this._scriptThickness;
        }
        get padTrim() {
            return this._padTrim;
        }
        initial(font, texture, tmfInfo) {
            this._font = font;
            this._fontData = new FontData_1.FontData(this, texture, null, tmfInfo);
            this._fontData.initial();
        }
        getCharInfo(code) {
            return this._fontData.getCharInfo(code, null);
        }
        removeDynamicChar(code) {
            this._fontData.removeDynamicChar(code);
        }
        async _loadFontInfo(fontInfo) {
            this._version = fontInfo.version;
            this._fontFamily = fontInfo.fontFamily;
            this._fontSize = fontInfo.fontSize;
            this._padding = fontInfo.padding;
            this._atlasWidth = fontInfo.atlasWidth;
            this._atlasHeight = fontInfo.atlasHeight;
            this._staticChannels = fontInfo.staticChannels || 0;
            this._dynamic = fontInfo.dynamic == 1 || this._staticChannels == 0;
            this._padTrim = fontInfo.padTrim == 1;
            this._normalWeight = fontInfo.normalWeight;
            this._boldWeightScale = fontInfo.boldWeightScale;
            this._strokeScale = fontInfo.strokeScale;
            this._strokeBlur = fontInfo.strokeBlur;
            this._shadowSize = fontInfo.shadowSize;
            this._shadowBlur = fontInfo.shadowBlur;
            this._underLineOffset = fontInfo.underLineOffset;
            this._keepUnlderLineSpace = fontInfo.keepUnlderLineSpace == 1;
            this._underLineThickness = fontInfo.underLineThickness;
            this._strikeOffset = fontInfo.strikeOffset;
            this._strikeThickness = fontInfo.strikeThickness;
            this._scriptThickness = fontInfo.scriptThickness;
            let ttf;
            if (fontInfo.dynamic && fontInfo.staticChannels < 4) {
                ttf = await ResManger_1.ResManager.getByUUIDAsync(fontInfo.font, cc_10.TTFFont);
            }
            let atlas;
            if (fontInfo.staticChannels > 0) {
                atlas = await ResManger_1.ResManager.getByUUIDAsync(fontInfo.atlas + "@6c48a", cc_10.Texture2D);
            }
            this.initial(ttf, atlas, fontInfo);
        }
        isNone(value) {
            return value === null || value === undefined || Number.isNaN(value);
        }
        static async deserializeAsync(data, material) {
            let text = "";
            let uuid = "";
            if (typeof data == "string") {
                text = data;
            }
            else {
                if (data instanceof cc_10.TextAsset) {
                    text = data.text;
                    uuid = data._uuid;
                }
                else if (data instanceof ArrayBuffer) {
                    text = Utils_3.Utils.arrayBufferToString(data);
                }
                else if (data instanceof cc_10.BufferAsset) {
                    text = Utils_3.Utils.arrayBufferToString(data.buffer());
                    uuid = data._uuid;
                }
                else {
                    console.error("invaliad tmf data");
                    return null;
                }
            }
            if (TMFont_1._fontMap.has(uuid)) {
                return TMFont_1._fontMap.get(uuid);
            }
            else {
                if (TMFont_1._loadingMap.has(uuid)) {
                    return new Promise((resolve, reject) => {
                        let timer = setInterval(() => {
                            if (TMFont_1._fontMap.has(uuid)) {
                                clearInterval(timer);
                                resolve(TMFont_1._fontMap.get(uuid));
                            }
                        }, 100);
                    });
                }
            }
            this._loadingMap.set(uuid, true);
            let fontInfo = FontParser_1.FontParser.parse(uuid, text);
            let tmf = new TMFont_1();
            tmf._uid = uuid;
            if (!material) {
                let next = false;
                const matUUID = "456042ba-7dd1-452c-a76b-cf79a55fcd6c";
                cc_10.assetManager.loadAny({ uuid: matUUID }, (err, asset) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    tmf._material = new cc_10.Material();
                    tmf._material.copy(asset);
                    next = true;
                });
                await Utils_3.Utils.until(() => next);
            }
            else {
                tmf._material = new cc_10.Material();
                tmf._material.copy(material);
            }
            await tmf._loadFontInfo(fontInfo);
            TMFont_1._fontMap.set(uuid, tmf);
            this._loadingMap.delete(uuid);
            return tmf;
        }
        static deserialize(data) {
            let text = "";
            let uuid = "";
            if (typeof data == "string") {
                text = data;
            }
            else {
                if (data instanceof cc_10.TextAsset) {
                    text = data.text;
                    uuid = data._uuid;
                    cc_10.assetManager.releaseAsset(data);
                }
                else if (data instanceof ArrayBuffer) {
                    text = Utils_3.Utils.arrayBufferToString(data);
                    data = null;
                }
                else if (data instanceof cc_10.BufferAsset) {
                    text = Utils_3.Utils.arrayBufferToString(data.buffer());
                    uuid = data._uuid;
                    cc_10.assetManager.releaseAsset(data);
                }
                else {
                    console.error("invaliad tmf data");
                    return null;
                }
            }
            let fontInfo = FontParser_1.FontParser.parse(uuid, text);
            let tmf = new TMFont_1();
            tmf._loadFontInfo(fontInfo);
            return tmf;
        }
    };
    TMFont._fontMap = new Map();
    TMFont._loadingMap = new Map();
    TMFont = TMFont_1 = __decorate([
        ccclass("TMFont")
    ], TMFont);
    exports.TMFont = TMFont;
    //@ts-ignore
    cc_10.assetManager.downloader.register(".tmf", cc_10.assetManager.downloader._downloaders[".json"]);
    // assetManager.parser.register(".tmf", (file, options, onComplete)=>{
    //     console.log("fmt parser")
    // });
    cc_10.assetManager.factory.register(".tmf", (id, data, options, onComplete) => {
        const out = new TMFont();
        out._nativeUrl = id;
        out._nativeAsset = data;
        console.log("factory: tmf parse ", data);
        onComplete(null, out);
    });
});
define("TextMesh/libs/hanzi/code", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LINELEADING = exports.LINEBREAKING = exports.ALLBIAODIAN = exports.COMPRESSLEFT = exports.INCOMPRESSIBLE = exports.BIAODIANVALIDATSTART = exports.BIAODIANVALIDATEND = exports.BIAODIAN = exports.BIAOHAO = exports.DIANHAO = void 0;
    exports.DIANHAO = `。，、．：；！‼？⁇ .,;:~\`?!`;
    exports.BIAOHAO = `「」『』“”‘’（）()【】〖〗〔〕［］｛｝⸺—…●•–～~～～·﹏《》〈〉＿/／\\ {}[]()<>"'`;
    exports.BIAODIAN = `${exports.BIAOHAO}${exports.DIANHAO} `;
    exports.BIAODIANVALIDATEND = `。，、．：；！‼？⁇」』”’）】〗〕］｝》〉 .,)!;]}'>"?`;
    exports.BIAODIANVALIDATSTART = `「『“‘（【〖〔［｛《〈 ({['"<`;
    exports.INCOMPRESSIBLE = '‼⁇⸺—';
    exports.COMPRESSLEFT = '「『“‘（【〖〔［｛《〈 ({[\'"<';
    exports.ALLBIAODIAN = [...exports.BIAODIAN, ...exports.BIAODIANVALIDATEND];
    exports.LINEBREAKING = " )]｝〕〉》」』】〙〗〟’”｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠–〜?!‼⁇⁈⁉・、%,.:;。！？］）：；＝}¢°\"†‡℃〆％，．";
    exports.LINELEADING = "([｛〔〈《「『【〘〖〝‘“｟«$—…‥〳〴〵\［（{£¥\"々〇＄￥￦#";
});
/**
 * reference:
 *  https://en.wikipedia.org/wiki/CJK_Unified_Ideographs
 *  https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation
 *  http://jrgraphix.net/r/Unicode/
 */
define("TextMesh/libs/hanzi/isCJK", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isCJK = void 0;
    const list = [
        '\\u1100-\\u11FF',
        '\\u2E80-\\u2EFF',
        '\\u2F00-\\u2FDF',
        '\\u2FF0-\\u2FFF',
        '\\u3000-\\u303F',
        '\\u3040-\\u309F',
        '\\u30A0-\\u30FF',
        '\\u3100-\\u312F',
        '\\u3130-\\u318F',
        '\\u3190-\\u319F',
        '\\u31A0-\\u31BF',
        '\\u31F0-\\u31FF',
        '\\u3200-\\u32FF',
        '\\u3300-\\u33FF',
        //  '\\u3300-\\u33FF\\uFE30-\\uFE4F\\uF900-\\uFAFF\\u{2F800}-\\u{2FA1F}', // Other CJK Ideographs in Unicode, not Unified
        '\\u3400-\\u4DBF',
        '\\u4DC0-\\u4DFF',
        '\\u4E00-\\u9FFF',
        '\\uAC00-\\uD7AF',
        '\\uF900-\\uFAFF',
        '\\uFE30-\\uFE4F',
        '\\uFF00-\\uFFEF',
        '\\u{1D300}-\\u{1D35F}',
        '\\u{20000}-\\u{2A6DF}',
        '\\u{2A700}-\\u{2B73F}',
        '\\u{2B740}-\\u{2B81F}',
        '\\u{2B820}-\\u{2CEAF}',
        '\\u{2CEB0}-\\u{2EBEF}',
        '\\u{2F800}-\\u{2FA1F}', // CJK Compatibility Ideographs Supplement, 补充包你好，补充包再见
    ];
    let regex;
    try {
        regex = new RegExp(`[${list.join('')}]`, 'u');
    }
    catch (e) {
        regex = new RegExp(`[${list.slice(0, 21).join('')}]`);
    }
    function isCJK(text) {
        return regex.test(text);
    }
    exports.isCJK = isCJK;
});
// old version:
// /[\u3000-\u3003\u3005-\u303F；？，．：！]|[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(text)
define("TextMesh/libs/phaser/TextStyle", ["require", "exports", "TextMesh/libs/phaser/MeasureText"], function (require, exports, MeasureText_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextStyle = void 0;
    class TextStyle {
        constructor(text, style) {
            this.fontFamily = 'Arial';
            this.fontSize = "16px";
            this.fontStyle = "";
            this.backgroundColor = '#fff';
            this.color = '#000';
            this.stroke = '#000';
            this.strokeThickness = 0;
            this.shadowOffsetX = 0;
            this.shadowOffsetY = 0;
            this.shadowColor = '#000';
            this.shadowBlur = 0;
            this.shadowStroke = false;
            this.shadowFill = false;
            this.align = 'left';
            this.maxLines = 0;
            this.fixedWidth = 0;
            this.fixedHeight = 0;
            this.resolution = 0;
            this.rtl = false;
            this.testString = '|MÃ‰qgy';
            this.baselineX = 1.2;
            this.baselineY = 1.4;
            this.wordWrapWidth = 0;
            this.wordWrapUseAdvanced = false;
            this.metrics = {
                ascent: 0,
                descent: 0,
                fontSize: 0
            };
            this.parent = text;
            this.fontStyle = style;
            this.metrics = MeasureText_1.MeasureText.create(this);
        }
        setStyle(style, updateText, setDefaults) {
            if (updateText === undefined) {
                updateText = true;
            }
            if (setDefaults === undefined) {
                setDefaults = false;
            }
            style = style || {};
            let keys = Object.keys(style);
            for (var key in keys) {
                this[key] = style[key];
            }
            this._font = [this.fontStyle, this.fontSize, this.fontFamily].join(' ').trim();
            if (updateText) {
                return this.update(true);
            }
        }
        syncFont(canvas, context) {
            context.font = this._font;
        }
        syncStyle(canvas, context) {
            context.textBaseline = 'alphabetic';
            context.fillStyle = this.color;
            context.strokeStyle = this.stroke;
            context.lineWidth = this.strokeThickness;
            context.lineCap = 'round';
            context.lineJoin = 'round';
        }
        syncShadow(context, enabled) {
            if (enabled) {
                context.shadowOffsetX = this.shadowOffsetX;
                context.shadowOffsetY = this.shadowOffsetY;
                context.shadowColor = this.shadowColor;
                context.shadowBlur = this.shadowBlur;
            }
            else {
                context.shadowOffsetX = 0;
                context.shadowOffsetY = 0;
                context.shadowColor = '#000';
                context.shadowBlur = 0;
            }
        }
        update(recalculateMetrics) {
            if (recalculateMetrics) {
                this._font = [this.fontStyle, this.fontSize, this.fontFamily].join(' ').trim();
                this.metrics = MeasureText_1.MeasureText.create(this);
            }
            return this.parent.updateText();
        }
        setFont(font, updateText) {
            if (updateText === undefined) {
                updateText = true;
            }
            var fontFamily = font.fontFamily;
            var fontSize = font.fontSize;
            var fontStyle = font.fontStyle;
            if (fontFamily !== this.fontFamily || fontSize !== this.fontSize || fontStyle !== this.fontStyle) {
                this.fontFamily = fontFamily;
                this.fontSize = fontSize;
                this.fontStyle = fontStyle;
                if (updateText) {
                    this.update(true);
                }
            }
            return this.parent;
        }
        setFontFamily(family) {
            if (this.fontFamily !== family) {
                this.fontFamily = family;
                this.update(true);
            }
            return this.parent;
        }
        setFontStyle(style) {
            if (this.fontStyle !== style) {
                this.fontStyle = style;
                this.update(true);
            }
            return this.parent;
        }
        setFontSize(size) {
            if (typeof size === 'number') {
                size = size.toString() + 'px';
            }
            if (this.fontSize !== size) {
                this.fontSize = size;
                this.update(true);
            }
            return this.parent;
        }
        setTestString(string) {
            this.testString = string;
            return this.update(true);
        }
        setFixedSize(width, height) {
            this.fixedWidth = width;
            this.fixedHeight = height;
            if (width) {
                this.parent.width = width;
            }
            if (height) {
                this.parent.height = height;
            }
            return this.update(false);
        }
        setBackgroundColor(color) {
            this.backgroundColor = color;
            return this.update(false);
        }
        setFillfunction(color) {
            this.color = color;
            return this.update(false);
        }
        setColor(color) {
            this.color = color;
            return this.update(false);
        }
        setResolution(value) {
            this.resolution = value;
            return this.update(false);
        }
        setStroke(color, thickness) {
            if (thickness === undefined) {
                thickness = this.strokeThickness;
            }
            if (color === undefined && this.strokeThickness !== 0) {
                //  Reset the stroke to zero (disabling it)
                this.strokeThickness = 0;
                this.update(true);
            }
            else if (this.stroke !== color || this.strokeThickness !== thickness) {
                this.stroke = color;
                this.strokeThickness = thickness;
                this.update(true);
            }
            return this.parent;
        }
        setShadow(x, y = 0, color = '#000', blur = 0, shadowStroke = false, shadowFill = true) {
            if (x === undefined) {
                x = 0;
            }
            if (y === undefined) {
                y = 0;
            }
            if (color === undefined) {
                color = '#000';
            }
            if (blur === undefined) {
                blur = 0;
            }
            if (shadowStroke === undefined) {
                shadowStroke = false;
            }
            if (shadowFill === undefined) {
                shadowFill = true;
            }
            this.shadowOffsetX = x;
            this.shadowOffsetY = y;
            this.shadowColor = color;
            this.shadowBlur = blur;
            this.shadowStroke = shadowStroke;
            this.shadowFill = shadowFill;
            return this.update(false);
        }
        setShadowOffset(x, y) {
            if (x === undefined) {
                x = 0;
            }
            if (y === undefined) {
                y = x;
            }
            this.shadowOffsetX = x;
            this.shadowOffsetY = y;
            return this.update(false);
        }
        setShadowColor(color) {
            if (color === undefined) {
                color = '#000';
            }
            this.shadowColor = color;
            return this.update(false);
        }
        setShadowBlur(blur) {
            if (blur === undefined) {
                blur = 0;
            }
            this.shadowBlur = blur;
            return this.update(false);
        }
        setShadowStroke(enabled) {
            this.shadowStroke = enabled;
            return this.update(false);
        }
        setShadowFill(enabled) {
            this.shadowFill = enabled;
            return this.update(false);
        }
        setWordWrapWidth(width, useAdvancedWrap) {
            if (useAdvancedWrap === undefined) {
                useAdvancedWrap = false;
            }
            this.wordWrapWidth = width;
            // this.wordWrapUseAdvanced = useAdvancedWrap;
            return this.update(false);
        }
        setWordWrapCallback(callback, scope) {
            if (scope === undefined) {
                scope = null;
            }
            this.wordWrapCallback = callback;
            this.wordWrapCallbackScope = scope;
            return this.update(false);
        }
        setAlign(align) {
            if (align === undefined) {
                align = 'left';
            }
            this.align = align;
            return this.update(false);
        }
        setMaxLines(max) {
            if (max === undefined) {
                max = 0;
            }
            this.maxLines = max;
            return this.update(false);
        }
        getTextMetrics() {
            var metrics = this.metrics;
            return {
                ascent: metrics.ascent,
                descent: metrics.descent,
                fontSize: metrics.fontSize
            };
        }
        destroy() {
            this.parent = undefined;
        }
    }
    exports.TextStyle = TextStyle;
});
define("TextMesh/libs/phaser/MeasureText", ["require", "exports", "TextMesh/utils/CanvasPool"], function (require, exports, CanvasPool_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MeasureText = void 0;
    class MeasureText {
        static create(textStyle) {
            let pool = CanvasPool_2.CanvasPool.getInstance();
            let canvasInst = pool.get();
            let canvas = canvasInst.canvas;
            let context = canvas.getContext('2d', { willReadFrequently: true });
            textStyle.syncFont(canvas, context);
            let metrics = context.measureText(textStyle.testString);
            if ('actualBoundingBoxAscent' in metrics) {
                let ascent = metrics.actualBoundingBoxAscent;
                let descent = metrics.actualBoundingBoxDescent;
                pool.put(canvasInst);
                return {
                    ascent: ascent,
                    descent: descent,
                    fontSize: ascent + descent
                };
            }
            let width = Math.ceil(metrics.width * textStyle.baselineX);
            let baseline = width;
            let height = 2 * baseline;
            baseline = baseline * textStyle.baselineY | 0;
            canvas.width = width;
            canvas.height = height;
            context.fillStyle = '#f00';
            context.fillRect(0, 0, width, height);
            textStyle.syncStyle(canvas, context);
            context.textBaseline = 'alphabetic';
            context.fillStyle = '#000';
            context.fillText(textStyle.testString, 0, baseline);
            let output = {
                ascent: 0,
                descent: 0,
                fontSize: 0
            };
            let imagedata = context.getImageData(0, 0, width, height);
            if (!imagedata) {
                output.ascent = baseline;
                output.descent = baseline + 6;
                output.fontSize = output.ascent + output.descent;
                pool.put(canvasInst);
                return output;
            }
            let pixels = imagedata.data;
            let numPixels = pixels.length;
            let line = width * 4;
            let i;
            let j;
            let idx = 0;
            let stop = false;
            // ascent. scan from top to bottom until we find a non red pixel
            for (i = 0; i < baseline; i++) {
                for (j = 0; j < line; j += 4) {
                    if (pixels[idx + j] !== 255) {
                        stop = true;
                        break;
                    }
                }
                if (!stop) {
                    idx += line;
                }
                else {
                    break;
                }
            }
            output.ascent = baseline - i;
            idx = numPixels - line;
            stop = false;
            // descent. scan from bottom to top until we find a non red pixel
            for (i = height; i > baseline; i--) {
                for (j = 0; j < line; j += 4) {
                    if (pixels[idx + j] !== 255) {
                        stop = true;
                        break;
                    }
                }
                if (!stop) {
                    idx -= line;
                }
                else {
                    break;
                }
            }
            output.descent = (i - baseline);
            output.fontSize = output.ascent + output.descent;
            pool.put(canvasInst);
            return output;
        }
    }
    exports.MeasureText = MeasureText;
    ;
});
define("TextMesh/font/FontUtils", ["require", "exports", "cc", "TextMesh/libs/hanzi/code", "TextMesh/libs/hanzi/isCJK"], function (require, exports, cc_11, code_1, isCJK_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStringArray = void 0;
    function getStringArray(text) {
        // Using Array.from correctly splits characters whilst keeping emoji together.
        // This is not supported on IE as it requires ES6, so regular text splitting occurs.
        // This also doesn't account for emoji that are multiple emoji put together to make something else.
        // Handling all of this would require a big library itself.
        // https://medium.com/@giltayar/iterating-over-emoji-characters-the-es6-way-f06e4589516
        // https://github.com/orling/grapheme-splitter
        return Array.from ? Array.from(text) : text.split('');
    }
    exports.getStringArray = getStringArray;
    const isEmojiChar = function (charCode, nextCharCode) {
        const hs = charCode;
        const nextCharValid = typeof nextCharCode === 'number' && !isNaN(nextCharCode) && nextCharCode > 0;
        // surrogate pair
        if (hs >= 0xd800 && hs <= 0xdbff) {
            if (nextCharValid) {
                const uc = ((hs - 0xd800) * 0x400) + (nextCharCode - 0xdc00) + 0x10000;
                if (uc >= 0x1d000 && uc <= 0x1f77f) {
                    return 2;
                }
            }
        }
        // non surrogate
        else if ((hs >= 0x2100 && hs <= 0x27ff)
            || (hs >= 0x2B05 && hs <= 0x2b07)
            || (hs >= 0x2934 && hs <= 0x2935)
            || (hs >= 0x3297 && hs <= 0x3299)
            || hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030
            || hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b
            || hs === 0x2b50 || hs === 0x231a) {
            return 1;
        }
        else if (nextCharValid && (nextCharCode === 0x20e3 || nextCharCode === 0xfe0f || nextCharCode === 0xd83c)) {
            return 2;
        }
        return 0;
    };
    const trimEmoji = function (text) {
        let result = [];
        let count = 0;
        for (let i = 0; i < text.length; i++) {
            let cur = text[i];
            let next = i < text.length - 1 ? text[i + 1] : '';
            let emoji = isEmojiChar(cur.charCodeAt(0), next.charCodeAt(0));
            if (emoji == 0) {
                result.push(cur);
            }
            else {
                i += (emoji - 1);
                count++;
            }
        }
        return {
            text: result.join(''),
            count,
        };
    };
    function GetTextSizeHorizontal(text, size, lines) {
        let canvas = text.canvas;
        let context = text.context;
        let style = text.style;
        let lineWidths = [];
        let lineHeights = [];
        let maxLineWidth = 0;
        let drawnLines = lines.length;
        if (style.maxLines > 0 && style.maxLines < lines.length) {
            drawnLines = style.maxLines;
        }
        style.syncFont(canvas, context);
        //  Text Width
        let height = 0;
        for (var i = 0; i < drawnLines; i++) {
            var lineWidth = style.strokeThickness;
            let line = lines[i];
            let letterSpacing = style.letterSpacing || 0;
            let maxLineHeight = 0;
            if (letterSpacing) {
                if (line) {
                    for (let char of line) {
                        let measure = context.measureText(char);
                        let enableCalcHeight = measure.actualBoundingBoxAscent && measure.actualBoundingBoxDescent;
                        lineWidth += measure.width + (char != ' ' ? letterSpacing : 0);
                        maxLineHeight = Math.max(enableCalcHeight ? measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent : 0, maxLineHeight, size.fontSize);
                    }
                }
            }
            else {
                let measure = context.measureText(lines[i]);
                let enableCalcHeight = measure.actualBoundingBoxAscent && measure.actualBoundingBoxDescent;
                lineWidth += measure.width;
                maxLineHeight = Math.max(enableCalcHeight ? measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent : 0, size.fontSize);
            }
            if (style.strokeThickness) {
                maxLineHeight += +style.strokeThickness;
            }
            // Adjust for wrapped text
            if (style.wordWrap) {
                lineWidth -= context.measureText(' ').width;
            }
            lineWidths[i] = Math.ceil(lineWidth);
            lineHeights[i] = maxLineHeight;
            if (style.shadowOffsetX) {
                maxLineWidth += style.shadowOffsetX;
            }
            maxLineWidth = Math.max(maxLineWidth, lineWidths[i]);
            height += maxLineHeight;
        }
        if (style.minWidth) {
            maxLineWidth = Math.max(maxLineWidth, style.minWidth);
        }
        //  Text Height
        // var lineHeight = size.fontSize + style.strokeThickness;
        var lineSpacing = text.lineSpacing;
        //  Adjust for line spacing
        if (drawnLines > 1) {
            height += lineSpacing * (drawnLines - 1);
        }
        if (style.shadowOffsetY) {
            height += style.shadowOffsetY;
        }
        if (style.fontStyle == 'italic' || style.fontStyle == "oblique") {
            maxLineWidth += size.fontSize * Math.sin(cc_11.math.toRadian(15)) * 0.5;
        }
        return {
            width: maxLineWidth,
            height: height,
            lines: drawnLines,
            lineWidths: lineWidths,
            lineSpacing: lineSpacing,
            lineHeights: lineHeights,
        };
    }
    var GetTextSizeVertical = function (text, size, lines) {
        let canvas = text.canvas;
        let context = text.context;
        let style = text.style;
        let warpHeight = style.wordWrapWidth != undefined ? style.wordWrapWidth : 0;
        let maxLineHeight = 0;
        let drawnLines = 0;
        let lineSpacing = text.lineSpacing || 0;
        style.syncFont(canvas, context);
        // 计算每个字符的尺寸信息
        let charInfo = [];
        let allP = style.punctuation || code_1.ALLBIAODIAN;
        // 计算每一列
        let lineInfo = [];
        let width = 0;
        for (let line of lines) {
            let lineChars = [];
            var stringArray = getStringArray(line);
            let curLineHeight = style.strokeThickness;
            let indexInLine = 0;
            let spliteLine = '';
            let maxLineWidth = 0;
            for (let i = 0; i < stringArray.length; i++) {
                if (style.maxLines) {
                    if (charInfo.length < style.maxLines) {
                        break;
                    }
                }
                let char = stringArray[i];
                let isP = allP.indexOf(char) >= 0;
                let needRotate = false;
                if (!style.rotateP && isP) {
                    needRotate = false;
                }
                else {
                    needRotate = style.rotateP && isP || style.rotateWC && !isP && !(0, isCJK_1.isCJK)(char); // cjk not rotate
                }
                let cInfo = {
                    width: 0,
                    height: 0,
                    char: char,
                    rotate: needRotate,
                };
                let matrics = context.measureText(char);
                if (cInfo.width <= 0 || cInfo.height <= 0) {
                    console.error("measure text error:" + char);
                }
                if (cInfo.rotate) {
                    [cInfo.width, cInfo.height] = [size.fontSize, matrics.width];
                }
                else {
                    [cInfo.width, cInfo.height] = [matrics.width, size.fontSize];
                }
                maxLineWidth = Math.max(cInfo.width, maxLineWidth);
                let curHeight = curLineHeight + cInfo.height;
                if (indexInLine > 0) {
                    curHeight += style.letterSpacing;
                }
                spliteLine += cInfo.char;
                curLineHeight += cInfo.height; // + matrics.actualBoundingBoxDescent            
                lineChars.push(cInfo);
                if (indexInLine > 0) {
                    curHeight += style.letterSpacing;
                }
                indexInLine++;
                if (warpHeight && curHeight > warpHeight || i == stringArray.length - 1) {
                    lineChars.text = spliteLine;
                    charInfo.push(lineChars);
                    lineInfo.push({
                        text: spliteLine,
                        charInfo: lineChars,
                        height: curLineHeight,
                        width: maxLineWidth,
                    });
                    maxLineHeight = Math.max(maxLineHeight, curLineHeight);
                    // reset
                    curLineHeight = 0;
                    lineChars = [];
                    charInfo = [];
                    indexInLine = 0;
                    spliteLine = "";
                }
            }
            width += maxLineWidth + style.strokeThickness + lineSpacing;
        }
        drawnLines = lineInfo.length;
        if (style.shadowOffsetY) {
            maxLineHeight += style.shadowOffsetY;
        }
        //miniHeight
        if (style.miniHeight) {
            maxLineHeight = Math.max(maxLineHeight, style.miniHeight);
        }
        var height = maxLineHeight;
        var lineWidth = size.fontSize + style.strokeThickness + lineSpacing;
        // var width = size.fontSize + ((drawnLines - 1) * lineWidth);
        if (style.shadowOffsetX) {
            width += style.shadowOffsetX;
        }
        if (style.fontStyle == 'italic' || style.fontStyle == "oblique") {
            width += size.fontSize * Math.sin(cc_11.math.toRadian(15)) * 0.5;
        }
        return {
            text,
            style,
            width,
            height,
            lineSpacing,
            lines: drawnLines,
            lineInfo,
        };
    };
});
define("TextMesh/vertex/TMRenderData", ["require", "exports", "cc", "TextMesh/label/CharInfo", "TextMesh/vertex/ETMQuadType"], function (require, exports, cc_12, CharInfo_1, ETMQuadType_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.putTMQuadRenderDataToPool = exports.TMQuadRenderDataPool = exports.TMQuadRenderData = exports.TMRenderDataPool = exports.TMRenderData = void 0;
    class TMRenderData {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.u = 0;
            this.v = 0;
            this.u1 = 0;
            this.v1 = 0;
            this.color = cc_12.Color.WHITE.clone();
            this.textureId = 0;
            // 边线宽度
            this.stroke = 0;
            this.strokeBlur = 0.1;
            // fill
            this.fill = 0.2;
            // 边线颜色
            this.strokeColor = new cc_12.Color(0, 255, 255, 255);
            // 影子颜色
            this.shadowColor = new cc_12.Color(128, 128, 128, 255);
            // 影子宽度
            this.shadow = 0;
            this.shadowBlur = 0;
            this.shadowOffsetX = 1;
            this.shadowOffsetY = 0.1;
            this.char = null;
            this.type = ETMQuadType_2.ETMQuadType.Char;
        }
    }
    exports.TMRenderData = TMRenderData;
    exports.TMRenderDataPool = new cc_12.Pool(() => new TMRenderData(), 128);
    class TMQuadRenderData {
        constructor() {
            this.charInfo = null;
            this.type = ETMQuadType_2.ETMQuadType.Char;
        }
        reset() {
            this.charInfo = null;
            this.type = ETMQuadType_2.ETMQuadType.Char;
            this.startIndex = 0;
            this.endIndex = 0;
            this.length = 0;
            this.height = 0;
            this.maxHeight = 0;
        }
    }
    exports.TMQuadRenderData = TMQuadRenderData;
    exports.TMQuadRenderDataPool = new cc_12.Pool(() => new TMQuadRenderData, 10);
    var putTMQuadRenderDataToPool = (quad) => {
        if (quad.charInfo) {
            (0, CharInfo_1.putCharInfoToPool)(quad.charInfo);
        }
        quad.reset();
        exports.TMQuadRenderDataPool.free(quad);
    };
    exports.putTMQuadRenderDataToPool = putTMQuadRenderDataToPool;
});
define("TextMesh/vertex/VertexFormat", ["require", "exports", "cc"], function (require, exports, cc_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vfmtTMVertex = void 0;
    // 除了颜色，其他的都是RG16F, 防止被UIOpacity影响
    exports.vfmtTMVertex = [
        // pos 3
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_POSITION, cc_13.gfx.Format.RGB32F),
        // uv 2
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_TEX_COORD, cc_13.gfx.Format.RG32F),
        // uv2 2
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_TEX_COORD1, cc_13.gfx.Format.RG32F),
        // color 4
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_COLOR, cc_13.gfx.Format.RGBA32F),
        // channelId,fill 2
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_TEX_COORD2, cc_13.gfx.Format.RG32F),
        // stroke,strokeBlur 2
        new cc_13.gfx.Attribute(cc_13.gfx.AttributeName.ATTR_TEX_COORD3, cc_13.gfx.Format.RG32F),
        // strokeColor.rg 2
        new cc_13.gfx.Attribute("a_strokeColor0", cc_13.gfx.Format.RG32F),
        // strokeColor.ba 2
        new cc_13.gfx.Attribute("a_strokeColor1", cc_13.gfx.Format.RG32F),
    ];
});
define("TextMesh/types/ITypeSet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("TextMesh/utils/Const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VertexMaxSize = exports.ItalicSkewFactor = void 0;
    exports.ItalicSkewFactor = Math.tan(0.207);
    exports.VertexMaxSize = 65535;
});
define("TextMesh/typeset/BaseTypeSet", ["require", "exports", "TextMesh/label/CharInfo", "TextMesh/vertex/TMRenderData", "TextMesh/vertex/ETMQuadType"], function (require, exports, CharInfo_2, TMRenderData_1, ETMQuadType_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseTypeSet = void 0;
    class AddtiveLineInfo {
        constructor() {
            this.startIndex = -1;
            this.lineLength = 0;
            this.lineHeight = 0;
            this.boundHeight = 0;
            this.startY = 0;
            this.existInLine = false;
        }
        reset() {
            this.startIndex = -1;
            this.lineLength = 0;
            this.lineHeight = 0;
            this.boundHeight = 0;
            this.existInLine = false;
            this.startY = 0;
        }
    }
    class BaseTypeSet {
        constructor() {
            this.hitTestResult = {};
            this.breakLineInfo = {
                lineIndex: -1,
                /**break index */
                index: -1,
                lineHeight: 0,
                maxDescent: 0,
                maxAscent: 0,
                maxHeight: 0,
            };
            this.underLineInfo = new AddtiveLineInfo();
            this.strikeInfo = new AddtiveLineInfo();
            this.backgroundInfo = new AddtiveLineInfo();
            this.maskInfo = new AddtiveLineInfo();
            this.beginUpdateHandlers = [];
            this.endUpdateHandlers = [];
            this.registUpdates();
        }
        registUpdates() {
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
        hitTest(comp, touchPos) {
            return null;
        }
        layout(comp) {
            return null;
        }
        reset() {
            this.underLineInfo.reset();
            this.strikeInfo.reset();
            this.backgroundInfo.reset();
            this.maskInfo.reset();
        }
        getWidth(comp, sidx, eidx) {
            let schar = comp.charInfos[sidx];
            let echar = comp.charInfos[eidx];
            // 最后一个字符为空格时，需要减去空格的宽度
            if (eidx > sidx && echar.char.code == " ") {
                echar = comp.charInfos[eidx - 1];
            }
            let width = echar.x - schar.x;
            width += echar.realWidth + echar.sw;
            return width;
        }
        calcLineInfo(comp, line, charInfo) {
            if (line.startIndex >= 0) {
                line.lineLength += charInfo.w;
                if (charInfo.visibleChar) {
                    line.lineHeight = Math.max(line.lineHeight, charInfo.h);
                }
            }
        }
        /***********underline**************/
        appendUnderLineData(comp, startIndex, endIndex) {
            if (startIndex >= 0 && endIndex >= startIndex) {
                let length = this.getWidth(comp, startIndex, endIndex);
                if (length <= 0) {
                    return;
                }
                let rt = TMRenderData_1.TMQuadRenderDataPool.alloc();
                if (!rt.charInfo) {
                    rt.charInfo = (0, CharInfo_2.getCharInfoFromPool)();
                }
                rt.charInfo.char = comp.font.fontData.getRoundLine();
                rt.charInfo.style = comp.charInfos[startIndex].style;
                rt.startIndex = startIndex;
                rt.endIndex = endIndex;
                rt.type = ETMQuadType_3.ETMQuadType.UnderLine;
                rt.length = length;
                rt.height = this.underLineInfo.lineHeight;
                rt.maxHeight = this.breakLineInfo.maxHeight;
                comp.underLineInfos.push(rt);
            }
        }
        updateUnderLineInBegin(comp, index, newLine) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (!newLine) {
                if (this.underLineInfo.startIndex >= 0) {
                    // 判断是否需要添加下划线
                    let pv = chars[index - 1];
                    if (pv.style.underline != charInfo.style.underline) {
                        this.appendUnderLineData(comp, this.underLineInfo.startIndex, index - 1);
                        this.underLineInfo.lineLength = 0;
                        this.underLineInfo.startIndex = -1;
                    }
                }
            }
            if (this.underLineInfo.startIndex < 0 && charInfo.style.underline) {
                this.underLineInfo.startIndex = index;
                this.underLineInfo.existInLine = true;
            }
            this.calcLineInfo(comp, this.underLineInfo, charInfo);
        }
        updateUnderLineInEnd(comp, index) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (this.underLineInfo.startIndex >= 0) {
                this.underLineInfo.lineLength += charInfo.sw;
                this.appendUnderLineData(comp, this.underLineInfo.startIndex, index);
            }
            this.underLineInfo.reset();
        }
        /**************deleteline******************/
        appendStrickData(comp, startIndex, endIndex) {
            if (startIndex >= 0 && endIndex >= startIndex) {
                let length = this.getWidth(comp, startIndex, endIndex);
                if (length <= 0) {
                    return;
                }
                let rt = TMRenderData_1.TMQuadRenderDataPool.alloc();
                if (!rt.charInfo) {
                    rt.charInfo = (0, CharInfo_2.getCharInfoFromPool)();
                }
                rt.charInfo.char = comp.font.fontData.getRoundLine();
                rt.charInfo.style = comp.charInfos[startIndex].style;
                rt.startIndex = startIndex;
                rt.endIndex = endIndex;
                rt.type = ETMQuadType_3.ETMQuadType.DeleteLine;
                rt.length = length;
                rt.height = this.strikeInfo.lineHeight;
                rt.maxHeight = this.breakLineInfo.maxHeight;
                comp.strikeInfos.push(rt);
            }
        }
        updateStrickInBegin(comp, index, newLine) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (!newLine) {
                if (this.strikeInfo.startIndex >= 0) {
                    // 判断是否需要添加刪除线
                    let pv = chars[index - 1];
                    if (pv.style.strike != charInfo.style.strike || pv.style.strike == charInfo.style.strike && pv.style.fontSize != charInfo.style.fontSize) {
                        this.appendStrickData(comp, this.strikeInfo.startIndex, index - 1);
                        this.strikeInfo.lineLength = 0;
                        this.strikeInfo.startIndex = -1;
                    }
                }
            }
            if (this.strikeInfo.startIndex < 0 && charInfo.style.strike) {
                this.strikeInfo.startIndex = index;
                this.strikeInfo.existInLine = true;
            }
            this.calcLineInfo(comp, this.strikeInfo, charInfo);
        }
        updateStrickInEnd(comp, index) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (this.strikeInfo.startIndex >= 0) {
                this.strikeInfo.lineLength += charInfo.sw;
                this.appendStrickData(comp, this.strikeInfo.startIndex, index);
            }
            this.strikeInfo.reset();
        }
        /*************background*******************/
        appendBackgroundData(comp, startIndex, endIndex) {
            if (startIndex >= 0 && endIndex >= startIndex) {
                let length = this.getWidth(comp, startIndex, endIndex);
                if (length <= 0) {
                    return;
                }
                let rt = TMRenderData_1.TMQuadRenderDataPool.alloc();
                if (!rt.charInfo) {
                    rt.charInfo = (0, CharInfo_2.getCharInfoFromPool)();
                }
                rt.charInfo.char = comp.font.fontData.getRectLine();
                rt.charInfo.style = comp.charInfos[startIndex].style.clone();
                rt.charInfo.style.font = comp.font;
                rt.charInfo.style.setFillColor(comp.backgroundColor);
                rt.charInfo.style.setDilate(1, true);
                rt.startIndex = startIndex;
                rt.endIndex = endIndex;
                rt.type = ETMQuadType_3.ETMQuadType.Background;
                rt.length = length;
                rt.height = this.backgroundInfo.lineHeight;
                rt.maxHeight = this.breakLineInfo.maxHeight;
                comp.backgroundInfos.push(rt);
            }
        }
        updateBackgroundInBegin(comp, index, newLine) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (!newLine) {
                if (this.backgroundInfo.startIndex >= 0) {
                    // 判断是否需要添加背景
                    let pv = chars[index - 1];
                    if (pv.style.background != charInfo.style.background ||
                        pv.style.background == charInfo.style.background && pv.style.fontSize != charInfo.style.fontSize) {
                        this.appendBackgroundData(comp, this.backgroundInfo.startIndex, index - 1);
                        this.backgroundInfo.lineLength = 0;
                        this.backgroundInfo.startIndex = -1;
                    }
                }
            }
            if (this.backgroundInfo.startIndex < 0 && charInfo.style.background) {
                this.backgroundInfo.startIndex = index;
                this.backgroundInfo.existInLine = true;
            }
            this.calcLineInfo(comp, this.backgroundInfo, charInfo);
        }
        updateBackgroundInEnd(comp, index) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (this.backgroundInfo.startIndex >= 0) {
                this.backgroundInfo.lineLength += charInfo.sw;
                this.appendBackgroundData(comp, this.backgroundInfo.startIndex, index);
            }
            this.backgroundInfo.reset();
        }
        /*************mask*******************/
        appendMaskData(comp, startIndex, endIndex) {
            if (startIndex >= 0 && endIndex >= startIndex) {
                let length = this.getWidth(comp, startIndex, endIndex);
                if (length <= 0) {
                    return;
                }
                let rt = TMRenderData_1.TMQuadRenderDataPool.alloc();
                if (!rt.charInfo) {
                    rt.charInfo = (0, CharInfo_2.getCharInfoFromPool)();
                }
                rt.charInfo.char = comp.font.fontData.getRectLine();
                rt.charInfo.style = comp.charInfos[startIndex].style.clone();
                rt.charInfo.style.font = comp.font;
                rt.charInfo.style.setFillColor(comp.maskColor);
                rt.charInfo.style.setDilate(1, true);
                rt.startIndex = startIndex;
                rt.endIndex = endIndex;
                rt.type = ETMQuadType_3.ETMQuadType.Mask;
                rt.length = length;
                rt.height = this.maskInfo.lineHeight;
                rt.maxHeight = this.breakLineInfo.maxHeight;
                comp.maskInfos.push(rt);
            }
        }
        updateMaskInBegin(comp, index, newLine) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (!newLine) {
                if (this.maskInfo.startIndex >= 0) {
                    // 判断是否需要添加遮罩
                    let pv = chars[index - 1];
                    if (pv.style.mask != charInfo.style.mask || pv.style.mask == charInfo.style.mask && pv.style.fontSize != charInfo.style.fontSize) {
                        this.appendMaskData(comp, this.maskInfo.startIndex, index - 1);
                        this.maskInfo.lineLength = 0;
                        this.maskInfo.startIndex = -1;
                    }
                }
            }
            if (this.maskInfo.startIndex < 0 && charInfo.style.mask) {
                this.maskInfo.startIndex = index;
                this.maskInfo.existInLine = true;
            }
            // 累计遮罩宽度
            this.calcLineInfo(comp, this.maskInfo, charInfo);
        }
        updateMaskInEnd(comp, index) {
            const chars = comp.charInfos;
            const charInfo = chars[index];
            if (this.maskInfo.startIndex >= 0) {
                this.maskInfo.lineLength += charInfo.sw;
                this.appendMaskData(comp, this.maskInfo.startIndex, index);
            }
            this.maskInfo.reset();
        }
    }
    exports.BaseTypeSet = BaseTypeSet;
});
define("TextMesh/typeset/HorizontalTypeSet", ["require", "exports", "TextMesh/label/types", "TextMesh/libs/hanzi/isCJK", "TextMesh/utils/Const", "cc", "TextMesh/libs/hanzi/code", "TextMesh/typeset/BaseTypeSet"], function (require, exports, types_3, isCJK_2, Const_1, cc_14, code_2, BaseTypeSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HorizontalTypeSet = void 0;
    const vec3_temp1 = (0, cc_14.v3)();
    const vec3_temp = (0, cc_14.v3)();
    class HorizontalTypeSet extends BaseTypeSet_1.BaseTypeSet {
        hitTest(comp, touchPos) {
            let utr = comp.uiTransform;
            var camera = cc_14.director.root.batcher2D.getFirstRenderCamera(comp.node);
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
                    if (x >= char.x + char.offsetX && x <= char.x + char.offsetX + char.w + char.sw) {
                        this.hitTestResult.result = true;
                        this.hitTestResult.accurate = false;
                        this.hitTestResult.charInfo = char;
                        if (y >= char.y + char.offsetY && y <= char.y + char.offsetY + char.h + comp.lineSpace) {
                            this.hitTestResult.accurate = true;
                        }
                        return this.hitTestResult;
                    }
                }
            }
            return null;
        }
        processRTL(comp, from, to) {
            // if(comp.RTL) {
            let chars = comp.charInfos;
            let allWords = [];
            let word = [];
            let lastWhitSpaceIdx = -1;
            for (let i = from; i <= to; i++) {
                let last = i == to;
                let charInfo = chars[i];
                if (code_2.ALLBIAODIAN.indexOf(charInfo.char.code) >= 0) {
                    if (lastWhitSpaceIdx < 0) {
                        allWords.push(word);
                        word = [];
                        lastWhitSpaceIdx = i;
                    }
                    word.push(i);
                }
                else {
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
        layout(comp) {
            if (!comp.font) {
                return null;
            }
            this.reset();
            let result = null;
            switch (comp.overflow) {
                case types_3.ETextOverflow.None:
                    result = this.updateInResizeWidthMode(comp);
                    break;
                case types_3.ETextOverflow.Clamp:
                    result = this.updateInClampMode(comp);
                    break;
                case types_3.ETextOverflow.ResizeHeight:
                    result = this.updateInResizeHeightMode(comp);
                    break;
                case types_3.ETextOverflow.Shrink:
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
        updateGloabl(comp) {
            let trans = comp.uiTransform;
            comp.localOffsetX = 0;
            comp.localOffsetY = 0;
            comp.globalOffsetX = -trans.width * trans.anchorX || 0;
            comp.globalOffsetY = trans.height * (1 - trans.anchorY) || 0;
        }
        updateInClampMode(comp) {
            return this.updateInWarpMode(comp, 1, false);
        }
        preProcessVertex(comp, charInfo, scale) {
            let hasCalced = charInfo.cjk != null;
            if (hasCalced) {
                return;
            }
            charInfo.cjk = (0, isCJK_2.isCJK)(charInfo.char.code);
            let ratio = charInfo.slot ? 1 : charInfo.style.realFontSize / (comp.font.fontSize * charInfo.char.scale) * scale;
            let scaleX = charInfo.scale = ratio * comp.aspect;
            let isBreak = charInfo.char.code == "\n";
            let isSpace = charInfo.char.code == " ";
            if (isBreak || isSpace) {
                charInfo.visibleChar = false;
                charInfo.w = charInfo.realWidth = isBreak ? 0 : charInfo.char.width * scaleX;
                charInfo.h = charInfo.realHeight = charInfo.style.realFontSize;
                charInfo.sw = 0;
                charInfo.sw1 = 0;
                charInfo.glyphLeft = charInfo.glyphRight = 0;
                charInfo.descent = 0;
                charInfo.offsetX = charInfo.offsetY = 0;
                return;
            }
            let width = charInfo.char.width;
            let height = charInfo.char.height;
            let glyphWidth = charInfo.char.glyphWidth;
            let glyphHeight = charInfo.char.glyphHeight;
            let descent = charInfo.char.descent;
            let ascent = charInfo.char.ascent;
            let glyphAdvance = charInfo.char.glyphAdvance;
            let glyphLeft = charInfo.char.glyphLeft;
            if (charInfo.slot) {
                width = charInfo.slot.width;
                height = charInfo.slot.height;
                glyphWidth = width;
                glyphHeight = height;
                descent = 0;
                charInfo.glyphLeft = 0;
                charInfo.glyphRight = 0;
                if (charInfo.slot.fixed) {
                    scaleX = 1;
                    ratio = 1;
                }
            }
            else {
                charInfo.glyphLeft = glyphLeft * scaleX;
                if (glyphAdvance < glyphWidth) {
                    charInfo.glyphRight = (glyphWidth - glyphAdvance - glyphLeft) * scaleX;
                }
                else {
                    charInfo.glyphRight = 0;
                }
            }
            charInfo.ascent = ascent * ratio;
            charInfo.descent = descent * ratio;
            charInfo.fixedY = (height - glyphHeight) * ratio;
            // 计算真实宽高
            if (!charInfo.rotate) {
                charInfo.realWidth = width * scaleX;
                charInfo.realHeight = height * ratio;
                charInfo.offsetY = -descent * ratio;
                if (charInfo.slot) {
                    charInfo.w = charInfo.realWidth;
                    charInfo.h = charInfo.realHeight;
                }
                else {
                    charInfo.w = glyphAdvance * scaleX;
                    charInfo.h = glyphHeight * ratio;
                }
            }
            else {
                charInfo.realWidth = height * scaleX;
                charInfo.realHeight = width * ratio;
                charInfo.offsetY = -descent * ratio;
                if (charInfo.slot) {
                    charInfo.w = charInfo.realHeight;
                    charInfo.h = charInfo.realWidth;
                }
                else {
                    charInfo.w = glyphHeight * scaleX;
                    charInfo.h = glyphAdvance * ratio;
                }
            }
            if (comp.equalWidth) {
                let w = charInfo.w;
                charInfo.w = comp.fontSize;
                charInfo.glyphLeft = -(comp.fontSize - w) * 0.5;
                charInfo.glyphRight = 0;
            }
            charInfo.sw = 0;
            if (charInfo.style.italic) {
                charInfo.sw = charInfo.realHeight * Const_1.ItalicSkewFactor;
                charInfo.sw1 = charInfo.descent * Const_1.ItalicSkewFactor;
            }
        }
        calcNextBreakInfo(comp, index, currentX, maxWidth, scale, autoBreak) {
            const chars = comp.charInfos;
            currentX += chars[index].glyphLeft;
            if (!comp.multiline) {
                autoBreak = false;
            }
            let totalWidth = currentX;
            let oldTotalWidth = totalWidth;
            let oldIndex = -1;
            let oldHeight = 0;
            let oldDescent = 0;
            let oldAscent = 0;
            let oldMaxHeight = 0;
            let continueSpace = 0;
            let letterSpace = comp.letterSpace;
            for (let vi = index; vi < chars.length; vi++) {
                let preChar = vi - 1 >= 0 ? chars[vi - 1] : null;
                let charInfo = chars[vi];
                this.preProcessVertex(comp, charInfo, scale);
                if (charInfo.visibleChar) {
                    let height = 0;
                    height = charInfo.h;
                    this.breakLineInfo.lineHeight = comp.fixedLineHeight ? comp.lineHeight : Math.max(height, this.breakLineInfo.lineHeight);
                    this.breakLineInfo.maxDescent = Math.max(charInfo.descent, this.breakLineInfo.maxDescent);
                    this.breakLineInfo.maxAscent = Math.max(charInfo.ascent, this.breakLineInfo.maxAscent);
                    this.breakLineInfo.maxHeight = comp.fixedLineHeight ? comp.lineHeight : Math.max(this.breakLineInfo.maxHeight, charInfo.realHeight);
                }
                let isBreak = charInfo.char.code == "\n";
                if (isBreak && vi == index) {
                    this.breakLineInfo.index = vi;
                    break;
                }
                let isSpace = charInfo.char.code == " ";
                if (isSpace) {
                    continueSpace++;
                }
                else {
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
                    }
                    else {
                        this.breakLineInfo.lineHeight = oldHeight;
                        this.breakLineInfo.maxDescent = oldDescent;
                        this.breakLineInfo.maxAscent = oldAscent;
                        this.breakLineInfo.maxHeight = oldMaxHeight;
                    }
                    break;
                }
                // 判断宽带后完成后，判断是否需要清除单词换行信息
                if (isSpace || preChar && (preChar.cjk != charInfo.cjk || preChar.cjk && charInfo.cjk)) {
                    oldIndex = -1;
                }
                // 更新old信息
                totalWidth += charInfo.w;
                oldHeight = this.breakLineInfo.lineHeight;
                oldDescent = this.breakLineInfo.maxDescent;
                oldAscent = this.breakLineInfo.maxAscent;
                oldMaxHeight = this.breakLineInfo.maxHeight;
                // 检查单词换行
                let isBreaking = code_2.LINEBREAKING.indexOf(charInfo.char.code) >= 0;
                let isLeading = code_2.LINELEADING.indexOf(charInfo.char.code) >= 0;
                let charDifference = comp.breakWestern && preChar && preChar.cjk != charInfo.cjk;
                if (vi != index && !isLeading && comp.autoWarp && (isBreaking || charDifference)) {
                    let offset = 0;
                    let offsetWidth = 0;
                    let usePreChar = isSpace || charDifference;
                    // 右对齐，末尾空格在下一行显示
                    if (usePreChar && !(comp.horizontalAlign == types_3.ETextHorizontalAlign.Right && vi > index)) {
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
                    isBreak = nextChar2.char.code == "\n";
                    totalWidth += this.getWidthExt(charInfo, nextChar2);
                    let isNextLeading = false;
                    let isNextBreaking = false;
                    // 如果最后一个字符遇到前置字符，提前换行
                    if (isBreak ||
                        autoBreak &&
                            (totalWidth + nextChar2.w + nextChar2.sw + nextChar2.glyphRight > maxWidth) &&
                            ((isNextLeading = code_2.LINELEADING.indexOf(nextChar2.char.code) >= 0) ||
                                (isNextBreaking = code_2.LINEBREAKING.indexOf(nextChar2.char.code) >= 0))) {
                        let useOld = oldIndex >= 0;
                        // 下一行再显示
                        this.breakLineInfo.index = useOld ? oldIndex : vi;
                        if (isBreak || isNextBreaking && comp.autoWarp) {
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
                }
                else {
                    this.breakLineInfo.index = vi;
                    totalWidth += charInfo.sw;
                    break;
                }
            }
            this.breakLineInfo.lineIndex++;
            return this.breakLineInfo;
        }
        getWidthExt(preChar, charInfo) {
            if (preChar) {
                if (preChar.style.scriptType != types_3.EScriptType.SuperScript && charInfo.style.scriptType == types_3.EScriptType.SuperScript) {
                    return preChar.sw;
                }
                else if (preChar.style.scriptType != types_3.EScriptType.SubScript && charInfo.style.scriptType == types_3.EScriptType.SubScript) {
                    return preChar.sw1;
                }
                if (!charInfo.style.italic && preChar.style.italic) {
                    return preChar.sw;
                }
            }
            return 0;
        }
        updateInWarpMode(comp, scale = 1, autoBreak = true) {
            // 初始化
            comp.globalOffsetX = comp.globalOffsetY = 0;
            this.breakLineInfo.lineIndex = 0;
            const trans = comp.uiTransform;
            let maxWidth = trans.width - comp.padding.left - comp.padding.right;
            let lineHeight = 0;
            let maxHeight = 0;
            let chars = comp.charInfos;
            let totalX = comp.padding.left;
            let baseY = -comp.padding.top;
            let startY = baseY;
            // 当前行起始索引，from,to
            let line = [0, 0];
            // 所有行
            let lines = [line];
            // 是否新行
            let newLine = true;
            let boundHeight = 0;
            let boundWidth = 0;
            let lastMaxDescent = 0;
            let lastMaxAscent = 0;
            let linesHeight = [];
            let linesWidth = [];
            let lineBaseY = 0;
            for (let i = 0; i < chars.length; i++) {
                let charInfo = chars[i];
                if (newLine) {
                    // 获取下一行数据
                    this.calcNextBreakInfo(comp, i, totalX, maxWidth, scale, autoBreak);
                }
                maxHeight = this.breakLineInfo.maxHeight;
                lineHeight = this.breakLineInfo.lineHeight;
                // 需要在每行计算后下移
                if (newLine) {
                    newLine = false;
                    let offsetHeight = 0;
                    if (lines.length > 1) {
                        offsetHeight = comp.lineSpace;
                    }
                    startY = baseY;
                    baseY = baseY - lineHeight - offsetHeight;
                    lineBaseY = (maxHeight - lineHeight) * 0.5;
                }
                line[1] = i;
                charInfo.line = lines.length - 1;
                charInfo.inline = line[1] - line[0];
                let lastChar = i == chars.length - 1;
                if (this.breakLineInfo.index >= 0 && i == this.breakLineInfo.index) {
                    newLine = true;
                }
                let preChar;
                if (line[0] == i) {
                    // 第一个字符需要向左偏移glyphLeft， 防止左边被截断
                    totalX += charInfo.glyphLeft;
                }
                else {
                    preChar = chars[i - 1];
                }
                // 换行时需要纠正下x的位置
                let isBreak = charInfo.char.code == "\n";
                // 非行首换行
                if (isBreak && line[0] < i && i > 0) {
                    totalX = preChar.x + preChar.realWidth + preChar.sw;
                }
                // 处理上标偏移
                else {
                    totalX += this.getWidthExt(preChar, charInfo);
                }
                // 向左偏移glyphLeft
                charInfo.x = totalX - charInfo.glyphLeft;
                charInfo.baseY = baseY;
                charInfo.y = -lineBaseY + (lineHeight - charInfo.ascent - charInfo.descent) * 0.5;
                charInfo.startY = startY;
                // 上标
                if (charInfo.style.scriptType == types_3.EScriptType.SuperScript) {
                    charInfo.y += (lineHeight - charInfo.h);
                }
                for (let iu = 0; iu < this.beginUpdateHandlers.length; iu++) {
                    this.beginUpdateHandlers[iu].call(this, comp, i, newLine);
                }
                // 当前行宽
                totalX = totalX + charInfo.w + comp.letterSpace * scale;
                if (newLine || lastChar) {
                    let lineWidth = this.getWidth(comp, line[0], line[1]);
                    // 行宽度需要考虑倾斜宽度
                    linesWidth.push(lineWidth);
                    linesHeight.push(lineHeight);
                    boundHeight += lineHeight;
                    if (lines.length > 1) {
                        boundHeight += comp.lineSpace;
                    }
                    boundWidth = Math.max(lineWidth, boundWidth);
                    if (i + 1 < chars.length) {
                        totalX = comp.padding.left;
                        line = [i + 1, 0];
                        lines.push(line);
                    }
                    // 添加下划线高度
                    if (lastChar && this.underLineInfo.startIndex >= 0 && charInfo.font.keepUnlderLineSpace) {
                        let startChar = chars[this.underLineInfo.startIndex];
                        let unlderLineOffset = Math.max(0, startChar.style.fontSize * comp.font.underLineThickness - startChar.style.fontSize * comp.font.underLineOffset);
                        boundHeight += unlderLineOffset;
                    }
                    for (let iu = 0; iu < this.endUpdateHandlers.length; iu++) {
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
                lastMaxDescent,
            };
        }
        updateInResizeHeightMode(comp) {
            let result = this.updateInWarpMode(comp);
            const trans = comp.uiTransform;
            let offsetY = (result.maxHeight - trans.height) * trans.anchorY;
            trans.height = result.maxHeight || 0;
            comp.globalOffsetY += offsetY;
            return result;
        }
        updateInResizeWidthMode(comp) {
            let result = this.updateInWarpMode(comp, 1, false);
            const trans = comp.uiTransform;
            trans.width = result.maxWidth || 0;
            trans.height = result.maxHeight;
            return result;
        }
        updateInShrinkMode(comp) {
            let result = this.updateInWarpMode(comp);
            const trans = comp.uiTransform;
            let scale = 1;
            if (result.lines.length <= 1) {
                if (result.maxWidth > trans.width) {
                    scale = trans.width / result.maxWidth;
                }
            }
            else {
                if (result.maxHeight > trans.height) {
                    scale = trans.height / result.maxHeight;
                }
            }
            if (scale != 1) {
                for (let i = 0; i < comp.charInfos.length; i++) {
                    comp.charInfos[i].cjk = null;
                }
                comp._clearAdditions();
                result = this.updateInWarpMode(comp, scale, true);
            }
            return result;
        }
        horizontalLayout(comp, result) {
            if (comp.horizontalAlign == types_3.ETextHorizontalAlign.Left) {
                return;
            }
            let align = 0;
            if (comp.horizontalAlign == types_3.ETextHorizontalAlign.Center) {
                align = 0.5;
            }
            else if (comp.horizontalAlign == types_3.ETextHorizontalAlign.Right) {
                align = 1;
            }
            const trans = comp.uiTransform;
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
        verticalLayout(comp, result) {
            if (comp.overflow == types_3.ETextOverflow.ResizeHeight || comp.verticalAlign == types_3.ETextVerticalAlign.Top) {
                return;
            }
            const trans = comp.uiTransform;
            let align = 0;
            if (comp.verticalAlign == types_3.ETextVerticalAlign.Middle) {
                align = 0.5;
            }
            else if (comp.verticalAlign == types_3.ETextVerticalAlign.Bottom) {
                align = 1;
            }
            let realMaxHeight = result.maxHeight + comp.padding.bottom;
            comp.localOffsetY = (realMaxHeight - trans.height) * align;
            comp.globalOffsetY += comp.localOffsetY;
        }
        layoutSlots(comp, result) {
            for (let i = 0; i < comp.slots.length; i++) {
                let slot = comp.slots[i];
                let char = comp.charInfos[slot.index];
                let trans = slot.node._uiProps.uiTransformComp;
                trans.width = char.w;
                trans.height = char.h;
                let lineHeight = result.linesHeight[char.line];
                let x = char.x + trans.width * slot.dx;
                let y = char.baseY + char.y + (trans.height - lineHeight + comp.lineSpace) * slot.dy;
                char.x = x;
                char.y = y;
                slot.node.position = new cc_14.Vec3(x + comp.globalOffsetX + comp.slotOffsetX, y + comp.globalOffsetY + comp.slotOffsetY, 0);
                // console.log("layoutSlots", slot.node.position);
            }
        }
    }
    exports.HorizontalTypeSet = HorizontalTypeSet;
});
define("TextMesh/typeset/TypeSetFactory", ["require", "exports", "TextMesh/typeset/HorizontalTypeSet"], function (require, exports, HorizontalTypeSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeSetFactory = void 0;
    class TypeSetFactory {
        static regist(type, cst) {
            this._typeMap[type] = cst;
        }
        static get(type) {
            if (this._typeInsts[type]) {
                return this._typeInsts[type];
            }
            if (!this._typeMap[type]) {
                console.error(`can not find typeset type named ${type}`);
                return null;
            }
            let inst = new this._typeMap[type]();
            this._typeInsts[type] = inst;
            return inst;
        }
    }
    exports.TypeSetFactory = TypeSetFactory;
    TypeSetFactory._typeMap = {};
    TypeSetFactory._typeInsts = {};
    TypeSetFactory.regist("horizontal", HorizontalTypeSet_1.HorizontalTypeSet);
});
define("TextMesh/utils/dfs", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function* dfs(node, defaultDepth = 0) {
        const children = (node instanceof Array) ? node : node.children;
        let depth = defaultDepth;
        if (!children) {
            return;
        }
        for (const child of children) {
            yield [child, depth];
            if (child.children && child.children.length) {
                depth += 1;
                yield* dfs(child.children, depth);
                depth -= 1;
            }
        }
    }
    exports.default = dfs;
});
define("TextMesh/utils/UBBParser", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UBBParser = exports.TagNode = void 0;
    class TagNode {
        constructor(name) {
            this.name = name || '';
        }
    }
    exports.TagNode = TagNode;
    const booleanRegex = /^(true|false)$/i;
    const CHAR_POUND = '#';
    class UBBParser {
        constructor() {
            this._tagInfo = { name: "", pos: 0, ended: false };
        }
        exception(msg) {
            console.error("UBBParser: " + msg);
            this._tagInfo.pos = this._text.length;
        }
        addTextNode(text) {
            let node = new TagNode();
            node.type = "text";
            node.text = text;
            if (!this._currentNode.children) {
                this._currentNode.children = [];
            }
            this._currentNode.children.push(node);
        }
        addNode(name, value) {
            let node = new TagNode();
            node.type = "node";
            node.name = name;
            node.value = value;
            if (!this._currentNode.children) {
                this._currentNode.children = [];
            }
            this._currentNode.children.push(node);
            node._parent = this._currentNode;
            this._currentNode = node;
        }
        addAttribute(name, value) {
            if (!this._currentNode.attributes) {
                this._currentNode.attributes = {};
            }
            this._currentNode.attributes[name] = value;
        }
        setNodeText(value) {
            this._currentNode.text = value;
        }
        closeNode(name) {
            if (name) {
                if (this._currentNode.name != name) {
                    this.exception("close node error:" + this._currentNode.name + " != " + name);
                }
                else {
                    this._currentNode._closed = true;
                }
            }
            this._tagInfo.name = null;
            this._tagInfo.ended = false;
            if (this._currentNode != this._root && this._currentNode._closed) {
                let old = this._currentNode;
                this._currentNode = this._currentNode._parent;
                delete old._parent;
                delete old._closed;
                return true;
            }
            return false;
        }
        isValidChar(char, pos) {
            // 字符相等，且未被转义
            if ((pos == 0 || pos > 0 && this._text[pos - 1] !== '\\') && this._text.substring(pos, pos + char.length) == char) {
                return true;
            }
            return false;
        }
        getTagName(startPos, tag_e) {
            this._tagInfo.ended = false;
            let tagName = "";
            let tagValue = null;
            let pos = startPos;
            let len = this._text.length;
            while (pos < len) {
                if (this._text[pos] == '=') {
                    tagName = this._text.substring(startPos, pos);
                    tagValue = this.getTagValue(pos, tag_e);
                    break;
                }
                else {
                    let tagEnd1 = this.isValidChar(tag_e, pos);
                    // 自闭合标签<br/>
                    let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                    if (this._text[pos] == ' ' || tagEnd1 || tagEnd2) {
                        tagName = this._text.substring(startPos, pos);
                        this._tagInfo.pos = pos;
                        pos++;
                        if (tagEnd2) {
                            pos++;
                            this._tagInfo.ended = true;
                            this._tagInfo.pos = pos;
                        }
                        break;
                    }
                    else {
                        pos++;
                    }
                }
            }
            this._tagInfo.name = tagName;
            this.addNode(tagName, tagValue);
            return this._tagInfo;
        }
        getTagValue(startPos, tag_e) {
            let tagValue = null;
            let pos = startPos;
            let len = this._text.length;
            let startQuote = null;
            let match = false;
            let begin = false;
            while (pos < len) {
                if (!begin) {
                    if (this._text[pos] == ' ') {
                        pos++;
                        continue;
                    }
                    if (this._text[pos] == "=") {
                        pos++;
                        if (pos >= len) {
                            this.exception("tag value error," + this._text.substring(startPos, pos));
                            break;
                        }
                        if (this._text[pos] == '\"' || this._text[pos] == "'") {
                            startQuote = this._text[pos];
                            pos++;
                        }
                        startPos = pos;
                        begin = true;
                        continue;
                    }
                }
                if (startQuote) {
                    if (this.isValidChar(startQuote, pos)) {
                        tagValue = this._text.substring(startPos, pos);
                        pos++;
                        startPos = pos;
                        startQuote = null;
                        match = true;
                        break;
                    }
                    else {
                        pos++;
                    }
                }
                else if (begin) {
                    let tagEnd1 = this.isValidChar(tag_e, pos);
                    let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                    if (this._text[pos] == ' ' || tagEnd1 || tagEnd2) {
                        tagValue = this._text.substring(startPos, pos);
                        if (tagEnd2) {
                            this._tagInfo.ended = true;
                        }
                        startPos = pos;
                        startQuote = null;
                        if (tagValue != null) {
                            if (booleanRegex.test(tagValue)) {
                                tagValue = tagValue.toLowerCase() == "true";
                            }
                            else if (tagValue.indexOf('.') != -1) {
                                tagValue = parseFloat(tagValue);
                                if (Number.isNaN(tagValue)) {
                                    console.error("tag value error," + this._text.substring(startPos, pos));
                                }
                            }
                            else if (tagValue[0] == CHAR_POUND) {
                                // do nothing
                            }
                            else {
                                tagValue = parseInt(tagValue);
                                if (Number.isNaN(tagValue)) {
                                    console.error("tag value error," + this._text.substring(startPos, pos));
                                }
                            }
                        }
                        match = true;
                        break;
                    }
                    else {
                        pos++;
                    }
                }
                else {
                    pos++;
                }
            }
            if (!match) {
                this.exception("get tag value error");
            }
            this._tagInfo.pos = pos;
            return tagValue;
        }
        getAttribute(startPos, tag_e) {
            let attrName = "";
            let attrValue = "";
            let pos = startPos;
            let startQuote = null;
            let len = this._text.length;
            let checkBoolTag = () => {
                if (!attrName && pos > startPos) {
                    attrName = this._text.substring(startPos, pos).replace(/ /g, "");
                    if (attrName) {
                        this.addAttribute(attrName, true);
                        startPos = pos;
                        attrName = null;
                    }
                }
            };
            while (pos < len) {
                if (!attrName) {
                    if (this._text[pos] == ' ') {
                        checkBoolTag();
                        pos++;
                        startPos = pos;
                        continue;
                    }
                    else if (this.isValidChar(tag_e, pos)) {
                        checkBoolTag();
                        pos++;
                        break;
                    }
                    else if (this.isValidChar("/" + tag_e, pos)) {
                        checkBoolTag();
                        pos += 2;
                        break;
                    }
                    if (this._text[pos] == '=') {
                        attrName = this._text.substring(startPos, pos);
                        pos++;
                        if (pos >= len) {
                            this.exception("tag value error," + this._text.substring(startPos, pos));
                            break;
                        }
                        if (this._text[pos] == '\"' || this._text[pos] == "'") {
                            startQuote = this._text[pos];
                            pos++;
                        }
                        startPos = pos;
                    }
                    else {
                        pos++;
                    }
                }
                else {
                    if (startQuote) {
                        if (this.isValidChar(startQuote, pos)) {
                            attrValue = this._text.substring(startPos, pos);
                            pos++;
                            startPos = pos;
                            startQuote = null;
                            this.addAttribute(attrName, attrValue);
                            attrName = null;
                        }
                        else {
                            pos++;
                        }
                    }
                    else {
                        let space = this._text[pos] == ' ';
                        let tagEnd1 = this.isValidChar(tag_e, pos);
                        let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                        if (space || tagEnd1 || tagEnd2) {
                            attrValue = this._text.substring(startPos, pos);
                            if (space) {
                                pos++;
                            }
                            startPos = pos;
                            startQuote = null;
                            if (booleanRegex.test(attrValue)) {
                                attrValue = attrValue.toLowerCase() == "true";
                            }
                            else if (attrValue.indexOf('.') != -1) {
                                attrValue = parseFloat(attrValue);
                            }
                            else {
                                attrValue = parseInt(attrValue);
                            }
                            this.addAttribute(attrName, attrValue);
                            attrName = null;
                        }
                        else {
                            pos++;
                        }
                    }
                }
            }
            if (startQuote) {
                this.exception("attribute value is not closed");
            }
            this._tagInfo.pos = pos;
            return pos;
        }
        getText(startPos, tag_s, tag_e) {
            if (this._text[startPos] == tag_s) {
                return startPos;
            }
            let text = "";
            let pos = startPos;
            let len = this._text.length;
            let strs = [];
            while (pos < len) {
                if (this._text[pos] == tag_s) {
                    if (this.isValidChar(tag_s, pos)) {
                        break;
                    }
                    else {
                        strs.pop();
                        strs.push(this._text[pos]);
                    }
                }
                else {
                    strs.push(this._text[pos]);
                }
                pos++;
            }
            text = strs.join(""); // this._text.substring(startPos, pos);
            this._tagInfo.pos = pos;
            this.setNodeText(text);
            return pos;
        }
        getTail(startPos, tag_s, tag_e) {
            if (this._text[startPos] != tag_s || this._text[startPos] == tag_s && this._text[startPos + 1] != "/") {
                this._tagInfo.name = null;
                return startPos;
            }
            let nodeName = "";
            let pos = startPos;
            let len = this._text.length;
            let check = 0;
            while (pos < len) {
                if (this.isValidChar(tag_s + "/", pos)) {
                    pos += 2;
                    startPos = pos;
                    check++;
                    continue;
                }
                if (this._text[pos] == ' ') {
                    pos++;
                    continue;
                }
                if (this._text[pos] == tag_e) {
                    nodeName = this._text.substring(startPos, pos);
                    pos++;
                    check++;
                    break;
                }
                pos++;
            }
            if (check != 2) {
                this.exception("tag tail error");
            }
            else {
                this._tagInfo.ended = true;
            }
            this._tagInfo.name = nodeName;
            this._tagInfo.pos = pos;
            return pos;
        }
        // ubb 解析
        parse(text, ubb) {
            this._root = new TagNode("root");
            this._root.type = "root";
            this._tagInfo.name = null;
            this._tagInfo.ended = false;
            this._tagInfo.pos = 0;
            this._currentNode = this._root;
            this._text = text;
            this.lastColor = null;
            this.lastSize = null;
            let startPos = 0;
            let pos = 0;
            let tag_s = ubb ? "[" : "<";
            let tag_e = ubb ? "]" : ">";
            let len = this._text.length;
            while (pos < len) {
                if (!this._tagInfo.name && this._text[pos] == tag_s) {
                    if (startPos < pos && !this._tagInfo.name) {
                        this.addTextNode(this._text.substring(startPos, pos));
                    }
                    // 获取尾部
                    pos = this.getTail(pos, tag_s, tag_e);
                    if (this._tagInfo.ended) {
                        this.closeNode(this._tagInfo.name);
                        this._tagInfo.name = null;
                        startPos = pos;
                        continue;
                    }
                    // 跳过开始符号
                    pos++;
                    // 获取标签名
                    this.getTagName(pos, tag_e);
                    if (this._tagInfo.name) {
                        pos = this._tagInfo.pos;
                        if (this._tagInfo.ended) {
                            this.closeNode(this._tagInfo.name);
                            this._tagInfo.name = null;
                            startPos = pos;
                            continue;
                        }
                    }
                    else {
                        console.log("tag name is null in pos: " + pos);
                        break;
                    }
                    // 获取属性
                    pos = this.getAttribute(pos, tag_e);
                    // 获取文本
                    pos = this.getText(pos, tag_s, tag_e);
                    // 获取尾部
                    pos = this.getTail(pos, tag_s, tag_e);
                    if (this._tagInfo.ended) {
                        this.closeNode(this._tagInfo.name);
                        this._tagInfo.name = null;
                        startPos = pos;
                        continue;
                    }
                    this._tagInfo.name = null;
                    startPos = pos;
                    this.closeNode(null);
                }
                else {
                    if (pos == len - 1 && !this._tagInfo.name) {
                        this.addTextNode(this._text.substring(startPos, pos + 1));
                    }
                    pos++;
                }
            }
            this._text = null;
            return this._root;
        }
    }
    exports.UBBParser = UBBParser;
    UBBParser.inst = new UBBParser();
});
define("TextMesh/settings", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMeshSettings = void 0;
    exports.TextMeshSettings = {
        antiAlis: true,
        shadowScale: 1,
        dilateScale: 1,
        disableTextMesh: false,
        defulatUseFontPreset: true,
    };
});
define("TextMesh/label/TextMeshAssembler", ["require", "exports", "cc", "TextMesh/settings", "TextMesh/utils/Const", "TextMesh/vertex/ETMQuadType", "TextMesh/label/CharInfo", "TextMesh/label/types"], function (require, exports, cc_15, settings_1, Const_2, ETMQuadType_4, CharInfo_3, types_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMeshAssembler = void 0;
    const MaxQuadLimit = Math.ceil(65535 / 6);
    const QuadIndices = [0, 1, 2, 2, 1, 3];
    const vec3_temp = new cc_15.Vec3();
    const _worldMatrix = new cc_15.Mat4();
    class TextMeshAssembler {
        static createData(comp) {
            const renderData = comp.requestRenderData();
            // renderData.resize(0, 0);
            // renderData.dataLength = 0;
            return renderData;
        }
        static fillBuffers(comp, renderer) {
            if (!comp.renderData || !comp.font) {
                return;
            }
            // if(!comp.node.hasChangedFlags) {
            //     return;
            // }
            const node = comp.node;
            const chunk = comp.renderData.chunk;
            if (!chunk) {
                return;
            }
            node.updateWorldTransform();
            node.getWorldMatrix(_worldMatrix);
            let vertexOffset = 0;
            if (this._needCheckShdaow(comp)) {
                vertexOffset = this._fillElementBuffers(comp, renderer, true);
            }
            this._fillElementBuffers(comp, renderer, false, vertexOffset);
        }
        static _fillElementBuffers(comp, renderer, shadow = false, vertexOffset = 0) {
            const chunk = comp.renderData.chunk;
            const vData = chunk.vb;
            const floatStride = comp.renderData.floatStride;
            const bid = chunk.bufferId;
            const vid = chunk.vertexOffset;
            const meshBuffer = chunk.vertexAccessor.getMeshBuffer(chunk.bufferId);
            const ib = chunk.vertexAccessor.getIndexBuffer(bid);
            const len = comp.getRenderElementCount();
            let vIndex = vertexOffset;
            for (let i = 0; i < len; i++) {
                let charInfo = comp.getRenderElement(i);
                if (!charInfo || !charInfo.visible) {
                    return;
                }
                if (shadow) {
                    charInfo = charInfo.shadowChar;
                    if (!charInfo) {
                        continue;
                    }
                }
                for (let vi = 0; vi < charInfo.vertexData.length; vi++) {
                    const v = charInfo.vertexData[vi];
                    vec3_temp.set(v.rx, v.ry, 0);
                    cc_15.Vec3.transformMat4(vec3_temp, vec3_temp, _worldMatrix);
                    let idx = floatStride * vIndex;
                    vData[idx] = vec3_temp.x;
                    vData[idx + 1] = vec3_temp.y;
                    vData[idx + 2] = vec3_temp.z;
                    if (vIndex % 4 == 0) {
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
            }
            meshBuffer.setDirty();
            return vIndex;
        }
        static updateUVs(comp) {
            const chunk = comp.renderData.chunk;
            if (!chunk) {
                return;
            }
            let vertexOffset = 0;
            if (this._needCheckShdaow(comp)) {
                vertexOffset = this._updateUVs(comp, true);
            }
            this._updateUVs(comp, false, vertexOffset);
        }
        static _needCheckShdaow(comp) {
            if (comp.rich) {
                return true;
            }
            return comp.style.shadow > 0.0001;
        }
        static _updateUVs(comp, shadow = false, vertexOffset = 0) {
            const chunk = comp.renderData.chunk;
            const vData = chunk.vb;
            const len = comp.getRenderElementCount();
            const floatStride = comp.renderData.floatStride;
            let vIndex = vertexOffset;
            for (let i = 0; i < len; i++) {
                let charInfo = comp.getRenderElement(i);
                if (!charInfo || !charInfo.visible) {
                    return;
                }
                if (shadow) {
                    charInfo = charInfo.shadowChar;
                    if (!charInfo) {
                        continue;
                    }
                }
                for (let vi = 0; vi < charInfo.vertexData.length; vi++) {
                    const v = charInfo.vertexData[vi];
                    let idx = floatStride * vIndex;
                    // uv
                    vData[idx + 3] = v.u;
                    vData[idx + 4] = v.v;
                    vData[idx + 5] = v.u1;
                    vData[idx + 6] = v.v1;
                    vIndex++;
                }
            }
            return vIndex;
        }
        static updateColor(comp, charInfo, colors) {
            const chunk = comp.renderData.chunk;
            if (!chunk) {
                return;
            }
            if (this._needCheckShdaow(comp)) {
                this._updateColor(comp, charInfo, colors, true);
            }
            this._updateColor(comp, charInfo, colors);
        }
        static _updateColor(comp, charInfo, colors, shadow = false) {
            if (!charInfo || !charInfo.visible) {
                return;
            }
            const chunk = comp.renderData.chunk;
            const vData = chunk.vb;
            const vertexOffset = comp.renderData.floatStride;
            let style = charInfo.style;
            let isArray = Array.isArray(colors);
            for (let vi = 0; vi < charInfo.vertexData.length; vi++) {
                let vIndex = vi + charInfo.index * 4;
                let idx = vertexOffset * vIndex;
                // color   
                let color = null;
                if (shadow) {
                    color = style.shadowRGBA;
                }
                else {
                    color = !!colors ? (isArray ? colors[vi] : colors) : style.getFillColor(vi % 4);
                }
                vData[idx + 7] = color.x;
                vData[idx + 8] = color.y;
                vData[idx + 9] = color.z;
                vData[idx + 10] = color.w;
            }
        }
        static updateColors(comp) {
            const chunk = comp.renderData.chunk;
            if (!chunk) {
                return;
            }
            let vertexOffset = 0;
            if (this._needCheckShdaow(comp)) {
                vertexOffset = this._updateColors(comp, true);
            }
            this._updateColors(comp, false, vertexOffset);
        }
        static _updateColors(comp, shadow = false, vertexOffset = 0) {
            const chunk = comp.renderData.chunk;
            const vData = chunk.vb;
            const len = comp.getRenderElementCount();
            const floatStride = comp.renderData.floatStride;
            let vIndex = vertexOffset;
            for (let i = 0; i < len; i++) {
                let charInfo = comp.getRenderElement(i);
                if (!charInfo || !charInfo.visible) {
                    return;
                }
                if (shadow) {
                    charInfo = charInfo.shadowChar;
                    if (!charInfo) {
                        continue;
                    }
                }
                let style = charInfo.style;
                for (let vi = 0; vi < charInfo.vertexData.length; vi++) {
                    let v = charInfo.vertexData[vi];
                    let idx = floatStride * vIndex;
                    // color   
                    let color = null;
                    if (v.type == ETMQuadType_4.ETMQuadType.Shadow) {
                        color = style.shadowRGBA;
                    }
                    else {
                        color = style.getFillColor(vi % 4);
                    }
                    vData[idx + 7] = color.x;
                    vData[idx + 8] = color.y;
                    vData[idx + 9] = color.z;
                    vData[idx + 10] = color.w;
                    vIndex++;
                }
            }
            return vIndex;
        }
        static updateOthers(comp) {
            const chunk = comp.renderData.chunk;
            if (!chunk) {
                return;
            }
            let vertexOffset = 0;
            if (this._needCheckShdaow(comp)) {
                vertexOffset = this._updateOthers(comp, true);
            }
            this._updateOthers(comp, false, vertexOffset);
        }
        static _updateOthers(comp, shadow = false, vertexOffset = 0) {
            const chunk = comp.renderData.chunk;
            const vData = chunk.vb;
            const len = comp.getRenderElementCount();
            let vIndex = vertexOffset;
            for (let i = 0; i < len; i++) {
                let charInfo = comp.getRenderElement(i);
                if (!charInfo) {
                    return;
                }
                if (shadow) {
                    charInfo = charInfo.shadowChar;
                    if (!charInfo) {
                        continue;
                    }
                }
                const char = charInfo.char;
                const floatStride = comp.renderData.floatStride;
                let style = charInfo.style;
                const v0 = charInfo.vertexData[0];
                for (let vi = 0; vi < charInfo.vertexData.length; vi++) {
                    let v = charInfo.vertexData[vi];
                    let idx = floatStride * vIndex;
                    // channelId,fill,stroke,strokeBlur
                    vData[idx + 11] = (char === null || char === void 0 ? void 0 : char.cid) || 0;
                    vData[idx + 12] = style.dilate * settings_1.TextMeshSettings.dilateScale;
                    // strokeColor
                    let color = null;
                    if (shadow) {
                        vData[idx + 12] -= style.shadowBlur;
                        if (vData[idx + 12] < 0) {
                            vData[idx + 12] = 0.0001;
                        }
                        color = style.shadowRGBA;
                        vData[idx + 13] = style.shadow;
                        vData[idx + 14] = style.shadowBlur;
                    }
                    else {
                        color = style.strokeRGBA;
                        vData[idx + 13] = style.stroke;
                        vData[idx + 14] = style.strokeBlur;
                    }
                    vData[idx + 15] = color.x;
                    vData[idx + 16] = color.y;
                    vData[idx + 17] = color.z;
                    vData[idx + 18] = color.w;
                    vIndex++;
                }
            }
            return vIndex;
        }
        static updateVertexData(comp) {
            if (!comp.renderData || !comp.font) {
                return;
            }
            comp.node.updateWorldTransform();
            if (comp.typeSet) {
                let len = 0;
                const layout = comp.layoutResult;
                if (comp.backgroundColor.a > 0) {
                    len = comp.backgroundInfos.length;
                    for (let i = 0; i < len; i++) {
                        this.refreshBackgroundInfo(comp, i, layout);
                    }
                }
                len = comp.charInfos.length;
                for (let i = 0; i < len; i++) {
                    let char = comp.charInfos[i];
                    if (!char.visibleChar) {
                        continue;
                    }
                    this.refreshCharInfo(comp, i, char);
                }
                if (comp.font.strikeThickness > 0) {
                    len = comp.strikeInfos.length;
                    for (let i = 0; i < len; i++) {
                        this.refreshStrikeInfo(comp, i, layout);
                    }
                }
                if (comp.font.underLineThickness > 0) {
                    len = comp.underLineInfos.length;
                    for (let i = 0; i < len; i++) {
                        this.refreshUnderlineInfo(comp, i, layout);
                    }
                }
                if (comp.maskColor.a > 0) {
                    len = comp.maskInfos.length;
                    for (let i = 0; i < len; i++) {
                        this.refreshMaskInfo(comp, i, layout);
                    }
                }
            }
            // comp.renderData.resize(comp.renderInfos.length, comp.renderInfos.length / 4 * 6);
        }
        static appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo, uvs) {
            const style = charInfo.style;
            if (style.shadow > 0.0001) {
                const fontSize = style.fontSize;
                let shadowCharInfo = charInfo.shadowChar;
                if (!shadowCharInfo) {
                    shadowCharInfo = charInfo.shadowChar = (0, CharInfo_3.getCharInfoFromPool)();
                    shadowCharInfo.copyFrom(charInfo);
                }
                this.appendQuad(comp, width, height, offsetX + style.shadowOffsetX * settings_1.TextMeshSettings.shadowScale, offsetY - style.shadowOffsetY * settings_1.TextMeshSettings.shadowScale, skewFactor, shadowCharInfo, uvs || charInfo.char.uvs, ETMQuadType_4.ETMQuadType.Shadow);
            }
        }
        static refreshCharInfo(comp, index, charInfo) {
            const width = charInfo.realWidth;
            const height = charInfo.realHeight;
            const offsetX = charInfo.x;
            const offsetY = charInfo.baseY + charInfo.y;
            const italic = charInfo.style.italic;
            const skewFactor = italic ? Const_2.ItalicSkewFactor : 0;
            this.appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo);
            this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo, charInfo.char.uvs, ETMQuadType_4.ETMQuadType.Char);
        }
        static _clipX(comp, value, min, max, width, isMin) {
            let tr = comp.uiTransform;
            this._clipInfo.xy = value;
            this._clipInfo.len = width;
            let dist = max - min;
            if (isMin) {
                if (value < 0) {
                    this._clipInfo.uv = min - dist * value / width;
                    this._clipInfo.xy = 0;
                    this._clipInfo.len += value;
                }
                else {
                    this._clipInfo.uv = min;
                }
            }
            else {
                let rxy = value + width;
                let size = tr.width;
                if (rxy > size) {
                    let dw = rxy - size;
                    this._clipInfo.uv = max - dist * dw / width;
                    this._clipInfo.len -= dw;
                }
                else {
                    this._clipInfo.uv = max;
                }
            }
            return this._clipInfo;
        }
        static _clipY(comp, value, min, max, height, isMin) {
            let tr = comp.uiTransform;
            this._clipInfo.xy = value;
            this._clipInfo.len = height;
            let dist = max - min;
            if (isMin) {
                let top = value + height;
                if (top > 0) {
                    this._clipInfo.uv = min + dist * top / height;
                    this._clipInfo.len -= top;
                }
                else {
                    this._clipInfo.uv = min;
                }
            }
            else {
                let size = tr.height;
                if (value < -size) {
                    let dh = size + value;
                    this._clipInfo.uv = max + dist * dh / height;
                    this._clipInfo.xy = -size;
                    this._clipInfo.len += dh;
                }
                else {
                    this._clipInfo.uv = max;
                }
            }
            return this._clipInfo;
        }
        static appendQuad(comp, width, height, offsetX, offsetY, skewFactor, charInfo, uvs, type = ETMQuadType_4.ETMQuadType.Char) {
            const renderData = comp.renderData;
            if (!renderData) {
                return;
            }
            let uv0 = uvs[0];
            let uv1 = uvs[1];
            let uv2 = uvs[2];
            let uv3 = uvs[3];
            let uv4 = uvs[4];
            let uv5 = uvs[5];
            let uv6 = uvs[6];
            let uv7 = uvs[7];
            if (charInfo.slot) {
                uv0 = uv1 = uv2 = uv3 = uv4 = uv5 = uv6 = uv7 = 0;
            }
            else {
                if (comp.overflow == types_4.ETextOverflow.Clamp) {
                    offsetX += comp.localOffsetX;
                    offsetY += comp.localOffsetY;
                    let tr = comp.uiTransform;
                    // // left
                    let clip = this._clipX(comp, offsetX, uvs[0], uvs[2], width, true);
                    offsetX = clip.xy;
                    width = clip.len;
                    uv0 = uv4 = clip.uv;
                    if (width <= 0) {
                        return;
                    }
                    // // right
                    clip = this._clipX(comp, offsetX, uvs[0], uvs[2], width, false);
                    width = clip.len;
                    uv2 = uv6 = clip.uv;
                    if (width <= 0) {
                        return;
                    }
                    // top
                    clip = this._clipY(comp, offsetY, uvs[1], uvs[5], height, true);
                    height = clip.len;
                    uv1 = uv3 = clip.uv;
                    if (height <= 0) {
                        return;
                    }
                    // bottom
                    clip = this._clipY(comp, offsetY, uvs[1], uvs[5], height, false);
                    height = clip.len;
                    offsetY = clip.xy;
                    uv5 = uv7 = clip.uv;
                    if (height <= 0) {
                        return;
                    }
                    offsetX -= comp.localOffsetX;
                    offsetY -= comp.localOffsetY;
                }
            }
            offsetX += comp.globalOffsetX;
            offsetY += comp.globalOffsetY;
            renderData.dataLength += 4;
            renderData.resize(renderData.dataLength, renderData.dataLength / 2 * 3);
            // console.log('renderData', renderData.dataLength, renderData.vertexCount);
            const a = 1;
            const b = 0;
            const c = skewFactor;
            const d = 1;
            const tx = -skewFactor;
            const ty = 0;
            let w0 = 0;
            let w1 = 0;
            let h0 = 0;
            let h1 = 0;
            w1 = 0;
            w0 = w1 + width;
            h0 = 0;
            h1 = h1 + height;
            // left bottom
            let x0 = (a * w1) + (c * h1) + tx + offsetX;
            let y0 = (d * h1) + (b * w1) + ty + offsetY;
            // right bottom
            let x1 = (a * w0) + (c * h1) + tx + offsetX;
            let y1 = (d * h1) + (b * w0) + ty + offsetY;
            // left top
            let x2 = (a * w1) + (c * h0) + tx + offsetX;
            let y2 = (d * h0) + (b * w1) + ty + offsetY;
            // right top
            let x3 = (a * w0) + (c * h0) + tx + offsetX;
            let y3 = (d * h0) + (b * w0) + ty + offsetY;
            // left bottom
            let vt = charInfo.addVertex();
            vt.rx = vt.x = x0;
            vt.ry = vt.y = y0;
            vt.u = uv0;
            vt.v = uv1;
            vt.u1 = 0;
            vt.v1 = 0;
            vt.type = type;
            // right bottom
            vt = charInfo.addVertex();
            vt.rx = vt.x = x1;
            vt.ry = vt.y = y1;
            vt.u = uv2;
            vt.v = uv3;
            vt.u1 = 1;
            vt.v1 = 0;
            vt.type = type;
            // left top
            vt = charInfo.addVertex();
            vt.rx = vt.x = x2;
            vt.ry = vt.y = y2;
            vt.u = uv4;
            vt.v = uv5;
            vt.u1 = 0;
            vt.v1 = 1;
            vt.type = type;
            // right top
            vt = charInfo.addVertex();
            vt.rx = vt.x = x3;
            vt.ry = vt.y = y3;
            vt.u = uv6;
            vt.v = uv7;
            vt.u1 = 1;
            vt.v1 = 1;
            vt.type = type;
        }
        static refreshUnderlineInfo(comp, index, layout) {
            const font = comp.font;
            let underlineInfo = comp.underLineInfos[index];
            let startChar = comp.charInfos[underlineInfo.startIndex];
            let width = underlineInfo.length;
            let height = Math.max(4, startChar.style.fontSize * font.underLineThickness);
            let offsetX = startChar.x;
            // 不能添加offsetY,否则位置为出现跳动
            let offsetY = startChar.baseY + startChar.y - comp.font.underLineOffset + height * 0.5;
            let skewFactor = 0;
            // if(startChar.style.scriptType == EScriptType.SuperScript) {
            //     offsetY -= (startChar.style.fontSize - startChar.style.realFontSize);
            // }
            let uvs = underlineInfo.charInfo.char.uvs;
            // if(underlineInfo.endIndex - underlineInfo.startIndex > 0) {
            // 圆形边框
            //     let uDist = uvs[2] - uvs[0];
            //     let vDist = uvs[5] - uvs[1];
            //     let newUVs = new Float32Array(uvs.slice());
            //     newUVs[2] = newUVs[6] = uvs[0] + uDist * 0.4;  
            //     let endWidth = Math.min(width * 0.4, startChar.realWidth*0.4);
            //     let startX = offsetX;
            //     this.appendQuad(comp, endWidth, height, startX, offsetY, skewFactor, underlineInfo.charInfo, newUVs);
            //     newUVs[0] = newUVs[4] = newUVs[2];
            //     newUVs[2] = newUVs[6] = uvs[0] + uDist * 0.6;
            //     let centWidth = width - endWidth * 2;  
            //     startX += endWidth;  
            //     this.appendQuad(comp, centWidth, height, startX, offsetY, skewFactor, underlineInfo.charInfo, newUVs);
            //     newUVs[0] = newUVs[4] = newUVs[2]; 
            //     newUVs[2] = newUVs[6] = uvs[2];    
            //     startX += centWidth;
            //     this.appendQuad(comp, endWidth, height, startX, offsetY, skewFactor, underlineInfo.charInfo, newUVs);
            // }else{   
            // 方形边框
            let uDist = uvs[2] - uvs[0];
            RECT_UVS[1] = uvs[1];
            RECT_UVS[3] = uvs[3];
            RECT_UVS[5] = uvs[5];
            RECT_UVS[7] = uvs[7];
            RECT_UVS[0] = RECT_UVS[4] = uvs[0] + uDist * 0.4;
            RECT_UVS[2] = RECT_UVS[6] = uvs[0] + uDist * 0.6;
            this.appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, underlineInfo.charInfo, RECT_UVS);
            this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, underlineInfo.charInfo, RECT_UVS, ETMQuadType_4.ETMQuadType.UnderLine);
            // }
        }
        static refreshStrikeInfo(comp, index, layout) {
            const font = comp.font;
            let strikeInfo = comp.strikeInfos[index];
            let startChar = comp.charInfos[strikeInfo.startIndex];
            let width = strikeInfo.length;
            let height = Math.max(4, startChar.style.fontSize * font.strikeThickness);
            let offsetX = startChar.x + startChar.offsetX;
            let baseY = startChar.baseY + startChar.y + strikeInfo.height * 0.5;
            let offsetY = baseY - comp.font.strikeOffset;
            let skewFactor = 0;
            let uvs = strikeInfo.charInfo.char.uvs;
            // if(strikeInfo.endIndex - strikeInfo.startIndex > 0) {
            //     let uDist = uvs[2] - uvs[0];
            //     let vDist = uvs[5] - uvs[1];
            //     let newUVs = new Float32Array(uvs.slice());
            //     newUVs[2] = newUVs[6] = uvs[0] + uDist * 0.4;  
            //     let endWidth = Math.min(width * 0.4, startChar.realWidth*0.4);
            //     let startX = offsetX;
            //     this.appendQuad(comp, endWidth, height, startX, offsetY, skewFactor, strikeInfo.charInfo, newUVs);
            //     newUVs[0] = newUVs[4] = newUVs[2];
            //     newUVs[2] = newUVs[6] = uvs[0] + uDist * 0.6;
            //     let centWidth = width - endWidth * 2;  
            //     startX += endWidth;  
            //     this.appendQuad(comp, centWidth, height, startX, offsetY, skewFactor, strikeInfo.charInfo, newUVs);
            //     newUVs[0] = newUVs[4] = newUVs[2]; 
            //     newUVs[2] = newUVs[6] = uvs[2];    
            //     startX += centWidth;
            //     this.appendQuad(comp, endWidth, height, startX, offsetY, skewFactor, strikeInfo.charInfo, newUVs);
            // }else{  
            // 方形边框
            let uDist = uvs[2] - uvs[0];
            RECT_UVS[1] = uvs[1];
            RECT_UVS[3] = uvs[3];
            RECT_UVS[5] = uvs[5];
            RECT_UVS[7] = uvs[7];
            RECT_UVS[0] = RECT_UVS[4] = uvs[0] + uDist * 0.4;
            RECT_UVS[2] = RECT_UVS[6] = uvs[0] + uDist * 0.6;
            this.appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, strikeInfo.charInfo, RECT_UVS);
            this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, strikeInfo.charInfo, RECT_UVS, ETMQuadType_4.ETMQuadType.DeleteLine);
            // }
        }
        static getRectUVs(uvs) {
            let uDist = uvs[2] - uvs[0];
            let vDist = uvs[5] - uvs[1];
            let leftU = uvs[0] + uDist * 0.3;
            let topU = uvs[1] + vDist * 0.3;
            RECT_UVS[0] = RECT_UVS[4] = leftU;
            RECT_UVS[2] = RECT_UVS[6] = leftU + uDist * 0.1;
            RECT_UVS[1] = RECT_UVS[5] = topU;
            RECT_UVS[3] = RECT_UVS[7] = topU + vDist * 0.1;
            return RECT_UVS;
        }
        static refreshBackgroundInfo(comp, index, layout) {
            let backgroundInfo = comp.backgroundInfos[index];
            let startChar = comp.charInfos[backgroundInfo.startIndex];
            let width = backgroundInfo.length;
            let height = backgroundInfo.height;
            let offsetX = startChar.x + startChar.offsetX;
            let offsetY = startChar.startY - backgroundInfo.height;
            let skewFactor = 0;
            let uvs = backgroundInfo.charInfo.char.uvs;
            uvs = this.getRectUVs(uvs);
            this.appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, backgroundInfo.charInfo, uvs);
            this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, backgroundInfo.charInfo, uvs, ETMQuadType_4.ETMQuadType.Background);
        }
        static refreshMaskInfo(comp, index, layout) {
            let maskInfo = comp.maskInfos[index];
            let startChar = comp.charInfos[maskInfo.startIndex];
            let width = maskInfo.length;
            let height = maskInfo.height;
            let offsetX = startChar.x + startChar.offsetX;
            let offsetY = startChar.startY - maskInfo.height;
            let skewFactor = 0;
            let uvs = maskInfo.charInfo.char.uvs;
            uvs = this.getRectUVs(uvs);
            this.appendShadowQuad(comp, width, height, offsetX, offsetY, skewFactor, maskInfo.charInfo, uvs);
            this.appendQuad(comp, width, height, offsetX, offsetY, skewFactor, maskInfo.charInfo, uvs, ETMQuadType_4.ETMQuadType.Mask);
        }
        static updateRenderData(comp, render) {
            if (!comp.renderData || !comp.font) {
                return;
            }
            if (comp.renderData.vertDirty) {
                if (comp.dirtyFlag == 0) {
                    return;
                }
                this.updateVertexData(comp);
                this.updateUVs(comp);
                this.updateColors(comp);
                this.updateOthers(comp);
                comp.updateMaterial();
                // if (JSB) {
                //     comp.renderEntity.nativeObj["vertDirty"] = true;
                //     // comp.renderData["renderDrawInfo"].fillRender2dBuffer(comp.renderData.data);
                // }
                comp.renderData.vertDirty = false;
                comp.markForUpdateRenderData(false);
                // comp.clearDirtyFlag();
                // console.log("updateRenderData");
            }
        }
    }
    exports.TextMeshAssembler = TextMeshAssembler;
    TextMeshAssembler._clipInfo = {
        xy: 0,
        uv: 0,
        len: 0,
    };
    var RECT_UVS = new Float32Array(8);
});
define("TextMesh/label/events", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.click_char_event = exports.EventClickChar = void 0;
    class EventClickChar {
    }
    exports.EventClickChar = EventClickChar;
    exports.click_char_event = new EventClickChar;
});
define("TextMesh/label/StyleManager", ["require", "exports", "cc", "TextMesh/label/TextStyle"], function (require, exports, cc_16, TextStyle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleManager = void 0;
    class StyleManager {
        static _onStyleChanged() {
            cc_16.game.emit(StyleManager.TMF_STYLE_CHANGED);
        }
        static removeAll() {
            this._styles = {};
            this._onStyleChanged();
        }
        static registByStyle(key, style) {
            this._styles[key] = style;
            this._onStyleChanged();
        }
        static registByStyles(key, style) {
            for (let i = 0; i < key.length; i++) {
                this._styles[key[i]] = style[i];
            }
            this._onStyleChanged();
        }
        static registByKeyJson(key, style) {
            let textStyle = new TextStyle_1.TextStyle();
            try {
                textStyle.parseFromJsonStr(style);
                this._styles[key] = textStyle;
                this._onStyleChanged();
            }
            catch (e) {
                console.error(e);
            }
        }
        static registByJson(styles) {
            try {
                let json = JSON.parse(styles);
                for (let key in json) {
                    let textStyle = new TextStyle_1.TextStyle();
                    textStyle.parseFromJson(json[key]);
                    this._styles[key] = textStyle;
                }
                this._onStyleChanged();
            }
            catch (e) {
                console.error(e);
            }
        }
        static getStyle(key) {
            return this._styles[key];
        }
    }
    exports.StyleManager = StyleManager;
    StyleManager.TMF_STYLE_CHANGED = "tmf_style_changed";
    StyleManager._styles = {};
});
define("TextMesh/label/SlotConnector", ["require", "exports", "cc"], function (require, exports, cc_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlotConnector = void 0;
    const { ccclass, property } = cc_17._decorator;
    let SlotConnector = class SlotConnector extends cc_17.Component {
        constructor() {
            super(...arguments);
            this.labelNode = null;
        }
    };
    __decorate([
        property(cc_17.Node)
    ], SlotConnector.prototype, "labelNode", void 0);
    SlotConnector = __decorate([
        ccclass('SlotConnector')
    ], SlotConnector);
    exports.SlotConnector = SlotConnector;
});
define("TextMesh/font/FontManager", ["require", "exports", "cc", "TextMesh/font/TMFont", "cc/env"], function (require, exports, cc_18, TMFont_2, env_4) {
    "use strict";
    var FontManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontManager = exports.FontInfo = exports.RegistFontInfo = void 0;
    const { ccclass, property, executeInEditMode, executionOrder, disallowMultiple } = cc_18._decorator;
    let RegistFontInfo = class RegistFontInfo {
        constructor() {
            this._fontName = "";
            this._fontData = null;
            this._material = null;
        }
        get fontName() {
            return this._fontName;
        }
        set fontName(value) {
            if (this._fontName === value) {
                return;
            }
            FontManager.instance.removeFont(this._fontName);
            this._fontName = value;
            if (env_4.EDITOR && this.canLoad()) {
                FontManager.instance._loadFont(this.fontName);
            }
        }
        get fontData() {
            return this._fontData;
        }
        set fontData(value) {
            if (this._fontData === value) {
                return;
            }
            FontManager.instance.removeFont(this._fontName);
            this._fontData = value;
            if (env_4.EDITOR && this.canLoad()) {
                FontManager.instance._loadFont(this.fontName);
            }
        }
        get material() {
            return this._material;
        }
        set material(value) {
            if (this._material === value) {
                return;
            }
            this._material = value;
            if (env_4.EDITOR && this.canLoad()) {
                FontManager.instance._loadFont(this.fontName);
            }
        }
        canLoad() {
            return this._fontName && this._fontData;
        }
    };
    __decorate([
        property({ visible: false })
    ], RegistFontInfo.prototype, "_fontName", void 0);
    __decorate([
        property({ type: cc_18.CCString })
    ], RegistFontInfo.prototype, "fontName", null);
    __decorate([
        property({ type: cc_18.BufferAsset, visible: false })
    ], RegistFontInfo.prototype, "_fontData", void 0);
    __decorate([
        property({ type: cc_18.BufferAsset })
    ], RegistFontInfo.prototype, "fontData", null);
    __decorate([
        property({ type: cc_18.Material, visible: false })
    ], RegistFontInfo.prototype, "_material", void 0);
    __decorate([
        property({ type: cc_18.Material })
    ], RegistFontInfo.prototype, "material", null);
    RegistFontInfo = __decorate([
        ccclass("RegistFontInfo")
    ], RegistFontInfo);
    exports.RegistFontInfo = RegistFontInfo;
    class FontInfo {
    }
    exports.FontInfo = FontInfo;
    let FontManager = FontManager_1 = class FontManager extends cc_18.Component {
        constructor() {
            super(...arguments);
            this._fontMap = new Map();
            this._loadingMap = new Map();
            this._registFontMap = new Map();
            this._registFonts = [];
        }
        static get instance() {
            return FontManager_1._instance;
        }
        static async create(fonts) {
            let node = new cc_18.Node();
            node.name = "FontManager";
            let fontManager = node.addComponent(FontManager_1);
            cc_18.director.getScene().addChild(node);
            let loadTasks = fonts.map((font) => {
                let task = new Promise((resolve) => {
                    const bundle = cc_18.assetManager.getBundle(font.package);
                    bundle.load([font.font, font.material], null, async (err, assets) => {
                        if (err) {
                            console.error(err);
                            resolve(null);
                            return;
                        }
                        let info = new RegistFontInfo();
                        info.fontName = font.fontName;
                        info.fontData = bundle.get(font.font);
                        info.material = bundle.get(font.material);
                        fontManager._registFonts.push(info);
                        fontManager.refresh();
                        await fontManager.loadAllRegistFont();
                        resolve(null);
                    });
                });
                return task;
            });
            await Promise.all(loadTasks);
            return fontManager;
        }
        onLoad() {
            if (!env_4.EDITOR) {
                if (FontManager_1._instance) {
                    return;
                }
                cc_18.game.addPersistRootNode(this.node);
            }
            FontManager_1._instance = this;
            this.refresh();
            this.loadAllRegistFont();
        }
        onFocusInEditor() {
            FontManager_1._instance = this;
        }
        refresh() {
            this._registFontMap.clear();
            this._registFonts.forEach((info) => {
                this._registFontMap.set(info.fontName, info);
            });
        }
        async loadAllRegistFont() {
            let loadTask = [];
            for (let fontName of this._registFontMap.keys()) {
                if (env_4.EDITOR) {
                    if (!fontName || !this._fontMap.get(fontName)) {
                        continue;
                    }
                }
                loadTask.push(this.loadFont(fontName));
            }
            await Promise.all(loadTask);
        }
        getFont(fontName) {
            return this._fontMap.get(fontName);
        }
        async getFontAsync(fontName) {
            if (!fontName) {
                return null;
            }
            if (this._fontMap.get(fontName)) {
                return this._fontMap.get(fontName);
            }
            return await this.loadFont(fontName);
        }
        async loadFont(fontName, fontData = null, material) {
            if (!fontName) {
                return;
            }
            if (this._loadingMap.get(fontName)) {
                await new Promise((resolve) => {
                    let callbacks = this._loadingMap.get(fontName);
                    callbacks.push(resolve);
                });
            }
            if (this._fontMap.get(fontName)) {
                return this._fontMap.get(fontName);
            }
            let info = this._registFontMap.get(fontName);
            fontData = fontData || (info === null || info === void 0 ? void 0 : info.fontData);
            material = material || (info === null || info === void 0 ? void 0 : info.material);
            if (!fontData) {
                console.error(`font ${fontName} not found`);
                return null;
            }
            this._loadingMap.set(fontName, []);
            let tmf = await TMFont_2.TMFont.deserializeAsync(fontData, material);
            this._fontMap.set(fontName, tmf);
            let callbacks = this._loadingMap.get(fontName);
            this._loadingMap.delete(fontName);
            callbacks.forEach((callback) => {
                callback(tmf);
            });
            return tmf;
        }
        async _loadFont(fontName) {
            if (env_4.EDITOR) {
                this.refresh();
            }
            let info = this._registFontMap.get(fontName);
            if (!info || !info.fontData) {
                console.error(`font ${fontName} not found`);
                return;
            }
            return await this.loadFont(fontName, info.fontData, info.material);
        }
        removeFont(fontName) {
            this._fontMap.delete(fontName);
        }
        onDestroy() {
            cc_18.game.removePersistRootNode(this.node);
            FontManager_1._instance = null;
        }
        async showFontTexture(fontName) {
            let font = FontManager_1.instance.getFont(fontName);
            if (!font) {
                return;
            }
            //@ts-ignore
            let canvs = cc_18.director.getScene().getChildByName("Canvas");
            if (!canvs) {
                console.error("Canvas not found");
                return;
            }
            let sprite = canvs.getChildByName("FontSprite");
            if (!sprite) {
                sprite = new cc_18.Node("FontSprite");
                sprite.layer = cc_18.Layers.Enum.UI_2D;
                canvs.addChild(sprite);
                sprite.setPosition(0, 0);
                let size = cc_18.view.getVisibleSize();
                let utr = sprite.addComponent(cc_18.UITransform);
                let sp = sprite.addComponent(cc_18.Sprite);
                sp.spriteFrame = new cc_18.SpriteFrame();
                sp.sizeMode = cc_18.Sprite.SizeMode.CUSTOM;
                sp.spriteFrame.texture = font.fontData.texture;
                let width = Math.min(size.width, size.height);
                utr.contentSize = new cc_18.Size(width, width);
                sprite.on(cc_18.Node.EventType.TOUCH_END, (event) => {
                    sprite.active = false;
                });
            }
            else {
                sprite.active = true;
            }
        }
    };
    FontManager._instance = null;
    __decorate([
        property({ type: [RegistFontInfo], visible: true })
    ], FontManager.prototype, "_registFonts", void 0);
    FontManager = FontManager_1 = __decorate([
        ccclass("FontManager"),
        executeInEditMode,
        disallowMultiple,
        executionOrder(-100)
    ], FontManager);
    exports.FontManager = FontManager;
});
define("TextMesh/label/TextMeshLabel", ["require", "exports", "cc", "TextMesh/font/FontUtils", "TextMesh/vertex/TMRenderData", "TextMesh/vertex/VertexFormat", "TextMesh/typeset/TypeSetFactory", "TextMesh/utils/dfs", "TextMesh/utils/UBBParser", "TextMesh/label/TextMeshAssembler", "TextMesh/label/TextStyle", "TextMesh/label/types", "TextMesh/label/CharInfo", "TextMesh/label/StyleMapper", "TextMesh/label/LayoutTypes", "TextMesh/utils/ResManger", "TextMesh/label/events", "cc/env", "TextMesh/label/StyleManager", "TextMesh/label/SlotConnector", "TextMesh/font/FontManager", "TextMesh/settings"], function (require, exports, cc_19, FontUtils_1, TMRenderData_2, VertexFormat_1, TypeSetFactory_1, dfs_1, UBBParser_1, TextMeshAssembler_1, TextStyle_2, types_5, CharInfo_4, StyleMapper_2, LayoutTypes_1, ResManger_2, events_1, env_5, StyleManager_1, SlotConnector_1, FontManager_2, settings_2) {
    "use strict";
    var TextMeshLabel_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMeshLabel = exports.EDirtyFlag = void 0;
    dfs_1 = __importDefault(dfs_1);
    const { ccclass, property, executeInEditMode, executionOrder } = cc_19._decorator;
    const vec2_temp = (0, cc_19.v2)();
    var EDirtyFlag;
    (function (EDirtyFlag) {
        EDirtyFlag[EDirtyFlag["None"] = 0] = "None";
        EDirtyFlag[EDirtyFlag["Text"] = 2] = "Text";
        EDirtyFlag[EDirtyFlag["Style"] = 4] = "Style";
        EDirtyFlag[EDirtyFlag["Layout"] = 8] = "Layout";
        EDirtyFlag[EDirtyFlag["Property"] = 16] = "Property";
        EDirtyFlag[EDirtyFlag["All"] = 30] = "All";
    })(EDirtyFlag = exports.EDirtyFlag || (exports.EDirtyFlag = {}));
    const quat = new cc_19.Quat();
    let TextMeshLabel = TextMeshLabel_1 = class TextMeshLabel extends cc_19.UIRenderer {
        constructor() {
            super(...arguments);
            this._slotCreateHandlers = {};
            this._slotSpriteFrameCreateHandler = null;
            this._saveTag = 0;
            this._fontName = "Arial";
            this._string = 'text mesh';
            this._rich = false;
            this._direction = types_5.ETextDirection.Horizontal;
            // @property({ visible: false, serializable: true})
            // protected _rtl = false;
            this._horizontalAlign = types_5.ETextHorizontalAlign.Center;
            this._verticalAlign = types_5.ETextVerticalAlign.Middle;
            this._overflow = types_5.ETextOverflow.None;
            this._multiline = false;
            this._enableItalic = false;
            this._enableUnderline = false;
            this._enableStrike = false;
            this._enableBackground = false;
            this._enableMask = false;
            this._lineSpace = 5;
            this._letterSpace = 0;
            this._enableColorRT = false;
            this._colorRT = new cc_19.Color(255, 255, 255, 255);
            this._enableColorRB = false;
            this._colorRB = new cc_19.Color(255, 255, 255, 255);
            this._enableColorLT = false;
            this._colorLT = new cc_19.Color(255, 255, 255, 255);
            this._enableColorLB = false;
            this._colorLB = new cc_19.Color(255, 255, 255, 255);
            this._backgroundColor = new cc_19.Color(255, 255, 255, 255);
            this._maskColor = new cc_19.Color(255, 255, 255, 128);
            this._strokeColor = new cc_19.Color(0, 0, 0, 255);
            this._shadow = 0;
            this._shadowOffsetX = 0;
            this._shadowOffsetY = 0;
            this._shadowBlur = 0.1;
            this._shadowColor = new cc_19.Color(0, 0, 0, 255);
            this._handleTouchEvent = false;
            this._autoWarp = true;
            this._lineHeight = 40;
            this._fixedLineHeight = false;
            this._padding = new types_5.Margin;
            this._dilate = 0.25;
            this._stroke = 0.0;
            this._strokeBlur = 0.1;
            this._aspect = 1;
            this._charVisibleRatio = 1;
            this._equalWidth = false;
            this._overlayTexture = null;
            this._enableGlow = false;
            this._glowColor = new cc_19.Color(255, 255, 255, 255);
            this._glowInner = 0.0;
            this._glowOuter = 0.0;
            this._glowPower = 0.0;
            this._breakWestern = false;
            this._enableBold = false;
            this._useFontPreset = settings_2.TextMeshSettings.defulatUseFontPreset;
            this._style = new TextStyle_2.TextStyle();
            this._clicks = [];
            this._slots = [];
            this.globalOffsetX = 0;
            this.globalOffsetY = 0;
            this.localOffsetX = 0;
            this.localOffsetY = 0;
            this.slotOffsetX = 0;
            this.slotOffsetY = 0;
            this._dirtyFlag = EDirtyFlag.None;
            this._ready = false;
            this._fontSize = 24;
            this._underLineInfos = [];
            this._strikeInfos = [];
            this._backgroundInfos = [];
            this._maskInfos = [];
            this._charInfos = [];
            this.slotsContainer = null;
        }
        get ready() {
            return this._ready;
        }
        get slots() {
            return this._slots;
        }
        incrSaveTag() {
            this._saveTag++;
            this._saveTag = this._saveTag % 100000;
        }
        get style() {
            return this._style;
        }
        get layoutResult() {
            return this._layoutResult;
        }
        get font() {
            return this._font;
        }
        /**
         * @en
         * Font name.
         *
         * @zh
         * 字体名称。
         */
        get fontName() {
            return this._fontName;
        }
        set fontName(value) {
            if (this._fontName === value) {
                return;
            }
            this._fontName = value;
            if (value) {
                if (!FontManager_2.FontManager.instance) {
                    console.error("FontManager not found");
                    return;
                }
                this._loadFont();
            }
            else {
                this._font = null;
            }
        }
        _loadFont() {
            if (!this._fontName) {
                this._onTMFLoaded(null);
                return;
            }
            if (FontManager_2.FontManager.instance) {
                let fnt = FontManager_2.FontManager.instance.getFont(this._fontName);
                if (fnt) {
                    this._onTMFLoaded(fnt);
                }
                else {
                    FontManager_2.FontManager.instance.getFontAsync(this._fontName).then((font) => {
                        this._onTMFLoaded(font);
                    });
                }
            }
        }
        /**
        * @en
        * font size
        *
        * @zh
        * 字体大小。
        */
        get fontSize() {
            return this._fontSize;
        }
        set fontSize(val) {
            if (this._fontSize != val) {
                this._fontSize = val;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get underLineInfos() {
            return this._underLineInfos;
        }
        get strikeInfos() {
            return this._strikeInfos;
        }
        get backgroundInfos() {
            return this._backgroundInfos;
        }
        get maskInfos() {
            return this._maskInfos;
        }
        get charInfos() {
            return this._charInfos;
        }
        get typeSet() {
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
        /**
         * @en
         * Content string of label.
         *
         * @zh
         * 标签显示的文本内容。
         */
        get string() {
            return this._string;
        }
        set string(value) {
            if (value === null || value === undefined) {
                value = '';
            }
            else {
                value = value.toString();
            }
            if (this._string === value) {
                return;
            }
            this._string = value;
            this.addDirtyFlag(EDirtyFlag.Text | EDirtyFlag.Layout);
        }
        /**
        * @en
        * is rich lable
        *
        * @zh
        * 是否富文本。
        */
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
        get multiline() {
            return this._multiline;
        }
        set multiline(value) {
            if (value != this._multiline) {
                this._multiline = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get dilate() {
            return this._dilate;
        }
        set dilate(value) {
            if (value != this._dilate) {
                this._dilate = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get color() {
            return this._color;
        }
        set color(value) {
            if (this._color.equals(value)) {
                return;
            }
            this._color.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
            this._updateColor();
            if (env_5.EDITOR) {
                const clone = value.clone();
                this.node.emit(cc_19.Node.EventType.COLOR_CHANGED, clone);
            }
        }
        get enableColorRT() {
            return this._enableColorRT;
        }
        set enableColorRT(value) {
            if (value != this._enableColorRT) {
                this._enableColorRT = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get colorRT() {
            return this._colorRT;
        }
        set colorRT(value) {
            if (this._colorRT.equals(value)) {
                return;
            }
            this._colorRT.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get enableColorRB() {
            return this._enableColorRB;
        }
        set enableColorRB(value) {
            if (value != this._enableColorRB) {
                this._enableColorRB = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get colorRB() {
            return this._colorRB;
        }
        set colorRB(value) {
            if (this._colorRB.equals(value)) {
                return;
            }
            this._colorRB.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get enableColorLT() {
            return this._enableColorLT;
        }
        set enableColorLT(value) {
            if (value != this._enableColorLT) {
                this._enableColorLT = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get colorLT() {
            return this._colorLT;
        }
        set colorLT(value) {
            if (this._colorLT.equals(value)) {
                return;
            }
            this._colorLT.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get enableColorLB() {
            return this._enableColorLB;
        }
        set enableColorLB(value) {
            if (value != this._enableColorLB) {
                this._enableColorLB = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get colorLB() {
            return this._colorLB;
        }
        set colorLB(value) {
            if (this._colorLB.equals(value)) {
                return;
            }
            this._colorLB.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get enableItalic() {
            return this._enableItalic;
        }
        set enableItalic(value) {
            if (value != this._enableItalic) {
                this._enableItalic = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get enableUnderline() {
            return this._enableUnderline;
        }
        set enableUnderline(value) {
            if (value != this._enableUnderline) {
                this._enableUnderline = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get enableStrike() {
            return this._enableStrike;
        }
        set enableStrike(value) {
            if (value != this._enableStrike) {
                this._enableStrike = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get enableBackground() {
            return this._enableBackground;
        }
        set enableBackground(value) {
            if (value != this._enableBackground) {
                this._enableBackground = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get backgroundColor() {
            return this._backgroundColor;
        }
        set backgroundColor(value) {
            if (this._backgroundColor.equals(value)) {
                return;
            }
            this._backgroundColor.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get enableMask() {
            return this._enableMask;
        }
        set enableMask(value) {
            if (value != this._enableMask) {
                this._enableMask = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get maskColor() {
            return this._maskColor;
        }
        set maskColor(value) {
            if (this._maskColor.equals(value)) {
                return;
            }
            this._maskColor.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get autoWarp() {
            return this._autoWarp;
        }
        set autoWarp(value) {
            if (value != this._autoWarp) {
                this._autoWarp = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get equalWidth() {
            return this._equalWidth;
        }
        set equalWidth(value) {
            if (value != this._equalWidth) {
                this._equalWidth = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get fixedLineHeight() {
            return this._fixedLineHeight;
        }
        set fixedLineHeight(value) {
            if (value != this._fixedLineHeight) {
                this._fixedLineHeight = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get lineHeight() {
            return this._lineHeight;
        }
        set lineHeight(value) {
            if (value != this._lineHeight) {
                this._lineHeight = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        // @property({type:ETextDirection, displayOrder: 3})
        // get direction() {
        //     return this._direction;
        // }
        // set direction(value: ETextDirection) {
        //     if(value != this._direction) {
        //         this._direction = value;
        //         this.addDirtyFlag(EDirtyFlag.Layout);
        //     }
        // }
        get horizontalAlign() {
            return this._horizontalAlign;
        }
        set horizontalAlign(value) {
            if (value != this._horizontalAlign) {
                this._horizontalAlign = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        set verticalAlign(value) {
            if (value != this._verticalAlign) {
                this._verticalAlign = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        // @property({ displayOrder: 6})
        // get RTL() {
        //     return this._rtl;
        // }
        // set RTL(value: boolean) {
        //     if(value != this._rtl) {
        //         this._rtl = value;
        //     }
        // }
        get overflow() {
            return this._overflow;
        }
        set overflow(value) {
            if (value != this._overflow) {
                this._overflow = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get lineSpace() {
            return this._lineSpace;
        }
        set lineSpace(value) {
            if (value != this._lineSpace) {
                this._lineSpace = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get letterSpace() {
            return this._letterSpace;
        }
        set letterSpace(value) {
            if (value != this._letterSpace) {
                this._letterSpace = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get padding() {
            return this._padding;
        }
        set padding(value) {
            if (value != this._padding) {
                this._padding = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get stroke() {
            return this._stroke;
        }
        set stroke(value) {
            if (value != this._stroke) {
                this._stroke = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get strokeBlur() {
            return this._strokeBlur;
        }
        set strokeBlur(value) {
            if (value != this._strokeBlur) {
                this._strokeBlur = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get strokeColor() {
            return this._strokeColor;
        }
        set strokeColor(value) {
            if (this._strokeColor.equals(value)) {
                return;
            }
            this._strokeColor.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get shadow() {
            return this._shadow;
        }
        set shadow(value) {
            if (value != this._shadow) {
                this._shadow = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get shadowBlur() {
            return this._shadowBlur;
        }
        set shadowBlur(value) {
            if (value != this._shadowBlur) {
                this._shadowBlur = value;
                this.addDirtyFlag(EDirtyFlag.Style);
            }
        }
        get shadowOffsetX() {
            return this._shadowOffsetX;
        }
        set shadowOffsetX(value) {
            if (value != this._shadowOffsetX) {
                this._shadowOffsetX = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get shadowOffsetY() {
            return this._shadowOffsetY;
        }
        set shadowOffsetY(value) {
            if (value != this._shadowOffsetY) {
                this._shadowOffsetY = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get shadowColor() {
            return this._shadowColor;
        }
        set shadowColor(value) {
            if (this._shadowColor.equals(value)) {
                return;
            }
            this._shadowColor.set(value);
            this.addDirtyFlag(EDirtyFlag.Style);
        }
        get aspect() {
            return this._aspect;
        }
        set aspect(value) {
            if (value != this._aspect) {
                this._aspect = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get charVisibleRatio() {
            return this._charVisibleRatio;
        }
        set charVisibleRatio(value) {
            if (this._charVisibleRatio != value) {
                this._charVisibleRatio = cc_19.math.clamp01(value);
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
        get overlayTexture() {
            return this._overlayTexture;
        }
        set overlayTexture(value) {
            if (value != this._overlayTexture) {
                this._overlayTexture = value;
                this.addDirtyFlag(EDirtyFlag.Property);
            }
        }
        get enableGlow() {
            return this._enableGlow;
        }
        set enableGlow(value) {
            if (value != this._enableGlow) {
                this._enableGlow = value;
                this.addDirtyFlag(EDirtyFlag.Property);
            }
        }
        get glowColor() {
            return this._glowColor;
        }
        set glowColor(value) {
            if (this._glowColor.equals(value)) {
                return;
            }
            this._glowColor.set(value);
            this.addDirtyFlag(EDirtyFlag.Property);
        }
        get glowInner() {
            return this._glowInner;
        }
        set glowInner(value) {
            if (value != this._glowInner) {
                this._glowInner = value;
                this.addDirtyFlag(EDirtyFlag.Property);
            }
        }
        get glowOuter() {
            return this._glowOuter;
        }
        set glowOuter(value) {
            if (value != this._glowOuter) {
                this._glowOuter = value;
                this.addDirtyFlag(EDirtyFlag.Property);
            }
        }
        get glowPower() {
            return this._glowPower;
        }
        set glowPower(value) {
            if (value != this._glowPower) {
                this._glowPower = value;
                this.addDirtyFlag(EDirtyFlag.Property);
            }
        }
        get breakWestern() {
            return this._breakWestern;
        }
        set breakWestern(value) {
            if (value != this._breakWestern) {
                this._breakWestern = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get enableBold() {
            return this._enableBold;
        }
        set enableBold(value) {
            if (value != this._enableBold) {
                this._enableBold = value;
                this.addDirtyFlag(EDirtyFlag.Layout);
            }
        }
        get useFontPreset() {
            return this._useFontPreset;
        }
        set useFontPreset(value) {
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
                }
                else {
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
            this._uiTransform = this.node.getComponent(cc_19.UITransform);
            this.node.on(cc_19.Node.EventType.LAYER_CHANGED, this._applyLayer, this);
            this.node.on(cc_19.Node.EventType.ANCHOR_CHANGED, this._onAnchorChanged, this);
            this.node.on(cc_19.Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);
            cc_19.game.on(StyleManager_1.StyleManager.TMF_STYLE_CHANGED, this._onTMFStyleChanged, this);
            this._style.preset();
            this._typeSet = TypeSetFactory_1.TypeSetFactory.get("horizontal");
            this._padding.onChanged = (() => {
                this.addDirtyFlag(EDirtyFlag.Layout);
            }).bind(this);
            this.clearEditorSlots();
            this._loadFont();
        }
        onFocusInEditor() {
            this._loadFont();
        }
        clearEditorSlots() {
            var children = [...this.node.children];
            children.forEach((child) => {
                if (child.name.startsWith("slot_(")) {
                    child.removeFromParent();
                    child.destroy();
                }
            });
            if (this.slotsContainer) {
                children = [...this.slotsContainer.children];
                children.forEach((child) => {
                    if (child.name.startsWith("slot_(")) {
                        let conn = child.getComponent(SlotConnector_1.SlotConnector);
                        if (!conn || conn.labelNode == this.node) {
                            child.removeFromParent();
                            child.destroy();
                        }
                    }
                });
            }
        }
        _onTMFLoaded(font) {
            this._font = font;
            this._style.font = font;
            if (font) {
                this.customMaterial = font.material;
            }
            this.addDirtyFlag(EDirtyFlag.All);
        }
        _updateStyle(style) {
            const font = this._font;
            style.setFontSize(this._fontSize);
            style.setFillColor(this._color);
            style.setStroke(this._stroke * this.font.strokeScale);
            style.setStrokeBlur(this._strokeBlur);
            style.setStrokeColor(this._strokeColor);
            if (this._useFontPreset) {
                style.setDilate(this._enableBold ? font.normalWeight * this._font.boldWeightScale : font.normalWeight);
                style.setShadowBlur(font.shadowBlur);
            }
            else {
                style.setDilate(this._enableBold ? this._dilate * this._font.boldWeightScale : this._dilate);
                style.setShadowBlur(this._shadowBlur);
            }
            style.setShadow(this._shadow);
            style.setShadowColor(this._shadowColor);
            style.setShadowOffsetX(this._shadowOffsetX);
            style.setShadowOffsetY(this._shadowOffsetY);
            style.setUnderline(this._enableUnderline);
            style.setBackground(this._enableBackground);
            style.setBackgroundColor(this._backgroundColor);
            style.setMask(this._enableMask);
            style.setMaskColor(this._maskColor);
            style.setItalic(this._enableItalic);
            style.setStrike(this._enableStrike);
            if (this._enableColorLB) {
                style.setColorLB(this._colorLB);
            }
            else {
                style.enableColorLB = false;
            }
            if (this._enableColorLT) {
                style.setColorLT(this._colorLT);
            }
            else {
                style.enableColorLT = false;
            }
            if (this._enableColorRT) {
                style.setColorRT(this._colorRT);
            }
            else {
                style.enableColorRT = false;
            }
            if (this._enableColorRB) {
                style.setColorRB(this._colorRB);
            }
            else {
                style.enableColorRB = false;
            }
            style.calculate();
        }
        _updateAllStyles(needResetChar) {
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
            // if(needResetChar) {
            //     for(let i=0;i<this._charInfos.length;i++) {
            //         let charInfo = this._charInfos[i];
            //         charInfo.reset();
            //     }
            // }
            let assembler = this._assembler;
            assembler.updateColors(this);
            assembler.updateOthers(this);
        }
        onEnable() {
            super.onEnable();
            if (this.handleTouchEvent) {
                this._addEventListeners();
            }
            // Utils.until(()=>this.customMaterial!=null).then(()=>{
            //     this.addDirtyFlag(EDirtyFlag.All);
            // });       
        }
        onDisable() {
            super.onDisable();
            if (this.handleTouchEvent) {
                this._removeEventListeners();
            }
        }
        onDestroy() {
            super.onDestroy();
            this.node.off(cc_19.Node.EventType.LAYER_CHANGED, this._applyLayer, this);
            this.node.off(cc_19.Node.EventType.ANCHOR_CHANGED, this._onAnchorChanged, this);
            this.node.off(cc_19.Node.EventType.SIZE_CHANGED, this._onSizeChanged, this);
            cc_19.game.off(StyleManager_1.StyleManager.TMF_STYLE_CHANGED, this._onTMFStyleChanged, this);
            this._clearSlots();
        }
        _addEventListeners() {
            this.node.on('touch-end', this._onTouchEnded, this);
            if (env_5.EDITOR) {
                //@ts-ignore
                Editor.Message.addBroadcastListener("textmesh:tmf-refresh", this._onEditorTMFChanged.bind(this));
            }
        }
        _removeEventListeners() {
            this.node.off('touch-end', this._onTouchEnded, this);
            if (env_5.EDITOR) {
                //@ts-ignore
                Editor.Message.removeBroadcastListener("textmesh:tmf-refresh", this._onEditorTMFChanged.bind(this));
            }
        }
        _onEditorTMFChanged(uuid, model) {
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
        _onTouchEnded(event) {
            let pos = event.getLocation(vec2_temp);
            let info = this._typeSet.hitTest(this, pos);
            if (info === null || info === void 0 ? void 0 : info.result) {
                events_1.click_char_event.accurate = info.accurate;
                events_1.click_char_event.charInfo = info.charInfo;
                this.node.emit(TextMeshLabel_1.CHAR_CLICK_EVENT, events_1.click_char_event, event);
            }
            // event.propagationStopped = true;
        }
        _setLayer(node, layer) {
            if (node) {
                node.layer = layer;
                for (let i = 0; i < node.children.length; i++) {
                    this._setLayer(node.children[i], layer);
                }
            }
        }
        _applyLayer() {
            for (const slot of this._slots) {
                this._setLayer(slot.node, this.node.layer);
            }
        }
        _onAnchorChanged() {
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
        _onSizeChanged() {
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
        _onTMFStyleChanged() {
            this.addDirtyFlag(EDirtyFlag.Layout);
        }
        _render(render) {
            var _a;
            //@ts-ignore
            render.commitComp(this, this.renderData, (_a = this._font) === null || _a === void 0 ? void 0 : _a.fontData.texture, this._assembler, null);
        }
        requestRenderData(drawInfoType = 0) {
            const data = cc_19.RenderData.add(VertexFormat_1.vfmtTMVertex);
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
        getRenderElement(index) {
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
        _flushAssembler() {
            const assembler = TextMeshAssembler_1.TextMeshAssembler;
            if (this._assembler !== assembler) {
                this.destroyRenderData();
                this._assembler = assembler;
            }
            if (!this._renderData) {
                if (this._assembler && this._assembler.createData) {
                    this._renderData = this._assembler.createData(this);
                    this._renderData.material = this.sharedMaterial;
                }
            }
        }
        /**
         * 修复合批问题
         * @param index
         * @returns
         */
        getRenderMaterial(index) {
            if (!this.renderData) {
                return null;
            }
            return this.renderData.material || this._materialInstances[index] || this._materials[index];
        }
        markForUpdateRenderData(enable = true) {
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
        setSlotCreateHandler(type, handler) {
            this._slotCreateHandlers[type] = handler;
        }
        setSlotSpriteFrameCreateHandler(handler) {
            this._slotSpriteFrameCreateHandler = handler;
        }
        makeDirty(dirtyFlag) {
            this.dirtyFlag |= dirtyFlag;
        }
        _updateOverlayTexture(material) {
            if (!material) {
                return false;
            }
            let useOverlayTexture = this._overlayTexture != null;
            let pass = material.passes[0];
            if (pass.defines.USE_OVERLAY_TEXTURE != undefined && pass.defines.USE_OVERLAY_TEXTURE != useOverlayTexture ||
                pass.defines.USE_OVERLAY_TEXTURE == undefined && useOverlayTexture) {
                material.recompileShaders({
                    "USE_OVERLAY_TEXTURE": useOverlayTexture
                });
                if (useOverlayTexture) {
                    material.setProperty("overlayTexture", this._overlayTexture);
                }
            }
            return useOverlayTexture;
        }
        _updateGlow(material) {
            if (!material) {
                return false;
            }
            let pass = material.passes[0];
            if (pass.defines.USE_GLOW != undefined && pass.defines.USE_GLOW != this._enableGlow ||
                pass.defines.USE_GLOW == undefined && this._enableGlow) {
                material.recompileShaders({
                    "USE_GLOW": this._enableGlow
                });
                if (this._enableGlow) {
                    material.setProperty("glowColor", this._glowColor);
                    material.setProperty("glowInner", this._glowInner);
                    material.setProperty("glowOuter", this._glowOuter);
                    material.setProperty("glowPower", this._glowPower);
                }
            }
            return this._enableGlow;
        }
        _updateMaterialProperties(material) {
            let changed = false;
            changed = this._updateOverlayTexture(material) || changed;
            changed = this._updateGlow(material) || changed;
            return changed;
        }
        updateMaterial() {
            //@ts-ignore
            super.updateMaterial();
            if (!this._customMaterial) {
                return;
            }
            let material = this.getMaterialInstance(0);
            if (this._updateMaterialProperties(material)) {
                if (this._renderData) {
                    this._renderData.material = material;
                    this.setMaterialInstance(material, 0);
                }
                this.markForUpdateRenderData();
            }
            else {
                if (this._renderData) {
                    this._renderData.material = this.sharedMaterial;
                }
            }
        }
        // protected _onMaterialModified(index: number, material: Material | null): void {
        //     super._onMaterialModified(index, material);
        //     this.updateMaterial();
        // }
        _applyFontTexture() {
        }
        _updateLayout() {
            let layout = this.typeSet.layout(this);
            this._layoutResult = layout;
        }
        forceUpdate() {
            this.lateUpdate(0);
        }
        _updateText() {
            if (this._font == null) {
                console.warn("font is null");
                return;
            }
            this._clearSlots();
            this._freeCharInfos();
            if (this._rich) {
                this._parseRich(this._string);
            }
            else {
                this._parse(this._string);
            }
        }
        _clearAdditions() {
            for (let i = 0; i < this._underLineInfos.length; i++) {
                (0, TMRenderData_2.putTMQuadRenderDataToPool)(this._underLineInfos[i]);
            }
            this._underLineInfos.length = 0;
            for (let i = 0; i < this._strikeInfos.length; i++) {
                (0, TMRenderData_2.putTMQuadRenderDataToPool)(this._strikeInfos[i]);
            }
            this._strikeInfos.length = 0;
            for (let i = 0; i < this._backgroundInfos.length; i++) {
                (0, TMRenderData_2.putTMQuadRenderDataToPool)(this._backgroundInfos[i]);
            }
            this._backgroundInfos.length = 0;
            for (let i = 0; i < this._maskInfos.length; i++) {
                (0, TMRenderData_2.putTMQuadRenderDataToPool)(this._maskInfos[i]);
            }
            this._maskInfos.length = 0;
        }
        _freeCharInfos() {
            for (let i = 0; i < this._charInfos.length; i++) {
                (0, CharInfo_4.putCharInfoToPool)(this._charInfos[i]);
            }
            this._charInfos.length = 0;
            this._clearAdditions();
        }
        _clearSlots() {
            for (let i = 0; i < this._slots.length; i++) {
                let slot = this._slots[i];
                if (slot.node) {
                    slot.node.destroy();
                }
            }
            this._slots.length = 0;
        }
        _parse(text) {
            if (this._font == null) {
                return;
            }
            this._updateStyle(this._style);
            let end = text.length;
            for (let i = 0; i < end; i++) {
                var vertexInfo = (0, CharInfo_4.getCharInfoFromPool)();
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
        _parseSlot(charIndex, node, type, fontSize) {
            let slot = new LayoutTypes_1.Slot();
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
        async _createSlot(slot, fontSize) {
            let node = new cc_19.Node();
            node.layer = this.node.layer;
            node.name = `slot_(${this.node.name}_${slot.type}_${slot.name})`;
            slot.node = node;
            if (this.slotsContainer) {
                this.slotsContainer.addChild(node);
                var conn = node.addComponent(SlotConnector_1.SlotConnector);
                conn.labelNode = this.node;
                this.slotOffsetX = this.node.worldPosition.x - node.worldPosition.x;
                this.slotOffsetY = this.node.worldPosition.y - node.worldPosition.y;
            }
            else {
                this.node.addChild(node);
                this.slotOffsetX = 0;
                this.slotOffsetY = 0;
            }
            let urt = node.addComponent(cc_19.UITransform);
            urt.anchorPoint.set(0, 0);
            let hasW = slot.width != null;
            let hasH = slot.height != null;
            slot.width = hasW ? slot.width : fontSize;
            slot.height = hasH ? slot.height : fontSize;
            if (env_5.EDITOR) {
                if (slot.sizeType == LayoutTypes_1.ESlotSizeType.None) {
                    urt.width = hasW ? slot.width : urt.width;
                    urt.height = hasH ? slot.height : urt.height;
                }
                else if (slot.sizeType == LayoutTypes_1.ESlotSizeType.WidthFirst) {
                    var aspect = urt.height / urt.width;
                    urt.width = hasW ? slot.width : fontSize;
                    urt.height = hasH ? slot.height : urt.width * aspect;
                }
                else {
                    var aspect = urt.width / urt.height;
                    urt.height = hasH ? slot.height : fontSize;
                    urt.width = hasW ? slot.width : urt.height * aspect;
                }
                let g = node.addComponent(cc_19.Graphics);
                g.color = cc_19.Color.WHITE;
                g.fillRect(0, 0, urt.width, urt.height);
                return;
            }
            if (slot.src) {
                // let strs = slot.src.split(':');
                // let abName = null;
                // let path = "";
                // if(strs.length == 1) {
                //     path = strs[0];
                // }else{
                //     abName = strs[0];
                //     path = strs[1];
                // }
                let src = slot.src.substring(5);
                let index = src.indexOf('/');
                let abName = src.substring(0, index);
                let path = src.substring(index + 1);
                if (slot.type == LayoutTypes_1.ESlotType.Image) {
                    if (this._slotCreateHandlers[LayoutTypes_1.ESlotType.Image]) {
                        this._slotCreateHandlers[LayoutTypes_1.ESlotType.Image](this, node, slot);
                    }
                    else {
                        if (!env_5.EDITOR) {
                            let sp = null;
                            if (this._slotSpriteFrameCreateHandler) {
                                if (this._slotSpriteFrameCreateHandler instanceof Promise) {
                                    sp = await this._slotSpriteFrameCreateHandler(this, node, slot);
                                }
                                else {
                                    sp = this._slotSpriteFrameCreateHandler(this, node, slot);
                                }
                            }
                            else {
                                sp = await ResManger_2.ResManager.getAsync(abName, path + "/spriteFrame", cc_19.SpriteFrame);
                            }
                            if (sp && (0, cc_19.isValid)(node)) {
                                let spNode = new cc_19.Node();
                                spNode.name = "sprite";
                                spNode.layer = node.layer;
                                node.addChild(spNode);
                                let spUrt = spNode.addComponent(cc_19.UITransform);
                                spUrt.setAnchorPoint(0, 0);
                                let sprite = spNode.addComponent(cc_19.Sprite);
                                sprite.sizeMode = cc_19.Sprite.SizeMode.CUSTOM;
                                sprite.type = cc_19.Sprite.Type.SIMPLE;
                                sprite.spriteFrame = sp;
                                if (slot.sizeType == LayoutTypes_1.ESlotSizeType.WidthFirst) {
                                    var scale = slot.width / spUrt.width;
                                    spNode.setScale(scale, scale);
                                }
                                else if (slot.sizeType == LayoutTypes_1.ESlotSizeType.HeightFirst) {
                                    var scale = slot.height / spUrt.height;
                                    spNode.setScale(scale, scale);
                                }
                            }
                        }
                    }
                }
                else if (slot.type == LayoutTypes_1.ESlotType.Prefab) {
                    if (this._slotCreateHandlers[LayoutTypes_1.ESlotType.Prefab]) {
                        this._slotCreateHandlers[LayoutTypes_1.ESlotType.Prefab](this, node, slot);
                    }
                    else {
                        if (!env_5.EDITOR) {
                            let prefab = await ResManger_2.ResManager.getAsync(abName, path, cc_19.Prefab);
                            // 防止还未创建就被删除的情况
                            if (prefab && (0, cc_19.isValid)(node)) {
                                let inst = (0, cc_19.instantiate)(prefab);
                                node.addChild(inst);
                                let pTR = inst.getComponent(cc_19.UITransform);
                                if (pTR == null) {
                                    pTR = inst.addComponent(cc_19.UITransform);
                                }
                                pTR.setAnchorPoint(0, 0);
                                if (slot.sizeType == LayoutTypes_1.ESlotSizeType.WidthFirst) {
                                    var scale = slot.width / pTR.width;
                                    inst.setScale(scale, scale);
                                }
                                else if (slot.sizeType == LayoutTypes_1.ESlotSizeType.HeightFirst) {
                                    var scale = slot.height / pTR.height;
                                    inst.setScale(scale, scale);
                                }
                                let rt = inst.getComponent(cc_19.UITransform);
                                if (rt) {
                                    rt.width = pTR.width;
                                    rt.height = pTR.height;
                                }
                            }
                        }
                    }
                }
                else {
                    if (this._slotCreateHandlers[LayoutTypes_1.ESlotType.Custom]) {
                        this._slotCreateHandlers[LayoutTypes_1.ESlotType.Custom](this, node, slot);
                    }
                }
            }
        }
        _parseClick(node) {
            let clickable = new LayoutTypes_1.Clickable;
            if (node.attributes) {
                clickable.name = node.attributes["name"];
                clickable.value = node.attributes["value"];
            }
            return clickable;
        }
        _parseRich(text) {
            this._updateStyle(this._style);
            this._clicks.length = 0;
            let ast = UBBParser_1.UBBParser.inst.parse(text);
            let lastDepth = 0;
            let currentStyle = this._style;
            let prevStyle = this._style;
            const styleStack = [currentStyle];
            let nodeStack = [];
            let clickStack = [];
            const tagMap = StyleMapper_2.StyleMapper['tagMap'] || {};
            for (const [node, depth] of (0, dfs_1.default)(ast)) {
                if (depth < lastDepth) {
                    for (let i = lastDepth - depth; i >= 0; i--) {
                        currentStyle = styleStack.pop() || this._style;
                        prevStyle = currentStyle;
                    }
                    let pnode = nodeStack.pop();
                    if ((pnode === null || pnode === void 0 ? void 0 : pnode.name) == "click") {
                        clickStack.pop();
                    }
                }
                else if (depth == lastDepth) {
                    currentStyle = prevStyle;
                    nodeStack.push(node);
                }
                let tagNode = node;
                if (tagNode.type != 'text') {
                    if (depth > lastDepth) {
                        styleStack.push(currentStyle);
                    }
                    prevStyle = currentStyle;
                    currentStyle = currentStyle.clone();
                    if ((0, LayoutTypes_1.isSlotType)(node.name)) {
                        let slot = this._parseSlot(this._charInfos.length, node, LayoutTypes_1.SlotTypeMap[node.name], currentStyle.fontSize);
                        this._slots.push(slot);
                        this._addCharInfo('', currentStyle, clickStack.length > 0, this._slots[this._slots.length - 1]);
                    }
                    else if (node.name == "click") {
                        let clickable = this._parseClick(node);
                        this._clicks.push(clickable);
                        clickStack.push(clickable);
                    }
                    else {
                        const mapper = StyleMapper_2.StyleMapper[node.name];
                        if (mapper) {
                            if (mapper.field) {
                                if (node.Value != null) {
                                    currentStyle[mapper.field] = node.Value;
                                }
                                else {
                                    currentStyle[mapper.field] = mapper.Value;
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
                                        }
                                        else if (attr.mapper) {
                                            let fieldMappler = StyleMapper_2.StyleMapper[attr.mapper];
                                            if (fieldMappler) {
                                                if (fieldMappler.field) {
                                                    currentStyle[fieldMappler.field] = node.attributes[key];
                                                }
                                            }
                                            else {
                                                console.error("can not find mapper", attr.mapper);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (tagNode.name == "style") {
                            let styleStr = tagNode.Value;
                            let styles = styleStr.split(/[ ;,]/gi);
                            for (let i = 0; i < styles.length; i++) {
                                if (!styles[i]) {
                                    continue;
                                }
                                let style = StyleManager_1.StyleManager.getStyle(styles[i]);
                                if (style) {
                                    currentStyle.copyFrom(style);
                                }
                                else {
                                    console.error("can not find style named ", styles[i]);
                                }
                            }
                        }
                        else if (tagMap[tagNode.name]) {
                            this._addCharInfo(tagMap[tagNode.name], currentStyle, clickStack.length > 0);
                        }
                        else {
                            let field = `_$${node.name}`;
                            if (Object.keys(currentStyle).indexOf(field) >= 0) {
                                if (typeof currentStyle[field] == "boolean") {
                                    currentStyle[field] = true;
                                }
                                else {
                                    currentStyle[field] = (node.Value === undefined) ? true : node.Value;
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
                    let chars = (0, FontUtils_1.getStringArray)(content);
                    let end = chars.length;
                    for (let i = 0; i < end; i++) {
                        this._addCharInfo(chars[i], currentStyle, clickStack.length > 0);
                    }
                }
                lastDepth = depth;
            }
        }
        _addCharInfo(char, style, inClick, slot) {
            var vertexInfo = (0, CharInfo_4.getCharInfoFromPool)();
            vertexInfo.index = this._charInfos.length;
            vertexInfo.style = style;
            vertexInfo.char = this.font.getCharInfo(char);
            vertexInfo.font = this.font;
            vertexInfo.click = inClick ? this._clicks[this._clicks.length - 1] : null;
            vertexInfo.slot = slot;
            // vertexInfo.reset();
            this._charInfos.push(vertexInfo);
        }
        lateUpdate(dt) {
            if (!this.enabledInHierarchy || !this._font) {
                return;
            }
            if (this.dirtyFlag != EDirtyFlag.None) {
                this._ready = false;
                // console.log("update text", this.dirtyFlag);
                if (this.dirtyFlag == EDirtyFlag.Style) {
                    this._updateAllStyles();
                    // console.log("update all styles");
                }
                else if (this.dirtyFlag == EDirtyFlag.Property) {
                    this.updateMaterial();
                    // console.log("update material");
                }
                else {
                    this._updateText();
                    this._updateLayout();
                    this.destroyRenderData();
                    this.updateRenderData();
                    // console.log("update text", this.charInfos.length);
                    this.markForUpdateRenderData();
                }
                this.dirtyFlag = EDirtyFlag.None;
                this._ready = true;
            }
        }
        get dirtyFlag() {
            return this._dirtyFlag;
        }
        set dirtyFlag(value) {
            if (this.dirtyFlag != value) {
                this._dirtyFlag = value;
            }
        }
        addDirtyFlag(flag) {
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
        getCharInfo(index) {
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
        setCharColor(charInfo, colors) {
            if (!charInfo) {
                return;
            }
            TextMeshAssembler_1.TextMeshAssembler.updateColor(this, charInfo, colors);
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
        setCharTransform(charInfo, dx, dy, rotation, scale) {
            if (!charInfo) {
                return;
            }
            if (charInfo.slot) {
                let node = charInfo.slot.node;
                node.setScale(scale, scale, scale);
                let urt = node._uiProps.uiTransformComp;
                let hx = urt.width * (0.5 - urt.anchorX);
                let hy = urt.height * (0.5 - urt.anchorY);
                node.setPosition(charInfo.x + this.globalOffsetX, charInfo.y + this.globalOffsetY, 0);
                cc_19.Quat.fromEuler(quat, 0, 0, rotation * 180 / Math.PI);
                node.setRotation(quat);
                let pos = new cc_19.Vec3(urt.width * urt.anchorX, urt.height * urt.anchorY, 0);
                let center = new cc_19.Vec3(hx, hy, 0);
                cc_19.Vec3.rotateZ(pos, pos, center, rotation);
                node.setPosition(node.position.x + pos.x, node.position.y + pos.y, 0);
                return;
            }
            else if (charInfo.vertexData.length == 0) {
                return;
            }
            let center = new cc_19.Vec3();
            let vs = charInfo.vertexData;
            center.x = (vs[0].x + vs[1].x + vs[2].x + vs[3].x) / 4;
            center.y = (vs[0].y + vs[1].y + vs[2].y + vs[3].y) / 4;
            for (let j = 0; j < 4; j++) {
                let pos = new cc_19.Vec3();
                cc_19.Vec3.subtract(pos, vs[j], center);
                pos.multiplyScalar(scale);
                cc_19.Vec3.add(pos, center, pos);
                if (rotation != 0) {
                    cc_19.Vec3.rotateZ(pos, pos, center, rotation);
                }
                vs[j].rx = pos.x + dx;
                vs[j].ry = pos.y + dy;
            }
        }
        setCustomMaterialByUUID(uuid) {
            if (uuid) {
                cc_19.assetManager.loadAny({ uuid: uuid }, (err, asset) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    this.customMaterial = asset;
                });
            }
        }
        _canRender() {
            if (!super._canRender() || !this._string || !this._font) {
                return false;
            }
            return true;
        }
    };
    TextMeshLabel.CHAR_CLICK_EVENT = "CHAR_CLICK_EVENT";
    __decorate([
        property({ serializable: true })
    ], TextMeshLabel.prototype, "_saveTag", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_fontName", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_string", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_rich", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_direction", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_horizontalAlign", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_verticalAlign", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_overflow", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_multiline", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableItalic", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableUnderline", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableStrike", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableBackground", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableMask", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_lineSpace", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_letterSpace", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableColorRT", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_colorRT", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableColorRB", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_colorRB", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableColorLT", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_colorLT", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableColorLB", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_colorLB", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_backgroundColor", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_maskColor", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_strokeColor", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_shadow", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_shadowOffsetX", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_shadowOffsetY", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_shadowBlur", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_shadowColor", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_handleTouchEvent", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_autoWarp", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_lineHeight", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_fixedLineHeight", void 0);
    __decorate([
        property({ type: types_5.Margin, visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_padding", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_dilate", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_stroke", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_strokeBlur", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_aspect", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_charVisibleRatio", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_equalWidth", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_overlayTexture", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableGlow", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_glowColor", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_glowInner", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_glowOuter", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_glowPower", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_breakWestern", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_enableBold", void 0);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_useFontPreset", void 0);
    __decorate([
        property({ displayOrder: 1, tooltip: '', group: "Normal" })
    ], TextMeshLabel.prototype, "fontName", null);
    __decorate([
        property({ visible: false, serializable: true })
    ], TextMeshLabel.prototype, "_fontSize", void 0);
    __decorate([
        property({ displayOrder: 1, tooltip: '', group: "Normal" })
    ], TextMeshLabel.prototype, "fontSize", null);
    __decorate([
        property({ type: cc_19.Node, tooltip: 'i18n:text-mesh.label.slotsContainer' })
    ], TextMeshLabel.prototype, "slotsContainer", void 0);
    __decorate([
        property({ displayOrder: 1, tooltip: '', multiline: true, group: "Normal" })
    ], TextMeshLabel.prototype, "string", null);
    __decorate([
        property({ displayOrder: 2, group: "Normal" })
    ], TextMeshLabel.prototype, "rich", null);
    __decorate([
        property({ displayOrder: 2, group: "Normal" })
    ], TextMeshLabel.prototype, "multiline", null);
    __decorate([
        property({ visible: function () { return !this._useFontPreset; }, displayOrder: 2, min: 0, max: 1, step: 0.01, slide: true, group: "Normal" })
    ], TextMeshLabel.prototype, "dilate", null);
    __decorate([
        property({ type: cc_19.Color, displayOrder: 3, override: true, group: "Normal" })
    ], TextMeshLabel.prototype, "color", null);
    __decorate([
        property({ displayOrder: 4, group: "Style" })
    ], TextMeshLabel.prototype, "enableColorRT", null);
    __decorate([
        property({ visible: function () { return this._enableColorRT; }, type: cc_19.Color, displayOrder: 5, group: "Style" })
    ], TextMeshLabel.prototype, "colorRT", null);
    __decorate([
        property({ displayOrder: 6, group: "Style" })
    ], TextMeshLabel.prototype, "enableColorRB", null);
    __decorate([
        property({ visible: function () { return this._enableColorRB; }, type: cc_19.Color, displayOrder: 7, group: "Style" })
    ], TextMeshLabel.prototype, "colorRB", null);
    __decorate([
        property({ displayOrder: 8, group: "Style" })
    ], TextMeshLabel.prototype, "enableColorLT", null);
    __decorate([
        property({ visible: function () { return this._enableColorLT; }, type: cc_19.Color, displayOrder: 9, group: "Style" })
    ], TextMeshLabel.prototype, "colorLT", null);
    __decorate([
        property({ displayOrder: 10, group: "Style" })
    ], TextMeshLabel.prototype, "enableColorLB", null);
    __decorate([
        property({ visible: function () { return this._enableColorLB; }, type: cc_19.Color, displayOrder: 11, group: "Style" })
    ], TextMeshLabel.prototype, "colorLB", null);
    __decorate([
        property({ displayOrder: 12, group: "Normal" })
    ], TextMeshLabel.prototype, "enableItalic", null);
    __decorate([
        property({ displayOrder: 13, group: "Normal" })
    ], TextMeshLabel.prototype, "enableUnderline", null);
    __decorate([
        property({ displayOrder: 14, group: "Normal" })
    ], TextMeshLabel.prototype, "enableStrike", null);
    __decorate([
        property({ displayOrder: 15, group: "Style" })
    ], TextMeshLabel.prototype, "enableBackground", null);
    __decorate([
        property({ visible: function () { return this._enableBackground; }, displayOrder: 16, group: "Style" })
    ], TextMeshLabel.prototype, "backgroundColor", null);
    __decorate([
        property({ displayOrder: 17, group: "Style" })
    ], TextMeshLabel.prototype, "enableMask", null);
    __decorate([
        property({ visible: function () { return this._enableMask; }, displayOrder: 18, group: "Style" })
    ], TextMeshLabel.prototype, "maskColor", null);
    __decorate([
        property({ displayOrder: 19, group: "Layout" })
    ], TextMeshLabel.prototype, "autoWarp", null);
    __decorate([
        property({ displayOrder: 20, group: "Layout" })
    ], TextMeshLabel.prototype, "equalWidth", null);
    __decorate([
        property({ displayOrder: 21, group: "Layout" })
    ], TextMeshLabel.prototype, "fixedLineHeight", null);
    __decorate([
        property({ visible: function () { return this._fixedLineHeight; }, displayOrder: 22, group: "Layout" })
    ], TextMeshLabel.prototype, "lineHeight", null);
    __decorate([
        property({ type: types_5.ETextHorizontalAlign, displayOrder: 24, group: "Layout" })
    ], TextMeshLabel.prototype, "horizontalAlign", null);
    __decorate([
        property({ type: types_5.ETextVerticalAlign, displayOrder: 25, group: "Layout" })
    ], TextMeshLabel.prototype, "verticalAlign", null);
    __decorate([
        property({ type: types_5.ETextOverflow, displayOrder: 26, group: "Layout" })
    ], TextMeshLabel.prototype, "overflow", null);
    __decorate([
        property({ displayOrder: 27, group: "Layout" })
    ], TextMeshLabel.prototype, "lineSpace", null);
    __decorate([
        property({ displayOrder: 28, group: "Layout" })
    ], TextMeshLabel.prototype, "letterSpace", null);
    __decorate([
        property({ displayOrder: 29, group: "Layout" })
    ], TextMeshLabel.prototype, "padding", null);
    __decorate([
        property({ displayOrder: 30, min: 0, max: 1, step: 0.001, slide: true, group: "Stroke" })
    ], TextMeshLabel.prototype, "stroke", null);
    __decorate([
        property({ visible: function () { return this._stroke > 0; }, displayOrder: 31, min: 0, max: 1, step: 0.001, slide: true, group: "Stroke" })
    ], TextMeshLabel.prototype, "strokeBlur", null);
    __decorate([
        property({ visible: function () { return this._stroke > 0; }, type: cc_19.Color, displayOrder: 32, group: "Stroke" })
    ], TextMeshLabel.prototype, "strokeColor", null);
    __decorate([
        property({ displayOrder: 33, min: 0, max: 1, step: 0.001, slide: true, group: "Shadow" })
    ], TextMeshLabel.prototype, "shadow", null);
    __decorate([
        property({ visible: function () { return this._shadow > 0; }, displayOrder: 34, min: 0, max: 1, step: 0.001, slide: true, group: "Shadow" })
    ], TextMeshLabel.prototype, "shadowBlur", null);
    __decorate([
        property({ visible: function () { return this._shadow > 0; }, displayOrder: 35, min: -100, max: 100, step: 0.1, slide: true, group: "Shadow" })
    ], TextMeshLabel.prototype, "shadowOffsetX", null);
    __decorate([
        property({ visible: function () { return this._shadow > 0; }, displayOrder: 36, min: -100, max: 100, step: 0.1, slide: true, group: "Shadow" })
    ], TextMeshLabel.prototype, "shadowOffsetY", null);
    __decorate([
        property({ visible: function () { return this._shadow > 0; }, type: cc_19.Color, displayOrder: 37, group: "Shadow" })
    ], TextMeshLabel.prototype, "shadowColor", null);
    __decorate([
        property({ displayOrder: 38, min: 0, max: 3, step: 0.01, slide: true, group: "Layout" })
    ], TextMeshLabel.prototype, "aspect", null);
    __decorate([
        property({ displayOrder: 39, min: 0, max: 1, step: 0.01, slide: true, group: "Layout" })
    ], TextMeshLabel.prototype, "charVisibleRatio", null);
    __decorate([
        property({ type: cc_19.Texture2D, displayOrder: 40, group: "Style" })
    ], TextMeshLabel.prototype, "overlayTexture", null);
    __decorate([
        property({ displayOrder: 41, group: "Style" })
    ], TextMeshLabel.prototype, "enableGlow", null);
    __decorate([
        property({ visible: function () { return this._enableGlow; }, displayOrder: 42, group: "Style" })
    ], TextMeshLabel.prototype, "glowColor", null);
    __decorate([
        property({ visible: function () { return this._enableGlow; }, displayOrder: 43, min: 0, max: 1, step: 0.01, slide: true, group: "Style" })
    ], TextMeshLabel.prototype, "glowInner", null);
    __decorate([
        property({ visible: function () { return this._enableGlow; }, displayOrder: 44, min: 0, max: 1, step: 0.01, slide: true, group: "Style" })
    ], TextMeshLabel.prototype, "glowOuter", null);
    __decorate([
        property({ visible: function () { return this._enableGlow; }, displayOrder: 45, min: 0, max: 10, step: 0.01, slide: true, group: "Style" })
    ], TextMeshLabel.prototype, "glowPower", null);
    __decorate([
        property({ visible: true, group: "Layout" })
    ], TextMeshLabel.prototype, "breakWestern", null);
    __decorate([
        property({ visible: true, group: "Normal" })
    ], TextMeshLabel.prototype, "enableBold", null);
    __decorate([
        property({ visible: true })
    ], TextMeshLabel.prototype, "useFontPreset", null);
    TextMeshLabel = TextMeshLabel_1 = __decorate([
        ccclass("TextMeshLabel"),
        executeInEditMode,
        executionOrder(1)
    ], TextMeshLabel);
    exports.TextMeshLabel = TextMeshLabel;
});
define("TextMesh/label/SuperLabel", ["require", "exports", "cc", "TextMesh/label/TextMeshLabel", "TextMesh/settings", "cc/env", "TextMesh/utils/Utils"], function (require, exports, cc_20, TextMeshLabel_2, settings_3, env_6, Utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuperLabel = void 0;
    const { ccclass, executeInEditMode, property } = cc_20._decorator;
    const tempVec2 = new cc_20.Vec2();
    let SuperLabel = class SuperLabel extends cc_20.Component {
        constructor() {
            super(...arguments);
            this._ccLabel = null;
            this._outline = null;
            this._shadow = null;
            this._ccRichText = null;
            this._textMeshLabel = null;
            this._richMode = false;
            this._textmeshMode = true;
            this._string = "";
            this._font = null;
            this._fontName = "";
            this._fontSize = 20;
            this._color = new cc_20.Color(255, 255, 255, 255);
            this._overflow = 0;
            this._horizontalAlign = 0;
            this._verticalAlign = 0;
            this._letterSpace = 0;
            this._underline = false;
            this._bold = false;
            this._italic = false;
            this._singleLine = false;
            this._lineHeight = 40;
            this._strokeColor = new cc_20.Color(0, 0, 0, 255);
            this._shadowColor = new cc_20.Color(0, 0, 0, 255);
            this._shadowBlur = 0;
            this._shadowOffset = new cc_20.Vec2();
            this._stroke = 0;
        }
        get textmeshMode() {
            return this._textmeshMode;
        }
        set textmeshMode(value) {
            if (this._textmeshMode === value) {
                return;
            }
            this._textmeshMode = value;
            this._changeMode(value);
        }
        get richMode() {
            return this._richMode;
        }
        set richMode(value) {
            if (this._richMode === value) {
                return;
            }
            this._richMode = value;
            this._changeMode(this._textmeshMode);
        }
        setMode(textmesh, rich) {
            this._textmeshMode = textmesh;
            this._richMode = rich;
            this._changeMode(textmesh);
        }
        get string() {
            return this._string;
        }
        set string(value) {
            this._string = value;
            if (this.label) {
                this.label.string = value;
            }
        }
        get font() {
            return this._font;
        }
        set font(value) {
            this._font = value;
            if (this._ccLabel) {
                this._ccLabel.font = value;
            }
            if (value) {
                this.textmeshMode = false;
            }
        }
        get fontName() {
            return this._fontName;
        }
        set fontName(value) {
            this._fontName = value;
            if (this._textMeshLabel) {
                this._textMeshLabel.fontName = value;
            }
            if (value) {
                this.textmeshMode = true;
            }
        }
        get fontSize() {
            return this._fontSize;
        }
        set fontSize(value) {
            this._fontSize = value;
            if (this.label) {
                this.label.fontSize = value;
            }
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color.set(value);
            if (this.label) {
                if (this.label instanceof TextMeshLabel_2.TextMeshLabel || this.label instanceof cc_20.Label) {
                    this.label.color = value;
                }
            }
        }
        get stroke() {
            return this._stroke;
        }
        get enableStroke() {
            let ret = this._stroke > 0;
            if (this._ccLabel) {
                if (ret) {
                    if (!this._outline) {
                        this._outline = this.node.addComponent(cc_20.LabelOutline);
                    }
                }
                else {
                    if (this._outline) {
                        this._outline.destroy();
                        this._outline = null;
                    }
                }
            }
            return ret;
        }
        set stroke(value) {
            this._stroke = value;
            if (this._ccLabel) {
                if (!this.enableStroke) {
                    return;
                }
                this._outline.width = value;
            }
            else if (this._textMeshLabel) {
                const font = this._textMeshLabel.font;
                if (font) {
                    this._textMeshLabel.stroke = cc_20.math.clamp01(value / this.fontSize);
                    this._textMeshLabel.strokeBlur = font.strokeBlur;
                }
            }
        }
        get strokeColor() {
            return this._strokeColor;
        }
        set strokeColor(value) {
            this._strokeColor.set(value);
            if (this._ccLabel) {
                if (!this.enableStroke) {
                    return;
                }
                this._outline.color = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.strokeColor = value;
            }
        }
        get shadowOffset() {
            return this._shadowOffset;
        }
        get enableShadow() {
            let ret = this._shadowOffset.x != 0 || this._shadowOffset.y != 0;
            if (this._ccLabel) {
                if (!this._shadow) {
                    this._shadow = this.node.addComponent(cc_20.LabelShadow);
                }
            }
            return ret;
        }
        set shadowOffset(value) {
            this._shadowOffset.set(value);
            if (this._ccLabel) {
                if (!this.enableShadow) {
                    return;
                }
                tempVec2.set(value.x, value.y);
                this._shadow.offset = tempVec2;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.shadowOffsetX = value.x;
                this._textMeshLabel.shadowOffsetY = -value.y;
                if (!this.enableShadow) {
                    this._textMeshLabel.shadow = 0;
                }
                else {
                    const font = this._textMeshLabel.font;
                    if (font) {
                        if (this._textMeshLabel.shadow <= 0) {
                            this._textMeshLabel.shadow = font.shadowSize;
                        }
                        this._textMeshLabel.shadowBlur = font.shadowBlur;
                    }
                }
            }
        }
        get shadowColor() {
            return this._shadowColor;
        }
        set shadowColor(value) {
            this._shadowColor.set(value);
            if (this._ccLabel) {
                if (!this.enableShadow) {
                    return;
                }
                this._shadow.color = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.shadowColor = value;
            }
        }
        get shadowBlur() {
            return this._shadowBlur;
        }
        set shadowBlur(value) {
            this._shadowBlur = value;
            if (this._ccLabel) {
                if (!this.enableShadow) {
                    return;
                }
                this._shadow.blur = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.shadowBlur = value;
            }
        }
        get overflow() {
            return this._overflow;
        }
        set overflow(value) {
            this._overflow = value;
            if (!this.label) {
                return;
            }
            if (this.label instanceof cc_20.Label || this.label instanceof TextMeshLabel_2.TextMeshLabel) {
                this.label.overflow = value;
            }
        }
        get horizontalAlign() {
            return this._horizontalAlign;
        }
        set horizontalAlign(value) {
            this._horizontalAlign = value;
            if (this.label) {
                this.label.horizontalAlign = value;
            }
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        set verticalAlign(value) {
            this._verticalAlign = value;
            if (this.label) {
                this.label.verticalAlign = value;
            }
        }
        get letterSpace() {
            return this._letterSpace;
        }
        set letterSpace(value) {
            this._letterSpace = value;
            if (this._ccLabel) {
                this._ccLabel.spacingX = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.letterSpace = value;
            }
        }
        get underline() {
            return this._underline;
        }
        set underline(value) {
            this._underline = value;
            if (this._ccLabel) {
                this._ccLabel.isUnderline = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.enableUnderline = value;
            }
        }
        get bold() {
            return this._bold;
        }
        set bold(value) {
            this._bold = value;
            if (this._ccLabel) {
                this._ccLabel.isBold = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.enableBold = value;
            }
        }
        get italic() {
            return this._italic;
        }
        set italic(value) {
            this._italic;
            if (this._ccLabel) {
                this._ccLabel.isItalic = value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.enableItalic = value;
            }
        }
        get singleLine() {
            return this._singleLine;
        }
        set singleLine(value) {
            this._singleLine = value;
            if (this._ccLabel) {
                this._ccLabel.enableWrapText = !value;
            }
            else if (this._textMeshLabel) {
                this._textMeshLabel.autoWarp = true;
                this._textMeshLabel.multiline = !value;
            }
        }
        get lineHeight() {
            return this._lineHeight;
        }
        set lineHeight(value) {
            this._lineHeight = value;
            if (this.label) {
                this.label.lineHeight = value;
            }
        }
        onLoad() {
            if (settings_3.TextMeshSettings.disableTextMesh) {
                this.textmeshMode = false;
            }
            this.buildLabel();
        }
        buildLabel() {
            // @ts-ignore
            this._textMeshLabel = this.node.getComponent(TextMeshLabel_2.TextMeshLabel);
            this._ccLabel = this.node.getComponent(cc_20.Label);
            this._outline = this.node.getComponent(cc_20.LabelOutline);
            this._shadow = this.node.getComponent(cc_20.LabelShadow);
            this._changeMode(this._textmeshMode);
        }
        async _changeMode(useTexMesh) {
            this._ccLabel = this.node.getComponent(cc_20.Label);
            // @ts-ignore
            this._textMeshLabel = this.node.getComponent(TextMeshLabel_2.TextMeshLabel);
            this._ccRichText = this.node.getComponent(cc_20.RichText);
            if (useTexMesh) {
                let hasOldLabel = !!this._ccLabel;
                if (this._outline) {
                    this._outline.destroy();
                    this._outline = null;
                }
                if (this._shadow) {
                    this._shadow.destroy();
                    this._shadow = null;
                }
                if (this._ccLabel) {
                    this._ccLabel.destroy();
                    this._ccLabel = null;
                }
                if (this._ccRichText) {
                    this._ccRichText.destroy();
                    this._ccRichText = null;
                }
                if (hasOldLabel && env_6.EDITOR) {
                    await Utils_4.Utils.waitframe();
                }
                if (!this._textMeshLabel) {
                    // @ts-ignore
                    this._textMeshLabel = this.node.addComponent(TextMeshLabel_2.TextMeshLabel);
                }
                this._textMeshLabel.rich = this._richMode;
                this._applyLabelInfo();
            }
            else {
                if (!this._richMode) {
                    let hasOldLabel = !!this._textMeshLabel;
                    if (this._ccRichText) {
                        this._ccRichText.destroy();
                        this._ccRichText = null;
                    }
                    if (this._textMeshLabel) {
                        this._textMeshLabel.destroy();
                        this._textMeshLabel = null;
                    }
                    if (hasOldLabel && env_6.EDITOR) {
                        await Utils_4.Utils.waitframe();
                    }
                    if (!this._ccLabel) {
                        this._ccLabel = this.node.addComponent(cc_20.Label);
                    }
                    this._applyLabelInfo();
                }
                else {
                    let hasOldLabel = !!this._ccRichText;
                    if (this._ccLabel) {
                        this._ccLabel.destroy();
                        this._ccLabel = null;
                    }
                    if (this._textMeshLabel) {
                        this._textMeshLabel.destroy();
                        this._textMeshLabel = null;
                    }
                    if (hasOldLabel && env_6.EDITOR) {
                        await Utils_4.Utils.waitframe();
                    }
                    if (!this._ccRichText) {
                        this._ccRichText = this.node.addComponent(cc_20.RichText);
                    }
                    this._applyLabelInfo();
                }
            }
        }
        get label() {
            if (this._textMeshLabel) {
                return this._textMeshLabel;
            }
            else if (this._ccLabel) {
                return this._ccLabel;
            }
            else if (this._ccRichText) {
                return this._ccRichText;
            }
            return null;
        }
        _applyLabelInfo() {
            if (!this.label) {
                return;
            }
            if (this._textmeshMode) {
                this.fontName = this._fontName;
            }
            else {
                this.font = this._font;
            }
            this.string = this._string;
            this.fontSize = this._fontSize;
            this.color = this._color;
            this.overflow = this._overflow;
            this.horizontalAlign = this._horizontalAlign;
            this.verticalAlign = this._verticalAlign;
            this.letterSpace = this._letterSpace;
            this.underline = this._underline;
            this.bold = this._bold;
            this.italic = this._italic;
            this.singleLine = this._singleLine;
            this.stroke = this._stroke;
            this.lineHeight = this._lineHeight;
            this.strokeColor = this._strokeColor;
            if (this._shadowOffset.x != 0 || this._shadowOffset.y != 0) {
                this.shadowOffset = this._shadowOffset;
                this.shadowColor = this.shadowColor;
                this.shadowBlur = this.shadowBlur;
            }
        }
    };
    __decorate([
        property
    ], SuperLabel.prototype, "_richMode", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_textmeshMode", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_string", void 0);
    __decorate([
        property(cc_20.Font)
    ], SuperLabel.prototype, "_font", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_fontName", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_fontSize", void 0);
    __decorate([
        property(cc_20.Color)
    ], SuperLabel.prototype, "_color", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_overflow", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_horizontalAlign", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_verticalAlign", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_letterSpace", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_underline", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_bold", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_italic", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_singleLine", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_lineHeight", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_strokeColor", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_shadowColor", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_shadowBlur", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_shadowOffset", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "_stroke", void 0);
    __decorate([
        property
    ], SuperLabel.prototype, "textmeshMode", null);
    __decorate([
        property
    ], SuperLabel.prototype, "richMode", null);
    __decorate([
        property
    ], SuperLabel.prototype, "string", null);
    __decorate([
        property({ visible: function () { return !!this._ccLabel; } })
    ], SuperLabel.prototype, "font", null);
    __decorate([
        property({ visible: function () { return !!this._textMeshLabel; } })
    ], SuperLabel.prototype, "fontName", null);
    __decorate([
        property
    ], SuperLabel.prototype, "fontSize", null);
    __decorate([
        property
    ], SuperLabel.prototype, "color", null);
    __decorate([
        property
    ], SuperLabel.prototype, "stroke", null);
    __decorate([
        property
    ], SuperLabel.prototype, "strokeColor", null);
    __decorate([
        property({ type: cc_20.Vec2 })
    ], SuperLabel.prototype, "shadowOffset", null);
    __decorate([
        property
    ], SuperLabel.prototype, "shadowColor", null);
    __decorate([
        property
    ], SuperLabel.prototype, "shadowBlur", null);
    __decorate([
        property({ type: cc_20.Label.Overflow })
    ], SuperLabel.prototype, "overflow", null);
    __decorate([
        property({ type: cc_20.Label.HorizontalAlign })
    ], SuperLabel.prototype, "horizontalAlign", null);
    __decorate([
        property({ type: cc_20.Label.VerticalAlign })
    ], SuperLabel.prototype, "verticalAlign", null);
    __decorate([
        property
    ], SuperLabel.prototype, "letterSpace", null);
    __decorate([
        property
    ], SuperLabel.prototype, "underline", null);
    __decorate([
        property
    ], SuperLabel.prototype, "bold", null);
    __decorate([
        property
    ], SuperLabel.prototype, "italic", null);
    __decorate([
        property
    ], SuperLabel.prototype, "singleLine", null);
    __decorate([
        property
    ], SuperLabel.prototype, "lineHeight", null);
    SuperLabel = __decorate([
        ccclass('SuperLabel'),
        executeInEditMode
    ], SuperLabel);
    exports.SuperLabel = SuperLabel;
});
define("TextMesh/index", ["require", "exports", "TextMesh/font/TMFont", "TextMesh/label/types", "TextMesh/label/LayoutTypes", "TextMesh/label/TextMeshLabel", "TextMesh/label/events", "TextMesh/utils/ResManger", "TextMesh/utils/Utils", "TextMesh/utils/UBBParser", "TextMesh/label/CharInfo", "TextMesh/settings", "TextMesh/label/SuperLabel", "TextMesh/font/FontManager", "TextMesh/settings", "TextMesh/label/TextMeshLabel", "TextMesh/label/SuperLabel"], function (require, exports, TMFont_3, types_6, LayoutTypes_2, TextMeshLabel_3, events_2, ResManger_3, Utils_5, UBBParser_2, CharInfo_5, settings_4, SuperLabel_1, FontManager_3, settings_5, TextMeshLabel_4, SuperLabel_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(TMFont_3, exports);
    __exportStar(types_6, exports);
    __exportStar(LayoutTypes_2, exports);
    __exportStar(TextMeshLabel_3, exports);
    __exportStar(events_2, exports);
    __exportStar(ResManger_3, exports);
    __exportStar(Utils_5, exports);
    __exportStar(UBBParser_2, exports);
    __exportStar(CharInfo_5, exports);
    __exportStar(settings_4, exports);
    __exportStar(SuperLabel_1, exports);
    __exportStar(FontManager_3, exports);
    globalThis.TextMeshSettings = settings_5.TextMeshSettings;
    globalThis.TextMeshLabel = TextMeshLabel_4.TextMeshLabel;
    globalThis.SuperLabel = SuperLabel_2.SuperLabel;
});
define("TextMesh/label/TextMeshRenderData", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMeshRenderData = void 0;
    class TextMeshRenderData {
    }
    exports.TextMeshRenderData = TextMeshRenderData;
});
define("TextMesh/types/ISlot", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
