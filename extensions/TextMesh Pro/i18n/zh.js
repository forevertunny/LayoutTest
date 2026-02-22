"use strict"; 
module.exports = { 
    description: "超级富文本插件",
    
    name: "Text Mesh",
    install: "安装",
    install_sample: "安装示例",
    root: "根节点",

    menu: {
        name: "TextMesh",
        create_font: "创建字体资源",
    },

    font_info: {
        name: "创建字体资源",
        source_font: "源字体",  
        custom_font: "文件字体",
        system_font: "系统字体",  
        gen_font_size: "字体采样大小",    
        auto_font_size: "自动设置",
        custom_font_size: "手动设置",  
        pad_mode_px: "像素值",
        pad_mode_ratio: "百分比",        
        padding: "字符扩展",      
        padding_trim: "扩展裁剪",
        enable_dynamic: "动态字体",
        static_channel_size: "静态通道数",
        atlas_size: "图集大小",
        charset: "字符集文本",
        charsetFile: "字符集文件(字符集优先)",
        tmf_font_file: "TMF字体文件",  
        begin_gen: "开始生成字体图集",        
        end_gen: "取消生成字体图集",
        base_info: "基本信息",
        settings: "设置",
        atlas_info: "图集信息",
        search_char: "查询字符",
    },

    settings: {
        name: "设置",
        save: "保存",
        modify: "修改",
        reCalc: "重新生成",
        enableAutoFree: "自动释放",
        offsetY: "Y轴偏移",
        normalWeight: "普通字体粗细",
        boldWeightScale: "加粗字体粗细",
        strokeScale: "描边大小缩放值",
        strokeBlur: "描边模糊度",
        shadowSize: "阴影大小",
        shadowBlur: "阴影模糊度",
        underLineOffset: "下划线偏移",
        keepUnlderLineSpace: "下划线间距",
        underLineThickness: "下划线粗细",
        strikeOffset: "删除线偏移",
        strikeThickness: "删除线粗细",
        scriptThickness: "上下标大小",
    },

    messages: {
        save: "保存文件",
        need_font: "需要设置TTFont资源文件",
        need_charset: "需要设置字符集文件",
        can_not_found_asset: "不能找到资源文件的UUID",
        font_file_error: "错误的TMF文件",
        error_range_hex: "错误的字符范围:",
        system_font_static_chars: "系统字体无需生成静态文字",
    },

    label: {
        slotsContainer: "插槽容器, 如果为空则使用当前节点，设置后可以减少因插槽导致的批次",
    }
};