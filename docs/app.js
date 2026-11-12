import {createHuman, nearestSurface} from './human-model.js';
import {associations, createEffects} from './effects.js';
import {channels, catalog} from './catalog.js';
import {initialPoints, extraPoints} from './points.js';
import * as T from 'three';
import {OrbitControls} from './OrbitControls.js';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const colors = Object.fromEntries(channels.map(c => [c.name, c.color]));
colors['经外奇穴'] = '#e6a8b2';

// 子午流注与五行属性元数据
const channelMeta = {
  '手太阴肺经':   {short: '肺经', element: '金 · 阴经', shichen: '寅时 03:00–05:00', branch: '寅'},
  '手阳明大肠经': {short: '大肠', element: '金 · 阳经', shichen: '卯时 05:00–07:00', branch: '卯'},
  '足阳明胃经':   {short: '胃经', element: '土 · 阳经', shichen: '辰时 07:00–09:00', branch: '辰'},
  '足太阴脾经':   {short: '脾经', element: '土 · 阴经', shichen: '巳时 09:00–11:00', branch: '巳'},
  '手少阴心经':   {short: '心经', element: '火 · 阴经', shichen: '午时 11:00–13:00', branch: '午'},
  '手太阳小肠经': {short: '小肠', element: '火 · 阳经', shichen: '未时 13:00–15:00', branch: '未'},
  '足太阳膀胱经': {short: '膀胱', element: '水 · 阳经', shichen: '申时 15:00–17:00', branch: '申'},
  '足少阴肾经':   {short: '肾经', element: '水 · 阴经', shichen: '酉时 17:00–19:00', branch: '酉'},
  '手厥阴心包经': {short: '心包', element: '相火 · 阴经', shichen: '戌时 19:00–21:00', branch: '戌'},
  '手少阳三焦经': {short: '三焦', element: '相火 · 阳经', shichen: '亥时 21:00–23:00', branch: '亥'},
  '足少阳胆经':   {short: '胆经', element: '木 · 阳经', shichen: '子时 23:00–01:00', branch: '子'},
  '足厥阴肝经':   {short: '肝经', element: '木 · 阴经', shichen: '丑时 01:00–03:00', branch: '丑'},
  '督脉':         {short: '督脉', element: '阳脉之海', shichen: '奇经 · 贯脊属脑', branch: '督'},
  '任脉':         {short: '任脉', element: '阴脉之海', shichen: '奇经 · 总任诸阴', branch: '任'},
  '经外奇穴':     {short: '奇穴', element: '经外选录', shichen: '奇穴 · 经验效穴', branch: '奇'}
};

// Learning emphasis selected for this atlas, not a clinical importance ranking.
const keyCodes = new Set([
  'GV20','EX-HN3','EX-HN5','GB20','LI20','CV17','CV12','CV6','CV4',
  'GV14','BL23','LI4','LI11','LU7','PC6','PC8','HT7','ST36','SP6',
  'SP9','GB34','KI3','KI1','LR3','BL40'
]);

const mapped = [...initialPoints];
for (const row of extraPoints) {
  const [code, name, pinyin, region, x, y, z, location, view] = row;
  const channel = channels.find(c => code.startsWith(c.code));
  mapped.push({
    code, name, pinyin, region,
    pos: [x, y, z], location, view,
    meridian: channel?.name || '经外奇穴',
    bilateral: !['GV', 'CV'].includes(channel?.code)
  });
}
mapped.find(p => p.code === 'LI4').region = '手部';
mapped.find(p => p.code === 'LR3').region = '足部';

const data = [
  ...mapped,
  ...catalog
    .filter(p => !mapped.some(m => m.code === p.code))
    .map(p => ({
      ...p,
      region: '未建模',
      pinyin: p.code,
      location: '已收录穴名、国际标准编码与所属经脉；此穴位暂未配置简化三维坐标。',
      bilateral: !['GV', 'CV'].includes(p.channel)
    }))
].map((p, id) => ({
  ...p,
  id,
  modeled: !!p.pos,
  important: keyCodes.has(p.code),
  order: parseInt(p.code.match(/\d+$/)?.[0] || 0)
}));

let effectLayer = null, effectPaused = false;
let selected = 3, region = '全部', query = '', channelFilter = '全部', scope = 'model';
let scene, camera, renderer, controls, humanMesh, wireMesh, compassMesh, ambientParticles;
let markers = [], lines = [], qiParticles = [], body = [], auto = false;
let reticleGroup, innerReticle, outerReticle;
let flyAnim = null;

// 计算当前时辰当令经脉
function getCurrentShichenMeridian() {
  const h = new Date().getHours();
  const order = [
    ['足少阳胆经', '子时'],   // 23-1
    ['足厥阴肝经', '丑时'],   // 1-3
    ['手太阴肺经', '寅时'],   // 3-5
    ['手阳明大肠经', '卯时'], // 5-7
    ['足阳明胃经', '辰时'],   // 7-9
    ['足太阴脾经', '巳时'],   // 9-11
    ['手少阴心经', '午时'],   // 11-13
    ['手太阳小肠经', '未时'], // 13-15
    ['足太阳膀胱经', '申时'], // 15-17
    ['足少阴肾经', '酉时'],   // 17-19
    ['手厥阴心包经', '戌时'], // 19-21
    ['手少阳三焦经', '亥时']  // 21-23
  ];
  const idx = Math.floor(((h + 1) % 24) / 2);
  return {meridian: order[idx][0], shichen: order[idx][1]};
}

