import { _decorator, Component, Enum, UITransform, Size, Node, Vec2, Widget } from 'cc';
import { YileLayoutElement } from './YileLayoutElement';
import { YileLayoutUtility } from './YileLayoutUtility';

const { ccclass, property, menu, executeInEditMode } = _decorator;

export enum ChildAlignment {
    UPPER_LEFT, UPPER_CENTER, UPPER_RIGHT,
    MIDDLE_LEFT, MIDDLE_CENTER, MIDDLE_RIGHT,
    LOWER_LEFT, LOWER_CENTER, LOWER_RIGHT
}

export enum LayoutType { HORIZONTAL, VERTICAL }

@ccclass('YileLayout')
@menu('Layout/YileLayout')
@executeInEditMode
export class YileLayout extends Component {

    // --- 核心佈局屬性 ---

    @property({ type: Enum(LayoutType), tooltip: '佈局方向' })
    get type() { return this._type; }
    set type(value: LayoutType) { if (this._type === value) return; this._type = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _type: LayoutType = LayoutType.HORIZONTAL;

    @property({ type: Enum(ChildAlignment), tooltip: '子節點對齊方式' })
    get childAlignment() { return this._childAlignment; }
    set childAlignment(value: ChildAlignment) { if (this._childAlignment === value) return; this._childAlignment = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _childAlignment: ChildAlignment = ChildAlignment.UPPER_LEFT;

    // --- Padding 屬性區 ---

    @property({ group: { name: 'Padding' } })
    get paddingLeft() { return this._paddingLeft; }
    set paddingLeft(value: number) { this._paddingLeft = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _paddingLeft: number = 0;

    @property({ group: { name: 'Padding' } })
    get paddingRight() { return this._paddingRight; }
    set paddingRight(value: number) { this._paddingRight = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _paddingRight: number = 0;

    @property({ group: { name: 'Padding' } })
    get paddingTop() { return this._paddingTop; }
    set paddingTop(value: number) { this._paddingTop = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _paddingTop: number = 0;

    @property({ group: { name: 'Padding' } })
    get paddingBottom() { return this._paddingBottom; }
    set paddingBottom(value: number) { this._paddingBottom = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _paddingBottom: number = 0;

    @property({ tooltip: '子節點間距' })
    get spacing() { return this._spacing; }
    set spacing(value: number) { this._spacing = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _spacing: number = 0;

    // --- 子節點控制項 ---

    @property({ group: "Child Controls" })
    get childControlWidth() { return this._childControlWidth; }
    set childControlWidth(value: boolean) { this._childControlWidth = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _childControlWidth: boolean = false;

    @property({ group: "Child Controls" })
    get childControlHeight() { return this._childControlHeight; }
    set childControlHeight(value: boolean) { this._childControlHeight = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _childControlHeight: boolean = false;

    @property({ group: "Force Expand" })
    get childForceExpandWidth() { return this._childForceExpandWidth; }
    set childForceExpandWidth(value: boolean) { this._childForceExpandWidth = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _childForceExpandWidth: boolean = false;

    @property({ group: "Force Expand" })
    get childForceExpandHeight() { return this._childForceExpandHeight; }
    set childForceExpandHeight(value: boolean) { this._childForceExpandHeight = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _childForceExpandHeight: boolean = false;

    @property({ group: "Child Scale" })
    get useChildScaleWidth() { return this._useChildScaleWidth; }
    set useChildScaleWidth(value: boolean) { this._useChildScaleWidth = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _useChildScaleWidth: boolean = false;

    @property({ group: "Child Scale" })
    get useChildScaleHeight() { return this._useChildScaleHeight; }
    set useChildScaleHeight(value: boolean) { this._useChildScaleHeight = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _useChildScaleHeight: boolean = false;

    @property({ tooltip: '是否反向排列' })
    get reverseArrangement() { return this._reverseArrangement; }
    set reverseArrangement(value: boolean) { this._reverseArrangement = value; this._doLayoutDirty(); }
    @property({ serializable: true }) private _reverseArrangement: boolean = false;

    // --- 私有變數與緩存 ---

    private _layoutDirty: boolean = false;
    private _items: { trans: UITransform, element: YileLayoutElement | null, widget: Widget | null }[] = [];
    private _totalPreferredWidth: number = 0;
    private _totalPreferredHeight: number = 0;

    public getTotalPreferredSize(axis: number): number {
        return axis === 0 ? this._totalPreferredWidth : this._totalPreferredHeight;
    }

    protected onLoad() {
        this.node.on(Node.EventType.CHILD_ADDED, this._onChildChanged, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this._onChildChanged, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this._doLayoutDirty, this);
        this.node.on(Node.EventType.SIBLING_ORDER_CHANGED, this._onChildOrderChanged, this);
        this.forceUpdateUsefulChildren();
    }

    protected onDestroy() {
        if (this.node.isValid) {
            this.node.off(Node.EventType.CHILD_ADDED, this._onChildChanged, this);
            this.node.off(Node.EventType.CHILD_REMOVED, this._onChildChanged, this);
            this.node.off(Node.EventType.SIBLING_ORDER_CHANGED, this._onChildOrderChanged, this);
            this.node.off(Node.EventType.SIZE_CHANGED, this._doLayoutDirty, this);
        }
    }

    private _onChildOrderChanged() { this.forceUpdateUsefulChildren(); }
    private _onChildChanged() { this.forceUpdateUsefulChildren(); }

    public forceUpdateUsefulChildren() {
        this._updateUsefulChildren();
        this._doLayoutDirty();
    }

    private _doLayoutDirty() { this._layoutDirty = true; }

    public forceUpdateLayout() {
        this._doLayout();
        this._layoutDirty = false;
    }

    protected update() {
        if (this._layoutDirty) {
            this.forceUpdateLayout();
            const fitter = this.getComponent('ContentSizeFitter') as any;
            if (fitter) fitter._updateSize();
        }
    }

    private _updateUsefulChildren() {
        this._items = [];
        for (const child of this.node.children) {
            if (!child.activeInHierarchy) continue;
            const trans = child.getComponent(UITransform);
            const el = child.getComponent(YileLayoutElement);
            if (trans && (!el || !el.ignoreLayout)) {
                this._items.push({
                    trans: trans,
                    element: el,
                    widget: child.getComponent(Widget)
                });
            }
        }
    }

    private _doLayout() {
        const trans = this.node.getComponent(UITransform);
        if (!trans) return;
        const size = trans.contentSize.clone();
        const isVert = this.type === LayoutType.VERTICAL;

        this._setChildrenAlongAxis(0, isVert, size);
        this._setChildrenAlongAxis(1, isVert, size);

        // 利用緩存好的 Widget 直接刷新，避免 getComponent 開銷
        for (const item of this._items) {
            if (item.widget && item.widget.enabled) {
                item.widget.updateAlignment();
            }
        }
        // 通知深層子節點
        this.node.emit('layout-finished');
    }

    private _setChildrenAlongAxis(axis: number, isVertical: boolean, containerSize: Size) {
        const size = axis === 0 ? containerSize.width : containerSize.height;
        const controlSize = axis === 0 ? this._childControlWidth : this._childControlHeight;
        const useScale = axis === 0 ? this.useChildScaleWidth : this.useChildScaleHeight;
        const forceExpand = axis === 0 ? this.childForceExpandWidth : this.childForceExpandHeight;
        const alignmentWeight = this._getAlignmentOnAxis(axis);

        const items = this._items;
        if (items.length === 0) return;

        const alongOtherAxis = (isVertical !== (axis === 1));
        const paddingCombined = axis === 0 ? (this.paddingLeft + this.paddingRight) : (this.paddingTop + this.paddingBottom);
        const innerSize = size - paddingCombined;

        if (alongOtherAxis) {
            let maxPref = 0;
            for (const item of items) {
                const childTrans = item.trans;
                const scale = useScale ? Math.max(0.0001, Math.abs(axis === 0 ? childTrans.node.scale.x : childTrans.node.scale.y)) : 1.0;
                if (controlSize) {
                    const min = YileLayoutUtility.getMinSize(childTrans, axis);
                    const targetSize = Math.max(min, innerSize / scale);
                    if (axis === 0) childTrans.width = targetSize; else childTrans.height = targetSize;
                }
                const p = YileLayoutUtility.getPreferredSize(childTrans, axis) * scale;
                maxPref = Math.max(maxPref, p);

                const curSizeEff = (axis === 0 ? childTrans.width : childTrans.height) * scale;
                const baseOffset = this._getStartOffset(axis, curSizeEff, containerSize);
                const surplus = innerSize - curSizeEff;

                // 修正：垂直方向（axis=1）向下為負
                const offset = axis === 0 ? (baseOffset + surplus * alignmentWeight) : (baseOffset - surplus * alignmentWeight);
                this._setChildAlongAxis(childTrans, axis, offset);
            }
            if (axis === 0) this._totalPreferredWidth = maxPref; else this._totalPreferredHeight = maxPref;
        } else {
            let totalMin = 0, totalPref = 0, totalFlex = 0;
            const infos = items.map(item => {
                const child = item.trans;
                const scale = useScale ? Math.max(0.0001, Math.abs(axis === 0 ? child.node.scale.x : child.node.scale.y)) : 1.0;
                const m = YileLayoutUtility.getMinSize(child, axis) * scale;
                const p = YileLayoutUtility.getPreferredSize(child, axis) * scale;
                const f = YileLayoutUtility.getFlexibleSize(child, axis, forceExpand);
                totalMin += m; totalPref += p; totalFlex += f;
                return { m, p, f, scale, trans: child };
            });

            const totalSpacing = (items.length - 1) * this.spacing;
            if (axis === 0) this._totalPreferredWidth = totalPref + totalSpacing; else this._totalPreferredHeight = totalPref + totalSpacing;

            const availSpace = size - paddingCombined - totalSpacing;
            let currentContentSize = totalPref;
            let minMaxLerp = 1, flexMult = 0;

            if (availSpace < totalPref) {
                currentContentSize = Math.max(totalMin, availSpace);
                if (totalPref - totalMin > 0) minMaxLerp = (currentContentSize - totalMin) / (totalPref - totalMin); else minMaxLerp = 0;
            } else if (availSpace > totalPref && totalFlex > 0) {
                currentContentSize = availSpace;
                flexMult = (availSpace - totalPref) / totalFlex;
            }

            const surplus = availSpace - currentContentSize;
            let startOffset = this._getStartOffset(axis, currentContentSize, containerSize);

            // 修正：主軸對齊偏移
            const alignOffset = surplus * alignmentWeight;
            startOffset += (axis === 0 ? alignOffset : -alignOffset);

            let currentPos = startOffset;
            for (let i = 0; i < infos.length; i++) {
                const idx = this.reverseArrangement ? (infos.length - 1 - i) : i;
                const info = infos[idx];
                const finalEff = info.m + (info.p - info.m) * minMaxLerp + (info.f * flexMult);

                if (controlSize) {
                    const newSize = finalEff / info.scale;
                    if (axis === 0) info.trans.width = newSize; else info.trans.height = newSize;
                }
                this._setChildAlongAxis(info.trans, axis, currentPos);
                currentPos += axis === 0 ? (finalEff + this.spacing) : -(finalEff + this.spacing);
            }
        }
    }

    private _getAlignmentOnAxis(axis: number): number {
        if (axis === 0) return (this.childAlignment % 3) * 0.5;
        return Math.floor(this.childAlignment / 3) * 0.5;
    }

    private _getStartOffset(axis: number, contentSize: number, containerSize: Size): number {
        const uiTrans = this.node.getComponent(UITransform)!;
        const padding = axis === 0 ? this.paddingLeft : this.paddingTop;
        return axis === 0 ? (-uiTrans.anchorX * containerSize.width + padding) : ((1 - uiTrans.anchorY) * containerSize.height - padding);
    }

    private _setChildAlongAxis(childTrans: UITransform, axis: number, pos: number) {
        const node = childTrans.node;
        const scaleVal = (axis === 0 ? (this.useChildScaleWidth ? node.scale.x : 1) : (this.useChildScaleHeight ? node.scale.y : 1));
        const p = node.position;
        if (axis === 0) node.setPosition(pos + childTrans.anchorX * childTrans.width * scaleVal, p.y);
        else node.setPosition(p.x, pos - (1 - childTrans.anchorY) * childTrans.height * scaleVal);
    }
}
