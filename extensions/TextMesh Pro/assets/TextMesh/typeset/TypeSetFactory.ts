import { ITypeSet } from "../types/ITypeSet";
import { HorizontalTypeSet } from "./HorizontalTypeSet";

export class TypeSetFactory {
    private static _typeMap: {[key: string]: Function} = {};
    private static _typeInsts: {[key: string]: ITypeSet} = {};

    static regist(type: string, cst: Function) {
        this._typeMap[type] = cst;
    }

    static get(type: string): ITypeSet {
        if(this._typeInsts[type]) {
            return this._typeInsts[type];
        }

        if(!this._typeMap[type]) {
            console.error(`can not find typeset type named ${type}`);
            return null;
        }

        let inst = new (this._typeMap[type] as ObjectConstructor)() as ITypeSet;
        this._typeInsts[type] = inst;

        return inst;
    }
}

TypeSetFactory.regist("horizontal", HorizontalTypeSet);