# Live2D扩展移动端修复说明

## 问题描述

Live2D扩展在电脑的宽屏模式下可能正常显示Live2D模型，但通过F12切换为手机模式时，Live2D模型就无法显示了。

## 问题原因分析

通过代码分析，发现了以下几个关键问题：

### 1. CSS样式冲突
- 移动端样式文件 `public/css/mobile-styles.css` 对页面布局进行了重大调整
- 设置了 `body { touch-action: none; overflow: hidden; position: fixed; }`
- 调整了各种容器的z-index层级
- 修改了视口尺寸和定位

### 2. Canvas层级问题
- Live2D canvas的z-index可能被其他移动端样式覆盖
- 移动端样式使用了不同的视口单位（dvh/dvw）可能导致兼容性问题

### 3. PIXI应用初始化问题
- PIXI应用在移动设备上可能存在WebGL上下文初始化失败的问题
- 移动端性能优化不足，可能导致渲染失败

### 4. 窗口大小变化处理
- 移动端方向变化时没有正确处理Canvas的重新调整
- 模型位置和大小在屏幕旋转后没有正确更新

## 修复方案

### 1. CSS样式修复

在 `data/default-user/extensions/Extension-Live2d/style.css` 中添加了移动端专用样式：

```css
/* 移动端专用样式 */
@media screen and (max-width: 1000px) {
    #live2d-canvas {
        /* 确保在移动端正确显示 */
        height: 100vh !important;
        height: 100dvh !important;
        width: 100vw !important;
        width: 100dvw !important;
        z-index: 10 !important; /* 提高z-index确保在最上层 */
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
        /* 确保canvas可见 */
        visibility: visible !important;
        opacity: 1 !important;
        /* 移动端触摸优化 */
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }
}
```

### 2. JavaScript修复

在 `data/default-user/extensions/Extension-Live2d/live2d.js` 中添加了移动端检测和优化：

```javascript
// 检测是否为移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 1000;

// 移动端PIXI配置优化
const pixiConfig = {
    resolution: isMobile ? 1 : 2 * window.devicePixelRatio, // 移动端降低分辨率以提高性能
    view: document.getElementById(CANVAS_ID),
    autoStart: true,
    backgroundAlpha: 0,
};

// 移动端使用不同的resize策略
if (isMobile) {
    pixiConfig.width = window.innerWidth;
    pixiConfig.height = window.innerHeight;
    // 移动端禁用resizeTo以避免性能问题
} else {
    pixiConfig.resizeTo = window;
}
```

### 3. 窗口大小变化处理

添加了移动端窗口大小变化和方向变化的处理：

```javascript
// 移动端窗口大小变化处理
if (isMobile) {
    const handleResize = () => {
        if (app && app.renderer) {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            // 重新调整所有模型的位置和大小
            for (const character in models) {
                const model = models[character];
                const model_path = model.st_model_path;
                if (model_path && extension_settings.live2d.characterModelsSettings[character][model_path]) {
                    const scaleY = ((window.innerHeight) / model.height) * extension_settings.live2d.characterModelsSettings[character][model_path]['scale'];
                    model.scale.set(scaleY);
                    moveModel(character, extension_settings.live2d.characterModelsSettings[character][model_path]['x'], extension_settings.live2d.characterModelsSettings[character][model_path]['y']);
                }
            }
        }
    };
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
        // 方向变化时延迟处理，确保新尺寸已经应用
        setTimeout(handleResize, 100);
    });
}
```

### 4. iOS Safari专用修复

针对iOS Safari的特殊问题，添加了专用修复：

```css
/* iOS Safari 专用修复 */
@supports (-webkit-touch-callout: none) {
    #live2d-canvas {
        /* iOS Safari 特殊处理 */
        height: 100vh !important;
        width: 100vw !important;
        /* 防止iOS Safari的视口问题 */
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        /* 确保在iOS上正确渲染 */
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }
}
```

## 测试方法

1. **使用测试页面**：创建了 `mobile-live2d-test.html` 测试页面来验证Canvas在移动端的显示效果

2. **浏览器开发者工具**：
   - 打开F12开发者工具
   - 切换到移动设备模式
   - 选择不同的移动设备尺寸
   - 测试横屏和竖屏模式

3. **实际设备测试**：
   - 在真实移动设备上访问SillyTavern
   - 测试不同屏幕尺寸的设备
   - 测试屏幕旋转功能

## 修复效果

修复后的Live2D扩展应该能够：

1. ✅ 在移动端正确显示Live2D模型
2. ✅ 正确处理屏幕旋转和窗口大小变化
3. ✅ 在iOS Safari上正常工作
4. ✅ 保持与桌面端的兼容性
5. ✅ 优化移动端性能

## 注意事项

1. **性能考虑**：移动端降低了PIXI应用的分辨率以提高性能
2. **兼容性**：修复保持了与现有桌面端功能的完全兼容
3. **测试**：建议在不同设备和浏览器上进行充分测试
4. **更新**：如果Live2D扩展更新，可能需要重新应用这些修复

## 故障排除

如果修复后仍有问题，请检查：

1. **浏览器控制台**：查看是否有JavaScript错误
2. **网络请求**：确认Live2D模型文件能够正常加载
3. **设备兼容性**：确认设备支持WebGL
4. **扩展设置**：确认Live2D扩展已启用并正确配置

## 相关文件

- `data/default-user/extensions/Extension-Live2d/style.css` - CSS样式修复
- `data/default-user/extensions/Extension-Live2d/live2d.js` - JavaScript逻辑修复
- `mobile-live2d-test.html` - 测试页面
- `public/css/mobile-styles.css` - 移动端样式文件（参考） 