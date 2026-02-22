import { BitmapFont, Color, Component, Font, Label, LabelOutline, LabelShadow, RichText, SpriteAtlas, SpriteFrame, TTFFont, Vec2, _decorator, js, math } from "cc";
import { SlotSpriteFrameHandlerType, TextMeshLabel } from './TextMeshLabel';
import { TextMeshSettings } from "../settings";
import { EDITOR } from "cc/env";
import { Utils } from "../utils/Utils";

const { ccclass, executeInEditMode, property } = _decorator;
const tempVec2 = new Vec2();

@ccclass('SuperLabel')
@executeInEditMode
export class SuperLabel extends Component {   
    private _ccLabel: Label = null;
    private _outline: LabelOutline = null;
    private _shadow: LabelShadow = null;
    private _ccRichText: RichText = null;

    private _textMeshLabel: TextMeshLabel = null;

    public slotSpriteFrameCreateHandler: SlotSpriteFrameHandlerType = null;

    @property
    private _richMode: boolean = false;
    @property
    private _textmeshMode: boolean = true;
    @property
    private _string: string = "";
    @property(Font)
    private _font: Font = null;
    @property   
    private _fontName: string = "";
    @property
    private _fontSize: number = 20;
    @property(Color)
    private _color: Color = new Color(255, 255, 255, 255);
    @property
    private _overflow: number = 0;
    @property
    private _horizontalAlign: number = 0;
    @property
    private _verticalAlign: number = 0;
    @property
    private _letterSpace: number = 0;
    @property
    private _underline: boolean = false;
    @property
    private _bold: boolean = false;
    @property
    private _italic: boolean = false;
    @property
    private _singleLine: boolean = false;
    @property
    private _lineHeight: number = 40;
    @property
    private _lineSpace: number = 4;
    @property
    private _strokeColor: Color = new Color(0, 0, 0, 255);
    @property
    private _shadowColor: Color = new Color(0, 0, 0, 255);
    @property
    private _shadowBlur: number = 0;
    @property
    private _shadowOffset: Vec2 = new Vec2();
    @property
    private _stroke: number = 0;

    public imageAtlas: SpriteAtlas;

    @property
    public get textmeshMode(): boolean {
        return this._textmeshMode;
    }

    public set textmeshMode(value: boolean) {
        if(this._textmeshMode === value) {
            if(value && this._textMeshLabel || !value && (!this._richMode && this._ccLabel || this._richMode && this._ccRichText)) {
                return;
            }
        }

        this._textmeshMode = value;
        this._changeMode(value);
    }

    @property
    public get richMode(): boolean {
        return this._richMode;
    }

    public set richMode(value: boolean) {
        if(this._richMode === value) {
            return;
        }

        this._richMode = value;
        this._changeMode(this._textmeshMode);
    }

    public setMode(textmesh: boolean, rich: boolean) {
        this._textmeshMode = textmesh;
        this._richMode = rich;
        this._changeMode(textmesh);
    }

    @property({multiline: true})
    public get string(): string {
        return this._string;
    }

    public set string(value: string) {
        this._string = value;
        if(this.label) {
            this.label.string = value;
        }
    }

    @property({visible: function() { return !!this._ccLabel; }})
    public get font(): Font {
        return this._font;
    }    

    public set font(value: Font) {
        this._font = value;

        if(this._ccLabel) {
            this._ccLabel.font = value;
            if(!value) {
                this._ccLabel.useSystemFont = true;
            }
        }

        if(this._ccRichText) {
            if(value) {
                // @ts-ignore
                this._ccRichText.font = value;
            }else{
                this._ccRichText.useSystemFont = true;
            }
        }

        if(value) {
            this.textmeshMode = false;
        }
    }

    @property({visible: function() { return !!this._textMeshLabel; }})
    public get fontName(): string {
        return this._fontName;
    }

    public set fontName(value: string) {
        this._fontName = value;

        if(this._textMeshLabel) {
            this._textMeshLabel.fontName = value;
        }

        if(value) {
            this.textmeshMode = true;
        }
    }

    @property
    public get fontSize(): number {
        return this._fontSize;
    }

    public set fontSize(value: number) {
        this._fontSize = value;

        if(this.label) {
            this.label.fontSize = value;
        }
    }

    @property
    public get color(): Color {
        return this._color;
    }

    public set color(value: Color) {
        this._color.set(value);

        if(this.label) {
            if(this.label instanceof TextMeshLabel || this.label instanceof Label) {
                this.label.color = value;
            }
        }
    }

    @property
    public get stroke(): number {
        return this._stroke;
    }

    private get enableStroke() {
        let ret = this._stroke > 0;
        if(this._ccLabel) {
            if(ret) {
                if(!this._outline) {
                    this._outline = this.node.addComponent(LabelOutline);
                }

                this.updateOutline();
            }else{
                if(this._outline) {
                    this._outline.destroy();
                    this._outline = null;
                }
            }
        }
        return ret;
    }

