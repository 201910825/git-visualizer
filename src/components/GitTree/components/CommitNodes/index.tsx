import React, { useState, useCallback } from 'react';
import type { CommitNodeWithPosition, CommitNodesProps } from '../../types';
import CommitTooltip from '../CommitTooltip';


const CommitNodes: React.FC<CommitNodesProps> = ({
  commits,
  positions,
  selectedBranches,
  onClick,
  onHover
}) => {
  const [hoveredCommit, ] = useState<CommitNodeWithPosition | null>(null);

  const handleCommitClick = useCallback((hash: string) => {
    onClick(hash);
  }, [onClick]);

  return (
    <>
      <g className="commit-nodes">
        {commits.map(commit => {
          const position = positions.get(commit.hash);
          if (!position) return null;

          const isSelected = selectedBranches.includes(commit.branch);
          
          return (
            <g
              key={commit.hash}
              transform={`translate(${position.x}, ${position.y})`}
              onClick={() => handleCommitClick(commit.hash)}
              onMouseEnter={() => onHover?.(commit)}
              onMouseLeave={() => onHover?.(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={5}
                fill={isSelected ? '#0366d6' : '#d1d5da'}
                stroke={isSelected ? '#0366d6' : '#d1d5da'}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </g>

      {/* 툴크 */}
      {hoveredCommit && (
        <CommitTooltip
          commit={hoveredCommit}
          scale={1}
          viewOffset={{ x: 0, y: 0 }}
          defaultBranch={commits[0].branch}
        />
      )}
    </>
  );
};

export default React.memo(CommitNodes); 