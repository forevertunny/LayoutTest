import {  Rect, Texture2D, __private, sp } from "cc";
import { ITMFont } from "../types/ITMFont";
import { Char } from "./Char";
import { IFontData } from "../types/IFontData";
import { TextureChannel } from "./TextureChannel";
import { FontHelper } from "./FontHelper";
import TinySDF from "../libs/tinysdf";
import { Utils } from "../utils/Utils";
import { CharConst } from "./const";
import { GlyphInfo, SpaceInfo } from "../types/types";
import { TMFontInfo } from "./FontParser";
import { PREVIEW } from "cc/env";
import LRU from 'lru-cache';

const CHAR_POOL: Char[] = [];

export class FontData implements IFontData {
    private _tmFont: ITMFont;
    private _texture: Texture2D = null;  
    private _staticLetters: Map<string, Char> = new Map();
    private _dynamicChannels: TextureChannel[];
    private _actualSize: number = 0;
    private _buffer: Uint8Array;
    private _fontRect: Rect = new Rect();
    private _safePadding = 2;
    private _lru:LRU<string, SpaceInfo>;
    // 空闲空间, 已经生成但是被释放的空间，与LRU中的空间互斥，LRU中的空间是正在使用的空间
    private _freeSpaces: SpaceInfo[] = [];

    public enableAutoFree = false;

    get tmFont(): ITMFont {
        return this._tmFont;
    }

    get texture(): Texture2D {
        return this._texture;
    }

    get spaceSize(): number {
        return this._actualSize;
    }

    get safePadding(): number {
        return this._safePadding;
    }

    constructor(tmFont: ITMFont, texture?: Texture2D, channels?: TextureChannel[], tmfInfo?: TMFontInfo) {
        this._tmFont = tmFont;
        this._dynamicChannels = channels || [];

        if(!texture) {
            this._texture = new Texture2D();
            this._texture.reset({
                mipmapLevel: 0,
                format: Texture2D.PixelFormat.RGBA8888,
                width: tmFont.textureWidth,
                height: tmFont.textureHeight,
            });

            if(PREVIEW) {
                this._buffer = new Uint8Array(tmFont.textureWidth * tmFont.textureHeight * 4);
                for(let i=0;i<this._buffer.length;i++) {
                    this._buffer[i] = 255;
                }
                Utils.uploadData(this._texture, this._buffer, new Rect(0, 0, tmFont.textureWidth, tmFont.textureHeight));
            }
        }else{
            this._texture = texture;
        }

        this._actualSize = TinySDF.calcuteFontSize(tmFont.fontSize, tmFont.padding);
        this._fontRect.set(0, 0, this.spaceSize, this.spaceSize);

        if(tmfInfo) {
            let keys = Object.keys(tmfInfo.chars);
            for(let i=0;i<keys.length;i++) {
                let code = keys[i];
                let char = Char.fromTMFCharInfo(code, tmfInfo, tmfInfo.chars[code]);
                char.static = true;
                this._staticLetters.set(code, char);
            }
        }
    }

    initial() {
        this.createDynamicChannels();
    }

    private createDynamicChannels() {
        this._dynamicChannels = [];
        if(!this._tmFont.dynamic || this._tmFont.staticChannels == 4) {
            return;
        }

        let capacity = 0;
        for(let i=0;i<4;i++) {
            if(i < this._tmFont.staticChannels) {
                this._dynamicChannels.push(null);
                continue;
            }

            let channel = new TextureChannel(this._tmFont, i, true);
            this._dynamicChannels.push(channel);

            capacity += channel.capacity;
        }  

        if(capacity > 0) {
            this._lru = new LRU<string, SpaceInfo>({
                max: capacity,
                dispose: (value, key) => {
                    if(value.char.ref <= 0) {
                        this._freeSpaces.push(value);
                        this._realRemove(value.char);
                    }
                }
            });
        }
    }

    removeDynamicChar(code: string) {
        // do nothing
    }

    private _realRemove(char: Char) {
        if(!this.enableAutoFree) {
            return;
        }

        if(char && !char.static) {
            let channel = this._dynamicChannels[char.cid];
            if(!channel) {
                return;
            }

            channel.freeChar(char.index);
        }
    }

    getRoundLine(): Char {
        return this.getCharInfo(CharConst.RoundLine, FontHelper.getRoundLine, FontHelper);
    }

    getRectLine(): Char {
        return this.getCharInfo(CharConst.RectLine, FontHelper.getRectLine, FontHelper);
    }

    getNoneChar(): Char {
        return this.getCharInfo(CharConst.NoneChar, FontHelper.getNoneChar, FontHelper);
    }

