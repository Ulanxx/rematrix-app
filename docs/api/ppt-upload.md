# PPT 云存储上传 API 文档

## 概述

PPT 云存储上传 API 提供了 PPT 文件自动上传到 Bunny 云存储的功能，支持上传状态查询、重试机制和访问管理。

## 功能特性

- 🚀 **自动上传**: PPT 生成完成后自动上传到云存储
- 📊 **状态跟踪**: 实时查询上传状态和进度
- 🔄 **重试机制**: 智能重试失败的上传任务
- 🌐 **公共访问**: 生成可分享的公共 URL
- 📱 **响应式**: 支持移动端和桌面端访问

## 端点列表

### 1. 查询 PPT 上传状态

```http
GET /api/ppt/upload/status/{jobId}
```

**路径参数:**
- `jobId`: 任务 ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-12345",
    "status": "success",
    "uploadUrl": "https://cdn.example.com/jobs/job-12345/ppt.html",
    "storagePath": "jobs/job-12345/ppt-2024-12-24T10-30-00-123slides.html",
    "fileSize": 45678,
    "uploadedAt": "2024-12-24T10:30:00Z",
    "downloadCount": 5,
    "expiresAt": "2025-12-24T10:30:00Z"
  }
}
```

**状态值说明:**
- `pending`: 等待上传
- `uploading`: 正在上传
- `success`: 上传成功
- `failed`: 上传失败
- `expired`: 链接已过期

### 2. 重试 PPT 上传

```http
POST /api/ppt/upload/retry/{jobId}
```

**路径参数:**
- `jobId`: 任务 ID

**请求体:**
```json
{
  "maxRetries": 3,
  "retryDelay": 1000,
  "forceRetry": false
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "retryId": "retry-67890",
    "jobId": "job-12345",
    "status": "pending",
    "attempts": 1,
    "maxAttempts": 3,
    "estimatedCompletion": "2024-12-24T10:31:00Z"
  }
}
```

### 3. 获取 PPT 下载链接

```http
GET /api/ppt/download/{jobId}
```

**路径参数:**
- `jobId`: 任务 ID

**查询参数:**
- `format`: 下载格式 (`html` | `pdf`)
- `expire`: 链接过期时间（秒），默认 3600

**响应示例:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.example.com/jobs/job-12345/ppt.html?token=abc123&expire=1735038000",
    "fileName": "presentation-2024-12-24.html",
    "fileSize": 45678,
    "mimeType": "text/html",
    "expiresAt": "2024-12-24T11:30:00Z",
    "downloadCount": 0,
    "maxDownloads": 100
  }
}
```

### 4. 批量查询上传状态

```http
POST /api/ppt/upload/status/batch
```

**请求体:**
```json
{
  "jobIds": ["job-12345", "job-67890", "job-11111"],
  "includeDetails": true
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "results": [
      {
        "jobId": "job-12345",
        "status": "success",
        "uploadUrl": "https://cdn.example.com/jobs/job-12345/ppt.html",
        "uploadedAt": "2024-12-24T10:30:00Z"
      },
      {
        "jobId": "job-67890",
        "status": "failed",
        "error": "Network timeout",
        "retryCount": 2
      },
      {
        "jobId": "job-11111",
        "status": "pending",
        "estimatedCompletion": "2024-12-24T10:35:00Z"
      }
    ]
  }
}
```

### 5. 获取上传统计信息

```http
GET /api/ppt/upload/stats
```

**查询参数:**
- `period`: 统计周期 (`day` | `week` | `month` | `year`)
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalUploads": 156,
    "successfulUploads": 148,
    "failedUploads": 8,
    "successRate": 94.87,
    "totalSize": 21456789,
    "averageSize": 144976,
    "dailyStats": [
      {
        "date": "2024-12-18",
        "uploads": 22,
        "successes": 21,
        "failures": 1,
        "totalSize": 3456789
      },
      {
        "date": "2024-12-19",
        "uploads": 25,
        "successes": 24,
        "failures": 1,
        "totalSize": 3890123
      }
    ],
    "topErrors": [
      {
        "error": "Network timeout",
        "count": 3,
        "percentage": 37.5
      },
      {
        "error": "Storage quota exceeded",
        "count": 2,
        "percentage": 25.0
      }
    ]
  }
}
```

### 6. 删除 PPT 文件

```http
DELETE /api/ppt/upload/{jobId}
```

**路径参数:**
- `jobId`: 任务 ID

**查询参数:**
- `hardDelete`: 是否永久删除 (默认 false)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-12345",
    "deleted": true,
    "deletedAt": "2024-12-24T10:45:00Z",
    "filesDeleted": [
      "jobs/job-12345/ppt.html",
      "jobs/job-12345/ppt-preview.png"
    ]
  }
}
```

## 工作流集成

### PAGES 步骤集成

PPT 上传功能在 PAGES 步骤中自动触发：

