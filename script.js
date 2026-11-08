"use strict";

const $ = (selector) => document.querySelector(selector);
const allWorks = Array.isArray(works) ? works : [];
const featuredWorks = allWorks.filter(
  (work) => work.featured && (work.type || "spine") === "spine",
);
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const state = {
  filter: "all",
  query: "",
  heroIndex: 0,
  heroPlayer: null,
  heroToken: 0,
  heroManualPause: false,
  viewerPlayer: null,
  viewerToken: 0,
  viewerMediaIndex: -1,
  currentWork: null,
  viewerWorks: [],
  focusBeforeViewer: null,
};
const viewer = $("#work-viewer");
const media = $("#viewer-media");
const snapshotCache = new Map();
const snapshotQueue = [];
let snapshotBusy = false;
let snapshotObserver;

function formatType(work) {
  const type = work.type || "spine";
  if (type === "spine") return "SPINE 4.3";
  if (type === "video") return "VIDEO";
  if (
    type === "gif" ||
    (type === "sprite" && /\.gif(?:[?#]|$)/i.test(work.media || ""))
  )
    return "GIF";
  return "IMAGE";
}
function isSpine(work) {
  return (work.type || "spine") === "spine";
}
function setText(selector, value) {
  $(selector).textContent = value || "";
}
function destroyPlayer(player) {
  if (player) {
    try {
      player.dispose();
    } catch (error) {
      console.warn("Player disposal failed", error);
    }
  }
}
function playerConfig(work, extra = {}) {
  return {
    skeleton: work.skeleton,
    atlas: work.atlas,
    ...(work.animation ? { animation: work.animation } : {}),
    ...(work.skin ? { skin: work.skin } : {}),
    premultipliedAlpha: work.premultipliedAlpha ?? true,
    alpha: true,
    backgroundColor: "#00000000",
    fullScreenBackgroundColor: "#202721",
    showControls: false,
    showLoading: false,
    interactive: false,
    viewport: { padLeft: "7%", padRight: "7%", padTop: "8%", padBottom: "8%" },
    ...extra,
  };
}
function visibleAnimations(player, work) {
  const data = player.skeleton.data;
  const hidden = new Set(work.hideAnimations || []);
  // 4.3 slider constraint clips are implementation details, rather than playable motions.
  (data.constraints || []).forEach((constraint) => {
    if (
      (window.spine.SliderData &&
        constraint instanceof window.spine.SliderData) ||
      (constraint.animation &&
        typeof constraint.animation === "object" &&
        "additive" in constraint &&
        "property" in constraint)
    ) {
      if (constraint.animation?.name) hidden.add(constraint.animation.name);
    }
  });
  const animations = data.animations.filter(
    (animation) => !hidden.has(animation.name),
  );
  return animations.length ? animations : data.animations;
}
function syncHeroPlayback() {
  const player = state.heroPlayer;
  if (!player?.skeleton) return;
  // Only an explicit click on the preview's pause button changes playback.
  // Avoid calling play() again while it is running so the current track is preserved.
  if (state.heroManualPause && !player.paused) player.pause();
  else if (!state.heroManualPause && player.paused) player.play();
  setText("#hero-status", player.paused ? "미리보기 일시정지" : "● 재생 중");
  $("#hero-pause").textContent = player.paused ? "▷" : "Ⅱ";
  $("#hero-pause").setAttribute(
    "aria-label",
    player.paused ? "미리보기 재생" : "미리보기 일시정지",
  );
}
function changeHero(index) {
  if (!featuredWorks.length) return;
  const token = ++state.heroToken;
  destroyPlayer(state.heroPlayer);
  state.heroPlayer = null;
  $("#hero-player").replaceChildren();
  state.heroIndex = (index + featuredWorks.length) % featuredWorks.length;
  state.heroManualPause = false;
  const work = featuredWorks[state.heroIndex];
  setText("#hero-title", work.title);
  $("#hero-stage").style.background = work.heroBackground || "#627365";
  const poster = $("#hero-poster");
  poster.classList.remove("is-loaded");
  if (work.thumbnail) {
    poster.src = work.thumbnail;
    poster.alt = work.title + " 미리보기";
    poster.hidden = false;
  } else poster.hidden = true;
  $("#hero-error").hidden = true;
  $("#hero-pause").disabled = true;
  $("#hero-dots")
    .querySelectorAll("button")
    .forEach((button, i) => {
      button.classList.toggle("is-active", i === state.heroIndex);
      button.setAttribute("aria-pressed", String(i === state.heroIndex));
    });
  setText("#hero-status", "미리보기 불러오는 중");
  function error() {
    if (token !== state.heroToken) return;
    setText("#hero-status", "미리보기");
    setText(
      "#hero-error",
      "실시간 미리보기를 불러오지 못했습니다. 자세히 보기에서 다시 시도해 주세요.",
    );
    $("#hero-error").hidden = false;
    poster.classList.remove("is-loaded");
  }
  if (!window.spine?.SpinePlayer) {
    error();
    return;
  }
  try {
    state.heroPlayer = new window.spine.SpinePlayer(
      $("#hero-player"),
      playerConfig(work, {
        viewport: {
          padLeft: "1%",
          padRight: "1%",
          padTop: "1%",
          padBottom: "1%",
        },
        success(player) {
          if (token !== state.heroToken) return;
          poster.classList.add("is-loaded");
          setText("#hero-status", "● 재생 중");
          $("#hero-pause").disabled = false;
          // Success may be synchronous in mocked/cached runtimes.
          state.heroPlayer = player;
          const track = player.animationState.getTrack(0);
          if (track) track.loop = true;
          syncHeroPlayback();
        },
        error,
      }),
    );
  } catch (cause) {
    error();
  }
}
function makePlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "card-placeholder";
  placeholder.setAttribute("aria-hidden", "true");
  // A deliberately abstract rig marker while the actual character preview loads.
  placeholder.innerHTML =
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1"><path d="M50 12v32L25 65l25 22 25-22-25-21M25 65 18 89m57-24 7 24M50 44 21 36m29 8 29-8"/><circle cx="50" cy="12" r="7"/><circle cx="50" cy="44" r="4"/><circle cx="25" cy="65" r="4"/><circle cx="75" cy="65" r="4"/><circle cx="50" cy="87" r="4"/><path d="M8 8h12M8 8v12m84-12H80m12 0v12M8 92h12M8 92V80m84 12H80m12 0V80" opacity=".45"/></svg><span>CHARACTER PREVIEW</span>';
  return placeholder;
}
function filteredWorks() {
  const query = state.query.toLocaleLowerCase("ko");
  return allWorks.filter((work) => {
    if (state.filter === "sample") {
      if (!work.sample) return false;
    } else if (work.sample) return false;
    if (state.filter === "spine" && !isSpine(work)) return false;
    if (
      state.filter === "image" &&
      !["image", "gif", "sprite"].includes(work.type)
    )
      return false;
    if (state.filter === "video" && work.type !== "video") return false;
    return (
      !query ||
      [work.title, work.description, work.role, ...(work.tags || [])]
        .join(" ")
        .toLocaleLowerCase("ko")
        .includes(query)
    );
  });
}
function attachPoster(preview, work, number) {
  preview.append(makePlaceholder());
  const src =
    work.thumbnail ||
    (!isSpine(work) && work.type !== "video" ? work.media : null);
  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    preview.append(image);
  }
  if (isSpine(work) && !work.thumbnail) {
    if (snapshotCache.has(work.id))
      setSnapshot(preview, snapshotCache.get(work.id));
    else if (snapshotObserver) {
      preview._work = work;
      snapshotObserver.observe(preview);
    }
  }
  const index = document.createElement("span");
  index.className = "card-number";
  index.textContent = String(number).padStart(2, "0");
  const kind = document.createElement("span");
  kind.className = "card-kind";
  kind.textContent = isSpine(work) ? "SPINE" : formatType(work);
  const arrow = document.createElement("span");
  arrow.className = "card-open";
  arrow.textContent = "↗";
  if (work.mediaItems?.length > 1)
    kind.textContent += " · " + work.mediaItems.length;
  preview.append(index, kind, arrow);
  if (work.sample) {
    const sample = document.createElement("span");
    sample.className = "card-sample";
    sample.textContent = "SAMPLE / NOT PERSONAL WORK";
    preview.append(sample);
  }
}
function renderWorks() {
  if (snapshotObserver) snapshotObserver.disconnect();
  const grid = $("#work-grid");
  grid.replaceChildren();
  const items = filteredWorks();
  $("#sample-notice").hidden = state.filter !== "sample";
  $("#empty-state").hidden = items.length > 0;
  setText(
    "#result-count",
    `${String(items.length).padStart(2, "0")} ${items.length === 1 ? "WORK" : "WORKS"}`,
  );
  setText("#work-total", allWorks.filter((work) => !work.sample).length);
  if (!items.length) {
    setText(
      "#empty-title",
      !state.query && state.filter === "video"
        ? "영상 작업이 아직 등록되지 않았습니다."
        : !state.query && state.filter === "image"
          ? "GIF · 이미지 작업이 아직 등록되지 않았습니다."
          : "검색 결과가 없습니다.",
    );
    setText(
      "#empty-description",
      !state.query && ["video", "image"].includes(state.filter)
        ? "다른 형식의 작업물을 먼저 만나보세요. GIF 샘플은 샘플 탭에서 볼 수 있습니다."
        : "다른 검색어나 형식을 선택해 보세요.",
    );
  }
  items.forEach((work, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.setAttribute(
      "aria-label",
      `${work.title} — ${formatType(work)} 작품 열기`,
    );
    const preview = document.createElement("div");
    preview.className = "card-preview";
    preview.style.setProperty("--work-bg", work.backgroundColor || "#222b24");
    attachPoster(preview, work, index + 1);
    const body = document.createElement("div");
    body.className = "card-body";
    const title = document.createElement("h3");
    title.textContent = work.title;
    const subtitle = document.createElement("p");
    subtitle.className = "card-subtitle";
    subtitle.textContent = work.subtitle || "";
    const bottom = document.createElement("div");
    bottom.className = "card-bottom";
    const role = document.createElement("span");
    role.textContent = work.role || "";
    const tags = document.createElement("span");
    tags.textContent = (work.tags || []).slice(0, 2).join(" / ");
    bottom.append(role, tags);
    body.append(title, subtitle, bottom);
    card.append(preview, body);
    card.addEventListener("click", () => openWork(work, items));
    grid.append(card);
  });
}
function setSnapshot(preview, url) {
  // The preview is a first-frame capture of the actual Spine work, not a substitute illustration.
  preview
    .querySelectorAll("img,.card-placeholder")
    .forEach((element) => element.remove());
  const image = document.createElement("img");
  image.src = url;
  image.alt = "";
  image.className = "snapshot";
  preview.prepend(image);
}
async function runSnapshotQueue() {
  if (snapshotBusy || !snapshotQueue.length || !window.spine?.SpinePlayer)
    return;
  snapshotBusy = true;
  const { preview, work } = snapshotQueue.shift();
  if (!preview.isConnected || snapshotCache.has(work.id)) {
    if (preview.isConnected && snapshotCache.has(work.id))
      setSnapshot(preview, snapshotCache.get(work.id));
    snapshotBusy = false;
    runSnapshotQueue();
    return;
  }
  const host = document.createElement("div");
  host.className = "snapshot-host";
  host.setAttribute("aria-hidden", "true");
  preview.append(host);
  let player = null,
    done = false;
  let captureTimer;
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timeout);
    clearTimeout(captureTimer);
    destroyPlayer(player);
    host.remove();
    snapshotBusy = false;
    if (snapshotQueue.length) setTimeout(runSnapshotQueue, 40);
  }
  const timeout = setTimeout(finish, 12000);
  try {
    player = new window.spine.SpinePlayer(
      host,
      playerConfig(work, {
        preserveDrawingBuffer: true,
        success(readyPlayer) {
          player = readyPlayer;
          captureTimer = setTimeout(() => {
            if (done) return;
            try {
              const canvas = readyPlayer.canvas || host.querySelector("canvas");
              if (canvas?.width && canvas?.height) {
                const url = canvas.toDataURL("image/png");
                snapshotCache.set(work.id, url);
                if (preview.isConnected) setSnapshot(preview, url);
              }
            } catch (error) {
              /* Keep the supplied thumbnail if canvas capture is unavailable. */
            }
            finish();
          }, 240);
        },
        error: () => setTimeout(finish, 0),
      }),
    );
  } catch (error) {
    finish();
  }
}
function disposeViewer() {
  ++state.viewerToken;
  destroyPlayer(state.viewerPlayer);
  state.viewerPlayer = null;
  const video = media.querySelector("video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  media.replaceChildren();
  $("#viewer-playback").disabled = true;
}
function showViewerMessage(message) {
  setText("#viewer-message", message);
  $("#viewer-message").hidden = false;
}
function openWork(work, list = filteredWorks()) {
  disposeViewer();
  const token = state.viewerToken;
  state.currentWork = work;
  state.viewerMediaIndex = -1;
  $("#viewer-media-tabs").replaceChildren();
  $("#viewer-media-tabs").hidden = true;
  state.viewerWorks =
    list.length && list.includes(work)
      ? list
      : allWorks.filter(
          (item) => Boolean(item.sample) === Boolean(work.sample),
        );
  const index = state.viewerWorks.indexOf(work);
  setText(
    "#viewer-number",
    `${String(index + 1).padStart(2, "0")} / ${String(state.viewerWorks.length).padStart(2, "0")} — ${work.sample ? "SAMPLE" : "SELECTED WORK"}`,
  );
  setText("#viewer-title", work.title);
  setText("#viewer-description", work.description);
  setText("#viewer-role", work.role);
  setText("#viewer-format", formatType(work));
  setText(
    "#viewer-format-detail",
    isSpine(work) ? "Spine " + (work.spineVersion || "4.3") : formatType(work),
  );
  $("#viewer-tags").replaceChildren();
  (work.tags || []).forEach((tag) => {
    const el = document.createElement("span");
    el.textContent = tag;
    $("#viewer-tags").append(el);
  });
  $("#viewer-sample-label").hidden = !work.sample;
  $("#viewer-message").hidden = true;
  $("#spine-settings").hidden = !isSpine(work);
  $("#viewer-stage").dataset.background = "dark";
  document.querySelectorAll(".background-swatch").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.background === "dark");
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.background === "dark"),
    );
  });
  $("#speed-select").value = "1";
  $("#animation-select").replaceChildren(new Option("불러오는 중…", ""));
  $("#animation-select").disabled = true;
  $("#viewer-prev").disabled = state.viewerWorks.length < 2;
  $("#viewer-next").disabled = state.viewerWorks.length < 2;
  if (!viewer.open) {
    state.focusBeforeViewer = document.activeElement;
    viewer.showModal();
  }
  syncHeroPlayback();
  if (Array.isArray(work.mediaItems) && work.mediaItems.length) {
    const tabs = $("#viewer-media-tabs");
    tabs.hidden = work.mediaItems.length < 2;
    work.mediaItems.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = item.title || "영상 " + (index + 1);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => selectProjectMedia(work, index));
      tabs.append(button);
    });
    selectProjectMedia(work, 0);
    return;
  }
  if (isSpine(work)) {
    if (!window.spine?.SpinePlayer) {
      showViewerMessage(
        "Spine 런타임을 불러오지 못했습니다. 페이지를 새로고침해 주세요.",
      );
      return;
    }
    try {
      state.viewerPlayer = new window.spine.SpinePlayer(
        media,
        playerConfig(work, {
          showControls: true,
          interactive: true,
          success(player) {
            if (token !== state.viewerToken) return;
            state.viewerPlayer = player;
            const animations = visibleAnimations(player, work);
            player.config.animations = animations.map(
              (animation) => animation.name,
            );
            $("#animation-select").replaceChildren();
            animations.forEach((animation) =>
              $("#animation-select").add(
                new Option(animation.name, animation.name),
              ),
            );
            const initial =
              animations.find(
                (animation) => animation.name === work.animation,
              ) || animations[0];
            if (initial) {
              $("#animation-select").value = initial.name;
              player.config.animation = initial.name;
              player.setAnimation(initial.name, true);
            }
            $("#animation-select").disabled = animations.length === 0;
            $("#viewer-playback").disabled = false;
            if (motionPreference.matches) player.pause();
            syncPlaybackButton();
          },
          error(player, message) {
            if (token !== state.viewerToken) return;
            showViewerMessage(
              "작품을 불러오지 못했습니다. Spine 4.3 파일, atlas와 텍스처 경로를 확인해 주세요. " +
                String(message || ""),
            );
          },
        }),
      );
    } catch (error) {
      showViewerMessage(
        "Spine 뷰어를 시작할 수 없습니다. WebGL 지원 여부를 확인해 주세요. " +
          error.message,
      );
    }
  } else if (work.type === "video") {
    openVideo(work, token);
  } else {
    openImage(work, token);
  }
}
function openImage(work, token) {
  const src = work.media || work.thumbnail;
  if (!src) {
    showViewerMessage("표시할 이미지 파일이 없습니다.");
    return;
  }
  const image = document.createElement("img");
  image.src = src;
  image.alt = work.title;
  image.addEventListener("error", () => {
    if (token === state.viewerToken)
      showViewerMessage(
        "이미지를 불러오지 못했습니다. 파일 경로를 확인해 주세요.",
      );
  });
  media.append(image);
}
function selectProjectMedia(work, index) {
  if (state.currentWork !== work) return;
  const item = work.mediaItems?.[index];
  if (!item) return;
  // Clicking the selected item preserves its running animation.
  if (state.viewerMediaIndex === index && media.children.length) return;
  disposeViewer();
  state.viewerMediaIndex = index;
  const token = state.viewerToken;
  $("#viewer-message").hidden = true;
  $("#spine-settings").hidden = true;
  $("#viewer-media-tabs")
    .querySelectorAll("button")
    .forEach((button, current) => {
      button.classList.toggle("is-active", current === index);
      button.setAttribute("aria-pressed", String(current === index));
    });
  const selected = { ...item, title: item.title || work.title };
  setText("#viewer-format", formatType(selected));
  setText("#viewer-format-detail", formatType(selected));
  if (selected.type === "video") openVideo(selected, token);
  else openImage(selected, token);
}
function openVideo(work, token) {
  if (work.embedUrl) {
    let url;
    try {
      url = new URL(work.embedUrl);
    } catch (error) {
      showViewerMessage("올바른 영상 임베드 주소가 필요합니다.");
      return;
    }
    if (
      url.protocol !== "https:" ||
      ![
        "www.youtube.com",
        "www.youtube-nocookie.com",
        "player.vimeo.com",
      ].includes(url.hostname)
    ) {
      showViewerMessage(
        "YouTube 또는 Vimeo의 HTTPS 임베드 주소를 사용해 주세요.",
      );
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = url.href;
    iframe.title = work.title;
    iframe.allow = "fullscreen; picture-in-picture; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    media.append(iframe);
    return;
  }
  if (!work.media) {
    showViewerMessage("재생할 영상 파일이 없습니다.");
    return;
  }
  const video = document.createElement("video");
  video.controls = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  if (work.thumbnail) video.poster = work.thumbnail;
  video.src = work.media;
  video.addEventListener("error", () => {
    if (token === state.viewerToken)
      showViewerMessage(
        "영상을 불러오지 못했습니다. 파일 경로 또는 브라우저의 포맷 지원을 확인해 주세요.",
      );
  });
  media.append(video);
}
function syncPlaybackButton() {
  const player = state.viewerPlayer;
  if (!player?.skeleton) return;
  setText("#viewer-playback", player.paused ? "▷ 재생" : "Ⅱ 일시정지");
}
function navigateWork(direction) {
  if (!state.currentWork || !state.viewerWorks.length) return;
  const index = state.viewerWorks.indexOf(state.currentWork);
  openWork(
    state.viewerWorks[
      (index + direction + state.viewerWorks.length) % state.viewerWorks.length
    ],
    state.viewerWorks,
  );
}

// Gallery previews are rendered one at a time, captured, and disposed to release WebGL contexts.
if ("IntersectionObserver" in window) {
  snapshotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const preview = entry.target;
        snapshotObserver.unobserve(preview);
        snapshotQueue.push({ preview, work: preview._work });
      });
      runSnapshotQueue();
    },
    { rootMargin: "100px" },
  );
}
renderWorks();
featuredWorks.forEach((work, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", work.title + " 미리보기");
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => changeHero(index));
  $("#hero-dots").append(button);
});
changeHero(0);
$("#hero-prev").addEventListener("click", () =>
  changeHero(state.heroIndex - 1),
);
$("#hero-next").addEventListener("click", () =>
  changeHero(state.heroIndex + 1),
);
$("#hero-open").addEventListener("click", () => {
  if (featuredWorks.length)
    openWork(featuredWorks[state.heroIndex], featuredWorks);
});
$("#hero-pause").addEventListener("click", () => {
  state.heroManualPause = !state.heroManualPause;
  syncHeroPlayback();
});
document.querySelectorAll("[data-filter]").forEach((button) =>
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderWorks();
  }),
);
$("#work-search").addEventListener("input", (event) => {
  state.query = event.target.value.trim();
  renderWorks();
});
$("#reset-filters").addEventListener("click", () => {
  state.query = "";
  $("#work-search").value = "";
  document.querySelector('[data-filter="all"]').click();
});
$("#viewer-close").addEventListener("click", () => viewer.close());
$("#viewer-home").addEventListener("click", () => viewer.close());
viewer.addEventListener("close", () => {
  disposeViewer();
  state.currentWork = null;
  syncHeroPlayback();
  if (state.focusBeforeViewer?.isConnected) state.focusBeforeViewer.focus();
});
viewer.addEventListener("click", (event) => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    viewer.close();
});
$("#viewer-prev").addEventListener("click", () => navigateWork(-1));
$("#viewer-next").addEventListener("click", () => navigateWork(1));
$("#animation-select").addEventListener("change", (event) => {
  const player = state.viewerPlayer;
  if (!player?.skeleton || !event.target.value) return;
  try {
    player.config.animation = event.target.value;
    player.setAnimation(event.target.value, true);
    player.play();
    syncPlaybackButton();
  } catch (error) {
    showViewerMessage("애니메이션을 선택하지 못했습니다. " + error.message);
  }
});
$("#speed-select").addEventListener("change", (event) => {
  if (state.viewerPlayer) state.viewerPlayer.speed = Number(event.target.value);
});
$("#viewer-playback").addEventListener("click", () => {
  const player = state.viewerPlayer;
  if (!player?.skeleton) return;
  if (player.paused) player.play();
  else player.pause();
  syncPlaybackButton();
});
document.querySelectorAll(".background-swatch").forEach((button) =>
  button.addEventListener("click", () => {
    $("#viewer-stage").dataset.background = button.dataset.background;
    document.querySelectorAll(".background-swatch").forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
  }),
);
$("#viewer-fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if ($("#viewer-stage").requestFullscreen)
      await $("#viewer-stage").requestFullscreen();
    else showViewerMessage("이 브라우저는 전체 화면 API를 지원하지 않습니다.");
  } catch (error) {
    showViewerMessage(
      "전체 화면을 열지 못했습니다. 브라우저 설정을 확인해 주세요.",
    );
  }
});
document.addEventListener("keydown", (event) => {
  if (
    !viewer.open ||
    /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName || "")
  )
    return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    navigateWork(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    navigateWork(1);
  }
});
// Keep custom controls synchronized with the official player's controls.
setInterval(() => {
  if (!viewer.open || !state.viewerPlayer?.skeleton) return;
  syncPlaybackButton();
  const track = state.viewerPlayer.animationState.getTrack(0);
  if (
    track?.animation?.name &&
    [...$("#animation-select").options].some(
      (option) => option.value === track.animation.name,
    )
  )
    $("#animation-select").value = track.animation.name;
  const speed = String(state.viewerPlayer.speed);
  if ([...$("#speed-select").options].some((option) => option.value === speed))
    $("#speed-select").value = speed;
}, 500);
setText(
  "#nav-work-count",
  String(allWorks.filter((work) => !work.sample).length).padStart(2, "0"),
);
setText("#current-year", new Date().getFullYear());
