import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RepositoryForm from './components/RepositoryForm'
import Footer from './components/Footer'
import { ThreeDMarquee } from './components/ui/3d-marquee'
import { getRepositoryData } from './services/githubService'
import SplashScreen from './components/SplashScreen'
import type { RepositoryData } from './components/GitTree/types'
import sample1 from './assets/sample1.png'
import sample2 from './assets/sample2.png'
import sample3 from './assets/sample3.png'
import sample4 from './assets/sample4.png'

function Repository() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [, setData] = useState<RepositoryData | null>(null)
  const handleFormSubmit = async (owner: string, repo: string) => {
    console.log('폼 제출:', owner, repo)
    
    // 입력값 검증
    setError(null)
    setLoading(true)
    setOwner(owner)
    setRepo(repo)
    try{
      const progressCallback = (progress: number, step: string) => {
        setProgress(progress)
        setCurrentStep(step)
      }
             const result = await getRepositoryData(owner, repo, progressCallback)
       setData(result)
       navigate(`/repository/${owner}/${repo}`, { state: { data: result } })
    }catch(err){
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8">

        
        <RepositoryForm 
          onSubmit={handleFormSubmit}
          loading={loading}
          error={error}
        />
      </main>
      {loading && (
        <SplashScreen
          progress={progress}
          currentStep={currentStep}
          owner={owner}
          repo={repo}
        />
      )}
      <Footer />
      <ThreeDMarquee className="absolute top-[20%] left-0 z-[-1] right-0 z-10 mx-auto my-10 max-w-7xl rounded-3xl bg-transparent p-2 ring-1 ring-neutral-700/10 z-[-1]" images={[
          sample1,
          sample2,
          sample3,
          sample4,
          sample1,
          sample2,
          sample3,
          sample4,
        ]} />
    </div>
  );

}
export default Repository 