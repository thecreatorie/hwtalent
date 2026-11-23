/* HW Talent — sparks, story, reel, LED demo, consultation and forms.

   THREE SETTINGS, all on the next few lines:

   CALENDLY_URL  Paste the link to your 30-minute event (for example "https://calendly.com/your-name/30min").
                 The consultation page then shows your live calendar. While it is empty, the page asks
                 for a preferred day and time instead, so nothing is broken in the meantime.
   FORM_MODE     "mailto" works on any host (it opens the visitor's email app with the request filled in).
                 Change it to "netlify" once the site is on Netlify with Forms switched on, and requests
                 arrive in the Netlify dashboard and your inbox with no email app involved.
   HERO_VIDEO    Optional. Path to a silent looping film for the home page hero, for example
                 "assets/video/hero.mp4". Leave empty to keep the hoop of light. */
(function () {
  var CALENDLY_URL = "https://calendly.com/hw-talent-info/30min";
  var FORM_MODE = "mailto";
  var HERO_VIDEO = "";
  var EMAIL = "info@hw-talent.com";

  var root = document.documentElement;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- opening curtain (first page of a visit only) ---------- */
  var firstVisit = !root.classList.contains("seen") && !calm && !!document.querySelector(".intro");
  var wait = firstVisit ? 1500 : 0;
  try { sessionStorage.setItem("hw-seen", "1"); } catch (e) { /* fine without it */ }
  setTimeout(function () { root.classList.add("ready"); }, wait);

  /* ---------- header and menu ---------- */
  var top = document.querySelector(".top"), burger = document.querySelector(".burger"), menu = document.querySelector(".menu");
  var lastY = window.scrollY, bar = document.createElement("i");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); if (top) top.appendChild(bar);
  function onScroll() {
    if (!top) return;
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    top.classList.toggle("solid", y > 40);
    if (menu && menu.classList.contains("open")) top.classList.remove("away");
    else if (y > lastY + 6 && y > 320) top.classList.add("away");
    else if (y < lastY - 6 || y < 320) top.classList.remove("away");
    lastY = y;
    bar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener("focusin", function () { top.classList.remove("away"); });
  function setMenu(open) {
    menu.classList.toggle("open", open);
    document.body.classList.toggle("locked", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.textContent = open ? "Close" : "Menu";
    if (open) { var first = menu.querySelector("a"); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); burger.focus(); }
    });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* ---------- reveals ---------- */
  var targets = document.querySelectorAll(".rv, .up");
  if ("IntersectionObserver" in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    setTimeout(function () { targets.forEach(function (t) { io.observe(t); }); }, wait ? wait - 250 : 0);
  } else {
    targets.forEach(function (t) { t.classList.add("in"); });
  }

  /* ---------- optional hero film ---------- */
  var hero = document.querySelector(".hero");
  if (HERO_VIDEO && hero && !calm) {
    var hv = document.createElement("div"); hv.className = "herovideo"; hv.setAttribute("aria-hidden", "true");
    var v = document.createElement("video");
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.src = HERO_VIDEO;
    hv.appendChild(v); hero.insertBefore(hv, hero.firstChild);
    hero.removeAttribute("data-form");
  }

  /* ---------- sparks: one field of light behind every page, rearranging itself as you scroll ---------- */
  (function sparks() {
    var canvas = document.createElement("canvas");
    canvas.className = "sparks"; canvas.setAttribute("aria-hidden", "true");
    var gl = null;
    try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { gl = null; }
    if (!gl) return;
    document.body.insertBefore(canvas, document.body.firstChild);

    var VERT = [
      "attribute vec3 a_from; attribute vec3 a_to; attribute float a_seed;",
      "uniform float u_mix,u_t,u_asp,u_ang,u_mode,u_px,u_bright,u_heat,u_shift; uniform vec2 u_c,u_m;",
      "varying vec3 v_col; varying float v_a;",
      "void main(){",
      " float s=a_seed;",
      " float m=clamp(u_mix*1.6-s*.6,0.,1.); m=m*m*(3.-2.*m);",
      " vec2 d=a_to.xy-u_c; float ca=cos(u_ang),sa=sin(u_ang);",
      " vec2 r=u_mode<.5?vec2(d.x*ca-d.y*sa,d.x*sa+d.y*ca):(u_mode<1.5?vec2(d.x*ca,d.y):d);",
      " vec2 to=mix(a_to.xy,u_c+r,a_to.z);",
      " vec2 p=mix(a_from.xy,to,m);",
      " float w=mix(a_from.z,a_to.z,m);",
      " float f=fract(s*91.7);",
      " p+=vec2(sin(u_t*(.2+f*.5)+s*40.),cos(u_t*(.17+f*.4)+s*23.))*mix(.045,.005,w);",
      " vec2 q=p-u_m; p+=normalize(q+vec2(1e-5))*.1*exp(-dot(q,q)*13.);",
      " p.y+=u_shift;",
      " gl_Position=vec4(p.x/u_asp,p.y,0.,1.);",
      " float tw=.55+.45*sin(u_t*(.7+f*2.4)+s*60.);",
      " float big=pow(fract(s*7.31),7.);",
      " gl_PointSize=(1.25+2.8*big+w*.35)*u_px;",
      " float k=fract(s*13.37);",
      " vec3 c=k<.1+.16*u_heat?vec3(.949,.071,.184):(k<.24+.5*u_heat?vec3(1.,.702,.278):vec3(.957,.965,.973));",
      " v_col=c; v_a=u_bright*tw*mix(.42,.9,w);",
      "}"
    ].join("\n");
    var FRAG = "precision mediump float;varying vec3 v_col;varying float v_a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(v_col*smoothstep(.5,.18,d)*v_a,1.);}";
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.parentNode.removeChild(canvas); return; }
    gl.useProgram(prog);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.clearColor(0.031, 0.035, 0.039, 1);

    var small = Math.min(window.innerWidth, window.innerHeight) < 700 || window.innerWidth < 800;
    var N = small ? 5200 : 14000;
    var seeds = new Float32Array(N), from = new Float32Array(N * 3), to = new Float32Array(N * 3);
    var i;
    for (i = 0; i < N; i++) seeds[i] = Math.random();
    function buffer(name, data, size, usage) {
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      var loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return b;
    }
    buffer("a_seed", seeds, 1, gl.STATIC_DRAW);
    var bFrom = buffer("a_from", from, 3, gl.DYNAMIC_DRAW), bTo = buffer("a_to", to, 3, gl.DYNAMIC_DRAW);
    function upload(b, data) { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferSubData(gl.ARRAY_BUFFER, 0, data); }
    var U = {};
    ["mix", "t", "asp", "ang", "mode", "px", "bright", "heat", "shift", "c", "m"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, "u_" + n); });

    var A = 1, P = false, W = 0, H = 0;
    /* a small repeatable random, so a shape is the same shape every time it forms */
    function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function line(x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return { len: Math.sqrt(dx * dx + dy * dy), at: function (t) { return [x1 + dx * t, y1 + dy * t]; } }; }
    function ring(cx, cy, rx, ry, rot) { var c = Math.cos(rot || 0), s = Math.sin(rot || 0); ry = ry === undefined ? rx : ry;
      return { len: Math.PI * (rx + ry), at: function (t) { var a = t * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; } }; }
    function curve(len, fn) { return { len: len, at: fn }; }
    /* spread count points evenly along a set of shapes */
    function trace(shapes, count, out, o, jit, r) {
      var total = 0, k, j = 0, acc = 0;
      for (k = 0; k < shapes.length; k++) total += shapes[k].len;
      for (k = 0; k < count; k++) {
        var s = (k + 0.5) / count * total;
        while (j < shapes.length - 1 && s > acc + shapes[j].len) { acc += shapes[j].len; j++; }
        var p = shapes[j].at((s - acc) / shapes[j].len);
        out[o++] = p[0] + (r() - 0.5) * jit; out[o++] = p[1] + (r() - 0.5) * jit; out[o++] = 1;
      }
      return o;
    }
    function dust(count, out, o, r, show) {
      for (var k = 0; k < count; k++) {
        var on = r() < show;
        out[o++] = (r() * 2 - 1) * A * 1.05; out[o++] = on ? r() * 2 - 1 : -1.25 - r() * 0.5; out[o++] = 0;
      }
      return o;
    }
    /* where a formation may sit: beside the headline when it is short, otherwise in the free space
       between the header and the first words of its section. It never sits behind the words. */
    function textRight(h1) {
      var walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT, null), right = 0, node, rg = document.createRange();
      while ((node = walker.nextNode())) { rg.selectNodeContents(node); var rects = rg.getClientRects(); for (var k = 0; k < rects.length; k++) right = Math.max(right, rects[k].right); }
      return right;
    }
    function side(above) {
      var top = 100, bottom = H * (P ? 0.5 : 0.6), cx = P ? 0 : A * 0.5;
      if (zoneEl) {
        var zb = zoneEl.getBoundingClientRect(), w = zoneEl.querySelector(".wrap"), first = w && w.firstElementChild, h1 = zoneEl.querySelector("h1");
        if (first) bottom = first.getBoundingClientRect().top - zb.top - 26;
        var tr = h1 && !P ? textRight(h1) : W;
        if (!above && W - tr > W * 0.32) {
          var left = tr + 96, right = W - 56, low = Math.min(H, zb.height) - 70;
          var R2 = Math.min((low - top) / H, (right - left) / H, 0.62);
          return [((left + right) / W - 1) * A, 1 - (top + low) / H, R2];
        }
      }
      var h = Math.max(110, bottom - top), R = Math.min(h / H, P ? A * 0.8 : 0.6);
      return [cx, 1 - (top + h / 2) * 2 / H, R];
    }

    function flower(out, r, cx, cy, size) {
      var S = size / 7;
      function hypo(k) { return curve(60 * S * k, function (t) { var a = t * Math.PI * 6; return [cx + (2 * Math.cos(a) + 5 * Math.cos(2 * a / 3)) * S * k, cy + (2 * Math.sin(a) - 5 * Math.sin(2 * a / 3)) * S * k]; }); }
      var n1 = Math.floor(N * 0.5), n2 = Math.floor(N * 0.2), n3 = Math.floor(N * 0.12);
      var o = trace([hypo(1)], n1, out, 0, 0.008, r);
      o = trace([hypo(0.74)], n2, out, o, 0.005, r);
      o = trace([hypo(0.5)], n3, out, o, 0.004, r);
      dust(N - n1 - n2 - n3, out, o, r, 0.7); return [cx, cy];
    }

    var FORMS = {
      embers: { bright: 0.5, heat: 0.3, mode: 2, spin: 0, build: function (out, r) { dust(N, out, 0, r, 0.3); return [0, 0]; } },
      /* an aerial hoop, turning on its hang point */
      ring: { bright: 1, heat: 0.3, mode: 1, spin: 0.32, build: function (out, r) {
        var s = side(), cx = s[0], cy = s[1], R = s[2], n1 = Math.floor(N * 0.58), n2 = Math.floor(N * 0.12), n3 = Math.floor(N * 0.05);
        var o = trace([ring(cx, cy, R)], n1, out, 0, 0.012, r);
        o = trace([ring(cx, cy, R * 0.955)], n2, out, o, 0.006, r);
        o = trace([line(cx, cy + R, cx, Math.max(cy + R + 0.02, 1 - 176 / H))], n3, out, o, 0.004, r);
        dust(N - n1 - n2 - n3, out, o, r, 0.55); return [cx, cy];
      } },
      /* imagine: a drifting halo with room in the middle for the word */
      cloud: { bright: 0.8, heat: 0.15, mode: 0, spin: 0.05, build: function (out, r) {
        var S = P ? A * 0.95 : 0.95, n = Math.floor(N * 0.8), o = 0;
        for (var k = 0; k < n; k++) { var a = r() * Math.PI * 2, rr = (0.62 + 0.55 * Math.pow(r(), 1.6)) * S;
          out[o++] = Math.cos(a) * rr * (P ? 1 : 1.35); out[o++] = Math.sin(a) * rr; out[o++] = 0.5; }
        dust(N - n, out, o, r, 0.5); return [0, 0];
      } },
      /* engineer: the same light, snapped to a drawing */
      lattice: { bright: 0.6, heat: 0.1, mode: 0, spin: 0.018, build: function (out, r) {
        var S = P ? A * 0.9 : 0.9, sh = [ring(0, 0, S), ring(0, 0, S * 0.66), ring(0, 0, S * 0.33), line(-S * 1.12, 0, S * 1.12, 0), line(0, -S * 1.12, 0, S * 1.12),
          line(-S, -S, S, -S), line(S, -S, S, S), line(S, S, -S, S), line(-S, S, -S, -S), line(0, S, S, 0), line(S, 0, 0, -S), line(0, -S, -S, 0), line(-S, 0, 0, S)];
        var n = Math.floor(N * 0.88), o = trace(sh, n, out, 0, 0.002, r);
        dust(N - n, out, o, r, 0.4); return [0, 0];
      } },
      /* astonish: it blooms */
      bloom: { bright: 0.95, heat: 1, mode: 0, spin: 0.07, build: function (out, r) { return flower(out, r, 0, 0, P ? A * 0.92 : 0.92); } },
      star: { bright: 0.9, heat: 0.9, mode: 0, spin: 0.07, build: function (out, r) { var s = side(); return flower(out, r, s[0], s[1], s[2]); } },
      /* costumes: thread */
      weave: { bright: 0.75, heat: 0.25, mode: 2, spin: 0, build: function (out, r) {
        var sh = [], X = A * 1.08, k, z = side(true), lo = z[1] - z[2] + 0.07, step = (2 * z[2] - 0.14) / 8;
        function wave(y0, ph, amp) { return curve(X * 2, function (t) { var x = -X + t * X * 2; return [x, y0 + amp * Math.sin(x * 3.1 + ph)]; }); }
        for (k = 0; k < 9; k++) sh.push(wave(lo + k * step, k * 1.9, Math.min(0.06, step * 0.7) + 0.01 * (k % 3)));
        var n = Math.floor(N * 0.8), o = trace(sh, n, out, 0, 0.003, r);
        dust(N - n, out, o, r, 0.4); return [0, 0];
      } },
      /* custom: a panel of LEDs */
      matrix: { bright: 0.8, heat: 0.45, mode: 2, spin: 0, build: function (out, r) {
        var z = side(), g = P ? 0.062 : 0.05, x0 = P ? -A : Math.max(-A, z[0] - z[2] * 1.25), x1 = P ? A : Math.min(A, z[0] + z[2] * 1.25), y0 = z[1] - z[2], y1 = z[1] + z[2];
        var cols = Math.floor((x1 - x0) / g), rws = Math.max(1, Math.floor((y1 - y0) / g)), n = Math.floor(N * 0.72), o = 0;
        for (var k = 0; k < n; k++) { var c = k % cols, w = Math.floor(k / cols) % rws;
          out[o++] = x0 + (c + 0.5) * g + (r() - 0.5) * 0.004; out[o++] = y0 + (w + 0.5) * g + (r() - 0.5) * 0.004; out[o++] = 1; }
        dust(N - n, out, o, r, 0.3); return [0, 0];
      } },
      /* workshops: things kept in the air */
      orbit: { bright: 0.85, heat: 0.35, mode: 0, spin: 0.1, build: function (out, r) {
        var s = side(), R = s[2], sh = [ring(s[0], s[1], R, R * 0.36, 0), ring(s[0], s[1], R, R * 0.36, Math.PI / 3), ring(s[0], s[1], R, R * 0.36, -Math.PI / 3), ring(s[0], s[1], R * 0.07)];
        var n = Math.floor(N * 0.74), o = trace(sh, n, out, 0, 0.008, r);
        dust(N - n, out, o, r, 0.5); return [s[0], s[1]];
      } },
      /* join: a spotlight opening */
      burst: { bright: 0.8, heat: 0.5, mode: 0, spin: 0.03, build: function (out, r) {
        var s = side(), sh = [];
        for (var k = 0; k < 60; k++) { var a = k / 60 * Math.PI * 2, l = s[2] * (0.45 + 0.55 * r());
          sh.push(line(s[0] + Math.cos(a) * s[2] * 0.16, s[1] + Math.sin(a) * s[2] * 0.16, s[0] + Math.cos(a) * l, s[1] + Math.sin(a) * l)); }
        var n = Math.floor(N * 0.72), o = trace(sh, n, out, 0, 0.004, r);
        dust(N - n, out, o, r, 0.5); return [s[0], s[1]];
      } },
      /* rentals: the quad rig, with a hoop flying from it */
      rig: { bright: 0.9, heat: 0.2, mode: 2, spin: 0, build: function (out, r) {
        var s = side(), S = s[2] * 0.98, cy = s[1];
        function X(x) { return s[0] + (x - 60) / 60 * S; } function Y(y) { return cy - (y - 60) / 60 * S; }
        function L(a, b, c, d) { return line(X(a), Y(b), X(c), Y(d)); }
        var sh = [L(10, 98, 76, 114), L(76, 114, 110, 92), L(110, 92, 44, 78), L(44, 78, 10, 98), L(10, 98, 60, 8), L(76, 114, 60, 8), L(110, 92, 60, 8), L(44, 78, 60, 8),
          L(60, 8, 60, 40), ring(X(60), Y(58), S * 0.3), ring(X(60), Y(58), S * 0.285)];
        var n = Math.floor(N * 0.76), o = trace(sh, n, out, 0, 0.005, r);
        dust(N - n, out, o, r, 0.45); return [s[0], cy];
      } }
    };

    var cur = null, name = "", centre = [0, 0], mix = 1, tSwitch = 0, ang = 0, bright = 0, heat = 0.3, shift = 0, shiftTo = 0;
    var zoneEl = null, mouse = [9, 9], mouseTo = [9, 9], now = 0, t0 = performance.now(), sections = [], story = document.querySelector(".story");

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      A = W / H; P = A < 0.9;
      gl.uniform1f(U.asp, A); gl.uniform1f(U.px, dpr * (small ? 0.9 : 1));
    }
    function place(next, instant) {
      var f = FORMS[next] || FORMS.embers, k;
      if (cur && !instant) {
        /* where every spark is right now becomes where it leaves from */
        var ca = Math.cos(ang), sa = Math.sin(ang);
        for (k = 0; k < N; k++) {
          var s = seeds[k], m = clamp(mix * 1.6 - s * 0.6, 0, 1); m = m * m * (3 - 2 * m);
          var tx = to[k * 3], ty = to[k * 3 + 1], tz = to[k * 3 + 2], dx = tx - centre[0], dy = ty - centre[1], rx = dx, ry = dy;
          if (cur.mode === 0) { rx = dx * ca - dy * sa; ry = dx * sa + dy * ca; } else if (cur.mode === 1) { rx = dx * ca; }
          var px = tx + (centre[0] + rx - tx) * tz, py = ty + (centre[1] + ry - ty) * tz;
          from[k * 3] += (px - from[k * 3]) * m; from[k * 3 + 1] += (py - from[k * 3 + 1]) * m; from[k * 3 + 2] += (tz - from[k * 3 + 2]) * m;
        }
      }
      var h = 7; for (k = 0; k < next.length; k++) h = (h * 31 + next.charCodeAt(k)) | 0;
      centre = f.build(to, rng(h));
      var jump = !cur || instant || calm;
      if (jump) from.set(to);
      upload(bFrom, from); upload(bTo, to);
      cur = f; name = next; mix = jump ? 1 : 0;
      tSwitch = now; ang = 0;
      if (jump) { bright = f.bright; heat = f.heat; }
    }
    function wanted() {
      var pick = "embers", parallax = 0, k, el = null;
      for (k = 0; k < sections.length; k++) {
        var b = sections[k].getBoundingClientRect();
        if (b.top < H * 0.62 && b.bottom > H * 0.38) {
          pick = sections[k].getAttribute("data-form"); el = sections[k];
          parallax = clamp((H / 2 - (b.top + b.height / 2)) / H, -1, 1) * 0.55;
        }
      }
      if (story) {
        var sb = story.getBoundingClientRect();
        if (sb.top < H * 0.62 && sb.bottom > H * 0.38) {
          var span = sb.height - H, p = span > 0 ? clamp(-sb.top / span, 0, 1) : 0;
          pick = story.classList.contains("flat") ? "bloom" : (p < 0.3 ? "cloud" : (p < 0.66 ? "lattice" : "bloom")); parallax = 0; el = null;
        }
      }
      zoneEl = el; shiftTo = parallax;
      return pick;
    }
    function draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.mix, mix); gl.uniform1f(U.t, now); gl.uniform1f(U.ang, ang); gl.uniform1f(U.mode, cur.mode);
      gl.uniform1f(U.bright, bright); gl.uniform1f(U.heat, heat); gl.uniform1f(U.shift, shift);
      gl.uniform2f(U.c, centre[0], centre[1]); gl.uniform2f(U.m, mouse[0], mouse[1]);
      gl.drawArrays(gl.POINTS, 0, N);
    }
    var last = 0;
    function frame(ms) {
      var t = (ms - t0) / 1000, dt = Math.min(0.05, t - last); last = t; now = t;
      var want = wanted();
      if (want !== name) place(want, false);
      mix = Math.min(1, mix + dt / 2.4);
      ang = cur.spin * (now - tSwitch);
      bright += (cur.bright - bright) * 0.04; heat += (cur.heat - heat) * 0.04; shift += (shiftTo - shift) * 0.08;
      mouse[0] += (mouseTo[0] - mouse[0]) * 0.08; mouse[1] += (mouseTo[1] - mouse[1]) * 0.08;
      draw();
      requestAnimationFrame(frame);
    }
    function still() { var want = wanted(); if (want !== name) place(want, true); shift = shiftTo; draw(); }

    sections = Array.prototype.slice.call(document.querySelectorAll("[data-form]"));
    size(); now = calm ? 30 : 0; place(wanted(), true);
    if (calm) {
      /* no motion, but drawn every frame so the picture never goes stale */
      (function hold() { still(); requestAnimationFrame(hold); })();
    } else {
      requestAnimationFrame(frame);
      window.addEventListener("pointermove", function (e) {
        if (e.pointerType === "touch") return;
        mouseTo[0] = (e.clientX / W * 2 - 1) * A; mouseTo[1] = 1 - e.clientY / H * 2 - shift;
      }, { passive: true });
    }
    /* the headline's width is only final once its font has loaded: place the formation again then */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(name, true); });
    var rs;
    window.addEventListener("resize", function () {
      clearTimeout(rs);
      rs = setTimeout(function () { if (window.innerWidth === W && Math.abs(window.innerHeight - H) < 140) return; size(); place(name, true); if (calm) still(); }, 160);
    });
  })();

  /* ---------- story: three beats, pinned ---------- */
  var storyEl = document.querySelector(".story");
  if (storyEl) {
    if (calm) storyEl.classList.add("flat");
    else {
      var beats = storyEl.querySelectorAll(".beat"), dots = storyEl.querySelectorAll(".dots i"), shown = -1;
      var beat = function () {
        var b = storyEl.getBoundingClientRect(), span = b.height - window.innerHeight;
        var p = span > 0 ? clamp(-b.top / span, 0, 1) : 0, idx = p < 0.3 ? 0 : (p < 0.66 ? 1 : 2);
        if (idx !== shown) {
          shown = idx;
          beats.forEach(function (el, n) { el.classList.toggle("on", n === idx); });
          dots.forEach(function (el, n) { el.classList.toggle("on", n === idx); });
        }
      };
      window.addEventListener("scroll", beat, { passive: true }); beat();
    }
  }

  /* ---------- the work: the page scrolls down, the photographs move sideways ---------- */
  document.querySelectorAll(".hs").forEach(function (hs) {
    var track = hs.querySelector(".track"), bar = hs.querySelector(".bar i"), dist = 0, on = false;
    var slide = function () {
      if (!on) return;
      var p = dist > 0 ? clamp(-hs.getBoundingClientRect().top / dist, 0, 1) : 0;
      track.style.transform = "translate3d(" + (-p * dist) + "px,0,0)";
      if (bar) bar.style.transform = "scaleX(" + p + ")";
    };
    var measure = function () {
      on = !calm && window.innerWidth >= 900 && window.innerHeight >= 560;
      hs.classList.toggle("flat", !on);
      if (!on) { hs.style.height = ""; track.style.transform = ""; return; }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      hs.style.height = (window.innerHeight + dist) + "px";
      slide();
    };
    window.addEventListener("scroll", slide, { passive: true });
    var hr; window.addEventListener("resize", function () { clearTimeout(hr); hr = setTimeout(measure, 150); });
    measure(); window.addEventListener("load", measure);
  });

  /* ---------- LED demo: type a name, pick a program ---------- */
  var FONT = {
    A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110", C: "01110 10001 10000 10000 10000 10001 01110",
    D: "11110 10001 10001 10001 10001 10001 11110", E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
    G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001", I: "01110 00100 00100 00100 00100 00100 01110",
    J: "00111 00010 00010 00010 00010 10010 01100", K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
    M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 11001 10101 10011 10001 10001 10001", O: "01110 10001 10001 10001 10001 10001 01110",
    P: "11110 10001 10001 11110 10000 10000 10000", Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
    S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100", U: "10001 10001 10001 10001 10001 10001 01110",
    V: "10001 10001 10001 10001 10001 01010 00100", W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
    Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
    0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110", 2: "01110 10001 00001 00010 00100 01000 11111",
    3: "11110 00001 00001 01110 00001 00001 11110", 4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
    6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000", 8: "01110 10001 10001 01110 10001 10001 01110",
    9: "01110 10001 10001 01111 00001 00010 01100", "&": "01100 10010 10100 01000 10101 10010 01101"
  };
  var INK = [[244, 246, 248], [255, 179, 71], [242, 18, 47]];
  function led(canvas, input, buttons) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var COLS = 78, ROWS = 11, W = 0, H = 0, pitch = 0, lit = {}, born = {}, t0 = null, program = "chase";
    function layout() {
      W = canvas.getBoundingClientRect().width; pitch = W / COLS; H = pitch * ROWS;
      canvas.style.height = H + "px";
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function compose(now) {
      var text = (input.value || input.getAttribute("placeholder") || "").toUpperCase().slice(0, 13);
      var cols = [];
      for (var i = 0; i < text.length; i++) {
        var g = FONT[text[i]], rows = g ? g.split(" ") : null;
        for (var c = 0; c < 5; c++) { var col = []; for (var r = 0; r < 7; r++) col.push(rows ? rows[r][c] === "1" : false); cols.push(col); }
        if (i < text.length - 1) cols.push([false, false, false, false, false, false, false]);
      }
      var next = {}, off = Math.floor((COLS - cols.length) / 2);
      cols.forEach(function (col, x) { col.forEach(function (on, y) { if (on) next[(x + off) + "," + (y + 2)] = 1; }); });
      Object.keys(next).forEach(function (key) { if (!lit[key]) born[key] = now || 0; });
      lit = next;
    }
    function draw(now) {
      if (t0 === null) t0 = now;
      var t = calm ? 0.8 : (now - t0) / 1000;
      /* one colour at a time, the way a programmed prop runs: white, then amber, then red */
      var ink = INK[Math.floor(t / 3.2) % 3], head = ((t / 3.2) % 1) * (COLS + 24) - 12;
      ctx.clearRect(0, 0, W, H);
      for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {
          var key = x + "," + y, lon = lit[key];
          var cx = x * pitch + pitch / 2, cy = y * pitch + pitch / 2;
          ctx.beginPath();
          if (lon) {
            var age = calm ? 1 : Math.min(1, (now - (born[key] || 0)) / 380), lvl = 1;
            if (program === "chase") lvl = x < head ? (head - x < 7 ? 1 : 0.62) : 0.14;
            else if (program === "pulse") lvl = 0.3 + 0.7 * Math.pow(0.5 + 0.5 * Math.sin(t * 2.6), 2);
            else if (program === "sparkle") lvl = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * 5 + x * 12.9898 + y * 78.233), 6);
            if (calm) lvl = 1;
            ctx.arc(cx, cy, pitch * (0.22 + 0.19 * age), 0, Math.PI * 2);
            ctx.fillStyle = "rgba(" + ink[0] + "," + ink[1] + "," + ink[2] + "," + (0.12 + 0.88 * lvl) + ")";
          } else {
            ctx.arc(cx, cy, pitch * 0.11, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(244,246,248,.1)";
          }
          ctx.fill();
        }
      }
      if (!calm) requestAnimationFrame(draw);
    }
    layout(); compose(0); requestAnimationFrame(draw);
    input.addEventListener("input", function () { compose(performance.now()); if (calm) requestAnimationFrame(draw); });
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        program = b.getAttribute("data-program");
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      });
    });
    var again;
    window.addEventListener("resize", function () { clearTimeout(again); again = setTimeout(function () { layout(); if (calm) requestAnimationFrame(draw); }, 150); });
  }
  var ledCanvas = document.querySelector("canvas[data-led]"), ledInput = document.querySelector("#led-text");
  if (ledCanvas && ledInput) led(ledCanvas, ledInput, Array.prototype.slice.call(document.querySelectorAll("[data-program]")));

  /* ---------- consultation: step one, a time; step two, the event ---------- */
  var consult = document.querySelector("form[data-consult]");
  if (consult) {
    var s1 = consult.querySelector('[data-step="1"]'), s2 = consult.querySelector('[data-step="2"]');
    var marks = document.querySelectorAll(".stepper span"), next = consult.querySelector("[data-next]"), back = consult.querySelector("[data-back]");
    var cal = consult.querySelector("[data-cal]"), nocal = consult.querySelector("[data-nocal]"), booked = consult.querySelector('[name="Call booked"]');
    var picked = consult.querySelector("[data-picked]"), opened = false;
    var go = function (n) {
      s1.hidden = n !== 1; s2.hidden = n !== 2;
      marks.forEach(function (m, k) { m.classList.toggle("on", k === n - 1); m.classList.toggle("done", k < n - 1); });
      var h = (n === 1 ? s1 : s2).querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      var y = consult.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: calm ? "auto" : "smooth" });
    };
    var valid = function (scope) {
      var ok = true;
      scope.querySelectorAll("input,select,textarea").forEach(function (el) { if (ok && !el.disabled && !el.checkValidity()) { el.reportValidity(); ok = false; } });
      return ok;
    };
    s2.hidden = true; next.hidden = false; back.hidden = false;
    if (CALENDLY_URL) {
      nocal.hidden = true;
      nocal.querySelectorAll("input,select").forEach(function (el) { el.disabled = true; });
      next.textContent = "Choose a time";
      window.addEventListener("message", function (e) {
        if (e.origin !== "https://calendly.com" || !e.data || e.data.event !== "calendly.event_scheduled") return;
        booked.value = "Yes, through the calendar"; go(2);
      });
    } else {
      nocal.querySelectorAll("[data-need]").forEach(function (el) { el.required = true; });
    }
    next.addEventListener("click", function () {
      if (!valid(s1)) return;
      if (!CALENDLY_URL || opened) { go(2); return; }
      opened = true; cal.hidden = false; next.hidden = true; picked.hidden = false;
      var start = function () {
        window.Calendly.initInlineWidget({
          url: CALENDLY_URL + (CALENDLY_URL.indexOf("?") === -1 ? "?" : "&") + "hide_gdpr_banner=1&hide_event_type_details=1",
          parentElement: cal,
          prefill: { name: consult.querySelector('[name="Name"]').value, email: consult.querySelector('[name="Email"]').value }
        });
        var f = cal.querySelector("iframe"); if (f) { f.style.width = "100%"; f.style.height = "700px"; f.setAttribute("title", "Choose a time for your consultation"); }
      };
      if (window.Calendly) start();
      else {
        var sc = document.createElement("script"); sc.src = "https://assets.calendly.com/assets/external/widget.js"; sc.async = true; sc.onload = start;
        sc.onerror = function () { cal.hidden = true; nocal.hidden = false; nocal.querySelectorAll("input,select").forEach(function (el) { el.disabled = false; }); CALENDLY_URL = ""; next.hidden = false; next.textContent = "Continue"; picked.hidden = true; };
        document.head.appendChild(sc);
      }
      cal.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    });
    picked.addEventListener("click", function () { go(2); });
    back.addEventListener("click", function () { go(1); });
  }

  /* ---------- forms ---------- */
  function rows(form) {
    var order = [], seen = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "form-name" || key === "bot-field") return;
      value = String(value).trim();
      if (!value) return;
      if (seen[key]) seen[key].push(value); else { seen[key] = [value]; order.push(key); }
    });
    return order.map(function (key) { return key + ": " + seen[key].join(", "); });
  }
  document.querySelectorAll("form[data-hw]").forEach(function (form) {
    var status = form.querySelector(".status");
    function say(text) { status.textContent = text; status.classList.add("on"); status.focus(); }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var trap = form.querySelector('[name="bot-field"]');
      if (trap && trap.value) return;
      var need = form.querySelector("[data-required-list]");
      if (need && !need.value) { say(need.getAttribute("data-required-list")); return; }
      function byEmail() {
        var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(form.getAttribute("data-subject")) +
          "&body=" + encodeURIComponent(rows(form).join("\n"));
        window.location.href = href;
        say("Your email app should now be open with this ready to send. If it did not open, email " + EMAIL + ".");
      }
      if (FORM_MODE !== "netlify") { byEmail(); return; }
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (response) {
        if (!response.ok) { byEmail(); return; }
        form.reset();
        document.dispatchEvent(new CustomEvent("hw:sent", { detail: form }));
        say(form.getAttribute("data-ok"));
      }).catch(byEmail);
    });
  });
})();
