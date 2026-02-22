"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.unload = exports.load = void 0;
const path_1 = require("path");
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const cc_1 = require("cc");
let selectedNode;
let selectedUUID;
let components = [];
function load() {
}
exports.load = load;
;
function unload() {
}
exports.unload = unload;
;
function traverse(node, callback) {
    callback(node);
    node.children.forEach(child => {
        callback(child);
        traverse(child, callback);
    });
}
exports.methods = {
    selected(data, uuid) {
        let scene = cc_1.director.getScene();
        components.forEach((component) => {
            if (component["onParentLostFocusInEditor"]) {
                component["onParentLostFocusInEditor"]();
            }
        });
        components.length = 0;
        let root = cce.Node.query(uuid);
        selectedNode = root;
        selectedUUID = uuid;
        if (root) {
            traverse(root, (node) => {
                if (root == node) {
                    return;
                }
                node.components.forEach((component) => {
                    if (component.enabled && component["onParentFocusInEditor"]) {
                        component["onParentFocusInEditor"]();
                    }
                    components.push(component);
                });
            });
        }
    },
    async addLabel(parent, text, fontSize = 20, is3D = false) {
        let node = new cc_1.Node;
        node.name = "TextMeshLabel";
        node.layer = parent.layer;
        parent.addChild(node);
        await Editor.Message.request("scene", "create-component", {
            uuid: node.uuid,
            component: "cc.UITransform",
        });
        let tr = node._uiProps.uiTransformComp;
        tr.width = 100;
        tr.height = 50;
        await Editor.Message.request("scene", "create-component", {
            uuid: node.uuid,
            component: "TextMeshLabel",
        });
        let textMeshLabel;
        node.components.forEach((component) => {
            if (component.name.indexOf("TextMeshLabel") >= 0) {
                textMeshLabel = component;
            }
        });
        if (textMeshLabel) {
            textMeshLabel.fontName = is3D ? "Arial3D" : "Arial";
            textMeshLabel.string = text;
            textMeshLabel.fontSize = fontSize;
        }
        return node;
    },
    async createLabel() {
        if (selectedNode) {
            await this.addLabel(selectedNode, "Text Mesh");
        }
    },
    async createButton() {
        if (selectedNode) {
            let button = new cc_1.Node;
            button.name = "button";
            button.layer = selectedNode.layer;
            selectedNode.addChild(button);
            await Editor.Message.request("scene", "create-component", {
                uuid: button.uuid,
                component: "cc.UITransform",
            });
            let tr = button._uiProps.uiTransformComp;
            tr.width = 100;
            tr.height = 50;
            await Editor.Message.request("scene", "create-component", {
                uuid: button.uuid,
                component: "cc.Button",
            });
            await this.addLabel(button, "Text Mesh", 20);
        }
    },
    checkComponetInParent(node, name) {
        let result = false;
        node.components.forEach((component) => {
            if (component.name.indexOf(name) >= 0) {
                result = true;
            }
        });
        if (!result && node.parent) {
            result = this.checkComponetInParent(node.parent, name);
        }
        return result;
    },
    async createLabel3D() {
        if (selectedNode) {
            let node = await this.addLabel(selectedNode, "Text Mesh", 20, true);
            node.setScale(0.01, 0.01, 0.01);
            if (!this.checkComponetInParent(node, "RenderRoot2D")) {
                await Editor.Message.request("scene", "create-component", {
                    uuid: node.uuid,
                    component: "cc.RenderRoot2D",
                });
            }
        }
    }
};
