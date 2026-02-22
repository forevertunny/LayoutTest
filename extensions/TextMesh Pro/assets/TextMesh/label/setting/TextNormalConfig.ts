import { _decorator, Color } from "cc";

const { ccclass, property } = _decorator;

@ccclass('TextNormalConfig')
export class TextNormalConfig {

    @property({ type: Color })
    color: Color = Color.WHITE.clone();

    // @property
    // fontSize: number = 20;
    //
    // @property
    // dilate: number = 0.2;
    //
    // @property
    // fontSmoothness: number = 0;

    // @property
    // italic: boolean = false;
    //
    // @property
    // underline: boolean = false;
    //
    // @property
    // strike: boolean = false;
    //
    // @property
    // bold: boolean = false;
}
