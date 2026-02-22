export interface IChar {
    code: string;
    /**
     * 左下，右下，左上，右上
     */
    uvs: Float32Array;
    glyphWidth: number;
    glyphHeight: number;
    glyphAdvance: number;
    glyphRight: number;
    glyphLeft: number;
    width: number;
    height: number;
    size: number;
    ascent: number;
    descent: number;
    /**
     * channel id[0,3]
     */
    cid: number;
}