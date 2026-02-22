
import { errorID, getBaselineOffset, gfx, ImageAsset, Rect, RenderTexture, Texture2D } from "cc";
import { WECHAT } from "cc/env";
import { GlyphInfo } from "../../types/types";
import { CanvasPool } from "../../utils/CanvasPool";
import { LetterRenderTexture } from "../../utils/LetterRenderTexture";

const INF = 1e20;
const temp_rect = new Rect;
const temp_buff = new Uint8Array;

var SUPPORT_FULL_METRICS: boolean = null;

export default class TinySDF {
    buffer: number;
    cutoff: number;
    radius: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    size: number;
    gridOuter: Float64Array;
    gridInner: Float64Array;
    f: Float64Array;
    d: Float64Array;
    z: Float64Array;
    v: Uint16Array;
    middle: number;

    fontSize: number;
    fontFamily: string = 'sans-serif';
    fontWeight: string;
    fontStyle: string;
    cacheCanvas = true;
    trimBuffer = false;
    
    private antiAlis = false; //TextMeshSettings.antiAlis;
    private resolution = 2;
    private canvasInst: any;
    private image: ImageAsset;
    private texture: LetterRenderTexture;
    private supportGetData = true;
    
    constructor({
        fontSize = 24,
        buffer = 3,
        radius = 8,
        cutoff = 0.15,
        fontFamily = 'sans-serif',
        fontWeight = 'normal',
        fontStyle = 'normal',
        cacheCanvas = true,
        trimBuffer = false,
    } = {}) {
        this.buffer = buffer;
        this.cutoff = cutoff;
        this.radius = radius;
        this.trimBuffer = trimBuffer;

        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontWeight = fontWeight;
        this.fontStyle = fontStyle;
        this.cacheCanvas = cacheCanvas;

        if(this.antiAlis) {
            this.resolution = 2;
        }else{
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

        if(this.cacheCanvas) {
            this.beforeDraw();
        }
    }

    static calcuteFontSize(fontSize: number, buffer: number) {
        return fontSize + buffer * 2;
    }

    setFontFamily(fontFamily: string) {
        this.fontFamily = fontFamily || this.fontFamily;
    }

    private _createCanvas(size) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        return canvas;
    }

