import { Measure, MeasureText } from "./MeasureText";

export interface IText {
    width: number;
    height: number;
    updateText();
}

export interface IFont {
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
}

export interface ITextStyle {
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    backgroundColor?: string;
    color?: string;
    stroke?: string;
    strokeThickness?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowStroke?: boolean;
    shadowFill?: boolean;
    align?: string;
    maxLines?: number;
    fixedWidth?: number;
    fixedHeight?: number;
    resolution?: number;
    rtl?: boolean;
    testString?: string;
    baselineX?: number;
    baselineY?: number;
    wordWrapWidth?: number;
}

export type TextStyleWordWrapCallback = (text: string, textObject: Text)=>void;

export class TextStyle {
    parent: IText;
    fontFamily?: string = 'Arial';
    fontSize?: string = "16px";
    fontStyle?: string = "";
    backgroundColor?: string = '#fff';
    color?: string = '#000';
    stroke?: string = '#000';
    strokeThickness: number = 0;
    shadowOffsetX?: number = 0;
    shadowOffsetY?: number = 0;
    shadowColor?: string = '#000';
    shadowBlur?: number = 0;
    shadowStroke?: boolean = false;
    shadowFill?: boolean = false;
    align?: string = 'left';
    maxLines?: number = 0;
    fixedWidth?: number = 0;
    fixedHeight?: number = 0;
    resolution?: number = 0;
    rtl?: boolean = false;
    testString?: string = '|MÃ‰qgy';
    baselineX?: number = 1.2;
    baselineY?: number = 1.4;
    wordWrapWidth?: number = 0;
    wordWrapCallback?: TextStyleWordWrapCallback;
    wordWrapCallbackScope?: any;
    wordWrapUseAdvanced?: boolean = false;

    metrics: Measure = {
        ascent: 0,
        descent: 0,
        fontSize: 0
    };
    private _font: string;

    constructor (text: IText, style?: any) {
        this.parent = text;
        this.fontStyle = style;

        this.metrics = MeasureText.create(this);
    }

    setStyle(style?: ITextStyle, updateText?: boolean, setDefaults?: boolean) {
        if (updateText === undefined) { updateText = true; }
        if (setDefaults === undefined) { setDefaults = false; }

        style = style || {};

        let keys = Object.keys(style);
        for (var key in keys) {
            this[key] = style[key];
        }

        this._font = [ this.fontStyle, this.fontSize, this.fontFamily ].join(' ').trim();

        if (updateText) {
            return this.update(true);
        }
    }
    
    syncFont(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        context.font = this._font;
    }

    syncStyle(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
        context.textBaseline = 'alphabetic';

        context.fillStyle = this.color;
        context.strokeStyle = this.stroke;

        context.lineWidth = this.strokeThickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
    }

    syncShadow(context: CanvasRenderingContext2D, enabled: boolean) {
        if (enabled) {
            context.shadowOffsetX = this.shadowOffsetX;
            context.shadowOffsetY = this.shadowOffsetY;
            context.shadowColor = this.shadowColor;
            context.shadowBlur = this.shadowBlur;
        } else {
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowColor = '#000';
            context.shadowBlur = 0;
        }
    }

    update(recalculateMetrics) {
        if (recalculateMetrics) {
            this._font = [ this.fontStyle, this.fontSize, this.fontFamily ].join(' ').trim();

            this.metrics = MeasureText.create(this);
        }

        return this.parent.updateText();
    }
    
    setFont(font: IFont, updateText?: boolean) {
        if (updateText === undefined) { updateText = true; }

        var fontFamily = font.fontFamily;
        var fontSize = font.fontSize;
        var fontStyle = font.fontStyle;        

        if (fontFamily !== this.fontFamily || fontSize !== this.fontSize || fontStyle !== this.fontStyle) {
            this.fontFamily = fontFamily;
            this.fontSize = fontSize;
            this.fontStyle = fontStyle;

            if (updateText)
            {
                this.update(true);
            }
        }

        return this.parent;
    }
    
