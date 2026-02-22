import {BufferAsset, CCString, Component, Font, Game, Layers, Material, Node, Size, Sprite, SpriteFrame, UITransform, _decorator, assetManager, director, game, view, Enum} from "cc";
import { TMFont } from "./TMFont";
import { EDITOR } from "cc/env";
import { Utils } from "../utils/Utils";
import {FontType} from "db://text-mesh/font/FontType";
const { ccclass, property, executeInEditMode, executionOrder, disallowMultiple } = _decorator;
const DEFALUT_FONT_NAME = "Arial";
const DEFALUT_FONT_NAME_3D = "Arial3D";

@ccclass("RegistFontInfo")
export class RegistFontInfo {
    @property({visible: false})
    private _fontName: string;

    @property({type: Enum(FontType)})
    get fontName(): string {
        return this._fontName;
    }

    set fontName(value: string) {

        if (this._fontName === value) {
            return;
        }

        FontManager.instance.removeFont(this._fontName);
        this._fontName = value;
        if (EDITOR && this.canLoad()) {
            FontManager.instance._loadFont(this.fontName);
        }
    }

    @property({ type: BufferAsset, visible: false })
    private _fontData: BufferAsset = null;

    @property({ type: BufferAsset })
    get fontData(): BufferAsset {
        return this._fontData;
    }

    set fontData(value: BufferAsset) {
        if (this._fontData === value) {
            return;
        }

        FontManager.instance.removeFont(this._fontName);
        this._fontData = value;
        if (EDITOR && this.canLoad()) {
            FontManager.instance._loadFont(this.fontName);
        }
    }

    @property({ type: Material, visible: false })
    private _material: Material = null;

    @property({ type: Material })
    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        if (this._material === value) {
            return;
        }

        this._material = value;
        if (EDITOR && this.canLoad()) {
            FontManager.instance._loadFont(this.fontName);
        }
    }

    private canLoad() {
        return this._fontName && this._fontData;
    }
}

export class FontInfo {
    fontName: string;
    package: string;
    /**
     * font path
     */
    font: string;
    /**
     * Material
     */
    material: string;
}

export class FM {
    static fontMap: Map<string, TMFont> = new Map();

    private static async loadDefaultFont(is3D: boolean = false) {
        if(!FontManager.instance) {
            // @ts-ignore
            FontManager._instance = new FontManager();
        }

        let material:Material = null;
        let materialUUID = is3D ? "88199481-7036-4137-84c6-220a30978050" : "c0552647-e74b-4dd9-b7ee-971ea730d840";
        assetManager.loadAny({uuid: materialUUID}, (err, asset) => {
            if(err) {
                console.error(err);
                return;
            }

            material = asset;
        });

        let fontAsset:BufferAsset = null;
        assetManager.loadAny({uuid: "7eeb945d-1451-46d7-b2fb-ee1e8408c949"}, (err, asset: BufferAsset) => {
            if(err) {
                console.error(err);
                return;
            }

            fontAsset = asset;
        });

        await Utils.until(()=>!!material && !!fontAsset);
        
        let fontName = is3D ? DEFALUT_FONT_NAME_3D : DEFALUT_FONT_NAME;
        return await FontManager.instance.loadFont(fontName, fontAsset, material);
    }

    static getFont(fontName: string) {
        let font = FM.fontMap.get(fontName);

        if(font) {
            return font;
        }

        font = FM.fontMap.get(DEFALUT_FONT_NAME);
        if(font) {
            return font;
        }

        return null;
    }

    static async getFontAsync(fontName: string) {
        if(FontManager.instance && FontManager.instance.hasRegistFont(fontName)) {
            let font = await FontManager.instance.getFontAsync(fontName);
            if(font) {
                return font;
            }
        }
        
        return await this.loadDefaultFont(fontName == DEFALUT_FONT_NAME_3D);
    }
}

@ccclass("FontManager")
@executeInEditMode
@disallowMultiple
@executionOrder(-100)
export class FontManager extends Component {
    private static _instance: FontManager = null;
    public static get instance(): FontManager {
        return FontManager._instance;
    }

    private _fontMap: Map<string, TMFont> = new Map();
    private _loadingMap: Map<string, Array<Function>> = new Map();
    private _registFontMap: Map<string, RegistFontInfo> = new Map();

    @property({ type: [RegistFontInfo], visible: true })
    private _registFonts: RegistFontInfo[] = [];

