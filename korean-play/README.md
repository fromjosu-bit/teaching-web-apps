# 말놀이 · 계정별 국어 학습 기록

아이디·비밀번호로 가입하고, 맞춤법·띄어쓰기·어휘·속담 게임의 학습 기록을 계정에 저장하는 웹 앱입니다.

서비스: https://malnori-korean-play.vercel.app

## 사용

- 아이디: 영문 소문자·숫자 4~20자. 실명 대신 별명을 권장합니다.
- 비밀번호: 8~128자. 분실 시 담당 교사에게 문의하도록 화면에 안내합니다.
- 게임 종류·정답 수·점수·서버 완료 시각 저장. 최근 100판 표시, 전체 통계 집계.
- 다른 기기에서도 같은 아이디로 기록을 확인할 수 있습니다. 공용 기기에서는 로그아웃하세요.
- 이전 브라우저 로컬 기록은 자동 업로드하지 않습니다.

## 개발·배포

Node 24 이상에서 `npm ci`, `npm test`, `npm start`를 실행합니다. 로컬 서버는 http://127.0.0.1:4173 에서 빌드된 dist만 제공합니다. 빌드는 `npm run build`입니다.

Vercel: hyun-3dd8/malnori-korean-play. 빌드 명령 npm run build, 공개 디렉터리 dist. Supabase: 서울 dlytsoxjmgkpgmaqogwo. 별도 서버 환경변수 없이 공개 publishable 키와 RLS를 사용합니다. 테이블 기준선은 supabase/schema.sql입니다.

비밀번호는 Supabase Auth에서 해시로 관리하며 학습 기록에 보관하지 않습니다. TEACHER_GUIDE.md에 분실 대응, SECURITY_REVIEW.md에 검증과 제한을 기록했습니다. 관리자 재설정 도구는 로컬에서만 실행하고 웹 API로 노출하지 않습니다.