    setFontFamily(family: string)
    {
        if (this.fontFamily !== family) {
            this.fontFamily = family;
            this.update(true);
        }

        return this.parent;
    }
    
    setFontStyle(style: string) {
        if (this.fontStyle !== style)
        {
            this.fontStyle = style;

            this.update(true);
        }

        return this.parent;
    }

    setFontSize(size: string | number) {
        if (typeof size === 'number') {
            size = size.toString() + 'px';
        }

        if (this.fontSize !== size) {
            this.fontSize = size;

            this.update(true);
        }

        return this.parent;
    }
   
    setTestString(string: string)
    {
        this.testString = string;

        return this.update(true);
    }

    setFixedSize(width: number, height: number)
    {
        this.fixedWidth = width;
        this.fixedHeight = height;

        if (width)
        {
            this.parent.width = width;
        }

        if (height)
        {
            this.parent.height = height;
        }

        return this.update(false);
    }
 
    setBackgroundColor(color: string) {
        this.backgroundColor = color;

        return this.update(false);
    }

    setFillfunction (color: string) {
        this.color = color;

        return this.update(false);
    }

    setColor(color: string) {
        this.color = color;

        return this.update(false);
    }

    setResolution(value: number) {
        this.resolution = value;

        return this.update(false);
    }

    setStroke(color: string, thickness: number) {
        if (thickness === undefined) { thickness = this.strokeThickness; }

        if (color === undefined && this.strokeThickness !== 0)
        {
            //  Reset the stroke to zero (disabling it)
            this.strokeThickness = 0;

            this.update(true);
        }
        else if (this.stroke !== color || this.strokeThickness !== thickness)
        {
            this.stroke = color;
            this.strokeThickness = thickness;

            this.update(true);
        }

        return this.parent;
    }

    setShadow(x: number, y=0, color = '#000', blur = 0, shadowStroke = false, shadowFill = true) {
        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (color === undefined) { color = '#000'; }
        if (blur === undefined) { blur = 0; }
        if (shadowStroke === undefined) { shadowStroke = false; }
        if (shadowFill === undefined) { shadowFill = true; }

        this.shadowOffsetX = x;
        this.shadowOffsetY = y;
        this.shadowColor = color;
        this.shadowBlur = blur;
        this.shadowStroke = shadowStroke;
        this.shadowFill = shadowFill;

        return this.update(false);
    }

    setShadowOffset(x?:number, y?:number) {
        if (x === undefined) { x = 0; }
        if (y === undefined) { y = x; }

        this.shadowOffsetX = x;
        this.shadowOffsetY = y;

        return this.update(false);
    }

    setShadowColor(color?: string) {
        if (color === undefined) { color = '#000'; }

        this.shadowColor = color;

        return this.update(false);
    }

    setShadowBlur(blur?: number) {
        if (blur === undefined) { blur = 0; }

        this.shadowBlur = blur;

        return this.update(false);
    }

    setShadowStroke(enabled: boolean) {
        this.shadowStroke = enabled;

        return this.update(false);
    }

    setShadowFill(enabled: boolean) {
        this.shadowFill = enabled;

        return this.update(false);
    }

    setWordWrapWidth (width: number, useAdvancedWrap?: boolean) {
        if (useAdvancedWrap === undefined) { useAdvancedWrap = false; }

        this.wordWrapWidth = width;
        // this.wordWrapUseAdvanced = useAdvancedWrap;

        return this.update(false);
    }

    setWordWrapCallback(callback:TextStyleWordWrapCallback, scope?: any) {
        if (scope === undefined) { scope = null; }

        this.wordWrapCallback = callback;
        this.wordWrapCallbackScope = scope;

        return this.update(false);
    }

    setAlign(align?: string) {
        if (align === undefined) { align = 'left'; }

        this.align = align;

        return this.update(false);
    }

    setMaxLines(max?: number) {
        if (max === undefined) { max = 0; }

        this.maxLines = max;

        return this.update(false);
    } 

    getTextMetrics(): Measure {
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