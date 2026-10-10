(()=>{
  'use strict';
  const data=JSON.parse(document.getElementById('dataset').textContent);
  const domains=['认知科学','哲学','逻辑学','科学方法论','社会学','政治学','人类学','历史学','心理学','生物学','物理学','数学','博弈论','管理学','经济学','金融学','决策科学','文学与艺术','计算机与信息科学','学习科学','系统与复杂性科学','语言与传播学'];
  data.sort((a,b)=>domains.indexOf(a.domain)-domains.indexOf(b.domain)||a.num-b.num);
  const byId=new Map(data.map(r=>[r.id,r])), $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sizeNames={small:'小字',medium:'中字',large:'大字'};
  function lettering(r){
    const t=r.typography||{size:'medium',face:'standard'};
    return '<span class="concept-lettering type-'+t.size+(t.face==='handwriting'?' type-handwriting':'')+'" title="原图'+sizeNames[t.size]+'（照片估算）'+(t.face==='handwriting'?' · 手写体':'')+'">'+esc(r.corrected_concept)+'</span>';
  }
  const paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',left:'<path d="m15 5-7 7 7 7"/>',book:'<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',photo:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-7 5 8"/>',reset:'<path d="M4 9a8 8 0 1 1 0 6M4 4v5h5"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'};
  const icon=name=>'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.chevron)+'</svg>';
  let view='read',domain='',page=0,selected=data[0].id,imageVersion=0,detailTab='info',lastTrigger=null;
  const size=14,drawerMedia=matchMedia('(max-width:1170px)');
  const outsideDetail=()=>document.querySelectorAll('.app-header,.sidebar,.overview,#tools,.catalogue,.page-foot');
  function filtered(ignoreStatus=false){
    const q=$('search').value.trim().toLowerCase(),s=$('status').value,c=$('course').value,f=$('fontStyle').value;
    return data.filter(r=>(!domain||r.domain===domain)&&(ignoreStatus||!s||(s==='diff'?r.status!=='课程标题一致':r.status===s))&&(!c||r.article.course===c)&&(!f||(f==='handwriting'?r.typography?.face===f:r.typography?.size===f))&&(!q||[r.corrected_concept,r.concept,r.original_article,r.article.title,r.domain,r.article.course].join(' ').toLowerCase().includes(q)));
  }
  function badge(r){return '<span class="tag '+(r.added?'add':r.status==='原图与课程异文'?'variant':r.status==='更正与补全'?'change':'')+'">'+esc(r.status)+'</span>'}
  function sidebar(){
    $('domains').innerHTML=['<button data-domain="" aria-pressed="'+(!domain)+'"><span>全部领域</span><small>'+data.length+'</small></button>',...domains.map(d=>'<button data-domain="'+esc(d)+'" aria-pressed="'+(d===domain)+'"><span>'+esc(d)+'</span><small>'+data.filter(r=>r.domain===d).length+'</small></button>')].join('');
    $('domainSelect').value=domain;
  }
  function paginate(el,rows){
    const total=Math.ceil(rows.length/size);
    el.innerHTML='<button data-step="-1" '+(page===0?'disabled':'')+'>'+icon('left')+'上一页</button><span>'+(total?page+1:0)+' / '+total+'</span><button data-step="1" '+(page>=total-1?'disabled':'')+'>下一页'+icon('chevron')+'</button>';
  }
  function syncView(){
    document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===view;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1});
    ['read','audit','brain','photos','recommend'].forEach(id=>$(id).hidden=id!==view);
    $('tools').hidden=['photos','recommend'].includes(view);
  }
  function setView(v){closeDetail(false);view=v;page=0;syncView();render();window.scrollTo({top:0,behavior:'auto'})}
  function resetFilters(){domain='';$('search').value='';$('status').value='';$('course').value='';$('fontStyle').value='';page=0;render()}
  function empty(){return '<div class="empty">'+icon('search')+'<h3>没有找到匹配条目</h3><p>试试其他关键词，或清空领域和课程筛选。</p><button class="action" data-reset>清空全部筛选</button></div>'}
  function render(){
    sidebar();const rows=filtered();if(page>=Math.ceil(rows.length/size))page=0;
    $('count').innerHTML='<strong>'+esc(domain||'全部领域')+'</strong> &nbsp;·&nbsp; '+rows.length+' 个条目';
    $('resetFilters').hidden=!(domain||$('search').value||$('status').value||$('course').value||$('fontStyle').value);
    $('clearSearch').hidden=!$('search').value;$('searchShortcut').hidden=!!$('search').value;
    const chunk=rows.slice(page*size,(page+1)*size);
    if(view==='read'){
      if(!chunk.some(r=>r.id===selected))selected=chunk[0]?.id??null;
      $('items').innerHTML=chunk.map((r,i)=>'<button class="item" data-id="'+esc(r.id)+'" aria-pressed="'+(r.id===selected)+'" aria-label="'+esc(r.corrected_concept+'，'+r.article.title)+'"><span class="item-number">'+String(page*size+i+1).padStart(2,'0')+'</span><span class="item-copy"><span class="item-title"><strong>'+lettering(r)+'</strong>'+badge(r)+'</span><span class="subtitle">'+esc(r.article.title)+'</span>'+(!domain?'<span class="item-domain">'+esc(r.domain)+'</span>':'')+'</span>'+icon('chevron').replace('class="icon"','class="icon item-arrow"')+'</button>').join('')||empty();
      paginate($('pages'),rows);inspect(byId.get(selected));
    }
    if(view==='audit'){
      $('auditrows').innerHTML=chunk.map(r=>'<tr><td><span class="table-domain">'+esc(r.domain)+'</span><button data-id="'+esc(r.id)+'">'+lettering(r)+'</button>'+(r.concept_changed?'<span class="old-concept">原概念：'+esc(r.concept)+'</span>':'')+'</td><td class="original">'+esc(r.original_article)+'</td><td>'+esc(r.article.title)+'</td><td>'+badge(r)+'</td></tr>').join('')||'<tr><td colspan="4">'+empty()+'</td></tr>';
      paginate($('auditpages'),rows);
      const summary=filtered(true);document.querySelectorAll('[data-status]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.status===$('status').value);b.querySelector('strong').textContent=summary.filter(r=>r.status===b.dataset.status).length});
    }
    if(view==='brain'){
      $('brainpages').hidden=!domain;
      if(!domain){
        $('braincontent').innerHTML='<div class="brain-domains">'+domains.map(d=>{const dr=rows.filter(r=>r.domain===d);return dr.length?'<button class="brain-domain" data-brain-domain="'+esc(d)+'"><span><strong>'+esc(d)+'</strong><small>'+dr.length+' 个概念 · '+new Set(dr.map(r=>r.article.path)).size+' 篇文章</small></span>'+icon('chevron')+'</button>':''}).join('')+'</div>'+(rows.length?'':empty());
      }else{
        $('braincontent').innerHTML='<div class="brainhead"><span class="brainroot">'+esc(domain)+'</span><span class="muted">'+rows.length+' 个概念</span></div><div class="branches">'+chunk.map(r=>'<div class="branch"><button data-id="'+esc(r.id)+'">'+lettering(r)+'</button><span class="edge" aria-hidden="true"></span><div><a href="'+esc(r.article_url)+'" data-article="'+esc(r.article_url)+'" data-title="'+esc(r.article.title)+'">'+esc(r.article.title)+'</a><small>'+esc(r.article.course)+'</small></div></div>').join('')+'</div>'+(rows.length?'':empty());paginate($('brainpages'),rows);
      }
    }
  }
  function inspect(r){
    ++imageVersion;detailTab='info';
    if(!r){$('inspector').innerHTML='<div class="detail-head"><h3>选择一个概念</h3></div><div class="detail-scroll muted">点击左侧条目，查看课程文章和照片证据。</div>';return}
    const m=r.photo_matches[0],typeNote='原图'+sizeNames[r.typography?.size||'medium']+' · '+(r.typography?.face==='handwriting'?'手写体已对照照片':'常规字体'),siblings=data.filter(x=>x.article.path===r.article.path&&x.id!==r.id),excerpt=r.excerpt||'',short=excerpt.length>230?excerpt.slice(0,230)+'…':excerpt;
    $('inspector').innerHTML='<div class="detail-head"><div><h3 id="detailTitle">'+lettering(r)+'</h3><p class="muted">'+esc(r.domain)+' &nbsp;·&nbsp; '+esc(r.article.course)+'</p></div><button class="icon-button detail-close" data-close-detail aria-label="关闭概念详情">'+icon('close')+'</button></div><nav class="detail-tabs" role="tablist" aria-label="概念详情视图"><button id="detailInfoTab" role="tab" data-detail="info" aria-controls="detailInfo" aria-selected="true">文章信息</button><button id="detailPhotoTab" role="tab" data-detail="photo" aria-controls="detailPhoto" aria-selected="false" tabindex="-1">原图证据</button></nav><div class="detail-scroll"><section id="detailInfo" role="tabpanel" aria-labelledby="detailInfoTab"><p class="type-record">'+esc(typeNote)+'<span>字号按照片估算</span></p><div class="field"><label>课程原标题</label><p class="course-title">'+esc(r.article.title)+'</p></div><div class="actions"><a class="action primary" href="'+esc(r.article_url)+'" data-article="'+esc(r.article_url)+'" data-title="'+esc(r.article.title)+'">'+icon('book')+'阅读课程全文</a></div>'+(excerpt?'<div class="field"><label>正文证据 · 原文摘录</label><div class="quote">'+esc(short)+'</div>'+(excerpt.length>230?'<details class="excerpt-more"><summary>展开完整摘录</summary><p>'+esc(excerpt)+'</p></details>':'')+'</div>':'<p class="photo-note">'+esc(r.body_evidence)+'</p>')+'<details class="record" '+(r.status!=='课程标题一致'?'open':'')+'><summary><span>核对记录 &nbsp;'+badge(r)+'</span>'+icon('down')+'</summary><div class="field"><label>原 Markdown'+(r.concept_changed?' · 原概念：'+esc(r.concept):'')+'</label><p class="original">'+esc(r.original_article)+'</p></div>'+(r.photo_article?'<div class="field"><label>照片上可辨认的副标题</label><p>'+esc(r.photo_article)+'</p></div>':'')+'<p class="photo-note">'+esc(r.note)+'</p></details>'+(siblings.length?'<div class="siblings"><h3>同篇文章的其他概念</h3><div class="actions">'+siblings.map(x=>'<button class="action" data-id="'+esc(x.id)+'">'+lettering(x)+' · '+esc(x.domain)+'</button>').join('')+'</div></div>':'')+'</section><section id="detailPhoto" role="tabpanel" aria-labelledby="detailPhotoTab" hidden><p class="photo-label">'+esc(m?m.photo:r.photo)+'.HEIC · 概念与副标题局部</p><div class="photo-frame"><canvas id="photoCrop" aria-label="概念及副标题的照片局部"></canvas></div><div class="actions"><a class="action" href="photos/'+esc(m?m.photo:r.photo)+'.jpg" target="_blank" rel="noopener">'+icon('photo')+'查看完整原图</a></div><p class="photo-note">'+esc(r.note)+'</p>'+(m?'<details class="photo-ocr"><summary>查看 OCR 辅助记录</summary><p>'+esc(m.concept_ocr)+'<br>'+m.nearby_ocr.map(esc).join('<br>')+'</p><p class="muted">OCR 记录可能包含错字或相邻条目，须以照片和课程原文为准。</p></details>':'')+'</section></div>';
    if(m){
      const cv=$('photoCrop'),im=new Image(),version=++imageVersion;
      im.onload=()=>{if(version!==imageVersion)return;const[x,y,w,h]=m.box,cw=Math.min(.8,Math.max(.21,w+.04)),cx=Math.max(0,Math.min(1-cw,x-.015)),cy=Math.max(0,y-.008),ch=Math.min(1-cy,Math.max(.06,h+.048));cv.width=1200;cv.height=Math.round(1200*(ch*im.height)/(cw*im.width));cv.getContext('2d').drawImage(im,cx*im.width,cy*im.height,cw*im.width,ch*im.height,0,0,cv.width,cv.height)};
      im.onerror=()=>{cv.hidden=true;cv.parentElement.insertAdjacentHTML('beforeend','<p class="photo-note">局部预览未能加载，请查看完整原图。</p>')};im.src='photos/'+m.photo+'.jpg';
    }
  }
  function changeDetailTab(t){
    detailTab=t;document.querySelectorAll('[data-detail]').forEach(b=>{const active=b.dataset.detail===t;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1});$('detailInfo').hidden=t!=='info';$('detailPhoto').hidden=t!=='photo';$('inspector').querySelector('.detail-scroll').scrollTop=0;
  }
  function openDetail(trigger){
    if(!drawerMedia.matches)return;
    lastTrigger=trigger;$('inspector').classList.add('open');$('detailBackdrop').classList.add('open');document.body.classList.add('detail-open');$('inspector').setAttribute('role','dialog');$('inspector').setAttribute('aria-modal','true');outsideDetail().forEach(el=>el.inert=true);$('inspector').querySelector('[data-close-detail]')?.focus();
  }
  function closeDetail(restore=true){
    const wasOpen=$('inspector').classList.contains('open');$('inspector').classList.remove('open');$('detailBackdrop').classList.remove('open');document.body.classList.remove('detail-open');$('inspector').setAttribute('role','complementary');$('inspector').removeAttribute('aria-modal');outsideDetail().forEach(el=>el.inert=false);if(wasOpen&&restore&&lastTrigger?.isConnected)lastTrigger.focus();
  }
  function selectRecord(id,trigger){
    const r=byId.get(id);if(!r)return;selected=id;
    let rows=filtered();if(!rows.some(x=>x.id===id)){domain=r.domain;$('search').value='';$('status').value='';$('course').value='';$('fontStyle').value='';rows=filtered()}
    page=Math.floor(rows.findIndex(x=>x.id===id)/size);view='read';syncView();render();openDetail($('items').querySelector('[data-id="'+CSS.escape(id)+'"]'));
  }
  $('domainSelect').insertAdjacentHTML('beforeend',domains.map(d=>'<option value="'+esc(d)+'">'+esc(d)+' · '+data.filter(r=>r.domain===d).length+' 个概念</option>').join(''));
  $('course').insertAdjacentHTML('beforeend',[...new Set(data.map(r=>r.article.course))].sort().map(c=>'<option>'+esc(c)+'</option>').join(''));
  $('gallery').innerHTML=Array.from({length:23},(_,i)=>'IMG_'+(7945+i)).map(p=>{const ds=[...new Set(data.filter(r=>r.photo===p).map(r=>r.domain))];return '<figure><a href="photos/'+p+'.jpg" target="_blank" rel="noopener"><img loading="lazy" src="photos/'+p+'.jpg" alt="知识地图原照片 '+p+'"></a><figcaption><strong>'+p+'</strong><span>'+esc(ds.slice(0,2).join(' / '))+'</span></figcaption></figure>'}).join('');
  document.addEventListener('click',e=>{
    const type=e.target.closest('[data-typography]');if(type){document.body.classList.toggle('uniform-typography',type.dataset.typography==='uniform');document.querySelectorAll('[data-typography]').forEach(b=>b.setAttribute('aria-pressed',b===type));return}
    const v=e.target.closest('[data-view]');if(v){setView(v.dataset.view);return}
    const d=e.target.closest('[data-domain],[data-brain-domain]');if(d){domain=d.dataset.domain??d.dataset.brainDomain;page=0;render();return}
    const step=e.target.closest('[data-step]');if(step&&!step.disabled){page+=Number(step.dataset.step);render();$('tools').scrollIntoView({block:'start'});return}
    const status=e.target.closest('[data-status]');if(status){$('status').value=status.dataset.status;page=0;render();return}
    const dt=e.target.closest('[data-detail]');if(dt){changeDetailTab(dt.dataset.detail);return}
    if(e.target.closest('[data-close-detail]')||e.target===$('detailBackdrop')){closeDetail();return}
    if(e.target.closest('[data-reset]')){resetFilters();return}
    const art=e.target.closest('[data-article]');if(art){e.preventDefault();$('readerTitle').textContent=art.dataset.title||'课程阅读';$('articleFrame').src=art.dataset.article;$('articleDialog').showModal();return}
    const it=e.target.closest('[data-id]');if(it)selectRecord(it.dataset.id,it);
  });
  $('closeDialog').addEventListener('click',()=>$('articleDialog').close());
  $('articleDialog').addEventListener('click',e=>{if(e.target===$('articleDialog')){const r=$('articleDialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('articleDialog').close()}});
  $('search').addEventListener('input',()=>{page=0;render()});$('status').addEventListener('change',()=>{page=0;render()});$('course').addEventListener('change',()=>{page=0;render()});$('domainSelect').addEventListener('change',()=>{domain=$('domainSelect').value;page=0;render()});
  $('clearSearch').addEventListener('click',()=>{$('search').value='';page=0;render();$('search').focus()});
  $('fontStyle').addEventListener('change',()=>{page=0;render()});
  document.addEventListener('keydown',e=>{
    const target=e.target;
    if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(target.tagName)&&!$('articleDialog').open&&!$('inspector').classList.contains('open')){e.preventDefault();if($('tools').hidden)setView('read');$('search').focus();return}
    if(e.key==='Escape'&&!$('articleDialog').open){closeDetail();return}
    if(e.key==='Tab'&&$('inspector').classList.contains('open')&&!$('articleDialog').open){const all=[...$('inspector').querySelectorAll('button,a,summary,input,select,[tabindex="0"]')].filter(el=>el.getClientRects().length&&el.tabIndex>=0&&!el.disabled);const first=all[0],last=all.at(-1);if(e.shiftKey&&target===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&target===last){e.preventDefault();first?.focus()}}
    if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)&&target.getAttribute('role')==='tab'){
      const tabs=[...target.parentElement.querySelectorAll('[role="tab"]')];let i=tabs.indexOf(target);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;e.preventDefault();tabs[i].click();tabs[i].focus();
    }
  });
  drawerMedia.addEventListener('change',()=>closeDetail(false));syncView();render();
})();