    static async create(fonts: FontInfo[]) {
        let node = new Node();
        node.name = "FontManager";
        let fontManager = node.addComponent(FontManager);
        director.getScene().addChild(node);

        let loadTasks = fonts.map((font) => {
            let task = new Promise((resolve) => {
                const bundle = assetManager.getBundle(font.package);
                bundle.load([font.font, font.material], null, async (err, assets) => {
                    if (err) {
                        console.error(err);
                        resolve(null);
                        return;
                    }

                    let info = new RegistFontInfo();
                    info.fontName = font.fontName;
                    info.fontData = bundle.get(font.font) as BufferAsset;
                    info.material = bundle.get(font.material) as Material;
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

    hasRegistFont(fontName: string) {
        return this._registFontMap.has(fontName);
    }

    onLoad() {
        if (!EDITOR) {
            if (FontManager._instance) {
                return;
            }
            game.addPersistRootNode(this.node);
        }

        FontManager._instance = this;
        this.refresh();
        this.loadAllRegistFont();
    }

    public onFocusInEditor(): void {
        FontManager._instance = this;
    }

    refresh() {
        this._registFontMap.clear();
        this._registFonts.forEach((info) => {
            this._registFontMap.set(info.fontName, info);
        });
    }

    private async loadAllRegistFont() {
        let loadTask: Promise<TMFont>[] = [];
        for (let fontName of this._registFontMap.keys()) {
            if (EDITOR) {
                if (!fontName || !this._fontMap.get(fontName)) {
                    continue;
                }
            }

            loadTask.push(this.loadFont(fontName));
        }

        await Promise.all(loadTask);
    }

    public getFont(fontName: string) {
        return this._fontMap.get(fontName);
    }

    public async getFontAsync(fontName: string) {
        if (!fontName) {
            return null;
        }

        if (this._fontMap.get(fontName)) {
            return this._fontMap.get(fontName);
        }

        return await this.loadFont(fontName);
    }

    public async loadFont(fontName: string, fontData: BufferAsset = null, material?: Material) {
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
        fontData = fontData || info?.fontData;
        material = material || info?.material;
        if (!fontData) {
            console.error(`font ${fontName} not found`);
            return null;
        }

        this._loadingMap.set(fontName, []);
        let tmf = await TMFont.deserializeAsync(fontData, material);
        this._fontMap.set(fontName, tmf);

        let callbacks = this._loadingMap.get(fontName);
        this._loadingMap.delete(fontName);
        callbacks.forEach((callback) => {
            callback(tmf);
        });

        FM.fontMap.set(fontName, tmf);

        return tmf;
    }

    public async _loadFont(fontName: string) {
        if (EDITOR) {
            this.refresh();
        }

        let info = this._registFontMap.get(fontName);
        if (!info || !info.fontData) {
            console.error(`font ${fontName} not found`);
            return;
        }

        return await this.loadFont(fontName, info.fontData, info.material);
    }

    public removeFont(fontName: string) {
        this._fontMap.delete(fontName);
    }

    protected onDestroy(): void {
        game.removePersistRootNode(this.node);

        FontManager._instance = null;
    }

    public async showFontTexture(fontName: string) {
        let font = FontManager.instance.getFont(fontName);
        if (!font) {
            return;
        }

        //@ts-ignore
        let canvs = director.getScene().getChildByName("Canvas") as Node;
        if (!canvs) {
            console.error("Canvas not found");
            return;
        }

        let sprite = canvs.getChildByName("FontSprite");
        if (!sprite) {
            sprite = new Node("FontSprite");
            sprite.layer = Layers.Enum.UI_2D;
            canvs.addChild(sprite);
            sprite.setPosition(0, 200);

            let size = view.getVisibleSize();
            let utr = sprite.addComponent(UITransform);
            let sp = sprite.addComponent(Sprite);
            sp.spriteFrame = new SpriteFrame();
            sp.sizeMode = Sprite.SizeMode.CUSTOM;
            sp.spriteFrame.texture = font.fontData.texture;
            let width = Math.min(size.width, size.height);
            utr.contentSize = new Size(width, width);

            sprite.on(Node.EventType.TOUCH_END, (event) => {
                sprite.active = false;
            });
        } else {
            let sp = sprite.getComponent(Sprite);
            sp.spriteFrame.texture = font.fontData.texture;
            sprite.active = true;
        }
    }
}
