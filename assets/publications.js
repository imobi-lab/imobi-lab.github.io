/* ==========================================================
   iMOBI Lab — 读取 content/publications.bib 并显示论文
   一般不需要修改本文件；新增或修改论文请编辑 content/publications.bib。
   用于首页 Selected work（featured 字段）和 Publications 页完整列表。
   ========================================================== */
(function(){
  var BIB = "content/publications.bib";
  var ME = { last: "Zhang", first: ["Jinran", "J.", "J"] };   // 自动加粗的作者
  var MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  var MON = ["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];

  /* ---------- BibTeX parser ---------- */
  function parseBib(text){
    var out = [], i = 0, n = text.length;
    while ((i = text.indexOf("@", i)) !== -1){
      var m = /^@(\w+)\s*[{(]\s*([^,\s]+)\s*,/.exec(text.slice(i));
      if (!m){ i++; continue; }
      var type = m[1].toLowerCase();
      if (type === "comment" || type === "string" || type === "preamble"){ i++; continue; }
      var e = { type: type, key: m[2], f: {} };
      i += m[0].length;
      while (i < n){
        while (i < n && /[\s,]/.test(text[i])) i++;
        if (text[i] === "}" || text[i] === ")"){ i++; break; }
        var fm = /^([\w-]+)\s*=\s*/.exec(text.slice(i));
        if (!fm) break;
        var name = fm[1].toLowerCase(); i += fm[0].length;
        var val = "";
        if (text[i] === "{"){
          var depth = 0, s = i;
          for (; i < n; i++){
            if (text[i] === "{") depth++;
            else if (text[i] === "}"){ depth--; if (depth === 0){ i++; break; } }
          }
          val = text.slice(s + 1, i - 1);
        } else if (text[i] === '"'){
          var s2 = ++i;
          while (i < n && text[i] !== '"') i++;
          val = text.slice(s2, i); i++;
        } else {
          var s3 = i;
          while (i < n && !/[,}\s]/.test(text[i])) i++;
          val = text.slice(s3, i);
        }
        e.f[name] = val.replace(/\s+/g, " ").trim();
      }
      out.push(e);
    }
    return out;
  }

  /* ---------- LaTeX clean-up ---------- */
  var ACC = { "'": "́", "`": "̀", "^": "̂", '"': "̈", "~": "̃", "c": "̧", "v": "̌" };
  function tex(s){
    return (s || "")
      .replace(/\\([`'^"~cv])\s*\{?([A-Za-z])\}?/g, function(_, a, ch){ return (ch + ACC[a]).normalize("NFC"); })
      .replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\_/g, "_").replace(/\\\$/g, "$")
      .replace(/---/g, "—").replace(/--/g, "–").replace(/~/g, " ")
      .replace(/[{}]/g, "").trim();
  }
  function esc(s){ return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ---------- formatting ---------- */
  function authors(s){
    return tex(s).split(/\s+and\s+/).map(function(a){
      var last, first;
      if (a.indexOf(",") > -1){ var p = a.split(","); last = p[0].trim(); first = p.slice(1).join(" ").trim(); }
      else { var w = a.trim().split(/\s+/); last = w.pop(); first = w.join(" "); }
      var initials = first.split(/[\s.]+/).filter(Boolean).map(function(x){
        return x.split("-").map(function(y){ return y[0].toUpperCase() + "."; }).join("-");
      }).join(" ");
      var me = last === ME.last && ME.first.some(function(f){ return first === f || first.indexOf(f) === 0 && f.length > 2; });
      var name = esc((initials ? initials + " " : "") + last);
      return me ? "<b>" + name + "</b>" : name;
    });
  }
  function isMe(html){ return /^<b>/.test(html); }
  function venue(e){
    var f = e.f, parts = [];
    var where = tex(f.journal || f.booktitle || f.howpublished || f.publisher || "");
    if (where) parts.push(where);
    if (f.address && !f.journal) parts.push(tex(f.address));
    if (f.volume) parts.push("vol. " + tex(f.volume));
    if (f.number) parts.push("no. " + tex(f.number));
    if (f.pages) parts.push("pp. " + tex(f.pages));
    var mi = f.month ? MONTHS.indexOf(f.month.toLowerCase().slice(0, 3)) : -1;
    parts.push((mi > -1 ? MON[mi] + " " : "") + (f.year || ""));
    var s = parts.filter(Boolean).join(", ");
    if (f.note) s += " · " + tex(f.note);
    return esc(s);
  }
  function pubHTML(e, idx, withId){
    var au = authors(e.f.author || "");
    var tags = [];
    if (au.length && isMe(au[0])) tags.push('<span class="tag lead">First author</span>');
    else if (e.type === "article") tags.push('<span class="tag">Journal</span>');
    var links = [];
    if (e.f.doi) links.push('<a href="https://doi.org/' + tex(e.f.doi) + '">DOI</a>');
    if (e.f.url) links.push('<a href="' + tex(e.f.url) + '">Link</a>');
    if (e.f.pdf) links.push('<a href="' + tex(e.f.pdf) + '">PDF</a>');
    if (e.f.code) links.push('<a href="' + tex(e.f.code) + '">Code</a>');
    var kw = (e.f.keywords || "").split(/[,;]/).map(function(k){ return k.trim().toLowerCase(); }).filter(Boolean);
    return '<div class="pub"' + (withId ? ' id="pub-' + e.key + '"' : "") + ' data-f="' + kw.join(" ") + '" data-year="' + e.f.year + '">' +
      '<span class="no">[' + idx + ']</span><div><div class="t">' + esc(tex(e.f.title)) + '</div>' +
      '<div class="a">' + au.join(", ") + '</div><div class="v">' + venue(e) + '</div>' +
      (links.length ? '<div class="plinks">' + links.join(" ") + '</div>' : "") + '</div>' + tags.join("") + '</div>';
  }

  /* ---------- render ---------- */
  var sel = document.getElementById("selectedPubs");
  var box = document.getElementById("pubs");
  if (!sel && !box) return;

  fetch(BIB).then(function(r){ if (!r.ok) throw new Error(r.status); return r.text(); }).then(function(text){
    var list = parseBib(text).map(function(e, k){ e.order = k; return e; });
    list.sort(function(a, b){ return (parseInt(b.f.year) || 0) - (parseInt(a.f.year) || 0) || a.order - b.order; });

    if (sel){
      sel.innerHTML = list.filter(function(e){ return e.f.featured; })
        .sort(function(a, b){ return parseInt(a.f.featured) - parseInt(b.f.featured); })
        .map(function(e){ return pubHTML(e, "", false); }).join("");
    }
    if (!box) return;
    var html = "", lastY = null;
    list.forEach(function(e, k){
      if (e.f.year !== lastY){ html += '<div class="year" data-year="' + e.f.year + '">' + e.f.year + "</div>"; lastY = e.f.year; }
      html += pubHTML(e, k + 1, true);
    });
    box.innerHTML = html;

    var buttons = document.querySelectorAll(".filters button");
    function applyFilter(f){
      buttons.forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.f === f ? "true" : "false"); });
      var shown = {};
      box.querySelectorAll(".pub").forEach(function(el){
        var show = f === "all" || el.dataset.f.split(" ").indexOf(f) > -1;
        el.hidden = !show;
        if (show) shown[el.dataset.year] = true;
      });
      box.querySelectorAll(".year").forEach(function(el){ el.hidden = !shown[el.dataset.year]; });
    }
    buttons.forEach(function(b){ b.addEventListener("click", function(){ applyFilter(b.dataset.f); }); });

    function jump(){
      var id = location.hash.slice(1), el = id && document.getElementById(id);
      if (el){ applyFilter("all"); el.scrollIntoView({ block: "start" }); }
    }
    jump();
    window.addEventListener("hashchange", jump);
  }).catch(function(){
    var target = box || sel;
    target.innerHTML = '<p class="load-error">Could not load ' + BIB + '. If you opened this file directly from your computer, ' +
      'start a local server in the site folder (<code>python -m http.server</code>) and open <code>http://localhost:8000</code>.</p>';
  });
})();
