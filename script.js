/**
 * 갤러리 카드 렌더링 + 클릭 시 스파인 웹 플레이어(또는 이미지/영상)를 모달에 띄우는 로직.
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
    const type = work.type || "spine"; // "spine"(기본) · "sprite"(GIF 이펙트) · "video"(녹화 영상)
    const card = document.createElement("div");
    card.className = "card";
    const thumbSrc = work.thumbnail || (type === "sprite" ? work.media : null);
    const thumbImg = thumbSrc
      ? `<img src="${thumbSrc}" alt="${escapeHtml(work.title)} 썸네일" loading="lazy" />`
      : "";
    const typeBadgeText = type === "sprite" ? "이펙트" : type === "video" ? "영상" : "스파인";
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
    type === "sprite"
      ? "스프라이트 GIF"
      : type === "video"
      ? "동영상"
      : work.spineVersion
      ? `Spine ${work.spineVersion}`
      : "";

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // 이전 플레이어가 있으면 정리 (WebGL 컨텍스트 누수 방지)
  disposePlayer();

  if (type === "sprite") {
    openSpriteViewer(work);
  } else if (type === "video") {
    openVideoViewer(work);
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
      applyAnimationFilter(player, work);
    },
    error: function (player, msg) {
      document.getElementById("player-container").innerHTML =
        `<div style="color:#ff8080;padding:24px;font-size:13px;">스켈레톤을 불러오지 못했습니다: ${escapeHtml(
          msg
        )}<br><br>스파인 웹 플레이어 버전과 내보낸 파일의 버전이 일치하는지 확인해주세요.</div>`;
    },
  });
}

/**
 * 애니메이션 목록(플레이어 하단 메뉴)에서 일부 클립을 숨김.
 *  - 스파인 4.3 슬라이더가 사용하는 애니메이션은 자동으로 숨깁니다.
 *    (슬라이더용 클립은 단독 재생하면 실제 스파인과 다르게 보이기 때문)
 *  - works.js 항목에 hideAnimations: ["이름1", "이름2"] 를 적으면 그 클립도 숨깁니다.
 * 숨겨진 클립도 스켈레톤 안에는 그대로 있어서 슬라이더 동작에는 영향이 없습니다.
 */
function applyAnimationFilter(player, work) {
  try {
    const data = player.skeleton.data;
    const hidden = new Set(work.hideAnimations || []);

    (data.constraints || []).forEach((c) => {
      const isSlider =
        (spine.SliderData && c instanceof spine.SliderData) ||
        (c.animation && typeof c.animation === "object" && "additive" in c && "property" in c);
      if (isSlider && c.animation && c.animation.name) hidden.add(c.animation.name);
    });

    if (hidden.size === 0) return;
    const visible = data.animations.map((a) => a.name).filter((n) => !hidden.has(n));
    if (visible.length === 0) return;

    player.config.animations = visible; // 플레이어의 애니메이션 목록 화이트리스트
    if (player.config.animation && hidden.has(player.config.animation)) {
      player.config.animation = visible[0];
      player.setAnimation(visible[0]);
    }
    if (visible.length <= 1 && player.animationButton) {
      player.animationButton.classList.add("spine-player-hidden");
    }
  } catch (e) {
    /* 필터 실패 시 기본 동작(전체 표시)으로 둠 */
  }
}

function openSpriteViewer(work) {
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

function openVideoViewer(work) {
  const container = document.getElementById("player-container");
  container.style.background = work.backgroundColor || "#000000ff";

  if (work.embedUrl) {
    container.innerHTML = `<iframe src="${work.embedUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    return;
  }
  if (work.media) {
    container.innerHTML = `<video src="${work.media}" controls autoplay loop playsinline style="max-width:100%;max-height:100%;"></video>`;
    container.classList.add("sprite-mode");
    // 소리 켠 상태로 자동재생 시도. 브라우저가 막으면 음소거로 재생 (사용자가 컨트롤에서 직접 소리 켤 수 있음)
    const video = container.querySelector("video");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }
    return;
  }
  container.innerHTML = `<div style="color:#ff8080;padding:24px;font-size:13px;">재생할 영상(media 또는 embedUrl)이 지정되지 않았습니다.</div>`;
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
