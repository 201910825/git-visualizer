import { useState } from 'react'
import './App.css'
import './index.css'
import { Github, ExternalLink } from 'lucide-react'
import GitTree from './components/GitTree'
import RepositoryForm from './components/RepositoryForm'
import Footer from './components/Footer'
import SplashScreen from './components/SplashScreen'
import { SEO, generateRepoSEO } from './components/SEO'
import type { RepositoryData } from './components/GitTree/types'
import { getRepositoryData } from './services/githubService'


function App() {
  const [data, setData] = useState<RepositoryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; repo: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  // 동적 SEO 설정
  const currentSEO = currentRepo 
    ? generateRepoSEO(currentRepo.owner, currentRepo.repo)
    : undefined;

  const handleFormSubmit = async (owner: string, repo: string) => {
    try {
      setLoading(true)
      setError(null)
      setProgress(0)
      setCurrentStep('시작 중...')
      setCurrentRepo({ owner, repo })
      
      const progressCallback = (progress: number, step: string) => {
        setProgress(progress)
        setCurrentStep(step)
      }
      
      const result = await getRepositoryData(owner, repo, progressCallback)
      setData(result)
      setSelectedBranches(result.branches)
    } catch (err) {
      console.error('데이터 가져오기 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setData(null)
      setCurrentRepo(null)
    } finally {
      setLoading(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  const handleBackToForm = () => {
    setData(null)
    setCurrentRepo(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* 동적 SEO 적용 */}
      <SEO {...currentSEO} />
      
      {/* 스플래시 화면 (로딩 중일 때) */}
      {loading && currentRepo && (
        <SplashScreen
          progress={progress}
          currentStep={currentStep}
          owner={currentRepo.owner}
          repo={currentRepo.repo}
        />
      )}

      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="w-full px-2 sm:px-4 h-12 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Github className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            <h1 className="text-lg sm:text-2xl font-bold truncate text-white">
              Git History Visualizer
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* GitHub 링크 */}
            <a
              href="https://github.com/201910825/gitview"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>

          </div>
        </div>
      </header>

      <main className={`flex-1 ${data ? 'w-full px-0 py-0' : 'container mx-auto px-2 sm:px-4 py-4 sm:py-8'}`}>
        {!data ? (
          <RepositoryForm 
            onSubmit={handleFormSubmit}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="w-full h-full">
            {/* 그래프 헤더 (모바일 최적화) */}
            <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-1 sm:py-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-lg font-semibold truncate text-gray-900">
                  {currentRepo?.owner}/{currentRepo?.repo}
                </h2>
                {currentRepo && (
                  <a
                    href={`https://github.com/${currentRepo.owner}/${currentRepo.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="GitHub에서 보기"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
                  </a>
                )}
              </div>
              <button
                onClick={handleBackToForm}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap text-gray-700 dark:text-gray-300 transition-colors"
              >
                다른 저장소
              </button>
            </div>
            
            {data.commits.length > 0 ? (
              <GitTree
                commits={data.commits}
                branches={selectedBranches}
                defaultBranch={data.defaultBranch}
                owner={currentRepo?.owner || ''}
                repo={currentRepo?.repo || ''}
                onCommitClick={() => {}}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                커밋 내역이 없습니다.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App 