    public set stroke(value: number) {
        this._stroke = value;

        if(this._ccLabel) {
            if(!this.enableStroke) {
                return;
            }

            this._outline.width = value;
        }else if(this._textMeshLabel) {
            const font = this._textMeshLabel.font;
            if(font) {
                this._textMeshLabel.stroke = math.clamp01(value / this.fontSize);
                this._textMeshLabel.strokeBlur = font.strokeBlur;
            }
            this.updateOutline();
        }
    }

    @property
    public get strokeColor(): Color {
        return this._strokeColor;
    }

    public set strokeColor(value: Color) {
        this._strokeColor.set(value);

        if(this._ccLabel) {
            if(!this.enableStroke) {
                return;
            }
            this._outline.color = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.strokeColor = value;
        }
    }

    private updateOutline() {
        if(this._ccLabel) {
            this._outline.width = this._stroke;
            this._outline.color = this._strokeColor;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.stroke = this._stroke / this.fontSize;
            this._textMeshLabel.strokeColor = this._strokeColor;
        }
    }

    @property({type: Vec2})
    public get shadowOffset(): Vec2 {
        return this._shadowOffset;
    }

    private get enableShadow() {
        let ret = this._shadowOffset.x != 0 || this._shadowOffset.y != 0;
        if(this._ccLabel) {
            if(!this._shadow) {
                this._shadow = this.node.addComponent(LabelShadow);

                this.updateShadow();
            }
        }
        return ret;
    }

    private updateShadow() {
        if(this._ccLabel) {
            this._shadow.offset = this._shadowOffset;
            this._shadow.color = this._shadowColor;
            this._shadow.blur = this._shadowBlur;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.shadowOffsetX = this._shadowOffset.x;
            this._textMeshLabel.shadowOffsetY = -this._shadowOffset.y;
            this._textMeshLabel.shadowColor = this._shadowColor;
            this._textMeshLabel.shadowBlur = this._shadowBlur;
        }
    }

    public set shadowOffset(value: Vec2) {
        this._shadowOffset.set(value);

        if(this._ccLabel) {
            if(!this.enableShadow) {
                return;
            }
            tempVec2.set(value.x, value.y);
            this._shadow.offset = tempVec2;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.shadowOffsetX = value.x;
            this._textMeshLabel.shadowOffsetY = -value.y;
            if(!this.enableShadow) {
                this._textMeshLabel.shadow = 0;
            }else{
                const font = this._textMeshLabel.font;
                if(font) {
                    if(this._textMeshLabel.shadow <= 0) {
                        this._textMeshLabel.shadow = font.shadowSize;
                    }
                    this._textMeshLabel.shadowBlur = font.shadowBlur;

                    this.updateShadow();
                }
            }
        }
    }

    @property
    public get shadowColor(): Color {
        return this._shadowColor;
    }

    public set shadowColor(value: Color) {
        this._shadowColor.set(value);

        if(this._ccLabel) {
            if(!this.enableShadow) {
                return;
            }
            this._shadow.color = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.shadowColor = value;
        }
    }

    @property
    public get shadowBlur(): number {
        return this._shadowBlur;
    }

    public set shadowBlur(value: number) {
        this._shadowBlur = value;

        if(this._ccLabel) {
            if(!this.enableShadow) {
                return;
            }
            this._shadow.blur = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.shadowBlur = value;
        }
    }
    
    @property({type: Label.Overflow})
    public get overflow(): number {
        return this._overflow;
    }

    public set overflow(value: number) {
        this._overflow = value;

        if(!this.label) {
            return;
        }
        
        if(this.label instanceof Label || this.label instanceof TextMeshLabel) {
            this.label.overflow = value;
        }
    }

    @property({type: Label.HorizontalAlign})
    public get horizontalAlign(): number {
        return this._horizontalAlign;
    }

    public set horizontalAlign(value: number) {
        this._horizontalAlign = value;

        if(this.label) {
            this.label.horizontalAlign = value;
        }
    }

    @property({type: Label.VerticalAlign})
    public get verticalAlign(): number {
        return this._verticalAlign;
    }

    public set verticalAlign(value: number) {
        this._verticalAlign = value;

        if(this.label) {
            this.label.verticalAlign = value;
        }
    }

    @property
    public get letterSpace(): number {
        return this._letterSpace;
    }

    public set letterSpace(value: number) {
        this._letterSpace = value;

        if(this._ccLabel) {
            this._ccLabel.spacingX = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.letterSpace = value;
        }
    }

    @property
    public get underline(): boolean {
        return this._underline;
    }

    public set underline(value: boolean) {
        this._underline = value;

        if(this._ccLabel) {
            this._ccLabel.isUnderline = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.enableUnderline = value;
        }
    }

    @property
    public get bold(): boolean {
        return this._bold;
    }

    public set bold(value: boolean) {
        this._bold = value;

        if(this._ccLabel) {
            this._ccLabel.isBold = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.enableBold = value;
        }
    }

