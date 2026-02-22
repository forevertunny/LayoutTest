import { _decorator, Color } from "cc";

const { ccclass, property } = _decorator;


@ccclass('TextStyle_Corner')
export class TextStyle_Corner {

    @property
    enableColorRT: boolean = false;

    @property({ type: Color })
    colorRT: Color = Color.WHITE.clone();

    @property
    enableColorRB: boolean = false;

    @property({ type: Color })
    colorRB: Color = Color.WHITE.clone();

    @property
    enableColorLT: boolean = false;

    @property({ type: Color })
    colorLT: Color = Color.WHITE.clone();

    @property
    enableColorLB: boolean = false;

    @property({ type: Color })
    colorLB: Color = Color.WHITE.clone();

}

@ccclass('TextStyle_Glow')
export class TextStyle_Glow {

    @property
    enableGlow: boolean = false;

    @property({ type: Color })
    glowColor: Color = Color.WHITE.clone();

    @property({ min: 0, max: 1, step: 0.01, slide: true })
    glowInner: number = 0;

    @property({ min: 0, max: 1, step: 0.01, slide: true })
    glowOuter: number = 0;

    @property({ min: 0, max: 10, step: 0.01, slide: true })
    glowPower: number = 0;

    @property({
        min: -100,
        max: 100,
        step: 0.1,
        slide: true,
        tooltip: '控制光暈的水平偏移'
    })
    glowOffsetX: number = 0;

    @property({
        min: -100,
        max: 100,
        step: 0.1,
        slide: true,
        tooltip: '控制光暈的垂直偏移'
    })
    glowOffsetY: number = 0;

}

@ccclass('TextStyle_Background')
export class TextStyle_Background {

    @property
    enableBackground: boolean = false;

    @property({ type: Color })
    backgroundColor: Color = Color.WHITE.clone();
}

@ccclass('TextStyle_Mask')
export class TextStyle_Mask {

    @property
    enableMask: boolean = false;

    @property({ type: Color })
    maskColor: Color = Color.WHITE.clone();
}

@ccclass('TextStyleConfig')
export class TextStyleConfig {

    //#region "corner"

    @property(TextStyle_Corner)
    styleCorner: TextStyle_Corner = new TextStyle_Corner();

    //#endregion

    //#region "background"

    @property(TextStyle_Background)
    styleBackground: TextStyle_Background = new TextStyle_Background();


    //#endregion

    //#region "mask"

    @property(TextStyle_Mask)
    styleMask: TextStyle_Mask = new TextStyle_Mask();


    //#endregion

    //#region "glow"

    @property(TextStyle_Glow)
    styleGlow: TextStyle_Glow = new TextStyle_Glow();

    //#endregion
}
