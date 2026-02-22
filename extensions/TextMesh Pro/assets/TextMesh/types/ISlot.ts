import { TextMeshLabel } from "../label/TextMeshLabel";

export interface ISlot {
    name: string;
    src: string;
    width: number;
    height: number;
    layout(comp: TextMeshLabel, index: number);
}