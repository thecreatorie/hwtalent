/* HW Talent — galleries. Photos are listed in gallery-data.js: one line per photo.
   Photos are always shown whole, at their own proportions. Nothing here crops. */
(function () {
  var root = document.querySelector("[data-gallery]");
  if (!root) return;
  var items = window[root.getAttribute("data-gallery")] || [];
  var cats = window[root.getAttribute("data-cats")] || [];
  var bar = root.querySelector(".filters"), grid = root.querySelector(".gal");
  var empty = root.querySelector(".empty"), emptyName = root.querySelector("[data-empty-name]");
  var box = document.querySelector("dialog.lb");
  var current = "all";
  /* no photos listed yet: keep the gallery out of sight until there are */
  if (!items.length) { root.hidden = true; return; }
  root.hidden = false;

  function label(id) {
    for (var i = 0; i < cats.length; i++) if (cats[i][0] === id) return cats[i][1];
    return "";
  }

  function open(item) {
    if (!box || !box.showModal) return;
    var img = box.querySelector("img");
    img.src = item.src; img.alt = item.alt; img.width = item.w; img.height = item.h;
    box.querySelector(".cap").textContent = item.label;
    box.showModal();
  }
  if (box) {
    box.querySelector(".close").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (event) { if (event.target === box) box.close(); });
  }

  function render() {
    bar.querySelectorAll(".fbtn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-id") === current ? "true" : "false");
    });
    var list = items.filter(function (it) { return current === "all" || it.cat === current; });
    grid.innerHTML = "";
    list.forEach(function (it) {
      var fig = document.createElement("figure");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Enlarge: " + it.label);
      var img = document.createElement("img");
      img.src = it.thumb || it.src; img.alt = it.alt; img.width = it.w; img.height = it.h; img.loading = "lazy"; img.decoding = "async";
      btn.appendChild(img);
      btn.addEventListener("click", function () { open(it); });
      var cap = document.createElement("figcaption");
      cap.className = "lab";
      cap.textContent = it.label;
      fig.appendChild(btn); fig.appendChild(cap);
      grid.appendChild(fig);
    });
    grid.hidden = list.length === 0;
    empty.hidden = list.length !== 0;
    if (emptyName) emptyName.textContent = label(current);
  }

  function choose(id, remember) {
    current = id;
    render();
    if (remember) { try { history.replaceState(null, "", "#" + id); } catch (e) { /* preview frames may refuse */ } }
  }

  [["all", "All"]].concat(cats).forEach(function (c) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "fbtn"; b.textContent = c[1]; b.setAttribute("data-id", c[0]);
    b.addEventListener("click", function () { choose(c[0], true); });
    bar.appendChild(b);
  });

  function fromHash() {
    var id = (location.hash || "").slice(1);
    choose(id && label(id) ? id : "all", false);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
})();
