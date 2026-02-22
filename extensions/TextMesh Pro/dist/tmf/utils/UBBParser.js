"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UBBParser = exports.TagNode = void 0;
class TagNode {
    constructor(name) {
        this.name = name || '';
    }
}
exports.TagNode = TagNode;
const booleanRegex = /^(true|false)$/i;
const CHAR_POUND = '#';
const CHAR_HEX = '0x';
class UBBParser {
    constructor() {
        this._tagInfo = { name: "", pos: 0, ended: false };
    }
    exception(msg) {
        console.error("UBBParser: " + msg);
        this._tagInfo.pos = this._text.length;
    }
    addTextNode(text) {
        let node = new TagNode();
        node.type = "text";
        node.text = text;
        if (!this._currentNode.children) {
            this._currentNode.children = [];
        }
        this._currentNode.children.push(node);
    }
    addNode(name, value) {
        let node = new TagNode();
        node.type = "node";
        node.name = name;
        node.value = value;
        if (!this._currentNode.children) {
            this._currentNode.children = [];
        }
        this._currentNode.children.push(node);
        node._parent = this._currentNode;
        this._currentNode = node;
    }
    addAttribute(name, value) {
        if (!this._currentNode.attributes) {
            this._currentNode.attributes = {};
        }
        this._currentNode.attributes[name] = value;
    }
    setNodeText(value) {
        this._currentNode.text = value;
    }
    closeNode(name) {
        if (name) {
            if (this._currentNode.name != name) {
                this.exception("close node error:" + this._currentNode.name + " != " + name);
            }
            else {
                this._currentNode._closed = true;
            }
        }
        this._tagInfo.name = null;
        this._tagInfo.ended = false;
        if (this._currentNode != this._root && this._currentNode._closed) {
            let old = this._currentNode;
            this._currentNode = this._currentNode._parent;
            delete old._parent;
            delete old._closed;
            return true;
        }
        return false;
    }
    isValidChar(char, pos) {
        // 字符相等，且未被转义
        if ((pos == 0 || pos > 0 && this._text[pos - 1] !== '\\') && this._text.substring(pos, pos + char.length) == char) {
            return true;
        }
        return false;
    }
    getTagName(startPos, tag_e) {
        this._tagInfo.ended = false;
        let tagName = "";
        let tagValue = null;
        let pos = startPos;
        let len = this._text.length;
        while (pos < len) {
            if (this._text[pos] == '=') {
                tagName = this._text.substring(startPos, pos);
                tagValue = this.getTagValue(tagName, pos, tag_e);
                break;
            }
            else {
                let tagEnd1 = this.isValidChar(tag_e, pos);
                // 自闭合标签<br/>
                let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                if (this._text[pos] == ' ' || tagEnd1 || tagEnd2) {
                    tagName = this._text.substring(startPos, pos);
                    this._tagInfo.pos = pos;
                    pos++;
                    if (tagEnd2) {
                        pos++;
                        this._tagInfo.ended = true;
                        this._tagInfo.pos = pos;
                    }
                    break;
                }
                else {
                    pos++;
                }
            }
        }
        this._tagInfo.name = tagName;
        this.addNode(tagName, tagValue);
        return this._tagInfo;
    }
    getTagValue(tagName, startPos, tag_e) {
        let tagValue = null;
        let pos = startPos;
        let len = this._text.length;
        let startQuote = null;
        let match = false;
        let begin = false;
        while (pos < len) {
            if (!begin) {
                if (this._text[pos] == ' ') {
                    pos++;
                    continue;
                }
                if (this._text[pos] == "=") {
                    pos++;
                    if (pos >= len) {
                        this.exception("tag value error," + this._text.substring(startPos, pos));
                        break;
                    }
                    if (this._text[pos] == '\"' || this._text[pos] == "'") {
                        startQuote = this._text[pos];
                        pos++;
                    }
                    startPos = pos;
                    begin = true;
                    continue;
                }
            }
            if (startQuote) {
                if (this.isValidChar(startQuote, pos)) {
                    tagValue = this._text.substring(startPos, pos);
                    pos++;
                    startPos = pos;
                    startQuote = null;
                    match = true;
                    break;
                }
                else {
                    pos++;
                }
            }
            else if (begin) {
                let tagEnd1 = this.isValidChar(tag_e, pos);
                let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                if (this._text[pos] == ' ' || tagEnd1 || tagEnd2) {
                    tagValue = this._text.substring(startPos, pos);
                    if (tagEnd2) {
                        this._tagInfo.ended = true;
                    }
                    startPos = pos;
                    startQuote = null;
                    if (tagValue != null) {
                        if (booleanRegex.test(tagValue)) {
                            tagValue = tagValue.toLowerCase() == "true";
                        }
                        else if (tagValue.indexOf('.') != -1) {
                            tagValue = parseFloat(tagValue);
                            if (Number.isNaN(tagValue)) {
                                console.error("tag value error," + this._text.substring(startPos, pos));
                            }
                        }
                        else if (tagName == "color" || tagValue[0] == CHAR_POUND || tagValue.substring(0, 2) == CHAR_HEX) {
                            // do nothing
                        }
                        else {
                            tagValue = parseInt(tagValue);
                            if (Number.isNaN(tagValue)) {
                                console.error("tag value error," + this._text.substring(startPos, pos));
                            }
                        }
                    }
                    match = true;
                    break;
                }
                else {
                    pos++;
                }
            }
            else {
                pos++;
            }
        }
        if (!match) {
            this.exception("get tag value error");
        }
        this._tagInfo.pos = pos;
        return tagValue;
    }
    getAttribute(startPos, tag_e) {
        let attrName = "";
        let attrValue = "";
        let pos = startPos;
        let startQuote = null;
        let len = this._text.length;
        let checkBoolTag = () => {
            if (!attrName && pos > startPos) {
                attrName = this._text.substring(startPos, pos).replace(/ /g, "");
                if (attrName) {
                    this.addAttribute(attrName, true);
                    startPos = pos;
                    attrName = null;
                }
            }
        };
        while (pos < len) {
            if (!attrName) {
                if (this._text[pos] == ' ') {
                    checkBoolTag();
                    pos++;
                    startPos = pos;
                    continue;
                }
                else if (this.isValidChar(tag_e, pos)) {
                    checkBoolTag();
                    pos++;
                    break;
                }
                else if (this.isValidChar("/" + tag_e, pos)) {
                    checkBoolTag();
                    // 自闭合标签
                    pos += 2;
                    this._tagInfo.ended = true;
                    break;
                }
                if (this._text[pos] == '=') {
                    attrName = this._text.substring(startPos, pos);
                    pos++;
                    if (pos >= len) {
                        this.exception("tag value error," + this._text.substring(startPos, pos));
                        break;
                    }
                    if (this._text[pos] == '\"' || this._text[pos] == "'") {
                        startQuote = this._text[pos];
                        pos++;
                    }
                    startPos = pos;
                }
                else {
                    pos++;
                }
            }
            else {
                if (startQuote) {
                    if (this.isValidChar(startQuote, pos)) {
                        attrValue = this._text.substring(startPos, pos);
                        pos++;
                        startPos = pos;
                        startQuote = null;
                        this.addAttribute(attrName, attrValue);
                        attrName = null;
                    }
                    else {
                        pos++;
                    }
                }
                else {
                    let space = this._text[pos] == ' ';
                    let tagEnd1 = this.isValidChar(tag_e, pos);
                    let tagEnd2 = this.isValidChar("/" + tag_e, pos);
                    if (space || tagEnd1 || tagEnd2) {
                        attrValue = this._text.substring(startPos, pos);
                        if (space) {
                            pos++;
                        }
                        startPos = pos;
                        startQuote = null;
                        if (booleanRegex.test(attrValue)) {
                            attrValue = attrValue.toLowerCase() == "true";
                        }
                        else if (attrValue.indexOf('.') != -1) {
                            attrValue = parseFloat(attrValue);
                        }
                        else if (attrName == "color" || attrValue[0] == CHAR_POUND || attrValue.substring(0, 2) == CHAR_HEX) {
                            // do nothing
                        }
                        else {
                            attrValue = parseInt(attrValue);
                        }
                        this.addAttribute(attrName, attrValue);
                        attrName = null;
                    }
                    else {
                        pos++;
                    }
                }
            }
        }
        if (startQuote) {
            this.exception("attribute value is not closed");
        }
        this._tagInfo.pos = pos;
        return pos;
    }
    getText(startPos, tag_s, tag_e) {
        if (this._text[startPos] == tag_s) {
            return startPos;
        }
        let text = "";
        let pos = startPos;
        let len = this._text.length;
        let strs = [];
        while (pos < len) {
            if (this._text[pos] == tag_s) {
                if (this.isValidChar(tag_s, pos)) {
                    break;
                }
                else {
                    strs.pop();
                    strs.push(this._text[pos]);
                }
            }
            else {
                strs.push(this._text[pos]);
            }
            pos++;
        }
        text = strs.join(""); // this._text.substring(startPos, pos);
        this._tagInfo.pos = pos;
        this.setNodeText(text);
        return pos;
    }
    getTail(startPos, tag_s, tag_e) {
        if (this._text[startPos] != tag_s || this._text[startPos] == tag_s && this._text[startPos + 1] != "/") {
            this._tagInfo.name = null;
            return startPos;
        }
        let nodeName = "";
        let pos = startPos;
        let len = this._text.length;
        let check = 0;
        while (pos < len) {
            if (this.isValidChar(tag_s + "/", pos)) {
                pos += 2;
                startPos = pos;
                check++;
                continue;
            }
            if (this._text[pos] == ' ') {
                pos++;
                continue;
            }
            if (this._text[pos] == tag_e) {
                nodeName = this._text.substring(startPos, pos);
                pos++;
                check++;
                break;
            }
            pos++;
        }
        if (check != 2) {
            this.exception("tag tail error");
        }
        else {
            this._tagInfo.ended = true;
        }
        this._tagInfo.name = nodeName;
        this._tagInfo.pos = pos;
        return pos;
    }
    // ubb 解析
    parse(text, ubb) {
        this._root = new TagNode("root");
        this._root.type = "root";
        this._tagInfo.name = null;
        this._tagInfo.ended = false;
        this._tagInfo.pos = 0;
        this._currentNode = this._root;
        this._text = text;
        this.lastColor = null;
        this.lastSize = null;
        let startPos = 0;
        let pos = 0;
        let tag_s = ubb ? "[" : "<";
        let tag_e = ubb ? "]" : ">";
        let len = this._text.length;
        while (pos < len) {
            if (!this._tagInfo.name && this._text[pos] == tag_s) {
                if (startPos < pos && !this._tagInfo.name) {
                    this.addTextNode(this._text.substring(startPos, pos));
                }
                // 获取尾部
                pos = this.getTail(pos, tag_s, tag_e);
                if (this._tagInfo.ended) {
                    this.closeNode(this._tagInfo.name);
                    this._tagInfo.name = null;
                    startPos = pos;
                    continue;
                }
                // 跳过开始符号
                pos++;
                // 获取标签名
                this.getTagName(pos, tag_e);
                if (this._tagInfo.name) {
                    pos = this._tagInfo.pos;
                    if (this._tagInfo.ended) {
                        this.closeNode(this._tagInfo.name);
                        this._tagInfo.name = null;
                        startPos = pos;
                        continue;
                    }
                }
                else {
                    console.log("tag name is null in pos: " + pos);
                    break;
                }
                // 获取属性
                pos = this.getAttribute(pos, tag_e);
                if (!this._tagInfo.ended) {
                    // 获取文本
                    pos = this.getText(pos, tag_s, tag_e);
                    // 获取尾部
                    pos = this.getTail(pos, tag_s, tag_e);
                }
                if (this._tagInfo.ended) {
                    this.closeNode(this._tagInfo.name);
                    this._tagInfo.name = null;
                    startPos = pos;
                    continue;
                }
                this._tagInfo.name = null;
                startPos = pos;
                this.closeNode(null);
            }
            else {
                if (pos == len - 1 && !this._tagInfo.name) {
                    this.addTextNode(this._text.substring(startPos, pos + 1));
                }
                pos++;
            }
        }
        this._text = null;
        return this._root;
    }
}
exports.UBBParser = UBBParser;
UBBParser.inst = new UBBParser();