const activeShichen = getCurrentShichenMeridian();
if ($('#shichenText')) {
  $('#shichenText').textContent = `${activeShichen.shichen}当令 · ${activeShichen.meridian}`;
  $('#shichenBtn').onclick = () => {
    setChannelFilter(activeShichen.meridian);
    const first = data.find(p => p.meridian === activeShichen.meridian && p.modeled);
    if (first) select(first.id, true);
  };
}

const normalize = s =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f\s-]/g, '')
    .replace(/^sj/, 'te')
    .replace(/^du/, 'gv')
    .replace(/^ren/, 'cv');

const visible = p =>
  (scope === 'catalog' || p.modeled) &&
  (scope === 'catalog' || region === '全部' || p.region === region) &&
  (channelFilter === '全部' || p.meridian === channelFilter) &&
  (!query || normalize(p.name + p.code + p.pinyin + p.meridian + (p.code === 'GV26' ? '人中' : '')).includes(normalize(query)));

const siblings = () =>
  data
    .filter(p => p.meridian === data[selected].meridian && (scope === 'catalog' || p.modeled))
    .sort((a, b) => a.order - b.order);

function syncMeridianPills() {
  $$('#meridianPills button').forEach(b => {
    b.classList.toggle('active', b.dataset.channel === channelFilter);
  });
  const filterBadge = $('#activeFilterBadge');
  if (filterBadge) {
    const parts = [];
    if (channelFilter !== '全部') parts.push(channelMeta[channelFilter]?.short || channelFilter);
    if (region !== '全部' && scope === 'model') parts.push(region);
    if (query) parts.push(`“${query}”`);
    filterBadge.hidden = parts.length === 0;
    filterBadge.textContent = '筛选：' + parts.join(' · ');
  }
}

function setChannelFilter(val) {
  channelFilter = val;
  $('#channelFilter').value = val;
  syncMeridianPills();
  list();
}

function list() {
  const filtered = data.filter(visible).sort((a, b) => (a.meridian === b.meridian ? a.order - b.order : 0));
  $('#count').textContent = `共 ${filtered.length} 穴`;
  $('#list').innerHTML = filtered.length
    ? filtered
        .map(
          p => `<button class="point-row ${p.id === selected ? 'active' : ''}" data-id="${p.id}">
            <span>
              <b>
                <i class="row-dot" style="background:${colors[p.meridian]};color:${colors[p.meridian]}"></i>
                ${p.name}
                ${p.important ? '<i class="key-badge">重点</i>' : ''}
                ${associations[p.code] ? '<i class="fx-badge">关联</i>' : ''}
              </b>
              <small>${p.meridian} · ${p.modeled ? p.region + ' · 3D' : '仅目录索引'}</small>
            </span>
            <span>${p.code}</span>
          </button>`
        )
        .join('')
    : '<p class="muted" style="padding:14px 4px">没有匹配的穴位。试试重置筛选，或切换至「完整目录」。</p>';

  $('#list').querySelectorAll('button').forEach(b => (b.onclick = () => select(+b.dataset.id, true)));
  $('#stageCount').textContent = `${data.filter(p => p.modeled && visible(p)).length} 个 3D 穴位可见`;

  const c = channels.find(c => c.name === channelFilter);
  const meta = channelMeta[channelFilter];
  const metaEl = $('#channelMeta');
  if (c && meta) {
    metaEl.hidden = false;
    metaEl.innerHTML = `<span class="meta-tag gold">${meta.element}</span><span class="meta-tag">${meta.shichen}</span>`;
    $('#channelSummary').textContent = `循行：${c.route}（共 ${c.names.length} 穴，已三维建模 ${mapped.filter(p => p.meridian === c.name).length} 穴）`;
  } else {
    metaEl.hidden = true;
    $('#channelSummary').textContent = '涵盖十二正经与任督二脉 361 穴，另选录印堂、太阳 2 奇穴。';
  }
  syncMeridianPills();
}

