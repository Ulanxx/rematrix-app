import { Link, Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/Home'
import CourseCreatePage from '@/pages/CourseCreate'
import ArtifactsPage from '@/pages/Artifacts'
import ArtifactPreviewPage from '@/pages/ArtifactPreview'
import JobProcessPage from '@/pages/JobProcess'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/course/create" element={<CourseCreatePage />} />
      <Route path="/jobs/:jobId/process" element={<JobProcessPage />} />
      <Route path="/jobs/:jobId/artifacts" element={<ArtifactsPage />} />
      <Route
        path="/jobs/:jobId/artifacts/:stage/:version"
        element={<ArtifactPreviewPage />}
      />
      <Route
        path="*"
        element={
          <div className="mx-auto w-full max-w-3xl p-6">
            <div className="text-sm text-slate-600">页面不存在</div>
            <div className="mt-3">
              <Link className="underline" to="/">
                返回首页
              </Link>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
