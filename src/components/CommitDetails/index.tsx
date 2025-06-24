import React from 'react';
import type { CommitNode } from '../GitTree/types';
import CommitHeader from './CommitHeader';
import CommitStats from './CommitStats';
import PullRequestInfo from './PullRequestInfo';

interface CommitDetailsProps {
  commit: CommitNode;
  repoInfo: {
    owner: string;
    name: string;
  };
  onClose: () => void;
  pullRequestInfo?: {
    number: number;
    title: string;
    state: string;
    base: string;
    head: string;
  };
}

const CommitDetails: React.FC<CommitDetailsProps> = ({
  commit,
  repoInfo,
  onClose,
  pullRequestInfo
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold">커밋 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <CommitHeader 
            hash={commit.hash}
            message={commit.message}
            author={commit.author}
            date={commit.date}
            repoInfo={repoInfo}
          />
          
          {pullRequestInfo && (
            <PullRequestInfo
              prNumber={pullRequestInfo.number}
              sourceBranch={pullRequestInfo.head}
              targetBranch={pullRequestInfo.base}
              status={pullRequestInfo.state as 'open' | 'closed' | 'merged'}
              repoInfo={repoInfo}
            />
          )}

          <CommitStats stats={commit.stats} />

          <div className="space-y-2">
            <h3 className="font-semibold">브랜치 정보</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><span className="font-medium">현재 브랜치:</span> {commit.branch}</p>
              {commit.sourceBranch && commit.sourceBranch !== commit.branch && (
                <p><span className="font-medium">원본 브랜치:</span> {commit.sourceBranch}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">커밋 메시지</h3>
            <pre className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
              {commit.message}
            </pre>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">커밋 정보</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2">
              <p><span className="font-medium">작성자:</span> {commit.author}</p>
              <p><span className="font-medium">날짜:</span> {formatDate(commit.date)}</p>
              <p><span className="font-medium">해시:</span> {commit.hash}</p>
              {commit.parents.length > 0 && (
                <div>
                  <span className="font-medium">부모 커밋:</span>
                  <ul className="mt-1 space-y-1">
                    {commit.parents.map(parentHash => (
                      <li key={parentHash} className="text-sm font-mono">
                        {parentHash}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex justify-end space-x-2">
            <a
              href={`https://github.com/${repoInfo.owner}/${repoInfo.name}/commit/${commit.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              GitHub에서 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitDetails; 