function select(id, turn = false) {
  selected = id;
  const p = data[id];
  for (const key of ['code', 'name', 'pinyin', 'meridian', 'location']) {
    $('#' + key).textContent = p[key];
  }
  const mColor = colors[p.meridian] || '#6cf0dc';
  $('#meridian').style.borderColor = mColor + '66';
  $('#meridian').style.color = mColor;

  const meta = channelMeta[p.meridian] || {element: '经穴', shichen: ''};
  if ($('#elementBadge')) $('#elementBadge').textContent = meta.element;
  if ($('#bilateralBadge')) $('#bilateralBadge').textContent = p.bilateral ? '左右对称双穴' : '正中单穴';

  $('#modelStatus').textContent = p.important ? '★ 重点选录穴位' : p.modeled ? '● 3D 空间点位' : '○ 仅目录索引';
  $('#modelStatus').classList.toggle('important', p.important);

  $('#focus').disabled = !p.modeled;
  $('#focus').innerHTML = p.modeled
    ? '<span>聚焦此穴位 · 镜头推进</span><span class="focus-arrow">↗</span>'
    : '<span>此穴位暂未配置三维坐标</span>';

  $('#tip').textContent = p.modeled
    ? p.bilateral
      ? '成对分布于身体左右两侧。可通过上方「对称侧」切换左/右观察，滚轮放大可查看局部经脉连线。'
      : '位于头面或躯干正中线（任督二脉）。结合正面或背面视角可清晰观察上下穴位排布。'
    : '当前仅收录标准编码、名称及经脉次序。选择带「3D」标记的穴位可在三维人体模型上定位。';

  const c = channels.find(c => c.name === p.meridian);
  $('#routeInfo').textContent = c ? `循行方向：${c.route}` : '不归属于十四经脉的经验选录奇穴。';
  if ($('#shichenDetail')) {
    $('#shichenDetail').innerHTML = `<span>子午流注：<b>${meta.shichen}</b></span><span>五行：<b>${meta.element}</b></span>`;
  }
  $('#channelTotal').textContent = c
    ? `本经 ${c.names.length} 穴 · 3D 示意 ${mapped.filter(x => x.meridian === c.name).length} 穴`
    : '经外奇穴 · 选录 2 穴';

  const sib = siblings();
  const i = sib.findIndex(x => x.id === id);
  $('#neighborIndex').textContent = `${i + 1} / ${sib.length}`;
  $('#previous').disabled = i <= 0;
  $('#next').disabled = i < 0 || i === sib.length - 1;
  $('#nearby').innerHTML = sib
    .slice(Math.max(0, i - 3), i + 4)
    .map(x => `<button data-id="${x.id}" class="${x.id === id ? 'active' : ''}">${x.name}<small>${x.code}</small></button>`)
    .join('');
  $('#nearby').querySelectorAll('button').forEach(b => (b.onclick = () => select(+b.dataset.id, true)));

  $$('#effectExamples button').forEach(b => b.classList.toggle('active', b.dataset.code === p.code));

  list();
  const activeRow = $('#list .point-row.active');
  if (activeRow) activeRow.scrollIntoView({block: 'nearest', behavior: 'smooth'});

  if (turn && camera && p.modeled) focusPoint();
  updateEffects(turn && !p.modeled);
}

// 初始化解剖区域按钮
$('#regions').innerHTML = ['全部', '头颈', '躯干', '背部', '上肢', '手部', '下肢', '足部']
  .map(r => `<button class="${r === '全部' ? 'active' : ''}">${r}</button>`)
  .join('');

$('#regions').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    region = b.textContent;
    $('#regions').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    list();
    if (camera) {
      if (region === '背部') setView('back');
      else if (region === '头颈') setView('head');
      else if (region === '足部') setView('foot');
      else if (region === '手部') setView('hand');
      else setView('front');
    }
  };
});

// 初始化经脉下拉与快捷胶囊
$('#channelFilter').innerHTML =
  '<option value="全部">全部十四经脉 + 奇穴</option>' +
  channels.map(c => `<option value="${c.name}">${c.code} · ${c.name} (${channelMeta[c.name]?.element || ''})</option>`).join('') +
  '<option value="经外奇穴">EX · 经外奇穴</option>';

$('#meridianPills').innerHTML =
  `<button data-channel="全部" class="active">全部</button>` +
  channels
    .map(c => `<button data-channel="${c.name}" title="${c.name} (${c.route})"><i style="background:${c.color}"></i>${channelMeta[c.name]?.short || c.code}</button>`)
    .join('') +
  `<button data-channel="经外奇穴"><i style="background:${colors['经外奇穴']}"></i>奇穴</button>`;

$('#meridianPills').querySelectorAll('button').forEach(b => {
  b.onclick = () => setChannelFilter(b.dataset.channel);
});

$('#channelFilter').onchange = e => setChannelFilter(e.target.value);
$('#search').oninput = e => {
  query = e.target.value.trim();
  list();
};

$('#scope').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    scope = b.dataset.scope;
    $('#scope').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    $('#regionSection').hidden = scope === 'catalog';
    select(selected);
  };
});

$('#clear').onclick = () => {
  region = '全部';
  query = '';
  channelFilter = '全部';
  $('#search').value = '';
  $('#channelFilter').value = '全部';
  $('#regions').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.textContent === '全部'));
  list();
  setView('front');
};

$('#previous').onclick = () => {
  const a = siblings(), i = a.findIndex(p => p.id === selected);
  if (i > 0) select(a[i - 1].id, true);
};
$('#next').onclick = () => {
  const a = siblings(), i = a.findIndex(p => p.id === selected);
  if (i >= 0 && i < a.length - 1) select(a[i + 1].id, true);
};

$('#summaryCounts').textContent = `${mapped.length} 个三维空间穴位 · ${mapped.filter(p => associations[p.code]).length} 个动态关联流光`;
$('#footerCount').textContent = `已收录 361 正经穴 + 2 奇穴 · ${mapped.length} 个 3D 空间坐标`;

$('#sideChoice').onchange = () => {
  if (data[selected].modeled) focusPoint();
  updateEffects(true);
};

// 经典关联穴位快捷按钮
$('#effectExamples').innerHTML = ['LI4', 'PC6', 'ST36', 'GB20', 'CV12', 'BL40', 'LU7', 'LR3']
  .map(code => {
    const p = data.find(p => p.code === code);
    return `<button data-code="${code}">${p.name}</button>`;
  })
  .join('');

$('#effectExamples').querySelectorAll('button').forEach(b => {
  b.onclick = () => {
    $('#clear').click();
    select(data.find(p => p.code === b.dataset.code).id, true);
  };
});

