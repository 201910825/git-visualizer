// Google Analytics 설정
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // 실제 GA ID로 교체

// Google Analytics 초기화
export const initGA = () => {
  if (typeof window === 'undefined') return;

  // Google Analytics 스크립트 로드
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  document.head.appendChild(script1);

  // gtag 설정
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// 페이지뷰 추적
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

// 이벤트 추적
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 레포지토리 분석 이벤트
export const trackRepoAnalysis = (owner: string, repo: string) => {
  trackEvent('analyze_repository', 'repository', `${owner}/${repo}`);
};

// 브랜치 선택 이벤트
export const trackBranchSelection = (branchName: string) => {
  trackEvent('select_branch', 'navigation', branchName);
};

// 커밋 클릭 이벤트
export const trackCommitClick = (commitHash: string) => {
  trackEvent('click_commit', 'navigation', commitHash);
};

// 성능 측정
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance', 'timing', metric, Math.round(value));
};

// 에러 추적
export const trackError = (error: string, context?: string) => {
  trackEvent('error', 'exception', `${context || 'unknown'}: ${error}`);
}; 