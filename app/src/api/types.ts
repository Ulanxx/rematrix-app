export type Stage = 'PLAN' | 'OUTLINE' | 'NARRATION' | 'PAGES' | 'DONE' | string

export type JobStatus =
  | 'DRAFT'
  | 'WAITING_APPROVAL'
  | 'RUNNING'
  | 'COMPLETED'
  | string

export interface Job {
  id: string
  status: JobStatus
  currentStage?: Stage | null
  config?: Record<string, unknown>
}

export interface Artifact {
  stage: Stage
  type: 'JSON' | string
  version: number
  content: unknown
  blobUrl: string | null
}

export interface GetArtifactsResponse {
  artifacts: Artifact[]
  timeout: boolean
}

export interface ApproveStageRequest {
  stage: Stage
}

export interface RejectStageRequest {
  stage: Stage
  reason?: string
}

export interface ApproveStageResponse {
  ok: boolean
  job?: Job
  approval?: {
    stage: Stage
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string
    comment?: string | null
  }
}

export interface RejectStageResponse extends ApproveStageResponse {
  timeout?: boolean
}
