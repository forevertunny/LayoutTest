import { Vec2 } from "cc";
import { TextMeshLabel } from "../label/TextMeshLabel";
import { HitTestResult } from "./types";

export interface ITypeSet {
    layout(comp: TextMeshLabel): LayoutResult;
    hitTest(comp: TextMeshLabel, screenPos: Vec2, accurate?: boolean): HitTestResult;
    measure(comp: TextMeshLabel, fontSize: number): { width: number, height: number };
}

export type LayoutResult = {
    lines: number[][];
    maxWidth: number;
    maxHeight: number;
    linesHeight: number[];
    linesWidth: number[];
    linesDescent: number[];
    lastMaxDescent: number;
}
