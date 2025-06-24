import React from 'react';
import type { BranchConnectionsProps } from '../../types';

const BranchConnections: React.FC<BranchConnectionsProps> = ({ connections, selectedBranches }) => {
  return (
    <g className="branch-connections">
      {connections.map((connection, index) => (
        <line
          key={`branch-${index}`}
          x1={connection.startX}
          y1={connection.startY}
          x2={connection.endX}
          y2={connection.endY}
          stroke={selectedBranches.includes(connection.branch) ? '#0366d6' : '#d1d5da'}
          strokeWidth={2}
        />
      ))}
    </g>
  );
};

export default BranchConnections; 