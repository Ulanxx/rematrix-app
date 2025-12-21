import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { apiClient } from '@/api/client'
import type { Artifact, GetArtifactsResponse, Job, Stage, ChatMessage, ListChatMessagesResponse } from '@/api/types'
import { GlassCard } from '@/components/aceternity/GlassCard'
import AppShell from '@/components/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'

function getBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

function getToken(): string | null {
  return localStorage.getItem('rematrix_jwt')
}

function statusLabel(job: Job): string {
  if (job.status === 'COMPLETED') return '已完成'
  if (job.status === 'RUNNING') return '生成中'
  if (job.status === 'WAITING_APPROVAL') return '等待确认'
  if (job.status === 'FAILED') return '失败'
  if (job.status === 'DRAFT') return '草稿'
  return String(job.status)
}

function statusBadgeVariant(job: Job): 'default' | 'secondary' | 'outline' {
  if (job.status === 'COMPLETED') return 'default'
  if (job.status === 'RUNNING') return 'secondary'
  if (job.status === 'WAITING_APPROVAL') return 'outline'
  if (job.status === 'FAILED') return 'outline'
  return 'secondary'
}

function stageLabel(stage: Stage): string {
  return String(stage)
}

export default function AppDetailPage() {
  const { jobId } = useParams()
  const jobIdSafe = jobId || ''

  const [job, setJob] = useState<Job | null>(null)
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatLoading, setChatLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const latestByStage = useMemo(() => {
    const map = new Map<string, Artifact>()
    for (const a of artifacts) {
      const key = String(a.stage)
      const existing = map.get(key)
      if (!existing || a.version > existing.version) map.set(key, a)
    }
    return map
  }, [artifacts])

  async function loadOnce() {
    if (!jobIdSafe) return
    setLoading(true)
    setError(null)

    try {
      const [jobRes, artifactsRes, messagesRes] = await Promise.all([
        apiClient.get<Job>(`/jobs/${encodeURIComponent(jobIdSafe)}`),
        apiClient.get<GetArtifactsResponse>(
          `/jobs/${encodeURIComponent(jobIdSafe)}/artifacts`,
        ),
        apiClient.get<ListChatMessagesResponse>(
          `/chat-messages/job/${encodeURIComponent(jobIdSafe)}`,
        ),
      ])
      setJob(jobRes)
      setArtifacts(artifactsRes.artifacts || [])
      setMessages(messagesRes.messages || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOnce()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdSafe])

  async function send() {
    if (!jobIdSafe) return
    const text = input.trim()
    if (!text) return

    setChatError(null)
    setChatLoading(true)

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
    }
    const assistantId = `a_${Date.now()}`

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ])
    setInput('')

    try {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const url = `${getBaseUrl()}/jobs/${encodeURIComponent(jobIdSafe)}/chat/sse?message=${encodeURIComponent(text)}`
      const headers = new Headers()
      const token = getToken()
      if (token) headers.set('authorization', `Bearer ${token}`)

      const res = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `${res.status} ${res.statusText}`)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('stream not supported')
      }

      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      const applyDelta = (delta: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `${m.content}${delta}` }
              : m,
          ),
        )
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        while (true) {
          const idx = buffer.indexOf('\n\n')
          if (idx === -1) break
          const rawEvent = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)

          const lines = rawEvent.split('\n')
          let eventName = 'message'
          const dataLines: string[] = []

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventName = line.slice('event:'.length).trim()
              continue
            }
            if (line.startsWith('data:')) {
              dataLines.push(line.slice('data:'.length).trim())
            }
          }

          const dataText = dataLines.join('\n')
          if (!dataText) continue

          let payload: unknown = null
          try {
            payload = JSON.parse(dataText)
          } catch {
            payload = { raw: dataText }
          }

          if (eventName === 'message') {
            if (payload && typeof payload === 'object' && 'delta' in payload) {
              const delta = (payload as { delta?: unknown }).delta
              applyDelta(String(delta ?? ''))
            } else if (payload && typeof payload === 'object' && 'content' in payload && 'id' in payload) {
              // 完整消息（带 id）
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: (payload as { content: string }).content, id: (payload as { id: string }).id }
                    : m,
                ),
              )
            }
            continue
          }

          if (eventName === 'approval_request') {
            if (payload && typeof payload === 'object' && 'messageId' in payload && 'stage' in payload && 'artifactSummary' in payload) {
              const approvalMsg: ChatMessage = {
                id: (payload as { messageId: string }).messageId,
                jobId: jobId || '', // 确保 jobId 不为 undefined
                role: 'assistant',
                content: (payload as { artifactSummary: string }).artifactSummary,
                metadata: { type: 'approval_request', stage: (payload as { stage: string }).stage },
                createdAt: new Date().toISOString(),
              }
              setMessages((prev) => [...prev, approvalMsg])
            }
            continue
          }

          if (eventName === 'workflow_command') {
            if (payload && typeof payload === 'object' && 'type' in payload) {
              const commandPayload = payload as { type: string; command: string; params?: unknown; result?: unknown; error?: string }
              
              let statusMessage = ''
              let statusType = 'info'
              
              switch (commandPayload.type) {
                case 'executing':
                  statusMessage = `🔄 正在执行指令: /${commandPayload.command}`
                  statusType = 'info'
                  break
                case 'completed':
                  statusMessage = `✅ 指令执行成功: /${commandPayload.command}`
                  statusType = 'success'
                  break
                case 'failed':
                  statusMessage = `❌ 指令执行失败: /${commandPayload.command} - ${commandPayload.error || '未知错误'}`
                  statusType = 'error'
                  break
              }
              
              const statusMsg: ChatMessage = {
                id: `workflow-${Date.now()}`,
                jobId: jobId || '', // 确保 jobId 不为 undefined
                role: 'assistant',
                content: statusMessage,
                metadata: { type: 'workflow_command_status', statusType, command: commandPayload.command },
                createdAt: new Date().toISOString(),
              }
              setMessages((prev) => [...prev, statusMsg])
            }
            continue
          }

          if (eventName === 'error') {
            const msg =
              payload && typeof payload === 'object' && 'message' in payload
                ? String((payload as { message?: unknown }).message)
                : 'chat error'
            throw new Error(msg)
          }

          if (eventName === 'done') {
            controller.abort()
            break
          }
        }
      }
    } catch (e) {
      setChatError(e instanceof Error ? e.message : String(e))
    } finally {
      setChatLoading(false)
    }
  }

  async function handleApprove(stage: string) {
    if (!jobIdSafe) return
    try {
      await apiClient.post(`/jobs/${encodeURIComponent(jobIdSafe)}/approve`, { stage })
      // 更新消息状态为已确认
      setMessages((prev) =>
        prev.map((m) =>
          m.metadata?.type === 'approval_request' && m.metadata?.stage === stage
            ? { ...m, metadata: { ...m.metadata, status: 'approved' } }
            : m,
        ),
      )
      // 刷新 Job 状态
      await loadOnce()
    } catch (e) {
      setChatError(e instanceof Error ? e.message : String(e))
    }
  }

  async function handleReject(stage: string) {
    if (!jobIdSafe) return
    try {
      await apiClient.post(`/jobs/${encodeURIComponent(jobIdSafe)}/reject`, { stage })
      // 更新消息状态为已拒绝
      setMessages((prev) =>
        prev.map((m) =>
          m.metadata?.type === 'approval_request' && m.metadata?.stage === stage
            ? { ...m, metadata: { ...m.metadata, status: 'rejected' } }
            : m,
        ),
      )
      // 刷新 Job 状态
      await loadOnce()
    } catch (e) {
      setChatError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <AppShell
      title="应用详情"
      subtitle={`jobId: ${jobIdSafe}`}
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link to={`/jobs/${encodeURIComponent(jobIdSafe)}/artifacts`}>产物列表</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void loadOnce()}
            disabled={loading}
          >
            {loading ? '加载中...' : '刷新'}
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        <div className="space-y-6">
          <GlassCard className="p-[1px]">
            <Card className="border-0 bg-transparent text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Process</span>
                  {job && (
                    <Badge variant={statusBadgeVariant(job)} className="text-xs">
                      {statusLabel(job)}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!job && (
                  <div className="text-sm text-white/60">加载中...</div>
                )}
                {job && (
                  <div className="space-y-3">
                    <div className="text-sm text-white/60">
                      当前阶段：{String(job.currentStage || '-')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(latestByStage.values()).map((a) => (
                        <Badge key={`${a.stage}_${a.version}`} variant="outline" className="border-white/20 bg-white/5 text-white/80">
                          {stageLabel(a.stage)} v{a.version}
                        </Badge>
                      ))}
                      {latestByStage.size === 0 && (
                        <div className="text-sm text-white/60">暂无产物</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </GlassCard>

          <GlassCard className="p-[1px]">
            <Card className="border-0 bg-transparent text-white">
              <CardHeader>
                <CardTitle>物料与素材</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artifacts.length === 0 && (
                  <div className="text-sm text-white/60">暂无物料</div>
                )}
                {artifacts.length > 0 && (
                  <div className="space-y-2">
                    {Array.from(latestByStage.values()).map((a) => (
                      <div
                        key={`${a.stage}_${a.version}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white/90">
                            {stageLabel(a.stage)}
                          </div>
                          <div className="text-xs text-white/60">
                            {String(a.type)} · v{a.version}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white">
                          <Link
                            to={`/jobs/${encodeURIComponent(jobIdSafe)}/artifacts/${encodeURIComponent(String(a.stage))}/${a.version}`}
                          >
                            预览
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-[1px]">
            <Card className="border-0 bg-transparent text-white">
              <CardHeader>
                <CardTitle>ChatBot</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[70vh] flex-col">
                <div className="flex-1 overflow-auto rounded-md border border-white/10 bg-white/5 p-3">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="text-sm text-white/60">
                        输入问题开始对话。
                      </div>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className="space-y-1">
                        <div className="text-xs text-white/40">
                          {m.role === 'user' ? '你' : '助手'}
                        </div>
                        <div className="whitespace-pre-wrap text-sm text-white/90">
                          {m.content || (m.role === 'assistant' ? '...' : '')}
                        </div>
                        {m.metadata?.type === 'approval_request' && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(m.metadata?.stage as string)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              确认
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(m.metadata?.stage as string)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              拒绝
                            </Button>
                          </div>
                        )}
                        {m.metadata?.type === 'workflow_command_status' && (
                          <div className={`mt-2 rounded-md border p-2 text-xs ${
                            m.metadata.statusType === 'success' 
                              ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                              : m.metadata.statusType === 'error'
                              ? 'border-red-500/30 bg-red-500/10 text-red-400'
                              : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">工作流指令状态</span>
                              <span className="text-white/60">/{m.metadata.command}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {chatError && (
                  <div className="mt-3 text-sm text-rose-400">{chatError}</div>
                )}

                <Separator className="my-3 bg-white/10" />

                {/* 指令快捷按钮 */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('/run')}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    /run
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('/pause')}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    /pause
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('/resume')}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    /resume
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('/jump-to OUTLINE')}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    /jump-to
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setInput('/modify-stage')}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    /modify-stage
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInput(e.target.value)
                    }
                    placeholder="问点什么..."
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') void send()
                    }}
                    disabled={chatLoading}
                    className="border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30"
                  />
                  <Button type="button" onClick={() => void send()} disabled={chatLoading} className="bg-white/10 text-white hover:bg-white/20">
                    {chatLoading ? '发送中...' : '发送'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </GlassCard>

          <div className="text-xs text-white/40">
            SSE 接口：/jobs/:id/chat/sse（Bearer）
          </div>
        </div>
      </div>
    </AppShell>
  )
}
