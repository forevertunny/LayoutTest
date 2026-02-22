import { ETextHorizontalAlign, ETextOverflow, ETextVerticalAlign, Margin } from "db://text-mesh/label/types";
import { _decorator, Enum } from "cc";

const { ccclass, property } = _decorator;

@ccclass('TextLayoutConfig')
export class TextLayoutConfig {

    @property({ type: Enum(ETextHorizontalAlign) })
    horizontalAlign: ETextHorizontalAlign = ETextHorizontalAlign.Center;

    @property({ type: Enum(ETextVerticalAlign) })
    verticalAlign: ETextVerticalAlign = ETextVerticalAlign.Middle;

    @property({ type: Enum(ETextOverflow) })
    overflow: ETextOverflow = ETextOverflow.Shrink;

    @property
    autoWarp: boolean = true;

    @property
    fontAutoSize: boolean = false;

    @property
    fontMiniSize: number = 0;

    @property
    fontMaxSize: number = 0;

    @property
    equalWidth: boolean = false;

    @property
    fixedLineHeight: boolean = false;

    @property
    lineHeight: number = 0;

    @property
    lineSpace: number = 0;

    @property
    letterSpace: number = 0;

    @property
    slotSpace: number = 0;

    @property
    padding: Margin = new Margin();

    @property
    breakWestern: boolean = true;

    @property
    charVisibleRatio: number = 1;

    @property
    aspect: number = 1;
}