    private getSpace(code: string) {
        // 从空闲空间中获取
        let space = this._freeSpaces.shift();
        if(space) {
            CHAR_POOL.push(space.char);
            space.char = null;
            let channel = this._dynamicChannels[space.cid];
            channel.addUsed(space.index);
            return space;
        }

        let channel: TextureChannel = null;
        let totalChannel = this._dynamicChannels.length;
        for(let i=0;i<totalChannel;i++) {
            channel = this._dynamicChannels[i];
            if(!channel) {
                continue;
            }

            if(!channel.isFull()) {
                if(!channel.initialized) {
                    channel.initial();
                    this.clearChannel(channel.index);
                }
                break;
            }else{
                channel = null;
            }
        }

        if(!channel) {
            console.warn(`font ${this.tmFont.fontFamily} dynamic channels is full, can not get char ${code}`);
            return null;
        }
        space = channel.spanEmptySpace();
        if(!space) {
            console.warn(`font ${this.tmFont.fontFamily} dynamic channels is full, can not get char ${code}`);
            return null;
        }

        space.cid = channel.index;
        return space;
    }

    getCharInfo(code: string, charRender?:(code: string, tmFont: ITMFont) => GlyphInfo, thisRender?: any): Char {
        // 从静态字符集中获取字符信息
        let char = this._staticLetters.get(code);
        if(char) {
            return char;
        }

        if(!this.tmFont.dynamic) {
            console.warn(`font ${this.tmFont.fontFamily} is not dynamic, can not get char ${code}`);
            if(charRender == null) {
                return this.getNoneChar();
            }
        }

        // 从动态字符集中获取字符信息
        let sp = this.enableAutoFree ? this._lru.get(code) : this._lru.peek(code);
        if(sp) {
            let char = sp.char;
            return char;
        }

        if(!this.tmFont.dynamic || this.tmFont.staticChannels == 4) {
            if(charRender == null) {                
                // 静态字符集已满，无法获取字符信息， 返回占位符
                return this.getNoneChar();
            }
        }

        if(charRender && this._dynamicChannels.length == 0) {
            return null;
        }

        // 获取一个动态通道
        let space: SpaceInfo = this.getSpace(code);
        if(!space) {
            return this.getNoneChar();
        }

        // 创建新的字符信息
        let glyph = charRender ? charRender.call(thisRender, code, this._tmFont) : FontHelper.createSDFChar(code, this._tmFont);
        char = CHAR_POOL.pop() || new Char();
        space.char = char;
        char.code = code;
        char.index = space.index;
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
        let u0 = (space.x+this._safePadding) / this.tmFont.textureWidth;
        let v0 = (space.y+this._safePadding) / this.tmFont.textureHeight;
        let v1 = v0 + glyph.height / this.tmFont.textureHeight;
        let u1 = u0 + glyph.width / this.tmFont.textureWidth;
        char.uvs = new Float32Array([u0, v0, u1, v0, u0, v1, u1, v1]);
        char.cid = space.cid;

        this._fontRect.set(space.x, space.y, this.spaceSize, this.spaceSize);
        this.writeToTexture(code, space.cid, glyph);
        this._lru.set(code, space);
        
        return char;
    }

    /**
     * 隐患：微信开放域开启后，不能读取纹理数据
     * @param cid 
     */
    private clearChannel(cid: number) {
        let width = this._texture.width;
        let height = this._texture.height;
        let rect = new Rect(0, 0, width, height);
        this._buffer = Utils.readTexturePixels(this._texture, rect, this._buffer);

        for(let i=0;i<width;i++) {
            for(let j=0;j<height;j++) {
                let index = (j * width + i) * 4;
                this._buffer[index + cid] = 0;
            }
        }
        
        Utils.uploadData(this._texture, this._buffer, rect);
    }

    private writeToTexture(code: string, cid: number, glyhp: GlyphInfo) {        
        this._buffer = Utils.readTexturePixels(this._texture, this._fontRect, this._buffer);

        for(let i=0;i<this._fontRect.width;i++) {
            for(let j=0;j<this._fontRect.height;j++) {
                let index = (j * this._fontRect.width + i) * 4;

                if(i >= this._safePadding && i<glyhp.width+this._safePadding && 
                   j >= this._safePadding && j<glyhp.height+this._safePadding) {
                    let gi = i - this._safePadding;
                    let gj = j - this._safePadding;
                    let value = glyhp.data[gi + gj * glyhp.width];
                    this._buffer[index + cid] = value;
                }else{
                    this._buffer[index + cid] = 0;
                }

                // for debug
                // this._buffer[index + 3] = 255;
            }
        }
        
        delete glyhp.data;
        Utils.uploadData(this._texture, this._buffer, this._fontRect);
    }
}