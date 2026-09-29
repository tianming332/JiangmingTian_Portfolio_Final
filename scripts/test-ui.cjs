/* Dependency-free regression checks for routing and reduced-motion lifecycle. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let passed = 0;
function test(name, fn) { fn(); console.log('PASS', name); passed++; }
test('JavaScript syntax for all changed runtime files', () => {
  for (const file of ['front','site-render','shared-sidebar','welcome-network','portfolio-motion']) execFileSync(process.execPath,['--check',path.join(root,'js',file+'.js')]);
});
for (const host of ['tianming332.github.io','localhost','127.0.0.1']) test('17 project routes on '+host,()=>{
  const context={window:{},location:{hostname:host,origin:'http://'+host+':8796',pathname:'/JiangmingTian_Portfolio_Final/index.html'}};
  vm.runInNewContext(read('data/work-detail-links.js'),context);
  const links=context.window.WORK_DETAIL_LINKS;
  assert.equal(Object.keys(links).length,17);
  for(const [id,record] of Object.entries(links)) {
    assert.ok(record.live.startsWith('https://tianming332.github.io/TIAN-'));
    const resolved=context.window.resolveWorkDetailLink(id);
    assert.ok(resolved.endsWith('/'));
    assert.equal(resolved,host==='tianming332.github.io'?record.live:record.local);
    if(host!=='tianming332.github.io') assert.ok(resolved.includes('/JiangmingTian_Portfolio_Detail_Pages/'));
  }
});
test('Reduced motion reveals content without observers or animation',()=>{
  const handlers={};let observerCount=0;
  const classes=()=>({values:new Set(),add(...xs){xs.forEach(x=>this.values.add(x));},contains(x){return this.values.has(x);}});
  const nodes=Array.from({length:3},()=>({classList:classes(),style:{setProperty(){}}}));
  const preference={matches:true,addEventListener(){}};
  const document={readyState:'loading',body:{dataset:{}},documentElement:{classList:classes()},
    addEventListener(name,fn){handlers[name]=fn;},querySelector(){return null;},getElementById(){return null;},
    querySelectorAll(selector){return selector.startsWith('.filter-panel')?nodes:[];}};
  const window={matchMedia:()=>preference};
  vm.runInNewContext(read('js/portfolio-motion.js'),{window,document,WeakSet,MutationObserver:class{observe(){}},IntersectionObserver:class{constructor(){observerCount++;}},requestAnimationFrame(){throw Error('Unexpected animation frame');},cancelAnimationFrame(){}});
  handlers.DOMContentLoaded();
  assert.equal(observerCount,0);
  for(const node of nodes) assert.ok(node.classList.contains('tjm-in-view'));
  assert.equal(window.TJMMotion.version,'2026-09-29');
});
const welcome=read('js/welcome-network.js');
const frameFunction=welcome.slice(welcome.indexOf('  function animate(time)'),welcome.indexOf('  function build()'));
for(const scenario of [
  {name:'reduced motion',reducedMotion:true,expected:0},
  {name:'original mobile welcome motion',innerWidth:390,expected:1},
  {name:'background tab',hidden:true,expected:0},
  {name:'dismissed welcome',open:false,expected:0},
  {name:'active desktop',expected:1}
]) test('Welcome animation lifecycle: '+scenario.name,()=>{
  let scheduled=0;
  const context={frame:0,lastTime:0,paused:!!scenario.paused,reducedMotion:!!scenario.reducedMotion,innerWidth:scenario.innerWidth||1440,
    document:{hidden:!!scenario.hidden,body:{classList:{contains:()=>scenario.open!==false}}},updateMotion(){},drawLines(){},requestAnimationFrame(){scheduled++;return 1;}};
  vm.runInNewContext(frameFunction+'\nanimate(100);',context);
  assert.equal(scheduled,scenario.expected);
});
test('CSS contains reduced motion, focus, and native dialog protections',()=>{
 const css=read('css/portfolio-motion.css');
 for(const marker of ['prefers-reduced-motion:reduce',':focus-visible','.tjm-types-compact','dialog.tjm-lightbox','.tjm-skip:focus']) assert.ok(css.includes(marker),marker);
});
test('Welcome restores original presentation without the added controls',()=>{
  const css=read('css/portfolio-motion.css');
  assert.ok(!welcome.includes('welcome-pause'));
  assert.ok(!welcome.includes('welcome-direct'));
  assert.ok(!css.includes('.welcome-node-area {'));
  assert.ok(welcome.includes('setTimeout(confirmSelection, 720)'));
  assert.ok(welcome.includes('var skipWelcome = fromProject || (skipOnce && !isReload)'));
});
test('Project glass is offset and fades on desktop hover / keyboard focus',()=>{
  const css=read('css/portfolio-motion.css');
  assert.match(css,/\.project-card \.project-glass \{\s*inset:0;/);
  assert.match(css,/\.project-card \.project-glass \{[^}]*transform:translate\(8px,8px\)/s);
  assert.match(css,/@media \(hover:hover\) and \(pointer:fine\) \{\s*\.project-card:hover \.project-glass \{\s*opacity:0/s);
  assert.match(css,/\.project-card:focus-visible \.project-glass \{\s*opacity:0/s);
  assert.ok(css.includes('backdrop-filter:blur(6px)'));
});
test('Welcome buttons regain rounded styling and the first-pass press animation',()=>{
  const css=read('css/portfolio-motion.css'),js=read('js/portfolio-motion.js');
  assert.match(css,/\.welcome-random,\.welcome-confirm \{ border-radius:12px;/);
  assert.ok(js.includes('event.target.closest(".filter-chip,.welcome-random,.welcome-confirm")'));
  assert.ok(js.includes('scale:".94"'));
});
test('Selected filter chips use black surfaces and white text',()=>{
  const css=read('css/portfolio-motion.css');
  assert.match(css,/body\[data-theme\] \.filter-chip.active \{\s*color:#fff; border-color:#111; background:#111;/);
  assert.match(css,/body\[data-theme\] \.filter-chip.active small \{ color:rgba\(255,255,255,.78\);/);
});
test('Welcome confirm stays black with white text, including ready state',()=>{
  const css=read('css/portfolio-motion.css');
  assert.match(css,/\.welcome-confirm,\.welcome-confirm.ready,body\[data-theme\] \.welcome-confirm \{\s*color:#fff; background:#111; border-color:#111;/);
});
test('Home restores filter and works sections without the editorial introduction',()=>{
  const html=read('index.html'),css=read('css/portfolio-motion.css'),base=read('css/custom.css');
  assert.ok(!html.includes('archive-intro'));
  assert.ok(!css.includes('.archive-intro'));
  const main=html.match(/<main class="page-holder">([\s\S]*?)<\/main>/)[1];
  assert.deepEqual([...main.matchAll(/<section class="([^"]+)"/g)].map(m=>m[1]),['filter-section','works-section']);
  assert.ok(html.includes('<section class="filter-section" id="all-works">'));
  assert.match(base,/\.filter-section \{[^}]*radial-gradient[^}]*#edf1f8/s);
  assert.ok(css.includes('#all-works.filter-section+.works-section { padding-top:30px; background:var(--surface); }'));
  assert.ok(css.includes('#worksGrid>.project-card-wrap { width:33.333333%; }'));
});
test('AI tools list matches the requested spelling and order exactly',()=>{
  const expected=['claudecdoe','vscode+claude/cline','codex','comate','cursor','GPT5-6','opus4.4-5','GLM5','gemin3','grok4'];
  const section=read('text.html').match(/<ul class="ai-tools-list"[^>]*>(.*?)<\/ul>/s)[1];
  const actual=[...section.matchAll(/<li>(.*?)<\/li>/g)].map(m=>m[1]);
  assert.deepEqual(actual,expected);
});
console.log(`${passed} regression checks passed.`);
