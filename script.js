const menuBtn=document.querySelector('.menu-btn');const navLinks=document.querySelector('.nav-links');menuBtn?.addEventListener('click',()=>navLinks.classList.toggle('open'));document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const canvas=document.querySelector('#particles'),ctx=canvas.getContext('2d');let particles=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}resize();addEventListener('resize',resize);
for(let i=0;i<55;i++)particles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.7+.3,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25});
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(184,255,61,.28)';particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});requestAnimationFrame(draw)}draw();

const glow=document.querySelector('.cursor-glow');addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
