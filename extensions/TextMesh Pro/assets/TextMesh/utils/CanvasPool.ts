import { macro } from "cc"; // cclegacy 已經不需要，但 macro 仍然需要匯入

export interface ISharedLabelData {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
}

let _canvasPool: CanvasPool;

export class CanvasPool {
    static getInstance (): CanvasPool {
        if (!_canvasPool) {
            _canvasPool = new CanvasPool();
        }
        return _canvasPool;
    }
    public pool: ISharedLabelData[] = [];
    public get () {
        let data = this.pool.pop();

        if (!data) {
            // 【修改點】直接使用全域的 document，不再透過 cclegacy
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', {
                willReadFrequently: true
            });
            data = {
                canvas,
                context,
            };
        }

        return data;
    }

    public put (canvas: ISharedLabelData) {
        if (this.pool.length >= macro.MAX_LABEL_CANVAS_POOL_SIZE) {
            return;
        }
        this.pool.push(canvas);
    }
}
