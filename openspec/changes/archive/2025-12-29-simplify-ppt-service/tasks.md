## 1. 分析现有PPT服务结构
- [x] 1.1 查看当前PPT服务的所有公共方法
- [x] 1.2 识别需要保留的核心方法（generatePptWithAi）
- [x] 1.3 列出需要移除的辅助方法和模板系统

## 2. 简化PPT服务实现
- [x] 2.1 移除设计模板系统（ModernDesignTemplate相关代码）
- [x] 2.2 移除复杂的布局生成逻辑（generatePptHtml等）
- [x] 2.3 移除上传相关功能（uploadToCloud、retryUploadPpt等）
- [x] 2.4 移除动画效果和样式生成辅助方法
- [x] 2.5 保留并优化generatePptWithAi方法

## 3. 简化类型定义
- [x] 3.1 移除不必要的类型定义（PptSlideData、PageLayoutType等）
- [x] 3.2 保留核心接口（StoryboardSlide、GenerationContext等）
- [x] 3.3 更新导出类型，只保留必要的接口

## 4. 更新依赖注入
- [x] 4.1 移除PptCacheService依赖（如果不需要）
- [x] 4.2 保留AiHtmlGeneratorService依赖
- [x] 4.3 简化构造函数

## 5. 验证和测试
- [x] 5.1 确保generatePptWithAi方法正常工作
- [x] 5.2 测试简化的服务结构
- [x] 5.3 验证类型导出正确性

## 6. 清理和文档
- [x] 6.1 移除未使用的导入
- [x] 6.2 更新服务注释和文档
- [x] 6.3 确保代码符合ESLint规范
