const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const menu=$('.menu-btn'), nav=$('.nav-links'); menu?.addEventListener('click',()=>nav.classList.toggle('open')); $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1}); $$('.reveal').forEach(e=>io.observe(e));
$$('[data-count]').forEach(el=>{const target=+el.dataset.count;let n=0;const step=Math.ceil(target/55);const run=()=>{n=Math.min(n+step,target);el.textContent=n.toLocaleString();if(n<target)requestAnimationFrame(run)};io.observe(el);const ob=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();ob.disconnect()}},{threshold:.5});ob.observe(el)});
$$('.check').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.activity-card');if(btn.classList.contains('done'))return;btn.classList.add('done');btn.innerHTML='✓ 인증 완료';card.style.borderColor='#baff3c66';const points=card.dataset.points;const toast=document.createElement('div');toast.textContent='+'+Number(points).toLocaleString()+'P 적립 완료! 🌱';Object.assign(toast.style,{position:'fixed',left:'50%',bottom:'35px',transform:'translateX(-50%)',background:'#baff3c',color:'#071007',padding:'13px 18px',borderRadius:'30px',font:'11px "DM Mono"',zIndex:100});document.body.appendChild(toast);setTimeout(()=>toast.remove(),1800)}));
const glow=$('.cursor-glow');addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
const canvas=$('#particles'),ctx=canvas.getContext('2d');let ps=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight}resize();addEventListener('resize',resize);for(let i=0;i<48;i++)ps.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.2,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22});function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(186,255,60,.22)';ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()});requestAnimationFrame(draw)}draw();

/* One-line campus comments */
const GAS_API_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
const commentForm = $('#comment-form');
const commentInput = $('#comment-input');
const commentList = $('#comment-list');
const commentStatus = $('#comment-status');
const commentCount = $('#comment-count');

function renderComments(items) {
  commentList.replaceChildren();
  if (!items.length) {
    const empty = document.createElement('li');
    empty.className = 'comment-empty';
    empty.textContent = '아직 댓글이 없어요. 첫 번째 한마디를 남겨주세요!';
    commentList.append(empty);
  } else {
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'comment-item';
      const message = document.createElement('p');
      message.textContent = item.message || '';
      const date = document.createElement('time');
      date.textContent = item.date || '';
      li.append(message, date);
      commentList.append(li);
    });
  }
  commentCount.textContent = items.length + '개';
}
function loadComments() {
  if (GAS_API_URL.includes('PASTE_')) {
    commentCount.textContent = '연결 설정 필요';
    commentList.innerHTML = '<li class="comment-empty">Apps Script 배포 URL을 연결하면 댓글이 표시됩니다.</li>';
    return;
  }
  const callback = 'gcComments_' + Date.now();
  window[callback] = data => {
    renderComments(Array.isArray(data) ? data : []);
    delete window[callback];
    script.remove();
  };
  const script = document.createElement('script');
  script.src = GAS_API_URL + '?callback=' + callback;
  script.onerror = () => {
    commentCount.textContent = '불러오기 실패';
    commentList.innerHTML = '<li class="comment-empty">댓글을 불러오지 못했어요. 잠시 후 다시 시도해주세요.</li>';
    delete window[callback];
    script.remove();
  };
  document.head.append(script);
}
commentForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const message = commentInput.value.trim();
  if (!message || message.length > 120) return;
  if (GAS_API_URL.includes('PASTE_')) {
    commentStatus.textContent = 'Apps Script 웹 앱 URL을 script.js에 먼저 설정해주세요.';
    return;
  }
  const submit = commentForm.querySelector('button');
  submit.disabled = true;
  submit.textContent = '등록 중...';
  commentStatus.textContent = '';
  try {
    await fetch(GAS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ message })
    });
    commentInput.value = '';
    commentStatus.textContent = '등록 요청을 보냈어요. 잠시 후 목록을 새로고침합니다.';
    setTimeout(loadComments, 1200);
  } catch (error) {
    commentStatus.textContent = '전송에 실패했어요. 네트워크를 확인한 뒤 다시 시도해주세요.';
  } finally {
    submit.disabled = false;
    submit.innerHTML = '등록하기 <span>→</span>';
  }
});
loadComments();
