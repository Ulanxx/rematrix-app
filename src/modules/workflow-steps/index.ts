// 接口和类型
export * from './step-definition.interface';

// 服务
export * from './step-registry.service';
export * from './step-executor.service';

// Step 定义
export { default as planStep } from './steps/plan.step';
export { default as outlineStep } from './steps/outline.step';
export { default as storyboardStep } from './steps/storyboard.step';
export { default as narrationStep } from './steps/narration.step';
export { default as pagesStep } from './steps/pages.step';
export { default as ttsStep } from './steps/tts.step';
export { default as renderStep } from './steps/render.step';
export { default as mergeStep } from './steps/merge.step';
export { default as doneStep } from './steps/done.step';

// 所有 Step 定义的数组，方便批量注册
import { planStep } from './steps/plan.step';
import { outlineStep } from './steps/outline.step';
import { storyboardStep } from './steps/storyboard.step';
import { narrationStep } from './steps/narration.step';
import { pagesStep } from './steps/pages.step';
import { ttsStep } from './steps/tts.step';
import { renderStep } from './steps/render.step';
import { mergeStep } from './steps/merge.step';
import { doneStep } from './steps/done.step';
import { StepDefinition } from './step-definition.interface';

export const allStepDefinitions: StepDefinition[] = [
  planStep,
  outlineStep,
  storyboardStep,
  narrationStep,
  pagesStep,
  ttsStep,
  renderStep,
  mergeStep,
  doneStep,
];

// 按 JobStage 索引的 Step 定义映射
export const stepDefinitionsByStage = {
  PLAN: planStep,
  OUTLINE: outlineStep,
  STORYBOARD: storyboardStep,
  NARRATION: narrationStep,
  PAGES: pagesStep,
  TTS: ttsStep,
  RENDER: renderStep,
  MERGE: mergeStep,
  DONE: doneStep,
};
