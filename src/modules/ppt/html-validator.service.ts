import { Injectable, Logger } from '@nestjs/common';

export type ValidationIssueType = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  type: ValidationIssueType;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

@Injectable()
export class HtmlValidatorService {
  private readonly logger = new Logger(HtmlValidatorService.name);

  validate(html: string, slideId?: string): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 检测是否为页面片段(只包含 div)
    const isFragment =
      html.trim().startsWith('<div') && !html.includes('<!DOCTYPE');

    if (isFragment) {
      // 片段验证:只检查基本语法
      this.validateBasicSyntax(html, issues);
    } else {
      // 完整文档验证
      this.validateDocumentStructure(html, issues);
      this.validateRequiredResources(html, issues);
      this.validateBasicSyntax(html, issues);
    }

    const hasErrors = issues.some((i) => i.type === 'error');
    const hasWarnings = issues.some((i) => i.type === 'warning');

    if (slideId) {
      if (hasErrors) {
        this.logger.warn(
          `幻灯片 ${slideId} 验证失败: ${issues.filter((i) => i.type === 'error').length} 个错误`,
        );
      } else if (hasWarnings) {
        this.logger.debug(
          `幻灯片 ${slideId} 验证通过但有警告: ${issues.filter((i) => i.type === 'warning').length} 个警告`,
        );
      } else {
        this.logger.debug(`幻灯片 ${slideId} 验证通过`);
      }
    }

    return {
      isValid: !hasErrors,
      issues,
      hasErrors,
      hasWarnings,
    };
  }

  private validateDocumentStructure(
    html: string,
    issues: ValidationIssue[],
  ): void {
    if (
      !html.includes('<!DOCTYPE html>') &&
      !html.includes('<!doctype html>')
    ) {
      issues.push({
        type: 'error',
        message: '缺少 DOCTYPE 声明',
        code: 'MISSING_DOCTYPE',
      });
    }

    if (!html.includes('<html')) {
      issues.push({
        type: 'error',
        message: '缺少 <html> 标签',
        code: 'MISSING_HTML_TAG',
      });
    }

    if (!html.includes('<head>') && !html.includes('<head ')) {
      issues.push({
        type: 'error',
        message: '缺少 <head> 标签',
        code: 'MISSING_HEAD_TAG',
      });
    }

    if (!html.includes('<body>') && !html.includes('<body ')) {
      issues.push({
        type: 'error',
        message: '缺少 <body> 标签',
        code: 'MISSING_BODY_TAG',
      });
    }

    if (!html.includes('</html>')) {
      issues.push({
        type: 'error',
        message: '缺少 </html> 闭合标签',
        code: 'MISSING_HTML_CLOSING_TAG',
      });
    }

    if (!html.includes('<meta charset=')) {
      issues.push({
        type: 'warning',
        message: '缺少字符集声明 <meta charset>',
        code: 'MISSING_CHARSET',
      });
    }

    if (!html.includes('<title>')) {
      issues.push({
        type: 'warning',
        message: '缺少 <title> 标签',
        code: 'MISSING_TITLE',
      });
    }
  }

  private validateRequiredResources(
    html: string,
    issues: ValidationIssue[],
  ): void {
    const hasTailwind =
      html.includes('tailwindcss.com') ||
      html.includes('cdn.tailwindcss.com') ||
      html.includes('unpkg.com/tailwindcss');

    if (!hasTailwind) {
      issues.push({
        type: 'error',
        message: '缺少 Tailwind CSS CDN 引用',
        code: 'MISSING_TAILWIND_CDN',
      });
    }

    const hasFontAwesome =
      html.includes('font-awesome') || html.includes('fontawesome');

    if (!hasFontAwesome) {
      issues.push({
        type: 'warning',
        message: '缺少 Font Awesome CDN 引用',
        code: 'MISSING_FONTAWESOME_CDN',
      });
    }
  }

  private validateBasicSyntax(html: string, issues: ValidationIssue[]): void {
    const unclosedTags = this.findUnclosedTags(html);
    if (unclosedTags.length > 0) {
      issues.push({
        type: 'error',
        message: `发现未闭合的标签: ${unclosedTags.join(', ')}`,
        code: 'UNCLOSED_TAGS',
      });
    }

    const invalidAttributes = this.findInvalidAttributes(html);
    if (invalidAttributes.length > 0) {
      issues.push({
        type: 'warning',
        message: `发现可能无效的属性: ${invalidAttributes.join(', ')}`,
        code: 'INVALID_ATTRIBUTES',
      });
    }
  }

  private findUnclosedTags(html: string): string[] {
    const unclosed: string[] = [];
    const selfClosingTags = [
      'meta',
      'link',
      'img',
      'br',
      'hr',
      'input',
      'area',
      'base',
      'col',
      'embed',
      'param',
      'source',
      'track',
      'wbr',
    ];

    const openTagRegex = /<(\w+)(?:\s[^>]*)?>/g;
    const closeTagRegex = /<\/(\w+)>/g;

    const openTags: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = openTagRegex.exec(html)) !== null) {
      const tagName = match[1].toLowerCase();
      if (!selfClosingTags.includes(tagName)) {
        openTags.push(tagName);
      }
    }

    const closeTags: string[] = [];
    while ((match = closeTagRegex.exec(html)) !== null) {
      closeTags.push(match[1].toLowerCase());
    }

    const openTagCounts = this.countTags(openTags);
    const closeTagCounts = this.countTags(closeTags);

    for (const [tag, count] of Object.entries(openTagCounts)) {
      const closeCount = closeTagCounts[tag] || 0;
      if (count > closeCount) {
        unclosed.push(`<${tag}>`);
      }
    }

    return unclosed.slice(0, 5);
  }

  private countTags(tags: string[]): Record<string, number> {
    return tags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private findInvalidAttributes(html: string): string[] {
    const invalid: string[] = [];

    const quoteIssues = html.match(/\s\w+=[^"'\s>][^>\s]*/g);
    if (quoteIssues && quoteIssues.length > 0) {
      invalid.push('属性值缺少引号');
    }

    return invalid;
  }
}
