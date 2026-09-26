/* ==========================================================
   iMOBI Lab — 读取 content/*.md 并填入页面
   一般不需要修改本文件；页面文字请改 content/ 文件夹里的 .md 文件。

   页面中的写法（给以后新增页面参考）：
     <main data-content="content/xxx.md">   指定要读取的 .md 文件
     data-fm="name"        填入顶部固定信息中的 name
     data-md="Bio"         填入「## Bio」区块的内容
     data-mode="facts"     区块内的列表显示为信息格（**标签:** 内容）
     data-mode="seats"     区块内的列表显示为虚线卡片（**标题:** 说明）
     data-mode="chips"     区块内的列表显示为小标签
     data-mode="cards"     其余未使用的区块逐个显示为卡片
     data-links="cv:Curriculum Vitae,scholar:Google Scholar"  生成链接
     data-photo            顶部 photo 有值时显示照片
   ========================================================== */
(function(){
  var main = document.querySelector("[data-content]");
  if (!main) return;
  var src = main.getAttribute("data-content");

  function parse(text){
    var fm = {}, body = text.replace(/^﻿/, "");
    var m = body.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (m){
      m[1].split("\n").forEach(function(line){
        if (/^\s*#/.test(line) || !/\S/.test(line)) return;
        var i = line.indexOf(":");
        if (i < 0) return;
        var k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
        fm[k] = v.replace(/^["']|["']$/g, "");
      });
      body = body.slice(m[0].length);
    }
    var sections = {}, order = [], cur = null;
    body.split("\n").forEach(function(line){
      var h = line.match(/^##\s+(.+?)\s*$/);
      if (h){ cur = h[1]; order.push(cur); sections[cur] = []; }
      else if (cur) sections[cur].push(line);
    });
    order.forEach(function(k){ sections[k] = sections[k].join("\n").trim(); });
    return { fm: fm, sections: sections, order: order };
  }

  function listItems(md){
    return md.split("\n").filter(function(l){ return /^\s*[-*]\s+/.test(l); })
             .map(function(l){ return l.replace(/^\s*[-*]\s+/, ""); });
  }
  function labelled(item){
    var m = item.match(/^\*\*(.+?):?\*\*:?\s*(.*)$/);
    return m ? { label: m[1].replace(/:$/, ""), text: m[2] } : { label: "", text: item };
  }
  var inline = function(s){ return window.marked ? marked.parseInline(s) : s; };
  var block  = function(s){ return window.marked ? marked.parse(s) : "<p>" + s + "</p>"; };

  function render(doc){
    var used = {};
    main.querySelectorAll("[data-fm]").forEach(function(el){
      var v = doc.fm[el.getAttribute("data-fm")];
      if (v) el.textContent = v;
    });
    main.querySelectorAll("[data-md]").forEach(function(el){
      var key = el.getAttribute("data-md"), md = doc.sections[key];
      used[key] = true;
      if (md == null){ el.innerHTML = ""; return; }
      var mode = el.getAttribute("data-mode");
      if (mode === "facts"){
        el.innerHTML = listItems(md).map(function(it){
          var x = labelled(it);
          return "<div><dt>" + x.label + "</dt><dd>" + inline(x.text) + "</dd></div>";
        }).join("");
      } else if (mode === "seats"){
        el.innerHTML = listItems(md).map(function(it){
          var x = labelled(it);
          return '<div class="seat"><b>' + x.label + "</b><span>" + inline(x.text) + "</span></div>";
        }).join("");
      } else if (mode === "chips"){
        el.innerHTML = listItems(md).map(function(it){
          return '<span class="chip">' + inline(it) + "</span>";
        }).join("");
      } else {
        el.innerHTML = block(md);
      }
    });
    main.querySelectorAll('[data-mode="cards"]:not([data-md])').forEach(function(el){
      var skip = (el.getAttribute("data-skip") || "").split("|");
      el.innerHTML = doc.order.filter(function(k){ return !used[k] && skip.indexOf(k) < 0; })
        .map(function(k){ return "<article><h2>" + k + "</h2>" + block(doc.sections[k]) + "</article>"; }).join("");
    });
    main.querySelectorAll("[data-links]").forEach(function(el){
      el.innerHTML = el.getAttribute("data-links").split(",").map(function(pair){
        var p = pair.split(":"), key = p[0].trim(), label = p.slice(1).join(":").trim(), url = doc.fm[key];
        return url ? '<a href="' + url + '">' + label + "</a>"
                   : '<a href="#" class="todo" title="Add ' + key + ' in ' + src + '">' + label + "</a>";
      }).join("");
      el.querySelectorAll('a.todo[href="#"]').forEach(function(a){
        a.addEventListener("click", function(e){ e.preventDefault(); });
      });
    });
    main.querySelectorAll("[data-photo]").forEach(function(el){
      if (!doc.fm.photo) return;
      el.innerHTML = '<img src="' + doc.fm.photo + '" alt="' + (doc.fm.name || "Portrait") + '">';
      var note = el.parentNode.querySelector(".portrait-note");
      if (note) note.hidden = true;
    });
  }

  fetch(src).then(function(r){
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }).then(function(t){ render(parse(t)); }).catch(function(){
    var box = document.createElement("div");
    box.className = "wrap load-error";
    box.innerHTML = "<p><b>Could not load " + src + ".</b> If you opened this file directly from your computer, " +
      "start a local server in the site folder (<code>python -m http.server</code>) and open " +
      "<code>http://localhost:8000</code>. On GitHub Pages it loads automatically.</p>";
    main.insertBefore(box, main.firstChild);
  });
})();
