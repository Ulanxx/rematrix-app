# 主题设计 API 文档

## 概述

主题设计 API 提供了 PPT 设计主题选择、配置、预览和质量评估功能。在 PPT 生成流程中，用户可以在 THEME_DESIGN 阶段选择和确认设计风格。

## 端点列表

### 1. 获取所有设计主题

```http
GET /api/theme-design/themes
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "modern-tech",
      "name": "现代科技",
      "description": "现代科技风格，适合技术演示",
      "category": "modern",
      "colorScheme": "blue-gradient",
      "typography": "modern-sans",
      "layoutStyle": "glassmorphism",
      "visualEffects": ["glass-effect", "gradient-bg", "glow-effect"],
      "previewUrl": "/previews/modern-tech.png",
      "responsive": true,
      "complexity": "medium"
    },
    {
      "id": "classic-professional",
      "name": "经典商务",
      "description": "传统商务风格，适合正式场合",
      "category": "classic",
      "colorScheme": "professional-blue",
      "typography": "classic-serif",
      "layoutStyle": "traditional",
      "visualEffects": ["subtle-shadow", "professional-border"],
      "previewUrl": "/previews/classic-professional.png",
      "responsive": true,
      "complexity": "simple"
    }
  ]
}
```

### 2. 获取特定主题详情

```http
GET /api/theme-design/themes/{themeId}
```

**路径参数:**
- `themeId`: 主题 ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "modern-tech",
    "name": "现代科技",
    "description": "现代科技风格，适合技术演示",
    "styles": {
      "background": "rgba(255, 255, 255, 0.03)",
      "backdropFilter": "blur(10px)",
      "border": "1px solid rgba(255, 255, 255, 0.1)",
      "borderRadius": "16px",
      "boxShadow": "0 8px 32px rgba(0, 0, 0, 0.1)",
      "colors": {
        "primary": "#4A48E2",
        "secondary": "#6366F1",
        "accent": "#8B5CF6",
        "background": "rgba(255, 255, 255, 0.03)",
        "text": "#FFFFFF"
      }
    },
    "effects": ["glass-effect", "subtle-glow", "backdrop-blur"],
    "animations": ["fade-in", "slide-up"],
    "responsive": true,
    "complexity": "medium"
  }
}
```

### 3. 生成设计预览

```http
POST /api/theme-design/preview
```

**请求体:**
```json
{
  "themeConfig": {
    "designTheme": "modern-tech",
    "colorScheme": "blue-gradient",
    "typography": "modern-sans",
    "layoutStyle": "glassmorphism",
    "visualEffects": ["glass-effect", "gradient-bg"],
    "customizations": {
      "primaryColor": "#4A48E2",
      "secondaryColor": "#6366F1"
    }
  },
  "templateId": "glassmorphism-card",
  "content": {
    "title": "演示标题",
    "subtitle": "副标题",
    "content": ["内容要点1", "内容要点2", "内容要点3"]
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "preview-12345",
    "themeConfig": {...},
    "template": {...},
    "htmlContent": "<!DOCTYPE html>...",
    "cssStyles": ".glass-card { ... }",
    "generatedAt": "2024-12-24T10:30:00Z",
    "previewUrl": "/previews/preview-12345.png"
  }
}
```

### 4. 评估设计质量

```http
POST /api/theme-design/evaluate
```

**请求体:**
```json
{
  "themeConfig": {
    "designTheme": "modern-tech",
    "colorScheme": "blue-gradient",
    "typography": "modern-sans",
    "layoutStyle": "glassmorphism",
    "visualEffects": ["glass-effect", "gradient-bg", "glow-effect"],
    "customizations": {}
  },
  "templateId": "glassmorphism-card"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "overall": 85,
    "visualAppeal": 90,
    "readability": 80,
    "accessibility": 85,
    "performance": 75,
    "responsiveness": 90,
    "issues": [
      {
        "type": "suggestion",
        "category": "performance",
        "message": "动画效果可能影响性能",
        "suggestion": "考虑简化动画效果以提高性能",
        "severity": "low"
      }
    ],
    "suggestions": [
      "设计整体质量良好，视觉效果出色",
      "考虑优化动画效果以提高性能"
    ]
  }
}
```

### 5. 获取设计改进建议

```http
POST /api/theme-design/suggestions
```

**请求体:**
```json
{
  "qualityScore": {
    "overall": 60,
    "visualAppeal": 50,
    "readability": 80,
    "accessibility": 70,
    "performance": 90,
    "responsiveness": 60,
    "issues": []
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "考虑添加更多视觉元素，如图标、渐变或阴影效果",
      "确保所有交互元素都有足够的对比度和焦点状态",
      "添加媒体查询以支持不同屏幕尺寸",
      "使用相对单位（rem, em, %）提高可访问性"
    ],
    "priority": [
      {
        "action": "增强视觉效果",
        "priority": "high",
        "impact": "提升整体视觉吸引力"
      },
      {
        "action": "优化响应式设计",
        "priority": "medium",
        "impact": "改善移动端体验"
      }
    ]
  }
}
```

### 6. 推荐设计主题

```http
POST /api/theme-design/recommend
```

**请求体:**
```json
{
  "preferences": {
    "style": "modern",
    "industry": "technology",
    "audience": "professional",
    "purpose": "presentation"
  },
  "content": {
    "type": "technical",
    "complexity": "medium",
    "visualElements": ["charts", "diagrams"]
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "recommended": {
      "id": "modern-tech",
      "name": "现代科技",
      "confidence": 0.95,
      "reason": "基于技术内容和现代风格偏好推荐"
    },
    "alternatives": [
      {
        "id": "gradient-modern",
        "name": "现代渐变",
        "confidence": 0.85,
        "reason": "适合现代风格的备选方案"
      }
    ],
    "customization": {
      "recommendedEffects": ["glass-effect", "gradient-bg"],
      "suggestedColors": ["#4A48E2", "#6366F1"],
      "layoutTips": "使用卡片式布局增强层次感"
    }
  }
}
```

## 工作流集成

### THEME_DESIGN 步骤

主题设计 API 与工作流系统深度集成，在 THEME_DESIGN 步骤中使用：

1. **输入**: PLAN 阶段的输出内容
2. **处理**: 分析内容并推荐合适的设计主题
3. **输出**: 用户确认的主题设计配置
4. **依赖**: 需要用户审批确认

### 步骤配置

```json
{
  "stage": "THEME_DESIGN",
  "input": {
    "sources": ["PLAN"],
    "schema": "ThemeDesignInputSchema"
  },
  "output": {
    "type": "JSON",
    "schema": "ThemeDesignOutputSchema"
  },
  "execution": {
    "requiresApproval": true,
    "timeoutMs": 180000
  }
}
```

## 错误处理

### 常见错误码

- `400`: 请求参数无效
- `404`: 主题或模板不存在
- `422`: 主题配置验证失败
- `500`: 服务器内部错误

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "INVALID_THEME_CONFIG",
    "message": "主题配置无效",
    "details": {
      "field": "designTheme",
      "reason": "主题 ID 不存在"
    }
  }
}
```

