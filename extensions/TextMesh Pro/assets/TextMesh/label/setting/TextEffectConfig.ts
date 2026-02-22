import { _decorator, Color, Vec2 } from "cc";

const { ccclass, property } = _decorator;

@ccclass('TextEffect_Stroke')
export class TextEffect_Stroke {
    @property({ min: 0, max: 1, step: 0.001, slide: true })
    stroke: number = 0;

    @property
    useCustomStrokeAlpha: boolean = false;

    @property({ min: 0, max: 1, step: 0.001, slide: true })
    strokeBlur: number = 0;

    @property({ type: Color })
    strokeColor: Color = Color.BLACK.clone();
}

@ccclass('TextEffect_Shadow')
export class TextEffect_Shadow {

    @property({ min: 0, max: 1, step: 0.001, slide: true })
    shadow: number = 0;

    @property
    useCustomShadowAlpha: boolean = false;

    @property({ min: 0, max: 1, step: 0.001, slide: true })
    shadowBlur: number = 0;

    @property({ min: -100, max: 100, step: 0.1, slide: true })
    shadowOffsetX: number = 0;

    @property({ min: -100, max: 100, step: 0.1, slide: true })
    shadowOffsetY: number = 0;

    @property({ type: Color })
    shadowColor: Color = Color.BLACK.clone();

}

@ccclass('TextEffectConfig')
export class TextEffectConfig {

    @property(TextEffect_Stroke)
    effectStroke: TextEffect_Stroke = new TextEffect_Stroke();

    @property(TextEffect_Shadow)
    effectShadow: TextEffect_Shadow = new TextEffect_Shadow();
}
