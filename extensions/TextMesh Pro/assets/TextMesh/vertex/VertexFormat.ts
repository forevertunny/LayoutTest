import { gfx } from "cc";

// 除了颜色，其他的都是RG16F, 防止被UIOpacity影响
export const vfmtTMVertex = [
    // pos 3
    new gfx.Attribute(gfx.AttributeName.ATTR_POSITION, gfx.Format.RGB32F),
    
    // uv 2
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD, gfx.Format.RG32F),
    // uv2 2
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD1, gfx.Format.RG32F),
    
    // color 4
    new gfx.Attribute(gfx.AttributeName.ATTR_COLOR, gfx.Format.RGBA32F),

    // channelId,fill 2
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD2, gfx.Format.RG32F),
    // stroke,strokeBlur 2
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD3, gfx.Format.RG32F),

    // strokeColor.rg 2
    new gfx.Attribute("a_strokeColor0", gfx.Format.RG32F),
    // strokeColor.ba 2
    new gfx.Attribute("a_strokeColor1", gfx.Format.RG32F),
];