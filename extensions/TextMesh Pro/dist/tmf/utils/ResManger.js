"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResManager = void 0;
const cc_1 = require("cc");
const Utils_1 = require("./Utils");
const RESOURCES = "resources";
class ResManager {
    static async preload(uuid, progress) {
        return new Promise((resolve, reject) => {
            cc_1.assetManager.preloadAny(uuid, (p) => {
                progress && progress(p);
            }, (err, res) => {
                resolve(res);
            });
        });
    }
    static getBundle(abName) {
        if (!abName || abName == RESOURCES) {
            return cc_1.resources;
        }
        let ab = cc_1.assetManager.getBundle(abName);
        if (!ab) {
            console.error(`can not find asset bundle named ${abName}`);
        }
        return ab;
    }
    static get(abName, url, type) {
        let ab = this.getBundle(abName);
        if (typeof url == "string") {
            let res = ab.get(url, type);
            return res;
        }
        else {
            let ress = [];
            for (let i = 0; i < url.length; i++) {
                let res = ab.get(url[i], type);
                ress.push(res);
            }
            return ress;
        }
    }
    static async getAsync(abName, url, type) {
        let res = this.get(abName, url, type);
        if (res) {
            return res;
        }
        let next = false;
        let err = "";
        this.load(abName, url, type).then(r => {
            res = r;
            next = true;
        }).catch(e => {
            err = e;
            next = true;
        });
        await Utils_1.Utils.until(() => next);
        if (err) {
            console.log(`load ${abName}:${url} data err:${err}`);
        }
        return res;
    }
    static load(abName, url, type, onProgress) {
        return new Promise((resolve, reject) => {
            let ab = this.getBundle(abName);
            ab.load(url, type, onProgress, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
        });
    }
    static loadDir(abName, url, onProgress) {
        return new Promise((resolve, reject) => {
            let ab = this.getBundle(abName);
            ab.loadDir(url, onProgress, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
        });
    }
}
exports.ResManager = ResManager;
