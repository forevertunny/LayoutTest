import { Asset, assetManager, resources } from "cc";
import { EDITOR } from "cc/env";
import { Utils } from "./Utils";

const RESOURCES = "resources";

type AssetType = typeof Asset;

export class ResManager {
    static async preload(uuid: string, progress?: Function) {
        return new Promise((resolve, reject) => {
            assetManager.preloadAny(uuid, (p) => {
                progress && progress(p);
            }, (err: any, res: any) => {
                resolve(res);
            });
        })
    }

    static async loadAB(abName: string, progress?: Function) {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(abName, (p) => {
                progress && progress(p);
            }, (err: any, res: any) => {
                resolve(res);
            });
        })
    }

    static getBundle(abName?: string) {
        if(!abName || abName == RESOURCES) {
            return resources;
        }

        let ab = assetManager.getBundle(abName);
        if(!ab) {
            console.error(`can not find asset bundle named ${abName}`);
        }
        return ab;
    }

    static getBundleAsync(abName: string) {
        return new Promise((resolve, reject) => {
            let ab = this.getBundle(abName);
            if(ab) {
                resolve(ab);
            }else{
                assetManager.loadBundle(abName, (p) => {}, (err: any, res: any) => {
                    if(err) {
                        reject(err);
                    }else{
                        resolve(res);
                    }
                });
            }
        })
    }

    static async getByUUIDAsync<T = Asset>(uuid: string, type: typeof Asset): Promise<T> {
        let next = false;
        let res: T = null;
        assetManager.loadAny(uuid, {type: type as any}, null, (err: Error | null, data: T)=>{
            next = true;
            res = data;

            if(err) {
                console.log(`load ${uuid} data err:${err}`);
            }
        });
        await Utils.until(()=>next);

        return res;
    }

    static get<T>(abName: string, url: string | Array<string>, type: typeof Asset): T | T[] {
        let ab = this.getBundle(abName);
        if(!ab) {
            return null;
        }

        if(typeof url == "string") {
            let res = ab.get(url, type as any);
            return res as any;
        }else{
            let ress = [];
            for(let i=0;i<url.length;i++) {
                let res = ab.get(url[i], type as any);
                ress.push(res);
            }
            return ress;
        }
    }

    static async getAsync<T>(abName: string, url: string | Array<string>, type: typeof Asset){
        let res = this.get(abName, url, type);
        if(res) {
            return res as any;
        }

        let next = false;
        let err = "";
        this.load(abName, url, type).then(r=>{
            res = r as any;
            next = true;
        }).catch(e=>{
            err = e;
            next = true;
        })

        await Utils.until(()=>next);

        if(err) {
            console.log(`load ${abName}:${url} data err:${err}`);
        }

        return res;
    }

    static load<T>(abName: string, url: string | Array<string>, type: typeof Asset, onProgress?: any): Promise<T|T[]> {
        return new Promise((resolve, reject) => {
            let ab = this.getBundle(abName);
            ab.load(url as any, type as any, onProgress, (err: any, res: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
        })
    }

    static loadDir(abName: string, url: string | Array<string>, onProgress?: any): Promise<Asset[]> {
        return new Promise((resolve, reject) => {
            let ab = this.getBundle(abName);
            ab.loadDir(url as any, onProgress, (err: any, res: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            })
        })
    }   

    /**
     * 编辑器下加载资源
     * @param url db://assets/
     */
     static editorLoad<T>(url: string): Promise<T> {
        // log(url);
        return new Promise<T>((resolve, reject) => {
            if (!EDITOR) {
                resolve(null);
                return;
            }
            //@ts-ignore
            Editor.Message.request("asset-db", "query-uuid", `db://assets/${url}`).then((uuid) => {
                // log(uuid);
                if (!uuid) {
                    resolve(null);
                    console.warn(`uuid查询失败 url: ${url}`);
                    return;
                }
                assetManager.loadAny(uuid, (error: any, result: T) => {
                    // log(error);
                    // log(result);
                    if (error || !result) {
                        resolve(null);
                        console.warn(`资源加载失败 url: ${url}`);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }
}