import {createHuman, nearestSurface} from './scene/human-model.js';
import {associations, createEffects} from './scene/effects.js';
import {channels, catalog} from './data/catalog.js';
import {initialPoints, extraPoints} from './data/points.js';
import * as T from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const colors = Object.fromEntries(channels.map(c => [c.name, c.color]));
colors['经外奇穴'] = '#e6a8b2';

// 子午流注与五行属性元数据
const channelMeta = {
  '手太阴肺经':   {short: '肺经', element: '金 · 阴经', shichen: '寅时 03:00–05:00', branchIdx: 2},
  '手阳明大肠经': {short: '大肠', element: '金 · 阳经', shichen: '卯时 05:00–07:00', branchIdx: 3},
  '足阳明胃经':   {short: '胃经', element: '土 · 阳经', shichen: '辰时 07:00–09:00', branchIdx: 4},
  '足太阴脾经':   {short: '脾经', element: '土 · 阴经', shichen: '巳时 09:00–11:00', branchIdx: 5},
  '手少阴心经':   {short: '心经', element: '火 · 阴经', shichen: '午时 11:00–13:00', branchIdx: 6},
  '手太阳小肠经': {short: '小肠', element: '火 · 阳经', shichen: '未时 13:00–15:00', branchIdx: 7},
  '足太阳膀胱经': {short: '膀胱', element: '水 · 阳经', shichen: '申时 15:00–17:00', branchIdx: 8},
  '足少阴肾经':   {short: '肾经', element: '水 · 阴经', shichen: '酉时 17:00–19:00', branchIdx: 9},
  '手厥阴心包经': {short: '心包', element: '相火 · 阴经', shichen: '戌时 19:00–21:00', branchIdx: 10},
  '手少阳三焦经': {short: '三焦', element: '相火 · 阳经', shichen: '亥时 21:00–23:00', branchIdx: 11},
  '足少阳胆经':   {short: '胆经', element: '木 · 阳经', shichen: '子时 23:00–01:00', branchIdx: 0},
  '足厥阴肝经':   {short: '肝经', element: '木 · 阴经', shichen: '丑时 01:00–03:00', branchIdx: 1},
  '督脉':         {short: '督脉', element: '阳脉之海', shichen: '奇经 · 贯脊属脑', branchIdx: -1},
  '任脉':         {short: '任脉', element: '阴脉之海', shichen: '奇经 · 总任诸阴', branchIdx: -1},
  '经外奇穴':     {short: '奇穴', element: '经外选录', shichen: '奇穴 · 经验效穴', branchIdx: -1}
};

