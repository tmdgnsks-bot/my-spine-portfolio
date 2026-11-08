# 전승훈 — Made to move.

밝은 종이색 배경, 큰 타이포그래피, 실시간 캐릭터 무대를 중심으로 새로 만든 Spine 포트폴리오입니다.

**사이트:** https://tmdgnsks-bot.github.io/my-spine-portfolio/

## 구성

- 첫 화면에서 대표 Spine 캐릭터 실시간 재생, 작품 전환, 재생/일시정지
- 실제 작업 / 샘플을 나눈 갤러리, 형식 필터, 제목·설명·태그 검색
- Spine 4.3 JSON·binary, GIF·이미지, MP4·WebM, YouTube·Vimeo 임베드
- 상세 뷰어: 애니메이션·속도 선택, 공식 플레이어의 스킨/재생 컨트롤, 배경 변경, 전체 화면
- 키보드 접근: 카드 버튼, 모달 포커스 제한, Escape 닫기, 좌우 화살표 작품 전환
- 화면 밖 대표 애니메이션 일시정지, 순차 썸네일 캡처 후 WebGL 리소스 정리
- 모바일 화면, 동작 줄이기 설정 지원

프레임워크나 빌드 없이 HTML/CSS/JavaScript로 동작합니다. Google Fonts를 불러오지 못하면 시스템 글꼴을 사용합니다. Spine 런타임은 기존 저장소에 포함된 공식 **4.3.13** 파일을 그대로 사용합니다. 작업물 파일도 보존했습니다.

## 파일 구조

```text
index.html          이름, 소개, 이메일, 페이지 구조
style.css           전체 디자인과 반응형 스타일
script.js           갤러리·실시간 무대·상세 뷰어
works.js            작품 목록 — 새 작업은 이 파일에 추가
assets/             작품별 JSON, atlas, PNG, GIF, 영상
assets/site/        파비콘
vendor/spine-player/ 공식 Spine 4.3 런타임과 스타일
```

## 작품 추가하기

1. GitHub 저장소의 `assets/작품폴더/` 아래 파일을 올립니다.
2. `works.js`를 편집해서 `works` 배열 안에 항목을 추가합니다. 객체 사이의 쉼표를 확인하세요.
3. `main`에 커밋합니다. 기존 GitHub Pages 설정(`main` / root)이 자동으로 배포합니다.

사이트 방문자가 파일을 업로드하는 기능은 없습니다. GitHub 저장소를 통해 작품을 관리합니다. 공개 사이트에 넣는 파일은 누구나 내려받을 수 있습니다.

### Spine 4.3

```js
{
  id: "my-character",                       // 작품마다 다른 값
  title: "캐릭터 이름",
  subtitle: "A story in motion.",            // 선택: 카드의 짧은 보조 문구
  role: "리깅 & 애니메이션",
  tags: ["캐릭터", "액션"],
  description: "작업 내용과 담당 역할을 설명해 주세요.",
  type: "spine",
  skeleton: "assets/my-character/character.json", // .skel도 가능
  atlas: "assets/my-character/character.atlas",
  animation: "idle",                        // 실제 클립 이름; 생략 가능
  spineVersion: "4.3",
  backgroundColor: "#28342b",               // 카드 배경
  // thumbnail: "assets/my-character/cover.webp", // 선택: 로딩 중 표시
  // skin: "default",                       // 선택: 기본 스킨
  // hideAnimations: ["slider-helper"],      // 선택: 메뉴에서 숨길 클립
  // premultipliedAlpha: true,               // 내보내기와 맞추기; 기본 true
  featured: true,                           // 첫 화면 대표 작품에 포함
},
```

- JSON 또는 binary, atlas, atlas에서 참조하는 **모든 PNG 텍스처**가 필요합니다. 기본적으로 같은 폴더에 두세요.
- atlas 안의 이미지 파일명과 실제 이름을 대소문자까지 맞추세요. 경로는 index.html 기준 상대 경로를 권장합니다.
- 에디터와 런타임의 major.minor를 **4.3**으로 맞추세요. 예시 데이터도 공식 런타임으로 파싱해 확인했습니다.
- 썸네일은 화면에 들어올 때 실제 캐릭터를 한 번 렌더링해 캡처합니다. 캡처 이후 임시 플레이어는 정리합니다. 썸네일 캡처가 안 되면 지정한 thumbnail 또는 기본 표시를 사용합니다.
- `hideAnimations` 및 4.3 슬라이더 참조 클립은 선택 메뉴에서 숨깁니다. 클립 데이터는 유지하므로 슬라이더 동작은 보존됩니다.
- `.atlas.txt`도 URL로 명시하면 사용할 수 있습니다. 확장자보다 실제 파일 내용과 참조 경로가 중요합니다.
- WebGL 지원과 JavaScript가 필요합니다. 파일 경로, 버전, 텍스처 불일치 시 뷰어에 오류 안내를 표시합니다.

