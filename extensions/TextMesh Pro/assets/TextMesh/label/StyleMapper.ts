import { EScriptType } from "./types";
import {ESlotType} from "./LayoutTypes";

export var StyleMapper = {
    // 用于直接映射的属性
    "valueKeys": [
        "asTag",
        "alias",
    ],   
    "tagMap": {
        "br": "\n",
    },
    "sup": {
        field: "_$scriptType",
        value: EScriptType.SuperScript,
    },
    "sub": {
        field: "_$scriptType",
        value: EScriptType.SubScript,
    },
    "u": {
        field: "_$underline",
        value: true,
    },
    "s": {
        field: "_$strike",
        value: true,
    },
    "i": {
        field: "_$italic",
        value: true,
    },
    "b": {
        field: "_$bold",
        value: true,
    },
    "bg": {
        field: "_$background",
        value: true,
    }, 

    "enableColorLT": { field: "_$enableColorLT" },
    "enableColorLB": { field: "_$enableColorLB" },
    "enableColorRT": { field: "_$enableColorRT" },
    "enableColorRB": { field: "_$enableColorRB" },

    "colorLT": {
        field: "_$colorLT",
    },
    "colorLB": {
        field: "_$colorLB",
    },
    "colorRT": {
        field: "_$colorRT",
    },
    "colorRB": {
        field: "_$colorRB",
    },

    "color-lt": {
        field: "_$colorLT",
    },
    "color-lb": {
        field: "_$colorLB",
    },
    "color-rt": {
        field: "_$colorRT",
    },
    "color-rb": {
        field: "_$colorRB",
    },
    "color": {
        field: "_$color",
        value: 0xffffff,
        attributes: {
            "lt": {
                mapper: "color-lt",
            },
            "lb": {
                mapper: "color-lb",
            },
            "rt": {
                mapper: "color-rt",
            },
            "rb": {
                mapper: "color-rb",
            },
        }
    },

    "shadow-color": {
        field: "_$shadowColor",
    },  
    "shadowOffsetX": {
        field: "_$shadowOffsetX",
    },
    "shadowOffsetY": {
        field: "_$shadowOffsetY",
    },
    "shadow-blur": {
        field: "_$shadowBlur",
    },
    "shadow": {
        field: "_$shadow",
        value: 0.1,
        attributes: {
            color: {
                mapper: "shadow-color",
            },
            x: {
                mapper: "shadowOffsetX",
            },
            y: {
                mapper: "shadowOffsetY",
            },
            blur: {
                mapper: "shadow-blur",
                // field: "_$shadowBlur",
            }
        }
    },
    
    "stroke-color": {
        field: "_$strokeColor",
    },
    "stroke-blur": {
        field: "_$strokeBlur",
    },
    "stroke": {
        field: "_$stroke",
        attributes: {
            color: {
                mapper: "stroke-color",
            },
            blur: {
                mapper: "stroke-blur",
            }
        }
    },

    "outline-color": {
        field: "_$strokeColor",
    },
    "outline-blur": {
        field: "_$strokeBlur",
    },
    "outline": {
        field: "_$stroke",
        attributes: {
            color: {
                mapper: "stroke-color",
            },
            blur: {
                mapper: "stroke-blur",
            }
        }
    },

    "dilate": {
        field: "_$dilate",
    },
    "background-color": {
        field: "_$backgroundColor",
    },
    "background": {
        field: "_$background",
        value: true,
        attributes: {
            color: {
                mapper: "background-color",
            },
        },
    },
    "mask-color": {
        field: "_$maskColor",
    },
    "mask": {
        field: "_$mask",
        value: true,
        attributes: {
            color: {
                mapper: "mask-color",
            },
        },
    },

    "enableGlow": { field: "_$enableGlow" },
    "glow-color": { field: "_$glowColor" },
    "glowColor": { field: "_$glowColor" },
    "glowInner": { field: "_$glowInner" },
    "glowOuter": { field: "_$glowOuter" },
    "glowPower": { field: "_$glowPower" },
    "glowOffsetX": { field: "_$glowOffsetX" },
    "glowOffsetY": { field: "_$glowOffsetY" },
    "glow": {
        field: "_$enableGlow",
        value: true,
        attributes: {
            color: { mapper: "glow-color" },
            inner: { mapper: "glowInner" },
            outer: { mapper: "glowOuter" },
            power: { mapper: "glowPower" },
            x: { mapper: "glowOffsetX" },
            y: { mapper: "glowOffsetY" },
        }
    },

    "size": {
        field: "_$fontSize",
    }, 
    "font-size": {
        field: "_$fontSize",
    },   
    "font": {
        field: "_$font",
        value: true,
        attributes: {
            size: {
                mapper: "font-size",
            },
        },
    },

    "autoWarp": { field: "_$autoWarp" },
    "equalWidth": { field: "_$equalWidth" },
    "fixedLineHeight": { field: "_$fixedLineHeight" },
    "horizontalAlign": { field: "_$horizontalAlign" },
    "verticalAlign": { field: "_$verticalAlign" },
    "overflow": { field: "_$overflow" },
    "overFlow": { field: "_$overflow" }, // Alias for typo
    "fontAutoSize": { field: "_$fontAutoSize" },
    "fontMiniSize": { field: "_$fontMiniSize" },
    "font-mini-size": { field: "_$fontMiniSize" },
    "fontMaxSize": { field: "_$fontMaxSize" },
    "font-max-size": { field: "_$fontMaxSize" },

    "lineSpace": { field: "_$lineSpace" },
    "line-height": { field: "_$lineSpace" },
    "letterSpace": { field: "_$letterSpace" },
    "paddingLeft": { field: "_$paddingLeft" },
    "paddingRight": { field: "_$paddingRight" },
    "paddingTop": { field: "_$paddingTop" },
    "paddingBottom": { field: "_$paddingBottom" },

    "aspect": { field: "_$aspect" },
    "charVisibleRatio": { field: "_$charVisibleRatio" },

}
