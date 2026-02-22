import { Node, _decorator, SpriteFrame } from "cc";

export class Clickable {
    name: string;
    value: string;
    start: number;
    end: number;
}

export enum ESlotType {
    Image,
    Prefab,
    Custom,
}

export const ImageTAG = "img";
export const PrefabTAG = "pb";
export const SlotTAG = "slot";


export const SlotTypeMap = {};
SlotTypeMap[ImageTAG] = ESlotType.Image;
SlotTypeMap[PrefabTAG] = ESlotType.Prefab;
SlotTypeMap[SlotTAG] = ESlotType.Custom;

export function isSlotType(type: string) {
    return type == ImageTAG || type == PrefabTAG || type == SlotTAG;
}

export enum ESlotSizeType {
    None,
    FontSize,
    HeightFirst,
    WidthFirst,
}

export class Slot {
    index: number;
    type: ESlotType = ESlotType.Image;
    tag: string = "";
    name: string = "";
    src: string = "";
    width: number = null;
    height: number = null;
    node: Node = null;
    dx: number = 0;
    dy: number = 0;
    fixed = false;
    sizeType: ESlotSizeType = 0;
}