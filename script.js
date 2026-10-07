const typingEl = document.querySelector('#typing');
const words = ['Creative Developer', 'Frontend Engineer', 'UX-minded Coder'];
let wordIndex = 0, charIndex = 0, deleting = false;

function typeLoop(){
  const word = words[wordIndex];
  typingEl.textContent = deleting ? word.slice(0, --charIndex) : word.slice(0, ++charIndex);
  let delay = deleting ? 45 : 85;
  if(!deleting && charIndex === word.length){ delay = 1300; deleting = true; }
  if(deleting && charIndex === 0){ deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 350; }
  setTimeout(typeLoop, delay);
}
typeLoop();

const navWrap = document.querySelector('.nav-wrap');
window.addEventListener('scroll', () => navWrap.classList.toggle('scrolled', scrollY > 20));

const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const visual = document.querySelector('.hero-visual');
const card = document.querySelector('.portrait-card');
if(visual && card && matchMedia('(pointer:fine)').matches){
  visual.addEventListener('pointermove', e => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5;
    const y = (e.clientY-r.top)/r.height-.5;
    card.style.transform = `rotate(${5+x*8}deg) translate(${x*8}px,${y*8}px)`;
  });
  visual.addEventListener('pointerleave', () => card.style.transform = 'rotate(5deg)');
}

// Lightweight particle field — no external library required.
const canvas = document.querySelector('#particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
function init(){
  particles = Array.from({length: Math.min(75, Math.floor(innerWidth/18))}, () => ({
    x:Math.random()*canvas.width, y:Math.random()*canvas.height,
    vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, r:Math.random()*1.5+.3
  }));
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>canvas.width)p.vx*=-1;
    if(p.y<0||p.y>canvas.height)p.vy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle='rgba(201,255,59,.28)'; ctx.fill();
  });
  requestAnimationFrame(draw);
}
resize(); init(); draw();
addEventListener('resize',()=>{resize();init()});