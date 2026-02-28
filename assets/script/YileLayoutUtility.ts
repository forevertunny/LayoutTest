import { UITransform } from 'cc';
import { YileLayoutElement } from './YileLayoutElement';

/**
 * 佈局工具類別 (對標 Unity LayoutUtility.cs)
 */
export class YileLayoutUtility {
    /**
     * 獲取佈局元素的最小尺寸
     */
    public static getMinSize(trans: UITransform, axis: number): number {
        const el = trans.getComponent(YileLayoutElement);
        if (!el) return 0;
        if (axis === 0) return el.useMinWidth ? el.minWidth : 0;
        return el.useMinHeight ? el.minHeight : 0;
    }

    /**
     * 獲取佈局元素的理想尺寸
     */
    public static getPreferredSize(trans: UITransform, axis: number): number {
        const el = trans.getComponent(YileLayoutElement);
        const min = this.getMinSize(trans, axis);
        let pref = 0;

        if (axis === 0) {
            pref = (el && el.usePreferredWidth) ? el.preferredWidth : trans.width;
        } else {
            pref = (el && el.usePreferredHeight) ? el.preferredHeight : trans.height;
        }

        // 根據 Unity 邏輯：Preferred 寬度是 Min 與 Preferred 的最大值
        return Math.max(min, pref);
    }

    /**
     * 獲取佈局元素的彈性尺寸權重
     */
    public static getFlexibleSize(trans: UITransform, axis: number, forceExpand: boolean): number {
        const el = trans.getComponent(YileLayoutElement);
        let flex = 0;

        if (el) {
            flex = axis === 0 ? (el.useFlexibleWidth ? el.flexibleWidth : 0) : (el.useFlexibleHeight ? el.flexibleHeight : 0);
        }

        // 如果開啟了強制擴展，則 Flexible 權重至少為 1
        if (forceExpand) flex = Math.max(flex, 1);
        return flex;
    }
}
