/* 3G0TH2002 — grain, rows, static hiss */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- repeated word rows ---------- */

  function fillRows(container, word, rowCount, opts) {
    opts = opts || {};
    if (!container) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < rowCount; i++) {
      var row = document.createElement("div");
      row.className = opts.rowClass || "row";
      var text = "";
      var reps = opts.reps || 8;
      for (var r = 0; r < reps; r++) text += word + " ";
      if (opts.marquee) {
        // text doubled so translateX(-50%) loops seamlessly
        var track = document.createElement("span");
        track.className = "footer__track";
        track.textContent = text + text;
        var dur = 50 + Math.random() * 40;
        track.style.setProperty("--dur", dur.toFixed(1) + "s");
        track.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
        row.appendChild(track);
      } else {
        row.textContent = text;
      }
      if (i === opts.redRow) row.classList.add("is-red");
      if (opts.vary !== false) {
        row.style.opacity = (0.14 + Math.random() * 0.66).toFixed(2);
        if (Math.random() < 0.22) {
          row.style.filter = "blur(" + (Math.random() * 2.2 + 0.6).toFixed(1) + "px)";
        }
        if (!opts.marquee) row.style.marginLeft = (Math.random() * -0.06 * 100).toFixed(1) + "vw";
      }
      if (i === opts.redRow) row.style.opacity = "0.9";
      frag.appendChild(row);
    }
    container.appendChild(frag);
  }

  fillRows(document.getElementById("heroRows"), "3g0th2002", 11, { rowClass: "hero__row", reps: 8, redRow: 6 });
  fillRows(document.getElementById("heroBlockRows"), "3g0th2002", 7, { rowClass: "hero__block-row", reps: 7, vary: false });
  fillRows(document.getElementById("footerRows"), "3g0th2002", 5, { rowClass: "footer__row", reps: 8, marquee: !reduced, redRow: 2 });

  /* ---------- flicker on hero rows ---------- */

  var heroRowEls = document.querySelectorAll("#heroRows .hero__row");
  if (!reduced && heroRowEls.length) {
    setInterval(function () {
      var row = heroRowEls[Math.floor(Math.random() * heroRowEls.length)];
      row.classList.add("is-flick");
      setTimeout(function () { row.classList.remove("is-flick"); }, 70 + Math.random() * 60);
    }, 1400);
  }

  /* ---------- grainy abstract portrait (canvas, no real photo) ---------- */

  var canvas = document.getElementById("noisePortrait");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var base = document.createElement("canvas");
    var baseCtx = base.getContext("2d");
    var noise = document.createElement("canvas");
    var noiseCtx = noise.getContext("2d");
    var W = 0, H = 0;

    function paintBase() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(2, Math.floor(rect.width));
      H = Math.max(2, Math.floor(rect.height));
      canvas.width = base.width = W * dpr;
      canvas.height = base.height = H * dpr;
      noise.width = Math.max(24, Math.floor(W / 9));
      noise.height = Math.max(24, Math.floor(H / 9));
      baseCtx = base.getContext("2d");
      baseCtx.scale(dpr, dpr);

      var g = baseCtx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#a8a8a8");
      g.addColorStop(1, "#8a8a8a");
      baseCtx.fillStyle = g;
      baseCtx.fillRect(0, 0, W, H);

      // soft organic masses in pure grays
      var blobs = [
        ["#5c5c5c", 0.30, 0.22, 0.46, 0.42],
        ["#3d3d3d", 0.18, 0.12, 0.30, 0.26],
        ["#8f8f8f", 0.62, 0.55, 0.50, 0.50],
        ["#ababab", 0.80, 0.80, 0.55, 0.55],
        ["#787878", 0.40, 0.78, 0.38, 0.34],
        ["#4a4a4a", 0.05, 0.55, 0.28, 0.30]
      ];
      baseCtx.globalCompositeOperation = "multiply";
      blobs.forEach(function (b) {
        var x = b[1] * W, y = b[2] * H, rr = b[3] * W;
        var rg = baseCtx.createRadialGradient(x, y, 0, x, y, Math.max(10, rr));
        rg.addColorStop(0, b[0]);
        rg.addColorStop(1, "rgba(138,138,138,0)");
        baseCtx.globalAlpha = 0.5;
        baseCtx.fillStyle = rg;
        baseCtx.fillRect(0, 0, W, H);
      });
      baseCtx.globalAlpha = 1;
      baseCtx.globalCompositeOperation = "source-over";

      // vignette
      var vg = baseCtx.createRadialGradient(W * 0.5, H * 0.45, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(17,17,17,0)");
      vg.addColorStop(1, "rgba(17,17,17,0.36)");
      baseCtx.fillStyle = vg;
      baseCtx.fillRect(0, 0, W, H);
    }

    function paintNoise() {
      var img = noiseCtx.createImageData(noise.width, noise.height);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = Math.random() * 255;
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
      }
      noiseCtx.putImageData(img, 0, 0);
    }

    function render() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);

      // animated chunky grain
      paintNoise();
      ctx.globalAlpha = 0.34;
      ctx.globalCompositeOperation = "soft-light";
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(noise, 0, 0, W, H);
      ctx.globalAlpha = 0.14;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(noise, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.imageSmoothingEnabled = true;

      // pixelated square — the "censored" zone
      var s = Math.max(40, W * 0.16);
      var sx = W * 0.16, sy = H * 0.46;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas,
        sx * dpr, sy * dpr, s * dpr, s * dpr,
        sx - s * 0.08, sy - s * 0.08, s * 1.16, s * 1.16
      );
      ctx.imageSmoothingEnabled = true;

      // occasional scanline flash
      if (Math.random() < 0.4) {
        var ly = Math.random() * H;
        ctx.fillStyle = "rgba(242,242,242,0.10)";
        ctx.fillRect(0, ly, W, 1.5);
      }
      if (Math.random() < 0.12) {
        var dy = Math.random() * H;
        ctx.fillStyle = "rgba(17,17,17,0.12)";
        ctx.fillRect(0, dy, W, 3);
      }
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { paintBase(); render(); }, 150);
    });

    paintBase();
    render();
    if (!reduced) {
      setInterval(render, 160); // ~6fps shutter feel
    }
  }

  /* ---------- tv static behind the link circles ---------- */

  var staticCanvas = document.getElementById("linksStatic");
  if (staticCanvas && staticCanvas.getContext) {
    var sctx = staticCanvas.getContext("2d");
    var staticVisible = true;

    function sizeStatic() {
      var rect = staticCanvas.getBoundingClientRect();
      // chunky pixels: ~6px per noise cell, upscaled by css
      staticCanvas.width = Math.max(16, Math.floor(rect.width / 6));
      staticCanvas.height = Math.max(16, Math.floor(rect.height / 6));
    }

    function paintStatic() {
      var w = staticCanvas.width, h = staticCanvas.height;
      var img = sctx.createImageData(w, h);
      var d = img.data;
      var band = Math.random() * h; // a brighter rolling band
      for (var y = 0; y < h; y++) {
        var boost = Math.abs(y - band) < 3 ? 70 : 0;
        for (var x = 0; x < w; x++) {
          var k = (y * w + x) * 4;
          var v = Math.min(255, Math.random() * 255 + boost);
          d[k] = v; d[k + 1] = v; d[k + 2] = v; d[k + 3] = 255;
        }
      }
      sctx.putImageData(img, 0, 0);
    }

    staticCanvas.style.imageRendering = "pixelated";
    sizeStatic();
    paintStatic();
    window.addEventListener("resize", function () { sizeStatic(); paintStatic(); });

    if (!reduced) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          staticVisible = entries[0].isIntersecting;
        }).observe(staticCanvas);
      }
      setInterval(function () { if (staticVisible) paintStatic(); }, 110);
    }
  }

  /* ---------- audio player ---------- */

  var trackRows = document.querySelectorAll(".track");
  var currentAudio = null;
  var currentRow = null;

  function stopCurrent() {
    if (currentAudio) {
      currentAudio.pause();
      try { currentAudio.currentTime = 0; } catch (e) { /* not loaded yet */ }
    }
    if (currentRow) currentRow.classList.remove("is-playing");
    currentAudio = null;
    currentRow = null;
  }

  trackRows.forEach(function (row) {
    var btn = row.querySelector(".trk-play");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (currentRow === row && currentAudio) {
        if (currentAudio.paused) {
          currentAudio.play();
          row.classList.add("is-playing");
        } else {
          currentAudio.pause();
          row.classList.remove("is-playing");
        }
        return;
      }
      stopCurrent();
      var audio = new Audio();
      audio.preload = "none";
      audio.src = row.getAttribute("data-src");
      audio.addEventListener("ended", stopCurrent);
      currentAudio = audio;
      currentRow = row;
      row.classList.add("is-playing");
      audio.play().catch(function () {
        row.classList.remove("is-playing");
      });
    });
  });

  /* ---------- reveal on scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- custom cursor ---------- */

  var cursor = document.getElementById("cursor");
  if (cursor && window.matchMedia("(pointer: fine)").matches && !reduced) {
    var mx = -100, my = -100, cx = -100, cy = -100;
    var hovering = false;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      var t = e.target;
      hovering = !!(t && t.closest && t.closest("a, button"));
    });
    (function loop() {
      cx += (mx - cx) * 0.28;
      cy += (my - cy) * 0.28;
      cursor.style.transform =
        "translate(" + cx + "px," + cy + "px) translate(-50%,-50%) rotate(45deg) scale(" + (hovering ? 2.1 : 1) + ")";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- local clock ---------- */

  var clock = document.getElementById("clock");
  if (clock) {
    function tick() {
      var d = new Date();
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      clock.textContent = "LOCAL " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }
    tick();
    setInterval(tick, 1000);
  }
})();
