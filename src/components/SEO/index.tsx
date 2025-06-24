import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_SEO = {
  title: 'Git Visualizer - GitHub 레포지토리 시각화 도구',
  description: 'GitHub 레포지토리의 브랜치와 커밋 히스토리를 직관적이고 인터랙티브하게 시각화하는 무료 웹 도구입니다.',
  keywords: 'git visualizer, github, 브랜치 시각화, 커밋 히스토리, git 도구, 개발자 도구',
  image: 'https://gitvisualizer.duckdns.org/og-image.jpg',
  url: 'https://gitvisualizer.duckdns.org',
  type: 'website'
};

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type
}) => {
  useEffect(() => {
    // Title 업데이트
    if (title) {
      document.title = title;
    }

    // Meta 태그 업데이트
    const updateMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) ||
                 document.querySelector(`meta[property="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:') || name.startsWith('twitter:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 기본 메타 태그
    if (description) updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);

    // Open Graph
    if (title) updateMeta('og:title', title);
    if (description) updateMeta('og:description', description);
    if (image) updateMeta('og:image', image);
    if (url) updateMeta('og:url', url);
    if (type) updateMeta('og:type', type);

    // Twitter Card
    if (title) updateMeta('twitter:title', title);
    if (description) updateMeta('twitter:description', description);
    if (image) updateMeta('twitter:image', image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical && url) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    if (canonical && url) {
      canonical.setAttribute('href', url);
    }

  }, [title, description, keywords, image, url, type]);

  return null;
};

// 페이지별 SEO 설정을 위한 훅
export const useSEO = (seoData: SEOProps) => {
  return {
    ...DEFAULT_SEO,
    ...seoData
  };
};

// 레포지토리별 동적 SEO 생성
export const generateRepoSEO = (owner: string, repo: string): SEOProps => {
  return {
    title: `${owner}/${repo} - Git Visualizer로 분석`,
    description: `${owner}/${repo} GitHub 레포지토리의 브랜치 구조와 커밋 히스토리를 시각적으로 분석하고 탐색하세요.`,
    keywords: `${owner}, ${repo}, git visualizer, github 분석, 브랜치 시각화, 커밋 히스토리`,
    url: `https://gitvisualizer.duckdns.org?repo=${owner}/${repo}`,
    image: `https://gitvisualizer.duckdns.org/og-repo-image.jpg`
  };
}; 