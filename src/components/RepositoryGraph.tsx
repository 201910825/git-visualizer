import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import GitTree from './GitTree'
import { SEO, generateRepoSEO } from './SEO'
import { ModalProvider } from './ui/animated-modal'
import type { RepositoryData } from './GitTree/types'

function RepositoryGraph() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state?.data as RepositoryData | undefined
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [selectedBranches] = useState<string[]>(data?.branches || [])
  
  console.log('받은 데이터:', data)

  const handleBackToForm = () => {
    navigate('/repository')
  }

  // 동적 SEO 설정
  const currentSEO = owner && repo 
    ? generateRepoSEO(owner, repo)
    : undefined;

  if (!owner || !repo) {
    return <div>잘못된 경로입니다.</div>
  }

  // 데이터가 없는 경우 폼으로 리다이렉트
  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-4">데이터를 찾을 수 없습니다</h2>
          <p className="text-gray-400 mb-6">저장소 폼에서 다시 시작해주세요.</p>
          <button
            onClick={handleBackToForm}
            className="px-4 py-2 bg-cyan-100 text-cyan-600 rounded hover:bg-cyan-200 transition-colors"
          >
            저장소 폼으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 동적 SEO 적용 */}
      <SEO {...currentSEO} />
      
      {/* 스플래시 화면 (로딩 중일 때) */}


      <div className="w-full h-full">
        {/* 그래프 헤더 */}
        <div className="bg-black border-b border-cyan-200 px-2 sm:px-4 py-1 sm:py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-lg font-semibold truncate text-cyan-600 dark:text-cyan-400">
              {owner}/{repo}
            </h2>
            <a
              href={`https://github.com/${owner}/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
              aria-label="GitHub에서 보기"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
            </a>
          </div>
          <button
            onClick={handleBackToForm}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-cyan-200 dark:border-cyan-600 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap text-gray-700 dark:text-gray-300 transition-colors"
          >
            다른 저장소
          </button>
        </div>
        
        <ModalProvider>
          {error ? (
            <div className="text-center py-12 text-red-500">
              오류: {error}
            </div>
          ) : data && data.commits.length > 0 ? (
            <GitTree
              commits={data.commits}
              branches={selectedBranches}
              defaultBranch={data.defaultBranch}
              owner={owner}
              repo={repo}
              onCommitClick={() => {}}
            />
          ) : loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              로딩 중...
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              커밋 내역이 없습니다.
            </div>
          )}
        </ModalProvider>
      </div>
    </div>
  );
}

export default RepositoryGraph 