    @property
    public get italic(): boolean {
        return this._italic;
    }

    public set italic(value: boolean) {
        this._italic;

        if(this._ccLabel) {
            this._ccLabel.isItalic = value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.enableItalic = value;
        }
    }

    @property
    public get singleLine(): boolean {
        return this._singleLine;
    }

    public set singleLine(value: boolean) {
        this._singleLine = value;

        if(this._ccLabel) {
            this._ccLabel.enableWrapText = !value;
        }else if(this._textMeshLabel) {
            this._textMeshLabel.autoWarp = true;
            // this._textMeshLabel.multiline = !value;
        }
    }

    @property
    public get lineHeight(): number {
        return this._lineHeight;
    }

    public set lineHeight(value: number) {
        this._lineHeight = value;

        if(this.label) {
            this.label.lineHeight = value;
        }
    }

    @property
    public get lineSpace(): number {
        return this._lineSpace;
    }

    public set lineSpace(value: number) {
        this._lineSpace = value;

        if(this._textMeshLabel) {
            this._textMeshLabel.lineSpace = value;
        }
    }

    public onLoad(): void {
        if(TextMeshSettings.disableTextMesh) {
            this.textmeshMode = false;
        }
        this.buildLabel();
    }

    public buildLabel() {
        // @ts-ignore
        this._textMeshLabel = this.node.getComponent(TextMeshLabel) as TextMeshLabel;
        this._ccLabel = this.node.getComponent(Label);
        this._outline = this.node.getComponent(LabelOutline);
        this._shadow = this.node.getComponent(LabelShadow);

        this._changeMode(this._textmeshMode);
    }

    private async _changeMode(useTexMesh: boolean) { 
        this._textmeshMode = useTexMesh = useTexMesh && !TextMeshSettings.disableTextMesh;

        this._ccLabel = this.node.getComponent(Label);
        // @ts-ignore
        this._textMeshLabel = this.node.getComponent(TextMeshLabel);
        this._ccRichText = this.node.getComponent(RichText);

        if(useTexMesh) {
            let hasOldLabel = !!this._ccLabel;

            if(this._outline) {
                this._outline.destroy();
                this._outline = null;
            }

            if(this._shadow) {
                this._shadow.destroy();
                this._shadow = null;
            }  

            if(this._ccLabel) {
                this._ccLabel.destroy();
                this._ccLabel = null;
            }      

            if(this._ccRichText) {
                this._ccRichText.destroy();
                this._ccRichText = null;
            }
            
            if(hasOldLabel && EDITOR) {
                await Utils.waitframe();
            }

            if(!this._textMeshLabel) {
                // @ts-ignore
                this._textMeshLabel = this.node.addComponent(TextMeshLabel);
            }
            
            this._textMeshLabel.rich = this._richMode;
            this._applyLabelInfo();
        }else{       
            if(!this._richMode) {
                let hasOldLabel = !!this._textMeshLabel;
                
                if(this._ccRichText) {
                    this._ccRichText.destroy();
                    this._ccRichText = null;
                }

                if(this._textMeshLabel) {
                    this._textMeshLabel.destroy();
                    this._textMeshLabel = null;
                }
    
                if(hasOldLabel && EDITOR) {
                    await Utils.waitframe();
                }
    
                if(!this._ccLabel) {
                    this._ccLabel = this.node.addComponent(Label);
                }
                this._applyLabelInfo();
            }else{
                let hasOldLabel = !!this._ccRichText;
                
                if(this._ccLabel) {
                    this._ccLabel.destroy();
                    this._ccLabel = null;
                }

                if(this._textMeshLabel) {
                    this._textMeshLabel.destroy();
                    this._textMeshLabel = null;
                }

                if(hasOldLabel && EDITOR) {
                    await Utils.waitframe();
                }

                if(!this._ccRichText) {
                    this._ccRichText = this.node.addComponent(RichText);                
                }
                this._applyLabelInfo();
            }
        }
    }

    public get label(): Label | TextMeshLabel | RichText{
        if(this._textMeshLabel) {
            return this._textMeshLabel;
        }else if(this._ccLabel) {
            return this._ccLabel;
        }else if(this._ccRichText) {
            return this._ccRichText;
        }
        return null;
    }

    private _applyLabelInfo() {
        if(!this.label) {
            return;
        }

        if(this._textmeshMode) {
            this.fontName = this._fontName;
        }else{
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
        this.lineSpace = this._lineSpace;
        this.strokeColor = this._strokeColor;    

        if(this._shadowOffset.x != 0 || this._shadowOffset.y != 0) {
            this.shadowOffset = this._shadowOffset;
            this.shadowColor = this.shadowColor;
            this.shadowBlur = this.shadowBlur;
        }

        if(this._textMeshLabel) {
            this._textMeshLabel.setSlotSpriteFrameCreateHandler(this.slotSpriteFrameCreateHandler);
        }

        if(this._ccRichText) {
            this._ccRichText.imageAtlas = this.imageAtlas;
        }
    }
}
