/* HW Talent — rentals: choose the pieces, describe the night, see the figure, sign.
   The catalog and its prices are in rental-data.js. The rules and the agreement are in booking-core.js.

   ONE SETTING:
   BOOKING_API  Leave empty until a card processor is chosen. While it is empty, the last step sends
                the signed booking to info@hw-talent.com and the director follows with a secure card
                link. Once a payment service exists, put its address here: the page then posts the
                signed booking to it and sends the client straight to the card page it returns. */
(function () {
  var BOOKING_API = "";
  var EMAIL = "info@hw-talent.com";

  var B = window.HWBooking, items = window.HW_RENTALS || [];
  var form = document.querySelector("form[data-book]");
  if (!form || !B) return;
  var cat = form.querySelector(".cat"), marks = document.querySelectorAll(".stepper span");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var picked = [], current = 1, q = null, answers = {};
  try { picked = JSON.parse(sessionStorage.getItem("hw-rent") || "[]"); } catch (e) { picked = []; }
  picked = picked.filter(function (id) { return items.some(function (it) { return it.id === id; }); });

  function $(sel) { return form.querySelector(sel); }
  function val(name) { var el = form.elements[name]; if (!el) return ""; return (el.value === undefined ? "" : String(el.value)).trim(); }
  function byId(id) { return items.filter(function (x) { return x.id === id; })[0]; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function el(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function say(step, text) { var s = form.querySelector('[data-step="' + step + '"] .status'); s.textContent = text; s.classList.toggle("on", !!text); if (text) s.focus(); }

  /* ---------- step 1: the catalog ---------- */
  function sync() {
    try { sessionStorage.setItem("hw-rent", JSON.stringify(picked)); } catch (e) { /* fine without it */ }
    cat.querySelectorAll(".item[data-id]").forEach(function (card) {
      var on = picked.indexOf(card.getAttribute("data-id")) !== -1, b = card.querySelector("button");
      card.classList.toggle("on", on);
      b.textContent = on ? "Remove" : "Add";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", (on ? "Remove " : "Add ") + card.getAttribute("data-title"));
    });
    $(".sel .count").textContent = picked.length === 1 ? "1 piece selected" : picked.length + " pieces selected";
    $(".sel .names").textContent = picked.map(function (id) { return B.title(byId(id)); }).join(" · ");
  }
  function toggle(id) { var i = picked.indexOf(id); if (i === -1) picked.push(id); else picked.splice(i, 1); sync(); }

  items.forEach(function (it) {
    var card = el("div", undefined, "item"); card.setAttribute("data-id", it.id); card.setAttribute("data-title", B.title(it));
    card.innerHTML = '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="' + it.d + '"/></svg>';
    card.appendChild(el("h3", it.name));
    card.appendChild(el("div", it.kind || " ", "lab"));
    if (it.specs) { var sp = el("ul", undefined, "spec"); it.specs.forEach(function (t) { sp.appendChild(el("li", t)); }); card.appendChild(sp); }
    var b = el("button"); b.type = "button"; b.addEventListener("click", function () { toggle(it.id); });
    card.appendChild(b); cat.appendChild(card);
  });
  var ask = el("div", undefined, "item ask");
  ask.innerHTML = '<div><h3>Something else in mind?</h3><div class="lab">We source it, rig it and strike it</div></div><a class="link" href="consult.html">Ask your director</a>';
  cat.appendChild(ask);

  var paths = cat.querySelectorAll("svg path");
  if (!calm && "IntersectionObserver" in window) {
    paths.forEach(function (p) { p.style.strokeDasharray = "1 1"; p.style.strokeDashoffset = "1"; p.style.opacity = "0"; });
    var seen = 0, io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var p = en.target; io.unobserve(p);
        setTimeout(function () { p.style.opacity = "1"; p.style.strokeDashoffset = "0"; }, 90 * (seen++ % 5));
      });
    }, { threshold: 0.3 });
    paths.forEach(function (p) { io.observe(p); });
  }

  /* ---------- step 2: one question for each chosen piece that has one (size, length, pole, height) ---------- */
  function renderOptions() {
    var wrap = $("[data-optwrap]"), box = $("[data-opts]"), any = false;
    box.querySelectorAll("[data-for]").forEach(function (f) { answers[f.getAttribute("data-for")] = f.value; });
    box.innerHTML = "";
    picked.forEach(function (id) {
      var it = byId(id); if (!it.opt) return; any = true;
      var f = el("div", undefined, "f"), lab = el("label", B.title(it) + " · " + it.opt.label + (it.opt.choices ? "" : " · optional"), "lab"), input;
      lab.setAttribute("for", "o-" + id);
      if (it.opt.choices) {
        input = el("select"); input.required = true; input.appendChild(new Option("Choose", ""));
        it.opt.choices.forEach(function (c) { input.appendChild(new Option(c, c)); });
      } else { input = el("input"); input.type = "text"; input.placeholder = it.opt.ph || ""; }
      input.id = "o-" + id; input.setAttribute("data-for", id); input.value = answers[id] || "";
      f.appendChild(lab); f.appendChild(input); box.appendChild(f);
    });
    wrap.hidden = !any;
  }
  function options() {
    var out = {};
    form.querySelectorAll("[data-opts] [data-for]").forEach(function (f) { var id = f.getAttribute("data-for"); if (f.value.trim() && picked.indexOf(id) !== -1) out[id] = f.value.trim(); });
    return out;
  }

  /* ---------- moving between steps ---------- */
  function show(n, quiet) {
    current = n;
    form.querySelectorAll(".step").forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== n; });
    marks.forEach(function (m, k) { m.classList.toggle("on", k === n - 1); m.classList.toggle("done", k < n - 1); });
    if (quiet) return;
    var h = form.querySelector('[data-step="' + n + '"] h2'); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    var top = document.querySelector(".stepper").getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: top, behavior: calm ? "auto" : "smooth" });
  }
  function valid(step) {
    var ok = true;
    form.querySelectorAll('[data-step="' + step + '"] input, [data-step="' + step + '"] select, [data-step="' + step + '"] textarea').forEach(function (f) {
      if (ok && !f.disabled && !f.closest("[hidden]") && !f.checkValidity()) { f.reportValidity(); ok = false; }
    });
    return ok;
  }
  function compute() {
    q = B.quote({ items: picked, first: val("First day"), days: val("Rental length"), area: val("Where"), today: today(),
      indoors: val("Setting") === "Indoors", ceiling: val("Ceiling height") }, items);
    return q;
  }

  /* ---------- step 3: the figure ---------- */
  function renderQuote() {
    var list = $(".qlines"); list.innerHTML = "";
    var chosen = options();
    q.lines.forEach(function (l) {
      var li = el("li"), left = el("span", l.label);
      left.appendChild(el("small", (chosen[l.id] ? chosen[l.id] + " · " : "") + (q.days > 1 ? q.days + " days · installed, lit and dressed" : "1 day · installed, lit and dressed")));
      li.appendChild(left); li.appendChild(el("b", B.money(l.amount))); list.appendChild(li);
    });
    if (q.minimum) {
      var m = el("li"), ml = el("span", "Crew call minimum"); ml.appendChild(el("small", "Every installation sends our own crew"));
      m.appendChild(ml); m.appendChild(el("b", B.money(q.minimum))); list.appendChild(m);
    }
    $("[data-total]").textContent = B.money(q.total);
    $("[data-totlab]").textContent = q.instant ? "Total" : "Estimate, before your director's review";
    var pay = $("[data-pay]"), review = $("[data-review]");
    pay.hidden = !q.instant; review.hidden = q.instant;
    if (q.instant) {
      var half = pay.querySelector('[value="retainer"]'), full = pay.querySelector('[value="full"]');
      half.closest(".chip").hidden = q.fullOnly;
      half.nextElementSibling.innerHTML = "Retainer today <b>" + B.money(q.retainer) + "</b>";
      full.nextElementSibling.innerHTML = "In full today <b>" + B.money(q.total) + "</b>";
      if (q.fullOnly || !pay.querySelector("input:checked")) (q.fullOnly ? full : half).checked = true;
      $("[data-paynote]").textContent = q.fullOnly ? "With the date this near, the installation is paid in full on signing."
        : "With the retainer, the balance of " + B.money(q.balance) + " is due by " + B.longDate(q.balanceDue) + ".";
    } else {
      var ul = review.querySelector("ul"); ul.innerHTML = "";
      q.reasons.forEach(function (r) { ul.appendChild(el("li", r)); });
    }
  }

  /* ---------- step 4: sign, or hand to the director ---------- */
  function details() {
    return { name: val("Name"), company: val("Company"), venue: val("Venue"), options: options(), pay: (form.querySelector('[name="Payment"]:checked') || {}).value || "retainer" };
  }
  function renderAgreement() {
    var box = $(".agreement"); box.innerHTML = "";
    B.agreement(q, details()).forEach(function (sec) {
      box.appendChild(el("h3", sec.h));
      sec.p.forEach(function (t) { box.appendChild(el("p", t)); });
    });
  }
  function renderLast() {
    var sign = $("[data-sign]"), d = details(), due = q.fullOnly || d.pay === "full" ? q.total : q.retainer;
    sign.hidden = !q.instant;
    sign.querySelectorAll("input").forEach(function (f) { f.disabled = !q.instant; });
    $("[data-h4]").innerHTML = q.instant ? "Sign and <em>reserve.</em>" : "Your director takes it <em>from here.</em>";
    $("[data-send]").textContent = !q.instant ? "Send to my director" : (BOOKING_API ? "Sign and pay " + B.money(due) + " by card" : "Sign and reserve");
    $("[data-lastnote]").textContent = !q.instant ? "Your figure and details go to your Entertainment Director, who confirms the rest with you personally."
      : (BOOKING_API ? "Your card is taken on a secure page. Your date is held the moment it clears."
        : "Your signed booking goes to your Entertainment Director, who confirms the date and sends your secure card link.");
    if (q.instant) renderAgreement();
  }
  ["Name", "Company"].forEach(function (n) { form.elements[n].addEventListener("input", function () { if (current === 4 && q && q.instant) renderAgreement(); }); });

  form.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (!b) return;
    var to = +b.getAttribute("data-go");
    if (to > current) {
      if (current === 1 && !picked.length) { say(1, "Choose at least one piece to continue."); return; }
      say(1, "");
      if (current === 1) renderOptions();
      if (current === 2) {
        if (!valid(2)) return;
        compute();
        if (!q.ok) { say(2, q.errors.join(" ")); return; }
        say(2, "");
      }
      if (to >= 3) { if (!q) compute(); if (!q.ok) { show(2); return; } renderQuote(); }
      if (to === 4) renderLast();
    }
    show(to);
  });

  /* ---------- sending ---------- */
  function rows() {
    var d = details(), out = [
      ["Pieces", q.lines.map(function (l) { return l.label + (d.options[l.id] ? " (" + d.options[l.id] + ")" : "") + " " + B.money(l.amount); }).join("; ")],
      ["First day", B.longDate(q.first)], ["Rental length", q.days === 1 ? "1 day" : q.days + " days, to " + B.longDate(q.last)], ["Where", B.AREAS[q.area]],
      ["Venue", val("Venue")], ["Setting", val("Setting")], ["Ceiling height (ft)", val("Ceiling height")], ["Floor", val("Floor")], ["Ready by", val("Ready by")],
      ["On the equipment", val("Performers")], ["Colours or theme", val("Colours or theme")], ["Notes", val("Notes")],
      ["Total", B.money(q.total)],
      ["Name", d.name], ["Company", d.company], ["Email", val("Email")], ["Phone", val("Phone")]
    ];
    if (q.instant) out.push(["Payment chosen", q.fullOnly || d.pay === "full" ? "In full, " + B.money(q.total) : "Retainer " + B.money(q.retainer) + ", balance " + B.money(q.balance) + " by " + B.longDate(q.balanceDue)],
      ["Agreement", B.RULES.version], ["Signed by", val("Signature")], ["Signed at", new Date().toString()]);
    else out.push(["For the director", q.reasons.join(" ")]);
    return out.filter(function (r) { return r[1]; });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.elements["bot-field"].value) return;
    if (current !== 4 || !q || !q.ok || !valid(4)) return;
    if (q.instant && val("Signature").toLowerCase() !== val("Name").toLowerCase()) { say(4, "Sign with your full name exactly as entered above."); return; }
    var body = rows();
    function byEmail(lead) {
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(q.instant ? "Signed rental booking" : "Rental request") +
        "&body=" + encodeURIComponent(body.map(function (r) { return r[0] + ": " + r[1]; }).join("\n"));
      say(4, lead + " Your email app should now be open with everything ready to send. If it did not open, email " + EMAIL + ".");
    }
    if (!q.instant || !BOOKING_API) { byEmail(q.instant ? "Signed." : "Ready."); return; }
    var payload = { items: picked, first: q.first, last: q.last, area: q.area, pay: details().pay, signature: val("Signature"), agreement: B.RULES.version, fields: {} };
    body.forEach(function (r) { payload.fields[r[0]] = r[1]; });
    say(4, "Opening the secure card page.");
    fetch(BOOKING_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (r) { if (!r || !r.url) return Promise.reject(); try { sessionStorage.removeItem("hw-rent"); } catch (x) { /* fine */ } window.location.href = r.url; })
      .catch(function () { say(4, "The card page could not be reached, and nothing has been charged. Please try again, or email " + EMAIL + "."); });
  });

  sync(); show(1, true);
})();
