# 수업용 웹 앱

말놀이, 교실 타이머, PDF 글자 수 도구의 공개 소스입니다. 일기장과 사용자 데이터는 포함하지 않습니다.

- `korean-play`: `npm start`로 로컬 실행, `npm test`로 문항 검사. 외부 의존성 없음.
- `classroom-toolbox`: 정적 타이머·스톱워치·현재 시각.
- `pdf-character-counter`: 브라우저 PDF 텍스트 추출. PDF.js를 jsDelivr에서 로드하므로 인터넷 연결과 CDN 신뢰가 필요합니다.

각 폴더를 정적 호스팅할 수 있습니다. 도구함에서 PDF 도구로 연결하려면 현재 폴더 구조를 유지하세요. 말놀이 서버는 로컬 미리보기 전용입니다. 별도 빌드나 환경변수가 필요하지 않습니다.

`SECURITY_REVIEW.md`에 공개 전 검토 범위와 잔여 제한을 기록했습니다. 소스 공개는 서비스 배포나 전체 기능 검증을 의미하지 않습니다.

## 배포 주소

- 허브: https://fromjosu-bit.github.io/teaching-web-apps/
- 타이머: https://fromjosu-bit.github.io/teaching-web-apps/classroom-toolbox/#/timer
- Firebase 일기장: https://haru-diary-fromjosu-20261017.web.app

일기장 카드는 외부 Firebase 앱에 연결합니다. 일기장 소스와 기록은 이 공개 저장소에 포함하지 않습니다.

국어 미니게임 말놀이: https://malnori-korean-play.vercel.app — 아이디 가입과 계정별 학습 기록 저장을 지원합니다.
