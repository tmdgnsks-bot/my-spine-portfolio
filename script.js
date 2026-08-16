/**
 * 갤러리 카드 렌더링 + 클릭 시 스파인 웹 플레이어를 모달에 띄우는 로직.
 * works.js 의 `works` 배열을 데이터 소스로 사용합니다.
 */

const grid = document.getElementById("grid");
const overlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalTags = document.getElementById("modal-tags");
const modalVersion = document.getElementById("modal-version");
const closeBtn = document.getElementById("modal-close");

let currentPlayer = null;

function renderGrid() {
  if (!works || works.length === 0) {
    grid.innerHTML = `<div class="empty-state">아직 등록된 작업물이 없습니다. works.js 파일에 작업물을 추가해주세요.</div>`;
    return;
  }

  grid.innerHTML = "";
  works.forEach((work) => {
    const type = work.type || "spine"; // "spine"(기본) 또는 "sprite"(GIF 이펙트 등)
    const card = document.createElement("div");
    card.className = "card";
    const thumbSrc = work.thumbnail || (type === "sprite" ? work.media : null);
    const thumbImg = thumbSrc
      ? `<img src="${thumbSrc}" alt="${escapeHtml(work.title)} 썸네일" loading="lazy" />`
      : "";
    const typeBadgeText = type === "sprite" ? "이펙트" : "스파인";
    card.innerHTML = `
      <div class="thumb">
        ${thumbImg}
        <span class="type-badge type-badge--${escapeHtml(type)}">${typeBadgeText}</span>
        <div class="play-badge">▶</div>
      </div>
      <div class="body">
        <h3>${escapeHtml(work.title)}</h3>
        <p class="role">${escapeHtml(work.role || "")}</p>
        <div class="tags">
          ${(work.tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>
    `;
    card.addEventListener("click", () => openWork(work));
    grid.appendChild(card);
  });
}

function openWork(work) {
  const type = work.type || "spine";

  modalTitle.textContent = work.title;
  modalDesc.textContent = work.description || "";
  modalTags.textContent = (work.tags || []).join(" · ");
  modalVersion.textContent =
    type === "sprite" ? "스프라이트 GIF" : work.spineVersion ? `Spine ${work.spineVersion}` : "";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // 이전 플레이어가 있으면 정리 (WebGL 컨텍스트 누수 방지)
  disposePlayer();

  if (type === "sprite") {
    openSpriteViewer(work);
  } else {
    openSpineViewer(work);
  }
}

function openSpineViewer(work) {
  currentPlayer = new spine.SpinePlayer("player-container", {
    skeleton: work.skeleton,
    atlas: work.atlas,
    animation: work.animation,
    skin: work.skin,
    premultipliedAlpha: true,
    showControls: true,
    backgroundColor: work.backgroundColor || "#101018ff",
    success: function (player) {
      // 로드 성공. 필요하면 여기서 player.animationState 등에 접근 가능.
    },
    error: function (player, msg) {
      document.getElementById("player-container").innerHTML =
        `<div style="color:#ff8080;padding:24px;font-size:13px;">스켈레톤을 불러오지 못했습니다: ${escapeHtml(
          msg
        )}<br><br>스파인 웹 플레이어 버전과 내보낸 파일의 버전이 일치하는지 확인해주세요.</div>`;
    },
  });
}

function openSpriteViewer(work) {
  // 스파인이 아닌 GIF 등 프레임 시퀀스 이펙트를 그대로 크게 보여줌 (별도 재생 컨트롤 불필요, GIF가 자동 재생됨)
  const container = document.getElementById("player-container");
  const src = work.media || work.thumbnail;
  container.style.background = work.backgroundColor || "#101018ff";
  if (!src) {
    container.innerHTML = `<div style="color:#ff8080;padding:24px;font-size:13px;">표시할 이미지(media 또는 thumbnail) 경로가 없습니다.</div>`;
    return;
  }
  container.innerHTML = `<img src="${src}" alt="${escapeHtml(
    work.title
  )}" style="max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;" />`;
  container.classList.add("sprite-mode");
}

function disposePlayer() {
  if (currentPlayer && typeof currentPlayer.dispose === "function") {
    try {
      currentPlayer.dispose();
    } catch (e) {
      /* noop */
    }
  }
  currentPlayer = null;
  const container = document.getElementById("player-container");
  if (container) {
    container.innerHTML = "";
    container.style.background = "";
    container.classList.remove("sprite-mode");
  }
}

function closeModal() {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  disposePlayer();
}

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

renderGrid();
