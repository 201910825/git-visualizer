// GitHub API 관련 설정
export const GITHUB_API_CONFIG = {
  perPage: 100
} as const;

// 날짜 포맷 관련 설정
export const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
} as const;

// 커밋 메시지 패턴
export const COMMIT_PATTERNS = {
  // Pull Request 병합
  pullRequest: {
    pattern: /Merge pull request #(\d+) from ([^/]+)\/([^/\s]+)/,
    sourceBranchGroup: 3,
    numberGroup: 1
  },
  // 일반 브랜치 병합
  mergeBranch: {
    pattern: /Merge branch ['"]([^'"]+)['"](?: into ['"]([^'"]+)['"])?/,
    sourceBranchGroup: 1,
    targetBranchGroup: 2
  },
  // 일반 병합 (develop2 등)
  simpleMerge: {
    pattern: /^(?:merge|Merge) (?:branch )?['"]?([^'"]+)['"]?(?: into ['"]?([^'"]+)['"]?)?/i,
    sourceBranchGroup: 1,
    targetBranchGroup: 2
  },
  // 기능 브랜치
  featureBranch: {
    pattern: /feat[#\s-]*(\d+)/i,
    numberGroup: 1
  },
  // Squash 병합 (GitHub)
  squashMerge: {
    pattern: /\(#(\d+)\)$/,
    numberGroup: 1
  },
  // Squash 병합 (일반)
  squashMergeSimple: {
    pattern: /merged (\d+) commits? into ([^/\s]+) from ([^/\s]+)/i,
    targetBranchGroup: 2,
    sourceBranchGroup: 3,
    numberGroup: 1
  }
} as const; 