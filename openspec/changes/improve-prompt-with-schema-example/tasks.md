## 1. 实现Schema示例生成功能
- [x] 1.1 创建schema示例生成工具函数
- [x] 1.2 为每个步骤的schema生成示例数据
- [x] 1.3 更新step-executor.service.ts中的prompt构建逻辑

## 2. 更新Prompt模板
- [x] 2.1 修改promptops.service.ts中的默认prompt模板
- [x] 2.2 将"符合schema"改为"参考以下示例格式"
- [x] 2.3 确保所有阶段都使用新的prompt策略

## 3. 测试和验证
- [x] 3.1 编写单元测试验证示例生成功能
- [x] 3.2 测试新prompt策略的AI生成准确率
- [x] 3.3 验证schema验证机制仍然正常工作

## 4. 文档和清理
- [x] 4.1 更新相关文档说明新的prompt策略
- [x] 4.2 清理旧的prompt模板代码
- [x] 4.3 验证所有步骤都能正常工作
