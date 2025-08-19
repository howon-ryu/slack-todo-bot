# 📋 Slack TODO Bot

**Slack에서 마감일이 지난 TODO 작업을 자동으로 알려주는 봇입니다.**

![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

## 🚀 주요 기능

- **📅 마감일 체크**: '진행 중' 상태이면서 마감일이 지난 작업을 자동 감지
- **💬 개인 DM 알림**: 담당자에게 직접 개인 메시지로 알림 전송
- **🕘 자동 스케줄링**: 매일 오전 9시 30분 자동 실행 (GitHub Actions)
- **📝 TODO 파싱**: `[DM채널] TO-DO List` 형식의 메시지 자동 파싱
- **⚡ 서버리스**: Vercel을 통한 무료 24/7 운영

## 📋 사용법

### 1. TODO 리스트 등록
특정 DM에서 다음 형식으로 메시지 전송:
```
[DM채널] TO-DO List
테스트 작업 2025-08-15 진행 중 U08FHVBV1FW
프로젝트 검토 2025-08-10 진행 중 U087XH92HTR
```

### 2. 수동 체크
슬랙에서 `/check_reminders` 명령어 실행

### 3. 자동 알림
매일 오전 9시 30분에 자동으로 마감일 지난 작업 체크 및 알림

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Slack DM      │───▶│  Vercel Function │───▶│   Target Users  │
│ TODO List 입력   │    │   (서버리스)      │    │   개인 DM 알림   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              ▲
                              │
                    ┌──────────────────┐
                    │ GitHub Actions   │
                    │ (매일 9:30 실행) │
                    └──────────────────┘
```

## 🛠️ 기술 스택

- **Backend**: Node.js, @slack/bolt
- **배포**: Vercel (서버리스)
- **스케줄링**: GitHub Actions
- **버전 관리**: Git, GitHub

## 📦 프로젝트 구조

```
slack-todo-bot/
├── api/
│   └── slack.js              # 메인 봇 로직 (Vercel Function)
├── .github/
│   └── workflows/
│       └── daily-reminder.yml # GitHub Actions 스케줄러
├── package.json              # 프로젝트 설정
├── vercel.json              # Vercel 배포 설정
└── README.md                # 프로젝트 문서
```

## 🚀 배포 및 설정

### 1. Vercel 배포

1. GitHub 리포지토리를 Vercel에 연결
2. 자동 배포 완료 후 URL 확인: `https://slack-todo-bot.vercel.app`

### 2. 환경 변수 설정

Vercel 대시보드에서 Environment Variables 추가:
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
```

### 3. 슬랙 앱 설정

**Slash Commands**:
- Command: `/check_reminders`
- Request URL: `https://slack-todo-bot.vercel.app/api/slack`

**Event Subscriptions**:
- Request URL: `https://slack-todo-bot.vercel.app/api/slack`
- Bot Events: `message.channels`

**OAuth & Permissions** - Bot Token Scopes:
- `chat:write`
- `im:write`
- `channels:read`
- `users:read`

### 4. GitHub Actions 스케줄링

자동 스케줄링은 `.github/workflows/daily-reminder.yml`에서 설정:
```yaml
on:
  schedule:
    - cron: '30 0 * * *'  # 매일 한국시간 09:30
```

## 🔍 모니터링

### Vercel 대시보드
- 함수 실행 로그 확인
- 성능 및 에러 모니터링

### GitHub Actions
- 스케줄 실행 이력 확인
- 수동 실행 가능

## 📝 TODO 메시지 형식

봇이 인식하는 메시지 형식:
```
[DM채널] TO-DO List
작업명 YYYY-MM-DD 진행 중 U슬랙사용자ID
```

**조건**:
- `[DM채널] TO-DO List` 제목 포함
- 상태가 '진행 중'인 작업만 처리
- 마감일이 현재 날짜보다 이전인 경우 알림

## 🛡️ 보안

- 환경 변수를 통한 토큰 보안 관리
- DM만 처리하여 채널 스팸 방지
- 슬랙 Signing Secret 검증

## 💰 비용

- **Vercel**: 무료 플랜 사용 (월 사용량 제한 내에서 충분)
- **GitHub Actions**: 무료 플랜 사용 (월 2,000분 제한)
- **총 비용**: **무료** 🎉

## 📄 라이선스

MIT License

## 👤 개발자

- **개발자**: howon-ryu
- **GitHub**: [@howon-ryu](https://github.com/howon-ryu)

---

