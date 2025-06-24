import React from 'react';
import type { CommitNodeWithPosition } from '../../types';
import { getBranchColor } from '../../utils';
import { format } from 'date-fns';

interface CommitTooltipProps {
  commit: CommitNodeWithPosition;
  scale: number;
  viewOffset: { x: number; y: number };
  defaultBranch: string;
}

const CommitTooltip: React.FC<CommitTooltipProps> = ({
  commit,
  scale,
  viewOffset,
  defaultBranch,
}) => {
  const branchColor = getBranchColor(commit.branch, defaultBranch);

  return (
    <div
      className="absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50"
      style={{
        left: (commit.x * scale) + viewOffset.x + 20,
        top: (commit.y * scale) + viewOffset.y - 10,
        transform: 'translateY(-50%)',
        maxWidth: '300px',
        border: `2px solid ${branchColor}`,
      }}
    >
      {/* 커밋 해시 */}
      <div className="font-mono text-sm text-gray-500 dark:text-gray-400">
        {commit.hash}
      </div>

      {/* 커밋 메시지 */}
      <div className="mt-1 font-medium text-gray-900 dark:text-gray-100">
        {commit.message}
      </div>

      {/* 작성자 및 날짜 */}
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        <span className="font-medium">{commit.author}</span>
        <span className="mx-2">•</span>
        <span>{format(new Date(commit.date), 'yyyy-MM-dd HH:mm')}</span>
      </div>

      {/* 브랜치 정보 */}
      <div className="mt-2 flex gap-2">
        <span
          className="px-2 py-1 rounded-full text-xs"
          style={{
            backgroundColor: branchColor + '20',
            color: branchColor,
            border: `1px solid ${branchColor}`,
          }}
        >
          {commit.branch}
        </span>
        {commit.sourceBranch && commit.sourceBranch !== commit.branch && (
          <span
            className="px-2 py-1 rounded-full text-xs"
            style={{
              backgroundColor: getBranchColor(commit.sourceBranch, defaultBranch) + '20',
              color: getBranchColor(commit.sourceBranch, defaultBranch),
              border: `1px solid ${getBranchColor(commit.sourceBranch, defaultBranch)}`,
            }}
          >
            from {commit.sourceBranch}
          </span>
        )}
      </div>

      {/* 통계 정보 */}
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="text-green-500">+{commit.stats.additions}</span>
        <span className="mx-1">/</span>
        <span className="text-red-500">-{commit.stats.deletions}</span>
      </div>
    </div>
  );
};

export default CommitTooltip; 