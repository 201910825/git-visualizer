import { COMMIT_PATTERNS } from '../../config/constants';
import type {
  Position,
  CalculateCommitPositions,
  CalculateBranchConnections,
  CalculateMergeConnections
} from './types';

export const extractPullRequestInfo = (commit: { message: string; branch?: string }, defaultBranch: string) => {
  // PR 병합 커밋 패턴 매칭
  let match = commit.message.match(COMMIT_PATTERNS.pullRequest.pattern);
  if (match) {
    return {
      number: parseInt(match[COMMIT_PATTERNS.pullRequest.numberGroup], 10),
      sourceBranch: match[COMMIT_PATTERNS.pullRequest.sourceBranchGroup],
      targetBranch: defaultBranch,
      status: 'merged' as const
    };
  }

  // 일반 브랜치 병합 패턴 체크
  match = commit.message.match(COMMIT_PATTERNS.mergeBranch.pattern);
  if (match) {
    return {
      number: -1, // 일반 병합은 PR 번호가 없음
      sourceBranch: match[COMMIT_PATTERNS.mergeBranch.sourceBranchGroup],
      targetBranch: match[COMMIT_PATTERNS.mergeBranch.targetBranchGroup] || defaultBranch,
      status: 'merged' as const
    };
  }

  // 단순 병합 패턴 체크
  match = commit.message.match(COMMIT_PATTERNS.simpleMerge.pattern);
  if (match) {
    return {
      number: -1, // 일반 병합은 PR 번호가 없음
      sourceBranch: match[COMMIT_PATTERNS.simpleMerge.sourceBranchGroup],
      targetBranch: match[COMMIT_PATTERNS.simpleMerge.targetBranchGroup] || defaultBranch,
      status: 'merged' as const
    };
  }

  // 기능 브랜치 패턴 체크
  match = commit.message.match(COMMIT_PATTERNS.featureBranch.pattern);
  if (match) {
    return {
      number: parseInt(match[COMMIT_PATTERNS.featureBranch.numberGroup], 10),
      sourceBranch: commit.branch || '',
      targetBranch: defaultBranch,
      status: 'merged' as const
    };
  }

  // Squash 병합 (GitHub) 패턴 체크
  match = commit.message.match(COMMIT_PATTERNS.squashMerge.pattern);
  if (match) {
    return {
      number: parseInt(match[COMMIT_PATTERNS.squashMerge.numberGroup], 10),
      sourceBranch: commit.branch || '',
      targetBranch: defaultBranch,
      status: 'merged' as const
    };
  }

  // Squash 병합 (일반) 패턴 체크
  match = commit.message.match(COMMIT_PATTERNS.squashMergeSimple.pattern);
  if (match) {
    return {
      number: parseInt(match[COMMIT_PATTERNS.squashMergeSimple.numberGroup], 10),
      sourceBranch: match[COMMIT_PATTERNS.squashMergeSimple.sourceBranchGroup],
      targetBranch: match[COMMIT_PATTERNS.squashMergeSimple.targetBranchGroup],
      status: 'merged' as const
    };
  }

  return undefined;
};

// 브랜치 색상 관련 상수
export const BRANCH_COLORS = {
  default: '#3b82f6',    // blue-500 (기본 브랜치 색상)
  develop: '#10b981',    // emerald-500
  feature: '#8b5cf6',    // violet-500
  hotfix: '#ef4444',     // red-500
  release: '#f97316',    // orange-500
  other: '#6b7280',      // gray-500
  warning: '#eab308',    // yellow-500 (리베이스 권장)
  danger: '#ef4444',     // red-500 (리베이스 불가)
  safe: '#22c55e',       // green-500 (리베이스 안전)
} as const;

// 브랜치 색상 가져오기
export function getBranchColor(branchName: string, defaultBranch: string): string {
  const branch = branchName.toLowerCase();
  
  if (branch === defaultBranch.toLowerCase()) {
    return BRANCH_COLORS.default;  // 기본 브랜치는 파란색
  }
  
  for (const [type, color] of Object.entries(BRANCH_COLORS)) {
    if (type !== 'default' && type !== 'other' && branch.startsWith(type)) {
      return color;
    }
  }
  
  return BRANCH_COLORS.other;
}

// 브랜치 상태에 따른 색상 가져오기
export function getBranchStatusColor(branch: string, defaultBranch: string, isPushed: boolean): string {
  if (branch === defaultBranch) {
    return BRANCH_COLORS.default;
  }

  if (isPushed) {
    return BRANCH_COLORS.danger; // 푸시된 브랜치는 리베이스 불가
  }

  return BRANCH_COLORS.safe; // 로컬 브랜치는 리베이스 안전
}

// 브랜치 상태에 따른 툴팁 메시지 가져오기
export function getBranchStatusTooltip(branch: string, defaultBranch: string, isPushed: boolean): string {
  if (branch === defaultBranch) {
    return '메인 브랜치입니다';
  }

  if (isPushed) {
    return '원격에 푸시된 브랜치는 리베이스하지 마세요';
  }

  return '안전하게 리베이스할 수 있습니다';
}

const COMMIT_SPACING = 60;
const BRANCH_SPACING = 50;

export const calculateCommitPositions: CalculateCommitPositions = (commits, branches) => {
  const positions = new Map<string, Position>();
  const branchIndices = new Map<string, number>();

  // 브랜치 인덱스 할당
  branches.forEach((branch, index) => {
    branchIndices.set(branch, index);
  });

  // 커밋 위치 계산
  commits.forEach((commit, index) => {
    const branchIndex = branchIndices.get(commit.branch) || 0;
    positions.set(commit.hash, {
      x: index * COMMIT_SPACING,
      y: branchIndex * BRANCH_SPACING
    });
  });

  return positions;
};

export const calculateBranchConnections: CalculateBranchConnections = (commits, branches, positions) => {
  const connections: Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    branch: string;
  }> = [];

  // 각 브랜치의 연속된 커밋들을 연결
  branches.forEach(branch => {
    const branchCommits = commits.filter(commit => commit.branch === branch);
    
    for (let i = 0; i < branchCommits.length - 1; i++) {
      const currentCommit = branchCommits[i];
      const nextCommit = branchCommits[i + 1];
      
      const startPos = positions.get(currentCommit.hash);
      const endPos = positions.get(nextCommit.hash);
      
      if (startPos && endPos) {
        connections.push({
          startX: startPos.x,
          startY: startPos.y,
          endX: endPos.x,
          endY: endPos.y,
          branch
        });
      }
    }
  });

  return connections;
};

export const calculateMergeConnections: CalculateMergeConnections = (commits, positions) => {
  const connections: Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    branch: string;
  }> = [];

  // 머지 커밋의 부모 커밋들을 연결
  commits.forEach(commit => {
    if (commit.parents.length > 1) {
      const currentPos = positions.get(commit.hash);
      
      commit.parents.forEach(parentHash => {
        const parentPos = positions.get(parentHash);
        
        if (currentPos && parentPos) {
          connections.push({
            startX: parentPos.x,
            startY: parentPos.y,
            endX: currentPos.x,
            endY: currentPos.y,
            branch: commit.branch
          });
        }
      });
    }
  });

  return connections;
}; 