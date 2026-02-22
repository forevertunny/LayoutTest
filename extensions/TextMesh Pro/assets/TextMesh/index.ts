export * from './font/TMFont';
export * from "./label/types";
export * from "./label/LayoutTypes";
export * from "./label/TextMeshLabel";
export * from "./label/events";
export * from "./utils/ResManger";
export * from "./utils/Utils";
export * from "./utils/UBBParser";
export * from "./label/CharInfo";
export * from "./settings";
export * from "./label/SuperLabel";
export * from "./font/FontManager";
export * from "./label/StyleManager";

import { TextMeshSettings } from './settings';
globalThis.TextMeshSettings = TextMeshSettings;

import { TextMeshLabel } from "./label/TextMeshLabel";
globalThis.TextMeshLabel = TextMeshLabel;

import { SuperLabel } from "./label/SuperLabel";
globalThis.SuperLabel = SuperLabel;

import { FontManager } from "./font/FontManager";
globalThis.FontManager = FontManager;