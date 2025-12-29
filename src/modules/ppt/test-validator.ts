import { HtmlValidatorService } from './html-validator.service';

// 测试HTML验证优化
const validator = new HtmlValidatorService();

console.log('🧪 测试HTML验证优化\n');

// 测试1：包含SVG标签的HTML片段
console.log('1️⃣ 测试SVG标签验证...');
const svgHtml = `
<div class="w-[1280px] h-[720px] relative">
  <svg>
    <stop offset="0%" />
    <polygon points="100,10 40,198 190,78 10,78 160,198" />
    <line x1="0" y1="0" x2="200" y2="200" />
    <animate attributeName="opacity" values="0;1" dur="1s" />
  </svg>
  <div>内容</div>
</div>`;

const result1 = validator.validate(svgHtml, 'test-slide-1');
console.log(`   结果: ${result1.isValid ? '✅ 通过' : '❌ 失败'}`);
console.log(
  `   问题: ${result1.issues.length > 0 ? result1.issues.map((i) => i.message).join(', ') : '无'}\n`,
);

// 测试2：div标签不匹配
console.log('2️⃣ 测试div标签不匹配...');
const unbalancedHtml = `
<div class="w-[1280px] h-[720px] relative">
  <div>内容1
  <div>内容2</div>
  <!-- 缺少一个闭合div -->
</div>`;

const result2 = validator.validate(unbalancedHtml, 'test-slide-2');
console.log(`   结果: ${result2.isValid ? '✅ 通过' : '⚠️ 警告'}`);
console.log(
  `   问题: ${result2.issues.length > 0 ? result2.issues.map((i) => i.message).join(', ') : '无'}\n`,
);

// 测试3：完整HTML文档
console.log('3️⃣ 测试完整HTML文档...');
const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>测试</title>
</head>
<body>
  <div>内容</div>
  <!-- 缺少闭合body和html标签 -->
</body>`;

const result3 = validator.validate(fullHtml, 'test-slide-3');
console.log(`   结果: ${result3.isValid ? '✅ 通过' : '❌ 失败'}`);
console.log(
  `   问题: ${result3.issues.length > 0 ? result3.issues.map((i) => i.message).join(', ') : '无'}\n`,
);

console.log('🎯 优化总结:');
console.log('- SVG标签现在被正确识别为自闭合标签');
console.log('- HTML片段验证更宽松，只检查div标签平衡');
console.log('- 完整HTML文档仍进行严格验证');
console.log('- 可以通过 skipValidation 选项完全跳过验证以提升速度');
