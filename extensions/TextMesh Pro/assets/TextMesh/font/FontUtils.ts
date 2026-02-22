import { math } from "cc";
import { ALLBIAODIAN } from "../libs/hanzi/code";
import { isCJK } from "../libs/hanzi/isCJK";
import { Measure } from "../libs/phaser/MeasureText";
import { TextStyle } from "../libs/phaser/TextStyle";

export function getStringArray(text: string) {
    // Using Array.from correctly splits characters whilst keeping emoji together.
    // This is not supported on IE as it requires ES6, so regular text splitting occurs.
    // This also doesn't account for emoji that are multiple emoji put together to make something else.
    // Handling all of this would require a big library itself.
    // https://medium.com/@giltayar/iterating-over-emoji-characters-the-es6-way-f06e4589516
    // https://github.com/orling/grapheme-splitter
    return Array.from ? Array.from(text) : text.split('');
}

const isEmojiChar = function(charCode:number, nextCharCode:number):number {
    const hs = charCode;
    const nextCharValid = typeof nextCharCode === 'number' && !isNaN(nextCharCode) && nextCharCode > 0;

    // surrogate pair
    if (hs >= 0xd800 && hs <= 0xdbff)    {
        if (nextCharValid)        {
            const uc = ((hs - 0xd800) * 0x400) + (nextCharCode - 0xdc00) + 0x10000;

            if (uc >= 0x1d000 && uc <= 0x1f77f) {
                return 2;
            }
        }
    }
    // non surrogate
    else if ((hs >= 0x2100 && hs <= 0x27ff)
        || (hs >= 0x2B05 && hs <= 0x2b07)
        || (hs >= 0x2934 && hs <= 0x2935)
        || (hs >= 0x3297 && hs <= 0x3299)
        || hs === 0xa9 || hs === 0xae || hs === 0x303d || hs === 0x3030
        || hs === 0x2b55 || hs === 0x2b1c || hs === 0x2b1b
        || hs === 0x2b50 || hs === 0x231a)    {
        return 1;
    }
    else if (nextCharValid && (nextCharCode === 0x20e3 || nextCharCode === 0xfe0f || nextCharCode === 0xd83c))  {
        return 2;
    }
    return 0;
}

const trimEmoji = function(text: string): {text: string, count: number} {
    let result = [];
    let count = 0;
    for(let i=0;i<text.length;i++) {
        let cur = text[i];
        let next = i < text.length - 1 ? text[i+1] : '';
        let emoji = isEmojiChar(cur.charCodeAt(0), next.charCodeAt(0));
        if(emoji == 0) {
            result.push(cur);
        }else{
            i+=(emoji-1);
            count++;
        }
    }

    return {
        text: result.join(''),
        count,
    };
}

type Text = {
    text: string,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    style: TextStyle,
    width: number,
    height: number,
    lineSpacing: number,
}

function GetTextSizeHorizontal(text: Text, size: Measure, lines: string[]) 
{
    let canvas = text.canvas;
    let context = text.context;
    let style = text.style;

    let lineWidths: number[] = [];
    let lineHeights: number[] = [];
    let maxLineWidth: number = 0;
    let drawnLines = lines.length;

    if (style.maxLines > 0 && style.maxLines < lines.length)
    {
        drawnLines = style.maxLines;
    }

    style.syncFont(canvas, context);

    //  Text Width

    let height = 0;
    for (var i = 0; i < drawnLines; i++)
    {
        var lineWidth = style.strokeThickness;
        let line = lines[i];
        let letterSpacing = (style as any).letterSpacing || 0;        

        let maxLineHeight = 0;
        if(letterSpacing) {
            if(line) {
                for(let char of line) {
                    let measure = context.measureText(char);
                    let enableCalcHeight = measure.actualBoundingBoxAscent && measure.actualBoundingBoxDescent;
                    lineWidth += measure.width + (char != ' ' ? letterSpacing : 0);
                    maxLineHeight = Math.max(enableCalcHeight ? measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent : 0, maxLineHeight, size.fontSize);
                }
            }
        }else{       
            let measure = context.measureText(lines[i]);     
            let enableCalcHeight = measure.actualBoundingBoxAscent && measure.actualBoundingBoxDescent;
            lineWidth += measure.width;
            maxLineHeight =  Math.max(enableCalcHeight ? measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent : 0, size.fontSize);
        }

        if(style.strokeThickness) {
            maxLineHeight += + style.strokeThickness;
        }

        // Adjust for wrapped text
        if ((style as any).wordWrap)
        {
            lineWidth -= context.measureText(' ').width;
        }

        lineWidths[i] = Math.ceil(lineWidth);
        lineHeights[i] = maxLineHeight;
        
        if(style.shadowOffsetX) {
            maxLineWidth += style.shadowOffsetX;
        }  

        maxLineWidth = Math.max(maxLineWidth, lineWidths[i]);
        height += maxLineHeight;
    }

    if((style as any).minWidth) {
        maxLineWidth = Math.max(maxLineWidth, (style as any).minWidth);
    }

    //  Text Height

    // var lineHeight = size.fontSize + style.strokeThickness;
    var lineSpacing = text.lineSpacing;

    //  Adjust for line spacing
    if (drawnLines > 1)
    {
        height += lineSpacing * (drawnLines - 1);
    }      

    if(style.shadowOffsetY) {
        height += style.shadowOffsetY;
    }

    if(style.fontStyle == 'italic' || style.fontStyle == "oblique") {
        maxLineWidth += size.fontSize * Math.sin(math.toRadian(15)) * 0.5;
    }

    return {
        width: maxLineWidth,
        height: height,
        lines: drawnLines,
        lineWidths: lineWidths,
        lineSpacing: lineSpacing,
        lineHeights: lineHeights,
    };
}

