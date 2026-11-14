# 전투 씬 · 1단계

## 기존 프로젝트 분석

- `index.html`, `style.css`, `script.js`, `works.js`로 구성된 정적 사이트입니다. 프레임워크, npm 의존성, 빌드 단계가 없습니다.
- `vendor/spine-player/`의 공식 Spine **4.3.13** 런타임을 기존 갤러리/뷰어가 사용합니다. 전투 씬도 이 WebGL 렌더러를 재사용하며 다른 버전이나 외부 라이브러리를 추가하지 않습니다.
- 작품별 JSON/atlas/PNG 및 미디어는 `assets/작품명/`에 있습니다. 일부 atlas는 여러 PNG 페이지를 참조합니다. 기존 리소스는 변경하지 않았습니다.
- GitHub Pages API 확인 결과 배포 소스는 **main / root**, build type은 legacy입니다. 별도의 Actions 워크플로는 없습니다.
- 메인 히어로, 작업물 필터/검색/상세 뷰어, 소개, 연락처를 유지하고 작업물과 소개 사이에 독립된 전투 섹션을 추가했습니다.

## 변경 파일

- 수정: `index.html` — Battle 메뉴, 씬 마크업, 전용 CSS와 ES module 연결.
- 추가: `battle/config.js` — 리소스, Idle 매핑, 속도(기본 1), 향후 전투 수치.
- 추가: `battle/spine-actor.js` — 4.3 JSON/SKEL 버전 검사, 개별 SpinePlayer 생성, Idle, 오류, 초기화/해제.
- 추가: `battle/scene.js` — 씬 연결, 체력 표시, 초기화, 선택형 진단 표시.
- 추가: `battle/style.css` — 기존 색상/글꼴을 활용한 16:9 반응형 씬과 임시 도형.
- 추가: `battle/README.md`, `assets/battle/**/.gitkeep` — 안내 및 교체용 리소스 폴더.

## 실행

저장소 루트에서:

```sh
python3 -m http.server 8000
```

`http://localhost:8000/#battle`에 접속합니다. ES module을 사용하므로 `file://`로 열지 마세요.
리소스가 없는 기본 상태는 임시 도형 두 개를 표시하며 실패한 파일을 자동 요청하지 않습니다.

## 실제 Spine 리소스 연결

`assets/battle/player/`, `dummy/`에 추출한 JSON 또는 SKEL, atlas, **atlas가 참조하는 모든 PNG**를 넣습니다. 파일명을 임의로 변경하지 마세요. 각 atlas 페이지는 공식 AssetManager가 읽고 atlas URL 기준으로 로딩합니다. 페이지가 여러 개여도 PNG 목록을 코드에 따로 넣을 필요가 없습니다.

`battle/config.js`에서 각각 다음 항목을 실제 파일에 맞게 지정합니다:

```js
skeleton: 'assets/battle/player/실제파일.json', // 또는 .skel
atlas: 'assets/battle/player/실제파일.atlas',
animations: { idle: '추출파일에서 확인한 실제 이름', attack: [], heavy: null, skill: null, dodge: null },
```

더미의 `animations`에는 `idle`, `hit` 항목을 사용합니다. 실제 이름을 추측하지 않으며 Idle 매핑이 없거나 4.3 이외의 리소스면 오류를 표시합니다. Binary는 첫 8바이트 hash 다음 version 문자열을 검사합니다. JSON/SKEL의 major.minor는 4.3이어야 합니다. 정식 4.3 export를 권장합니다.

리깅별 framing은 각 actor의 `viewport`로 조정합니다. 기본값은 자동 bounds와 여백입니다. 필요하면 SpinePlayer의 `x`, `y`, `width`, `height` viewport를 지정해 발 위치와 크기를 맞추세요. 각각의 독립 Canvas이므로 월드 이동/충돌이 들어가는 후속 단계에서는 공통 좌표계 도입을 검토하세요.

`premultipliedAlpha`는 추출 설정에 맞게 지정합니다. `background`는 index.html 기준 이미지 경로 또는 null입니다. UI와 이펙트 이미지는 `assets/battle/ui/`, `effects/`에 둘 수 있으며 이번 단계 UI는 CSS 임시 UI입니다.

경로는 `/assets/...`가 아닌 상대 경로로 씁니다. 코드에서 document.baseURI를 기준으로 해석하므로 `/my-spine-portfolio/` 같은 Pages 하위 경로를 유지합니다.

## 조작과 진단

- 초기화 버튼: 양쪽 Idle 재시작 및 체력 초기화.
- `R`: Battle 영역에 포커스가 있을 때만 초기화. 길게 누른 repeat 입력은 무시합니다.
- `?battleDebug=1#battle`: 양쪽 현재 Idle 이름/로딩 상태를 표시합니다. 기본 방문자에게는 숨깁니다. 이는 개발용 표시 옵션이며 접근 권한 제어는 아닙니다.
- 재생 속도는 기본 **1배**입니다. 리소스 애니메이션의 타이밍을 바꾸지 않습니다.
- 오류는 캐릭터 아래와 콘솔에 표시하며, 해당 캐릭터는 임시 도형으로 남습니다.

## 검증과 제한

Headless Chromium/실제 WebGL로 기본 도형, 모바일 390px 가로 넘침 없음, `/portfolio/` 하위 경로, 진단 패널 기본 숨김, 초기화를 확인했습니다. 테스트 시에만 기존 `mage-girl` 4.3.23 리소스의 실제 `idle`을 양쪽에 연결해 두 Canvas의 Idle 로딩을 확인했습니다. 배포용 설정에는 기존 캐릭터를 임의 매핑하지 않았습니다. 존재하지 않는 파일은 404 오류가 화면에 표시되는지 확인했습니다.

전투 전용 리소스가 없으므로 해당 리소스의 실제 framing 및 SKEL/다중 페이지 WebGL 렌더링은 제공 후 추가 검증해야 합니다. 다중 페이지는 기존 공식 로더 경로를 사용합니다. GitHub Pages 설정은 읽기만 했으며 원격 push나 배포는 수행하지 않았습니다.

## 남은 단계

2. A/S/D/Space 및 터치 입력, 애니메이션 완료 후 Idle, 더미 피격. 현재 조작 안내는 예정 기능이며 공격 버튼은 아직 연결되지 않습니다.
3. Spine Event hit와 fallback 시간의 단일 타격 판정, 대미지/체력, 히트스톱/이펙트/흔들림/넉백.
4. 선입력 유효 시간, 3단 콤보 구간, 캔슬과 개별 믹싱. config의 attacks 값은 이 단계들을 위한 예약 설정이며 현재 작동하는 전투 로직은 아닙니다.
5. 실제 배경/UI 교체, 개발자 토글·속도 조절·타격시점 확인, 성능 조정 및 Pages 배포 후 확인.
