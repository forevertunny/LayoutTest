import { EDITOR } from "cc/env";

export type TMFontInfo = {
    id?: number;
    version?: string;
    font?: string;
    atlas?: string;
    charset?: string;
    fontFamily?: string;
    
    fontSize?: number;
    padding?: number;
    padTrim?: number;
    atlasWidth?: number;
    atlasHeight?: number;
    dynamic?: number;
    staticChannels?: number;  
    
    enableAutoFree?: number;
    offsetY?: number;

    normalWeight?: number;
    boldWeightScale?: number;
    strokeScale?: number;
    strokeBlur?: number;
    shadowSize?: number;
    shadowBlur?: number;

    underLineOffset?: number;
    keepUnlderLineSpace?: number;
    underLineThickness?: number;
    strikeOffset?: number;
    strikeThickness?: number;
    scriptThickness?: number;

    chars: {
        [code: string]: TMFCharInfo;
    }
}

export type TMFCharInfo = {
    channelID?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    size?: number;
    glyphWidth?: number;
    glyphHeight?: number;
    glyphAdvance?: number;
    glyphLeft?: number;
    glyphRight?: number;
    ascent?: number;
    descent?: number;
    scale?: number;
}

export class FontParser {
    private static _sid = 0;
    private static _fonts: { [uuid: string]: TMFontInfo } = {};

    static parse(uuid: string, data: string): TMFontInfo {
        if(!EDITOR) {
            let fontInfo = this._fonts[uuid];
            if (fontInfo) {
                return fontInfo;
            }
        }

        let result: TMFontInfo = {
            chars: {},
        };

        let lines = data.split("\n");
        for(let i=0;i<lines.length;i++) {
            let arr=lines[i].split("=");
            if(arr.length == 2) {
                let field = arr[0];
                if(field!="char") {
                    if(field != "version" && field != "font" && field != "atlas" && field != "charset" && field != "fontFamily") {
                        result[field] = parseFloat(arr[1]);
                    } else {
                        result[field] = arr[1].replace(/[\r\n]/gi, "");
                    }               
                }else{
                    let parms = arr[1].split(",");
                    result.chars[parms[0]] = {
                        channelID: parseInt(parms[1]),
                        x: parseInt(parms[2]),
                        y: parseInt(parms[3]),
                        width: parseInt(parms[4]),
                        height: parseInt(parms[5]),                        
                        size: parseInt(parms[6]),                      
                        glyphWidth: parseInt(parms[7]),                      
                        glyphHeight: parseInt(parms[8]),
                        glyphAdvance: parseFloat(parms[9]),
                        glyphLeft: parseFloat(parms[10]),                      
                        glyphRight: parseFloat(parms[11]),                      
                        ascent: parseFloat(parms[12]),                   
                        descent: parseFloat(parms[13]),
                        scale: parseFloat(parms[14]),
                    };
                }
            }
        }

        result.id = ++this._sid;
        this._fonts[uuid] = result;
        return result;
    }
}