function updateEffects(fit = false) {
  const p = data[selected], info = associations[p.code];
  $('#effectSummary').textContent = info ? info.note : '此穴位暂未收录可视化部位关联，当前不绘制三维流光连线。';
  $('#effectKind').textContent = info ? info.kind : '暂无关联';
  $('#effectTargets').textContent = info ? '关联区域：' + info.targets.map(t => t[0]).join(' · ') : '暂未配置区域连线';
  $('#effectSource').hidden = !info;
  if (info) $('#effectSource').href = info.source;
  $('#pauseEffects').disabled = !info;
  $('#fitEffects').disabled = !info;
  if (!effectLayer) return;
  const side = Number($('#sideChoice').value);
  const mark = markers.find(m => m.p.id === selected && (m.side === side || !m.p.bilateral));
  effectLayer.show(p, mark?.mesh.position.clone(), side);
  effectLayer.setEnabled($('#showEffects').checked);
  if (info && fit && $('#showEffects').checked) frameEffects();
}

// 丝滑相机过渡动画
function flyTo(targetPos, camPos, duration = 680) {
  if (!camera || !controls) return;
  flyAnim = {
    startTime: performance.now(),
    duration,
    startTarget: controls.target.clone(),
    endTarget: targetPos.clone(),
    startCam: camera.position.clone(),
    endCam: camPos.clone()
  };
}

function frameEffects() {
  if (!camera || !associations[data[selected].code]) return;
  auto = false;
  $('#rotate').classList.remove('active');
  const p = data[selected], info = associations[p.code];
  const rear = p.pos?.[2] < 0 && info.targets.every(t => t[1][2] < 0);
  const side = Number($('#sideChoice').value);
  flyTo(new T.Vector3(0, 4.32, 0), new T.Vector3(side * 1.35, 4.75, rear ? -12.6 : 12.6));
  $$('[data-view]').forEach(b => b.classList.remove('active'));
}

$('#showEffects').onchange = () => {
  effectLayer?.setEnabled($('#showEffects').checked);
  if ($('#showEffects').checked) frameEffects();
};
$('#pauseEffects').onclick = () => {
  effectPaused = !effectPaused;
  effectLayer?.setPaused(effectPaused);
  $('#pauseEffects').textContent = effectPaused ? '继续流动' : '暂停流动';
};
$('#fitEffects').onclick = frameEffects;

function focusPoint() {
  if (!camera || !data[selected].modeled) return;
  const side = Number($('#sideChoice').value);
  const mark = markers.find(m => m.p.id === selected && (m.side === side || !m.p.bilateral));
  if (!mark) return;
  auto = false;
  $('#rotate').classList.remove('active');
  const dir = mark.normal.clone();
  const dist = data[selected].view === 'sole' ? 2.6 : 3.05;
  const camPos = mark.mesh.position.clone().add(dir.multiplyScalar(dist));
  camPos.y += 0.12;
  flyTo(mark.mesh.position, camPos, 650);
  $$('[data-view]').forEach(b => b.classList.remove('active'));
}

function setView(v) {
  if (!camera) return;
  auto = false;
  $('#rotate').classList.remove('active');
  const side = Number($('#sideChoice').value);
  const d = 12.2;
  let target = new T.Vector3(0, 4.22, 0);
  let cam = new T.Vector3(0, 4.5, d);
  if (v === 'side') cam.set(side * d, 4.35, 0);
  else if (v === 'back') cam.set(0, 4.35, -d);
  else if (v === 'head') {
    target.set(0, 7.32, 0);
    cam.set(0, 7.36, 3.15);
  } else if (v === 'hand') {
    target.set(side * 1.68, 4.32, 0.05);
    cam.set(side * 1.75, 4.38, 2.95);
  } else if (v === 'foot') {
    target.set(side * 0.42, 0.55, 0.2);
    cam.set(side * 0.65, 1.35, 3.25);
  }
  flyTo(target, cam, 620);
  $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
}

// 创建程序化工作室反射环境贴图 (无需外部 HDR 文件)
function createStudioEnvironment(renderer) {
  const pmrem = new T.PMREMGenerator(renderer);
  const envScene = new T.Scene();
  envScene.background = new T.Color(0x060d14);

  const topLight = new T.Mesh(
    new T.PlaneGeometry(18, 18),
    new T.MeshBasicMaterial({color: 0xdffbf7, side: T.DoubleSide})
  );
  topLight.position.set(0, 12, 0);
  topLight.rotation.x = Math.PI / 2;
  envScene.add(topLight);

  const keyBox = new T.Mesh(
    new T.PlaneGeometry(12, 16),
    new T.MeshBasicMaterial({color: 0x6cf0dc, side: T.DoubleSide})
  );
  keyBox.position.set(-9, 6, 8);
  keyBox.lookAt(0, 4, 0);
  envScene.add(keyBox);

  const warmBox = new T.Mesh(
    new T.PlaneGeometry(12, 16),
    new T.MeshBasicMaterial({color: 0xffd584, side: T.DoubleSide})
  );
  warmBox.position.set(9, 5, 6);
  warmBox.lookAt(0, 4, 0);
  envScene.add(warmBox);

  const rimBox = new T.Mesh(
    new T.PlaneGeometry(14, 14),
    new T.MeshBasicMaterial({color: 0x4ba3c7, side: T.DoubleSide})
  );
  rimBox.position.set(0, 6, -10);
  rimBox.lookAt(0, 4, 0);
  envScene.add(rimBox);

  const tex = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  return tex;
}

