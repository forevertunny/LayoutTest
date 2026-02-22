"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INF = 1e20;
var SUPPORT_FULL_METRICS = null;
class TinySDF {
    constructor({ fontSize = 24, buffer = 3, radius = 8, cutoff = 0.15, fontFamily = 'sans-serif', fontWeight = 'normal', fontStyle = 'normal', cacheCanvas = true, trimBuffer = false, } = {}) {
        this.fontFamily = 'sans-serif';
        this.cacheCanvas = true;
        this.trimBuffer = false;
        this.antiAlis = false;
        this.resolution = 2;
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
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx.getContextAttributes) {
            ctx.getContextAttributes().willReadFrequently = true;
        }
        ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
        ctx.fillStyle = 'black';
        this.ctx = ctx;
        this.canvas = canvas;
    }
    afterDraw() {
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
        const scale = onDraw ? 1 : Math.min(1.0, this.fontSize / (actualBoundingBoxDescent + actualBoundingBoxAscent), this.fontSize / glyphAdvance);
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
        // ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        const imgData = ctx.getImageData(buffer, buffer, glyphWidth, glyphHeight);
        let imgBytesData = imgData.data;
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
        glyhp.glyphLeft = this.round(glyhp.glyphLeft / scaleWidth, 2);
        glyhp.glyphRight = this.round(glyhp.glyphRight / scaleWidth, 2);
        glyhp.glyphWidth = this.round(glyhp.glyphWidth / scaleWidth, 2);
        glyhp.glyphHeight = this.round(glyhp.glyphHeight / scaleHeight, 2);
        glyhp.ascent = this.round(glyhp.ascent / scaleHeight, 2);
        glyhp.descent = this.round(glyhp.descent / scaleHeight, 2);
        glyhp.glyphAdvance = this.round(glyhp.glyphAdvance / scaleWidth, 2);
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
