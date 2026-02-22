import {assetManager, game, JsonAsset} from "cc";
import {TextStyle} from "./TextStyle";
import {EDITOR} from "cc/env";

// 資源路徑
const STYLE_JSON_RES_PATH = 'fonts/StyleJson';

// 這兩個路徑僅供編輯器下的 "儲存/刪除樣式" 功能使用
const STYLE_TYPE_ASSET_PATH = 'db://text-mesh/label/TextStyleType.ts';
const STYLE_JSON_PATH = 'db://assets/resources/fonts/StyleJson.json';

export class StyleManager {

    // ========================= 【靜態屬性與方法】 =========================

    public static readonly TMF_STYLE_CHANGED = "tmf_style_changed";


    // ========================= 【私有變數】 =========================

    private static _styles: { [key: string]: TextStyle } = {};
    private static _tags: { [key: string]: TextStyle } = {};
    private static _defaultStyle: TextStyle = new TextStyle();
    private static _initialized: boolean = false;
    private static _initializingPromise: Promise<void> | null = null;

    // ========================= 【公開方法】 =========================

    public static async getStyle(key: string): Promise<TextStyle> {
        await this.ensureInitialized();
        return this._styles[key] || this._defaultStyle;
    }

    public static async getTagStyle(key: string): Promise<TextStyle> {
        await this.ensureInitialized();
        key = key.toLocaleLowerCase();
        return this._tags[key];
    }

    public static getStyleKeys(): string[] {
        return Object.keys(this._styles);
    }

    public static removeAll() {
        this._styles = {};
        this._tags = {};
        this._onStyleChanged();
    }

    public static registerByJsonObject(json: object) {
        this.removeAll();
        for (let key in json) {
            let textStyle = new TextStyle();
            textStyle.parseFromJson(json[key]);
            this._registerSingleStyle(key, textStyle);
        }
        this._onStyleChanged();
    }


    // ========================= 【私有方法】 =========================

    private static ensureInitialized(): Promise<void> {
        if (!this._initializingPromise) {
            this._initializingPromise = this.init();
        }
        return this._initializingPromise;
    }

    /**
     * [運行時] 初始化，從 resources 資料夾載入樣式
     */
    private static async init(): Promise<void> {
        // 在編輯器模式下，我們允許重複初始化，以便在檔案變更後能重新載入
        if (this._initialized && !EDITOR) {
            return;
        }
        console.log('[StyleManager] Initializing...');

        return new Promise((resolve, reject) => {
            const onLoaded = (err: Error | null, asset: JsonAsset) => {
                if (err) {
                    console.error(`[StyleManager] Failed to load style file from resources: ${STYLE_JSON_RES_PATH}`, err);
                    reject(err);
                    return;
                }

                if (asset && asset.json) {
                    this.registerByJsonObject(asset.json);
                    console.log('[StyleManager] Successfully loaded styles from resources.', asset.json);
                } else {
                    console.warn(`[StyleManager] Style file loaded from resources but it is empty: ${STYLE_JSON_RES_PATH}`);
                }

                this._initialized = true;
                resolve();
            };

            if (EDITOR) {
                // 在編輯器模式下，使用 UUID 載入，因為 assetManager.resources.load 不可靠
                (async () => {
                    try {
                        // @ts-ignore
                        const uuid = await Editor.Message.request('asset-db', 'query-uuid', STYLE_JSON_PATH);
                        assetManager.loadAny({uuid: uuid, type: JsonAsset}, onLoaded);
                    } catch (e) {
                        onLoaded(e, null);
                    }
                })();
            } else {
                // 在運行時，使用標準的 resources.load
                assetManager.resources.load(STYLE_JSON_RES_PATH, JsonAsset, onLoaded); // 此行保持不變，但為保持一致性，也可以修改
            }
        });
    }

    private static _onStyleChanged() {
        game.emit(StyleManager.TMF_STYLE_CHANGED);
    }

    private static _registerSingleStyle(key: string, style: TextStyle) {
        this._styles[key] = style;
        if (style.asTag) this._tags[key.toLocaleLowerCase()] = style;
        if (style.alias) this._tags[style.alias.toLocaleLowerCase()] = style;
    }

    // ========================= 【編輯器專用功能】 =========================

