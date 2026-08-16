/**
 * ============================================================
 *  작업물(작품) 목록 — 여기에 본인의 스파인 작업물을 추가하세요.
 * ============================================================
 *
 * 1) assets/ 폴더 아래에 작업물별로 폴더를 하나씩 만드세요.
 *    예: assets/dragon-boss/dragon.json, dragon.atlas, dragon.png
 *
 * 2) 스파인 에디터에서 Export 할 때:
 *    - Format: Json (텍스트, 용량 크지만 디버깅 쉬움) 또는 Binary(.skel, 용량 작음)
 *    - Atlas 텍스처를 함께 내보내기 (Pack 체크)
 *    - "Nonessential data 포함" 여부는 취향껏 (포함 시 용량 증가)
 *
 * 3) 아래 works 배열에 항목을 하나 추가하세요. 필드 설명:
 *    id          : 고유 식별자 (영문/숫자, 공백 없이)
 *    title       : 카드에 표시될 작업물 이름
 *    role        : 담당 역할 (예: "리깅 & 애니메이션", "이펙트")
 *    tags        : 검색/필터용 태그 배열
 *    description : 작업물 설명 (짧게)
 *    skeleton    : json 또는 skel 파일 경로
 *    atlas       : atlas 파일 경로
 *    animation   : 처음 재생할 애니메이션 이름 (스파인 에디터에서 확인)
 *    skin        : (선택) 기본으로 보여줄 스킨 이름
 *    backgroundColor : 뷰어 배경색 (16진수 RGBA, 예: "#1a1a2eff")
 *    spineVersion : 이 작업물을 내보낸 스파인 에디터 버전 (예: "4.2"). 참고용 표시.
 *    thumbnail   : (선택) 카드에 보여줄 미리보기 이미지 경로. 클릭하기 전에도
 *                  작업물이 뭔지 보이게 해줌. 없으면 기본 플레이스홀더로 표시됨.
 *                  - 정적 이미지: .png/.jpg (스파인 에디터에서 캡처하거나 스크린샷)
 *                  - 움직이는 미리보기: .gif (브라우저에서 자동 재생됨, 별도 코드 불필요)
 *                  - 권장 비율 4:3, 너무 큰 용량은 로딩이 느려지니 1MB 이하 권장
 *
 * 팁: 스파인 버전은 내보낸 json 파일을 열어 최상단
 *     "skeleton": { "spine": "4.2.33", ... } 부분에서 확인할 수 있습니다.
 */

const works = [
  {
    id: "spineboy-demo",
    title: "Spineboy (데모)",
    role: "샘플 작업물 — 이 카드는 예시입니다",
    tags: ["데모", "액션", "리깅"],
    description:
      "실제 작업물을 추가하기 전 보여주는 샘플입니다. Esoteric Software에서 제공하는 공식 예제 캐릭터로, 본인의 작업물로 교체해서 사용하세요.",
    skeleton: "assets/spineboy-demo/spineboy-pro.json",
    atlas: "assets/spineboy-demo/spineboy-pma.atlas",
    animation: "walk",
    skin: "default",
    backgroundColor: "#14141fff",
    spineVersion: "4.3",
    thumbnail: "assets/spineboy-demo/thumbnail.png",
  },

  {
    id: "Portrait_NPC_Mento_MA",
    title: "리니지w 마법사 튜토리얼 npc",
    role: "리깅 & 애니메이션",
    tags: ["npc캐릭터"],
    description: "리니지w외주 작업",
    skeleton: "assets/nc1/Portrait_NPC_Mento_MA.json",
    atlas: "assets/nc1/Portrait_NPC_Mento_MA.atlas",
    animation: "idle",
    backgroundColor: "#1a1a2eff",
    spineVersion: "4.3",
    thumbnail: "assets/nc1/thumbnail.png",
  },

  {
    id: "AR15",
    title: "소녀전선 습작",
    role: "리깅 & 애니메이션",
    tags: ["플레이어 캐릭터"],
    description: "습작",
    skeleton: "assets/ar15/AR15.json",
    atlas: "assets/ar15/AR15.atlas",
    animation: "idle",
    backgroundColor: "#1a1a2eff",
    spineVersion: "4.3",
    thumbnail: "assets/ar15/thumbnail.png",
   },


  {
    id: "effect-demo",
    title: "버스트 이펙트 (데모)",
    role: "샘플 작업물 — 직접 그린 GIF 이펙트 예시입니다",
    tags: ["이펙트", "GIF", "데모"],
    description:
      "스파인이 아닌, 프레임을 직접 그려서 만든 GIF 이펙트를 올릴 때의 예시입니다. type을 'sprite'로 설정하면 됩니다.",
    type: "sprite",
    media: "assets/effect-demo/burst.gif",
    backgroundColor: "#101018ff",
  },
];
