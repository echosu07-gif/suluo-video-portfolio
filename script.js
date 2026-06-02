const mediaConfig = window.PORTFOLIO_CONFIG || {};
const mediaBaseUrl = mediaConfig.mediaBaseUrl || "./share-videos/";
const posterBaseUrl = mediaConfig.posterBaseUrl || "./posters/";

function resolveMediaUrl(storagePath) {
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  if (/^https?:\/\//i.test(mediaBaseUrl)) {
    return new URL(encodedPath, mediaBaseUrl).toString();
  }

  const normalizedBase = mediaBaseUrl.endsWith("/") ? mediaBaseUrl : `${mediaBaseUrl}/`;
  return `${normalizedBase}${encodedPath}`;
}

function resolvePosterUrl(storagePath) {
  const posterPath = storagePath.replace(/\.mp4$/i, ".jpg");
  const encodedPath = posterPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  if (/^https?:\/\//i.test(posterBaseUrl)) {
    return new URL(encodedPath, posterBaseUrl).toString();
  }

  const normalizedBase = posterBaseUrl.endsWith("/") ? posterBaseUrl : `${posterBaseUrl}/`;
  return `${normalizedBase}${encodedPath}`;
}

const worksCount = document.querySelector("#works-count");
const filterLabel = document.querySelector("#filter-label");
const filterChips = document.querySelectorAll(".filter-chip");
const videoModal = document.querySelector("#video-modal");
const modalVideo = document.querySelector("#modal-video");
const modalTitle = document.querySelector("#video-modal-title");
const closeButton = document.querySelector("#video-close");
const workCards = Array.from(document.querySelectorAll(".work-card"));
let lastFocusedTrigger = null;

function openVideoModal(work, trigger) {
  lastFocusedTrigger = trigger;
  modalTitle.textContent = work.title;
  modalVideo.src = resolveMediaUrl(work.storagePath);
  videoModal.hidden = false;
  document.body.classList.add("modal-open");
  modalVideo.play().catch(() => {});
}

function closeVideoModal() {
  videoModal.hidden = true;
  document.body.classList.remove("modal-open");
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();

  if (lastFocusedTrigger) {
    lastFocusedTrigger.focus();
  }
}

function renderWorks(category = "全部") {
  let visibleCount = 0;

  workCards.forEach((card) => {
    const isVisible =
      category === "全部" || card.dataset.category === category;

    card.classList.toggle("is-hidden", !isVisible);

    if (isVisible) {
      visibleCount += 1;
    }
  });

  filterLabel.textContent = `当前查看：${category === "全部" ? "全部作品" : category}`;
  worksCount.textContent = `共 ${visibleCount} 个视频作品`;
}

workCards.forEach((card) => {
  const link = card.querySelector(".work-link");
  const video = card.querySelector(".work-video");
  const title = card.dataset.title;
  const category = card.dataset.category;
  const storagePath = card.dataset.storagePath;
  const mediaUrl = resolveMediaUrl(storagePath);
  const posterUrl = resolvePosterUrl(storagePath);

  link.href = mediaUrl;
  link.setAttribute("aria-label", `${title}，分类 ${category}，点击打开视频`);
  video.src = mediaUrl;
  video.poster = posterUrl;
  video.setAttribute("aria-label", `${title} 预览视频`);
  video.autoplay = true;
  video.addEventListener(
    "loadedmetadata",
    () => {
      if (video.duration > 1.2) {
        video.currentTime = 1;
      }
    },
    { once: true }
  );

  link.addEventListener("click", (event) => {
    event.preventDefault();
    openVideoModal({ title, storagePath }, link);
  });
});

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterChips.forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderWorks(chip.dataset.filter);
  });
});

videoModal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
    closeVideoModal();
  }
});

closeButton.addEventListener("click", closeVideoModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !videoModal.hidden) {
    closeVideoModal();
  }
});

renderWorks();
