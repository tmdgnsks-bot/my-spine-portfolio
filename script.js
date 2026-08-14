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
    const card = document.createElement("div");
    card.className = "card";
    const thumbImg = work.thumbnail
      ? `<img src="${work.thumbnail}" alt="${escapeHtml(work.title)} 썸네일" loading="lazy" />`
      : "";
    card.innerHTML = `
      <div class="thumb">${thumbImg}<div class="play-badge">▶</div></div>
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
  modalTitle.textContent = work.title;
  modalDesc.textContent = work.description || "";
  modalTags.textContent = (work.tags || []).join(" · ");
  modalVersion.textContent = work.spineVersion ? `Spine ${work.spineVersion}` : "";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // 이전 플레이어가 있으면 정리 (WebGL 컨텍스트 누수 방지)
  disposePlayer();

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
  if (container) container.innerHTML = "";
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
