import { Octokit } from '@octokit/rest';
import type { CommitNode } from '../components/GitTree/types';
import { openDB } from 'idb';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

interface RepositoryData {
  owner: string;
  repo: string;
  commits: CommitNode[];
  branches: string[];
  defaultBranch: string;
}

const DB_NAME = 'git-visualizer';
const STORE_NAME = 'cache';
const DB_VERSION = 1;

// IndexedDB 초기화
async function initDB() {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  } catch (error) {
    console.error('IndexedDB 초기화 실패:', error);
    return null;
  }
}

// 캐시 유틸리티
const cache = {
  async get(key: string) {
    try {
      const db = await initDB();
      if (!db) return null;
      
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const cached = await store.get(key);
      
      if (!cached) return null;
      
      const { data, timestamp } = cached;
      // 캐시 유효 시간: 5분
      if (Date.now() - timestamp > 5 * 60 * 1000) {
        await this.delete(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('캐시 읽기 실패:', error);
      return null;
    }
  },
  
  async set(key: string, data: any) {
    try {
      const db = await initDB();
      if (!db) return;
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.put({
        data,
        timestamp: Date.now()
      }, key);
      await tx.done;
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  },
  
  async delete(key: string) {
    try {
      const db = await initDB();
      if (!db) return;
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.delete(key);
      await tx.done;
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
    }
  },
  
  async clear() {
    try {
      const db = await initDB();
      if (!db) return;
      
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.clear();
      await tx.done;
    } catch (error) {
      console.error('캐시 초기화 실패:', error);
    }
  }
};


// 커밋 상세 정보를 가져오는 함수를 별도로 분리




export async function getRepositoryData(
  owner: string, 
  repo: string, 
  progressCallback?: (progress: number, step: string) => void
): Promise<RepositoryData> {
  try {
    console.time('GitHub API 전체 호출 시간');
    
    // 진척도 추적을 위한 단계 정의
    const totalSteps = 7;
    let currentStep = 0;
    
    const updateProgress = (stepIncrement: number, stepName: string, subProgress = 0) => {
      currentStep += stepIncrement;
      const baseProgress = (currentStep / totalSteps) * 100;
      const finalProgress = Math.min(95, baseProgress + subProgress); // 최대 95%까지만
      progressCallback?.(finalProgress, stepName);
      console.log(`📊 [${Math.round(finalProgress)}%] ${stepName}`);
    };
    
    // 캐시된 데이터 확인
    const cacheKey = `${owner}/${repo}/data`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.timeEnd('GitHub API 전체 호출 시간');
      progressCallback?.(100, '캐시에서 데이터 로드 완료!');
      console.log('💾 [100%] 캐시에서 데이터 로드 완료!');
      return cachedData;
    }

    // 캐시 키 생성 함수
    const getCacheKey = (type: string, identifier: string) => `${owner}/${repo}/${type}/${identifier}`;
    
    // 캐시 초기화 (필요한 경우)
    if (window.location.search.includes('clear-cache')) {
      await cache.clear();
    }

    const headers = {
      'Authorization': `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    // 1. 저장소 정보 가져오기 (캐시 적용)
    console.time('저장소 정보 가져오기');
    updateProgress(1, '저장소 정보 확인 중...');
    
    const repoCacheKey = getCacheKey('repo', 'info');
    let repoData = await cache.get(repoCacheKey);
    
    if (!repoData) {
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if(repoResponse.status === 404){
        throw new Error("저장소가 존재하지 않습니다.");
      }
      if(repoResponse.status === 403){
        throw new Error("저장소에 접근할 수 없습니다 private 저장소 인가요?");
      }
      if(repoResponse.status === 401){
        throw new Error("저장소에 접근할 수 없습니다");
      }
      if(repoResponse.status === 400){
        throw new Error("저장소에 접근할 수 없습니다");
      }
      if(repoResponse.status === 500){
        throw new Error("저장소에 접근할 수 없습니다");
      }
      if (!repoResponse.ok) {
        throw new Error(`GitHub API 호출 중 오류가 발생했습니다: ${repoResponse.status}`);
      }
      repoData = await repoResponse.json();
      await cache.set(repoCacheKey, repoData);
    }
    
    const defaultBranch = repoData.default_branch;
    console.timeEnd('저장소 정보 가져오기');

    // 2. 브랜치 목록 가져오기 (캐시 적용)
    console.time('브랜치 목록 가져오기');
    updateProgress(1, '브랜치 목록 가져오는 중...');
    
    const branchesCacheKey = getCacheKey('branches', 'list');
    let allBranches = await cache.get(branchesCacheKey);
    
    if (!allBranches) {
      const branchesPromises = [];
      const PER_PAGE = 100;

      // 첫 페이지로 총 브랜치 수 확인
      const firstPageResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches?per_page=${PER_PAGE}&page=1`,
        { headers }
      );
      
      if (!firstPageResponse.ok) {
        throw new Error(`GitHub API 호출 중 오류가 발생했습니다: ${firstPageResponse.status}`);
      }

      const linkHeader = firstPageResponse.headers.get('link');
      const totalPages = linkHeader
        ? parseInt(linkHeader.match(/page=(\d+)>; rel="last"/)?.[1] || '1')
        : 1;

      // 나머지 페이지 병렬 요청
      for (let page = 2; page <= totalPages; page++) {
        branchesPromises.push(
          fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=${PER_PAGE}&page=${page}`, { headers })
            .then(res => res.json())
        );
      }

      const firstPageBranches = await firstPageResponse.json();
      const remainingBranches = await Promise.all(branchesPromises);
      allBranches = [firstPageBranches, ...remainingBranches].flat();
      await cache.set(branchesCacheKey, allBranches);
    }
    
    const branchNames = allBranches.map((branch: any) => branch.name);
    console.timeEnd('브랜치 목록 가져오기');

    // 3. 최적화된 커밋 가져오기 - 전체 저장소의 모든 커밋을 한 번에 가져오기
    console.time('전체 커밋 가져오기 (최적화)');
    updateProgress(1, '커밋 데이터 분석 시작...');
    
    const allCommitsCacheKey = getCacheKey('commits', 'all');
    let allCommits = await cache.get(allCommitsCacheKey);

    if (!allCommits) {
      // 메인 브랜치의 모든 커밋을 먼저 가져오기 (대부분의 커밋이 여기 포함됨)
      console.time('메인 브랜치 커밋 가져오기');
      updateProgress(1, '메인 브랜치 커밋 수집 중...');
      const { data: mainBranchCommits } = await octokit.repos.listCommits({
        owner,
        repo,
        sha: defaultBranch,
        per_page: 100, // 최대 100개
      });
      console.timeEnd('메인 브랜치 커밋 가져오기');

      // 브랜치별 최신 커밋 확인하여 추가 커밋 찾기
      console.time('브랜치별 최신 커밋 확인');
      updateProgress(1, '브랜치별 커밋 분석 중...');
      
      const additionalCommits = new Map<string, any>();
      const processedShas = new Set(mainBranchCommits.map(c => c.sha));

      // 브랜치별로 최신 커밋만 확인 (전체 커밋 목록은 가져오지 않음)
      const branchHeadPromises = branchNames.slice(0, 20).map(async (branchName: string) => {
        try {
          const { data: branchInfo } = await octokit.repos.getBranch({
            owner,
            repo,
            branch: branchName
          });
          
          // 해당 브랜치의 head 커밋이 메인 브랜치에 없으면 추가
          if (!processedShas.has(branchInfo.commit.sha)) {
            // 브랜치의 최근 몇 개 커밋만 가져오기
            const { data: branchCommits } = await octokit.repos.listCommits({
              owner,
              repo,
              sha: branchName,
              per_page: 10 // 브랜치별로 최대 10개만
            });

            branchCommits.forEach(commit => {
              if (!processedShas.has(commit.sha)) {
                additionalCommits.set(commit.sha, { ...commit, branch: branchName });
                processedShas.add(commit.sha);
              }
            });
          }
        } catch (error) {
          console.warn(`브랜치 ${branchName} 정보 가져오기 실패:`, error);
        }
      });

      await Promise.all(branchHeadPromises);
      console.timeEnd('브랜치별 최신 커밋 확인');

      // 커밋 상세 정보 가져오기 (배치 처리)
      console.time('커밋 상세 정보 가져오기');
      updateProgress(1, '커밋 상세 정보 수집 중...');
      
      const allCommitData = [...mainBranchCommits, ...Array.from(additionalCommits.values())];
      const totalCommits = allCommitData.length;
      
      // 커밋 상세 정보를 배치로 처리
      const COMMIT_BATCH_SIZE = 10;
      const commitDetailsPromises = [];
      let processedCommits = 0;
      
      for (let i = 0; i < allCommitData.length; i += COMMIT_BATCH_SIZE) {
        const batch = allCommitData.slice(i, i + COMMIT_BATCH_SIZE);
        commitDetailsPromises.push(
          Promise.all(batch.map(async (commit) => {
            try {
              // 커밋이 어느 브랜치에 속하는지 확인
              const belongsToBranches = [];
              
              // 메인 브랜치에 속하는지 확인
              if (mainBranchCommits.some(mc => mc.sha === commit.sha)) {
                belongsToBranches.push(defaultBranch);
              }
              
              // 추가 브랜치에 속하는지 확인
              if (commit.branch && commit.branch !== defaultBranch) {
                belongsToBranches.push(commit.branch);
              }

              // 기본적으로 메인 브랜치에 할당
              const primaryBranch = belongsToBranches[0] || defaultBranch;

              // 커밋 상세 정보 가져오기 (파일 변경사항 포함)
              let commitStats = { additions: 0, deletions: 0, total: 0 };
              try {
                const { data: detailedCommit } = await octokit.repos.getCommit({
                  owner,
                  repo,
                  ref: commit.sha,
                });
                commitStats = {
                  additions: detailedCommit.stats?.additions || 0,
                  deletions: detailedCommit.stats?.deletions || 0,
                  total: detailedCommit.stats?.total || 0
                };
              } catch (statsError) {
                console.warn(`커밋 ${commit.sha} 통계 가져오기 실패:`, statsError);
              }

              return {
                hash: commit.sha,
                branch: primaryBranch,
                sourceBranch: primaryBranch,
                message: commit.commit.message,
                author: commit.commit.author?.name || 'Unknown',
                date: commit.commit.author?.date || new Date().toISOString(),
                parents: commit.parents.map((parent: any) => parent.sha),
                stats: commitStats,
                isPushed: true
              };
            } catch (error) {
              console.error(`커밋 ${commit.sha} 처리 실패:`, error);
              return null;
            }
          }))
        );
      }

      // 배치별로 처리하면서 진척도 업데이트
      const commitBatches = [];
      for (let i = 0; i < commitDetailsPromises.length; i++) {
        const batchResult = await commitDetailsPromises[i];
        commitBatches.push(batchResult);
        processedCommits += COMMIT_BATCH_SIZE;
        
        // 배치 처리 진척도 계산 (5단계 내에서 하위 진행률)
        const batchProgress = Math.min(100, (processedCommits / totalCommits) * 100);
        const subProgress = batchProgress * 0.15; // 15% 범위 내에서 진행
        updateProgress(0, `커밋 분석 중... (${Math.min(processedCommits, totalCommits)}/${totalCommits})`, subProgress);
      }
      
      allCommits = commitBatches.flat().filter(Boolean);
      console.timeEnd('커밋 상세 정보 가져오기');
      
      // 캐시에 저장
      await cache.set(allCommitsCacheKey, allCommits);
    }

    console.timeEnd('전체 커밋 가져오기 (최적화)');
    
    // 데이터 정리 및 구조화
    updateProgress(1, '데이터 정리 중...');
    
    const repositoryData: RepositoryData = {
      owner,
      repo,
      commits: allCommits,
      branches: branchNames,
      defaultBranch,
    };

    // 전체 데이터 캐싱
    updateProgress(1, '데이터 캐싱 중...');
    await cache.set(cacheKey, repositoryData);
    
    // 완료
    progressCallback?.(100, '데이터 로드 완료!');
    console.log('✅ [100%] 데이터 로드 완료!');
    console.timeEnd('GitHub API 전체 호출 시간');

    return repositoryData;
  } catch (error) {
    console.error('GitHub 데이터 가져오기 실패:', error);
    throw error;
  }
} 