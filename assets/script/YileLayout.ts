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

    @property({ type: Enum(LayoutType), tooltip: '佈局方向' })
    public type: LayoutType = LayoutType.HORIZONTAL;

    @property({ type: Enum(ChildAlignment), tooltip: '子節點對齊方式' })
    public childAlignment: ChildAlignment = ChildAlignment.UPPER_LEFT;

    @property({ group: { name: 'Padding' } }) public paddingLeft: number = 0;
    @property({ group: { name: 'Padding' } }) public paddingRight: number = 0;
    @property({ group: { name: 'Padding' } }) public paddingTop: number = 0;
    @property({ group: { name: 'Padding' } }) public paddingBottom: number = 0;
    @property({ tooltip: '子節點間距' }) public spacing: number = 0;

    @property({ group: "Child Controls" })
    get childControlWidth() {
        return this._childControlWidth;
    }

    set childControlWidth(value: boolean) {
        this._childControlWidth = value;
        if (value) this._recordDrivenAxis(0);
        else this._clearDrivenAxis(0);
        this._doLayoutDirty();
    }

    @property({ serializable: true })
    private _childControlWidth: boolean = false;

    @property({ group: "Child Controls" })
    get childControlHeight() {
        return this._childControlHeight;
    }

    set childControlHeight(value: boolean) {
        this._childControlHeight = value;
        if (value) this._recordDrivenAxis(1);
        else this._clearDrivenAxis(1);
        this._doLayoutDirty();
    }

    @property({ serializable: true })
    private _childControlHeight: boolean = false;

    @property({ group: "Force Expand" }) public childForceExpandWidth: boolean = false;
    @property({ group: "Force Expand" }) public childForceExpandHeight: boolean = false;

    @property({ group: "Child Scale" }) public useChildScaleWidth: boolean = false;
    @property({ group: "Child Scale" }) public useChildScaleHeight: boolean = false;

    @property({ tooltip: '是否反向排列' }) public reverseArrangement: boolean = false;

    private _layoutDirty: boolean = false;
    private _usefulLayoutObj: UITransform[] = [];
    private _drivenSizes: Map<string, Vec2> = new Map();

    // 儲存佈局後的理想總尺寸
    private _totalPreferredWidth: number = 0;
    private _totalPreferredHeight: number = 0;

    public getTotalPreferredSize(axis: number): number {
        return axis === 0 ? this._totalPreferredWidth : this._totalPreferredHeight;
    }

    protected onLoad() {
        // 監聽節點增減
        this.node.on(Node.EventType.CHILD_ADDED, this._onChildChanged, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this._onChildChanged, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this._doLayoutDirty, this);

        // 【新增】監聽子節點順序變化 (當呼叫 setSiblingIndex 或在編輯器拖拽時觸發)
        this.node.on(Node.EventType.SIBLING_ORDER_CHANGED, this._onChildOrderChanged, this);

        this.forceUpdateUsefulChildren();
    }

    protected onDestroy() {
        // 良好的開發習慣：銷毀時移除監聽，避免內存洩漏
        if (this.node.isValid) {
            this.node.off(Node.EventType.CHILD_ADDED, this._onChildChanged, this);
            this.node.off(Node.EventType.CHILD_REMOVED, this._onChildChanged, this);
            this.node.off(Node.EventType.SIBLING_ORDER_CHANGED, this._onChildOrderChanged, this);
            this.node.off(Node.EventType.SIZE_CHANGED, this._doLayoutDirty, this);
        }
    }

    /**
     * 當子節點順序改變時觸發
     */
    private _onChildOrderChanged() {
        this.forceUpdateUsefulChildren();
    }

    private _onChildChanged() {
        if (this._childControlWidth) this._recordDrivenAxis(0);
        if (this._childControlHeight) this._recordDrivenAxis(1);
        this.forceUpdateUsefulChildren();
    }

    private _recordDrivenAxis(axis: number) {
        for (const child of this.node.children) {
            const trans = child.getComponent(UITransform);
            if (!trans) continue;
            if (!this._drivenSizes.has(child.uuid)) {
                this._drivenSizes.set(child.uuid, new Vec2(trans.width, trans.height));
            } else {
                const saved = this._drivenSizes.get(child.uuid)!;
                if (axis === 0) saved.x = trans.width;
                else saved.y = trans.height;
            }
        }
    }

    private _clearDrivenAxis(axis: number) {
        if (!this._childControlWidth && !this._childControlHeight) {
            this._drivenSizes.clear();
        }
    }

    public forceUpdateUsefulChildren() {
        this._updateUsefulChildren();
        this._doLayoutDirty();
    }

    private _doLayoutDirty() {
        this._layoutDirty = true;
    }

    public forceUpdateLayout() {
        this._doLayout();
        this._layoutDirty = false;
    }

    protected update() {
        if (this._layoutDirty) {
            // 在 Play 模式下，有時需要確保子節點已經完成基本的 UITransform 更新
            this.forceUpdateLayout();

            // 【關鍵】如果掛有 ContentSizeFitter，Layout 算完後要叫 Fitter 再刷一次
            const fitter = this.getComponent('ContentSizeFitter') as any;
            if (fitter) {
                fitter._updateSize();
            }
        }
    }

    private _updateUsefulChildren() {
        this._usefulLayoutObj = [];
        for (const child of this.node.children) {
            if (!child.activeInHierarchy) continue;
            const trans = child.getComponent(UITransform);
            const el = child.getComponent(YileLayoutElement);
            if (trans && (!el || !el.ignoreLayout)) {
                this._usefulLayoutObj.push(trans);
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

        this._updateAllWidgetsRecursively(this.node);
    }

    private _updateAllWidgetsRecursively(root: Node) {
        // 獲取節點下所有的 Widget (包含孫物件)
        const widgets = root.getComponentsInChildren(Widget);
        for (const widget of widgets) {
            if (widget.node === root) continue; // 跳過自身，只刷子孫
            if (widget.enabled) {
                widget.updateAlignment();
            }
        }
    }

    private _setChildrenAlongAxis(axis: number, isVertical: boolean, containerSize: Size) {
        const size = axis === 0 ? containerSize.width : containerSize.height;
        const controlSize = axis === 0 ? this._childControlWidth : this._childControlHeight;
        const useScale = axis === 0 ? this.useChildScaleWidth : this.useChildScaleHeight;
        const forceExpand = axis === 0 ? this.childForceExpandWidth : this.childForceExpandHeight;
        const alignmentOnAxis = this._getAlignmentOnAxis(axis);

        const children = this._usefulLayoutObj;
        const childCount = children.length;
        if (childCount === 0) return;

        const alongOtherAxis = (isVertical !== (axis === 1));
        const paddingCombined = axis === 0 ? (this.paddingLeft + this.paddingRight) : (this.paddingTop + this.paddingBottom);
        const innerSize = size - paddingCombined;

        if (alongOtherAxis) {
            let maxPref = 0;
            for (const childTrans of children) {
                const scale = useScale ? Math.max(0.0001, Math.abs(axis === 0 ? childTrans.node.scale.x : childTrans.node.scale.y)) : 1.0;
                if (controlSize) {
                    const min = YileLayoutUtility.getMinSize(childTrans, axis);
                    const targetSize = Math.max(min, innerSize / scale);
                    if (axis === 0) childTrans.width = targetSize; else childTrans.height = targetSize;
                }
                const p = YileLayoutUtility.getPreferredSize(childTrans, axis) * scale;
                maxPref = Math.max(maxPref, p);

                const curSizeEff = (axis === 0 ? childTrans.width : childTrans.height) * scale;
                const offset = this._getStartOffset(axis, curSizeEff, containerSize) + (innerSize - curSizeEff) * alignmentOnAxis;
                this._setChildAlongAxis(childTrans, axis, offset);
            }
            if (axis === 0) this._totalPreferredWidth = maxPref;
            else this._totalPreferredHeight = maxPref;
        } else {
            let totalMin = 0, totalPref = 0, totalFlex = 0;
            const infos = children.map(child => {
                const scale = useScale ? Math.max(0.0001, Math.abs(axis === 0 ? child.node.scale.x : child.node.scale.y)) : 1.0;
                let baseSize = axis === 0 ? child.width : child.height;
                const driven = this._drivenSizes.get(child.node.uuid);
                if (driven) baseSize = axis === 0 ? driven.x : driven.y;

                const m = YileLayoutUtility.getMinSize(child, axis) * scale;
                const p = YileLayoutUtility.getPreferredSize(child, axis) * scale;
                const f = YileLayoutUtility.getFlexibleSize(child, axis, forceExpand);
                totalMin += m;
                totalPref += p;
                totalFlex += f;
                return { m, p, f, scale };
            });

            const totalSpacing = (childCount - 1) * this.spacing;
            if (axis === 0) this._totalPreferredWidth = totalPref + totalSpacing;
            else this._totalPreferredHeight = totalPref + totalSpacing;

            const availSpace = size - paddingCombined - totalSpacing;
            let currentContentSize = totalPref;
            let minMaxLerp = 1, flexMult = 0;

            if (availSpace < totalPref) {
                currentContentSize = Math.max(totalMin, availSpace);
                if (totalPref - totalMin > 0) minMaxLerp = (currentContentSize - totalMin) / (totalPref - totalMin);
                else minMaxLerp = 0;
            } else if (availSpace > totalPref && totalFlex > 0) {
                currentContentSize = availSpace;
                flexMult = (availSpace - totalPref) / totalFlex;
            }

            const surplus = availSpace - currentContentSize;
            let startOffset = this._getStartOffset(axis, currentContentSize, containerSize);
            if (surplus > 0) {
                startOffset += (axis === 0 ? surplus * alignmentOnAxis : -surplus * alignmentOnAxis);
            }
            let currentPos = startOffset;

            for (let i = 0; i < infos.length; i++) {
                const idx = this.reverseArrangement ? (childCount - 1 - i) : i;
                const info = infos[idx];
                const childTrans = children[idx];
                const finalEff = info.m + (info.p - info.m) * minMaxLerp + (info.f * flexMult);

                if (controlSize) {
                    const newSize = finalEff / info.scale;
                    if (axis === 0) childTrans.width = newSize; else childTrans.height = newSize;
                }
                this._setChildAlongAxis(childTrans, axis, currentPos);
                currentPos += axis === 0 ? (finalEff + this.spacing) : -(finalEff + this.spacing);
            }
        }
    }

    private _getAlignmentOnAxis(axis: number): number {
        return ((axis === 0 ? (this.childAlignment % 3) : Math.floor(this.childAlignment / 3)) * 0.5);
    }

    private _getStartOffset(axis: number, contentSize: number, containerSize: Size): number {
        const uiTrans = this.node.getComponent(UITransform)!;
        const padding = axis === 0 ? this.paddingLeft : this.paddingTop;
        return axis === 0 ? (-uiTrans.anchorX * containerSize.width + padding) : ((1 - uiTrans.anchorY) * containerSize.height - padding);
    }

    private _setChildAlongAxis(childTrans: UITransform, axis: number, pos: number) {
        const node = childTrans.node;
        const scaleVal = (axis === 0 ? (this.useChildScaleWidth ? node.scale.x : 1) : (this.useChildScaleHeight ? node.scale.y : 1));
        if (axis === 0) node.setPosition(pos + childTrans.anchorX * childTrans.width * scaleVal, node.position.y);
        else node.setPosition(node.position.x, pos - (1 - childTrans.anchorY) * childTrans.height * scaleVal);
    }
}