    /**
     * [編輯器專用] 將指定的樣式資料儲存到檔案中。
     * @param styleName 要儲存的樣式名稱。
     * @param jsonData 包含樣式屬性的物件。
     */
    public static async saveStyleToFiles(styleName: string, jsonData: any) {
        if (!EDITOR) {
            console.warn('[StyleManager] saveStyleToFiles is an editor-only function.');
            return;
        }
        if (!jsonData) {
            console.error('[StyleManager] 樣式來源 (JsonData) 不得為空。');
            return;
        }
        if (!styleName) {
            console.error('[StyleManager] 請輸入有效的樣式名稱。');
            return;
        }

        // @ts-ignore
        const result = await Editor.Dialog.warn(`是否儲存樣式 "${styleName}"`, {
            detail: '您確定要儲存樣式設定嗎？這將會修改 TextStyleType.ts 和 StyleJson.json。',
            buttons: ['確定', '取消'],
            default: 1,
            cancel: 1
        });

        if (result.response !== 0) {
            console.log('[StyleManager] 已取消儲存操作。');
            return;
        }

        console.log(`[StyleManager] 開始儲存樣式: ${styleName}`);

        try {
            // @ts-ignore
            const fs = require('fs');

            // --- 步驟 1: 更新 StyleJson.json ---
            // @ts-ignore
            const jsonAbsPath = await Editor.Message.request('asset-db', 'query-path', STYLE_JSON_PATH);
            let stylesJson = {};
            if (fs.existsSync(jsonAbsPath)) {
                const jsonContent = fs.readFileSync(jsonAbsPath, 'utf-8');
                stylesJson = JSON.parse(jsonContent);
            }
            stylesJson[styleName] = jsonData;
            fs.writeFileSync(jsonAbsPath, JSON.stringify(stylesJson, null, 4));
            console.log(`%c[StyleManager] 成功更新 ${STYLE_JSON_PATH}`, 'color: green');

            // --- 步驟 2: 更新 TextStyleType.ts (Enum) ---
            // @ts-ignore
            const tsAbsPath = await Editor.Message.request('asset-db', 'query-path', STYLE_TYPE_ASSET_PATH);
            if (fs.existsSync(tsAbsPath)) {
                let tsContent = fs.readFileSync(tsAbsPath, 'utf-8');
                const enumKey = `${styleName} = "${styleName}"`;
                if (!tsContent.includes(`"${styleName}"`)) {
                    const regex = /(export\s+enum\s+TextStyleType\s*\{[^}]*)\}/;
                    tsContent = tsContent.replace(regex, `$1    ${enumKey},\n}`);
                    fs.writeFileSync(tsAbsPath, tsContent);
                    console.log(`%c[StyleManager] 成功更新 ${STYLE_TYPE_ASSET_PATH}`, 'color: green');
                }
            }

            // --- 步驟 3: 重新整理資產並重新載入記憶體 ---
            console.log('[StyleManager] 正在重新整理資產...');
            // @ts-ignore
            await Editor.Message.request('asset-db', 'refresh-asset', STYLE_JSON_PATH);
            // @ts-ignore
            await Editor.Message.request('asset-db', 'refresh-asset', STYLE_TYPE_ASSET_PATH);

            // 強制重新載入記憶體中的樣式
            this._initialized = false;
            this._initializingPromise = null;
            await this.init();

            console.log('%c[StyleManager] 樣式庫更新完畢！', 'color: green; font-weight: bold;');

        } catch (e) {
            console.error('[StyleManager] 儲存樣式檔時發生錯誤:', e);
        }
    }

    /**
     * [編輯器專用] 從檔案中刪除指定的樣式。
     * @param styleName 要刪除的樣式名稱。
     */
    public static async deleteStyleFromFiles(styleName: string) {
        if (!EDITOR) {
            console.warn('[StyleManager] deleteStyleFromFiles is an editor-only function.');
            return;
        }

        if (!styleName || styleName === "Default" || styleName === "<None>") {
            console.error('[StyleManager] 請選擇一個有效的樣式進行刪除。注意："Default" 和 "<None>" 無法被刪除。');
            return;
        }

        // @ts-ignore
        const result = await Editor.Dialog.warn(`確定要永久刪除樣式 "${styleName}" 嗎？`, {
            detail: '此操作將會修改 TextStyleType.ts 和 StyleJson.json 檔案，且無法復原。',
            buttons: ['確定刪除', '取消'],
            default: 1, cancel: 1
        });

        if (result.response !== 0) {
            console.log('[StyleManager] 已取消刪除操作。');
            return;
        }

        console.log(`[StyleManager] 開始從檔案中刪除樣式設定: ${styleName}`);

        try {
            // @ts-ignore
            const fs = require('fs');

            // --- 步驟 1: 更新 StyleJson.json ---
            // @ts-ignore
            const jsonAbsPath = await Editor.Message.request('asset-db', 'query-path', STYLE_JSON_PATH);
            if (fs.existsSync(jsonAbsPath)) {
                let stylesJson = JSON.parse(fs.readFileSync(jsonAbsPath, 'utf-8'));
                if (stylesJson[styleName]) {
                    delete stylesJson[styleName];
                    fs.writeFileSync(jsonAbsPath, JSON.stringify(stylesJson, null, 4));
                    console.log(`%c[StyleManager] 已從 ${STYLE_JSON_PATH} 中刪除樣式設定`, 'color: green');
                    // @ts-ignore
                    await Editor.Message.request('asset-db', 'refresh-asset', STYLE_JSON_PATH);
                }
            }

            // --- 步驟 2: 更新 TextStyleType.ts ---
            // @ts-ignore
            const tsAbsPath = await Editor.Message.request('asset-db', 'query-path', STYLE_TYPE_ASSET_PATH);
            if (fs.existsSync(tsAbsPath)) {
                let tsContent = fs.readFileSync(tsAbsPath, 'utf-8');
                // 使用正則表達式來安全地刪除對應的枚舉行
                // 這個正則會尋找包含 `styleName = "styleName"` 的整行，並處理前後的空白和逗號
                const regex = new RegExp(`\\s*${styleName}\\s*=\\s*"${styleName}"\\s*,?\\s*\\n?`);
                if (regex.test(tsContent)) {
                    tsContent = tsContent.replace(regex, '');
                    fs.writeFileSync(tsAbsPath, tsContent);
                    console.log(`%c[StyleManager] 已從 ${STYLE_TYPE_ASSET_PATH} 中移除枚舉值`, 'color: green');
                    // @ts-ignore
                    await Editor.Message.request('asset-db', 'refresh-asset', STYLE_TYPE_ASSET_PATH);
                }
            }

            // --- 步驟 3: 重新載入記憶體 ---
            this._initialized = false;
            this._initializingPromise = null;
            await this.init();

            console.log('%c[StyleManager] 樣式庫更新完畢！', 'color: green; font-weight: bold;');

        } catch (e) {
            console.error('[StyleManager] 刪除樣式檔時發生錯誤:', e);
        }
    }
}
