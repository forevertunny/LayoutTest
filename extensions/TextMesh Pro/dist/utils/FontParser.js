"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontParser = void 0;
class FontParser {
    static parse(data) {
        let result = {
            chars: {},
        };
        let lines = data.split("\n");
        for (let i = 0; i < lines.length; i++) {
            let arr = lines[i].split("=");
            if (arr.length == 2) {
                let field = arr[0];
                if (field != "char") {
                    if (field != "version" && field != "font" && field != "atlas" && field != "charset" && field != "fontFamily") {
                        result[field] = parseFloat(arr[1]);
                    }
                    else {
                        result[field] = arr[1].replace(/[\r\n]/gi, "");
                    }
                }
                else {
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
        return result;
    }
}
exports.FontParser = FontParser;
