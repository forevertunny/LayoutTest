import { _decorator, Component, CCFloat, CCInteger } from 'cc';

const { ccclass, property, menu, executeInEditMode } = _decorator;

@ccclass('YileLayoutElement')
@menu('Layout/YileLayoutElement')
@executeInEditMode
export class YileLayoutElement extends Component {

    @property
    private _ignoreLayout: boolean = false;

    @property
    private _useMinWidth: boolean = false;
    @property
    private _minWidth: number = 0;

    @property
    private _useMinHeight: boolean = false;
    @property
    private _minHeight: number = 0;

    @property
    private _usePreferredWidth: boolean = false;
    @property
    private _preferredWidth: number = 0;

    @property
    private _usePreferredHeight: boolean = false;
    @property
    private _preferredHeight: number = 0;

    @property
    private _useFlexibleWidth: boolean = false;

    @property
    private _flexibleWidth: number = 1;

    @property
    private _useFlexibleHeight: boolean = false;
    @property
    private _flexibleHeight: number = 1;

    @property
    private _layoutPriority: number = 1;

    // --- 屬性對外介面與 Inspector 邏輯 ---

    @property({ tooltip: 'Should this RectTransform be ignored by the layout system?' })
    get ignoreLayout() { return this._ignoreLayout; }
    set ignoreLayout(value: boolean) {
        this._ignoreLayout = value;
        // 當 ignore 狀態改變，這等同於子節點「加入或離開」佈局運算
        if (this.node.parent) {
            const layout = this.node.parent.getComponent("YileLayout") as any;
            if (layout && layout.forceUpdateUsefulChildren) {
                layout.forceUpdateUsefulChildren();
            }
        }
        this._setDirty();
    }

    // Min Width
    @property({ tooltip: 'Enable Min Width' })
    get useMinWidth() {
        return this._useMinWidth;
    }

    set useMinWidth(value: boolean) {
        this._useMinWidth = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Min Width',
        visible: function (this: YileLayoutElement) {
            return this._useMinWidth;
        }
    })
    get minWidth() {
        return this._minWidth;
    }

    set minWidth(value: number) {
        this._minWidth = value;
        this._setDirty();
    }

    // Min Height
    @property({ tooltip: 'Enable Min Height' })
    get useMinHeight() {
        return this._useMinHeight;
    }

    set useMinHeight(value: boolean) {
        this._useMinHeight = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Min Height',
        visible: function (this: YileLayoutElement) {
            return this._useMinHeight;
        }
    })
    get minHeight() {
        return this._minHeight;
    }

    set minHeight(value: number) {
        this._minHeight = value;
        this._setDirty();
    }

    // Preferred Width
    @property({ tooltip: 'Enable Preferred Width' })
    get usePreferredWidth() {
        return this._usePreferredWidth;
    }

    set usePreferredWidth(value: boolean) {
        this._usePreferredWidth = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Preferred Width',
        visible: function (this: YileLayoutElement) {
            return this._usePreferredWidth;
        }
    })
    get preferredWidth() {
        return this._preferredWidth;
    }

    set preferredWidth(value: number) {
        this._preferredWidth = value;
        this._setDirty();
    }

    // Preferred Height
    @property({ tooltip: 'Enable Preferred Height' })
    get usePreferredHeight() {
        return this._usePreferredHeight;
    }

    set usePreferredHeight(value: boolean) {
        this._usePreferredHeight = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Preferred Height',
        visible: function (this: YileLayoutElement) {
            return this._usePreferredHeight;
        }
    })
    get preferredHeight() {
        return this._preferredHeight;
    }

    set preferredHeight(value: number) {
        this._preferredHeight = value;
        this._setDirty();
    }

    // Flexible Width
    @property({ tooltip: 'Enable Flexible Width' })
    get useFlexibleWidth() {
        return this._useFlexibleWidth;
    }

    set useFlexibleWidth(value: boolean) {
        this._useFlexibleWidth = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Flexible Width',
        visible: function (this: YileLayoutElement) {
            return this._useFlexibleWidth;
        }
    })
    get flexibleWidth() {
        return this._flexibleWidth;
    }

    set flexibleWidth(value: number) {
        this._flexibleWidth = value;
        this._setDirty();
    }

    // Flexible Height
    @property({ tooltip: 'Enable Flexible Height' })
    get useFlexibleHeight() {
        return this._useFlexibleHeight;
    }

    set useFlexibleHeight(value: boolean) {
        this._useFlexibleHeight = value;
        this._setDirty();
    }

    @property({
        type: CCFloat,
        displayName: 'Flexible Height',
        visible: function (this: YileLayoutElement) {
            return this._useFlexibleHeight;
        }
    })
    get flexibleHeight() {
        return this._flexibleHeight;
    }

    set flexibleHeight(value: number) {
        this._flexibleHeight = value;
        this._setDirty();
    }

    @property({ type: CCInteger, tooltip: 'Layout Priority' })
    get layoutPriority() {
        return this._layoutPriority;
    }

    set layoutPriority(value: number) {
        this._layoutPriority = value;
        this._setDirty();
    }

    /**
     * 通知父節點重新佈局
     */
    private _setDirty() {
        if (!this.node.parent) return;
        const layout = this.node.parent.getComponent('YileLayout') as any;
        if (layout && layout.forceUpdateLayout) {
            layout.forceUpdateLayout();
        }
    }
}
