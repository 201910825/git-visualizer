import React, { useState, useMemo } from 'react';
import type { CommitNode } from './types';
import BranchGraph from './components/BranchGraph';

interface GitTreeProps {
  commits: CommitNode[];
  branches: string[];
  defaultBranch: string;
  owner: string;
  repo: string;
  onCommitClick?: (hash: string) => void;
}

const GitTree: React.FC<GitTreeProps> = ({
  commits,
  branches,
  defaultBranch,
  onCommitClick,
}) => {
  // 상태 관리
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(['all']);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(branches);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'author' | 'branch'>('all');

  // 팀원(작성자) 목록
  const authors = useMemo(() => {
    const authorSet = new Set(commits.map(commit => commit.author));
    return Array.from(authorSet).sort();
  }, [commits]);

  // 필터링된 커밋
  const filteredCommits = useMemo(() => {
    return commits.filter(commit => {
      // 검색어 필터링
      const matchesSearch = !searchTerm || 
        commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commit.hash.includes(searchTerm);

      // 작성자 필터링
      const matchesAuthor = selectedAuthors.includes('all') || selectedAuthors.includes(commit.author);

      // 브랜치 필터링
      const matchesBranch = selectedBranches.includes(commit.branch);

      return matchesSearch && matchesAuthor && matchesBranch;
    });
  }, [commits, searchTerm, selectedAuthors, selectedBranches]);

  return (
    <div className="flex flex-col space-y-6">
      {/* 필터 컨트롤 */}
      <div className="flex flex-col space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* 검색 */}
        <div>
          <input
            type="text"
            placeholder="커밋 메시지, 작성자, 해시 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* 보기 모드 선택 */}
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'all' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            전체 보기
          </button>
          <button
            onClick={() => setViewMode('author')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'author'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            작성자별
          </button>
          <button
            onClick={() => setViewMode('branch')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'branch'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            브랜치별
          </button>
        </div>

        {/* 작성자 필터 */}
        {viewMode === 'author' && (

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedAuthors(selectedAuthors.length===authors.length? [] : authors)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${ 
                selectedAuthors.length===authors.length
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              전체
            </button>
            {authors.map(author => (
              <button
                key={author}
                onClick={() => setSelectedAuthors(prev => 
                  prev.includes(author)
                    ? prev.filter(a => a !== author)
                    : [...prev, author]
                )}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedAuthors.includes(author)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {author}
                
              </button>
            ))}
          </div>
        )}

        {/* 브랜치 필터 */}
        {viewMode === 'branch' && (
          <div className="flex overflow-x-auto gap-2 scrollbar-custom">
            {branches.map(branch => (
              <button
                key={branch}
                onClick={() => {
                  setSelectedBranches(prev =>
                    prev.includes(branch)
                      ? prev.filter(b => b !== branch)
                      : [...prev, branch]
                  );
                }}
                className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedBranches.includes(branch)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {branch}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 그래프 영역 */}
      <div className="relative overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <BranchGraph
          commits={filteredCommits}
          branches={selectedBranches}
          defaultBranch={defaultBranch}
          onCommitClick={onCommitClick}
        />
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {/* 전체 커밋 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">전체 커밋</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{commits.length}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {filteredCommits.length !== commits.length && `${filteredCommits.length} 필터됨`}
              </p>
            </div>
            <div className="text-3xl opacity-20">📝</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 dark:bg-blue-400"></div>
        </div>

        {/* 참여 작성자 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">참여 작성자</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{authors.length}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                평균 {Math.round(commits.length / authors.length)}커밋/명
              </p>
            </div>
            <div className="text-3xl opacity-20">👥</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 dark:bg-green-400"></div>
        </div>

        {/* 브랜치 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">브랜치</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{branches.length}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {selectedBranches.length} 선택됨
              </p>
            </div>
            <div className="text-3xl opacity-20">🌿</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 dark:bg-purple-400"></div>
        </div>

        {/* 활동 분석 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">최근 활동</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {commits.length > 0 ? new Date(commits[0]?.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '-'}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                마지막 커밋
              </p>
            </div>
            <div className="text-3xl opacity-20">📊</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 dark:bg-orange-400"></div>
        </div>

        {/* 상위 기여자 차트 */}
        <div className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">상위 기여자</h3>
          <div className="space-y-2">
            {authors.slice(0, 5).map((author, index) => {
              const authorCommits = commits.filter(c => c.author === author).length;
              const percentage = (authorCommits / commits.length) * 100;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
              const darkColors = ['dark:bg-blue-400', 'dark:bg-green-400', 'dark:bg-purple-400', 'dark:bg-orange-400', 'dark:bg-pink-400'];
              
              return (
                <div key={author} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{author}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{authorCommits}개</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} ${darkColors[index]} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 브랜치 활동 차트 */}
        <div className="md:col-span-1 lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">브랜치별 활동</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {branches.slice(0, 6).map((branch, index) => {
              const branchCommits = commits.filter(c => c.branch === branch).length;
              const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600', 'text-indigo-600'];
              const darkColors = ['dark:text-blue-400', 'dark:text-green-400', 'dark:text-purple-400', 'dark:text-orange-400', 'dark:text-pink-400', 'dark:text-indigo-400'];
              const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100', 'bg-indigo-100'];
              const darkBgColors = ['dark:bg-blue-900/20', 'dark:bg-green-900/20', 'dark:bg-purple-900/20', 'dark:bg-orange-900/20', 'dark:bg-pink-900/20', 'dark:bg-indigo-900/20'];
              
              return (
                <div key={branch} className={`p-3 rounded-lg ${bgColors[index]} ${darkBgColors[index]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${colors[index]} ${darkColors[index]} truncate`}>
                        {branch}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {branchCommits}개 커밋
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${colors[index]} ${darkColors[index]}`}>
                      {Math.round((branchCommits / commits.length) * 100)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitTree; 