// 绘制东方太极子午流注罗盘底座纹理
function createCompassPedestalTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const cx = 512, cy = 512;

  const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 500);
  bg.addColorStop(0, 'rgba(108, 240, 220, 0.20)');
  bg.addColorStop(0.45, 'rgba(30, 82, 92, 0.12)');
  bg.addColorStop(0.85, 'rgba(10, 26, 36, 0.04)');
  bg.addColorStop(1, 'rgba(6, 13, 20, 0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);

  const rings = [
    [470, 'rgba(108, 240, 220, 0.32)', 2],
    [448, 'rgba(245, 204, 126, 0.25)', 1.2],
    [372, 'rgba(108, 240, 220, 0.22)', 1.5],
    [300, 'rgba(108, 240, 220, 0.16)', 1],
    [215, 'rgba(245, 204, 126, 0.22)', 1.5],
    [130, 'rgba(108, 240, 220, 0.25)', 1]
  ];
  for (const [r, stroke, lw] of rings) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  // 72 刻度线
  for (let i = 0; i < 72; i++) {
    const ang = (i * Math.PI * 2) / 72;
    const major = i % 6 === 0;
    const r1 = major ? 448 : 456;
    const r2 = 470;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
    ctx.strokeStyle = major ? 'rgba(245, 204, 126, 0.55)' : 'rgba(108, 240, 220, 0.22)';
    ctx.lineWidth = major ? 2 : 1;
    ctx.stroke();
  }

  // 十二地支与十二正经刻度文字
  const branches = [
    ['子 · 胆', '23-01'], ['丑 · 肝', '01-03'], ['寅 · 肺', '03-05'], ['卯 · 大肠', '05-07'],
    ['辰 · 胃', '07-09'], ['巳 · 脾', '09-11'], ['午 · 心', '11-13'], ['未 · 小肠', '13-15'],
    ['申 · 膀胱', '15-17'], ['酉 · 肾', '17-19'], ['戌 · 心包', '19-21'], ['亥 · 三焦', '21-23']
  ];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  branches.forEach(([label], idx) => {
    const ang = (idx * Math.PI * 2) / 12 - Math.PI / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(ang) * 410, cy + Math.sin(ang) * 410);
    ctx.rotate(ang + Math.PI / 2);
    ctx.font = '600 22px "Songti SC", "Noto Serif SC", serif';
    ctx.fillStyle = 'rgba(220, 245, 242, 0.58)';
    ctx.fillText(label, 0, 0);
    ctx.restore();

    // 径向分割虚线
    const lineAng = ang + Math.PI / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(lineAng) * 215, cy + Math.sin(lineAng) * 215);
    ctx.lineTo(cx + Math.cos(lineAng) * 448, cy + Math.sin(lineAng) * 448);
    ctx.strokeStyle = 'rgba(108, 240, 220, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// 切换人体三维材质预设 (琉璃玉质 / 天圣铜人 / 温润素肌)
function setBodyMaterial(mode) {
  if (!humanMesh) return;
  const [skin, eye] = humanMesh.material;
  if (mode === 'jade') {
    skin.color.setHex(0x1f4952);
    skin.emissive.setHex(0x082026);
    skin.emissiveIntensity = 0.65;
    skin.roughness = 0.24;
    skin.metalness = 0.12;
    skin.clearcoat = 0.88;
    skin.clearcoatRoughness = 0.16;
    skin.sheen = 0.85;
    skin.sheenColor = new T.Color(0x73efda);
    skin.sheenRoughness = 0.35;
    skin.transparent = true;
    skin.opacity = 0.94;
    eye.color.setHex(0x88e8dc);
    if (wireMesh) {
      wireMesh.material.color.setHex(0x73efda);
      wireMesh.material.opacity = 0.042;
    }
  } else if (mode === 'bronze') {
    skin.color.setHex(0x9e7748);
    skin.emissive.setHex(0x1b1106);
    skin.emissiveIntensity = 0.38;
    skin.roughness = 0.32;
    skin.metalness = 0.82;
    skin.clearcoat = 0.42;
    skin.clearcoatRoughness = 0.24;
    skin.sheen = 0.55;
    skin.sheenColor = new T.Color(0x52c4ae);
    skin.sheenRoughness = 0.4;
    skin.transparent = false;
    skin.opacity = 1;
    eye.color.setHex(0xc9a775);
    if (wireMesh) {
      wireMesh.material.color.setHex(0xf5cc7e);
      wireMesh.material.opacity = 0.032;
    }
  } else {
    skin.color.setHex(0xd49f82);
    skin.emissive.setHex(0x1c0e08);
    skin.emissiveIntensity = 0.22;
    skin.roughness = 0.52;
    skin.metalness = 0.02;
    skin.clearcoat = 0.14;
    skin.clearcoatRoughness = 0.5;
    skin.sheen = 0.5;
    skin.sheenColor = new T.Color(0xffd7c2);
    skin.sheenRoughness = 0.6;
    skin.transparent = false;
    skin.opacity = 1;
    eye.color.setHex(0xebe0d5);
    if (wireMesh) {
      wireMesh.material.color.setHex(0xffffff);
      wireMesh.material.opacity = 0.018;
    }
  }
  skin.needsUpdate = true;
  eye.needsUpdate = true;
  $$('#materialSwitch button').forEach(b => b.classList.toggle('active', b.dataset.mat === mode));
}

try {
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
  renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  $('#canvas').appendChild(renderer.domElement);

  scene.environment = createStudioEnvironment(renderer);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = true;
  controls.minDistance = 1.9;
  controls.maxDistance = 18.5;
  controls.maxPolarAngle = Math.PI - 0.03;
  controls.minPolarAngle = 0.1;
  controls.addEventListener('start', () => {
    flyAnim = null;
  });

  // 初始相机位置
  camera.position.set(0, 4.5, 12.2);
  controls.target.set(0, 4.22, 0);
  controls.update();

  // 层次化戏剧光影
  scene.add(new T.HemisphereLight(0xe4fbf7, 0x1c2833, 1.45));
  const lights = [
    [-4.5, 8.5, 5.5, 0xfff0d8, 2.4], // 暖金主光
    [4.8, 6.0, -4.5, 0x6cf0dc, 2.2], // 青玉轮廓光
    [-4.2, 4.0, -5.0, 0x5ea8ff, 1.5], // 背部冷蓝轮廓光
    [0, 3.8, 6.5, 0xffffff, 0.55]    // 正面柔光补光
  ];
  for (const [x, y, z, c, intensity] of lights) {
    const l = new T.DirectionalLight(c, intensity);
    l.position.set(x, y, z);
    scene.add(l);
  }

  humanMesh = createHuman();
  scene.add(humanMesh);
  body.push(humanMesh);

  // 精细解剖经纬网格叠加层
  wireMesh = new T.Mesh(
    humanMesh.geometry,
    new T.MeshBasicMaterial({
      color: 0x73efda,
      wireframe: true,
      transparent: true,
      opacity: 0.042,
      depthWrite: false
    })
  );
  scene.add(wireMesh);

  // 默认应用东方琉璃玉质材质
  setBodyMaterial('jade');

  // 罗盘底座
  const compassTex = createCompassPedestalTexture();
  if (compassTex) {
    compassMesh = new T.Mesh(
      new T.PlaneGeometry(4.6, 4.6),
      new T.MeshBasicMaterial({
        map: compassTex,
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending
      })
    );
    compassMesh.rotation.x = -Math.PI / 2;
    compassMesh.position.y = 0.13;
    scene.add(compassMesh);
  }

  const ring = new T.Mesh(
    new T.TorusGeometry(1.42, 0.008, 10, 128),
    new T.MeshBasicMaterial({color: 0x6cf0dc, transparent: true, opacity: 0.45})
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.14;
  scene.add(ring);

  const outerRing = new T.Mesh(
    new T.TorusGeometry(1.88, 0.005, 8, 128),
    new T.MeshBasicMaterial({color: 0xf5cc7e, transparent: true, opacity: 0.24})
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.14;
  scene.add(outerRing);

  // 制作发光粒子贴图
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = dotCanvas.height = 64;
  const dctx = dotCanvas.getContext('2d');
  if (dctx) {
    const g = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.32, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    dctx.fillStyle = g;
    dctx.fillRect(0, 0, 64, 64);
  }
  const dotTex = new T.CanvasTexture(dotCanvas);

  // 空间微尘气感粒子
  const pCount = 70;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 1.1 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    pPositions[i * 3] = Math.cos(theta) * r;
    pPositions[i * 3 + 1] = 0.3 + Math.random() * 7.8;
    pPositions[i * 3 + 2] = Math.sin(theta) * r;
  }
  const pGeo = new T.BufferGeometry();
  pGeo.setAttribute('position', new T.BufferAttribute(pPositions, 3));
  ambientParticles = new T.Points(
    pGeo,
    new T.PointsMaterial({
      map: dotTex,
      color: 0x73efda,
      size: 0.08,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: T.AdditiveBlending
    })
  );
  scene.add(ambientParticles);

  // 选中穴位的贴合体表双环靶标
  reticleGroup = new T.Group();
  innerReticle = new T.Mesh(
    new T.RingGeometry(0.068, 0.086, 48),
    new T.MeshBasicMaterial({
      color: 0xf5cc7e,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthTest: false,
      blending: T.AdditiveBlending
    })
  );
  outerReticle = new T.Mesh(
    new T.RingGeometry(0.115, 0.13, 48),
    new T.MeshBasicMaterial({
      color: 0x6cf0dc,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.65,
      depthTest: false,
      blending: T.AdditiveBlending
    })
  );
  reticleGroup.add(innerReticle, outerReticle);
  reticleGroup.renderOrder = 12;
  scene.add(reticleGroup);

  // 投射并生成三维穴位节点与光晕
  scene.updateMatrixWorld(true);
  const surfaceRay = new T.Raycaster();

  for (const p of data.filter(p => p.modeled)) {
    for (const side of p.bilateral ? [-1, 1] : [1]) {
      const pos = new T.Vector3(p.pos[0] * side, p.pos[1], p.pos[2]);
      let normal = new T.Vector3(0, 0, pos.z < 0 ? -1 : 1);
      const origin = pos.clone();
      if (p.view === 'sole') {
        origin.y = -2;
        normal.set(0, -1, 0);
      } else if (Math.abs(pos.z) < 0.08 && p.pos[0] > 0.2 && p.region !== '手部') {
        origin.x = side * 3;
        normal.set(side, 0, 0);
      } else {
        origin.z = normal.z * 3;
      }
      surfaceRay.set(origin, normal.clone().negate());
      const hit = surfaceRay
        .intersectObjects(body)
        .sort((a, b) => a.point.distanceToSquared(pos) - b.point.distanceToSquared(pos))[0];

      if (hit) {
        normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        pos.copy(hit.point).addScaledVector(normal, 0.032);
      } else {
        const closest = nearestSurface(humanMesh, pos);
        normal.copy(closest.normal);
        pos.copy(closest.point).addScaledVector(normal, 0.032);
      }

      const baseColor = p.important ? '#f5cc7e' : colors[p.meridian];
      const radius = p.important ? 0.044 : 0.026;
      const m = new T.Mesh(
        new T.SphereGeometry(radius, 18, 14),
        new T.MeshBasicMaterial({color: baseColor})
      );
      m.position.copy(pos);
      m.userData.id = p.id;
      scene.add(m);

      // 发光光晕 Sprite
      const glow = new T.Sprite(
        new T.SpriteMaterial({
          map: dotTex,
          color: baseColor,
          transparent: true,
          opacity: p.important ? 0.72 : 0.48,
          depthWrite: false,
          blending: T.AdditiveBlending
        })
      );
      const gs = p.important ? 0.22 : 0.13;
      glow.scale.set(gs, gs, 1);
      m.add(glow);

      const label = document.createElement('button');
      label.className = 'pin-label' + (p.important ? ' key-label' : '');
      label.style.setProperty('--pin-color', baseColor);
      label.textContent = p.name;
      label.onclick = () => select(p.id, true);
      $('#labels').appendChild(label);

      markers.push({mesh: m, glow, label, p, side, normal});
    }
  }

  // 构建贴合人体曲面的平滑经脉曲线 + 经气循行粒子
  for (const meridian of Object.keys(colors)) {
    for (const side of [-1, 1]) {
      const group = markers
        .filter(m => m.p.meridian === meridian && m.side === side)
        .sort((a, b) => a.p.order - b.p.order);

      for (let i = 1; i < group.length; i++) {
        const a = group[i - 1], b = group[i];
        if (
          a.p.region !== b.p.region ||
          a.mesh.position.distanceTo(b.mesh.position) > 1.22 ||
          a.normal.dot(b.normal) < 0.25
        ) continue;

        // 曲面细分采样，让经脉线贴合人体表面而非穿模直线
        const ctrlPts = [a.mesh.position.clone()];
        const steps = 4;
        for (let s = 1; s < steps; s++) {
          const lerped = a.mesh.position.clone().lerp(b.mesh.position, s / steps);
          const surf = nearestSurface(humanMesh, lerped);
          ctrlPts.push(surf.point.addScaledVector(surf.normal, 0.034));
        }
        ctrlPts.push(b.mesh.position.clone());

        const curve = new T.CatmullRomCurve3(ctrlPts);
        const line = new T.Line(
          new T.BufferGeometry().setFromPoints(curve.getPoints(24)),
          new T.LineBasicMaterial({
            color: colors[meridian],
            transparent: true,
            opacity: 0.62
          })
        );
        line.userData = {points: [a, b], meridian, curve};
        scene.add(line);
        lines.push(line);

        // 每条经脉曲线段配置一颗流动经气粒子
        const qi = new T.Sprite(
          new T.SpriteMaterial({
            map: dotTex,
            color: colors[meridian],
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: T.AdditiveBlending
          })
        );
        qi.scale.set(0.09, 0.09, 1);
        scene.add(qi);
        qiParticles.push({sprite: qi, line, curve, offset: (i * 0.23) % 1});
      }
    }
  }

  // 鼠标点击与悬停交互
  const ray = new T.Raycaster(), pointer = new T.Vector2();
  let down = null, hoveredId = null;

  renderer.domElement.addEventListener('pointerdown', e => {
    down = [e.clientX, e.clientY];
  });

  renderer.domElement.addEventListener('pointermove', e => {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hits = ray.intersectObjects(markers.filter(m => m.mesh.visible).map(m => m.mesh));
    const tip = $('#hoverTip');
    if (hits.length > 0 && hits[0].object.userData.id !== undefined) {
      const id = hits[0].object.userData.id;
      hoveredId = id;
      renderer.domElement.style.cursor = 'pointer';
      const pt = data[id];
      if (tip) {
        tip.hidden = false;
        tip.innerHTML = `<b>${pt.name}</b><small>${pt.code}</small> · ${pt.meridian}`;
        tip.style.left = `${e.clientX - r.left}px`;
        tip.style.top = `${e.clientY - r.top}px`;
      }
    } else {
      hoveredId = null;
      renderer.domElement.style.cursor = '';
      if (tip) tip.hidden = true;
    }
  });

  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects([...markers.filter(m => m.mesh.visible).map(m => m.mesh), ...body])[0];
    if (hit && hit.object.userData.id !== undefined) select(hit.object.userData.id, true);
  });

  new ResizeObserver(() => {
    const r = $('#canvas').getBoundingClientRect();
    if (!r.width || !r.height) return;
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height);
  }).observe($('#canvas'));

  effectLayer = createEffects(scene, $('#effectLabels'));
  select(selected);

  const screen = new T.Vector3(), world = new T.Vector3(), zAxis = new T.Vector3(0, 0, 1);
  let lastLabels = 0;

  function animate(time = 0) {
    requestAnimationFrame(animate);

    // 丝滑相机飞行插值
    if (flyAnim) {
      const t = Math.min(1, (time - flyAnim.startTime) / flyAnim.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      controls.target.lerpVectors(flyAnim.startTarget, flyAnim.endTarget, ease);
      camera.position.lerpVectors(flyAnim.startCam, flyAnim.endCam, ease);
      if (t >= 1) flyAnim = null;
    }

    controls.autoRotate = auto;
    controls.autoRotateSpeed = 0.65;
    controls.update();

    if (compassMesh) compassMesh.rotation.z = time * 0.00006;
    if (ambientParticles) ambientParticles.rotation.y = -time * 0.00008;

    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
    const activeSide = Number($('#sideChoice').value);
    const selectedPoint = data[selected];
    let selectedMarker = null;

    for (const m of markers) {
      m.mesh.visible = visible(m.p);
      const isSel = m.p.id === selected && (m.side === activeSide || !m.p.bilateral);
      const isHov = m.p.id === hoveredId;
      if (isSel) selectedMarker = m;

      const pulse = isSel ? 1.55 + 0.15 * Math.sin(time * 0.006) : isHov ? 1.35 : 1;
      m.mesh.scale.setScalar(pulse);
      m.mesh.material.color.set(
        isSel ? '#fff6d6' : isHov ? '#ffffff' : m.p.important ? '#f5cc7e' : colors[m.p.meridian]
      );
    }

    // 更新选中穴位的体表双环靶标
    if (selectedMarker && selectedMarker.mesh.visible) {
      reticleGroup.visible = true;
      reticleGroup.position.copy(selectedMarker.mesh.position);
      reticleGroup.quaternion.setFromUnitVectors(zAxis, selectedMarker.normal);
      innerReticle.scale.setScalar(1 + 0.14 * Math.sin(time * 0.005));
      const wave = (time * 0.0008) % 1;
      outerReticle.scale.setScalar(0.9 + wave * 0.55);
      outerReticle.material.opacity = 0.7 * (1 - wave);
    } else {
      reticleGroup.visible = false;
    }

    // 更新浮动穴位标签 (带遮挡剔除与防重叠)
    if (time - lastLabels > 80) {
      lastLabels = time;
      const occupied = [];
      const ordered = [...markers].sort(
        (a, b) => (b.p.id === selected) - (a.p.id === selected) || Number(b.p.important) - Number(a.p.important)
      );

      for (const m of ordered) {
        m.label.hidden = true;
        if (!m.mesh.visible || !$('#showLabels').checked) continue;
        if (m.p.bilateral && m.side !== activeSide) continue;

        screen.copy(m.mesh.position).project(camera);
        const x = (screen.x * 0.5 + 0.5) * w, y = (-screen.y * 0.5 + 0.5) * h;
        if (screen.z > 1 || screen.z < -1 || x < 10 || x > w - 85 || y < 95 || y > h - 75) continue;

        world.copy(camera.position).sub(m.mesh.position);
        if (world.dot(m.normal) < 0) continue;
        if (occupied.length >= 18 && m.p.id !== selected) continue;
        if (occupied.some(r => Math.abs(r.x - x) < 82 && Math.abs(r.y - y) < 26) && m.p.id !== selected) continue;

        ray.set(camera.position, world.clone().negate().normalize());
        const hit = ray.intersectObjects(body)[0];
        if (hit && hit.distance < world.length() - 0.04) continue;

        occupied.push({x, y});
        m.label.hidden = false;
        m.label.classList.toggle('selected', m.p.id === selected);
        m.label.style.left = x + 'px';
        m.label.style.top = y + 'px';
      }
    }

    // 更新经脉连线与经气循行粒子
    const showLines = $('#showLines').checked;
    for (const l of lines) {
      const isVis = showLines && l.userData.points.every(m => visible(m.p));
      l.visible = isVis;
      if (isVis) {
        const isCurrentMeridian = l.userData.meridian === selectedPoint?.meridian;
        l.material.opacity = isCurrentMeridian ? 0.88 : 0.38;
      }
    }

    for (const qp of qiParticles) {
      const isCurrentMeridian = qp.line.userData.meridian === selectedPoint?.meridian;
      qp.sprite.visible = qp.line.visible && (isCurrentMeridian || channelFilter !== '全部');
      if (qp.sprite.visible) {
        const t = (time * 0.00045 + qp.offset) % 1;
        qp.sprite.position.copy(qp.curve.getPoint(t));
      }
    }

    effectLayer?.update(time, camera, w, h);
    renderer.render(scene, camera);
  }
  animate();
} catch (e) {
  console.error(e);
  $('#error').hidden = false;
}

