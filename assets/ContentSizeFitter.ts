import { _decorator, Component, UITransform, Enum, Node } from 'cc';
import { YileLayout } from './YileLayout';

const { ccclass, property } = _decorator;

export enum FitMode { Unconstrained, MinSize, PreferredSize }

@ccclass('ContentSizeFitter')
export class ContentSizeFitter extends Component {

    @property({ type: Enum(FitMode) }) public horizontalFit: FitMode = FitMode.Unconstrained;
    @property({ type: Enum(FitMode) }) public verticalFit: FitMode = FitMode.Unconstrained;

    private _uiTransform: UITransform | null = null;

    onLoad() {
        this._uiTransform = this.getComponent(UITransform);
        // 監聽結構變化
        this.node.on(Node.EventType.CHILD_ADDED, this._onChildrenChanged, this);
        this.node.on(Node.EventType.CHILD_REMOVED, this._onChildrenChanged, this);
    }

    onEnable() {
        this._registerChildrenEvents();
        this._updateSize();
    }

    onDisable() {
        this._unregisterChildrenEvents();
    }

    private _onChildrenChanged() {
        this._unregisterChildrenEvents();
        this._registerChildrenEvents();
        this._updateSize();
    }

    private _registerChildrenEvents() {
        this.node.children.forEach(child => {
            // 關鍵修正：監聽尺寸變化事件
            child.on(Node.EventType.SIZE_CHANGED, this._onChildSizeChanged, this);
        });
    }

    private _unregisterChildrenEvents() {
        this.node.children.forEach(child => {
            child.off(Node.EventType.SIZE_CHANGED, this._onChildSizeChanged, this);
        });
    }

    /** * 當子節點尺寸（例如文字長大）改變時，觸發父節點重新計算
     */
    private _onChildSizeChanged() {
        // 先讓 Layout 更新（如果有的話），再由 Fitter 更新自身
        const layout = this.getComponent(YileLayout);
        if (layout) {
            layout.forceUpdateLayout();
        }
        this._updateSize();
    }

    private _updateSize() {
        if (!this._uiTransform) return;
        this._handleSelfFittingAlongAxis(0); // Horizontal
        this._handleSelfFittingAlongAxis(1); // Vertical
    }

    private _handleSelfFittingAlongAxis(axis: 0 | 1) {
        const fitting = (axis === 0 ? this.horizontalFit : this.verticalFit);
        if (fitting === FitMode.Unconstrained) return;

        if (fitting === FitMode.PreferredSize) {
            const layout = this.getComponent(YileLayout);
            if (layout) {
                // 從 Layout 獲取計算後的總理想尺寸
                const pref = layout.getTotalPreferredSize(axis);
                const padding = axis === 0 ? (layout.paddingLeft + layout.paddingRight) : (layout.paddingTop + layout.paddingBottom);
                this._setSize(axis, pref + padding);
            } else {
                // 如果沒有 Layout，則使用傳統的 Bounds 計算
                this._setSize(axis, this._calculateBoundsSize(axis));
            }
        }
    }

    private _setSize(axis: 0 | 1, value: number) {
        if (!this._uiTransform) return;
        if (axis === 0) this._uiTransform.width = value;
        else this._uiTransform.height = value;
    }

    private _calculateBoundsSize(axis: 0 | 1): number {
        let min = 0, max = 0;
        this.node.children.forEach(child => {
            if (!child.activeInHierarchy) return;
            const t = child.getComponent(UITransform);
            if (!t) return;
            const pos = child.position;
            if (axis === 0) {
                min = Math.min(min, pos.x - t.width * t.anchorX);
                max = Math.max(max, pos.x + t.width * (1 - t.anchorX));
            } else {
                min = Math.min(min, pos.y - t.height * t.anchorY);
                max = Math.max(max, pos.y + t.height * (1 - t.anchorY));
            }
        });
        return max - min;
    }
}
