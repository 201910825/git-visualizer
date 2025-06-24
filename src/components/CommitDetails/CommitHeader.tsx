import React from 'react';
import { format } from 'date-fns';

interface CommitHeaderProps {
  hash: string;
  message: string;
  author: string;
  date: string;
  repoInfo: {
    owner: string;
    name: string;
  };
}

const CommitHeader: React.FC<CommitHeaderProps> = ({
  hash,
  message,
  author,
  date
}) => {
  const formattedDate = format(new Date(date), 'yyyy-MM-dd HH:mm');
  const shortHash = hash.substring(0, 7);

  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">커밋 정보</h3>
      <div className="space-y-2">
        <div>
          <h4 className="text-base font-medium text-gray-800">{message}</h4>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-600">작성자:</span>
            <span className="text-gray-700">{author}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-600">해시:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-gray-800 font-mono">
            {shortHash}
          </code>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-600">날짜:</span>
          <span className="text-gray-700">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default CommitHeader; 