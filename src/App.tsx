
import './App.css'
import './index.css'
import { Github, ExternalLink } from 'lucide-react'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import { LampContainer } from './components/ui/lamp'
import { motion } from 'motion/react'
import { ScrollEffect } from './components/ui/scroll-effect'
import { MacbookScroll } from './components/ui/mac-scroll'
import sample1 from './assets/sample1.png'
import { CardWithMovingBorder } from './components/ui/moving-border'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()
  return (
      <div className="min-h-screen bg-gray-900 flex flex-col relative">
        {/* 스크롤 이펙트 - 전체 페이지에 적용 */}
        
        {/* 헤더 */}
        <header className="bg-[#000000] border-b border-[#000000] relative z-10">
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
        <Outlet />
      <div className="relative z-10">
        <LampContainer>
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
          >
            Welcome to  <br />  Git History Visualizer
          </motion.h1>
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative bottom-[-10%]transform justify-center flex flex-col items-center z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-slate-400 text-sm mb-2"
          >
            아래로 스크롤
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="w-1 h-3 bg-slate-400 rounded-full mt-2"
            />
          </motion.div>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="mt-2 text-slate-400"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
        </LampContainer>
       
      </div>
        
        
      <div className="relative z-10 bg-transparent">
        <MacbookScroll
          title={
            <span>
              커밋 히스토리의 시야를 확대하세요. <br /> 브랜치, 커밋, 머지 히스토리를 팀원별로 구분하여 시각화합니다.
            </span>
          }
          
          src={sample1}
          showGradient={true}
        />
        <div className="w-full h-[400px] flex items-center justify-center">
        <CardWithMovingBorder onClick={() => {
          navigate('/repository')
        }}
            className={`w-full py-3 text-sm sm:text-base rounded-lg font-medium text-white transition-colors text-center flex items-center justify-center
              bg-primary/10 text-primary hover:bg-primary/20`}
            >
      
              지금 시작해보기
            </CardWithMovingBorder>
      </div>
      </div>
      
      
      <div className="relative z-10">
        <ScrollEffect />
        <Footer />
      </div>
    </div>
  );
}

export default App 
