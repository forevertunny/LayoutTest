import { Director, director, error, errorID, gfx, Rect, RenderTexture, Texture2D } from "cc";
import { DEV } from "cc/env";

const _regions: gfx.BufferTextureCopy[] = [new gfx.BufferTextureCopy()];

export class Utils {
    static readTexturePixels(src: RenderTexture | Texture2D, rect?: Rect, buffer?: Uint8Array) {
        rect = rect || new Rect(0, 0, src.width, src.height);

        rect.x = Math.floor(rect.x);
        rect.y = Math.floor(rect.y);
        rect.width = Math.floor(rect.width);
        rect.height = Math.floor(rect.height);

        const gfxTexture = src.getGFXTexture();
        if (!gfxTexture) {
            errorID(7606);
            return null;
        }

        const needSize = 4 * rect.width * rect.height;
        if (buffer === undefined) {
            buffer = new Uint8Array(needSize);
        } else if (buffer.length < needSize) {
            errorID(7607, needSize);
            return null;
        }

        const bufferViews: ArrayBufferView[] = [];
        const regions: gfx.BufferTextureCopy[] = [];

        const region0 = new gfx.BufferTextureCopy();
        region0.texOffset.x = rect.x;
        region0.texOffset.y = rect.y;
        region0.texExtent.width = rect.width;
        region0.texExtent.height = rect.height;
        regions.push(region0);

        bufferViews.push(buffer);

        const gfxDevice = src["_getGFXDevice"]();
        gfxDevice?.copyTextureToBuffers(gfxTexture, bufferViews, regions);

        return buffer;
    }

    static uploadData(target: RenderTexture | Texture2D, source: HTMLCanvasElement | HTMLImageElement | ArrayBufferView | ImageBitmap, rect?: Rect, level = 0, arrayIndex = 0) {
        let gfxTexture = target.getGFXTexture();
        //@ts-ignore
        if (!gfxTexture || target._mipmapLevel <= level) {
            return;
        }

        //@ts-ignore
        const gfxDevice: gfx.Device = target._getGFXDevice();
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
        } else {
            region.texOffset.x = 0;
            region.texOffset.y = 0;
            //@ts-ignore
            region.texExtent.width = target._textureWidth >> level;
            //@ts-ignore
            region.texExtent.height = target._textureHeight >> level;
        }

        region.texSubres.mipLevel = level;
        region.texSubres.baseArrayLayer = arrayIndex;

        if (DEV) {
            if (source instanceof HTMLElement) {
                if (source.height > region.texExtent.height
                    || source.width > region.texExtent.width) {
                    error(`Image source(${target.name}) bounds override.`);
                }
            }
        }

        if (ArrayBuffer.isView(source)) {
            gfxDevice.copyBuffersToTexture([source], gfxTexture, _regions);
        } else {
            gfxDevice.copyTexImagesToTexture([source], gfxTexture, _regions);
        }
    }

    public static until(condition: () => boolean): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let func = () => {
                if (condition()) {
                    director.off(Director.EVENT_BEGIN_FRAME, func, this);
                    resolve();
                }
            };
            director.on(Director.EVENT_BEGIN_FRAME, func, this);
        });
    }

    public static async wait(time: number) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    public static async waitframe() {
        return new Promise<void>((resolve, reject) => {
            director.once(Director.EVENT_BEGIN_FRAME, () => {
                resolve();
            });
        });
    }

    static arrayBufferToString(buffer: ArrayBuffer, begin = 0) {
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

            } else if ((flag & 0xF8) === 0xF8) {
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
                unicode = (buf[pos] & 0x1F) << 12;;
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