    private beforeDraw() {
        const canvasInst = CanvasPool.getInstance().get();
        const canvas = canvasInst.canvas;
        canvas.width = canvas.height = this.size;
        
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        if(ctx.getContextAttributes) {
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
        
        this.image = new ImageAsset();
        this.image.reset(canvas);
    }

    private afterDraw() {
        CanvasPool.getInstance().put(this.canvasInst);
        this.image = null;
    }

    draw(char: string, fontFamily?: string, measureText?: string, onDraw?:(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, width: number, height: number, sx: number, sy: number)=>void, trimBuffer?: boolean): GlyphInfo {
        this.fontFamily = fontFamily || this.fontFamily;
        if(!this.cacheCanvas) {
            this.beforeDraw();
        }else{
            this.ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        }

        const metric = this.ctx.measureText(char || measureText) as any || {};
        if(SUPPORT_FULL_METRICS == null) {
            SUPPORT_FULL_METRICS = metric.actualBoundingBoxAscent != null;
        }

        let glyphAdvance = metric.width || 0;
        let actualBoundingBoxAscent = metric.fontBoundingBoxAscent ?? this.fontSize;
        let actualBoundingBoxDescent = metric.fontBoundingBoxDescent ?? this.buffer;
        let actualBoundingBoxLeft = metric.actualBoundingBoxLeft ?? 0;
        let actualBoundingBoxRight = metric.actualBoundingBoxRight ?? glyphAdvance;

        let scale = Math.min(1.0, this.fontSize / (actualBoundingBoxDescent + actualBoundingBoxAscent), this.fontSize / glyphAdvance);
        if(char.length == 1) {
            // 需要缩放字体
            if(scale < 1) {
                this.ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize * scale}px ${this.fontFamily}`;
                const metric = this.ctx.measureText(char) as any || {};
                glyphAdvance = metric.width || 0;
                actualBoundingBoxAscent = metric.fontBoundingBoxAscent ?? this.fontSize;
                actualBoundingBoxDescent = metric.fontBoundingBoxDescent ?? this.buffer;
                actualBoundingBoxLeft = metric.actualBoundingBoxLeft ?? 0;
                actualBoundingBoxRight = metric.actualBoundingBoxRight ?? glyphAdvance;
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
        const glyph = {data, width, height, glyphWidth, glyphHeight, size, glyphLeft, glyphRight, glyphAdvance, ascent: glyphTop, descent: actualBoundingBoxDescent, scale};
        if(char == "") {
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
            glyph.glyphWidth = glyph.glyphRight = glyph.size = glyph.width = Math.floor(glyph.glyphAdvance)
            glyph.glyphHeight = glyph.height = 1;
            return glyph;
        }

        const {ctx, buffer, gridInner, gridOuter} = this;
        ctx.clearRect(buffer, buffer, glyphWidth, glyphHeight);

        if(onDraw != null) {
            onDraw(this.canvas, ctx, width, height, buffer, buffer);
        }else{
            let startX = 0;
            let startY = 0;
            if(SUPPORT_FULL_METRICS) {
                startX = buffer+actualBoundingBoxLeft;
                startY = size - buffer - actualBoundingBoxDescent;
            }else{
                startX = (size - this.fontSize) / 2;       
                startY = size - buffer - actualBoundingBoxDescent;      
            }              
            ctx.fillText(char, startX, startY);
        }
        
        let imgBytesData = null;
        if(this.supportGetData && ctx.getImageData) {
            let imgData = null;
            try{
                imgData = ctx.getImageData(buffer, buffer, glyphWidth, glyphHeight);
            }catch(e) {
                this.supportGetData = false;
            }

            if(!imgData) {
                this.supportGetData = false;
            }else{
                imgBytesData = imgData.data;
            }
        }

        if(imgBytesData == null) {
            if(!this.texture) {
                this.texture = new LetterRenderTexture();
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
                if (a === 0) continue; // empty pixels

                const j = (y + buffer) * width + x + buffer;

                if (a === 1) { // fully drawn pixels
                    gridOuter[j] = 0;
                    gridInner[j] = INF;

                } else { // aliased pixels
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

        if(this.antiAlis) {
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

        if(!this.cacheCanvas) {
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
     private readTexturePixels(src: RenderTexture|Texture2D, rect?: Rect, buffer?: Uint8Array) {
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

    private round(x: number, resolution: number) {
        resolution = Math.pow(10, resolution);
        return Math.round(x * resolution) / resolution;
    }

    private _trimBuffer(glyhp: GlyphInfo, char: string) {
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
                if(val > 0) {
                    minx = Math.min(minx, x - minPadding);
                    miny = Math.min(miny, y - minPadding);
                    maxx = Math.max(maxx, x + minPadding);
                    maxy = Math.max(maxy, y + minPadding);
                }
            }
        }

        minx = Math.max(0, minx);
        miny = Math.max(0, miny);
        maxx = Math.min(w-1, maxx);
        maxy = Math.min(h-1, maxy);

        if(maxx <= 0 || maxy <= 0) {
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
            let riy = (y+miny) * w;
            for (let x = 0; x < glyhp.width; x++) {
                data[iy + x] = glyhp.data[riy + x + minx];
            }
        }
        glyhp.data = data;
    }
}

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, x0, y0, width, height, gridSize, f, v, z) {
    for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
    for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridSize + x0, 1, width, f, v, z);
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
        while (z[k + 1] < q) k++;
        const r = v[k];
        const qr = q - r;
        grid[offset + q * stride] = f[r] + qr * qr;
    }
}