## 性能考虑

### 缓存策略
- 主题模板缓存 24 小时
- 预览图片缓存 1 小时
- 设计评估结果缓存 30 分钟

### 限流
- 预览生成: 10 次/分钟
- 质量评估: 5 次/分钟
- 主题推荐: 20 次/分钟

## 最佳实践

### 1. 主题选择
- 根据内容类型选择合适主题
- 考虑目标受众和场合
- 保持设计一致性

### 2. 自定义配置
- 适度自定义，避免过度修改
- 保持色彩对比度符合可访问性标准
- 测试不同设备的显示效果

### 3. 性能优化
- 避免过多的动画效果
- 使用 CSS 变量提高维护性
- 合理使用图片和图标

## 示例代码

### JavaScript 客户端示例

```javascript
// 获取所有主题
async function getThemes() {
  const response = await fetch('/api/theme-design/themes');
  const result = await response.json();
  return result.data;
}

// 生成预览
async function generatePreview(themeConfig, templateId) {
  const response = await fetch('/api/theme-design/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      themeConfig,
      templateId,
      content: {
        title: '演示标题',
        content: ['内容1', '内容2']
      }
    })
  });
  return await response.json();
}

// 评估设计质量
async function evaluateDesign(themeConfig, templateId) {
  const response = await fetch('/api/theme-design/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ themeConfig, templateId })
  });
  return await response.json();
}
```

### React 组件示例

```jsx
import React, { useState, useEffect } from 'react';

function ThemeSelector({ onThemeSelect }) {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const response = await fetch('/api/theme-design/themes');
    const result = await response.json();
    setThemes(result.data);
  };

  const generatePreview = async (themeId) => {
    const themeConfig = {
      designTheme: themeId,
      colorScheme: themes.find(t => t.id === themeId)?.colorScheme,
      typography: 'modern-sans',
      layoutStyle: 'glassmorphism',
      visualEffects: ['glass-effect'],
      customizations: {}
    };

    const response = await fetch('/api/theme-design/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeConfig, templateId: 'glassmorphism-card' })
    });

    const result = await response.json();
    setPreview(result.data);
  };

  return (
    <div>
      <h2>选择设计主题</h2>
      <div className="theme-grid">
        {themes.map(theme => (
          <div 
            key={theme.id}
            className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedTheme(theme.id);
              generatePreview(theme.id);
            }}
          >
            <img src={theme.previewUrl} alt={theme.name} />
            <h3>{theme.name}</h3>
            <p>{theme.description}</p>
          </div>
        ))}
      </div>
      {preview && (
        <div className="preview-section">
          <h3>预览效果</h3>
          <div dangerouslySetInnerHTML={{ __html: preview.htmlContent }} />
          <button onClick={() => onThemeSelect(selectedTheme)}>
            确认选择
          </button>
        </div>
      )}
    </div>
  );
}
```

## 更新日志

### v2.1.0
- 新增主题设计 API
- 支持设计预览和质量评估
- 集成工作流系统

### v2.0.0
- 基础主题管理功能
- 设计模板系统