```typescript
// PAGES 步骤执行函数中的上传逻辑
if (isPptMode && finalHtmlContent) {
  try {
    const pptService = new PptService();
    const pptGenerationResult = await pptService.generatePptHtmlWithUpload(
      pptSlidesData,
      config.pptOptions || {},
      {
        enabled: true,
        pathPrefix: `jobs/${context.jobId}/ppt`,
      },
    );
    
    pptUploadResult = pptGenerationResult.cloudStorage;
  } catch (uploadError) {
    console.warn('PPT 上传失败:', uploadError.message);
  }
}
```

### 输出数据结构

上传完成后，PAGES 步骤的输出包含以下字段：

```json
{
  "pptSlidesData": [...],
  "pptUrl": "https://cdn.example.com/jobs/job-12345/ppt.html",
  "pptStoragePath": "jobs/job-12345/ppt-2024-12-24T10-30-00-123slides.html",
  "pptFileSize": 45678,
  "pptUploadedAt": "2024-12-24T10:30:00Z",
  "pptUploadStatus": "success",
  "pdfUrl": "https://cdn.example.com/jobs/job-12345/pdf.pdf",
  "pdfGenerated": true,
  "metadata": {
    "totalSlides": 12,
    "generationMode": "ppt-enhanced",
    "pptTheme": "modern-tech"
  }
}
```

## 配置选项

### 环境变量

```bash
# Bunny 存储配置
BUNNY_STORAGE_ZONE=your-storage-zone
BUNNY_STORAGE_HOSTNAME=your-storage.bunnycdn.com
BUNNY_STORAGE_ACCESS_KEY=your-access-key
BUNNY_PUBLIC_BASE_URL=https://your-cdn.bunnycdn.com

# 上传配置
PPT_UPLOAD_ENABLED=true
PPT_UPLOAD_MAX_SIZE=50MB
PPT_UPLOAD_TIMEOUT=300000
PPT_UPLOAD_RETRY_ATTEMPTS=3
PPT_UPLOAD_RETRY_DELAY=1000

# 安全配置
PPT_UPLOAD_TOKEN_EXPIRE=3600
PPT_UPLOAD_MAX_DOWNLOADS=1000
PPT_UPLOAD_DOMAIN_WHITELIST=example.com,test.com
```

### 上传选项

```typescript
interface PptUploadOptions {
  enabled: boolean;
  pathPrefix?: string;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  publicAccess?: boolean;
  expireTime?: number;
}
```

## 错误处理

### 常见错误码

| 错误码 | HTTP状态 | 描述 | 解决方案 |
|--------|----------|------|----------|
| `UPLOAD_NOT_FOUND` | 404 | 上传任务不存在 | 检查任务 ID 是否正确 |
| `UPLOAD_EXPIRED` | 410 | 上传链接已过期 | 重新生成上传链接 |
| `STORAGE_QUOTA_EXCEEDED` | 507 | 存储配额超限 | 清理旧文件或升级配额 |
| `NETWORK_TIMEOUT` | 408 | 网络超时 | 检查网络连接或增加超时时间 |
| `INVALID_FILE_FORMAT` | 400 | 文件格式无效 | 确保上传的是有效的 HTML 文件 |
| `PERMISSION_DENIED` | 403 | 权限不足 | 检查存储访问密钥 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "STORAGE_QUOTA_EXCEEDED",
    "message": "存储配额已满",
    "details": {
      "currentUsage": "9.8GB",
      "quota": "10GB",
      "availableSpace": "200MB"
    },
    "retryable": true,
    "retryAfter": 3600
  }
}
```

## 安全考虑

### 访问控制
- 使用签名 URL 进行文件访问
- 支持域名白名单限制
- 可配置访问令牌过期时间

### 文件安全
- 自动扫描上传文件的安全性
- 限制文件大小和类型
- 支持文件加密存储

### 隐私保护
- 支持私有文件访问
- 可配置下载次数限制
- 提供文件删除功能

## 性能优化

### 上传优化
- 使用分块上传大文件
- 并发上传多个文件
- 智能压缩减少传输大小

### 缓存策略
- CDN 缓存静态文件
- 浏览器缓存优化
- 预加载常用资源

### 监控指标
- 上传成功率
- 平均上传时间
- 存储使用情况
- 错误分布统计

## 最佳实践

### 1. 文件命名
```javascript
// 推荐的文件命名格式
const fileName = `ppt-${timestamp}-${slideCount}slides.html`;
// 示例: ppt-2024-12-24T10-30-00-12slides.html
```

### 2. 路径组织
```javascript
// 推荐的路径结构
const pathPrefix = `jobs/${jobId}/ppt`;
// 完整路径: jobs/job-12345/ppt/ppt-2024-12-24.html
```

### 3. 错误处理
```javascript
try {
  const result = await pptService.generatePptHtmlWithUpload(slidesData, options);
  if (result.cloudStorage?.uploadStatus === 'failed') {
    // 记录错误并尝试重试
    console.error('PPT 上传失败:', result.cloudStorage.error);
    await retryUpload(jobId);
  }
} catch (error) {
  // 处理上传异常
  handleUploadError(error, jobId);
}
```

### 4. 状态监控
```javascript
// 定期检查上传状态
const checkUploadStatus = async (jobId) => {
  const status = await fetch(`/api/ppt/upload/status/${jobId}`);
  const result = await status.json();
  
  if (result.data.status === 'failed') {
    // 触发重试或通知用户
    notifyUploadFailure(jobId, result.data.error);
  }
  
  return result.data;
};
```

## 示例代码

### 前端集成示例

```javascript
class PptUploadManager {
  constructor() {
    this.uploadStatus = new Map();
  }

