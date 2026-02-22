import { CanvasPool } from "../../utils/CanvasPool";
import { TextStyle } from "./TextStyle";


export type Measure = {
    ascent: number,
    descent: number,
    fontSize: number,
};

export class MeasureText
{
    static create(textStyle: TextStyle) : Measure
    {
        let pool = CanvasPool.getInstance();
        let canvasInst = pool.get();
        let canvas = canvasInst.canvas;
        let context = canvas.getContext('2d', {willReadFrequently: true});

        textStyle.syncFont(canvas, context);

        let metrics = context.measureText(textStyle.testString);

        if ('actualBoundingBoxAscent' in metrics)
        {
            let ascent = metrics.actualBoundingBoxAscent;
            let descent = metrics.actualBoundingBoxDescent;

            pool.put(canvasInst);

            return {
                ascent: ascent,
                descent: descent,
                fontSize: ascent + descent
            };
        }

        let width = Math.ceil(metrics.width * textStyle.baselineX);
        let baseline = width;
        let height = 2 * baseline;

        baseline = baseline * textStyle.baselineY | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);
        textStyle.syncStyle(canvas, context);

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText(textStyle.testString, 0, baseline);

        let output = {
            ascent: 0,
            descent: 0,
            fontSize: 0
        };

        let imagedata = context.getImageData(0, 0, width, height);
        if (!imagedata)
        {
            output.ascent = baseline;
            output.descent = baseline + 6;
            output.fontSize = output.ascent + output.descent;

            pool.put(canvasInst);

            return output;
        }

        let pixels = imagedata.data;
        let numPixels = pixels.length;
        let line = width * 4;
        let i;
        let j;
        let idx = 0;
        let stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (pixels[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }

            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        output.ascent = baseline - i;

        idx = numPixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (pixels[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }

            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        output.descent = (i - baseline);
        output.fontSize = output.ascent + output.descent;

        pool.put(canvasInst);

        return output;
    }
};