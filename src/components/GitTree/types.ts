// 커밋 통계 타입
export interface CommitStats {
  additions: number;
  deletions: number;
  total: number;
}

// 기본 커밋 타입
export interface CommitNode {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  sourceBranch: string;
  parents: string[];
  stats: CommitStats;
  isPushed: boolean;
}

// 저장소 데이터 타입
export interface RepositoryData {
  owner: string;
  repo: string;
  commits: CommitNode[];
  branches: string[];
  defaultBranch: string;
}

// 위치 정보가 포함된 커밋 타입
export interface CommitNodeWithPosition {
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  sourceBranch: string;
  parents: string[];
  stats: CommitStats;
  isPushed: boolean;
  x: number;
  y: number;
  isMergeCommit: boolean;
}

// PR 정보 타입
export interface PullRequest {
  number: number;
  title: string;
  state: string;
  base: string;
  head: string;
  mergeCommitSha: string | null;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
}

// 저장소 정보 타입
export interface RepoInfo {
  owner: string;
  name: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface CommitPosition {
  hash: string;
  position: Position;
}

export interface Connection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  branch: string;
}

export interface BranchConnectionsProps {
  connections: Connection[];
  selectedBranches: string[];
}

export interface MergeConnectionsProps {
  connections: Connection[];
  selectedBranches: string[];
}

export interface CommitNodesProps {
  commits: CommitNodeWithPosition[];
  positions: Map<string, Position>;
  selectedBranches: string[];
  onClick: (hash: string) => void;
  onHover?: (commit: CommitNodeWithPosition | null) => void;
}

// 유틸리티 함수 타입
export type CalculateCommitPositions = (
  commits: CommitNodeWithPosition[],
  branches: string[]
) => Map<string, Position>;

export type CalculateBranchConnections = (
  commits: CommitNodeWithPosition[],
  branches: string[],
  positions: Map<string, Position>
) => Connection[];

export type CalculateMergeConnections = (
  commits: CommitNodeWithPosition[],
  positions: Map<string, Position>
) => Connection[]; 