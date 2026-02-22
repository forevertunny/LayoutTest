import { TextStyleConfig } from "db://text-mesh/label/setting/TextStyleConfig";
import { TextEffectConfig } from "db://text-mesh/label/setting/TextEffectConfig";
import { TextNormalConfig } from "db://text-mesh/label/setting/TextNormalConfig";

export interface ITextMeshAllSettings {

    isValidAsset: boolean;
    normal: TextNormalConfig;
    style: TextStyleConfig;
    effect: TextEffectConfig;

    save(): void;
}
