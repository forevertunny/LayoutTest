import { gfx, ImageAsset, Texture2D } from "cc";

export class LetterRenderTexture extends Texture2D {
    /**
     * @en
     * Init the render texture with size.
     * @zh
     * 初始化 render texture。
     * @param [width]
     * @param [height]
     * @param [string]
     */
    public initWithSize (width: number, height: number, format: number = 35) {
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
    public drawTextureAt (image: ImageAsset, x: number, y: number) {
        const gfxTexture = this.getGFXTexture();
        if (!image || !gfxTexture) {
            return;
        }

        const gfxDevice = this._getGFXDevice();
        if (!gfxDevice) {
            console.warn('Unable to get device');
            return;
        }

        const region = new gfx.BufferTextureCopy();
        region.texOffset.x = x;
        region.texOffset.y = y;
        region.texExtent.width = image.width;
        region.texExtent.height = image.height;
        gfxDevice.copyTexImagesToTexture([image.data as HTMLCanvasElement], gfxTexture, [region]);
    }
}