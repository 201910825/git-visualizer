import React, { useMemo, useState } from 'react';
import { GraphBackground } from "../../../ui/graphBackground";
import { PointerHighlight } from "../../../ui/pointer-highlight";
import type { CommitNode } from '../../types';
import { motion } from 'motion/react';

interface CommitNodeWith2DPosition extends CommitNode {
  x: number;
  y: number;
  isMergeCommit: boolean;
  isFirstInBranch: boolean;
  isLastInBranch: boolean;
  timeGroup: string;
  branchOrder: number; // 브랜치 순서
}

interface BranchGraphProps {
  commits: CommitNode[];
  branches: string[];
  defaultBranch: string;
  onCommitClick?: (hash: string) => void;
  isDragging?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
}

// 팀원별 색상
const AUTHOR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

// 브랜치별 색상 (더 구분하기 쉬운 색상)
const BRANCH_COLORS = [
  '#1e40af', // default - 진한 파란색
  '#dc2626', // feature - 빨간색
  '#059669', // bugfix - 녹색
  '#d97706', // hotfix - 주황색
  '#7c3aed', // develop - 보라색
  '#db2777', // release - 핑크색
  '#0891b2', // experimental - 청록색
  '#65a30d', // refactor - 라임색
  '#9333ea', // docs - 자주색
  '#0d9488', // test - 틸색
];

const getAuthorColor = (author: string, authors: string[]) => {
  const index = authors.indexOf(author);
  return AUTHOR_COLORS[index % AUTHOR_COLORS.length];
};

const getBranchColor = (branch: string, branches: string[], defaultBranch: string) => {
  // Default 브랜치는 항상 첫 번째 색상
  if (branch === defaultBranch) return BRANCH_COLORS[0];
  
  // 나머지 브랜치들은 순서대로
  const otherBranches = branches.filter(b => b !== defaultBranch);
  const index = otherBranches.indexOf(branch);
  return BRANCH_COLORS[(index + 1) % BRANCH_COLORS.length];
};

// 시간 그룹 생성 함수
const getTimeGroup = (date: string, groupBy: 'day' | 'week' = 'day') => {
  const commitDate = new Date(date);
  if (groupBy === 'day') {
    return commitDate.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    const weekStart = new Date(commitDate);
    weekStart.setDate(commitDate.getDate() - commitDate.getDay());
    return `${weekStart.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 주`;
  }
};

