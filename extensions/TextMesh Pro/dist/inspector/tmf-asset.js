"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const weakMap = new WeakMap();
var showApp;
var hideApp;
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
        },
        hide() {
        },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/template/tmf-asset/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../static/style/tmf-asset/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
        hello() {
        },
    },
    update(assetList, metaList) {
        let data = assetList[0];
        if (showApp) {
            if (data.name.endsWith(".tmf.txt")) {
                showApp();
            }
            else {
                hideApp();
            }
        }
    },
    ready() {
        // return;
        // setVisible(this.$.codeArea, false);
        console.log("1231231 ready");
        if (this.$.app) {
            //@ts-ignore
            // this.$this.before(this.$this.previousSibling);
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        show: false,
                        optFontSize: 1,
                        sizeOptions: [
                            128,
                            256,
                            512,
                            1024,
                            2018,
                            4096,
                        ],
                        model: {
                            font: "",
                            fontSize: 46,
                            padding: 4,
                            atlasWidth: 1024,
                            atlasHeight: 1024,
                            charset: "",
                        },
                    };
                },
                watch: {
                    model: {
                        handler(value, oldValue) {
                        },
                        deep: true,
                    }
                },
                methods: {
                    hide() {
                        this.show = false;
                    }
                },
                computed: {
                    auto_font_size() {
                        return this.optFontSize == 1;
                    }
                },
                mounted() {
                    showApp = () => {
                        this.show = true;
                    };
                    hideApp = () => {
                        this.show = false;
                    };
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            weakMap.set(this, app);
        }
    },
    beforeClose() {
    },
    close() {
        const app = weakMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
