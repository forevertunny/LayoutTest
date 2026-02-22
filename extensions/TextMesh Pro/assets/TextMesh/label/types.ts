import { ccenum, _decorator } from "cc";
import { serialize } from "v8";
const { ccclass, property } = _decorator;

export enum ETextDirection {
    Horizontal = 0,
    Vertical = 1,
};
ccenum(ETextDirection);

export enum ETextHorizontalAlign {
    Left = 0,
    Center = 1,
    Right = 2,
};
ccenum(ETextHorizontalAlign);

export enum ETextVerticalAlign {
    Top = 0,
    Middle = 1,
    Bottom = 2,
};
ccenum(ETextVerticalAlign);

/**
 * @en Enum for Overflow.
 *
 * @zh 文本超载类型。
 */
 export enum ETextOverflow {
    /**
     * @en None.
     *
     * @zh 此模式下，组件宽度是自动变化的
     */
    None = 0,
    /**
     * @en In CLAMP mode, when label content goes out of the bounding box, it will be clipped.
     *
     * @zh CLAMP 模式中，当文本内容超出边界框时，多余的会被截断。
     */
    Clamp = 1,    
    /**
     * @en In SHRINK mode, the font size will change dynamically to adapt the content size.
     * This mode may takes up more CPU resources when the label is refreshed.
     *
     * @zh SHRINK 模式，字体大小会动态变化，以适应内容大小。这个模式在文本刷新的时候可能会占用较多 CPU 资源。
     */
    Shrink = 2,
    /**
     * @en In RESIZE_HEIGHT mode, you can only change the width of label and the height is changed automatically.
     *
     * @zh 在 RESIZE_HEIGHT 模式下，只能更改文本的宽度，高度是自动改变的。
     */
    ResizeHeight = 3,
}

ccenum(ETextOverflow);


export enum EScriptType {
    None,
    SuperScript,
    SubScript,
}

@ccclass("Margin")
export class Margin {
    onChanged: Function;

    @property({visible: false, serializable: true})
    private _left: number = 0;
    @property({visible: false, serializable: true})
    private _right: number = 0;
    @property({visible: false, serializable: true})
    private _top: number = 0;
    @property({visible: false, serializable: true})
    private _bottom: number = 0;

    @property
    get left() {
        return this._left;
    }
    set left(val: number) {
        if(this._left != val) {
            this._left = val;

            this.onChanged && this.onChanged();
        }
    }

    @property
    get right() {
        return this._right;
    }

    set right(val: number) {
        if(this._right != val) {
            this._right = val;

            this.onChanged && this.onChanged();
        }
    }

    @property
    get top() {
        return this._top;
    }

    set top(val: number) {
        if(this._top != val) {
            this._top = val;

            this.onChanged && this.onChanged();
        }
    }

    @property
    get bottom() {
        return this._bottom;
    }

    set bottom(val: number) {
        if(this._bottom != val) {
            this._bottom = val;

            this.onChanged && this.onChanged();
        }
    }
}