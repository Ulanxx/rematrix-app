import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiClient } from '@/api/client'
import type { Job, ListJobsResponse } from '@/api/types'
import { GlassCard } from '@/components/aceternity/GlassCard'
import AppShell from '@/components/AppShell'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function HomePage() {
  const navigate = useNavigate()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasJobs = useMemo(() => jobs.length > 0, [jobs])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<ListJobsResponse>('/jobs')
      setJobs(res.jobs || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <AppShell
      title="首页"
      subtitle="应用列表"
    >
      <div className="space-y-4">
        {error && <div className="text-sm text-rose-600">{error}</div>}
        {!loading && !error && !hasJobs && (
          <div className="text-sm text-slate-600">暂无应用</div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              type="button"
              className="text-left transition-transform hover:scale-[1.02]"
              onClick={() => navigate(`/apps/${encodeURIComponent(job.id)}`)}
            >
              <GlassCard className="p-[1px]">
                <Card className="border-0 bg-transparent text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium text-white/90">{job.id}</span>
                      <Badge variant={statusBadgeVariant(job)} className="text-xs">
                        {statusLabel(job)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/60">
                    <div>当前阶段：{String(job.currentStage || '-')}</div>
                  </CardContent>
                </Card>
              </GlassCard>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
