export interface WorkflowCommandDefinition {
  command: string;
  description: string;
  parameters?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'object';
      required: boolean;
      description: string;
    }
  >;
  examples: string[];
  naturalLanguagePatterns: RegExp[];
}

export const WORKFLOW_COMMANDS: Record<string, WorkflowCommandDefinition> = {
  run: {
    command: 'run',
    description: '启动或恢复任务执行',
    examples: ['/run', '开始执行', '启动任务', '请开始运行'],
    naturalLanguagePatterns: [/开始|运行|执行|start|run/],
  },
  pause: {
    command: 'pause',
    description: '暂停正在执行的任务',
    examples: ['/pause', '暂停任务', '停止执行', '请暂停'],
    naturalLanguagePatterns: [/暂停|stop|pause/],
  },
  resume: {
    command: 'resume',
    description: '恢复已暂停的任务',
    examples: ['/resume', '恢复任务', '继续执行', '请继续'],
    naturalLanguagePatterns: [/恢复|继续|resume/],
  },
  'jump-to': {
    command: 'jump-to',
    description: '跳转到指定阶段',
    parameters: {
      stage: {
        type: 'string',
        required: true,
        description: '目标阶段名称 (PLAN, OUTLINE, NARRATION, PAGES, DONE)',
      },
    },
    examples: [
      '/jump-to OUTLINE',
      '/jump-to NARRATION',
      '跳转到大纲阶段',
      '请跳转到叙事阶段',
    ],
    naturalLanguagePatterns: [/跳转到|jump to|goto/],
  },
  'modify-stage': {
    command: 'modify-stage',
    description: '修改指定阶段的参数',
    parameters: {
      stage: {
        type: 'string',
        required: true,
        description: '阶段名称 (PLAN, OUTLINE, NARRATION, PAGES, DONE)',
      },
      modifications: {
        type: 'object',
        required: true,
        description: '修改的参数对象',
      },
    },
    examples: [
      '/modify-stage OUTLINE temperature=0.7',
      '/modify-stage NARRATION model=gpt-4',
      '修改大纲阶段的温度参数',
      '请修改叙事阶段的模型',
    ],
    naturalLanguagePatterns: [/修改|modify/],
  },
  retry: {
    command: 'retry',
    description: '重试失败的任务',
    examples: ['/retry', '重试任务', '重新执行', '请重试'],
    naturalLanguagePatterns: [/重试|retry|重新执行/],
  },
};

export const VALID_STAGES = ['PLAN', 'OUTLINE', 'NARRATION', 'PAGES', 'DONE'];

export function isValidStage(stage: string): boolean {
  return VALID_STAGES.includes(stage.toUpperCase());
}

export function normalizeStage(stage: string): string {
  return stage.toUpperCase();
}

export function getCommandHelp(): string {
  let help = '可用的工作流指令：\n\n';

  for (const [key, definition] of Object.entries(WORKFLOW_COMMANDS)) {
    help += `/${key} - ${definition.description}\n`;

    if (definition.parameters) {
      help += '  参数：\n';
      for (const [paramName, paramDef] of Object.entries(
        definition.parameters,
      )) {
        const required = paramDef.required ? '必需' : '可选';
        help += `    ${paramName}: ${paramDef.description} (${required})\n`;
      }
    }

    help += '  示例：\n';
    for (const example of definition.examples) {
      help += `    ${example}\n`;
    }
    help += '\n';
  }

  return help;
}
