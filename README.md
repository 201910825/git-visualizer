# 🌳 Git Visualizer

<div align="center">


**🚀Git 커밋 히스토리 시각화 도구**

*GitHub 레포지토리의 브랜치와 커밋을 직관적이고 인터랙티브하게 탐색하세요*

</div>

---

## 📋 목차

- [✨ 주요 기능](#-주요-기능)
- [🎯 기술 스택](#-기술-스택)
- [💻 사용법](#-사용법)

## ✨ 주요 기능

🎨 **인터랙티브 브랜치 시각화**
- 깔끔하고 직관적인 Git 트리 구조
- 실시간 브랜치 전환 및 탐색

📊 **상세한 커밋 정보**
- 커밋 메시지, 작성자, 시간 등 상세 정보
- 파일 변경 통계 및 diff 정보

🔗 **GitHub 통합**
- GitHub API를 통한 실시간 데이터 연동
- Pull Request 정보 및 링크

📱 **반응형 디자인**
- 모든 디바이스에서 완벽한 사용 경험
- 모바일 친화적 UI/UX

## 🎯 기술 스택

### Frontend
- **React 18** - 컴포넌트 기반 UI 라이브러리
- **TypeScript** - 타입 안전성을 위한 정적 타입 검사
- **Vite** - 빠른 개발 환경 및 빌드 도구
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크

### APIs & Services
- **GitHub REST API** - 레포지토리 데이터 fetching
- **React Hooks** - 상태 관리 및 사이드 이펙트 처리

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn 패키지 매니저

### 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/your-username/git-visualizer.git

# 프로젝트 디렉토리로 이동
cd git-visualizer

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 확인하세요! 🎉

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 💻 사용법

1. **레포지토리 URL 입력** 📝
   - GitHub 레포지토리 URL을 입력창에 붙여넣기
   - 예: `https://github.com/facebook/react`

2. **브랜치 선택** 🌿
   - 드롭다운에서 원하는 브랜치 선택
   - 기본값: `main` 또는 `master` 브랜치

3. **커밋 탐색** 🔍
   - 트리에서 커밋 노드 클릭
   - 상세 정보 패널에서 커밋 세부사항 확인

4. **테마 변경** 🎨
   - 상단 토글 버튼으로 다크/라이트 모드 전환

## 🎨 스크린샷

> 📸 스크린샷은 곧 업데이트됩니다!

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 레포지토리를 Fork 하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push 하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

### 개발 가이드라인

- 코드 품질을 위해 ESLint와 Prettier를 사용합니다
- 커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다
- 새로운 기능에는 적절한 타입 정의를 포함해주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">

**⭐ 이 프로젝트가 도움이 되었다면 별표를 눌러주세요!**

Made with ❤️ by [Your Name](https://github.com/your-username)

</div>
