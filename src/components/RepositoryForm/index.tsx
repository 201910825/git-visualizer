import { useState } from 'react'
import { CardWithMovingBorder } from '../ui/moving-border'

interface RepositoryFormProps {
  onSubmit: (owner: string, repo: string) => void
  loading: boolean
  error: string | null
}



export default function RepositoryForm({ onSubmit, loading, error }: RepositoryFormProps) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [url, setUrl] = useState('')

  // GitHub URL 파싱
  const handleUrlChange = (value: string) => {
    setUrl(value)
    try {
      const urlObj = new URL(value)
      const [, ownerPart, repoPart] = urlObj.pathname.split('/')
      if (ownerPart && repoPart) {
        setOwner(ownerPart)
        setRepo(repoPart)
      }
    } catch (err) {
      // URL 파싱 실패 시 무시
    }
  }

  const clearForm = () => {
    setOwner('')
    setRepo('')
    setUrl('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (owner && repo) {
      onSubmit(owner, repo)
    }
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl mx-auto flex flex-col items-center justify-center h-[50%] w-full">
      {/* 소개 섹션 */}
      <section className="text-center mb-8 sm:mb-12 ">
        <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
          Git 히스토리를 한눈에 파악하세요
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 px-4">
          브랜치, 커밋, 머지 히스토리를 팀원별로 구분하여 시각화합니다
        </p>
      </section>

      {/* 저장소 입력 폼 */}
      <div className="bg-transparent dark:bg-transparent rounded-xl shadow-lg p-4 sm:p-8 w-full">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* 입력 방법 선택 */}
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
            <button
              type="button"
              onClick={() => {
                clearForm()
                setUrl('')
              }}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                !url 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              직접 입력
            </button>
            <button
              type="button"
              onClick={() => {
                clearForm()
                setUrl('https://github.com/')
              }}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-colors ${
                url 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              GitHub URL
            </button>
          </div>

          {/* GitHub URL 입력 */}
          {url !== '' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                GitHub 저장소 URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://github.com/사용자/저장소"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}

          {/* 직접 입력 폼 */}
          {url === '' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-center">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  저장소 소유자 (혹은 조직)
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="owner or organization"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  저장소 이름 (혹은 레포지토리)
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="repository name"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* 현재 입력된 정보 표시 */}
          {(owner && repo) && (
            <div className="p-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/70">
              <p className="text-sm">
                📁 <strong>{owner}/{repo}</strong> 저장소를 시각화합니다
              </p>
            </div>
          )}

          {/* 시각화 버튼 */}
          <div className="w-full flex items-center justify-center">
          <CardWithMovingBorder
            type="submit"
            disabled={loading || !owner || !repo}
            className={`w-full py-3 text-sm sm:text-base rounded-lg font-medium text-white transition-colors text-center flex items-center justify-center
              ${loading || !owner || !repo
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            >
              {loading ? 'Loading...' : 'GO!'}
            </CardWithMovingBorder>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400">
              <p className="text-sm text-center ">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
} 