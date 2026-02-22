import { _decorator, SpriteFrame } from 'cc';

export interface ITextMeshLabelSpriteAsset {

    isValidAsset: boolean;

    save(): void;

    getSprite(name: string): SpriteFrame | null;
}


