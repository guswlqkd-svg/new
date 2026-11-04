const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const menu=$('.menu-btn'), nav=$('.nav-links'); menu?.addEventListener('click',()=>nav.classList.toggle('open')); $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1}); $$('.reveal').forEach(e=>io.observe(e));
$$('[data-count]').forEach(el=>{const target=+el.dataset.count;let n=0;const step=Math.ceil(target/55);const run=()=>{n=Math.min(n+step,target);el.textContent=n.toLocaleString();if(n<target)requestAnimationFrame(run)};io.observe(el);const ob=new IntersectionObserver(es=>{if(es[0].isIntersecting){run();ob.disconnect()}},{threshold:.5});ob.observe(el)});
$$('.check').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.activity-card');if(btn.classList.contains('done'))return;btn.classList.add('done');btn.innerHTML='✓ 인증 완료';card.style.borderColor='#baff3c66';const points=card.dataset.points;const toast=document.createElement('div');toast.textContent='+'+Number(points).toLocaleString()+'P 적립 완료! 🌱';Object.assign(toast.style,{position:'fixed',left:'50%',bottom:'35px',transform:'translateX(-50%)',background:'#baff3c',color:'#071007',padding:'13px 18px',borderRadius:'30px',font:'11px "DM Mono"',zIndex:100});document.body.appendChild(toast);setTimeout(()=>toast.remove(),1800)}));
const glow=$('.cursor-glow');addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
const canvas=$('#particles'),ctx=canvas.getContext('2d');let ps=[];function resize(){canvas.width=innerWidth;canvas.height=innerHeight}resize();addEventListener('resize',resize);for(let i=0;i<48;i++)ps.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.2,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22});function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(186,255,60,.22)';ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()});requestAnimationFrame(draw)}draw();

/* One-line campus comments - Google Apps Script */
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwqvs3hXg5vagZjt_6eCMBWRZxs3r_N9G6cbyFoaY9RbiUCaZDY6Qe41bC6rTj1Xc2g/exec';
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
      message.textContent = item.content || '';
      const date = document.createElement('time');
      const parsedDate = item.createdAt ? new Date(item.createdAt) : null;
      date.textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })
        : '';
      li.append(message, date);
      commentList.append(li);
    });
  }
  commentCount.textContent = items.length + '개';
}

function loadComments() {
  const callback = 'gcComments_' + Date.now();
  window[callback] = data => {
    if (data && data.success) {
      renderComments(Array.isArray(data.comments) ? data.comments : []);
    } else {
      commentCount.textContent = '불러오기 실패';
      commentList.replaceChildren();
      const error = document.createElement('li');
      error.className = 'comment-empty';
      error.textContent = '댓글을 불러오지 못했어요. 서버 설정을 확인해주세요.';
      commentList.append(error);
    }
    delete window[callback];
    script.remove();
  };
  const script = document.createElement('script');
  script.src = GAS_API_URL + '?action=list&limit=50&callback=' + callback;
  script.onerror = () => {
    commentCount.textContent = '연결 확인 필요';
    commentList.replaceChildren();
    const error = document.createElement('li');
    error.className = 'comment-empty';
    error.textContent = '댓글 서버에 연결할 수 없어요. Apps Script의 JSONP 조회 설정을 확인해주세요.';
    commentList.append(error);
    delete window[callback];
    script.remove();
  };
  document.head.append(script);
}

commentForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const content = commentInput.value.trim();
  if (!content || content.length > 120) return;

  const submit = commentForm.querySelector('button');
  submit.disabled = true;
  submit.textContent = '등록 중...';
  commentStatus.textContent = '';

  try {
    // Apps Script POST is sent as text/plain to avoid a CORS preflight.
    // no-cors responses are opaque, so the list is refreshed to confirm persistence.
    await fetch(GAS_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        content,
        page: window.location.pathname
      })
    });
    commentInput.value = '';
    commentStatus.textContent = '등록 요청을 보냈어요. 저장 여부를 확인하고 있습니다.';
    setTimeout(loadComments, 1800);
  } catch (error) {
    commentStatus.textContent = '전송에 실패했어요. 네트워크를 확인한 뒤 다시 시도해주세요.';
  } finally {
    submit.disabled = false;
    submit.innerHTML = '등록하기 <span>→</span>';
  }
});

loadComments();
