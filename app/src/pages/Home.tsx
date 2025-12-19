import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppShell from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export default function HomePage() {
  const navigate = useNavigate()

  const [jobId, setJobId] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('rematrix_jwt') || '')

  const canGo = useMemo(() => jobId.trim().length > 0, [jobId])

  return (
    <AppShell
      title="首页"
      subtitle="最小联调：输入 JobId，查看/预览产物并 approve。"
      actions={
        <Button asChild variant="outline" size="sm">
          <a href="http://localhost:8233" target="_blank" rel="noreferrer">
            Temporal Web
          </a>
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>JWT（localStorage）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="粘贴 JWT token（可选）"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  localStorage.setItem('rematrix_jwt', token)
                }}
              >
                保存
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('rematrix_jwt')
                  setToken('')
                }}
              >
                清除
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>进入 Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="输入 jobId（UUID）"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                disabled={!canGo}
                onClick={() => navigate(`/jobs/${encodeURIComponent(jobId.trim())}/artifacts`)}
              >
                查看产物
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/course/create')}
              >
                上传 Markdown 创建课程
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
