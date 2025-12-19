import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { apiClient } from '@/api/client'
import type { ApproveStageResponse, Artifact, GetArtifactsResponse, Stage } from '@/api/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default function ArtifactPreviewPage() {
  const { jobId, stage, version } = useParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artifact, setArtifact] = useState<Artifact | null>(null)

  const [contentSource, setContentSource] = useState<'db' | 'blob'>('db')
  const [blobLoading, setBlobLoading] = useState(false)
  const [blobError, setBlobError] = useState<string | null>(null)
  const [blobContent, setBlobContent] = useState<unknown>(null)

  const [approveLoading, setApproveLoading] = useState(false)
  const [approveResult, setApproveResult] = useState<string | null>(null)

  const jobIdSafe = jobId || ''
  const stageSafe = (stage || '') as Stage
  const versionNum = Number(version || '1')

  const title = useMemo(() => `${stageSafe} v${versionNum}`, [stageSafe, versionNum])

  async function load() {
    if (!jobIdSafe) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<GetArtifactsResponse>(
        `/jobs/${encodeURIComponent(jobIdSafe)}/artifacts`,
      )
      const found = (res.artifacts || []).find(
        (a) => String(a.stage) === String(stageSafe) && a.version === versionNum,
      )
      setArtifact(found || null)

      setBlobError(null)
      setBlobContent(null)
      setContentSource('db')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function loadBlob() {
    if (!artifact?.blobUrl) return
    setBlobLoading(true)
    setBlobError(null)
    try {
      const res = await fetch(artifact.blobUrl)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = (await res.json()) as unknown
      setBlobContent(json)
      setContentSource('blob')
    } catch (e) {
      setBlobError(e instanceof Error ? e.message : String(e))
    } finally {
      setBlobLoading(false)
    }
  }

  useEffect(() => {
    if (!jobIdSafe || !stageSafe || Number.isNaN(versionNum)) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdSafe, stageSafe, versionNum])

  async function approve() {
    if (!jobIdSafe || !stageSafe) return
    setApproveLoading(true)
    setApproveResult(null)
    setError(null)
    try {
      const res = await apiClient.post<ApproveStageResponse>(
        `/jobs/${encodeURIComponent(jobIdSafe)}/approve`,
        { stage: stageSafe },
      )
      setApproveResult(JSON.stringify(res, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setApproveLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Artifact Preview</h1>
          <p className="mt-1 text-sm text-slate-500">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to={`/jobs/${encodeURIComponent(jobIdSafe)}/artifacts`}>返回列表</Link>
          </Button>
          <Button type="button" onClick={() => void load()} disabled={loading}>
            {loading ? '加载中...' : '加载'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>元信息</CardTitle>
        </CardHeader>
        <CardContent>
          {artifact ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{String(artifact.stage)}</Badge>
              <Badge variant="secondary">{artifact.type}</Badge>
              <Badge variant="outline">v{artifact.version}</Badge>
              {artifact.blobUrl ? <Badge variant="secondary">blobUrl</Badge> : <Badge variant="outline">no blobUrl</Badge>}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              {loading ? '加载中...' : '未找到该 artifact（可能版本不匹配或尚未生成）'}
            </div>
          )}

          {artifact?.blobUrl && (
            <div className="mt-3 grid gap-2">
              <div className="text-sm">
                <a className="underline" href={artifact.blobUrl} target="_blank" rel="noreferrer">
                  打开 blobUrl
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={contentSource === 'db' ? 'default' : 'outline'}
                  onClick={() => setContentSource('db')}
                  disabled={!artifact}
                >
                  使用 DB content
                </Button>
                <Button
                  type="button"
                  variant={contentSource === 'blob' ? 'default' : 'outline'}
                  onClick={() => void loadBlob()}
                  disabled={!artifact?.blobUrl || blobLoading}
                >
                  {blobLoading ? '拉取中...' : '从 blobUrl 拉取'}
                </Button>
              </div>
              {blobError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  blobUrl 拉取失败：{blobError}
                </div>
              )}
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => void approve()} disabled={approveLoading || !stageSafe}>
              {approveLoading ? '提交中...' : 'Approve 当前 stage'}
            </Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
              刷新 artifact
            </Button>
          </div>

          {approveResult && (
            <pre className="mt-4 overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
              {approveResult}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>content 预览</CardTitle>
        </CardHeader>
        <CardContent>
          {artifact ? (
            <pre className="overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
              {safeJson(contentSource === 'blob' ? blobContent : artifact.content)}
            </pre>
          ) : (
            <div className="text-sm text-slate-500">未加载</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
