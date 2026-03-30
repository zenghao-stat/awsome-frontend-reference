const categoryMeta = {
  all: {
    title: "全部",
    subtitle: "All",
    description: "浏览整个 collection，包括参考示例、画廊、前端组件和 skills。",
  },
  "参考示例": {
    title: "参考示例",
    subtitle: "Reference Examples",
    description: "直接可看的成品网站，更适合观察首页、叙事、排版和品牌表达。",
  },
  "画廊": {
    title: "画廊",
    subtitle: "Gallery",
    description: "聚合类灵感站点，适合快速扫不同风格、布局模式和产品类型。",
  },
  "前端组件": {
    title: "前端组件",
    subtitle: "Frontend Components",
    description: "更偏组件层面的资源，适合查按钮、表单、导航和设计系统细节。",
  },
  Skills: {
    title: "Skills",
    subtitle: "Skills",
    description: "围绕 prompt、workflow、agent 和设计能力封装出来的技能型资源。",
  },
};

const orderedCategories = ["参考示例", "画廊", "前端组件", "Skills"];

const chips = document.getElementById("chips");
const grid = document.getElementById("grid");
const siteCount = document.getElementById("site-count");
const categoryCount = document.getElementById("category-count");
const captureDate = document.getElementById("capture-date");
const currentTitle = document.getElementById("current-title");
const currentDesc = document.getElementById("current-desc");
const resultCount = document.getElementById("result-count");
const search = document.getElementById("search");
const template = document.getElementById("site-card-template");

let allSites = [];
let activeCategory = "all";
let query = "";

function renderChip(category, sites) {
  const meta = categoryMeta[category];
  const total = category === "all" ? sites.length : sites.filter((site) => site.category === category).length;

  const button = document.createElement("button");
  button.className = `chip ${activeCategory === category ? "active" : ""}`;
  button.type = "button";
  button.innerHTML = `
    <span class="chip-label">
      <span class="chip-title">${meta.title}</span>
      <span class="chip-subtitle">${meta.subtitle}</span>
    </span>
    <span class="chip-count">${String(total).padStart(2, "0")}</span>
  `;
  button.addEventListener("click", () => {
    activeCategory = category;
    render();
  });

  return button;
}

function renderChips(sites) {
  chips.innerHTML = "";
  ["all", ...orderedCategories].forEach((category) => {
    chips.appendChild(renderChip(category, sites));
  });
}

function getFilteredSites() {
  return allSites.filter((site) => {
    const matchCategory = activeCategory === "all" || site.category === activeCategory;
    const haystack = `${site.name} ${site.intro} ${site.category} ${site.url}`.toLowerCase();
    const matchQuery = !query || haystack.includes(query);
    return matchCategory && matchQuery;
  });
}

function renderCard(site) {
  const fragment = template.content.cloneNode(true);
  const shot = fragment.querySelector(".card-shot");
  const img = fragment.querySelector("img");
  const title = fragment.querySelector(".card-title");
  const url = fragment.querySelector(".card-url");
  const badge = fragment.querySelector(".card-badge");
  const intro = fragment.querySelector(".card-intro");
  const note = fragment.querySelector(".card-note");

  shot.href = site.url;
  img.src = site.screenshot;
  img.alt = `${site.name} screenshot`;
  title.href = site.url;
  title.textContent = site.name;
  url.textContent = site.url.replace(/^https?:\/\//, "");
  badge.textContent = categoryMeta[site.category]?.subtitle || site.category;
  intro.textContent = site.intro;

  if (site.notes) {
    note.hidden = false;
    note.textContent = site.notes;
  }

  return fragment;
}

function renderHeader(filteredSites) {
  const meta = categoryMeta[activeCategory];
  currentTitle.textContent = meta.title;
  currentDesc.textContent = meta.description;
  resultCount.textContent = `${filteredSites.length} result${filteredSites.length > 1 ? "s" : ""}`;
}

function renderGrid(filteredSites) {
  grid.innerHTML = "";

  if (!filteredSites.length) {
    grid.innerHTML = `<p class="loading-state">没有匹配的结果。</p>`;
    return;
  }

  filteredSites.forEach((site) => {
    grid.appendChild(renderCard(site));
  });
}

function renderStats(sites) {
  siteCount.textContent = String(sites.length).padStart(2, "0");
  categoryCount.textContent = String(orderedCategories.length);
  captureDate.textContent = [...new Set(sites.map((site) => site.captured_at))].join(" / ");
}

function render() {
  const filteredSites = getFilteredSites();
  renderChips(allSites);
  renderHeader(filteredSites);
  renderGrid(filteredSites);
}

async function init() {
  try {
    const response = await fetch("data/sites.json");
    if (!response.ok) throw new Error("Failed to load data");

    allSites = await response.json();
    renderStats(allSites);
    render();

    search.addEventListener("input", (event) => {
      query = event.target.value.trim().toLowerCase();
      render();
    });
  } catch (error) {
    grid.innerHTML = `<p class="loading-state">加载失败：${error.message}</p>`;
  }
}

init();
