import { ITMFont } from "../types/ITMFont";
import LRU from "lru-cache";
import { SpaceInfo } from "../types/types";

export class TextureChannel {    
    private _tmFont: ITMFont;
    private _isDynamic: boolean;
    private _index: number;
    private _rowSize: number;
    private _colSize: number;
    private _capacity: number;
    private _size: number;
    private _disposedSpaces: SpaceInfo[] = [];
    private _fullIndices: number[] = [];
    private _initialized: boolean = false;

    get initialized(): boolean {
        return this._initialized;
    }

    get index(): number {
        return this._index;
    }

    get isDynamic(): boolean {
        return this._isDynamic;
    }

    get count(): number {
        return this._capacity - this._fullIndices.length;
    }

    get rowSize(): number {
        return this._rowSize;
    }

    get colSize(): number {
        return this._colSize;
    }

    get capacity(): number {
        return this._capacity;
    }

    public initial() {
        this._initialized = true;
    }

    constructor(tmFont: ITMFont, index: number, isDynamic: boolean, lru?: LRU<number, SpaceInfo>) {
        this._tmFont = tmFont;
        this._index = index;
        this._isDynamic = isDynamic;

        this._size = tmFont.fontData.spaceSize;        
        this._colSize = Math.floor(tmFont.textureWidth / this._size);
        this._rowSize = Math.floor(tmFont.textureHeight / this._size);
        this._capacity = this._colSize * this._rowSize;

        this._fullIndices = new Array(this._capacity);
        for(let i=this._capacity-1;i>=0;i--) {
            this._fullIndices[i] = i;
        }
    }

    freeChar(index: number) {
        this._fullIndices.push(index);
    }

    addUsed(index: number) {
        let i = this._fullIndices.indexOf(index);
        if(i >= 0) {
            this._fullIndices.splice(i, 1);
        }
    }

    isFull(): boolean {
        return this._fullIndices.length == 0;
    }

    /**
     * 分配新的字符空位
     * @returns 空位信息
     */
    spanEmptySpace(): SpaceInfo {
        let ret: SpaceInfo;
        
        if(this.isFull()) {
            return null;
        }

        let index = this._fullIndices.pop();
        let row = Math.floor(index / this._colSize);
        let col = index % this._colSize;
        let x = col * this._size;
        let y = row * this._size;
        let width = this._size;
        let height = this._size;

        ret = {
            index: index,
            cid: this._index,
            row,
            col,
            width,
            height,
            x,
            y,
            char: null,
        };

        return ret;
    }
}