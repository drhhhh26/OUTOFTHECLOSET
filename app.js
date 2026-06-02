(function () {
  var items = Array.isArray(window.WARDROBE_ITEMS) ? window.WARDROBE_ITEMS : [];
  var app = document.getElementById("app");
  var searchToggle = document.getElementById("searchToggle");
  var filterToggle = document.getElementById("filterToggle");
  var menuToggle = document.getElementById("menuToggle");
  var searchPanel = document.getElementById("searchPanel");
  var searchInput = document.getElementById("searchInput");
  var filterOverlay = document.getElementById("filterOverlay");
  var filterClose = document.getElementById("filterClose");
  var filterContent = document.getElementById("filterContent");
  var clearFilters = document.getElementById("clearFilters");

  var filters = {
    category: "",
    color: "",
    season: ""
  };

  function titleCase(value) {
    return String(value)
      .split(" ")
      .map(function (word) {
        return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
      })
      .join(" ");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function uniqueValues(key) {
    return items
      .map(function (item) {
        return item[key];
      })
      .filter(Boolean)
      .filter(function (value, index, list) {
        return list.indexOf(value) === index;
      })
      .sort();
  }

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createText(tag, className, text) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    element.textContent = text;
    return element;
  }

  function itemMatches(item) {
    var query = normalize(searchInput.value).trim();
    var searchable = [
      item.name,
      item.brand,
      item.category,
      item.color,
      item.season,
      (item.tags || []).join(" ")
    ].join(" ");

    var matchesSearch = !query || normalize(searchable).indexOf(query) > -1;
    var matchesFilters = Object.keys(filters).every(function (key) {
      return !filters[key] || item[key] === filters[key];
    });

    return matchesSearch && matchesFilters;
  }

  function filteredItems() {
    return items.filter(itemMatches);
  }

  function renderCatalog() {
    clearNode(app);
    app.className = "app-shell catalog-view";

    var summary = document.createElement("section");
    summary.className = "catalog-summary";
    summary.appendChild(createText("p", "catalog-kicker", filteredItems().length + " ITEMS"));
    summary.appendChild(createText("h1", "catalog-title", "PRIVATE COLLECTION"));
    app.appendChild(summary);

    var grid = document.createElement("section");
    grid.className = "catalog-grid";
    grid.setAttribute("aria-label", "Wardrobe catalog");

    var results = filteredItems();
    if (!results.length) {
      var empty = createText("p", "empty-state", "NO ITEMS FOUND");
      grid.appendChild(empty);
    }

    results.forEach(function (item) {
      grid.appendChild(createItemCard(item));
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
    meta.appendChild(createText("span", "item-name", item.name));
    meta.appendChild(createText("span", "item-brand", item.brand));

    link.appendChild(media);
    link.appendChild(meta);
    return link;
  }

  function renderDetail(item) {
    clearNode(app);
    app.className = "app-shell detail-view";

    var detail = document.createElement("article");
    detail.className = "detail-layout";

    var imageWrap = document.createElement("section");
    imageWrap.className = "detail-media";
    var image = document.createElement("img");
    image.src = item.image;
    image.alt = item.brand + " " + item.name;
    imageWrap.appendChild(image);

    var info = document.createElement("section");
    info.className = "detail-info";
    info.appendChild(createText("p", "detail-brand", item.brand));
    info.appendChild(createText("h1", "detail-title", item.name));

    var list = document.createElement("dl");
    list.className = "detail-list";
    [
      ["Category", titleCase(item.category)],
      ["Color", titleCase(item.color)],
      ["Season", titleCase(item.season)],
      ["Tags", (item.tags || []).map(titleCase).join(", ")]
    ].forEach(function (row) {
      var term = createText("dt", "", row[0]);
      var description = createText("dd", "", row[1]);
      list.appendChild(term);
      list.appendChild(description);
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

  function renderRoute() {
    var match = window.location.hash.match(/^#item\/(.+)$/);
    if (match) {
      var id = decodeURIComponent(match[1]);
      var item = items.find(function (candidate) {
        return candidate.id === id;
      });
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
    var button = document.createElement("button");
    button.className = active ? "filter-chip is-active" : "filter-chip";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", function () {
      filters[key] = value;
      renderFilters();
      showCatalogFromControls();
    });
    return button;
  }

  function openFilters() {
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

  searchToggle.addEventListener("click", toggleSearch);
  filterToggle.addEventListener("click", openFilters);
  menuToggle.addEventListener("click", openFilters);
  filterClose.addEventListener("click", closeFilters);
  searchInput.addEventListener("input", showCatalogFromControls);
  clearFilters.addEventListener("click", function () {
    filters.category = "";
    filters.color = "";
    filters.season = "";
    searchInput.value = "";
    renderFilters();
    showCatalogFromControls();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeFilters();
      if (!searchPanel.hasAttribute("hidden")) {
        searchPanel.setAttribute("hidden", "");
        searchToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  window.addEventListener("hashchange", renderRoute);
  filterOverlay.inert = true;
  renderFilters();
  renderRoute();
})();
