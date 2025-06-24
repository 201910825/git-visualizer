import React from 'react';
import type { MergeConnectionsProps } from '../../types';

const MergeConnections: React.FC<MergeConnectionsProps> = ({ connections, selectedBranches }) => {
  return (
    <g className="merge-connections">
      {connections.map((connection, index) => (
        <line
          key={`merge-${index}`}
          x1={connection.startX}
          y1={connection.startY}
          x2={connection.endX}
          y2={connection.endY}
          stroke={selectedBranches.includes(connection.branch) ? '#0366d6' : '#d1d5da'}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      ))}
    </g>
  );
};

export default MergeConnections; 