type CharInfo  = {
    width: number,
    height: number,
    char: string,
    rotate: boolean,
};

type VerticalLine = {
    text: string,
    charInfo: CharInfo[],
    height: number,
    width: number,
};

type VerticalLineInfo = {
    text: string,
    style: TextStyle,
    width: number,
    height: number,
    lines: string[],
    lineInfo: VerticalLine[],
    lineWidth: number,
    fontProperties: TextMetrics,
};

var GetTextSizeVertical = function (text: Text, size: Measure, lines: string[])
{
    let canvas = text.canvas;
    let context = text.context;

    let style: any = text.style;
    let warpHeight: number = style.wordWrapWidth != undefined ? style.wordWrapWidth : 0;

    let maxLineHeight = 0;
    let drawnLines = 0;
    let lineSpacing = text.lineSpacing || 0;

    style.syncFont(canvas, context);

    // 计算每个字符的尺寸信息
    let charInfo: Array<Array<CharInfo>> = [];
    let allP = style.punctuation || ALLBIAODIAN;    
 
    // 计算每一列
    let lineInfo: VerticalLine[] = [];
    let width = 0;
    for(let line of lines) {
        let lineChars: Array<CharInfo> = [];
        var stringArray = getStringArray(line);
        let curLineHeight = style.strokeThickness;
        let indexInLine = 0;   
        let spliteLine = '';

        let maxLineWidth = 0;
        for (let i=0;i<stringArray.length;i++) {
            if(style.maxLines) {
                if(charInfo.length < style.maxLines) {
                    break;
                }
            }

            let char = stringArray[i];
            let isP = allP.indexOf(char) >= 0;
            let needRotate = false;
            if(!(style as any).rotateP && isP) {
                needRotate = false;
            }else{
                needRotate = (style as any).rotateP && isP || (style as any).rotateWC && !isP && !isCJK(char); // cjk not rotate
            }
            let cInfo = {
                width: 0,
                height: 0,
                char: char,
                rotate: needRotate,
            };

            let matrics = context.measureText(char);    

            if(cInfo.width <= 0 || cInfo.height <= 0) {
                console.error("measure text error:" + char);
            }
            
            if (cInfo.rotate) {
                [cInfo.width, cInfo.height] = [size.fontSize, matrics.width];
            } else {
                [cInfo.width, cInfo.height] = [matrics.width, size.fontSize];
            }
            maxLineWidth = Math.max(cInfo.width, maxLineWidth);

            let curHeight = curLineHeight + cInfo.height;
            if(indexInLine > 0) {
                curHeight += style.letterSpacing;
            }            
            
            spliteLine += cInfo.char;
            curLineHeight += cInfo.height; // + matrics.actualBoundingBoxDescent            
            lineChars.push(cInfo);
            if(indexInLine > 0) {
                curHeight += style.letterSpacing;
            }
            indexInLine++;
            
            if(warpHeight && curHeight > warpHeight || i == stringArray.length - 1) {
                (lineChars as any).text = spliteLine;            
                charInfo.push(lineChars);
                lineInfo.push({
                    text: spliteLine,
                    charInfo: lineChars,
                    height: curLineHeight,
                    width: maxLineWidth,
                });

                maxLineHeight = Math.max(maxLineHeight, curLineHeight);
                // reset
                curLineHeight = 0;
                lineChars = [];
                charInfo = [];
                indexInLine = 0;
                spliteLine = "";
            }
        }   

        width += maxLineWidth + style.strokeThickness + lineSpacing;
    }
    drawnLines = lineInfo.length;

    if(style.shadowOffsetY) {
        maxLineHeight += style.shadowOffsetY;
    }

    //miniHeight
    if((style as any).miniHeight) {
        maxLineHeight = Math.max(maxLineHeight, (style as any).miniHeight);
    }
    var height = maxLineHeight;

    var lineWidth: number = size.fontSize + style.strokeThickness + lineSpacing;
    // var width = size.fontSize + ((drawnLines - 1) * lineWidth);
    if (style.shadowOffsetX)
    {
        width += style.shadowOffsetX;
    }
    
    if(style.fontStyle == 'italic' || style.fontStyle == "oblique") {
        width += size.fontSize * Math.sin(math.toRadian(15)) * 0.5;
    }

    return {
        text,
        style,
        width,
        height,
        lineSpacing,
        lines: drawnLines,
        lineInfo,
    };
}