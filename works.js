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
  },

  // 아래에 본인 작업물을 추가하세요. 예시:
  //
  // {
  //   id: "dragon-boss",
  //   title: "드래곤 보스 몬스터",
  //   role: "리깅 & 애니메이션",
  //   tags: ["몬스터", "보스", "메시 디포밍"],
  //   description: "모바일 RPG용 보스 몬스터. IK 기반 날개 애니메이션과 메시 디포밍을 활용했습니다.",
  //   skeleton: "assets/dragon-boss/dragon.json",
  //   atlas: "assets/dragon-boss/dragon.atlas",
  //   animation: "idle",
  //   backgroundColor: "#1a1a2eff",
  //   spineVersion: "4.2",
  // },
];
