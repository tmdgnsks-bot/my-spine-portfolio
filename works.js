/*
 * 내 작업물 목록. assets 폴더에 파일을 올린 뒤 아래 배열에 항목을 추가하세요.
 * type: "spine" | "image" | "gif" | "video" (기존 "sprite"도 지원)
 * Spine: skeleton + atlas + atlas가 참조하는 PNG 파일이 필요합니다. 버전은 4.3.
 * 이미지/GIF/영상: media에 파일 경로를 입력하세요. 영상 썸네일은 thumbnail.
 * sample: true인 항목은 개인 작업과 구분하여 샘플 탭에만 표시합니다.
 * featured: true인 Spine 작업은 첫 화면의 실시간 무대에 표시합니다.
 * 전체 예시는 README.md에 있습니다.
 */
const works = [
  {
    id: "lineage-w-mage",
    title: "리니지W · 마법사 NPC",
    role: "리깅 & 애니메이션",
    tags: ["NPC", "캐릭터", "리깅"],
    description:
      "리니지W 외주 작업. 마법사 튜토리얼 NPC의 리깅과 애니메이션을 담당했습니다.",
    type: "spine",
    skeleton: "assets/nc1/Portrait_NPC_Mento_MA.json",
    atlas: "assets/nc1/Portrait_NPC_Mento_MA.atlas",
    animation: "idle",
    spineVersion: "4.3",
    thumbnail: "assets/nc1/thumbnail.png",
    backgroundColor: "#202923",
    featured: true,
  },
  {
    id: "ar15-study",
    title: "소녀전선 · 캐릭터 스터디",
    role: "리깅 & 애니메이션",
    tags: ["개인 습작", "SD 캐릭터", "액션"],
    description:
      "소녀전선 캐릭터를 활용한 개인 습작입니다. 대기, 이동, 공격 등 다양한 게임 모션을 살펴볼 수 있습니다.",
    type: "spine",
    skeleton: "assets/ar15/AR15.json",
    atlas: "assets/ar15/AR15.atlas",
    animation: "idle",
    spineVersion: "4.3",
    thumbnail: "assets/ar15/thumbnail.png",
    backgroundColor: "#322c37",
    featured: true,
  },
  {
    id: "hk419-motion",
    title: "HK419 · 액션 스터디",
    role: "리깅 & 애니메이션",
    tags: ["개인 습작", "게임 모션", "액션"],
    description:
      "달리기, 걷기, 점프와 스킬 동작을 담은 개인 습작입니다. 애니메이션 메뉴에서 각 클립을 선택해 확인할 수 있습니다.",
    type: "spine",
    skeleton: "assets/11/HK419_SD.json",
    atlas: "assets/11/HK419_SD.atlas",
    animation: "run",
    hideAnimations: ["LR", "up_down"],
    spineVersion: "4.3",
    backgroundColor: "#29343d",
    featured: true,
  },
  {
    id: "burst-sample",
    title: "Burst · GIF 샘플",
    role: "GIF 뷰어 샘플",
    tags: ["GIF", "이펙트", "샘플"],
    description:
      "GIF 형식의 재생을 보여주는 예시입니다. 개인 포트폴리오 작업이 아닌 기존 템플릿의 샘플 파일입니다.",
    type: "gif",
    media: "assets/effect-demo/burst.gif",
    backgroundColor: "#22232b",
    sample: true,
  },
  {
    id: "spineboy-sample",
    title: "Spineboy · 공식 샘플",
    role: "Esoteric Software 공식 예제",
    tags: ["Spine 4.3", "공식 예제", "샘플"],
    description:
      "Esoteric Software의 공식 예제 캐릭터입니다. 개인 작업이 아닌 Spine 뷰어 기능 확인용 샘플입니다.",
    type: "spine",
    skeleton: "assets/spineboy-demo/spineboy-pro.json",
    atlas: "assets/spineboy-demo/spineboy-pma.atlas",
    animation: "walk",
    skin: "default",
    spineVersion: "4.3",
    backgroundColor: "#303032",
    sample: true,
  },
];
