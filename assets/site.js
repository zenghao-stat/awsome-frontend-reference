const categoryMeta = {
  "参考示例": {
    id: "reference-examples",
    kicker: "Reference Examples",
    title: "参考示例",
    description: "直接可看的成品网站。更适合观察首屏、内容组织、排版和叙事方式。",
  },
  "参考示例的集合": {
    id: "reference-collections",
    kicker: "Example Collections",
    title: "参考示例的集合",
    description: "聚合类灵感站点。适合集中检索不同风格、不同产品类型与不同布局模式。",
  },
  "前端组件": {
    id: "frontend-components",
    kicker: "Frontend Components",
    title: "前端组件",
    description: "更偏向组件层面的参考，适合查表单、按钮、导航和设计系统细节。",
  },
  Skills: {
    id: "skills",
    kicker: "Skills",
    title: "Skills",
    description: "围绕 prompt、workflow、agent 和设计能力封装出来的技能型资源。",
  },
};

const orderedCategories = ["参考示例", "参考示例的集合", "前端组件", "Skills"];

const sectionList = document.getElementById("section-list");
const sectionNav = document.getElementById("section-nav");
const siteCount = document.getElementById("site-count");
const categoryCount = document.getElementById("category-count");
const captureDate = document.getElementById("capture-date");
const template = document.getElementById("site-card-template");

function createCard(site, index) {
  const fragment = template.content.cloneNode(true);
  const shot = fragment.querySelector(".site-shot");
  const img = fragment.querySelector("img");
  const title = fragment.querySelector(".site-title");
  const intro = fragment.querySelector(".site-intro");
  const url = fragment.querySelector(".site-url");
  const note = fragment.querySelector(".site-note");
  const counter = fragment.querySelector(".site-index");

  shot.href = site.url;
  img.src = site.screenshot;
  img.alt = `${site.name} screenshot`;
  title.href = site.url;
  title.textContent = site.name;
  intro.textContent = site.intro;
  url.href = site.url;
  url.textContent = site.url.replace(/^https?:\/\//, "");
  counter.textContent = String(index).padStart(2, "0");

  if (site.notes) {
    note.hidden = false;
    note.textContent = site.notes;
  }

  return fragment;
}

function createSection(category, sites) {
  const meta = categoryMeta[category];
  const section = document.createElement("section");
  section.className = "category-section";
  section.id = meta.id;

  const head = document.createElement("div");
  head.className = "section-head";
  head.innerHTML = `
    <span class="section-kicker">${meta.kicker}</span>
    <h2 class="section-title">${meta.title}</h2>
    <p class="section-desc">${meta.description}</p>
  `;

  const grid = document.createElement("div");
  grid.className = "site-grid";
  sites.forEach((site, idx) => {
    grid.appendChild(createCard(site, idx + 1));
  });

  section.append(head, grid);
  return section;
}

function buildNav() {
  const links = orderedCategories.map((category) => {
    const meta = categoryMeta[category];
    return `<a href="#${meta.id}">${meta.title}</a>`;
  });
  sectionNav.innerHTML = links.join("");
}

function activateNavOnScroll() {
  const sections = orderedCategories
    .map((category) => document.getElementById(categoryMeta[category].id))
    .filter(Boolean);
  const links = Array.from(sectionNav.querySelectorAll("a"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: 0.01,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

async function init() {
  try {
    const response = await fetch("data/sites.json");
    if (!response.ok) throw new Error("Failed to load data");
    const sites = await response.json();

    siteCount.textContent = String(sites.length).padStart(2, "0");
    categoryCount.textContent = String(orderedCategories.length);
    captureDate.textContent = [...new Set(sites.map((site) => site.captured_at))].join(" / ");

    const grouped = orderedCategories.map((category) => ({
      category,
      sites: sites.filter((site) => site.category === category),
    }));

    buildNav();
    sectionList.innerHTML = "";
    grouped.forEach(({ category, sites }) => {
      if (sites.length) sectionList.appendChild(createSection(category, sites));
    });
    activateNavOnScroll();
  } catch (error) {
    sectionList.innerHTML = `<p class="loading-state">加载失败：${error.message}</p>`;
  }
}

init();
