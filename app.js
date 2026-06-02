(function () {
  var items       = Array.isArray(window.WARDROBE_ITEMS) ? window.WARDROBE_ITEMS : [];
  var app         = document.getElementById("app");
  var searchToggle  = document.getElementById("searchToggle");
  var filterToggle  = document.getElementById("filterToggle");
  var menuToggle    = document.getElementById("menuToggle");
  var searchPanel   = document.getElementById("searchPanel");
  var searchInput   = document.getElementById("searchInput");
  var filterOverlay = document.getElementById("filterOverlay");
  var filterClose   = document.getElementById("filterClose");
  var filterContent = document.getElementById("filterContent");
  var clearFilters  = document.getElementById("clearFilters");

  var filters = { category: "", color: "", season: "" };

  /* Track which button last opened the filter so focus can return */
  var lastFilterOpener = null;

  /* ── Utilities ────────────────────────────────────────── */
  function titleCase(value) {
    return String(value)
      .split(" ")
      .map(function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : ""; })
      .join(" ");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function uniqueValues(key) {
    return items
      .map(function (item) { return item[key]; })
      .filter(Boolean)
      .filter(function (v, i, arr) { return arr.indexOf(v) === i; })
      .sort();
  }

  function clearNode(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  }

  function createText(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }

  /* ── Filtering ────────────────────────────────────────── */
  function itemMatches(item) {
    var query = normalize(searchInput.value).trim();
    var searchable = [
      item.name, item.brand, item.category, item.color, item.season,
      (item.tags || []).join(" ")
    ].join(" ");

    var matchesSearch  = !query || normalize(searchable).indexOf(query) > -1;
    var matchesFilters = Object.keys(filters).every(function (k) {
      return !filters[k] || item[k] === filters[k];
    });

    return matchesSearch && matchesFilters;
  }

  function filteredItems() {
    return items.filter(itemMatches);
  }

  /* ── Catalog view ─────────────────────────────────────── */
  function renderCatalog() {
    clearNode(app);
    app.className = "app-shell catalog-view";
    document.title = "Wardrobe";

    var results = filteredItems();

    var summary = document.createElement("section");
    summary.className = "catalog-summary";
    /* Title first (large), count second (small, aligned to bottom-right) */
    summary.appendChild(createText("h1", "catalog-title", "Private Collection"));
    summary.appendChild(createText("p",  "catalog-kicker", results.length + " items"));
    app.appendChild(summary);

    var grid = document.createElement("section");
    grid.className = "catalog-grid";
    grid.setAttribute("aria-label", "Wardrobe catalog");

    if (!results.length) {
      grid.appendChild(createText("p", "empty-state", "Nothing found"));
    }

    results.forEach(function (item, i) {
      var card = createItemCard(item);
      /* Stagger entrance: 50 ms per card, capped at 340 ms */
      card.style.animationDelay = Math.min(i * 50, 340) + "ms";
      grid.appendChild(card);
    });

    app.appendChild(grid);
  }

  function createItemCard(item) {
    var link = document.createElement("a");
    link.className = "item-card";
    link.href = "#item/" + encodeURIComponent(item.id);

    var media = document.createElement("span");
    media.className = "item-media";

    var image = document.createElement("img");
    image.src = item.image;
    image.alt = item.brand + " " + item.name;
    image.loading = "lazy";
    media.appendChild(image);

    var meta = document.createElement("span");
    meta.className = "item-meta";
    meta.appendChild(createText("span", "item-name",  item.name));
    meta.appendChild(createText("span", "item-brand", item.brand));

    link.appendChild(media);
    link.appendChild(meta);
    return link;
  }

  /* ── Detail view ──────────────────────────────────────── */
  function renderDetail(item) {
    clearNode(app);
    app.className = "app-shell detail-view";
    document.title = item.name + " — Wardrobe";

    var detail = document.createElement("article");
    detail.className = "detail-layout";

    /* Left: sticky image */
    var imageWrap = document.createElement("div");
    imageWrap.className = "detail-media";
    var image = document.createElement("img");
    image.src = item.image;
    image.alt = item.brand + " " + item.name;
    imageWrap.appendChild(image);

    /* Right: info panel */
    var info = document.createElement("section");
    info.className = "detail-info";
    info.appendChild(createText("p",  "detail-brand", item.brand));
    info.appendChild(createText("h1", "detail-title", item.name));

    var list = document.createElement("dl");
    list.className = "detail-list";
    [
      ["Category", titleCase(item.category)],
      ["Color",    titleCase(item.color)],
      ["Season",   titleCase(item.season)],
      ["Tags",     (item.tags || []).map(titleCase).join(", ")]
    ].forEach(function (row) {
      list.appendChild(createText("dt", "", row[0]));
      list.appendChild(createText("dd", "", row[1]));
    });
    info.appendChild(list);

    var actions = document.createElement("div");
    actions.className = "detail-actions";
    var back = document.createElement("a");
    back.className = "text-action";
    back.href = "#";
    back.textContent = "Back";
    actions.appendChild(back);
    info.appendChild(actions);

    detail.appendChild(imageWrap);
    detail.appendChild(info);
    app.appendChild(detail);
  }

  /* ── Routing ──────────────────────────────────────────── */
  function renderRoute() {
    var match = window.location.hash.match(/^#item\/(.+)$/);
    if (match) {
      var id   = decodeURIComponent(match[1]);
      var item = items.find(function (c) { return c.id === id; });
      if (item) {
        renderDetail(item);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
    }
    renderCatalog();
  }

  function showCatalogFromControls() {
    if (window.location.hash.indexOf("#item/") === 0) {
      window.location.hash = "";
      return;
    }
    renderCatalog();
  }

  /* ── Filter overlay ───────────────────────────────────── */
  function renderFilters() {
    clearNode(filterContent);
    ["category", "color", "season"].forEach(function (key) {
      var group = document.createElement("section");
      group.className = "filter-group";
      group.appendChild(createText("h2", "filter-heading", key));

      var options = document.createElement("div");
      options.className = "filter-options";
      options.appendChild(createFilterButton(key, "", "All", !filters[key]));

      uniqueValues(key).forEach(function (value) {
        options.appendChild(createFilterButton(key, value, titleCase(value), filters[key] === value));
      });

      group.appendChild(options);
      filterContent.appendChild(group);
    });
  }

  function createFilterButton(key, value, label, active) {
    var btn = document.createElement("button");
    btn.className = active ? "filter-chip is-active" : "filter-chip";
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", function () {
      filters[key] = value;
      renderFilters();
      showCatalogFromControls();
    });
    return btn;
  }

  function openFilters(opener) {
    lastFilterOpener = opener || null;
    filterOverlay.classList.add("is-open");
    filterOverlay.inert = false;
    filterOverlay.setAttribute("aria-hidden", "false");
    filterToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-expanded", "true");
    filterClose.focus();
  }

  function closeFilters() {
    filterOverlay.classList.remove("is-open");
    filterOverlay.inert = true;
    filterOverlay.setAttribute("aria-hidden", "true");
    filterToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-expanded", "false");
    /* Return focus to the button that triggered the overlay */
    if (lastFilterOpener) {
      lastFilterOpener.focus();
      lastFilterOpener = null;
    }
  }

  function toggleSearch() {
    var shouldOpen = searchPanel.hasAttribute("hidden");
    if (shouldOpen) {
      searchPanel.removeAttribute("hidden");
      searchToggle.setAttribute("aria-expanded", "true");
      searchInput.focus();
    } else {
      searchPanel.setAttribute("hidden", "");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  }

  /* ── Event listeners ──────────────────────────────────── */
  searchToggle.addEventListener("click", toggleSearch);
  filterToggle.addEventListener("click", function () { openFilters(filterToggle); });
  menuToggle.addEventListener("click",   function () { openFilters(menuToggle); });
  filterClose.addEventListener("click", closeFilters);

  searchInput.addEventListener("input", showCatalogFromControls);

  clearFilters.addEventListener("click", function () {
    filters.category = "";
    filters.color    = "";
    filters.season   = "";
    searchInput.value = "";
    renderFilters();
    showCatalogFromControls();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeFilters();
    if (!searchPanel.hasAttribute("hidden")) {
      searchPanel.setAttribute("hidden", "");
      searchToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("hashchange", renderRoute);

  /* ── Init ─────────────────────────────────────────────── */
  filterOverlay.inert = true;
  renderFilters();
  renderRoute();
})();