// 绑定工具栏与快捷键
$$('[data-view]').forEach(b => (b.onclick = () => setView(b.dataset.view)));
$$('#materialSwitch button').forEach(b => (b.onclick = () => setBodyMaterial(b.dataset.mat)));
$('#reset').onclick = () => setView('front');

function zoom(f) {
  if (!camera) return;
  const nextPos = camera.position.clone().sub(controls.target).multiplyScalar(f).add(controls.target);
  flyTo(controls.target, nextPos, 280);
}
$('#plus').onclick = () => zoom(0.78);
$('#minus').onclick = () => zoom(1.25);
$('#rotate').onclick = () => {
  auto = !auto;
  $('#rotate').classList.toggle('active', auto);
};
if ($('#showWire')) {
  $('#showWire').onchange = e => {
    if (wireMesh) wireMesh.visible = e.target.checked;
  };
}
$('#focus').onclick = focusPoint;

// 沉浸模式与键盘导航
const immersiveButton = $('#immersive');
if (immersiveButton) {
  const setImmersive = value => {
    document.body.classList.toggle('immersive', value);
    immersiveButton.setAttribute('aria-pressed', String(value));
    immersiveButton.textContent = value ? '↙ 退出沉浸' : '⛶ 沉浸探索';
  };
  immersiveButton.onclick = () => setImmersive(!document.body.classList.contains('immersive'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setImmersive(false);
    if (document.activeElement === $('#search')) return;
    if (e.key === '/') {
      e.preventDefault();
      $('#search').focus();
    } else if (e.key === 'ArrowLeft') {
      $('#previous').click();
    } else if (e.key === 'ArrowRight') {
      $('#next').click();
    }
  });
}
