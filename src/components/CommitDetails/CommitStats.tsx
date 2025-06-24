import React from 'react';
import type { CommitStats } from '../GitTree/types';

interface CommitStatsViewProps {
  stats: CommitStats;
}

const CommitStatsView: React.FC<CommitStatsViewProps> = ({ stats }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">변경 사항</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600">추가</div>
          <div className="text-lg font-semibold text-emerald-600">+{stats.additions}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600">삭제</div>
          <div className="text-lg font-semibold text-rose-600">-{stats.deletions}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600">전체</div>
          <div className="text-lg font-semibold text-indigo-600">{stats.total}</div>
        </div>
      </div>
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-red-500"
          style={{
            width: '100%',
            backgroundSize: `${(stats.additions / stats.total) * 100}% 100%`,
          }}
        />
      </div>
    </div>
  );
};

export default CommitStatsView; 