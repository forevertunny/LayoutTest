'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.ready = exports.update = exports.template = exports.$ = void 0;
exports.$ = {
    'test': '.test',
};
exports.template = `
<ui-prop>
    <ui-label slot="label">Test</ui-label>
    <ui-checkbox slot="content" class="test"></ui-checkbox>
</ui-prop>
`;
console.log("tmf-asset");
function update(assetList, metaList) {
    this.assetList = assetList;
    this.metaList = metaList;
    let data = assetList[0];
    this.isTMFJson = data.name.endsWith(".tmf.json");
    console.log(data);
}
exports.update = update;
;
function ready() {
    if (!this.isTMFJson) {
        this.$.test.visible = false;
        return;
    }
    this.$.test.addEventListener('confirm', () => {
        this.metaList.forEach((meta) => {
            // 修改对应的 meta 里的数据
            // meta.userData.test = !!this.$.test.value;
        });
        // 修改后手动发送事件通知，资源面板是修改资源的 meta 文件，不是修改 dump 数据，所以发送的事件和组件属性修改不一样
        this.dispatch('change');
    });
}
exports.ready = ready;
;
function close(his) {
    // TODO something
}
exports.close = close;
;
