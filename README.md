# AIACS Frontend

AI 기반 통합 방어 시스템의 프론트엔드 애플리케이션입니다.

## 🛠 기술 스택

- **Framework**: Next.js (Pages Router)
- **Language**: TypeScript
- **Styling**: CSS, PostCSS
- **HTTP Client**: Axios
- **Linting**: ESLint

## 📁 프로젝트 구조

```
aiacs_frontend/
├── src/
│   ├── pages/             # 라우팅 및 페이지 컴포넌트 (도메인별)
│   ├── components/        # 재사용 가능한 컴포넌트 (도메인별)
│   ├── api/               # API 통신 관련
│   ├── assets/            # 정적 리소스
│   ├── hooks/             # 커스텀 React 훅
│   ├── layout/            # 레이아웃 컴포넌트
│   ├── styles/            # 전역 스타일
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 함수
├── public/                # 정적 파일
└── 설정 파일들
```

## 🔍 도메인 구조

프로젝트는 도메인 중심 아키텍처로 구성되어 있으며, 각 도메인은 `pages`와 `components` 디렉토리에 동일한 이름의 폴더를 가집니다.

### 주요 도메인

#### 1. **Dashboard (대시보드)**

- **경로**: `/dashboard`
- **구성**:
  - `pages/dashboard/` - 대시보드 페이지
  - `components/dashboard/` - 대시보드 관련 컴포넌트

#### 2. **Alerts (알림)**

- **경로**: `/alerts`
- **구성**:
  - `pages/alerts/` - 알림 페이지
  - `components/alerts/` - 알림 관련 컴포넌트

#### 3. **Analytics (분석)**

- **경로**: `/analytics`
- **구성**:
  - `pages/analytics/` - 분석 페이지
  - `components/analytics/` - 분석 관련 컴포넌트

#### 4. **Defense Control (방어 제어)**

- **경로**: `/defense-control`
- **구성**:
  - `pages/defense-control/` - 방어 제어 페이지
  - `components/defense-control/` - 방어 제어 관련 컴포넌트

#### 5. **Radar (레이더)**

- **경로**: `/radar`
- **구성**:
  - `pages/radar/` - 레이더 페이지
  - `components/radar/` - 레이더 관련 컴포넌트

#### 6. **Video Analysis (비디오 분석)**

- **경로**: `/video-analysis`
- **구성**:
  - `pages/video-analysis/` - 비디오 분석 페이지
  - `components/video-analysis/` - 비디오 분석 관련 컴포넌트

#### 7. **Weather (날씨)**

- **경로**: `/weather`
- **구성**:
  - `pages/weather/` - 날씨 페이지
  - `components/weather/` - 날씨 관련 컴포넌트

#### 8. **Settings (설정)**

- **경로**: `/settings`
- **구성**:
  - `pages/settings/` - 설정 페이지
  - `components/settings/` - 설정 관련 컴포넌트

#### 9. **Login (로그인)**

- **경로**: `/login`
- **구성**:
  - `pages/login/` - 로그인 페이지
  - `components/login/` - 로그인 관련 컴포넌트

## 📂 주요 디렉토리 설명

### `src/api/`

- **axios/**: Axios 인스턴스 및 API 메서드 정의
  - `axios.ts`: Axios 인스턴스 설정
  - `axios.methods.ts`: HTTP 메서드 래퍼
  - `index.ts`: API 모듈 export

### `src/hooks/`

커스텀 React 훅들을 저장하는 디렉토리

### `src/layout/`

전체 애플리케이션의 레이아웃 컴포넌트

### `src/types/`

TypeScript 타입 정의 파일

### `src/utils/`

재사용 가능한 유틸리티 함수

## 🚀 시작하기

1. **의존성 설치**

   ```bash
   npm install
   ```

2. **개발 서버 실행**

   ```bash
   npm run dev
   ```

3. **프로덕션 빌드**

   ```bash
   npm run build
   ```

4. **프로덕션 서버 실행**
   ```bash
   npm start
   ```

## 📋 개발 가이드

### 새로운 도메인 추가하기

1. `pages/` 디렉토리에 도메인 폴더 생성
2. `components/` 디렉토리에 동일한 이름의 폴더 생성
3. 해당 도메인의 페이지 컴포넌트는 `pages/도메인명/`에 작성
4. 해당 도메인에서 사용하는 컴포넌트는 `components/도메인명/`에 작성

### 코드 컨벤션

- 컴포넌트는 PascalCase로 작명
- 유틸리티 함수는 camelCase로 작명
- TypeScript를 사용하여 타입 안정성 확보
- ESLint 규칙을 준수

## 📄 라이선스

이 프로젝트는 비공개 프로젝트입니다.

