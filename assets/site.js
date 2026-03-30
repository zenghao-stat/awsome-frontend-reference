const uiText = {
  en: {
    pageTitle: "Awesome Frontend Reference Gallery",
    metaDescription:
      "A GitHub Pages collection for browsing frontend design references, galleries, component resources, and skills.",
    heroTitle: "Frontend Design Reference",
    heroCopy:
      "A collection of frontend design references, full websites, galleries, component resources, and skills.",
    items: "items",
    categories: "categories",
    capture: "capture",
    searchPlaceholder: "Search site name...",
    toolbarKicker: "Gallery Browser",
    loading: "Loading collection...",
    loadError: "Failed to load collection.",
    noResults: "No matching results.",
    results: (count) => `${count} result${count > 1 ? "s" : ""}`,
  },
  zh: {
    pageTitle: "前端设计参考",
    metaDescription: "一个适合浏览前端设计参考、画廊站点、组件资源与 skills 的 GitHub Pages collection。",
    heroTitle: "前端设计参考",
    heroCopy: "这里收集前端设计参考、完整站点、画廊站点、组件库和 skills。",
    items: "项目数",
    categories: "分类数",
    capture: "截图日期",
    searchPlaceholder: "搜索站点名称...",
    toolbarKicker: "画廊浏览",
    loading: "正在加载 collection...",
    loadError: "加载 collection 失败。",
    noResults: "没有匹配的结果。",
    results: (count) => `${count} 个结果`,
  },
};

const categoryMeta = {
  all: {
    label: { en: "All", zh: "全部" },
    description: {
      en: "Browse the full collection.",
      zh: "浏览整个 collection。",
    },
  },
  "参考示例": {
    label: { en: "Reference Examples", zh: "参考示例" },
    description: {
      en: "Finished websites that are useful for studying hero sections, narrative flow, layout, and brand expression.",
      zh: "直接可看的成品网站，更适合观察首页、叙事、排版和品牌表达。",
    },
  },
  "画廊": {
    label: { en: "Gallery", zh: "画廊" },
    description: {
      en: "Aggregated inspiration sites for scanning different styles, layout patterns, and product types quickly.",
      zh: "聚合类灵感站点，适合快速扫不同风格、布局模式和产品类型。",
    },
  },
  "前端组件": {
    label: { en: "Frontend Components", zh: "前端组件" },
    description: {
      en: "Component-focused resources for buttons, forms, navigation, and design system details.",
      zh: "更偏组件层面的资源，适合查按钮、表单、导航和设计系统细节。",
    },
  },
  Skills: {
    label: { en: "Skills", zh: "Skills" },
    description: {
      en: "Skill-based resources that package prompt, workflow, agent, and design capabilities.",
      zh: "围绕 prompt、workflow、agent 和设计能力封装出来的技能型资源。",
    },
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
const heroTitle = document.getElementById("hero-title");
const heroCopy = document.getElementById("hero-copy");
const labelItems = document.getElementById("label-items");
const labelCategories = document.getElementById("label-categories");
const labelCapture = document.getElementById("label-capture");
const toolbarKicker = document.getElementById("toolbar-kicker");
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
const metaDescription = document.querySelector('meta[name="description"]');
const loadingState = document.querySelector(".loading-state");

let allSites = [];
let activeCategory = "all";
let query = "";
let currentLang = localStorage.getItem("afr-lang") === "zh" ? "zh" : "en";

function getCategoryLabel(category, lang = currentLang) {
  return categoryMeta[category].label[lang];
}

function getCategoryAltLabel(category) {
  return getCategoryLabel(category, currentLang === "en" ? "zh" : "en");
}

function getSiteIntro(site) {
  return currentLang === "en" ? site.intro_en || site.intro : site.intro;
}

function getSiteNotes(site) {
  if (currentLang === "en") return site.notes_en || site.notes || "";
  return site.notes || "";
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("afr-lang", lang);
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
  document.body.dataset.lang = lang;
  document.title = uiText[lang].pageTitle;
  metaDescription.setAttribute("content", uiText[lang].metaDescription);
  heroTitle.textContent = uiText[lang].heroTitle;
  heroCopy.textContent = uiText[lang].heroCopy;
  labelItems.textContent = uiText[lang].items;
  labelCategories.textContent = uiText[lang].categories;
  labelCapture.textContent = uiText[lang].capture;
  search.placeholder = uiText[lang].searchPlaceholder;
  toolbarKicker.textContent = uiText[lang].toolbarKicker;

  if (loadingState && !allSites.length) {
    loadingState.textContent = uiText[lang].loading;
  }

  langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  render();
}

function renderChip(category, sites) {
  const total = category === "all" ? sites.length : sites.filter((site) => site.category === category).length;

  const button = document.createElement("button");
  button.className = `chip ${activeCategory === category ? "active" : ""}`;
  button.type = "button";
  button.innerHTML = `
    <span class="chip-label">
      <span class="chip-title">${getCategoryLabel(category)}</span>
      <span class="chip-subtitle">${getCategoryAltLabel(category)}</span>
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
    const haystack = [
      site.name,
      site.url,
      site.category,
      site.intro,
      site.intro_en || "",
      getCategoryLabel(site.category, "en"),
      getCategoryLabel(site.category, "zh"),
    ]
      .join(" ")
      .toLowerCase();
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
  badge.textContent = getCategoryLabel(site.category);
  intro.textContent = getSiteIntro(site);

  const notes = getSiteNotes(site);
  if (notes) {
    note.hidden = false;
    note.textContent = notes;
  }

  return fragment;
}

function renderHeader(filteredSites) {
  currentTitle.textContent = getCategoryLabel(activeCategory);
  currentDesc.textContent = categoryMeta[activeCategory].description[currentLang];
  resultCount.textContent = uiText[currentLang].results(filteredSites.length);
}

function renderGrid(filteredSites) {
  grid.innerHTML = "";

  if (!filteredSites.length) {
    grid.innerHTML = `<p class="loading-state">${uiText[currentLang].noResults}</p>`;
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
  if (!allSites.length) return;
  const filteredSites = getFilteredSites();
  renderChips(allSites);
  renderHeader(filteredSites);
  renderGrid(filteredSites);
}

async function init() {
  try {
    langButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });

    setLanguage(currentLang);

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
    grid.innerHTML = `<p class="loading-state">${uiText[currentLang].loadError}</p>`;
  }
}

init();