// 상대 시간 계산
const getRelativeTime = (date: string) => {
  const now = new Date();
  const commitDate = new Date(date);
  const diffMs = now.getTime() - commitDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return commitDate.toLocaleDateString('ko-KR');
  } else if (diffDays > 0) {
    return `${diffDays}일 전`;
  } else if (diffHours > 0) {
    return `${diffHours}시간 전`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}분 전`;
  } else {
    return '방금 전';
  }
};

// 브랜치 타입 추론
const getBranchType = (branchName: string, defaultBranch: string) => {
  if (branchName === defaultBranch) return 'main';
  if (branchName.startsWith('feature/') || branchName.startsWith('feat/')) return 'feature';
  if (branchName.startsWith('bugfix/') || branchName.startsWith('fix/')) return 'bugfix';
  if (branchName.startsWith('hotfix/')) return 'hotfix';
  if (branchName.includes('develop')) return 'develop';
  if (branchName.includes('release')) return 'release';
  return 'other';
};

// Animated 모달 컴포넌트
const CommitAnimatedModal: React.FC<{
  commit: CommitNodeWith2DPosition;
  authors: string[];
  branches: string[];
  defaultBranch: string;
  onClose: () => void;
}> = ({ commit, authors, branches, defaultBranch, onClose }) => {
  const branchType = getBranchType(commit.branch, defaultBranch);
  
  const statIcons = [
    { label: '추가', value: commit.stats.additions, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '➕' },
    { label: '삭제', value: commit.stats.deletions, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: '➖' },
    { label: '총합', value: commit.stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: '📊' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold">
            커밋 상세 정보 {" "}
            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200 text-base">
              {commit.hash}
            </span>{" "}
            📝
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* 커밋 메시지 */}
        <div className="mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              "{commit.message}"
            </p>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className="flex justify-center items-center mb-6 gap-4">
          {statIcons.map((stat,) => (
            <motion.div
              key={stat.label}
              initial={{
                rotate: Math.random() * 10 - 5,
              }}
              whileHover={{
                scale: 1.1,
                rotate: 0,
                zIndex: 100,
              }}
              whileTap={{
                scale: 1.1,
                rotate: 0,
                zIndex: 100,
              }}
              className={`rounded-xl p-4 ${stat.bg} dark:border-neutral-700 border border-neutral-200`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* 작성자 */}
          <div className="flex items-center justify-start">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: getAuthorColor(commit.author, authors) }}
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              👤 {commit.author}
            </span>
          </div>

          {/* 브랜치 */}
          <div className="flex items-center justify-start">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: getBranchColor(commit.branch, branches, defaultBranch) }}
            />
            <span className="text-neutral-700 dark:text-neutral-300 mr-2">
              🌿 {commit.branch}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${
              branchType === 'main' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
              branchType === 'feature' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              branchType === 'bugfix' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
              branchType === 'hotfix' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {branchType}
            </span>
          </div>

          {/* 날짜 */}
          <div className="flex items-center justify-start">
            <span className="text-neutral-700 dark:text-neutral-300">
              📅 {getRelativeTime(commit.date)}
            </span>
          </div>

          {/* 전체 날짜 */}
          <div className="flex items-center justify-start">
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              🕒 {new Date(commit.date).toLocaleString()}
            </span>
          </div>
        </div>

        {/* 전체 해시 */}
        <div className="mb-4">
          <div className="text-center">
            <code className="text-neutral-700 dark:text-neutral-300 text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
              {commit.hash}
            </code>
          </div>
        </div>

        {/* 부모 커밋 */}
        {commit.parents.length > 0 && (
          <div className="mb-4">
            <div className="text-center">
              <span className="text-neutral-700 dark:text-neutral-300 mr-2">
                🔗 부모 커밋:
              </span>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {commit.parents.map((parent, index) => (
                  <code key={index} className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {parent}
                  </code>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 머지 커밋 표시 */}
        {commit.isMergeCommit && (
          <div className="mb-6">
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 inline-block">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400 text-2xl">🔀</span>
                  <span className="text-yellow-800 dark:text-yellow-300 font-medium">머지 커밋</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 푸터 버튼 */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-800"
          >
            GitHub에서 보기
          </button>
          <button 
            onClick={onClose}
            className="bg-black text-white dark:bg-white dark:text-black text-sm px-4 py-2 rounded-md border border-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

// 브랜치 분기점 찾기 함수
const findBranchForkPoint = (branchCommits: CommitNodeWith2DPosition[], baseBranchCommits: CommitNodeWith2DPosition[]) => {
  // 브랜치의 가장 오래된 커밋 찾기
  const oldestBranchCommit = branchCommits.reduce((oldest, commit) => 
    new Date(commit.date) < new Date(oldest.date) ? commit : oldest
  );

  // 베이스 브랜치에서 분기점 찾기 (시간적으로 가장 가까운 이전 커밋)
  const forkPoint = baseBranchCommits.find(baseCommit => {
    const baseTime = new Date(baseCommit.date).getTime();
    const branchTime = new Date(oldestBranchCommit.date).getTime();
    
    // 베이스 커밋이 브랜치 커밋보다 이전이거나 같은 시간
    return baseTime <= branchTime;
  });

  return forkPoint || baseBranchCommits[baseBranchCommits.length - 1]; // 찾지 못하면 베이스 브랜치의 마지막 커밋
};

// 공통 조상 커밋 찾기 (더 정확한 방법)
const findCommonAncestor = (branchCommits: CommitNodeWith2DPosition[], baseBranchCommits: CommitNodeWith2DPosition[]) => {
  // 브랜치의 모든 부모 커밋 해시 수집
  const branchParents = new Set<string>();
  branchCommits.forEach(commit => {
    commit.parents.forEach(parent => branchParents.add(parent));
  });

  // 베이스 브랜치에서 공통 조상 찾기
  const commonAncestor = baseBranchCommits.find(baseCommit => 
    branchParents.has(baseCommit.hash)
  );

  return commonAncestor || findBranchForkPoint(branchCommits, baseBranchCommits);
};

const BranchGraph: React.FC<BranchGraphProps> = ({
  commits,
  branches,
  defaultBranch,
  isDragging = false,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) => {
  const [hoveredCommit, setHoveredCommit] = useState<CommitNodeWith2DPosition | null>(null);
  const [selectedAuthor, ] = useState<string | null>(null);
  const [modalCommit, setModalCommit] = useState<CommitNodeWith2DPosition | null>(null);

  // 팀원 목록 추출
  const authors = useMemo(() => {
    const authorSet = new Set(commits.map(commit => commit.author));
    return Array.from(authorSet).sort();
  }, [commits]);

  // 화면 크기 감지
  const isDesktop = window.innerWidth >= 1024;

  // 브랜치별 레인 할당과 커밋 위치 계산
  const { positioned2DCommits, branchLanes, svgDimensions} = useMemo(() => {
    // 커밋을 날짜순으로 정렬 (최신이 위에)
    const sortedCommits = [...commits].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // 시간 그룹별 커밋 분류
    const timeGroupMap = new Map<string, CommitNode[]>();
    sortedCommits.forEach(commit => {
      const group = getTimeGroup(commit.date);
      if (!timeGroupMap.has(group)) {
        timeGroupMap.set(group, []);
      }
      timeGroupMap.get(group)!.push(commit);
    });

    // 브랜치별 커밋 그룹화
    const commitsByBranch = new Map<string, CommitNode[]>();
    branches.forEach(branch => {
      commitsByBranch.set(branch, sortedCommits.filter(c => c.branch === branch));
    });

    // 브랜치 우선순위 정렬 (Default 브랜치가 맨 왼쪽)
    const sortedBranches = [...branches].sort((a, b) => {
      if (a === defaultBranch) return -1;
      if (b === defaultBranch) return 1;
      
      // 브랜치 타입별 우선순위
      const getTypePriority = (branch: string) => {
        const type = getBranchType(branch, defaultBranch);
        const priorities = { main: 0, develop: 1, release: 2, feature: 3, bugfix: 4, hotfix: 5, other: 6 };
        return priorities[type] || 6;
      };
      
      const priorityA = getTypePriority(a);
      const priorityB = getTypePriority(b);
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      return a.localeCompare(b); // 알파벳 순
    });

    // 브랜치별 레인 할당 (왼쪽부터 순서대로)
    const lanes = new Map<string, number>();
    sortedBranches.forEach((branch, index) => {
      lanes.set(branch, index);
    });

    // 2D 공간 설정 - 화면을 훨씬 크게 
    const laneSpacing = isDesktop ? 200 : 100; // 대폭 증가
    const commitSpacing = isDesktop ? 100 : 60; // 대폭 증가
    const startX = isDesktop ? 350 : 200; 
    const startY = isDesktop ? 120 : 80;
    const timelineWidth = isDesktop ? 300 : 150;

    // 시간순으로 Y 위치 할당을 위한 맵
    const timeToYPosition = new Map<number, number>();
    let currentY = startY;

    // 모든 커밋을 시간순으로 정렬하여 Y 위치 할당
    const allCommitsSortedByTime = [...sortedCommits].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    allCommitsSortedByTime.forEach((commit) => {
      const commitTime = new Date(commit.date).getTime();
      if (!timeToYPosition.has(commitTime)) {
        timeToYPosition.set(commitTime, currentY);
        currentY += commitSpacing;
      }
    });

    // 커밋에 2D 위치 할당 - 시간 기반 Y 좌표 사용
    const positioned: CommitNodeWith2DPosition[] = [];
    const timeGroupPositions: Array<{group: string, y: number, commits: number}> = [];

    // 시간 그룹별로 커밋 배치
    Array.from(timeGroupMap.entries()).forEach(([group, groupCommits]) => {
      const groupYPositions = groupCommits.map(commit => 
        timeToYPosition.get(new Date(commit.date).getTime()) || startY
      );
      const groupStartY = Math.min(...groupYPositions);
      const groupEndY = Math.max(...groupYPositions);
      
      groupCommits.forEach((commit) => {
        const laneIndex = lanes.get(commit.branch) || 0;
        const commitTime = new Date(commit.date).getTime();
        const yPosition = timeToYPosition.get(commitTime) || startY;
        
        // 브랜치별 커밋 목록에서 첫 번째와 마지막 확인
        const branchCommits = commitsByBranch.get(commit.branch) || [];
        const isFirstInBranch = branchCommits.length > 0 && branchCommits[0].hash === commit.hash;
        const isLastInBranch = branchCommits.length > 0 && branchCommits[branchCommits.length - 1].hash === commit.hash;
        
        positioned.push({
          ...commit,
          x: laneIndex * laneSpacing + startX,
          y: yPosition,
          isMergeCommit: commit.parents.length > 1,
          isFirstInBranch,
          isLastInBranch,
          timeGroup: group,
          branchOrder: laneIndex
        });
      });

      timeGroupPositions.push({
        group,
        y: (groupStartY + groupEndY) / 2, // 그룹 중앙
        commits: groupCommits.length
      });
    });

    // 브랜치 레인 정보
    const branchLaneInfo = sortedBranches.map((branch, index) => ({
      branch,
      laneIndex: index,
      x: index * laneSpacing + startX,
      color: getBranchColor(branch, branches, defaultBranch),
      isDefault: branch === defaultBranch,
      type: getBranchType(branch, defaultBranch),
      firstCommitY: positioned.find(c => c.branch === branch)?.y || startY
    }));

    // SVG 크기 계산 - 모바일에 맞게 조정
    const minX = 0;
    const maxX = Math.max(startX + sortedBranches.length * laneSpacing + 300, isDesktop ? 1800 : 1000);
    const svgWidth = maxX;
    const svgHeight = Math.max(currentY + 200, isDesktop ? 1200 : 800);

    console.log('Mobile SVG Debug:', {
      isDesktop,
      sortedBranches: sortedBranches.length,
      positioned: positioned.length,
      svgWidth,
      svgHeight,
      containerHeight: isDesktop ? 'h-screen' : 'h-[100vh]',
      firstCommit: positioned[0] || 'No commits'
    });

    return {
      
      positioned2DCommits: positioned,
      branchLanes: branchLaneInfo,
      svgDimensions: { minX, maxX, svgWidth, svgHeight, startY, timelineWidth, startX },
      timeGroups: timeGroupPositions
    };
  }, [commits, branches, defaultBranch, isDesktop]);

  // 머지 후 연결점 찾기 함수
  const findMergeConnectionPoints = () => {
    const connections: Array<{
      mergeCommit: typeof positioned2DCommits[0];
      targetBranch: string;
      nextCommit?: typeof positioned2DCommits[0];
    }> = [];

    positioned2DCommits.forEach(commit => {
      if (commit.isMergeCommit && commit.parents.length > 1) {
        // 머지된 후 같은 브랜치에서 다음 커밋 찾기
        const nextCommits = positioned2DCommits.filter(c => 
          c.branch === commit.branch && 
          new Date(c.date) > new Date(commit.date)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (nextCommits.length > 0) {
          connections.push({
            mergeCommit: commit,
            targetBranch: commit.branch,
            nextCommit: nextCommits[0]
          });
        }
      }
    });

    return connections;
  };

  // 브랜치 분기선 렌더링
  const renderBranchForkLines = () => {
    const lines: JSX.Element[] = [];
    
    // 베이스 브랜치 커밋들 (보통 main/master/develop)
    const baseBranches = [defaultBranch, 'develop', 'dev', 'main', 'master'];
    const baseBranchName = baseBranches.find(branch => branches.includes(branch)) || defaultBranch;
    const baseBranchCommits = positioned2DCommits.filter(c => c.branch === baseBranchName);
    
    branchLanes.forEach(branchInfo => {
      // 베이스 브랜치는 분기선 그리지 않음
      if (branchInfo.branch === baseBranchName) return;
      
      const branchCommits = positioned2DCommits.filter(c => c.branch === branchInfo.branch);
      if (branchCommits.length === 0) return;
      
      // 분기점 찾기
      const forkPoint = findCommonAncestor(branchCommits, baseBranchCommits);
      if (!forkPoint) return;
      
      const branchFirstCommit = branchCommits[0]; // 브랜치의 첫 번째 커밋
      
      // 실제 분기인 경우만 분기선 그리기 (시간 차이가 있는 경우)
      const timeDiff = Math.abs(new Date(forkPoint.date).getTime() - new Date(branchFirstCommit.date).getTime());
      if (timeDiff < 1000 * 60 * 5) return; // 5분 이내 차이면 분기선 그리지 않음
      
      // 분기선 그리기 (베이스 브랜치 → 피처 브랜치) - 실선으로 변경
      const startX = forkPoint.x;
      const startY = forkPoint.y;
      const endX = branchFirstCommit.x;
      const endY = branchFirstCommit.y;
      
      // 곡선으로 분기선 그리기
      const controlX1 = startX + (endX - startX) * 0.3;
      const controlY1 = startY;
      const controlX2 = startX + (endX - startX) * 0.7;
      const controlY2 = endY;
      
      const path = `M ${startX} ${startY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${endX} ${endY}`;
      
      lines.push(
        <path
          key={`fork-${branchInfo.branch}`}
          d={path}
          stroke={branchInfo.color}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
          // 점선 제거 - 실선으로 변경
        />
      );
      
      // 분기점에 작은 점 표시
      lines.push(
        <circle
          key={`fork-point-${branchInfo.branch}`}
          cx={startX}
          cy={startY}
          r="3"
          fill={branchInfo.color}
          stroke="white"
          strokeWidth="1"
          opacity="0.8"
        />
      );
    });
    
    return lines;
  };

  // 부모-자식 관계 연결선 렌더링 (새로 추가)
  const renderParentChildConnections = () => {
    const lines: JSX.Element[] = [];
    
    positioned2DCommits.forEach(commit => {
      commit.parents.forEach(parentHash => {
        const parentCommit = positioned2DCommits.find(c => c.hash === parentHash);
        if (parentCommit && parentCommit.branch === commit.branch) {
          // 같은 브랜치 내의 부모-자식 관계는 이미 브랜치 라인으로 표시됨
          return;
        }
        
        if (parentCommit && parentCommit.branch !== commit.branch) {
          // 다른 브랜치 간의 부모-자식 관계 (머지, 체리픽 등)
          const color = getBranchColor(commit.branch, branches, defaultBranch);
          
          // 실선으로 부모-자식 관계 표시
          lines.push(
            <line
              key={`parent-child-${parentHash}-${commit.hash}`}
              x1={parentCommit.x}
              y1={parentCommit.y}
              x2={commit.x}
              y2={commit.y}
              stroke={color}
              strokeWidth="2"
              opacity="0.8"
              // 실선
            />
          );
          
          // 연결점 표시
          lines.push(
            <circle
              key={`connection-${parentHash}-${commit.hash}`}
              cx={commit.x}
              cy={commit.y}
              r="2"
              fill={color}
              opacity="0.9"
            />
          );
        }
      });
    });
    
    return lines;
  };

  // 머지 라인 렌더링 (개선된 버전 - 명확한 구분)
  const renderMergeLines = () => {
    const lines: JSX.Element[] = [];
    const mergeConnections = findMergeConnectionPoints();
    
    positioned2DCommits.forEach(commit => {
      if (commit.isMergeCommit && commit.parents.length > 1) {
        commit.parents.forEach(parentHash => {
          const parent = positioned2DCommits.find(c => c.hash === parentHash);
          if (parent && parent.branch !== commit.branch) {
            const color = getBranchColor(parent.branch, branches, defaultBranch);
            
            // 머지 라인: 피처 브랜치 → 메인 브랜치 (굵은 실선 + 화살표)
            const controlX = (parent.x + commit.x) / 2;
            const controlY = (parent.y + commit.y) / 2;
            const path = `M ${parent.x} ${parent.y} Q ${controlX} ${controlY} ${commit.x} ${commit.y}`;
            
            // 그라데이션 정의
            lines.push(
              <defs key={`gradient-${parent.hash}-${commit.hash}`}>
                <linearGradient id={`mergeGradient-${parent.hash}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor={getBranchColor(commit.branch, branches, defaultBranch)} stopOpacity="0.9"/>
                </linearGradient>
                <marker id={`mergeArrow-${parent.hash}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <polygon points="0,0 0,6 9,3" fill={color} />
                </marker>
              </defs>
            );
            
            lines.push(
              <path
                key={`merge-${parent.hash}-${commit.hash}`}
                d={path}
                stroke={`url(#mergeGradient-${parent.hash})`}
                strokeWidth={isDesktop ? "6" : "4"} // 더 굵게
                fill="none"
                opacity="0.9"
                markerEnd={`url(#mergeArrow-${parent.hash})`}
                strokeDasharray="none" // 실선
              />
            );

            // 머지 포인트 표시 (더 크게)
            lines.push(
              <circle
                key={`merge-point-${parent.hash}-${commit.hash}`}
                cx={commit.x}
                cy={commit.y}
                r={isDesktop ? "10" : "7"}
                fill={color}
                stroke="white"
                strokeWidth={isDesktop ? "4" : "3"}
                opacity="0.95"
              />
            );

            // 머지 라벨 (더 명확하게)
            lines.push(
              <rect
                key={`merge-bg-${parent.hash}-${commit.hash}`}
                x={commit.x + (isDesktop ? 15 : 12)}
                y={commit.y - (isDesktop ? 20 : 15)}
                width={isDesktop ? "80" : "60"}
                height={isDesktop ? "24" : "18"}
                fill={color}
                rx="12"
                opacity="0.9"
              />
            );
            
            lines.push(
              <text
                key={`merge-label-${parent.hash}-${commit.hash}`}
                x={commit.x + (isDesktop ? 55 : 42)}
                y={commit.y - (isDesktop ? 4 : 3)}
                textAnchor="middle"
                fontSize={isDesktop ? "11" : "8"}
                fill="white"
                fontWeight="bold"
              >
                🔀 MERGE
              </text>
            );
          }
        });
      }
    });

    // 머지 후 연결선 (pull/fetch 후 새 작업 시작점) - 점선으로 명확히 구분
    mergeConnections.forEach((connection, index) => {
      if (connection.nextCommit) {
        const color = getBranchColor(connection.targetBranch, branches, defaultBranch);
        
        // 화살표 마커 정의
        lines.push(
          <defs key={`pullArrow-${index}`}>
            <marker id={`pullArrow-${index}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <polygon points="0,0 0,6 7,3" fill={color} />
            </marker>
          </defs>
        );
        
        // 머지 커밋에서 다음 커밋으로 연결선 - 점선으로 구분
        lines.push(
          <line
            key={`post-merge-${index}`}
            x1={connection.mergeCommit.x}
            y1={connection.mergeCommit.y}
            x2={connection.nextCommit.x}
            y2={connection.nextCommit.y}
            stroke={color}
            strokeWidth={isDesktop ? "4" : "3"}
            opacity="0.8"
            strokeDasharray={isDesktop ? "10,5" : "8,4"} // 점선으로 구분
            markerEnd={`url(#pullArrow-${index})`}
          />
        );

        // 새 작업 시작점 표시 (다이아몬드 모양으로 구분)
        const size = isDesktop ? 8 : 6;
        lines.push(
          <polygon
            key={`new-work-${index}`}
            points={`${connection.nextCommit.x},${connection.nextCommit.y - size} ${connection.nextCommit.x + size},${connection.nextCommit.y} ${connection.nextCommit.x},${connection.nextCommit.y + size} ${connection.nextCommit.x - size},${connection.nextCommit.y}`}
            fill={color}
            stroke="white"
            strokeWidth={isDesktop ? "3" : "2"}
            opacity="0.9"
          />
        );

        // "PULL & NEW" 라벨 (더 명확하게)
        lines.push(
          <rect
            key={`pull-bg-${index}`}
            x={connection.nextCommit.x + (isDesktop ? 15 : 12)}
            y={connection.nextCommit.y - (isDesktop ? 12 : 9)}
            width={isDesktop ? "100" : "75"}
            height={isDesktop ? "24" : "18"}
            fill={color}
            rx="12"
            opacity="0.8"
            strokeDasharray={isDesktop ? "4,2" : "3,2"}
            stroke="white"
            strokeWidth="1"
          />
        );
        
        lines.push(
          <text
            key={`new-work-label-${index}`}
            x={connection.nextCommit.x + (isDesktop ? 65 : 49)}
            y={connection.nextCommit.y + (isDesktop ? 4 : 3)}
            textAnchor="middle"
            fontSize={isDesktop ? "10" : "7"}
            fill="white"
            fontWeight="bold"
          >
            📥 PULL & NEW
          </text>
        );
      }
    });

    return lines;
  };


  const renderBranchLines = () => {
    const lines: JSX.Element[] = [];
    
    branchLanes.forEach(branchInfo => {
      const branchCommits = positioned2DCommits.filter(c => c.branch === branchInfo.branch);
      if (branchCommits.length < 1) return;

      const firstY = Math.min(...branchCommits.map(c => c.y));
      const lastY = Math.max(...branchCommits.map(c => c.y));
      
      // 굵은 브랜치 라인 (GitKraken 스타일)
      lines.push(
        <line
          key={`${branchInfo.branch}-line`}
          x1={branchInfo.x}
          y1={firstY - 50}
          x2={branchInfo.x}
          y2={lastY + 50}
          stroke={branchInfo.color}
          strokeWidth={isDesktop ? "6" : "4"}
          opacity="0.8"
        />
      );

      // 브랜치 상단 레이블
      lines.push(
        <g key={`header-${branchInfo.branch}`}>
          <rect
            x={branchInfo.x - 60}
            y={firstY - 90}
            width="120"
            height="30"
            fill={branchInfo.color}
            rx="15"
            opacity="0.9"
          />
          <text
            x={branchInfo.x}
            y={firstY - 70}
            textAnchor="middle"
            fontSize={isDesktop ? "12" : "10"}
            fill="white"
            fontWeight="bold"
          >
            {branchInfo.branch.length > 12 ? 
              branchInfo.branch.substring(0, 10) + '...' : 
              branchInfo.branch}
          </text>
        </g>
      );
    });

    return lines;
  };

  // 커밋 노드 렌더링 (더 크고 명확하게)
  const renderCommitNodes = () => {
    return positioned2DCommits.map(commit => {
      const authorColor = getAuthorColor(commit.author, authors);
      const branchColor = getBranchColor(commit.branch, branches, defaultBranch);
      const isHovered = hoveredCommit?.hash === commit.hash;
      const isFiltered = selectedAuthor && selectedAuthor !== commit.author;
      const nodeRadius = isHovered ? 
        (isDesktop ? 25 : 16) : 
        (isDesktop ? 20 : 14); // 훨씬 크게
      
      return (
        <g key={commit.hash}>
          {/* 커밋 원 (훨씬 크게) */}
          <circle
            cx={commit.x}
            cy={commit.y}
            r={nodeRadius}
            fill={authorColor}
            stroke={branchColor}
            strokeWidth={isDesktop ? "5" : "3"}
            opacity={isFiltered ? 0.3 : 1}
            style={{ cursor: 'pointer' }}
            onClick={() => setModalCommit(commit)}
            onMouseEnter={() => setHoveredCommit(commit)}
            onMouseLeave={() => setHoveredCommit(null)}
          />
          
          {/* 머지 커밋 표시 */}
          {commit.isMergeCommit && (
            <>
              <circle
                cx={commit.x}
                cy={commit.y}
                r={nodeRadius * 0.5}
                fill="white"
                opacity={isFiltered ? 0.3 : 1}
              />
              <text
                x={commit.x}
                y={commit.y + 4}
                textAnchor="middle"
                fontSize={isDesktop ? "12" : "8"}
                fill={branchColor}
                fontWeight="bold"
              >
                M
              </text>
            </>
          )}

          {/* 작성자 이니셜 (머지가 아닌 경우) */}
          {!commit.isMergeCommit && (
            <text
              x={commit.x}
              y={commit.y + (isDesktop ? 6 : 4)}
              textAnchor="middle"
              fontSize={isDesktop ? "16" : "12"}
              fill="white"
              fontWeight="bold"
              opacity={isFiltered ? 0.3 : 1}
              style={{ pointerEvents: 'none' }}
            >
              {commit.author.charAt(0).toUpperCase()}
            </text>
          )}

          {/* 커밋 메시지 (오른쪽에 표시) */}
          <text
            x={commit.x + (isDesktop ? 40 : 25)}
            y={commit.y - (isDesktop ? 8 : 5)}
            textAnchor="start"
            fontSize={isDesktop ? "14" : "11"}
            fill="#e5e7eb"
            fontWeight="500"
          >
            {commit.message.split('\n')[0].substring(0, isDesktop ? 50 : 30)}
            {commit.message.split('\n')[0].length > (isDesktop ? 50 : 30) ? '...' : ''}
          </text>

          {/* 커밋 정보 (아래쪽) */}
          <text
            x={commit.x + (isDesktop ? 40 : 25)}
            y={commit.y + (isDesktop ? 12 : 8)}
            textAnchor="start"
            fontSize={isDesktop ? "12" : "9"}
            fill="#9ca3af"
          >
            {commit.author} • {getRelativeTime(commit.date)} • {commit.hash.slice(0, 7)}
          </text>
        </g>
      );
    });
  };

  const containerHeight = isDesktop ? 'h-screen' : 'h-[100vh]'; // 모바일도 전체 화면 높이 사용

  // Git 활동 통계 계산
  const gitActivityStats = useMemo(() => {
    const stats = {
      totalCommits: positioned2DCommits.length,
      totalMerges: positioned2DCommits.filter(c => c.isMergeCommit).length,
      totalAuthors: authors.length,
      totalBranches: branches.length,
      totalAdditions: positioned2DCommits.reduce((sum, c) => sum + c.stats.additions, 0),
      totalDeletions: positioned2DCommits.reduce((sum, c) => sum + c.stats.deletions, 0),
      authorActivity: {} as Record<string, { commits: number, additions: number, deletions: number }>,
      branchActivity: {} as Record<string, { commits: number, merges: number }>,
      timelineActivity: [] as Array<{ date: string, commits: number, additions: number, deletions: number }>
    };

    // 작성자별 활동
    authors.forEach(author => {
      const authorCommits = positioned2DCommits.filter(c => c.author === author);
      stats.authorActivity[author] = {
        commits: authorCommits.length,
        additions: authorCommits.reduce((sum, c) => sum + c.stats.additions, 0),
        deletions: authorCommits.reduce((sum, c) => sum + c.stats.deletions, 0)
      };
    });

    // 브랜치별 활동
    branches.forEach(branch => {
      const branchCommits = positioned2DCommits.filter(c => c.branch === branch);
      stats.branchActivity[branch] = {
        commits: branchCommits.length,
        merges: branchCommits.filter(c => c.isMergeCommit).length
      };
    });

    // 시간별 활동 (최근 7일)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    stats.timelineActivity = last7Days.map(date => {
      const dayCommits = positioned2DCommits.filter(c => 
        c.date.startsWith(date)
      );
      return {
        date,
        commits: dayCommits.length,
        additions: dayCommits.reduce((sum, c) => sum + c.stats.additions, 0),
        deletions: dayCommits.reduce((sum, c) => sum + c.stats.deletions, 0)
      };
    });

    return stats;
  }, [positioned2DCommits, authors, branches]);

  // Git 활동 통계 그래프 컴포넌트
  const GitActivityDashboard = () => {

    return (
      <div className="w-full bg-gray-100/90 dark:bg-black border-t border-cyan-200 dark:border-cyan-600 p-2 sm:p-6 z-10 backdrop-blur-sm">
        <h3 className="text-gray-900 dark:text-white text-sm sm:text-xl font-bold mb-2 sm:mb-6 flex items-center">
          📊 Git 활동 분석
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {/* 전체 통계 - 모바일에서 간소화 */}
          <div className="bg-white dark:bg-black rounded-lg p-2 sm:p-4 border border-cyan-200 dark:border-cyan-600 ">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-2 sm:mb-4 text-xs sm:text-base">📈 통계</h4>
            <div className="grid grid-cols-2 gap-1 sm:gap-4">
              <div className="text-center">
                <div className="text-sm sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">{gitActivityStats.totalCommits}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">커밋</div>
              </div>
              <div className="text-center">
                <div className="text-sm sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">{gitActivityStats.totalMerges}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">머지</div>
              </div>
            </div>
          </div>

          {/* 개발자별 활동 - 모바일에서 간소화 */}
          <div className="bg-white dark:bg-black rounded-lg p-2 sm:p-4 border border-cyan-200 dark:border-cyan-600">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-2 sm:mb-4 text-xs sm:text-base">👥 개발자</h4>
            <div className="space-y-1 sm:space-y-3 max-h-[100px] sm:max-h-[100px] overflow-y-auto">
              {Object.entries(gitActivityStats.authorActivity)
                .sort(([,a], [,b]) => b.commits - a.commits)
                .slice(0, isDesktop ? 10 : 2)
                .map(([author, activity]) => (
                  <div key={author} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-3 flex-1 min-w-0">
                      <div
                        className="w-2 sm:w-3 h-2 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getAuthorColor(author, authors) }}
                      />
                      <span className="text-gray-900 dark:text-white text-xs sm:text-sm truncate">{author.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-3 flex-1 min-w-0">
                      <span className="text-cyan-600 dark:text-cyan-400 text-xs sm:text-sm flex-shrink-0">{activity.commits}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 브랜치별 활동 - 데스크톱에서만 표시 */}
          <div className="bg-white dark:bg-black rounded-lg p-2 sm:p-4 hidden lg:block border border-cyan-200 dark:border-cyan-600">
            <h4 className="text-gray-900 dark:text-white font-semibold mb-2 sm:mb-4 text-xs sm:text-base">🌿 브랜치</h4>
            <div className="space-y-1 min-h-[50%] sm:space-y-3 max-h-16 sm:max-h-64 overflow-y-auto">
              {Object.entries(gitActivityStats.branchActivity)
                .sort(([,a], [,b]) => b.commits - a.commits)
                .slice(0, 3)
                .map(([branch, activity]) => (
                  <div key={branch} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 sm:space-x-3 flex-1 min-w-0">
                      <div
                        className="w-2 sm:w-3 h-2 sm:h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: getBranchColor(branch, branches, defaultBranch) }}
                      />
                      <span className="text-gray-900 dark:text-white text-xs sm:text-sm truncate">{branch}</span>
                    </div>
                    <span className="text-cyan-600 dark:text-cyan-400 text-xs">{activity.commits}c</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full ${containerHeight} overflow-hidden bg-white dark:bg-black flex flex-col`}>
      <GraphBackground />
              {/* GitKraken 스타일 브랜치 사이드바 - 모바일 최적화 */}
        <div className="absolute left-0 top-0 w-60 sm:w-80 h-full bg-white/90 dark:bg-black border-r border-cyan-200 dark:border-cyan-600 z-10 backdrop-blur-sm">
                  {/* 헤더 */}
          <div className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-100/80 dark:bg-black border-b border-cyan-200 dark:border-cyan-600 backdrop-blur-sm">
          <h3 className="text-gray-900 dark:text-white font-semibold text-xs sm:text-sm">BRANCH / TAG</h3>
        </div>
        
        {/* 브랜치 목록 */}
        <div className="p-1 sm:p-2 space-y-1 max-h-[50%] overflow-y-auto">
          {branchLanes.map((branchInfo) => {
            const branchTypeIcon = {
              main: '🏠',
              feature: '⭐',
              bugfix: '🐛',
              hotfix: '🔥',
              develop: '🚧',
              release: '🚀',
              other: '📝'
            }[branchInfo.type];

            const commitCount = positioned2DCommits.filter(c => c.branch === branchInfo.branch).length;

            return (
              <div
                key={branchInfo.branch}
                className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded hover:bg-gray-100 dark:hover:bg-black cursor-pointer transition-colors ${
                  branchInfo.isDefault ? 'bg-gray-100 dark:bg-black' : ''
                }`}
              >
                {/* 브랜치 아이콘 */}
                <div className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 flex items-center justify-center">
                  <div 
                    className="w-2 sm:w-3 h-2 sm:h-3 rounded-sm"
                    style={{ backgroundColor: branchInfo.color }}
                  />
                </div>
                
                {/* 브랜치 정보 */}
                <div className="flex-1 min-w-0">
                  <PointerHighlight>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                  
                    <span className="text-xs">{branchTypeIcon}</span>
                    <span className="text-gray-900 dark:text-white text-xs sm:text-sm font-medium truncate">
                      {branchInfo.branch}
                    </span>
                    {branchInfo.isDefault && (
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900 px-1 rounded hidden sm:inline">
                        DEFAULT
                      </span>
                    )}
                  
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {commitCount} commits
                    </div>
                    
                  </div></PointerHighlight>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 메인 그래프 영역 - 모바일 최적화 */}
      <div 
        className={`ml-60 sm:ml-80 relative overflow-auto ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ height: isDesktop ? 'calc(100vh - 200px)' : 'calc(100vh - 150px)' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <svg
          width={svgDimensions.svgWidth}
          height={svgDimensions.svgHeight}
          className="block"
          viewBox={`${svgDimensions.minX} 0 ${svgDimensions.svgWidth} ${svgDimensions.svgHeight}`}
          preserveAspectRatio="xMidYMin meet"
        >
          {/* 브랜치 라인 */}
          {renderBranchLines()}
          
          {/* 부모-자식 연결선 */}
          {renderParentChildConnections()}
          
          {/* 브랜치 분기선 */}
          {renderBranchForkLines()}
          
          {/* 머지 라인 */}
          {renderMergeLines()}
          
          {/* 커밋 노드 */}
          {renderCommitNodes()}
        </svg>
      </div>

      {/* Git 활동 통계 대시보드 */}
      <GitActivityDashboard />

      {/* 툴팁 */}
      {hoveredCommit && (
        <div
          className="absolute bg-white dark:bg-black text-gray-900 dark:text-white p-2 sm:p-4 rounded-lg shadow-xl border border-cyan-200 dark:border-cyan-600 max-w-xs sm:max-w-md z-20"
          style={{
            left: Math.min(hoveredCommit.x + (isDesktop ? 320 : 240), window.innerWidth - (isDesktop ? 300 : 250)),
            top: hoveredCommit.y + (isDesktop ? 100 : 80),
          }}
        >
          <div className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">{hoveredCommit.message.split('\n')[0]}</div>
          <div className="text-gray-600 dark:text-gray-300 text-xs space-y-1">
            <div className="flex items-center space-x-2">
              <div
                className="w-2 sm:w-3 h-2 sm:h-3 rounded-full"
                style={{ backgroundColor: getAuthorColor(hoveredCommit.author, authors) }}
              />
              <span className="truncate">{hoveredCommit.author}</span>
            </div>
            <div className="truncate">{getBranchType(hoveredCommit.branch, defaultBranch)} • {hoveredCommit.hash.slice(0, 7)}</div>
            <div className="text-xs">{getRelativeTime(hoveredCommit.date)}</div>
            <div className="flex space-x-2 sm:space-x-4 mt-1 sm:mt-2 text-xs">
              <span className="text-cyan-500 dark:text-cyan-400">+{hoveredCommit.stats.additions}</span>
              <span className="text-red-500 dark:text-red-400">-{hoveredCommit.stats.deletions}</span>
              <span className="text-cyan-500 dark:text-cyan-400">{hoveredCommit.stats.total} changes</span>
            </div>
          </div>
                </div>
      )}

      {/* 커밋 상세 모달 */}
      {modalCommit && (
        <CommitAnimatedModal
          commit={modalCommit}
          authors={authors}
          branches={branches}
          defaultBranch={defaultBranch}
          onClose={() => setModalCommit(null)}
        />
      )}
    </div>
  );
};

export default BranchGraph; 