  // 查询上传状态
  async getUploadStatus(jobId) {
    try {
      const response = await fetch(`/api/ppt/upload/status/${jobId}`);
      const result = await response.json();
      
      if (result.success) {
        this.uploadStatus.set(jobId, result.data);
        return result.data;
      }
    } catch (error) {
      console.error('查询上传状态失败:', error);
      throw error;
    }
  }

  // 轮询上传状态
  async pollUploadStatus(jobId, callback, interval = 2000) {
    const poll = async () => {
      const status = await this.getUploadStatus(jobId);
      callback(status);
      
      if (status.status === 'pending' || status.status === 'uploading') {
        setTimeout(poll, interval);
      }
    };
    
    poll();
  }

  // 重试上传
  async retryUpload(jobId, options = {}) {
    try {
      const response = await fetch(`/api/ppt/upload/retry/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxRetries: options.maxRetries || 3,
          retryDelay: options.retryDelay || 1000,
          forceRetry: options.forceRetry || false
        })
      });
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('重试上传失败:', error);
      throw error;
    }
  }

  // 获取下载链接
  async getDownloadUrl(jobId, format = 'html', expire = 3600) {
    try {
      const response = await fetch(
        `/api/ppt/download/${jobId}?format=${format}&expire=${expire}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data.downloadUrl;
      }
    } catch (error) {
      console.error('获取下载链接失败:', error);
      throw error;
    }
  }
}

// 使用示例
const uploadManager = new PptUploadManager();

// 监听上传状态变化
uploadManager.pollUploadStatus('job-12345', (status) => {
  console.log('上传状态:', status);
  
  if (status.status === 'success') {
    console.log('上传成功:', status.uploadUrl);
    // 显示下载按钮
    showDownloadButton(status.uploadUrl);
  } else if (status.status === 'failed') {
    console.error('上传失败:', status.error);
    // 显示重试按钮
    showRetryButton();
  }
});
```

### React 组件示例

```jsx
import React, { useState, useEffect } from 'react';

function PptUploadStatus({ jobId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/ppt/upload/status/${jobId}`);
        const result = await response.json();
        setStatus(result.data);
        
        if (result.data.status === 'pending' || result.data.status === 'uploading') {
          setTimeout(fetchStatus, 2000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('获取上传状态失败:', error);
        setLoading(false);
      }
    };

    fetchStatus();
  }, [jobId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/ppt/download/${jobId}`);
      const result = await response.json();
      
      if (result.success) {
        window.open(result.data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('下载失败:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleRetry = async () => {
    try {
      const response = await fetch(`/api/ppt/upload/retry/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxRetries: 3 })
      });
      
      const result = await response.json();
      setStatus(result.data);
    } catch (error) {
      console.error('重试失败:', error);
    }
  };

  if (loading) {
    return <div>正在上传 PPT...</div>;
  }

  return (
    <div className="ppt-upload-status">
      <h3>PPT 上传状态</h3>
      
      {status && (
        <div className={`status ${status.status}`}>
          <div className="status-info">
            <span className="status-label">状态:</span>
            <span className="status-value">{status.status}</span>
          </div>
          
          {status.uploadUrl && (
            <div className="upload-url">
              <span className="url-label">访问链接:</span>
              <a href={status.uploadUrl} target="_blank" rel="noopener noreferrer">
                {status.uploadUrl}
              </a>
            </div>
          )}
          
          {status.fileSize && (
            <div className="file-info">
              <span className="size-label">文件大小:</span>
              <span className="size-value">
                {(status.fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
          
          {status.uploadedAt && (
            <div className="upload-time">
              <span className="time-label">上传时间:</span>
              <span className="time-value">
                {new Date(status.uploadedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="actions">
        {status?.status === 'success' && (
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="download-button"
          >
            {downloading ? '准备下载...' : '下载 PPT'}
          </button>
        )}
        
        {status?.status === 'failed' && (
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            重试上传
          </button>
        )}
      </div>
    </div>
  );
}

export default PptUploadStatus;
```

## 更新日志

### v2.1.0
- 新增 PPT 云存储上传功能
- 支持上传状态查询和重试
- 集成 Bunny 云存储服务
- 添加安全访问控制

### v2.0.0
- 基础文件上传功能
- 简单状态管理