// 经典特定穴属性标签
const specialPoints = {
  LU1: '肺募穴', LU5: '合穴', LU6: '郄穴', LU7: '络穴 · 八脉交会(通任)', LU9: '原穴 · 脉会', LU11: '井穴',
  LI1: '井穴', LI4: '原穴 · 四总穴(面口)', LI5: '经穴', LI6: '络穴', LI11: '合穴',
  ST25: '大肠募穴', ST34: '郄穴', ST36: '合穴 · 四总穴(肚腹)', ST40: '络穴', ST41: '经穴', ST44: '荥穴',
  SP3: '原穴 · 输穴', SP4: '络穴 · 八脉交会(通冲)', SP6: '足三阴交会', SP8: '郄穴', SP9: '合穴',
  HT3: '合穴', HT5: '络穴', HT7: '原穴 · 输穴', HT9: '井穴',
  SI1: '井穴', SI3: '输穴 · 八脉交会(通督)', SI4: '原穴', SI6: '郄穴', SI8: '合穴',
  BL11: '八会穴之骨会', BL13: '肺背俞穴', BL15: '心背俞穴', BL17: '八会穴之血会',
  BL18: '肝背俞穴', BL20: '脾背俞穴', BL21: '胃背俞穴', BL23: '肾背俞穴', BL25: '大肠背俞穴',
  BL28: '膀胱背俞穴', BL40: '合穴 · 四总穴(腰背)', BL60: '经穴', BL62: '八脉交会(通阳跷)', BL67: '井穴',
  KI1: '井穴', KI3: '原穴 · 输穴', KI6: '八脉交会(通阴跷)', KI7: '经穴', KI10: '合穴',
  PC3: '合穴', PC4: '郄穴', PC6: '络穴 · 八脉交会(通阴维)', PC7: '原穴 · 输穴', PC8: '荥穴', PC9: '井穴',
  TE4: '原穴', TE5: '络穴 · 八脉交会(通阳维)', TE6: '经穴', TE10: '合穴',
  GB20: '手足少阳阳维交会', GB24: '胆募穴', GB34: '合穴 · 八会穴之筋会', GB37: '络穴', GB39: '八会穴之髓会', GB40: '原穴', GB41: '输穴 · 八脉交会(通带)',
  LR2: '荥穴', LR3: '原穴 · 输穴', LR5: '络穴', LR8: '合穴', LR13: '脾募穴 · 脏会', LR14: '肝募穴',
  GV4: '命门要穴', GV14: '手足三阳督脉之会', GV20: '诸阳之会', GV26: '急救要穴',
  CV3: '膀胱募穴', CV4: '小肠募穴 · 元气要穴', CV6: '肓之原穴', CV12: '胃募穴 · 腑会', CV17: '心包募穴 · 气会',
  'EX-HN3': '经外奇穴', 'EX-HN5': '经外奇穴'
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
let selected = 12, region = '全部', query = '', channelFilter = '全部', scope = 'model'; // Default 合谷 (LI4) or 百会
// Keep default 百会/迎香 or 合谷? Let's check index 12 -> 合谷, index 3 -> 迎香. Let's default to 合谷 (id of LI4) so user immediately sees glowing curves + light needle!
selected = data.find(p => p.code === 'LI4')?.id ?? 3;

let scene, camera, renderer, controls, humanMesh, wireMesh, compassMesh, haloRingMesh, ambientParticles;
let markers = [], meridianSegments = [], activeQiParticles = [], body = [], auto = false;
let reticleGroup, innerReticle, outerReticle, needleGroup;
let flyAnim = null;

// Shader uniforms for custom sculptural human rendering
const skinUniforms = {
  uTime: {value: 0},
  uRimColor: {value: new T.Color(0x6ef2de)},
  uRimPower: {value: 2.35},
  uRimStrength: {value: 0.78},
  uPatinaColor: {value: new T.Color(0x45a394)},
  uPatinaStrength: {value: 0.0},
  uScanStrength: {value: 0.32},
  uContourStrength: {value: 0.08},
  uXrayFade: {value: 0.0}
};

// 计算当前时辰当令经脉
function getCurrentShichenMeridian() {
  const h = new Date().getHours();
  const order = [
    ['足少阳胆经', '子时'],
    ['足厥阴肝经', '丑时'],
    ['手太阴肺经', '寅时'],
    ['手阳明大肠经', '卯时'],
    ['足阳明胃经', '辰时'],
    ['足太阴脾经', '巳时'],
    ['手少阴心经', '午时'],
    ['手太阳小肠经', '未时'],
    ['足太阳膀胱经', '申时'],
    ['足少阴肾经', '酉时'],
    ['手厥阴心包经', '戌时'],
    ['手少阳三焦经', '亥时']
  ];
  const idx = Math.floor(((h + 1) % 24) / 2);
  return {meridian: order[idx][0], shichen: order[idx][1], branchIdx: idx};
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
  if ($('#channelBadgeMini')) {
    $('#channelBadgeMini').textContent = channelFilter === '全部' ? '全部' : (channelMeta[channelFilter]?.short || channelFilter);
  }
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
                ${associations[p.code] ? '<i class="fx-badge">流光</i>' : ''}
              </b>
              <small>${p.meridian} · ${p.modeled ? p.region + ' · 3D' : '仅目录'}</small>
            </span>
            <span>${p.code}</span>
          </button>`
        )
        .join('')
    : '<p class="muted" style="padding:14px 4px">没有匹配的穴位。试试重置筛选，或切换至「完整目录」。</p>';

  $('#list').querySelectorAll('button').forEach(b => (b.onclick = () => select(+b.dataset.id, true)));
  $('#stageCount').textContent = `${data.filter(p => p.modeled && visible(p)).length} 个 3D 穴位`;

  const c = channels.find(c => c.name === channelFilter);
  const meta = channelMeta[channelFilter];
  const metaEl = $('#channelMeta');
  if (c && meta) {
    metaEl.hidden = false;
    metaEl.innerHTML = `<span class="meta-tag gold">${meta.element}</span><span class="meta-tag">${meta.shichen}</span>`;
    $('#channelSummary').textContent = `循行：${c.route}（共 ${c.names.length} 穴，3D 建模 ${mapped.filter(p => p.meridian === c.name).length} 穴）`;
  } else {
    metaEl.hidden = true;
    $('#channelSummary').textContent = '收录十四经脉 361 穴与 2 奇穴，点击矩阵切换单经探穴。';
  }
  syncMeridianPills();
}

function rebuildActiveQiParticles() {
  if (!scene || !dotTex) return;
  for (const qp of activeQiParticles) {
    scene.remove(qp.sprite);
    qp.sprite.material.dispose();
  }
  activeQiParticles = [];
  const activeMeridian = data[selected]?.meridian;
  const activeSide = Number($('#sideChoice').value);
  const segs = meridianSegments.filter(
    s => s.meridian === activeMeridian && (!s.bilateral || s.side === activeSide || channelFilter === activeMeridian)
  );
  segs.forEach((seg, idx) => {
    for (let k = 0; k < 2; k++) {
      const sp = new T.Sprite(
        new T.SpriteMaterial({
          map: dotTex,
          color: k === 0 ? 0xfff5d6 : colors[seg.meridian],
          transparent: true,
          opacity: k === 0 ? 0.95 : 0.72,
          depthWrite: false,
          blending: T.AdditiveBlending
        })
      );
      sp.scale.set(k === 0 ? 0.088 : 0.065, k === 0 ? 0.088 : 0.065, 1);
      scene.add(sp);
      activeQiParticles.push({sprite: sp, seg, offset: (idx * 0.19 + k * 0.5) % 1});
    }
  });
}

function select(id, turn = false) {
  selected = id;
  const p = data[id];
  for (const key of ['code', 'name', 'pinyin', 'meridian', 'location']) {
    $('#' + key).textContent = p[key];
  }
  const mColor = colors[p.meridian] || '#6ef2de';
  $('#meridian').style.borderColor = mColor + '66';
  $('#meridian').style.color = mColor;

  const meta = channelMeta[p.meridian] || {element: '经穴', shichen: ''};
  if ($('#elementBadge')) $('#elementBadge').textContent = meta.element;
  if ($('#bilateralBadge')) $('#bilateralBadge').textContent = p.bilateral ? '左右双穴' : '正中单穴';

  const spTag = specialPoints[p.code];
  const spEl = $('#specialBadge');
  if (spEl) {
    spEl.hidden = !spTag;
    if (spTag) spEl.textContent = spTag;
  }

  $('#modelStatus').textContent = p.important ? '★ 重点选录穴位' : p.modeled ? '● 3D 空间点位' : '○ 仅目录索引';
  $('#modelStatus').classList.toggle('important', p.important);

  $('#focus').disabled = !p.modeled;
  $('#focus').innerHTML = p.modeled
    ? '<span>聚焦此穴位 · 光针特写</span><span class="focus-arrow">↗</span>'
    : '<span>此穴位暂未配置三维坐标</span>';

  $('#tip').textContent = p.modeled
    ? p.bilateral
      ? '成对分布于人体左右两侧。可切换顶部「观察侧」或拖动模型，观察经脉光路与体表标志。'
      : '位于躯干或头面正中线（任督二脉）。结合正面或背面视角，可清晰追踪经脉上下贯通关系。'
    : '当前收录标准国际编码与所属经脉顺序。点击带「3D」标记的穴位可在三维人体上查看。';

  const c = channels.find(c => c.name === p.meridian);
  $('#routeInfo').textContent = c ? `循行方向：${c.route}` : '不归属于十四经脉的经验选录奇穴。';
  if ($('#shichenDetail')) {
    $('#shichenDetail').innerHTML = `<span>子午流注：<b>${meta.shichen}</b></span><span>属性：<b>${meta.element}</b></span>`;
  }
  $('#channelTotal').textContent = c
    ? `本经 ${c.names.length} 穴 · 3D ${mapped.filter(x => x.meridian === c.name).length} 穴`
    : '经外奇穴 · 选录 2 穴';

  const sib = siblings();
  const i = sib.findIndex(x => x.id === id);
  $('#neighborIndex').textContent = `${i + 1} / ${sib.length}`;
  if ($('#meridianProgress i')) {
    const pct = sib.length > 0 ? Math.max(8, ((i + 1) / sib.length) * 100) : 100;
    $('#meridianProgress i').style.width = `${pct.toFixed(1)}%`;
  }
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

  rebuildActiveQiParticles();
  if (turn && camera && p.modeled) focusPoint();
  updateEffects(turn && !p.modeled);
}

// 初始化解剖区域矩阵
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

// 初始化 4x4 经脉矩阵
$('#meridianPills').innerHTML =
  `<button data-channel="全部" class="active" title="全部十四经脉与奇穴">全部</button>` +
  channels
    .map(c => `<button data-channel="${c.name}" title="${c.name} · ${c.route}"><i style="background:${c.color}"></i>${channelMeta[c.name]?.short || c.code}</button>`)
    .join('') +
  `<button data-channel="经外奇穴" title="经外奇穴"><i style="background:${colors['经外奇穴']}"></i>奇穴</button>`;

$('#meridianPills').querySelectorAll('button').forEach(b => {
  b.onclick = () => setChannelFilter(b.dataset.channel);
});

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
$('#footerCount').textContent = `收录 361 正经穴 + 2 奇穴 · ${mapped.length} 个 3D 空间点位`;

$('#sideChoice').onchange = () => {
  rebuildActiveQiParticles();
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
  flyTo(new T.Vector3(0, 3.86, 0), new T.Vector3(side * 1.4, 4.35, rear ? -12.9 : 12.9));
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
  const dist = data[selected].view === 'sole' ? 2.5 : 2.95;
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
  const d = 12.6;
  let target = new T.Vector3(0, 3.86, 0);
  let cam = new T.Vector3(0, 4.28, d);
  if (v === 'side') cam.set(side * d, 4.28, 0);
  else if (v === 'back') cam.set(0, 4.28, -d);
  else if (v === 'head') {
    target.set(0, 7.34, 0);
    cam.set(0, 7.38, 3.0);
  } else if (v === 'hand') {
    target.set(side * 1.68, 4.32, 0.05);
    cam.set(side * 1.72, 4.38, 2.85);
  } else if (v === 'foot') {
    target.set(side * 0.42, 0.55, 0.2);
    cam.set(side * 0.62, 1.32, 3.15);
  }
  flyTo(target, cam, 620);
  $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
}

// 光滑球形工作室反射穹顶贴图 (彻底消除几何体硬反射块)
function createStudioEnvironment(renderer) {
  const pmrem = new T.PMREMGenerator(renderer);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, '#dff7f4');
    bg.addColorStop(0.28, '#1b4754');
    bg.addColorStop(0.55, '#091924');
    bg.addColorStop(1, '#04090f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 256);

    const drawSpot = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    drawSpot(145, 76, 95, 'rgba(255, 224, 165, 0.65)');
    drawSpot(380, 92, 110, 'rgba(110, 242, 222, 0.6)');
    drawSpot(260, 120, 90, 'rgba(110, 175, 255, 0.35)');
  }
  const equirect = new T.CanvasTexture(c);
  equirect.mapping = T.EquirectangularReflectionMapping;
  equirect.colorSpace = T.SRGBColorSpace;
  const tex = pmrem.fromEquirectangular(equirect).texture;
  equirect.dispose();
  pmrem.dispose();
  return tex;
}

// 绘制东方太极子午流注罗盘底座纹理（含当前时辰金光高亮扇区）
function createCompassPedestalTexture(activeBranchIdx) {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const cx = 512, cy = 512;

  const bg = ctx.createRadialGradient(cx, cy, 12, cx, cy, 504);
  bg.addColorStop(0, 'rgba(110, 242, 222, 0.22)');
  bg.addColorStop(0.38, 'rgba(28, 78, 88, 0.14)');
  bg.addColorStop(0.84, 'rgba(10, 26, 36, 0.04)');
  bg.addColorStop(1, 'rgba(4, 10, 16, 0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 1024);

  // 高亮当前当令时辰扇区
  if (activeBranchIdx >= 0) {
    const startAng = (activeBranchIdx * Math.PI * 2) / 12 - Math.PI / 2 - Math.PI / 12;
    const endAng = startAng + Math.PI / 6;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 466, startAng, endAng);
    ctx.closePath();
    const sg = ctx.createRadialGradient(cx, cy, 140, cx, cy, 466);
    sg.addColorStop(0, 'rgba(245, 204, 126, 0.04)');
    sg.addColorStop(0.65, 'rgba(245, 204, 126, 0.18)');
    sg.addColorStop(1, 'rgba(245, 204, 126, 0.06)');
    ctx.fillStyle = sg;
    ctx.fill();
    ctx.restore();
  }

  const rings = [
    [474, 'rgba(110, 242, 222, 0.36)', 2],
    [454, 'rgba(245, 204, 126, 0.28)', 1.2],
    [372, 'rgba(110, 242, 222, 0.26)', 1.5],
    [296, 'rgba(110, 242, 222, 0.18)', 1],
    [210, 'rgba(245, 204, 126, 0.26)', 1.5],
    [136, 'rgba(110, 242, 222, 0.3)', 1.2]
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
    const r1 = major ? 450 : 460;
    const r2 = 474;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
    ctx.strokeStyle = major ? 'rgba(245, 204, 126, 0.65)' : 'rgba(110, 242, 222, 0.22)';
    ctx.lineWidth = major ? 2 : 1;
    ctx.stroke();
  }

  // 十二地支与十二正经刻度文字
  const branches = [
    '子 · 胆', '丑 · 肝', '寅 · 肺', '卯 · 大肠',
    '辰 · 胃', '巳 · 脾', '午 · 心', '未 · 小肠',
    '申 · 膀胱', '酉 · 肾', '戌 · 心包', '亥 · 三焦'
  ];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  branches.forEach((label, idx) => {
    const ang = (idx * Math.PI * 2) / 12 - Math.PI / 2;
    const isNow = idx === activeBranchIdx;
    ctx.save();
    ctx.translate(cx + Math.cos(ang) * 412, cy + Math.sin(ang) * 412);
    ctx.rotate(ang + Math.PI / 2);
    ctx.font = `${isNow ? '700 24px' : '600 21px'} "Songti SC", "Noto Serif SC", serif`;
    ctx.fillStyle = isNow ? 'rgba(255, 228, 168, 0.96)' : 'rgba(205, 240, 236, 0.56)';
    ctx.fillText(label, 0, 0);
    ctx.restore();

    const lineAng = ang + Math.PI / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(lineAng) * 210, cy + Math.sin(lineAng) * 210);
    ctx.lineTo(cx + Math.cos(lineAng) * 454, cy + Math.sin(lineAng) * 454);
    ctx.strokeStyle = 'rgba(110, 242, 222, 0.13)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 中心太极阴阳弧纹装饰
  ctx.strokeStyle = 'rgba(245, 204, 126, 0.22)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy - 34, 34, -Math.PI / 2, Math.PI / 2);
  ctx.arc(cx, cy + 34, 34, -Math.PI / 2, Math.PI / 2, true);
  ctx.stroke();

  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// 注入自定义 GLSL 菲涅尔边缘光、呼吸流韵、等高线与铜人包浆着色
function attachSculpturalShader(mat) {
  mat.onBeforeCompile = shader => {
    shader.uniforms.uTime = skinUniforms.uTime;
    shader.uniforms.uRimColor = skinUniforms.uRimColor;
    shader.uniforms.uRimPower = skinUniforms.uRimPower;
    shader.uniforms.uRimStrength = skinUniforms.uRimStrength;
    shader.uniforms.uPatinaColor = skinUniforms.uPatinaColor;
    shader.uniforms.uPatinaStrength = skinUniforms.uPatinaStrength;
    shader.uniforms.uScanStrength = skinUniforms.uScanStrength;
    shader.uniforms.uContourStrength = skinUniforms.uContourStrength;
    shader.uniforms.uXrayFade = skinUniforms.uXrayFade;

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vObjPos;\nvarying vec3 vObjNormal;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nvObjPos = position;\nvObjNormal = objectNormal;`);

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform vec3 uRimColor;
         uniform float uRimPower;
         uniform float uRimStrength;
         uniform vec3 uPatinaColor;
         uniform float uPatinaStrength;
         uniform float uScanStrength;
         uniform float uContourStrength;
         uniform float uXrayFade;
         varying vec3 vObjPos;
         varying vec3 vObjNormal;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         vec3 vDir = normalize(vViewPosition);
         vec3 nDir = normalize(normal);
         float fresnel = pow(1.0 - clamp(abs(dot(nDir, vDir)), 0.0, 1.0), uRimPower);
         float breath = 0.5 + 0.5 * sin(vObjPos.y * 1.75 - uTime * 1.25);
         float contour = smoothstep(0.955, 0.995, abs(sin(vObjPos.y * 42.0))) * (0.25 + 0.75 * fresnel);
         float patina = clamp(smoothstep(-0.15, 0.85, vObjNormal.y) * 0.45 + fresnel * 0.55, 0.0, 1.0) * uPatinaStrength;
         diffuseColor.rgb = mix(diffuseColor.rgb, uPatinaColor, patina);
         totalEmissiveRadiance += uRimColor * fresnel * uRimStrength * (1.0 + uScanStrength * breath);
         totalEmissiveRadiance += uRimColor * contour * uContourStrength;
         diffuseColor.a = mix(diffuseColor.a, clamp(0.18 + fresnel * 0.82, 0.18, 0.96), uXrayFade);`
      );
  };
  mat.customProgramCacheKey = () => 'guanxue-sculptural-v2';
}

// 切换四种东方博物级材质
function setBodyMaterial(mode) {
  if (!humanMesh) return;
  const [skin, eye] = humanMesh.material;
  if (mode === 'jade') {
    skin.color.setHex(0x143840);
    skin.emissive.setHex(0x05181e);
    skin.emissiveIntensity = 0.55;
    skin.roughness = 0.44;
    skin.metalness = 0.08;
    skin.clearcoat = 0.24;
    skin.clearcoatRoughness = 0.42;
    skin.sheen = 0.75;
    skin.sheenColor = new T.Color(0x6ef2de);
    skin.sheenRoughness = 0.45;
    skin.transparent = true;
    skin.opacity = 0.95;
    skinUniforms.uRimColor.value.setHex(0x6ef2de);
    skinUniforms.uRimPower.value = 2.35;
    skinUniforms.uRimStrength.value = 0.85;
    skinUniforms.uPatinaStrength.value = 0.0;
    skinUniforms.uScanStrength.value = 0.34;
    skinUniforms.uContourStrength.value = 0.09;
    skinUniforms.uXrayFade.value = 0.0;
    eye.color.setHex(0x88e8dc);
    if (wireMesh) {
      wireMesh.material.color.setHex(0x6ef2de);
      wireMesh.material.opacity = 0.032;
    }
  } else if (mode === 'bronze') {
    skin.color.setHex(0x8a643b);
    skin.emissive.setHex(0x160d05);
    skin.emissiveIntensity = 0.35;
    skin.roughness = 0.34;
    skin.metalness = 0.82;
    skin.clearcoat = 0.18;
    skin.clearcoatRoughness = 0.38;
    skin.sheen = 0.3;
    skin.sheenColor = new T.Color(0xf5cc7e);
    skin.sheenRoughness = 0.45;
    skin.transparent = false;
    skin.opacity = 1.0;
    skinUniforms.uRimColor.value.setHex(0xf5cc7e);
    skinUniforms.uRimPower.value = 2.8;
    skinUniforms.uRimStrength.value = 0.52;
    skinUniforms.uPatinaColor.value.setHex(0x479e8e);
    skinUniforms.uPatinaStrength.value = 0.28;
    skinUniforms.uScanStrength.value = 0.08;
    skinUniforms.uContourStrength.value = 0.02;
    skinUniforms.uXrayFade.value = 0.0;
    eye.color.setHex(0xd6b078);
    if (wireMesh) {
      wireMesh.material.color.setHex(0xf5cc7e);
      wireMesh.material.opacity = 0.024;
    }
  } else if (mode === 'xray') {
    skin.color.setHex(0x061018);
    skin.emissive.setHex(0x020912);
    skin.emissiveIntensity = 0.35;
    skin.roughness = 0.55;
    skin.metalness = 0.1;
    skin.clearcoat = 0.1;
    skin.clearcoatRoughness = 0.5;
    skin.sheen = 0.4;
    skin.sheenColor = new T.Color(0x52c8ff);
    skin.sheenRoughness = 0.4;
    skin.transparent = true;
    skin.opacity = 1.0;
    skinUniforms.uRimColor.value.setHex(0x64d6ff);
    skinUniforms.uRimPower.value = 1.85;
    skinUniforms.uRimStrength.value = 1.25;
    skinUniforms.uPatinaStrength.value = 0.0;
    skinUniforms.uScanStrength.value = 0.45;
    skinUniforms.uContourStrength.value = 0.22;
    skinUniforms.uXrayFade.value = 0.92;
    eye.color.setHex(0x7be0ff);
    if (wireMesh) {
      wireMesh.material.color.setHex(0x64d6ff);
      wireMesh.material.opacity = 0.065;
    }
  } else {
    skin.color.setHex(0xd8c8b6);
    skin.emissive.setHex(0x1f140d);
    skin.emissiveIntensity = 0.18;
    skin.roughness = 0.56;
    skin.metalness = 0.02;
    skin.clearcoat = 0.08;
    skin.clearcoatRoughness = 0.6;
    skin.sheen = 0.45;
    skin.sheenColor = new T.Color(0xffe6d4);
    skin.sheenRoughness = 0.65;
    skin.transparent = false;
    skin.opacity = 1.0;
    skinUniforms.uRimColor.value.setHex(0x88b4c4);
    skinUniforms.uRimPower.value = 3.0;
    skinUniforms.uRimStrength.value = 0.32;
    skinUniforms.uPatinaStrength.value = 0.0;
    skinUniforms.uScanStrength.value = 0.05;
    skinUniforms.uContourStrength.value = 0.015;
    skinUniforms.uXrayFade.value = 0.0;
    eye.color.setHex(0xf2e9de);
    if (wireMesh) {
      wireMesh.material.color.setHex(0xffffff);
      wireMesh.material.opacity = 0.014;
    }
  }
  skin.needsUpdate = true;
  eye.needsUpdate = true;
  $$('#materialSwitch button').forEach(b => b.classList.toggle('active', b.dataset.mat === mode));
}

let dotTex = null;

try {
  scene = new T.Scene();
  camera = new T.PerspectiveCamera(38, 1, 0.1, 100);
  renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  $('#canvas').appendChild(renderer.domElement);

  scene.environment = createStudioEnvironment(renderer);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = true;
  controls.minDistance = 1.8;
  controls.maxDistance = 19.5;
  controls.maxPolarAngle = Math.PI - 0.03;
  controls.minPolarAngle = 0.1;
  controls.addEventListener('start', () => {
    flyAnim = null;
  });

  // 初始全景构图：兼顾头部余白与脚下太极流注罗盘
  camera.position.set(0, 4.28, 12.6);
  controls.target.set(0, 3.86, 0);
  controls.update();

  // 博物馆戏剧光影布光
  scene.add(new T.HemisphereLight(0xe6fbf7, 0x15202b, 1.35));
  const lights = [
    [-4.5, 8.8, 5.5, 0xffeccf, 2.1],
    [5.0, 6.2, -4.5, 0x6ef2de, 2.0],
    [-4.2, 4.0, -5.2, 0x5ea6ff, 1.4],
    [0, 3.6, 6.8, 0xffffff, 0.5]
  ];
  for (const [x, y, z, c, intensity] of lights) {
    const l = new T.DirectionalLight(c, intensity);
    l.position.set(x, y, z);
    scene.add(l);
  }

  humanMesh = createHuman();
  attachSculpturalShader(humanMesh.material[0]);
  scene.add(humanMesh);
  body.push(humanMesh);

  // 精细解剖经纬网格叠加层
  wireMesh = new T.Mesh(
    humanMesh.geometry,
    new T.MeshBasicMaterial({
      color: 0x6ef2de,
      wireframe: true,
      transparent: true,
      opacity: 0.032,
      depthWrite: false
    })
  );
  scene.add(wireMesh);

  setBodyMaterial('jade');

  // 脚下接地投影柔光盘
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d');
  if (sctx) {
    const g = sctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    g.addColorStop(0.55, 'rgba(0, 0, 0, 0.32)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 128, 128);
    const groundShadow = new T.Mesh(
      new T.PlaneGeometry(2.1, 2.1),
      new T.MeshBasicMaterial({map: new T.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false})
    );
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = 0.145;
    scene.add(groundShadow);
  }

  // 太极子午流注罗盘坛
  const compassTex = createCompassPedestalTexture(activeShichen.branchIdx);
  if (compassTex) {
    compassMesh = new T.Mesh(
      new T.PlaneGeometry(4.8, 4.8),
      new T.MeshBasicMaterial({
        map: compassTex,
        transparent: true,
        depthWrite: false,
        blending: T.AdditiveBlending
      })
    );
    compassMesh.rotation.x = -Math.PI / 2;
    compassMesh.position.y = 0.12;
    scene.add(compassMesh);
  }

  const ring = new T.Mesh(
    new T.TorusGeometry(1.48, 0.008, 10, 128),
    new T.MeshBasicMaterial({color: 0x6ef2de, transparent: true, opacity: 0.48})
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.13;
  scene.add(ring);

  haloRingMesh = new T.Mesh(
    new T.TorusGeometry(1.98, 0.005, 8, 128),
    new T.MeshBasicMaterial({color: 0xf5cc7e, transparent: true, opacity: 0.28})
  );
  haloRingMesh.rotation.x = Math.PI / 2;
  haloRingMesh.position.y = 0.11;
  scene.add(haloRingMesh);

  // 径向发光粒子贴图
  const dotCanvas = document.createElement('canvas');
  dotCanvas.width = dotCanvas.height = 64;
  const dctx = dotCanvas.getContext('2d');
  if (dctx) {
    const g = dctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.78)');
    g.addColorStop(0.66, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    dctx.fillStyle = g;
    dctx.fillRect(0, 0, 64, 64);
  }
  dotTex = new T.CanvasTexture(dotCanvas);

  // 空间微尘气感粒子
  const pCount = 72;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    const r = 1.2 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    pPositions[i * 3] = Math.cos(theta) * r;
    pPositions[i * 3 + 1] = 0.35 + Math.random() * 7.9;
    pPositions[i * 3 + 2] = Math.sin(theta) * r;
  }
  const pGeo = new T.BufferGeometry();
  pGeo.setAttribute('position', new T.BufferAttribute(pPositions, 3));
  ambientParticles = new T.Points(
    pGeo,
    new T.PointsMaterial({
      map: dotTex,
      color: 0x6ef2de,
      size: 0.075,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: T.AdditiveBlending
    })
  );
  scene.add(ambientParticles);

  // 选中穴位的贴合体表双环靶标 + 金色光针
  reticleGroup = new T.Group();
  innerReticle = new T.Mesh(
    new T.RingGeometry(0.068, 0.088, 48),
    new T.MeshBasicMaterial({
      color: 0xf5cc7e,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.94,
      depthTest: false,
      blending: T.AdditiveBlending
    })
  );
  outerReticle = new T.Mesh(
    new T.RingGeometry(0.118, 0.134, 48),
    new T.MeshBasicMaterial({
      color: 0x6ef2de,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.68,
      depthTest: false,
      blending: T.AdditiveBlending
    })
  );

  // 东方针灸光针指示器 (沿体表法线 Z 方向立起)
  needleGroup = new T.Group();
  const shaft = new T.Mesh(
    new T.CylinderGeometry(0.0022, 0.009, 0.38, 10),
    new T.MeshBasicMaterial({
      color: 0xffe6a3,
      transparent: true,
      opacity: 0.9,
      blending: T.AdditiveBlending
    })
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.19;
  const handle = new T.Mesh(
    new T.SphereGeometry(0.017, 12, 10),
    new T.MeshBasicMaterial({color: 0xfff5d6})
  );
  handle.position.z = 0.39;
  const tipGlow = new T.Sprite(
    new T.SpriteMaterial({
      map: dotTex,
      color: 0xf5cc7e,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: T.AdditiveBlending
    })
  );
  tipGlow.scale.set(0.16, 0.16, 1);
  tipGlow.position.z = 0.39;
  needleGroup.add(shaft, handle, tipGlow);

  reticleGroup.add(innerReticle, outerReticle, needleGroup);
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
        pos.copy(hit.point).addScaledVector(normal, 0.03);
      } else {
        const closest = nearestSurface(humanMesh, pos);
        normal.copy(closest.normal);
        pos.copy(closest.point).addScaledVector(normal, 0.03);
      }

      const baseColor = p.important ? '#f5cc7e' : colors[p.meridian];
      const radius = p.important ? 0.042 : 0.025;
      const m = new T.Mesh(
        new T.SphereGeometry(radius, 16, 12),
        new T.MeshBasicMaterial({color: baseColor})
      );
      m.position.copy(pos);
      m.userData.id = p.id;
      scene.add(m);

      const glow = new T.Sprite(
        new T.SpriteMaterial({
          map: dotTex,
          color: baseColor,
          transparent: true,
          opacity: p.important ? 0.78 : 0.5,
          depthWrite: false,
          blending: T.AdditiveBlending
        })
      );
      const gs = p.important ? 0.23 : 0.13;
      glow.scale.set(gs, gs, 1);
      m.add(glow);

      const label = document.createElement('button');
      label.className = 'pin-label' + (p.important ? ' key-label' : '');
      label.style.setProperty('--pin-color', baseColor);
      label.innerHTML = `<span>${p.name}</span>${p.important ? `<small>${p.code}</small>` : ''}`;
      label.onclick = () => select(p.id, true);
      $('#labels').appendChild(label);

      markers.push({mesh: m, glow, label, p, side, normal});
    }
  }

  // 构建贴合人体曲面的立体发光经脉管路 (TubeGeometry)
  for (const meridian of Object.keys(colors)) {
    for (const side of [-1, 1]) {
      const group = markers
        .filter(m => m.p.meridian === meridian && m.side === side)
        .sort((a, b) => a.p.order - b.p.order);

      for (let i = 1; i < group.length; i++) {
        const a = group[i - 1], b = group[i];
        const sameRegion = a.p.region === b.p.region;
        const dist = a.mesh.position.distanceTo(b.mesh.position);
        const dot = a.normal.dot(b.normal);
        if ((sameRegion ? dist > 1.22 : dist > 0.65) || dot < (sameRegion ? 0.25 : 0.15)) continue;

        const ctrlPts = [a.mesh.position.clone()];
        const steps = 4;
        for (let s = 1; s < steps; s++) {
          const lerped = a.mesh.position.clone().lerp(b.mesh.position, s / steps);
          const surf = nearestSurface(humanMesh, lerped);
          ctrlPts.push(surf.point.addScaledVector(surf.normal, 0.031));
        }
        ctrlPts.push(b.mesh.position.clone());

        const curve = new T.CatmullRomCurve3(ctrlPts);
        const baseMeridianCol = new T.Color(colors[meridian]);
        const hiMeridianCol = baseMeridianCol.clone().lerp(new T.Color(0xffffff), 0.36);
        const tube = new T.Mesh(
          new T.TubeGeometry(curve, 18, 0.0095, 6, false),
          new T.MeshBasicMaterial({
            color: baseMeridianCol,
            transparent: true,
            opacity: 0.45
          })
        );
        scene.add(tube);
        meridianSegments.push({
          mesh: tube,
          baseColor: baseMeridianCol,
          hiColor: hiMeridianCol,
          points: [a, b],
          meridian,
          side,
          bilateral: a.p.bilateral || b.p.bilateral,
          curve
        });
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
  const bodyCenterProj = new T.Vector3(), bodyEdgeProj = new T.Vector3();
  let lastLabels = 0;

  // 辅助：用投影点计算人体中心与半宽，供非遮挡引线布局使用
  function getBodyScreenLayout(w) {
    bodyCenterProj.set(0, 4.2, 0).project(camera);
    const centerX = (bodyCenterProj.x * 0.5 + 0.5) * w;
    // 取相机右侧水平向量计算投影半径
    const camRight = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    bodyEdgeProj.set(0, 4.2, 0).addScaledVector(camRight, 0.95).project(camera);
    const edgeX = (bodyEdgeProj.x * 0.5 + 0.5) * w;
    return {centerX, halfWidth: Math.max(40, Math.abs(edgeX - centerX))};
  }

  // 防重叠布局同侧标签
  function resolveVerticalStack(items, minGap, minY, maxY) {
    items.sort((a, b) => a.ay - b.ay);
    for (let i = 0; i < items.length; i++) {
      let y = Math.max(minY, Math.min(maxY, items[i].ay));
      if (i > 0 && y - items[i - 1].ly < minGap) {
        y = items[i - 1].ly + minGap;
      }
      items[i].ly = y;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].ly > maxY) {
        items[i].ly = maxY;
      }
      if (i < items.length - 1 && items[i + 1].ly - items[i].ly < minGap) {
        items[i].ly = items[i + 1].ly - minGap;
      }
    }
  }

  function animate(time = 0) {
    requestAnimationFrame(animate);

    if (flyAnim) {
      const t = Math.min(1, (time - flyAnim.startTime) / flyAnim.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      controls.target.lerpVectors(flyAnim.startTarget, flyAnim.endTarget, ease);
      camera.position.lerpVectors(flyAnim.startCam, flyAnim.endCam, ease);
      if (t >= 1) flyAnim = null;
    }

    skinUniforms.uTime.value = time * 0.001;
    controls.autoRotate = auto;
    controls.autoRotateSpeed = 0.65;
    controls.update();

    if (compassMesh) compassMesh.rotation.z = time * 0.000055;
    if (haloRingMesh) haloRingMesh.rotation.z = -time * 0.00012;
    if (ambientParticles) ambientParticles.rotation.y = -time * 0.00007;

    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
    const activeSide = Number($('#sideChoice').value);
    const selectedPoint = data[selected];
    let selectedMarker = null;

    for (const m of markers) {
      m.mesh.visible = visible(m.p);
      const isSel = m.p.id === selected && (m.side === activeSide || !m.p.bilateral);
      const isHov = m.p.id === hoveredId;
      if (isSel) selectedMarker = m;

      const pulse = isSel ? 1.55 + 0.14 * Math.sin(time * 0.006) : isHov ? 1.35 : 1;
      m.mesh.scale.setScalar(pulse);
      m.mesh.material.color.set(
        isSel ? '#fff6d6' : isHov ? '#ffffff' : m.p.important ? '#f5cc7e' : colors[m.p.meridian]
      );
    }

    // 更新选中穴位的体表双环靶标与金色光针
    if (selectedMarker && selectedMarker.mesh.visible) {
      reticleGroup.visible = true;
      reticleGroup.position.copy(selectedMarker.mesh.position);
      reticleGroup.quaternion.setFromUnitVectors(zAxis, selectedMarker.normal);
      innerReticle.scale.setScalar(1 + 0.12 * Math.sin(time * 0.005));
      const wave = (time * 0.00085) % 1;
      outerReticle.scale.setScalar(0.9 + wave * 0.6);
      outerReticle.material.opacity = 0.72 * (1 - wave);
      needleGroup.position.z = 0.02 + 0.025 * Math.sin(time * 0.004);
    } else {
      reticleGroup.visible = false;
    }

    // 更新经脉立体光路与流动经气粒子（保持世界坐标不缩放，通过亮度与不透明度凸显当选经脉）
    const showLines = $('#showLines').checked;
    for (const seg of meridianSegments) {
      const isVis = showLines && seg.points.every(m => visible(m.p));
      seg.mesh.visible = isVis;
      if (isVis) {
        const isCurrent = seg.meridian === selectedPoint?.meridian;
        seg.mesh.material.color.copy(isCurrent ? seg.hiColor : seg.baseColor);
        seg.mesh.material.opacity = isCurrent ? 0.96 : 0.38;
      }
    }

    for (const qp of activeQiParticles) {
      qp.sprite.visible = qp.seg.mesh.visible;
      if (qp.sprite.visible) {
        const t = (time * 0.00052 + qp.offset) % 1;
        qp.sprite.position.copy(qp.seg.curve.getPoint(t));
      }
    }

    const layout = getBodyScreenLayout(w);
    const effectLeaders = effectLayer ? effectLayer.update(time, camera, w, h, layout) : [];

    // 更新洁净侧翼引线标签与 SVG 矢量牵引线
    if (time - lastLabels > 70) {
      lastLabels = time;
      const showLabels = $('#showLabels').checked;
      const candidates = [];
      const ordered = [...markers].sort((a, b) => {
        const selDiff = (b.p.id === selected) - (a.p.id === selected);
        if (selDiff) return selDiff;
        const merDiff = (b.p.meridian === selectedPoint.meridian) - (a.p.meridian === selectedPoint.meridian);
        if (merDiff) return merDiff;
        return Number(b.p.important) - Number(a.p.important);
      });

      for (const m of ordered) {
        m.label.hidden = true;
        if (!m.mesh.visible || !showLabels) continue;
        if (m.p.bilateral && m.side !== activeSide) continue;

        screen.copy(m.mesh.position).project(camera);
        const ax = (screen.x * 0.5 + 0.5) * w;
        const ay = (-screen.y * 0.5 + 0.5) * h;
        if (screen.z > 1 || screen.z < -1 || ax < 14 || ax > w - 14 || ay < 72 || ay > h - 68) continue;

        world.copy(camera.position).sub(m.mesh.position);
        if (world.dot(m.normal) < 0) continue;

        if (m.p.id !== selected && candidates.length >= 11) continue;
        if (m.p.id !== selected && candidates.some(c => Math.hypot(c.ax - ax, c.ay - ay) < 42)) continue;

        ray.set(camera.position, world.clone().negate().normalize());
        const hit = ray.intersectObjects(body)[0];
        if (hit && hit.distance < world.length() - 0.04) continue;

        candidates.push({m, ax, ay});
      }

      const leftItems = [], rightItems = [];
      const zoomedOut = layout.halfWidth < w * 0.24;
      // 如果主治关联标签放在了左侧，尽量把常规标签偏向右侧（或按人体自然左右分配）
      candidates.forEach((c, idx) => {
        let sideDir = c.ax < layout.centerX - 6 ? 'left' : c.ax > layout.centerX + 6 ? 'right' : (idx % 2 === 0 ? 'right' : 'left');
        if (zoomedOut && effectLeaders.length > 0) {
          const effectOnLeft = effectLeaders[0].align === 'left';
          if (effectOnLeft && Math.abs(c.ax - layout.centerX) < 30) sideDir = 'right';
          if (!effectOnLeft && Math.abs(c.ax - layout.centerX) < 30) sideDir = 'left';
        }
        if (sideDir === 'left') leftItems.push(c);
        else rightItems.push(c);
      });

      resolveVerticalStack(leftItems, 28, 92, h - 78);
      resolveVerticalStack(rightItems, 28, 92, h - 78);

      const svgParts = [];
      for (const item of [...leftItems, ...rightItems]) {
        const align = leftItems.includes(item) ? 'left' : 'right';
        let lx;
        if (zoomedOut) {
          lx = align === 'right'
            ? Math.min(w - 115, Math.max(item.ax + 26, layout.centerX + layout.halfWidth + 28))
            : Math.max(115, Math.min(item.ax - 26, layout.centerX - layout.halfWidth - 28));
        } else {
          lx = align === 'right' ? Math.min(w - 115, item.ax + 34) : Math.max(115, item.ax - 34);
        }

        const isSel = item.m.p.id === selected;
        item.m.label.hidden = false;
        item.m.label.dataset.align = align;
        item.m.label.classList.toggle('selected', isSel);
        item.m.label.style.left = lx + 'px';
        item.m.label.style.top = item.ly + 'px';

        const elbowX = align === 'right'
          ? item.ax + Math.min(18, Math.max(8, (lx - item.ax) * 0.4))
          : item.ax - Math.min(18, Math.max(8, (item.ax - lx) * 0.4));
        const cls = isSel ? 'selected' : item.m.p.important ? 'key' : '';
        svgParts.push(
          `<path class="leader-path ${cls}" d="M${item.ax.toFixed(1)},${item.ay.toFixed(1)} L${elbowX.toFixed(1)},${item.ly.toFixed(1)} L${lx.toFixed(1)},${item.ly.toFixed(1)}"/>` +
          `<circle class="leader-dot ${cls}" cx="${item.ax.toFixed(1)}" cy="${item.ay.toFixed(1)}" r="${isSel ? 2.8 : 1.9}"/>`
        );
      }

      for (const ef of effectLeaders) {
        const elbowX = ef.align === 'right'
          ? ef.ax + Math.min(20, Math.max(8, (ef.lx - ef.ax) * 0.35))
          : ef.ax - Math.min(20, Math.max(8, (ef.ax - ef.lx) * 0.35));
        svgParts.push(
          `<path class="leader-path effect" d="M${ef.ax.toFixed(1)},${ef.ay.toFixed(1)} L${elbowX.toFixed(1)},${ef.ly.toFixed(1)} L${ef.lx.toFixed(1)},${ef.ly.toFixed(1)}"/>` +
          `<circle class="leader-dot effect" cx="${ef.ax.toFixed(1)}" cy="${ef.ay.toFixed(1)}" r="2.8"/>`
        );
      }

      const svgEl = $('#leaderLines');
      if (svgEl) svgEl.innerHTML = svgParts.join('');
    }

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
