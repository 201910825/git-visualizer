import React from 'react';
import type { RepoInfo } from '../GitTree/types';

interface PullRequestInfoProps {
  prNumber: number;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'closed' | 'merged' | 'none';
  repoInfo: RepoInfo;
}

const PullRequestInfo: React.FC<PullRequestInfoProps> = ({
  prNumber,
  sourceBranch,
  targetBranch,
  status,
  repoInfo
}) => {
  const statusColors = {
    open: 'bg-emerald-100 text-emerald-800',
    closed: 'bg-rose-100 text-rose-800',
    merged: 'bg-purple-100 text-purple-800',
    none: 'bg-gray-100 text-gray-800'
  } as const;

  const statusText = {
    open: '열림',
    closed: '닫힘',
    merged: '병합됨',
    none: '일반 병합'
  } as const;

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {status === 'none' ? '병합 정보' : 'Pull Request 정보'}
      </h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {status !== 'none' && (
            <>
              <span className="font-medium text-gray-700">PR 번호:</span>
              <a
                href={`https://github.com/${repoInfo.owner}/${repoInfo.name}/pull/${prNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                #{prNumber}
              </a>
            </>
          )}
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
            {statusText[status]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{sourceBranch}</span>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
          <span className="text-gray-600">{targetBranch}</span>
        </div>
      </div>
    </div>
  );
};

export default PullRequestInfo; 