import { Github, GitBranch, GitCommit, GitMerge } from 'lucide-react'
import ProgressBar from '../ProgressBar'

interface SplashScreenProps {
  progress: number
  currentStep: string
  owner: string
  repo: string
}

export default function SplashScreen({ progress, currentStep, owner, repo }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full mx-4">
        {/* 로고 섹션 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Github className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Git Visualizer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {owner}/{repo}
          </p>
        </div>

        {/* 아이콘 애니메이션 */}
        <div className="flex justify-center space-x-4 mb-8">
          <div className="animate-bounce">
            <GitBranch className="w-6 h-6 text-blue-500" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>
            <GitCommit className="w-6 h-6 text-green-500" />
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            <GitMerge className="w-6 h-6 text-purple-500" />
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="mb-6">
          <ProgressBar 
            progress={progress} 
            label={currentStep}
            className="mb-4"
          />
        </div>

        {/* 현재 작업 표시 */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>데이터를 분석하고 있습니다...</span>
          </div>
        </div>

        {/* 배경 패턴 */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-100 dark:bg-purple-900 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  )
} 