/* ==========================================================
   iMOBI Lab — 页眉、导航、页脚（全站共用，只需在这里修改一次）
   · 新增页面：在下面 NAV 里加一行，例如 ["projects.html","Projects","projects"]
   · 修改邮箱 / 办公室 / 地址：改下面 FOOTER 里的文字
   ========================================================== */
(function(){
  var NAV = [
    ["index.html","Home","home"],
    ["research.html","Research","research"],
    ["people.html","People","people"],
    ["publications.html","Publications","publications"],
    ["join.html","Join Us","join"]
  ];

  /* 当前页面：优先读 <body data-page="...">，否则按文件名判断 */
  var file = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
  var current = document.body.getAttribute("data-page") || (file === "index" || file === "" ? "home" : file);
  function navHTML(){
    return NAV.map(function(n){
      return '<a href="'+n[0]+'"'+(n[2]===current?' aria-current="page"':'')+'>'+n[1]+'</a>';
    }).join("");
  }

  var HEADER = `
<header class="top">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="iMOBI Lab home">
      <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect class="m-bg" width="40" height="40" rx="10"/><rect class="m-stem" x="13" y="20" width="7" height="13" rx="3.5"/><circle class="m-dot" cx="16.5" cy="13.5" r="3.8"/><path class="m-wave" d="M18.72 7.39A6.5 6.5 0 0 1 22.98 12.93M20.26 3.16A11 11 0 0 1 27.46 12.54"/></svg>
      <span class="word"><span class="i">i</span>MOBI <span class="lab">Lab</span></span>
      <span class="sub">UT Tyler<br>Electrical &amp; Computer Eng.</span>
    </a>
    <nav class="tabs" aria-label="Pages">${navHTML()}</nav>
  </div>
</header>`;

  /* ---- 页脚：邮箱、办公室、地址在这里修改 ---- */
  var FOOTER = `
<footer id="contact">
  <div class="wrap foot">
    <div>
      <a class="brand" href="index.html" aria-label="iMOBI Lab home">
        <svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><rect class="m-bg" width="40" height="40" rx="10"/><rect class="m-stem" x="13" y="20" width="7" height="13" rx="3.5"/><circle class="m-dot" cx="16.5" cy="13.5" r="3.8"/><path class="m-wave" d="M18.72 7.39A6.5 6.5 0 0 1 22.98 12.93M20.26 3.16A11 11 0 0 1 27.46 12.54"/></svg>
        <span class="word"><span class="i">i</span>MOBI <span class="lab">Lab</span></span>
      </a>
      <p class="tagline">Intelligent Mobile Systems Laboratory, Department of Electrical and Computer Engineering, The University of Texas at Tyler.</p>
    </div>
    <div class="col">
      <p class="eyebrow">Contact</p>
      <p id="email" class="todo" title="Replace with your UT Tyler email">jzhang@uttyler.edu</p>
      <button type="button" class="copy" id="copyEmail">Copy email</button>
      <p style="margin-top:8px"><span class="todo" title="Add building and room number">Houston Engineering Center, Room A208</span></p>
    </div>
    <div class="col">
      <p class="eyebrow">Mail</p>
      <p>The University of Texas at Tyler<br>3900 University Blvd.<br>Tyler, TX 75799</p>
    </div>
  </div>
  <div class="wrap legal">© 2026 iMOBI Lab · The University of Texas at Tyler</div>
</footer>`;

  var h = document.getElementById("site-header");
  if (h) h.outerHTML = HEADER;

  function wireFooter(){
    var f = document.getElementById("site-footer");
    if (f) f.outerHTML = FOOTER;

    var copyBtn = document.getElementById("copyEmail");
    if (copyBtn) copyBtn.addEventListener("click", function(){
      var el = document.getElementById("email"), text = el.textContent.trim();
      function done(){ copyBtn.textContent = "Copied"; setTimeout(function(){ copyBtn.textContent = "Copy email"; }, 1800); }
      function fallback(){
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        copyBtn.textContent = "Press Ctrl/Cmd+C";
      }
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch(e){ fallback(); }
    });

    /* 占位链接（href="#"）点击时不跳转；换成真实链接后自动失效 */
    document.querySelectorAll('a.todo[href="#"]').forEach(function(a){
      a.addEventListener("click", function(e){ e.preventDefault(); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireFooter);
  else wireFooter();
})();