### GIF 또는 이미지

```js
{
  id: "effect",
  title: "이펙트 작업",
  role: "이펙트 애니메이션",
  tags: ["GIF", "이펙트"],
  description: "작업 설명",
  type: "gif",                             // 정적 이미지는 "image"
  media: "assets/effect/effect.gif",        // PNG, JPG, WebP 등도 가능
  backgroundColor: "#22232b",
},
```

GIF는 브라우저 기본 이미지 재생으로 보여주며 별도의 일시정지·타임라인 기능은 없습니다. 기존 `type: "sprite"` 항목도 이미지 모드로 호환됩니다.

### 동영상

```js
{
  id: "showreel",
  title: "애니메이션 쇼릴",
  role: "리깅 & 애니메이션",
  tags: ["쇼릴"],
  description: "담당한 부분과 작업 내용을 적어주세요.",
  type: "video",
  media: "assets/showreel/showreel.mp4",      // 또는 .webm
  thumbnail: "assets/showreel/cover.webp",
},
```

영상은 자동으로 소리를 내지 않으며 방문자가 재생 버튼을 누릅니다. 브라우저별 코덱 지원을 확인하세요. MP4/H.264가 일반적으로 호환성이 좋습니다. GitHub의 단일 파일 100 MiB 제한과 Pages의 사이트 용량·대역폭 제한을 고려해 큰 영상은 외부 호스팅을 권장합니다. Git LFS를 Pages 미디어 배포 용도로 사용하지 마세요.

YouTube/Vimeo는 media 대신 HTTPS **임베드 주소**를 넣습니다.

```js
type: "video",
embedUrl: "https://www.youtube-nocookie.com/embed/영상ID",
// 또는 https://www.youtube.com/embed/영상ID
// 또는 https://player.vimeo.com/video/영상ID
```

### 샘플 구분

`sample: true`인 항목은 **샘플 탭에서만** 보이며 개인 작업 목록과 구분합니다. 기본 제공 Spineboy는 Esoteric Software 공식 예제이고, burst GIF는 기존 템플릿의 샘플입니다. 개인 작업에는 sample을 생략하거나 false로 두세요.

현재 Video와 GIF · Image 탭에 실제 작업이 없는 것은 정상입니다. 해당 형식의 작품을 추가하면 자동으로 표시됩니다.

## 소개와 디자인 수정

- `index.html`: 이름, 소개글, 이메일. 이메일 링크는 `mailto:주소` 형식을 사용합니다.
- `style.css`의 `:root`: 종이색 `--paper`, 글자색 `--ink`, 포인트색 `--acid`.
- `works.js`: 작품 제목·설명·태그·파일 경로. 헤더의 Work 개수는 자동으로 갱신합니다.
- 파일 교체 직후 캐시가 남아 있으면 새로고침하세요. JS/CSS URL 뒤의 버전 값도 바꿀 수 있습니다.

## 로컬 미리보기

이 폴더에서 아래 명령을 실행합니다.

```sh
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 을 여세요. file://로 직접 열면 Spine 데이터 요청이 차단될 수 있습니다.

## 라이선스와 검증

Spine®은 Esoteric Software의 상표입니다. 런타임과 공식 샘플은 해당 원저작자의 라이선스를 따릅니다. https://esotericsoftware.com/spine-runtimes-license

검증: JavaScript 구문, 데이터 경로, atlas 텍스처 참조, 실제 4.3 런타임의 JSON 파싱, DOM 상호작용을 확인했습니다. 이 작업 환경에는 공유 Chrome 제어 도구가 없어 실제 WebGL 렌더링과 화면별 시각 검증은 수행하지 못했습니다. 실제 기기에서 확인할 수 있도록 GitHub Pages 배포 상태와 공개 파일 응답을 확인합니다.
