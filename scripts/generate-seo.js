#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://gitvisualizer.duckdns.org';
const CURRENT_DATE = new Date().toISOString().split('T')[0];

// Sitemap 자동 생성
const generateSitemap = () => {
  const urls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' },
    { loc: '/guide', changefreq: 'monthly', priority: '0.8' },
    { loc: '/features', changefreq: 'monthly', priority: '0.7' },
    { loc: '/api-docs', changefreq: 'monthly', priority: '0.6' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${DOMAIN}${url.loc}</loc>
    <lastmod>${CURRENT_DATE}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
  console.log('✅ Sitemap.xml 생성 완료');
};

// robots.txt 생성
const generateRobots = () => {
  const robots = `User-agent: *
Allow: /

# Sitemap 위치
Sitemap: ${DOMAIN}/sitemap.xml

# 크롤링 지연 설정
Crawl-delay: 1

# 특정 파일/폴더 차단
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /node_modules/

# 검색엔진별 설정
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: NaverBot
Allow: /`;

  fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robots);
  console.log('✅ robots.txt 생성 완료');
};

// Open Graph 이미지 정보 생성
const generateOGImageInfo = () => {
  const ogInfo = {
    "images": [
      {
        "url": `${DOMAIN}/og-image.jpg`,
        "width": 1200,
        "height": 630,
        "alt": "Git Visualizer - GitHub 레포지토리 시각화 도구"
      },
      {
        "url": `${DOMAIN}/og-repo-image.jpg`,
        "width": 1200,
        "height": 630,
        "alt": "GitHub 레포지토리 분석 결과"
      }
    ],
    "twitter_card": "summary_large_image",
    "created": CURRENT_DATE,
    "domain": DOMAIN
  };

  fs.writeFileSync(
    path.join(__dirname, '../public/og-images.json'), 
    JSON.stringify(ogInfo, null, 2)
  );
  console.log('✅ OG Images 정보 생성 완료');
};

// RSS 피드 생성 (블로그가 있다면)
const generateRSSFeed = () => {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Git Visualizer Blog</title>
    <description>GitHub 레포지토리 시각화 도구 관련 소식과 팁</description>
    <link>${DOMAIN}</link>
    <atom:link href="${DOMAIN}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
    <item>
      <title>Git Visualizer 소개</title>
      <description>GitHub 레포지토리를 시각적으로 분석하는 새로운 방법</description>
      <link>${DOMAIN}</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>${DOMAIN}/posts/introduction</guid>
    </item>
  </channel>
</rss>`;

  fs.writeFileSync(path.join(__dirname, '../public/rss.xml'), rss);
  console.log('✅ RSS 피드 생성 완료');
};

// 메인 실행 함수
const main = () => {
  console.log('🚀 SEO 파일 자동 생성 시작...');
  
  // public 디렉토리 확인
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    generateSitemap();
    generateRobots();
    generateOGImageInfo();
    generateRSSFeed();
    
    console.log('');
    console.log('🎉 모든 SEO 파일 생성 완료!');
    console.log('📋 생성된 파일들:');
    console.log('  - public/sitemap.xml');
    console.log('  - public/robots.txt');
    console.log('  - public/og-images.json');
    console.log('  - public/rss.xml');
    console.log('');
    console.log('📝 다음 단계:');
    console.log('1. Google Search Console에 사이트 등록');
    console.log('2. sitemap.xml 제출');
    console.log('3. Google Analytics 설정');
    console.log('4. OG 이미지 생성 및 업로드');
    
  } catch (error) {
    console.error('❌ SEO 파일 생성 중 오류:', error);
  }
};

// 스크립트 실행
main();

export { generateSitemap, generateRobots, generateOGImageInfo, generateRSSFeed }; 