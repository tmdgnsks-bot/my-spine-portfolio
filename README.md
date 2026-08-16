# 스파인(Spine) 애니메이션 포트폴리오

채용 담당자가 링크 하나만 클릭하면, 실제 스파인 웹 플레이어(공식 스켈레톤 뷰어)로
작업물의 애니메이션·스킨을 직접 재생해볼 수 있는 포트폴리오 갤러리 페이지입니다.

- 프레임워크/빌드 도구 없음 (순수 HTML/CSS/JS) — 어디에나 올리기 쉬움
- 뷰어는 Esoteric Software의 공식 [Spine Web Player](https://en.esotericsoftware.com/spine-player) 사용
- 카드를 클릭하면 모달 창에서 애니메이션/스킨 선택, 재생/일시정지 등 기본 컨트롤 제공
- 스파인 작업물뿐 아니라, 직접 그린 GIF 이펙트 같은 스프라이트 작업물도 같은 갤러리에
  섞어서 올릴 수 있음 (카드에 "스파인" / "이펙트" 배지로 구분됨)

## 폴더 구조

```
spine-portfolio/
├── index.html        ← 페이지 뼈대, 이름/소개/연락처 이 안에서 수정
├── style.css          ← 디자인 (색상 등은 :root 변수에서 한 번에 수정 가능)
├── script.js           ← 갤러리 렌더링 + 뷰어 모달 로직 (보통 수정할 필요 없음)
├── works.js            ← ★ 작업물 목록. 새 작업물은 여기에 추가
└── assets/
    └── spineboy-demo/  ← 샘플 데모 (본인 작업물로 교체/추가)
```

## 1. 로컬에서 미리보기

`index.html`을 더블클릭해서 바로 열면 브라우저 보안 정책(CORS) 때문에
스파인 파일을 못 불러올 수 있습니다. 반드시 로컬 서버로 열어주세요.

```bash
cd spine-portfolio
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

(또는 VS Code의 "Live Server" 확장을 사용해도 됩니다.)

## 2. 본인 작업물 추가하기

1. **스파인 에디터에서 내보내기(Export)**
   - `Export` 창에서 Format을 `Json`(텍스트) 또는 `Binary`(.skel, 용량 작음)로 선택
   - 텍스처 아틀라스(`.atlas` + `.png`)도 함께 팩(pack)해서 내보내기
2. `assets/작업물이름/` 폴더를 새로 만들고 내보낸 파일들(json/skel, atlas, png)을 넣기
3. `works.js` 파일 맨 아래 예시 주석을 참고해서 `works` 배열에 항목 추가
   (제목, 역할, 태그, 설명, 파일 경로, 시작 애니메이션 이름 등)
4. 데모용 `spineboy-demo` 항목은 지워도 되고 그대로 둬도 됩니다.

> ⚠️ 예시를 복사해서 붙여넣을 때는 앞의 `//` 주석 기호를 꼭 지워주세요.
> `//`가 남아있으면 자바스크립트가 텍스트로만 취급해서 카드가 아예 안 뜹니다.

> ⚠️ 유니티에서도 같이 쓰는 아틀라스라면 `.atlas.txt`처럼 확장자에 `.txt`가
> 붙어있을 수 있어요. 웹 플레이어는 정확히 `.atlas` 확장자만 인식하므로,
> 포트폴리오용 폴더에는 `.txt`가 안 붙은 원본 `.atlas` 파일을 넣어야 합니다.

## 3. 스파인이 아닌 작업물(직접 그린 GIF 이펙트 등) 추가하기

스파인 스켈레톤이 아니라 프레임을 직접 그려서 만든 GIF 이펙트, 스프라이트
시퀀스 같은 작업물도 같은 갤러리에 섞어서 올릴 수 있습니다. 이 경우 스파인
웹 플레이어 대신 이미지를 그대로 크게 보여주는 모드로 동작해요.

1. `assets/작업물이름/` 폴더에 완성된 `.gif` 파일 넣기
2. `works.js`에 항목 추가할 때 `skeleton`/`atlas`/`animation`/`spineVersion`
   대신 아래 두 필드를 사용:
   ```js
   type: "sprite",
   media: "assets/작업물이름/파일이름.gif",
   ```
3. 카드에는 "이펙트" 배지가 자동으로 붙어서 스파인 작업물과 구분됩니다.

`effect-demo` 항목이 실제로 작동하는 예시이니 `works.js`와
`assets/effect-demo/burst.gif`를 참고하세요.

## 4. 카드에 미리보기 썸네일 넣기 (권장)

기본 상태에서는 클릭하기 전까지 카드에 재생 버튼 아이콘만 보이고 작업물이
뭔지 안 보입니다. `works.js`의 각 항목에 `thumbnail` 필드를 추가하면
클릭 전에도 미리보기 이미지가 표시돼서 채용 담당자가 카드를 눌러볼 확률이
올라갑니다.

1. 미리보기용 이미지를 준비 (둘 중 하나)
   - **정적 이미지**: 스파인 에디터에서 캡처하거나, 웹 플레이어를 실행해서
     원하는 포즈에서 브라우저 스크린샷을 찍어 `.png`/`.jpg`로 저장
   - **움직이는 미리보기**: 짧은 `.gif`로 만들면 브라우저에서 자동 재생됩니다
     (별도 코드 필요 없음)
2. 그 이미지를 해당 작업물의 `assets/작업물이름/` 폴더 안에 넣기
   (예: `assets/dragon-boss/thumbnail.png`)
3. `works.js`의 해당 항목에 `thumbnail: "assets/dragon-boss/thumbnail.png",` 한 줄 추가
4. 권장 비율은 4:3이며, 용량은 1MB 이하를 추천 (로딩 속도 때문)

데모(`spineboy-demo`) 항목에는 예시로 실제 썸네일 이미지가 이미 적용되어 있으니
`works.js`와 `assets/spineboy-demo/thumbnail.png`를 참고하세요.

## 5. ⚠️ 버전 맞추기 (중요)

스파인 웹 플레이어는 **내보낸 스파인 에디터 버전과 플레이어 런타임 버전이
일치해야** 정상 작동합니다. 버전이 다르면 뷰어에서 에러가 납니다.

이 템플릿은 기본적으로 `vendor/spine-player/` 폴더에 **Spine 4.3.13 버전 런타임을
로컬 파일로 포함**하고 있습니다 (외부 CDN 접속이 막힌 회사 네트워크에서도 항상 동작하도록).
데모 작업물(Spineboy)도 4.3 버전으로 내보낸 파일로 맞춰뒀습니다.
본인 작업물의 스파인 버전이 다르다면 아래처럼 교체하세요.

1. 내보낸 `.json` 파일을 텍스트 에디터로 열어 맨 위쪽
   `"skeleton": { "spine": "4.3.xx", ... }` 부분에서 실제 버전 확인
2. 버전이 다르면 로컬 파일을 새 버전으로 교체:
   ```bash
   npm pack @esotericsoftware/spine-player@4.2   # 원하는 버전으로 교체 (예: 4.2, 4.1 등)
   tar xzf esotericsoftware-spine-player-*.tgz
   cp package/dist/iife/spine-player.min.js vendor/spine-player/
   cp package/dist/spine-player.min.css      vendor/spine-player/
   ```
3. (선택) 로컬 파일 대신 CDN을 쓰고 싶다면 `index.html`의 두 줄을 아래로 교체:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/@esotericsoftware/spine-player@4.3/dist/spine-player.css" />
   <script src="https://unpkg.com/@esotericsoftware/spine-player@4.3/dist/iife/spine-player.js"></script>
   ```

여러 버전으로 작업한 작업물을 함께 보여주고 싶다면, 가장 나중 버전 하나로
통일해서 다시 내보내는 것을 추천합니다 (플레이어는 한 페이지에 한 버전만 로드).

## 6. GitHub Pages로 배포해서 링크 공유하기

1. [github.com](https://github.com)에서 새 저장소(Repository) 생성 (Public)
2. 이 폴더를 그 저장소에 푸시:
   ```bash
   cd spine-portfolio
   git init
   git add .
   git commit -m "스파인 포트폴리오 페이지"
   git branch -M main
   git remote add origin https://github.com/사용자명/저장소명.git
   git push -u origin main
   ```
3. 저장소 페이지에서 **Settings → Pages** 이동
4. **Source**를 `Deploy from a branch`로, **Branch**를 `main` / `(root)`로 설정 후 저장
5. 1~2분 후 `https://사용자명.github.io/저장소명/` 형태의 링크가 생성됨
6. 이 링크를 채용 담당자에게 전달하면 됩니다 (설치 없이 브라우저에서 바로 확인 가능)

> 파일 용량이 큰 텍스처가 많다면 GitHub 저장소 용량 제한(1GB 권장)을 참고해서
> 텍스처 해상도를 조절하거나 필요한 작업물만 선별해서 올리는 것을 추천합니다.

## 7. 커스터마이징

- 이름/한줄소개/연락처: `index.html`의 `<header class="hero">` 안쪽
- 색상 테마: `style.css` 최상단 `:root { ... }` 변수
- 카드 그리드 열 개수: `style.css`의 `.grid { grid-template-columns: ... }`
