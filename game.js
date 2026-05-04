const SAVE_KEY = "cute-lord-rescue-save-v2";

const $ = (selector) => document.querySelector(selector);

const isMobile = window.innerWidth <= 960;

// ── Web Audio SFX (사용자 인터랙션 후 초기화) ──
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return _audioCtx;
}

// 짧은 노이즈 버스트 (펀치 임팩트의 "퍽")
function _noiseBurst(ctx, now, duration = 0.06, gainPeak = 0.18, lowpass = 1200) {
  try {
    const bufferSize = Math.max(64, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = lowpass;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gainPeak, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  } catch {}
}

function playSfx(type, opts = {}) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  // pitchSemis: -12 ~ +12 반음 (리듬게임처럼 콤보 따라 올라가게)
  const pitchMult = opts.pitchSemis ? Math.pow(2, opts.pitchSemis / 12) : 1;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "perfect") {
      // 밝은 차임 — 핑+옥타브 하모니로 성취감
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.07);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
      // 완전5도 하모니 (벨처럼)
      const harm = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harm.type = "triangle";
      harm.frequency.setValueAtTime(1320, now);
      harm.frequency.exponentialRampToValueAtTime(2640, now + 0.09);
      harmGain.gain.setValueAtTime(0.12, now);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      harm.connect(harmGain);
      harmGain.connect(ctx.destination);
      harm.start(now);
      harm.stop(now + 0.4);
      // 살짝 메탈릭 노이즈
      _noiseBurst(ctx, now, 0.04, 0.08, 6000);
    } else if (type === "rescue") {
      // 메탈 막기 — 짧은 클랭+노이즈+톤 다운
      osc.type = "triangle";
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
      // 메탈릭 클랭 (square 살짝)
      const clang = ctx.createOscillator();
      const clangGain = ctx.createGain();
      clang.type = "square";
      clang.frequency.setValueAtTime(1200, now);
      clang.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      clangGain.gain.setValueAtTime(0.06, now);
      clangGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      clang.connect(clangGain);
      clangGain.connect(ctx.destination);
      clang.start(now);
      clang.stop(now + 0.1);
      _noiseBurst(ctx, now, 0.05, 0.14, 3200);
    } else if (type === "hit") {
      // 펀치 임팩트 — 킥드럼 같은 둔탁함 + 노이즈 퍽
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
      // 서브 베이스 보강
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sawtooth";
      sub.frequency.setValueAtTime(90, now);
      sub.frequency.exponentialRampToValueAtTime(40, now + 0.16);
      subGain.gain.setValueAtTime(0.18, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.2);
      // 펀치 노이즈 (낮은 lowpass = 묵직)
      _noiseBurst(ctx, now, 0.08, 0.22, 800);
    } else if (type === "danger") {
      // 날카로운 경고음 — 위험
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "ultimate") {
      // 웅장한 스윕 + 베이스 충격 + 빛나는 톱
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      // 옥타브 위 톱 (빛나는 광채)
      const bright = ctx.createOscillator();
      const brightGain = ctx.createGain();
      bright.type = "triangle";
      bright.frequency.setValueAtTime(440, now + 0.05);
      bright.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
      brightGain.gain.setValueAtTime(0.0, now);
      brightGain.gain.linearRampToValueAtTime(0.16, now + 0.1);
      brightGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      bright.connect(brightGain);
      brightGain.connect(ctx.destination);
      bright.start(now);
      bright.stop(now + 0.55);
      // 발사 임팩트 (노이즈 휘익)
      _noiseBurst(ctx, now, 0.18, 0.16, 4500);
    } else if (type === "defeat") {
      // 처치 팡파르 — 3음 + 폭발음 + 종소리
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.09);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.42);
      // 종소리 하모니 (3도 위)
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "triangle";
      bell.frequency.setValueAtTime(659, now);
      bell.frequency.setValueAtTime(831, now + 0.09);
      bell.frequency.setValueAtTime(1108, now + 0.2);
      bellGain.gain.setValueAtTime(0.1, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      bell.connect(bellGain);
      bellGain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.5);
      // 폭발 임팩트 (노이즈 퍽 + 묵직한 베이스)
      _noiseBurst(ctx, now, 0.18, 0.24, 1600);
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(120, now);
      boom.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      boomGain.gain.setValueAtTime(0.28, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.start(now);
      boom.stop(now + 0.25);
    } else if (type === "bossDefeat") {
      // 웅장한 보스 처치 팡파르 — 3음 상승 + 긴 여운
      osc.type = "sine";
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523, now + 0.12);
      osc.frequency.setValueAtTime(659, now + 0.24);
      osc.frequency.setValueAtTime(784, now + 0.36);
      osc.frequency.exponentialRampToValueAtTime(1047, now + 0.55);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.setValueAtTime(0.22, now + 0.36);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc.start(now);
      osc.stop(now + 0.85);
      // 하모니 추가
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(196, now);
      osc2.frequency.setValueAtTime(261, now + 0.24);
      osc2.frequency.setValueAtTime(392, now + 0.55);
      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.start(now);
      osc2.stop(now + 0.85);
      // 거대 폭발 임팩트
      _noiseBurst(ctx, now, 0.32, 0.28, 1200);
      const bigBoom = ctx.createOscillator();
      const bigBoomGain = ctx.createGain();
      bigBoom.type = "sine";
      bigBoom.frequency.setValueAtTime(80, now);
      bigBoom.frequency.exponentialRampToValueAtTime(28, now + 0.4);
      bigBoomGain.gain.setValueAtTime(0.34, now);
      bigBoomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      bigBoom.connect(bigBoomGain);
      bigBoomGain.connect(ctx.destination);
      bigBoom.start(now);
      bigBoom.stop(now + 0.5);
    } else if (type === "click") {
      // 펀치감 있는 탭 — 짧은 톤 + 작은 노이즈
      // pitchSemis로 콤보 단계별 반음 상승 → 리듬감
      osc.type = "triangle";
      osc.frequency.setValueAtTime(720 * pitchMult, now);
      osc.frequency.exponentialRampToValueAtTime(380 * pitchMult, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      _noiseBurst(ctx, now, 0.025, 0.06, 4500);
    } else if (type === "upgrade") {
      // 밝은 상승음 — 강화 구매
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch {}
}

let _lastDangerBeep = 0;
let _wasAiming = false;
let _wasDanger = false;

// ── 앰비언트 BGM ──
let _bgmNodes = null;
let _bgmMelodyTimer = null;
let _bgmPedalTimer = null;
let _bgmStarted = false;

function startBgm() {
  if (_bgmNodes) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  _bgmStarted = true;
  try {
    // 마스터 게인 (전체 볼륨 조절용)
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);

    // 드론: 낮은 베이스 패드
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = "sine";
    droneOsc.frequency.value = 110;
    droneGain.gain.value = 0.032;
    droneOsc.connect(droneGain);
    droneGain.connect(master);
    droneOsc.start();

    // 하모닉 드론
    const drone2 = ctx.createOscillator();
    const drone2Gain = ctx.createGain();
    drone2.type = "triangle";
    drone2.frequency.value = 165;
    drone2Gain.gain.value = 0.016;
    drone2.connect(drone2Gain);
    drone2Gain.connect(master);
    drone2.start();

    _bgmNodes = { droneOsc, droneGain, drone2, drone2Gain, master };

    // 마왕성 앰비언트 멜로디 — 일반/보스 모드별 별도 프레이즈
    // A 단조 분위기 (마왕성 어둡고 신비로움). 보스는 D 단조로 더 무겁게.
    const phrasesNormal = [
      [330, 0], [294, 1100], [262, 900], [null, 1200],
      [330, 1400], [370, 800], [330, 700], [null, 2000],
      [294, 1200], [262, 1000], [220, 1100], [null, 2500],
    ];
    // 보스 프레이즈 — D 단조 (D, F, A, C, E♭) + 5도/8도 위협음
    const phrasesBoss = [
      [294, 0], [349, 700], [440, 600], [349, 800], [null, 600],
      [294, 700], [392, 600], [466, 800], [392, 700], [null, 900],
      [262, 600], [330, 500], [392, 600], [466, 700], [311, 1200], [null, 1500],
    ];
    let pi = 0;
    function playMelodyNote() {
      const c = getAudioCtx();
      if (!c || !_bgmNodes) return;
      const phrases = _bgmIsBoss ? phrasesBoss : phrasesNormal;
      if (pi >= phrases.length) pi = 0;
      const [freq, gap] = phrases[pi % phrases.length];
      if (freq) {
        // 메인 멜로디 (sine, 부드러움)
        const mOsc = c.createOscillator();
        const mGain = c.createGain();
        mOsc.type = "sine";
        mOsc.frequency.value = freq;
        const vol = _bgmIsBoss ? 0.07 : 0.055;
        mGain.gain.setValueAtTime(vol, c.currentTime);
        mGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (_bgmIsBoss ? 0.85 : 1.1));
        mOsc.connect(mGain);
        mGain.connect(_bgmNodes.master);
        mOsc.start(c.currentTime);
        mOsc.stop(c.currentTime + (_bgmIsBoss ? 0.95 : 1.2));
        // 보스 모드: 5도 아래 베이스 노트 동시 연주 → 위협감
        if (_bgmIsBoss) {
          const bassOsc = c.createOscillator();
          const bassGain = c.createGain();
          bassOsc.type = "triangle";
          bassOsc.frequency.value = freq / 2;
          bassGain.gain.setValueAtTime(0.04, c.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
          bassOsc.connect(bassGain);
          bassGain.connect(_bgmNodes.master);
          bassOsc.start(c.currentTime);
          bassOsc.stop(c.currentTime + 0.8);
        }
      }
      pi++;
      const baseGap = gap || 800;
      const adjustedGap = _bgmIsBoss ? baseGap * 0.65 : baseGap;
      _bgmMelodyTimer = window.setTimeout(playMelodyNote, adjustedGap + Math.random() * 150);
    }
    window.setTimeout(playMelodyNote, 3000);

    // 보스 모드용 페달톤 — 낮은 D 페달이 일정 박자로 두근거림 (전투 심박음)
    function playBossPedal() {
      const c = getAudioCtx();
      if (!c || !_bgmNodes) {
        _bgmPedalTimer = window.setTimeout(playBossPedal, 1500);
        return;
      }
      if (_bgmIsBoss) {
        const pOsc = c.createOscillator();
        const pGain = c.createGain();
        pOsc.type = "sine";
        pOsc.frequency.value = 73.4;  // D2
        pGain.gain.setValueAtTime(0, c.currentTime);
        pGain.gain.linearRampToValueAtTime(0.045, c.currentTime + 0.05);
        pGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
        pOsc.connect(pGain);
        pGain.connect(_bgmNodes.master);
        pOsc.start(c.currentTime);
        pOsc.stop(c.currentTime + 0.75);
      }
      _bgmPedalTimer = window.setTimeout(playBossPedal, _bgmIsBoss ? 1100 : 2200);
    }
    window.setTimeout(playBossPedal, 5000);
  } catch {}
}

function suspendBgm() {
  try { getAudioCtx()?.suspend(); } catch {}
  if (_bgmMelodyTimer) { clearTimeout(_bgmMelodyTimer); _bgmMelodyTimer = null; }
  if (_bgmPedalTimer) { clearTimeout(_bgmPedalTimer); _bgmPedalTimer = null; }
}

function resumeBgm() {
  if (!_bgmStarted) return;
  try { getAudioCtx()?.resume(); } catch {}
}

function stopBgm() {
  if (!_bgmNodes) return;
  suspendBgm();
  try {
    _bgmNodes.droneOsc?.stop();
    _bgmNodes.drone2?.stop();
  } catch {}
  _bgmNodes = null;
}

let _bgmIsBoss = false;
function setBgmBossMode(isBoss) {
  if (_bgmIsBoss === isBoss) return;
  _bgmIsBoss = isBoss;
  if (!_bgmNodes) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    if (isBoss) {
      // 보스전: 드론 반음 올림 + 볼륨 살짝 증가 → 긴장감
      _bgmNodes.droneOsc.frequency.linearRampToValueAtTime(130, now + 1.2);
      _bgmNodes.drone2.frequency.linearRampToValueAtTime(196, now + 1.2);
      _bgmNodes.master.gain.linearRampToValueAtTime(1.3, now + 1.2);
    } else {
      // 일반전: 원래대로
      _bgmNodes.droneOsc.frequency.linearRampToValueAtTime(110, now + 1.5);
      _bgmNodes.drone2.frequency.linearRampToValueAtTime(165, now + 1.5);
      _bgmNodes.master.gain.linearRampToValueAtTime(1.0, now + 1.5);
    }
  } catch {}
}

const el = {
  runText: $("#runText"),
  floorText: $("#floorText"),
  bestFloorText: $("#bestFloorText"),
  bestChip: $("#bestChip"),
  tributeChip: $("#tributeChip"),
  shardChip: $("#shardChip"),
  demonTitle: $("#demonTitle"),
  tributeText: $("#tributeText"),
  shardText: $("#shardText"),
  dignityText: $("#dignityText"),
  ultimateText: $("#ultimateText"),
  ultimateInlineText: $("#ultimateInlineText"),
  dpsText: $("#dpsText"),
  objectiveText: $("#objectiveText"),
  enemyLabel: $("#enemyLabel"),
  enemyName: $("#enemyName"),
  enemyArt: $("#enemyArt"),
  arenaEnemy: $("#arenaEnemy"),
  clickPrompt: null,
  enemyAttackStat: $("#enemyAttackStat"),
  streakChip: $("#streakChip"),
  streakText: $("#streakText"),
  clickPowerText: $("#clickPowerText"),
  autoPowerText: $("#autoPowerText"),
  sceneOverlay: $("#sceneOverlay"),
  creditCut: $("#creditCut"),
  creditTruth: $("#creditTruth"),
  creditClaim: $("#creditClaim"),
  enemyHpText: $("#enemyHpText"),
  enemyHpBar: $("#enemyHpBar"),
  bossHpBar: $("#bossHpBar"),
  bossHpFill: $("#bossHpFill"),
  bossHpGhost: $("#bossHpGhost"),
  bossHpName: $("#bossHpName"),
  bossHpNum: $("#bossHpNum"),
  fightCombo: $("#fightCombo"),
  fightComboNum: $("#fightComboNum"),
  fightComboMult: $("#fightComboMult"),
  bossCardsOverlay: $("#bossCardsOverlay"),
  bossCardsName: $("#bossCardsName"),
  bossModifierBadge: $("#bossModifierBadge"),
  heroHpText: $("#heroHpText"),
  heroHpBar: $("#heroHpBar"),
  breakText: $("#breakText"),
  breakBar: $("#breakBar"),
  castText: $("#castText"),
  threatText: $("#threatText"),
  enemyIntentBadge: $("#enemyIntentBadge"),
  enemyIntentText: $("#enemyIntentText"),
  threatBar: $("#threatBar"),
  timingCall: $("#timingCall"),
  comboText: $("#comboText"),
  prepText: $("#prepText"),
  prepBar: $("#prepBar"),
  ultimateBar: $("#ultimateBar"),
  stagePanel: $("#stagePanel"),
  stageTap: $("#stageTap"),
  mainCharacter: $("#mainCharacter"),
  moodText: $("#moodText"),
  dialogueText: $("#dialogueText"),
  damageLayer: $("#damageLayer"),
  particleLayer: $("#particleLayer"),
  tapBtn: $("#tapBtn"),
  tapLabel: $("#tapLabel"),
  ultimateBtn: $("#ultimateBtn"),
  ultimateBtnLabel: $("#ultimateBtnLabel"),
  reincarnateBtn: $("#reincarnateBtn"),
  saveBtn: $("#saveBtn"),
  traitList: $("#traitList"),
  partSlots: $("#partSlots"),
  memoryText: $("#memoryText"),
  runUpgradeGrid: $("#runUpgradeGrid"),
  choiceModal: $("#choiceModal"),
  choiceReason: $("#choiceReason"),
  choiceGrid: $("#choiceGrid"),
  partModal: $("#partModal"),
  partReason: $("#partReason"),
  partGrid: $("#partGrid"),
  reincarnateModal: $("#reincarnateModal"),
  reincarnateTitle: $("#reincarnateTitle"),
  reincarnateSummary: $("#reincarnateSummary"),
  upgradeGrid: $("#upgradeGrid"),
  restartRunBtn: $("#restartRunBtn"),
  closeReincarnateBtn: $("#closeReincarnateBtn"),
  cutscene: $("#cutscene"),
  cutsceneRole: $("#cutsceneRole"),
  cutsceneTitle: $("#cutsceneTitle"),
  cutsceneCaption: $("#cutsceneCaption"),
  cutsceneCard: $("#cutsceneCard"),
  cutsceneSkipHint: $("#cutsceneSkipHint"),
  toastStack: $("#toastStack"),
  floorProgressBar: $("#floorProgressBar"),
  stageRewardText: $("#stageRewardText"),
  stageRewardDeck: $("#stageRewardDeck"),
  stageMilestones: $("#stageMilestones"),
  menuBtn: $("#menuBtn"),
  bottomSheet: $("#bottomSheet"),
  sheetClose: $("#sheetClose"),
  sheetTabs: document.querySelectorAll(".sheet-tab"),
  sheetUpgrade: $("#sheetUpgrade"),
  sheetBuild: $("#sheetBuild"),
  sheetParts: $("#sheetParts"),
  sheetSave: $("#sheetSave"),
  runChip: $("#runChip"),
  bossAlert: $("#bossAlert"),
};

function openBottomSheet(tab) {
  if (!el.bottomSheet) return;
  el.bottomSheet.classList.remove("hidden");
  if (tab) switchSheetTab(tab);
}

function closeBottomSheet() {
  if (!el.bottomSheet) return;
  el.bottomSheet.classList.add("hidden");
}

function switchSheetTab(tabName) {
  const map = {
    upgrade: el.sheetUpgrade,
    build: el.sheetBuild,
    parts: el.sheetParts,
    save: el.sheetSave,
  };
  Object.entries(map).forEach(([k, node]) => {
    if (node) node.classList.toggle("hidden", k !== tabName);
  });
  el.sheetTabs?.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
}

if (el.menuBtn) el.menuBtn.addEventListener("click", () => openBottomSheet("upgrade"));
if (el.sheetClose) el.sheetClose.addEventListener("click", closeBottomSheet);
if (el.bottomSheet) {
  el.bottomSheet.addEventListener("click", (e) => {
    if (e.target === el.bottomSheet) closeBottomSheet();
  });
}
el.sheetTabs?.forEach(btn => {
  btn.addEventListener("click", () => switchSheetTab(btn.dataset.tab));
});

// 보스 카드 모달 — 카드 클릭 → 모디파이어 적용
bindBossCardListeners();

const renderCache = {
  parts: "",
  stageReward: "",
  traits: "",
  runUpgrades: "",
};

const poseImages = {
  idle: "assets/mainchar_hit_proud_clean.png",
  hit: "assets/scene_hit.png",
  proud: "assets/mainchar_proud_clean.png",
  ultimate: "assets/scene_counter.png",
  threat: "assets/scene_threat.png",
  rescue: "assets/scene_rescue.png",
  counter: "assets/scene_counter.png",
};

const heroSprites = {
  idle:     "assets/demon_state_idle.png",
  threat:   "assets/demon_state_hit.png",
  hit:      "assets/demon_state_hit.png",
  proud:    "assets/demon_state_proud.png",
  rescue:   "assets/demon_state_proud.png",
  counter:  "assets/demon_state_proud.png",
  ultimate: "assets/demon_state_ultimate.png",
};

const cleanEnemyImages = {
  knight: "assets/enemy_clicker_knight_clean.png",
  golem: "assets/enemy_clicker_golem_clean.png",
  dragon: "assets/enemy_clicker_dragon_clean.png",
  fairy: "assets/enemy_clicker_fairy_clean.png",
};

const cleanBossImages = {
  angel: "assets/boss_angel_clean.png",
  bishop: "assets/boss_bishop_clean.png",
  dragon: "assets/boss_dragon_clean.png",
  golem: "assets/boss_golem_clean.png",
};

const enemyTaunts = {
  knight: ["이 약한 마왕아!", "막아볼 테냐?!", "핫! 각오해!", "방패 소용없다!", "이번엔 피하나 봐라!", "솜방망이가 세다고!"],
  golem: ["우 두 두 두...", "피하지 마... 못하지!", "쿵!!!!", "묵직하게 간다!", "느리지만 아프다!", "무너진다~!"],
  dragon: ["불꽃 잔소리 간다!", "뜨거워라~!", "나도 무는 거 알지?", "용이다! 용!", "마카롱 맛 화염이다!", "잔소리 충전 완료!"],
  fairy: ["이번엔 못 막아!", "헤헤, 어디 보자~", "변칙 공격이다!", "타이밍 맞춰봐!", "빠르지?!", "요정이 무섭다!"],
  angel: ["죄를 고하라!", "훈계 시간이다!", "하늘의 심판을!", "천사가 화났다!", "마왕 버르장머리...", "반성하거라!"],
  bishop: ["질서를 따르거라!", "마왕 따위...", "무릎 꿇어라!", "사탕 주교를 우습게 봐?!", "설교 들어봐라!", "이단이구나!"],
  dragon_boss: ["별빛 박치기!", "으르렁...!", "용의 힘을 봐라!", "혜성처럼 간다!", "막아봐라 마왕아!"],
  golem_boss: ["꿀밤 간다!", "막을 수 있나?!", "성벽이 무너진다!", "크림 주먹이다!", "무거워!!"],
};

const idleDialogueLines = [
  // 허세 — 기본 패턴
  { mood: "위엄", text: "흥... 짐이 허락해서 이 정도인 것이니라." },
  { mood: "허세", text: "보좌관들이 잘 하고 있는 건지 짐이 감시 중이니라." },
  { mood: "명령", text: "다들 짐의 명령을 기다리는 중이다. 짐이 원래 여기 있었느니라." },
  { mood: "위엄", text: "이 정도 적은... 짐에겐 간식 수준이니라." },
  { mood: "허세", text: "흐흥. 짐의 무공은 원래 이 정도이니라. 놀라지 마라." },
  { mood: "명령", text: "보좌관들! 긴장 풀지 마라! 짐이 보고 있다!" },
  { mood: "허세", text: "짐은 원래 이런 상황쯤은 다 예측하고 있었느니라." },
  { mood: "위엄", text: "적이 떨고 있는 것이 느껴지는가? 짐의 오라 때문이니라." },
  { mood: "허세", text: "보좌관아, 수고가 많은데 이건 다 짐의 전술이니라." },
  { mood: "명령", text: "적이 감히 짐 앞에 나타나다니... 용기는 가상하다." },
  { mood: "허세", text: "짐이 한쪽 눈만 뜨고도 처리할 수 있는 수준이니라." },
  { mood: "위엄", text: "짐의 패기가 이 공간 전체를 압도하고 있음을 알아라." },
  { mood: "명령", text: "보좌관들이 알아서 하니 짐은 지휘만 하면 되느니라." },
  { mood: "허세", text: "적이 잠깐 멈춘 것은 짐의 눈빛을 이기지 못했기 때문이니라." },
  { mood: "위엄", text: "이 정도는 짐의 오전 수련 수준이니라. 아직 본격 아니니라." },
  // 슬립 — 솔직한 감정이 새어나옴
  { mood: "울먹임", text: "사, 사실 짐도 좀 무섭긴 한데... 안 무서운 척이니라." },
  { mood: "울먹임", text: "...짐, 짐은 지금 전략적으로 아무것도 안 하고 있는 것이니라." },
  { mood: "울먹임", text: "흑... 보좌관이 없으면 짐은... 아, 아니다. 아무것도 아니니라!" },
  { mood: "울먹임", text: "가끔 짐도... 칭찬받고 싶을 때가 있느니라. 아닌 척이지만." },
  { mood: "울먹임", text: "...지금 적이 짐을 째려보고 있다. 무섭지 않다고. 안 무서워." },
  { mood: "울먹임", text: "보좌관이 막아줘서... 아, 아니! 짐이 명령해서 막은 것이니라!" },
  { mood: "울먹임", text: "짐이 혼자였다면... 어, 어쨌든 혼자는 아니니 상관없느니라." },
  // 해학 — 상황 인식
  { mood: "허세", text: "짐이 지금 뭘 하고 있는 건지 궁금한가? 전부 계획이니라." },
  { mood: "명령", text: "잘 보거라. 짐이 아무것도 안 하는 것처럼 보이겠지만... 다 계획이니라." },
  { mood: "허세", text: "보좌관들이 분주한 것은 짐의 카리스마가 그들을 움직이기 때문이니라." },
  { mood: "위엄", text: "짐이 여기 있는 것만으로도 전장의 분위기가 달라지느니라. 당연하지." },
  { mood: "명령", text: "짐은 최고의 전략가니라. 현재 전략은 '기다리기'이니라. 완벽하지." },
];

// 층수/상황별 맥락 대사 (idleDialogueLines에서 랜덤 선택 후 가끔 덮어쓰기)
function getContextualIdleLine() {
  const floor = state.floor || 1;
  const dignityRate = state.dignity / (getStats().maxDignity || 100);
  const streak = state.rescueStreak || 0;
  // 궁극기 거의 충전됐을 때 — 유저 시선 유도
  const ultPct = Math.round(state.ultimate || 0);
  if (ultPct >= 85 && ultPct < 100) {
    return randomPick([
      { mood: "각성", text: `궁극기가 ${ultPct}%니라! 조금만 더 막으면 짐의 절초식을 쓸 수 있느니라!` },
      { mood: "허세", text: `이제 거의 다 됐느니라. 궁극기 100%가 되면... 짐이 전부 해결할 것이니라!` },
    ]);
  }
  // 체면 위기 시 우선
  if (dignityRate < 0.35) {
    return randomPick([
      { mood: "울먹임", text: "흑흑... 이, 이건 전략적으로 체면을 낮추는 중이니라..." },
      { mood: "울먹임", text: "체면이 좀 깎였지만... 짐은 아직 건재하다! 아마도." },
      { mood: "명령", text: "보좌관들! 다음 공격은 반드시 막아라! 명령이니라! 제발!" },
    ]);
  }
  // 연속 막기 중 허세
  if (streak >= 3) {
    return randomPick([
      { mood: "허세", text: `${streak}연속 막기? 이건 당연히 짐이 예측한 것이니라. 당연하지!` },
      { mood: "허세", text: "이 정도 연속은 짐에겐 워밍업 수준이니라. 아직 본번이 아니다." },
    ]);
  }
  // 층수별 맥락
  if (floor >= 26) {
    return randomPick([
      { mood: "위엄", text: "26층... 짐도 여기가 처음이니라. 아, 아니! 원래 알던 곳이니라!" },
      { mood: "허세", text: "30층 보스... 짐이 직접 처리할 예정이니라. 보좌관들이 먼저 좀 정리해주면 된다." },
      { mood: "울먹임", text: "흑... 이제 진짜 강한 것들만 남은 것 같다. 괜, 괜찮다. 보좌관이 있으니라." },
      { mood: "명령", text: "30층까지 이 마왕을 따라온 자들이여! 잘 보거라 — 짐이 전부 해냈다!" },
    ]);
  }
  if (floor >= 20) {
    return randomPick([
      { mood: "위엄", text: "20층... 원래부터 짐이 여기 속한 존재이니라. 전설이라 불러라." },
      { mood: "허세", text: "이 층까지 온 마왕은 짐뿐일 것이니라. 물론 보좌관들 덕분은 아니니라." },
      { mood: "명령", text: "20층 돌파! 당연히 짐이 계획한 것이니라. 우연이 아니니라!" },
      { mood: "울먹임", text: "사실... 짐도 여기까지 올 줄은... 아니! 처음부터 알았느니라!" },
    ]);
  }
  if (floor >= 15) {
    return randomPick([
      { mood: "허세", text: "15층이라니... 짐의 보좌관들이 꽤 쓸만하구나. 짐이 잘 훈련시킨 덕이니라." },
      { mood: "위엄", text: "적들이 이제 제법 강하구나. 짐에겐 아직 아무것도 아니니라. (보좌관 파이팅)" },
      { mood: "명령", text: "15층! 보좌관들아, 수고가 많다. 짐은 뒤에서 응원하고 있느니라!" },
      { mood: "울먹임", text: "흑... 이 층 적들은 좀... 무서운 것 같기도 하다. 보좌관이 막아줄 것이니라." },
    ]);
  }
  if (floor >= 10) {
    return randomPick([
      { mood: "위엄", text: "10층이 넘었구나. 당연히 짐이 처음부터 계획한 것이니라." },
      { mood: "허세", text: "적들이 강해질수록 짐의 위엄도 커지느니라. 비례하느니라." },
      { mood: "명령", text: "10층 돌파다! 보좌관들, 오늘은 특별히 포상을 줄 것이니라. (내일)" },
      { mood: "울먹임", text: "적이 점점 강해지고 있다... 뭐, 보좌관들이 알아서 하겠지. 아마도." },
    ]);
  }
  // 기본: 일반 idle
  return randomPick(idleDialogueLines);
}

const enemyPool = [
  { kind: "knight", name: "솜방망이 기사", title: "일반 적", image: "assets/enemy_clicker_knight_clean.png", intent: "빠른 망치로 마왕님을 연속 가격합니다.", speedMod: 1.22, damageMod: 0.72 },
  { kind: "golem", name: "졸린 설탕 골렘", title: "일반 적", image: "assets/enemy_clicker_golem_clean.png", intent: "느리지만 육중한 주먹을 모읍니다.", speedMod: 0.72, damageMod: 1.55 },
  { kind: "dragon", name: "마카롱 새끼용", title: "일반 적", image: "assets/enemy_clicker_dragon_clean.png", intent: "불꽃 잔소리를 쌓습니다. 막으면 2배 반격!", speedMod: 1.0, damageMod: 1.0, prepBonus: true },
  { kind: "fairy", name: "훈계 요정", title: "일반 적", image: "assets/enemy_clicker_fairy_clean.png", intent: "타이밍 맞추기 어려운 변칙 공격입니다.", speedMod: 0.88, damageMod: 0.9, narrowWindow: true },
];

const bossPool = [
  { kind: "angel", name: "마왕님 훈계 천사장", title: "보스", image: "assets/boss_angel_clean.png", intent: "즉사급 훈계를 준비합니다.", taunt: ["마왕 따위, 이 천사가 직접 나섰다!", "죄목: 귀여운 척. 처벌: 즉사급 훈계!", "네 보좌관들도 용서받지 못한다!"] },
  { kind: "bishop", name: "질서의 사탕 주교", title: "보스", image: "assets/boss_bishop_clean.png", intent: "마왕님 체면을 꺾는 설교를 시전합니다.", taunt: ["마왕이라니... 자격 없다! 내 설교를 들어라!", "규칙을 어긴 자에게 자비는 없다!", "사탕으로 만든 주교라 우습게 보지 마라!"] },
  { kind: "dragon", name: "분홍 혜성룡", title: "보스", image: "assets/boss_dragon_clean.png", intent: "거대한 별빛 박치기를 준비합니다.", taunt: ["마카롱 색이라 약하다고? 두고 봐라!", "별빛 박치기... 막아보려면 막아봐!", "으르렁! 마왕 따위 한 방이면 충분하다!"] },
  { kind: "golem", name: "성벽 크림 골렘", title: "보스", image: "assets/boss_golem_clean.png", intent: "피할 수 없는 꿀밤을 충전합니다.", taunt: ["성벽이 무너진다... 마왕성도 마찬가지다!", "크림이라 달콤하겠지만 주먹은 아프다!", "이 꿀밤 하나면 끝난다!"] },
];

const partDefs = {
  tear: {
    id: "tear",
    roleKey: "intro",
    role: "도입",
    name: "마왕의 눈물",
    attr: "귀여움",
    image: "assets/ultimate_tear.png",
    desc: "도움 판정과 체면 회복이 좋아집니다.",
    caption: "마왕님이 울먹이는 순간, 세계가 잠깐 머뭇거립니다.",
    effect: { guard: 0.1, dignity: 0.08, charge: 0.05 },
  },
  tantrum: {
    id: "tantrum",
    roleKey: "intro",
    role: "도입",
    name: "떼쓰기 줌인",
    attr: "혼돈",
    image: "assets/trait_tantrumTap.png",
    desc: "공물 바치기와 타이밍 보정이 좋아집니다.",
    caption: "마왕님이 발을 구르자 적의 박자가 꼬입니다.",
    effect: { assist: 0.16, timing: 0.12 },
  },
  circle: {
    id: "circle",
    roleKey: "build",
    role: "전개",
    name: "파스텔 마법진",
    attr: "별빛",
    image: "assets/ultimate_circle.png",
    desc: "궁극기 피해와 충전 속도가 좋아집니다.",
    caption: "귀여운 색의 파멸식이 바닥에 열립니다.",
    effect: { ultimate: 0.16, charge: 0.08 },
  },
  aura: {
    id: "aura",
    roleKey: "build",
    role: "전개",
    name: "검은 오라 컷",
    attr: "어둠",
    image: "assets/trait_blackAura.png",
    desc: "보스 브레이크와 보스 피해가 좋아집니다.",
    caption: "작은 망토 뒤에서 진짜 마왕의 오라가 번집니다.",
    effect: { break: 0.18, boss: 0.14 },
  },
  collapse: {
    id: "collapse",
    roleKey: "finish",
    role: "폭발",
    name: "세계 붕괴 컷",
    attr: "파멸",
    image: "assets/ultimate_collapse.png",
    desc: "궁극기 마무리 피해가 크게 올라갑니다.",
    caption: "별빛 폭발이 보스 체면과 체력바를 같이 찢습니다.",
    effect: { ultimate: 0.22, boss: 0.1 },
  },
  starfall: {
    id: "starfall",
    roleKey: "finish",
    role: "폭발",
    name: "별사탕 낙하",
    attr: "별빛",
    image: "assets/trait_starBurst.png",
    desc: "치명타와 파편 보상이 좋아집니다.",
    caption: "별사탕 폭격이 마왕님의 허세를 현실로 만듭니다.",
    effect: { crit: 0.06, reward: 0.12 },
  },
};

const partSlotDefs = [
  { key: "intro", label: "도입" },
  { key: "build", label: "전개" },
  { key: "finish", label: "폭발" },
];

const traitDefs = [
  {
    id: "cuteTyrant",
    name: "귀여운 폭군",
    rarity: "B",
    tag: "방치",
    image: "assets/trait_cuteTyrant.png",
    desc: "자동 공격 +60% · 대신 가로채기 반격 -40%",
    apply(stats, stacks) {
      stats.autoDamage *= 1 + 0.6 * stacks;
      stats.counterDamage *= 1 - 0.4 * stacks;
    },
  },
  {
    id: "wiggle",
    name: "파멸의 꼬물거림",
    rarity: "B",
    tag: "속도",
    image: "assets/trait_wiggle.png",
    desc: "자동 공격 속도 +50% · 대신 궁극기 충전 속도 -30%",
    apply(stats, stacks) {
      stats.autoSpeed += 0.5 * stacks;
      stats.chargeGain *= 1 - 0.3 * stacks;
    },
  },
  {
    id: "tearySurvival",
    name: "울먹이는 생존본능",
    rarity: "A",
    tag: "생존",
    image: "assets/trait_tearySurvival.png",
    desc: "체면 최대치 +60% · 피격 시 오히려 궁극기 +20% 충전",
    apply(stats, stacks) {
      stats.maxDignity *= 1 + 0.6 * stacks;
      stats.hitChargeBonus = (stats.hitChargeBonus || 0) + 20 * stacks;
    },
  },
  {
    id: "roughApocalypse",
    name: "대충 멸망시킴",
    rarity: "A",
    tag: "반격",
    image: "assets/trait_roughApocalypse.png",
    desc: "가로채기 타이밍 윈도우 -50% · 대신 성공 시 반격 피해 x3",
    apply(stats, stacks) {
      stats.timingWindow *= Math.max(0.2, 1 - 0.5 * stacks);
      stats.counterDamage *= Math.pow(3, stacks);
    },
  },
  {
    id: "starBurst",
    name: "별빛 폭발",
    rarity: "A",
    tag: "치명",
    image: "assets/trait_starBurst.png",
    desc: "치명타 확률 +35% · 치명타 피해 x4 · 대신 일반 피해 -30%",
    apply(stats, stacks) {
      stats.critChance += 0.35 * stacks;
      stats.critMult += 2.2 * stacks;
      stats.autoDamage *= 1 - 0.3 * stacks;
      stats.counterDamage *= 1 - 0.3 * stacks;
    },
  },
  {
    id: "bossBulldozer",
    name: "보스야 미안해",
    rarity: "S",
    tag: "보스",
    image: "assets/trait_bossBulldozer.png",
    desc: "보스전 한정: 모든 피해 x2 · 대신 잡몹 피해 -60%",
    apply(stats, stacks) {
      stats.bossDamage *= Math.pow(2, stacks);
      stats.mobDamageMulti = (stats.mobDamageMulti || 1) * Math.pow(0.4, stacks);
    },
  },
  {
    id: "endingMine",
    name: "엔딩은 내가 정해",
    rarity: "S",
    tag: "궁극기",
    image: "assets/trait_pastelCircle.png",
    desc: "궁극기 충전 2배 빠름 · 궁극기 피해 x3 · 대신 자동 공격 완전 정지",
    apply(stats, stacks) {
      stats.chargeGain *= Math.pow(2, stacks);
      stats.ultimatePower *= Math.pow(3, stacks);
      stats.autoSpeed *= Math.max(0, 1 - stacks);
    },
  },
  {
    id: "vessel",
    name: "마왕의 그릇",
    rarity: "A",
    tag: "계승",
    image: "assets/trait_vessel.png",
    desc: "환생 파편 +50% · 연속 가로채기 콤보 보너스 2배",
    apply(stats, stacks) {
      stats.rewardMult += 0.5 * stacks;
      stats.comboBonusMulti = (stats.comboBonusMulti || 1) * (1 + stacks);
    },
  },
  {
    id: "bigNumbers",
    name: "허세 수치 폭발",
    rarity: "B",
    tag: "치명",
    image: "assets/trait_bigNumbers.png",
    desc: "모든 피해 숫자 +40% · 단 기력 쌓기 효율 -20%",
    apply(stats, stacks) {
      stats.autoDamage *= 1 + 0.4 * stacks;
      stats.assistDamage *= 1 + 0.4 * stacks;
      stats.counterDamage *= 1 + 0.4 * stacks;
      stats.chargeGain *= 1 - 0.2 * stacks;
    },
  },
  {
    id: "shardReward",
    name: "파편 수집가",
    rarity: "A",
    tag: "계승",
    image: "assets/trait_shardReward.png",
    desc: "층 클리어마다 파편 +2 즉시 획득 · 보상 배율 +30%",
    apply(stats, stacks) {
      stats.rewardMult += 0.3 * stacks;
      stats.shardPerFloor = (stats.shardPerFloor || 0) + 2 * stacks;
    },
  },
  {
    id: "runMomentum",
    name: "판거듭 허세",
    rarity: "S",
    tag: "계승",
    image: "assets/trait_vessel.png",
    get desc() { return `판을 거듭할수록 강해짐 · 현재 ${state?.run ?? 1}판: 모든 피해 +${(state?.run ?? 1) - 1}% · 공물 +${((state?.run ?? 1) - 1) * 2}%`; },
    apply(stats, stacks) {
      const runBonus = 1 + (state.run - 1) * 0.01 * stacks;
      stats.autoDamage *= runBonus;
      stats.assistDamage *= runBonus;
      stats.counterDamage *= runBonus;
      stats.rewardMult += (state.run - 1) * 0.02 * stacks;
    },
  },
  {
    id: "pretenseLord",
    name: "허세 군주",
    rarity: "A",
    tag: "생존",
    image: "assets/trait_roughApocalypse.png",
    desc: "막기 성공 시 체면 회복 +80% · 연속 막기 3회마다 체면 +8 추가",
    apply(stats, stacks) {
      stats.dignityRecover *= 1 + 0.8 * stacks;
      stats.streakDignityBonus = (stats.streakDignityBonus || 0) + 8 * stacks;
    },
  },
  {
    id: "aide",
    name: "보좌관의 기적",
    rarity: "B",
    tag: "방치",
    image: "assets/trait_cuteTyrant.png",
    desc: "적 HP 40% 이하에서 자동 공격 x1.5 · 적 HP 20% 이하에서 추가 x1.5",
    apply(stats, stacks) {
      stats.aideFinisherMult = (stats.aideFinisherMult || 1) * (1 + 0.5 * stacks);
    },
  },
];

const upgradeDefs = [
  { id: "power", name: "허세의 무게", desc: "보좌관 반격력 +18% · 판마다 영구 누적", baseCost: 8 },
  { id: "dignity", name: "왕의 체면", desc: "최대 체면 +20% · 더 많이 맞아도 버팀", baseCost: 7 },
  { id: "reward", name: "파편 수확", desc: "파편 획득량 +16% · 성장이 빨라짐", baseCost: 9 },
  { id: "ultimate", name: "영상 증폭", desc: "궁극기 피해 +18% · 궁극기가 더 강렬해짐", baseCost: 10 },
];

const runUpgradeDefs = [
  { id: "click", name: "보좌 손길", desc: "막을 때 더 아프게 반격", truth: "실제: 보좌관이 더 세게 막음", baseCost: 8, growth: 1.58, image: "assets/vfx/protect_sigil.png" },
  { id: "auto", name: "꼬물 부하", desc: "안 눌러도 부하들이 알아서 처리", truth: "실제: 부하들이 알아서 처리", baseCost: 12, growth: 1.62, image: "assets/trait_wiggle.png" },
  { id: "guard", name: "체면 방패", desc: "맞아도 체면이 덜 깎임", truth: "실제: 보좌관이 인간 방패 됨", baseCost: 10, growth: 1.55, image: "assets/ultimate_tear.png" },
  { id: "showoff", name: "허세 연출", desc: "막기 성공마다 공물과 궁극기 더 빨리 충전", truth: "실제: 카메라감독 보좌관 고용", baseCost: 16, growth: 1.7, image: "assets/vfx/counter_spark.png" },
  { id: "crit", name: "치명적 허세", desc: "가끔 엄청 아프게 치는 보좌관 비밀병기", truth: "실제: 보좌관의 급소 공략술", baseCost: 28, growth: 1.85, image: "assets/vfx/impact_burst.png" },
];

function preloadImages() {
  if (typeof Image === "undefined") return;

  const sources = new Set([
    ...Object.values(poseImages),
    ...Object.values(heroSprites),
    ...enemyPool.map((enemy) => enemy.image),
    ...bossPool.map((boss) => boss.image),
    ...Object.values(partDefs).map((part) => part.image),
    ...traitDefs.map((trait) => trait.image),
    ...runUpgradeDefs.map((upgrade) => upgrade.image),
    "assets/stage_bg.png",
    "assets/vfx/threat_beam.png",
    "assets/vfx/timing_gate.png",
    "assets/vfx/protect_sigil.png",
    "assets/vfx/impact_burst.png",
    "assets/vfx/counter_spark.png",
    "assets/vfx/charge_orb.png",
    "assets/vfx/lockon_mark.png",
  ]);

  sources.forEach((src) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });
}

if (document.readyState === "complete") {
  window.setTimeout(preloadImages, 800);
} else {
  window.addEventListener("load", () => window.setTimeout(preloadImages, 800), { once: true });
}

const defaultState = () => ({
  floor: 1,
  bestFloor: 1,
  run: 1,
  shards: 0,
  tributes: 0,
  dignity: 100,
  ultimate: 0,
  autoClock: 0,
  prep: 0,
  rescueStreak: 0,
  bestRescueStreak: 0,
  lastTimingGrade: "대기",
  pose: "idle",
  poseTimer: 0,
  pulseKind: "",
  pulseTimer: 0,
  sceneSrc: "",
  sceneKind: "",
  sceneTimer: 0,
  creditKind: "",
  creditTruth: "실제: 보조가 막음",
  creditClaim: "발표: 짐의 위엄이 막았다!",
  creditTimer: 0,
  dialogue: "흥... 짐은 하나도 무섭지 않으니라.",
  mood: "울먹임",
  traits: [],
  activeBuildTag: "",
  slots: ["tear", "circle", "collapse"],
  ownedParts: { tear: true, circle: true, collapse: true },
  partLevels: { tear: 1, circle: 1, collapse: 1 },
  permanent: { power: 0, dignity: 0, reward: 0, ultimate: 0, bestRunScore: 0 },
  seenTraits: [],
  runUpgrades: { click: 0, auto: 0, guard: 0, showoff: 0, crit: 0 },
  enemy: null,
  paused: false,
  choiceOpen: false,
  partChoiceOpen: false,
  cutscenePlaying: false,
  pendingPartChoice: null,
  queuedTraitChoice: "",
  pendingTraitChoice: "",
  reincarnateRewardClaimed: false,
  slowmoTimer: 0,
  slowmoDone: false,
  sideUnlocked: false,
  introSeen: false,
  firstFloorCleared: false,
  floorEvent: null,
  rageTimer: 0,
  floorInterceptCount: 0,
  floorPerfectCount: 0,
  floorHitCount: 0,
  runInterceptTotal: 0,
  runPerfectTotal: 0,
  runHitTotal: 0,
  breakTutorialSeen: false,
  firstHitSeen: false,
  firstBossDefeated: false,
  endingSeen: false,
  _cutsceneSkippable: false,
  _pendingCrisisBonus: 0,
  _cutsceneAutoResolve: null,
  _firstPerfectSeen: false,
  _idleDialogueTimer: 4.5,
  seenEnemyKinds: [],
  firstUltimateSeen: false,
  firstUlt50Seen: false,
});

let state = loadState();
let lastTime = performance.now();
let saveClock = 0;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const merged = defaultState();
    Object.assign(merged, parsed);
    merged.permanent = { ...defaultState().permanent, ...(parsed.permanent || {}) };
    merged.runUpgrades = { ...defaultState().runUpgrades, ...(parsed.runUpgrades || {}) };
    merged.ownedParts = { ...defaultState().ownedParts, ...(parsed.ownedParts || {}) };
    merged.partLevels = { ...defaultState().partLevels, ...(parsed.partLevels || {}) };
    merged.seenTraits = Array.isArray(parsed.seenTraits) ? parsed.seenTraits : [];
    merged.slots = normalizeSlots(parsed.slots || merged.slots);
    merged.enemy = null;
    merged.paused = false;
    merged.choiceOpen = false;
    merged.partChoiceOpen = false;
    merged.cutscenePlaying = false;
    merged.pendingPartChoice = null;
    merged.queuedTraitChoice = "";
    merged.pendingTraitChoice = "";
    return merged;
  } catch {
    return defaultState();
  }
}

function saveGame(withToast = false) {
  const snapshot = {
    ...state,
    enemy: null,
    paused: false,
    choiceOpen: false,
    partChoiceOpen: false,
    cutscenePlaying: false,
    pendingPartChoice: null,
    queuedTraitChoice: "",
    pulseKind: "",
    pulseTimer: 0,
    sceneSrc: "",
    sceneKind: "",
    sceneTimer: 0,
    creditKind: "",
    creditTimer: 0,
    _firstPerfectSeen: false,
    _consecutivePerfect: 0,
    _cutsceneSkippable: false,
    _pendingCrisisBonus: 0,
    _cutsceneAutoResolve: null,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  if (withToast) showToast("저장했습니다.");
}

const floorEvents = [
  { id: "tribute_up",   label: "공물 풍년의 날",   desc: "이 층: 공물 획득 +50%",      tributeMult: 1.5 },
  { id: "hustle",       label: "허세의 날",         desc: "이 층: 가로채기 보상 +80%",  rescueMult: 1.8 },
  { id: "fast_enemy",   label: "적의 맹공",         desc: "이 층: 적 공격 속도 +35%",  enemySpeedMult: 1.35 },
  { id: "prep_boost",   label: "기력 폭발",         desc: "이 층: 기력 쌓기 +100%",    prepMult: 2.0 },
  { id: "dignity_up",   label: "왕의 위엄",         desc: "이 층: 피격 손실 -40%",     hitReduction: 0.4 },
  { id: "auto_frenzy",  label: "꼬물 광란",         desc: "이 층: 자동 공격 +80%",     autoMult: 1.8 },
];

function rollFloorEvent(floor) {
  if (floor <= 1) return null;
  if (floor % 5 === 0) return null;
  if (Math.random() < 0.38) return floorEvents[Math.floor(Math.random() * floorEvents.length)];
  return null;
}

function getFloorEventStats(base) {
  const ev = state.floorEvent;
  if (!ev) return base;
  if (ev.tributeMult) base.tributeMult = (base.tributeMult || 1) * ev.tributeMult;
  if (ev.rescueMult)  base.rescueMult  = (base.rescueMult  || 1) * ev.rescueMult;
  if (ev.prepMult)    base.prepMult    = (base.prepMult    || 1) * ev.prepMult;
  if (ev.autoMult)    base.autoMult    = (base.autoMult    || 1) * ev.autoMult;
  if (ev.hitReduction) base.hitReduction = ev.hitReduction;
  if (ev.enemySpeedMult) base.enemySpeedMult = ev.enemySpeedMult;
  return base;
}

const eliteNames = {
  knight: "강철 솜방망이 기사",
  golem: "분노한 설탕 골렘",
  dragon: "성체 마카롱용",
  fairy: "심술쟁이 훈계 요정",
};
const eliteTitles = {
  knight: "⚔ 정예 기사",
  golem: "💥 분노한 골렘",
  dragon: "🔥 성체 드래곤",
  fairy: "✨ 악독 요정",
};

function makeEnemyPreview(floor) {
  const isBoss = floor % 5 === 0;
  const pool = isBoss ? bossPool : enemyPool;
  const data = pool[Math.floor((floor * 1.7 + state.run) % pool.length)];
  return { name: data.name, intent: data.intent, isBoss };
}

function makeEnemy(floor) {
  const isBoss = floor % 5 === 0;
  const pool = isBoss ? bossPool : enemyPool;
  const data = pool[Math.floor((floor * 1.7 + state.run) % pool.length)];
  // 11층 이상: 일반 적이 엘리트화 (33% 확률)
  const isElite = !isBoss && floor >= 11 && Math.random() < 0.33;
  // 잡몹 HP — 막기 반격 한 방에 확실히 죽는 느낌 유지
  const hpBase = 44 + floor * 18 + Math.pow(floor, 1.15) * 7;
  const maxHp = Math.round(hpBase * (isBoss ? 2.1 + floor * 0.018 : 1));
  const speedMod = (!isBoss && data.speedMod) ? data.speedMod : 1;
  const baseAttackMax = Math.max(isBoss ? 7.8 : 5.2, (isBoss ? 8.8 : 6.4) - floor * 0.01);
  // 초반(1~3층) 잡몹 공격 주기를 cap — 인터랙션 밀도 높여서 지루하지 않게
  const rawAttackMax = isBoss ? baseAttackMax : Math.max(3.0, baseAttackMax / speedMod);
  const attackMax = (!isBoss && floor <= 3) ? Math.min(rawAttackMax, 3.8) : rawAttackMax;
  const firstAttackDelay = isBoss ? 1.0 : 0.5;
  // 1층 첫 적: 3초 후 첫 공격 → 슬로모션 튜토리얼과 연동
  const firstAttackTimer = (!isBoss && floor === 1 && state.run <= 1)
    ? 3.0
    : Math.max(attackMax + firstAttackDelay, isBoss ? 5.2 : 3.6);
  return {
    ...data,
    image: (isBoss ? cleanBossImages[data.kind] : cleanEnemyImages[data.kind]) || data.image,
    isBoss,
    isElite,
    name: isElite
      ? (eliteNames[data.kind] || data.name)
      : (floor >= 26 ? `신화급 ${data.name}` : floor >= 21 ? `전설의 ${data.name}` : floor >= 16 ? `심연의 ${data.name}` : floor >= 11 ? `냉기 ${data.name}` : floor >= 6 ? `강화된 ${data.name}` : data.name),
    title: isElite ? (eliteTitles[data.kind] || data.title) : data.title,
    hp: Math.round(maxHp * (isElite ? 1.45 : 1)),
    maxHp: Math.round(maxHp * (isElite ? 1.45 : 1)),
    attackMax,
    attackTimer: firstAttackTimer,
    breakGauge: 100,
    damageMod: (!isBoss && data.damageMod) ? data.damageMod * (isElite ? 1.3 : 1) : 1,
    narrowWindow: !isBoss && !!data.narrowWindow,
    prepBonus: !isBoss && !!data.prepBonus,
  };
}

const floorFlavors = [
  null,
  "마왕성 1층 — 겁쟁이 용기병들이 몰려옵니다. (짐이 좀 무서워하는 건 비밀이니라)",
  "마왕성 2층 — 설탕 병사대가 진형을 갖췄습니다. 공물로 강화부터!",
  "마왕성 3층 — 훈계 요원들이 마왕님을 설교하러 왔습니다.",
  "마왕성 4층 — 보스 직전입니다. 명분을 70% 이상 채우세요!",
  null, // 5층은 보스 타이틀로 대체
  "마왕성 6층 — 더 강해진 적들이 나타납니다. 이전 판 경험이 빛을 발합니다.",
  "마왕성 7층 — 궁극기 충전에 집중하면 다음 보스가 쉬워집니다.",
  "마왕성 8층 — 공물 강화를 최대한 올리세요. 9층이 고비입니다.",
  "마왕성 9층 — 보스 직전! 브레이크 게이지를 3번 터뜨리면 대미지 폭발!",
  null, // 10층 보스
  "마왕성 11층 — 적들이 이제 짐의 '작전'을 눈치채기 시작했습니다. (어차피 보좌관이 다 하지만)",
  "마왕성 12층 — 연속 가로채기 스트릭을 유지하면 공물이 폭발적으로 쌓입니다.",
  "마왕성 13층 — 체면 방패를 3레벨까지 올리면 생존률이 크게 달라집니다.",
  "마왕성 14층 — 10보스 직전입니다. 궁극기를 아껴두면 보스전에서 씁니다!",
  null, // 15층 보스
  "마왕성 16층 — 짐은 원래부터 이 층을 점령할 계획이었느니라. (정말이니라!)",
  "마왕성 17층 — 특성 시너지가 2개 이상 겹치면 이제부터 진짜 차이가 납니다.",
  "마왕성 18층 — 브레이크 3번이 현실적입니다. 허세 연출 업그레이드를 올리세요.",
  "마왕성 19층 — 보스 직전! 기력 70% 이상에서 막으면 브레이크 확률 2배!",
  null, // 20층 보스
  "마왕성 21층 — 이쯤 되면 짐도 슬슬 자기가 진짜 강해진 건지 헷갈립니다.",
  "마왕성 22층 — 가로채기 타이밍 윈도우가 더 빡빡해집니다. PERFECT를 노리세요.",
  "마왕성 23층 — 공물 강화를 최고 레벨로 끌어올릴 때가 됐습니다.",
  "마왕성 24층 — 보스 직전! 이 보스는 짐이 직접 처리할... 아니 보좌관이 합니다.",
  null, // 25층 보스
  "마왕성 26층 — 전설이 시작되는 곳입니다. 30F 칭호까지 4층 남았습니다.",
  "마왕성 27층 — 궁극기 스택이 여러 파츠로 쌓이면 1회 사용만으로 보스 40% 이상 깎입니다.",
  "마왕성 28층 — 짐의 명성이 이제 다른 세계에까지 퍼졌다고 합니다. (보좌관이 퍼트림)",
  "마왕성 29층 — 마지막 보스 직전! 궁극기 + 기력 최대 + 브레이크 = 짐의 절초식!",
  null, // 30층 보스
];
let _lastEnemyFloor = -1;
function ensureEnemy() {
  if (!state.enemy) {
    state.enemy = makeEnemy(state.floor);
    state._aimTapCount = 0;
    state._currentEnemyTaunt = "";
    state._idleEnemyTauntTimer = 3.5 + Math.random() * 2.5;
    // 새 적이면 이전 보스 모디파이어 리셋
    state._bossModifierId = null;
    if (state.floor !== _lastEnemyFloor) {
      _lastEnemyFloor = state.floor;
      const flavor = floorFlavors[state.floor];
      // 1~2층에선 튜토리얼 토스트가 많아 플레이버 토스트 생략
      if (flavor && !state.enemy.isBoss && !(state.floor <= 2 && state.run <= 1)) {
        window.setTimeout(() => showToast(flavor), 300);
      }
    }
    // 보스 등장 시 카메라 줌인 컷씬 + 보스 인트로 배너 + 전략 카드 모달
    if (state.enemy.isBoss) {
      triggerCameraBossEntry();
      showBossIntroBanner();
      // 보스 카드 모달은 인트로 컷씬 후로 더 늦춤 (1500 → 2400)
      window.setTimeout(showBossCardsModal, 2400);
    } else {
      // 일반 적 등장 — 화면 안으로 걸어 들어오는 walk-in 애니메이션
      triggerEnemyWalkIn(state.floor === 1 && state.run <= 1);
    }
  }
}

// 적 등장 walk-in 애니메이션 — 첫 1층은 더 강조 (인트로)
function triggerEnemyWalkIn(isFirstSpawn) {
  const enemy = el.arenaEnemy;
  if (!enemy) return;
  enemy.classList.remove("enemy-walk-in", "enemy-walk-in-intro");
  void enemy.offsetWidth;
  enemy.classList.add(isFirstSpawn ? "enemy-walk-in-intro" : "enemy-walk-in");
  const dur = isFirstSpawn ? 1400 : 600;
  window.setTimeout(() => {
    enemy.classList.remove("enemy-walk-in", "enemy-walk-in-intro");
  }, dur);
  // 첫 1층 인트로: VS 배너 한 번 띄움 (격투게임 느낌)
  if (isFirstSpawn) {
    showIntroVsBanner();
  }
}

// 0초 부팅 인트로 — VS 배너 1.6초 노출
function showIntroVsBanner() {
  if (state._introBannerShown) return;
  state._introBannerShown = true;
  const banner = document.createElement("div");
  banner.className = "intro-vs-banner";
  const demonName = (typeof getDemonTitle === "function") ? getDemonTitle() : "허세의 마왕";
  const enemyName = state.enemy?.name || "용기병";
  const top = document.createElement("div");
  top.className = "intro-vs-row intro-vs-top";
  top.innerHTML = `<span class="intro-vs-side">마왕</span><span class="intro-vs-name"></span>`;
  top.querySelector(".intro-vs-name").textContent = demonName;
  const mid = document.createElement("div");
  mid.className = "intro-vs-mid";
  mid.innerHTML = `<span class="intro-vs-text">VS</span>`;
  const bot = document.createElement("div");
  bot.className = "intro-vs-row intro-vs-bot";
  bot.innerHTML = `<span class="intro-vs-side">침입자</span><span class="intro-vs-name"></span>`;
  bot.querySelector(".intro-vs-name").textContent = enemyName;
  banner.append(top, mid, bot);
  document.body.appendChild(banner);
  window.setTimeout(() => {
    banner.classList.add("fade-out");
    window.setTimeout(() => banner.remove(), 300);
  }, 1300);
}

// 보스 등장 인트로 — 거대 풀스크린 컷씬 (격투게임 보스 등장)
function showBossIntroBanner() {
  if (!state.enemy?.isBoss) return;
  const banner = document.createElement("div");
  banner.className = "boss-intro-banner";
  // 좌측 슬릿 (어두운 검정 띠)
  const slitTop = document.createElement("div");
  slitTop.className = "boss-intro-slit boss-intro-slit-top";
  const slitBot = document.createElement("div");
  slitBot.className = "boss-intro-slit boss-intro-slit-bot";
  // 가운데 컨텐츠
  const content = document.createElement("div");
  content.className = "boss-intro-content";
  const warning = document.createElement("div");
  warning.className = "boss-intro-warning";
  warning.textContent = "⚠ WARNING ⚠";
  const titleSm = document.createElement("div");
  titleSm.className = "boss-intro-title-sm";
  titleSm.textContent = state.enemy.title || "보스";
  const titleLg = document.createElement("div");
  titleLg.className = "boss-intro-title-lg";
  titleLg.textContent = state.enemy.name || "보스";
  const floorTag = document.createElement("div");
  floorTag.className = "boss-intro-floor";
  floorTag.textContent = `${state.floor}F BOSS`;
  // 보스 이미지 (작게)
  if (state.enemy.image) {
    const img = document.createElement("img");
    img.className = "boss-intro-portrait";
    img.src = state.enemy.image;
    img.alt = "";
    content.appendChild(img);
  }
  content.append(floorTag, warning, titleSm, titleLg);
  banner.append(slitTop, content, slitBot);
  document.body.appendChild(banner);
  // 보스 인트로 사운드 — 강한 hit 사운드 빌려쓰기
  try { playSfx("perfect"); } catch {}
  window.setTimeout(() => {
    banner.classList.add("fade-out");
    window.setTimeout(() => banner.remove(), 350);
  }, 1700);
}

function normalizeSlots(slots) {
  const byRole = {};
  (Array.isArray(slots) ? slots : []).forEach((id) => {
    const part = partDefs[id];
    if (part && !byRole[part.roleKey]) byRole[part.roleKey] = id;
  });
  return partSlotDefs.map((slot) => byRole[slot.key] || Object.values(partDefs).find((part) => part.roleKey === slot.key)?.id);
}

const titleThresholds = [
  { floor: 30, title: "전설의 파멸군주", css: "title-legend" },
  { floor: 15, title: "공포의 마왕",     css: "title-feared" },
  { floor:  5, title: "성장하는 마왕",   css: "title-growing" },
  { floor:  1, title: "허약한 마왕",     css: "title-weak" },
];
function getDemonTitle(bestFloor) {
  return titleThresholds.find((t) => bestFloor >= t.floor) || titleThresholds[titleThresholds.length - 1];
}
let _lastTitle = "";
function updateDemonTitle() {
  const t = getDemonTitle(state.bestFloor);
  if (!el.demonTitle || _lastTitle === t.title) return;
  const isUpgrade = _lastTitle !== "" && titleThresholds.findIndex(x => x.title === t.title) < titleThresholds.findIndex(x => x.title === _lastTitle);
  _lastTitle = t.title;
  el.demonTitle.textContent = t.title;
  titleThresholds.forEach(x => el.demonTitle.classList.remove(x.css));
  el.demonTitle.classList.add(t.css);
  if (isUpgrade) {
    showToast(`칭호 달성: ${t.title}!`);
    setDialogue(`흐흥! 이제 짐은 '${t.title}'이니라!`, "허세");
    spawnParticles(28);
    flashScreen("gold", 0.5);
    // 칭호 변경 강조 애니메이션
    el.demonTitle.classList.add("title-levelup");
    window.setTimeout(() => el.demonTitle.classList.remove("title-levelup"), 1200);
    // 칭호 변경 오버레이 배너
    const titleBanner = document.createElement("div");
    titleBanner.className = "title-upgrade-banner";
    titleBanner.innerHTML = `<span>칭호 달성</span><strong>${t.title}</strong>`;
    document.body.appendChild(titleBanner);
    window.setTimeout(() => titleBanner.remove(), 2400);
  }
}

function getTraitStacks() {
  return state.traits.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
}

function getPartLevel(id) {
  if (!partDefs[id]) return 0;
  return state.partLevels?.[id] || (state.ownedParts?.[id] ? 1 : 0);
}

function getEquippedPartIds() {
  state.slots = normalizeSlots(state.slots);
  return state.slots.filter((id) => partDefs[id]);
}

function getPartPower(ids = getEquippedPartIds()) {
  const power = {
    guard: 0,
    dignity: 0,
    charge: 0,
    assist: 0,
    timing: 0,
    ultimate: 0,
    break: 0,
    boss: 0,
    crit: 0,
    reward: 0,
    synergyName: "기본 허세",
  };
  const attrs = new Set();
  ids.forEach((id) => {
    const part = partDefs[id];
    const level = getPartLevel(id);
    if (!part || level <= 0) return;
    const scale = 1 + (level - 1) * 0.5;
    attrs.add(part.attr);
    Object.entries(part.effect).forEach(([key, value]) => {
      power[key] += value * scale;
    });
  });
  if (ids.includes("tear") && ids.includes("collapse")) {
    power.synergyName = "울먹이는 파멸";
    power.guard += 0.08;
    power.ultimate += 0.08;
  }
  if (ids.includes("tantrum") && ids.includes("aura")) {
    power.synergyName = "떼쓰기 압박";
    power.timing += 0.12;
    power.break += 0.08;
  }
  if (attrs.size === ids.length) {
    power.reward += 0.08;
  }
  return power;
}

function getStats() {
  const partPower = getPartPower();
  const stats = {
    maxDignity: 100 * (1 + state.permanent.dignity * 0.2) * (1 + (state.runUpgrades.guard || 0) * 0.08),
    autoDamage: (8 + state.floor * 1.1) * (1 + (state.runUpgrades.auto || 0) * 0.38),
    autoSpeed: 1.2 + (state.runUpgrades.auto || 0) * 0.08,
    autoTempo: 1,
    assistDamage: 38 * (1 + state.permanent.power * 0.18) * (1 + (state.runUpgrades.click || 0) * 0.42),
    counterDamage: 110 * (1 + state.permanent.power * 0.18) * (1 + (state.runUpgrades.click || 0) * 0.32),
    ultimatePower: 1 + state.permanent.ultimate * 0.18 + partPower.ultimate,
    chargeGain: (1 + partPower.charge + (state.runUpgrades.showoff || 0) * 0.08) * (state.run <= 1 && state.floor <= 3 ? 1.8 : 1),
    guardPower: 1 + partPower.guard + (state.runUpgrades.guard || 0) * 0.09,
    timingWindow: clamp(1.65 - Math.max(0, state.floor - 3) * 0.022, 1.0, 1.65) + partPower.timing * 0.85,
    hitLoss: 12,
    bossDamage: 1 + partPower.boss,
    breakPower: 1 + partPower.break,
    critChance: 0.08 + partPower.crit + (state.runUpgrades.crit || 0) * 0.05,
    critMult: 1.8 + (state.runUpgrades.crit || 0) * 0.25,
    rewardMult: 1 + state.permanent.reward * 0.16 + partPower.reward + (state.runUpgrades.showoff || 0) * 0.08,
    dignityRecover: 10 * (1 + partPower.dignity + (state.runUpgrades.guard || 0) * 0.08),
    crisisUltimate: 0,
    partBonusChance: 0,
  };

  const stacks = getTraitStacks();
  traitDefs.forEach((trait) => {
    if (stacks[trait.id]) trait.apply(stats, stacks[trait.id]);
  });

  stats.critChance = Math.min(0.75, stats.critChance);
  stats.hitLoss = Math.max(4, stats.hitLoss);
  return stats;
}

function getTraitStatPreview(traitId) {
  const trait = traitDefs.find(t => t.id === traitId);
  if (!trait) return "";
  const curStats = getStats();
  const curDps = curStats.autoDamage * curStats.autoSpeed * curStats.autoTempo;
  const curCounter = curStats.counterDamage;
  const curDignity = curStats.maxDignity;
  // 임시로 특성 1스택 추가해서 시뮬레이션
  const simStacks = getTraitStacks();
  simStacks[traitId] = (simStacks[traitId] || 0) + 1;
  const simStats = getStats();
  traitDefs.forEach(t => { if (simStacks[t.id]) t.apply(simStats, simStacks[t.id]); });
  const newDps = simStats.autoDamage * simStats.autoSpeed * simStats.autoTempo;
  const newCounter = simStats.counterDamage;
  const newDignity = simStats.maxDignity;
  const parts = [];
  const dpsDiff = Math.round(newDps - curDps);
  if (Math.abs(dpsDiff) > 1) parts.push(`자동 ${dpsDiff > 0 ? "+" : ""}${formatNumber(dpsDiff)}/s`);
  const counterDiff = Math.round(newCounter - curCounter);
  if (Math.abs(counterDiff) > 1) parts.push(`반격 ${counterDiff > 0 ? "+" : ""}${formatNumber(counterDiff)}`);
  const dignityDiff = Math.round(newDignity - curDignity);
  if (Math.abs(dignityDiff) > 1) parts.push(`체면 ${dignityDiff > 0 ? "+" : ""}${formatNumber(dignityDiff)}`);
  return parts.slice(0, 2).join(" · ");
}

function formatNumber(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.max(0, Math.round(value)).toLocaleString("ko-KR");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getTimingGrade(timeLeft, windowSize) {
  // 첫 판 1~2층: PERFECT 윈도우를 넓혀 첫 경험 보장
  const perfectWindow = (state.run <= 1 && state.floor <= 2) ? 0.72 : 0.36;
  const greatWindow = (state.run <= 1 && state.floor <= 2) ? 1.2 : 0.9;
  if (timeLeft <= perfectWindow) return { key: "perfect", label: "완벽 가로채기", reward: 1.62, damage: 1.55, charge: 1.45 };
  if (timeLeft <= greatWindow) return { key: "great", label: "정밀 가로채기", reward: 1.34, damage: 1.28, charge: 1.22 };
  if (timeLeft <= windowSize) return { key: "guard", label: "가로채기 성공", reward: 1.12, damage: 1.12, charge: 1.1 };
  return { key: "early", label: "예비 동작", reward: 1, damage: 1, charge: 1 };
}

function getCombatPhase(enemy, stats) {
  const timeLeft = Math.max(0, enemy.attackTimer);
  const windowSize = enemy.narrowWindow ? stats.timingWindow * 0.65 : stats.timingWindow;
  const aimWindow = Math.min(enemy.attackMax * 0.48, windowSize + (enemy.isBoss ? 3.1 : 2.55));
  const dangerReady = timeLeft <= windowSize && !state.paused;
  const impactSoon = timeLeft <= 0.3 && !state.paused;
  const aiming = !dangerReady && timeLeft <= aimWindow && !state.paused;
  return { aiming, dangerReady, impactSoon, aimWindow, windowSize };
}

function getComboMultiplier() {
  const stats = getStats();
  const comboBonus = stats.comboBonusMulti || 1;
  return (1 + Math.min(0.85, (state.rescueStreak || 0) * 0.045)) * comboBonus;
}

function addPrep(amount, showPopup = false) {
  const before = state.prep || 0;
  state.prep = clamp(before + amount, 0, 100);
  const gained = state.prep - before;
  if (showPopup && gained > 0) spawnPrep(gained);
  return gained;
}

function getPrepMultiplier(targetEnemy = state.enemy) {
  const cap = targetEnemy?.isBoss ? 0.55 : 0.78;
  return 1 + Math.min(cap, (state.prep || 0) / 100 * cap);
}

function getNextTraitRewardFloor(floor = state.floor) {
  if (floor < 2) return 2;
  if (floor < 4) return 4;
  if (floor < 7) return 7;
  return 7 + (Math.floor((floor - 7) / 3) + 1) * 3;
}

function shouldOpenTraitReward(defeatedBoss) {
  if (defeatedBoss) return false;
  return state.floor === 2 || state.floor === 4 || (state.floor > 4 && state.floor % 3 === 1);
}

function setPose(pose, duration = 0.9, mood = "") {
  state.pose = pose;
  state.poseTimer = duration;
  if (mood) state.mood = mood;
}

function setDialogue(message, mood = state.mood) {
  state.dialogue = message;
  state.mood = mood;
}

function showScene(kind, duration = 0.7) {
  const src = poseImages[kind] || poseImages.rescue;
  state.sceneSrc = src;
  state.sceneKind = kind;
  state.sceneTimer = duration;
}

function triggerPulse(kind, duration = 0.36) {
  state.pulseKind = kind;
  state.pulseTimer = duration;
}

function showCreditCut(kind, truth, claim, duration = 1.25) {
  // 직전 creditCut이 아직 표시 중이면 rescue/streak 우선순위 없을 때 스킵
  if (state.creditTimer > 0.3 && kind === "hit") return;
  state.creditKind = kind;
  state.creditTruth = truth;
  state.creditClaim = claim;
  state.creditTimer = duration;
  state._creditDuration = duration;
}

function dealEnemyDamage(amount, source = "auto", label = "") {
  ensureEnemy();
  const stats = getStats();
  let damage = amount;
  if (state.enemy.isBoss) {
    damage *= stats.bossDamage;
    // 보스 카드 모디파이어 — 광기:데미지 +60%, 방어:변동 없음
    const mod = getBossModifier();
    if (mod) damage *= mod.damageMod;
  } else {
    damage *= (stats.mobDamageMulti || 1);
  }
  const forcedCrit = source === "rescue" && state._nextBlockCritGuaranteed;
  if (forcedCrit) {
    state._nextBlockCritGuaranteed = false;
    // 강화 직후 첫 막기: "강해진 느낌" 즉각 전달
    window.setTimeout(() => showToast("✦ 강화 효과 발동! 이번 반격이 더 강해졌느니라!"), 100);
  }
  const crit = forcedCrit || Math.random() < stats.critChance;
  if (crit) damage *= stats.critMult;
  if (crit && (source === "rescue" || source === "break")) {
    shakeScreen(2.2);
    flashScreen("gold", 0.3);
    spawnParticles(22);
    // 치명타 팝업
    const critPop = document.createElement("div");
    critPop.className = "crit-pop";
    critPop.textContent = "CRITICAL!";
    el.stagePanel?.appendChild(critPop);
    window.setTimeout(() => critPop.remove(), 700);
    // 치명타 creditCut — 보좌관의 숨겨진 실력 폭발
    showCreditCut(
      "rescue",
      "실제: 보좌관이 급소를 노림",
      randomPick([
        "발표: 짐의 기운이 폭발한 것이니라!!",
        "발표: 짐이 원래 이 정도니라!!",
        "발표: 짐의 필살기가 발동됐느니라!",
      ]),
      1.2,
    );
  }

  const prevHpRate = state.enemy.hp / state.enemy.maxHp;
  state.enemy.hp = Math.max(0, state.enemy.hp - damage);
  const newHpRate = state.enemy.hp / state.enemy.maxHp;
  if (prevHpRate > 0.75 && newHpRate <= 0.75 && newHpRate > 0) {
    if (state.enemy.isBoss) {
      // 보스 HP바가 이미 보임 → 토스트 생략, 효과만
      shakeScreen(0.9);
      spawnParticles(14);
      setDialogue(randomPick([
        "흐흥! 조금만 더! 보좌관들이 잘... 아니, 짐의 전략이 통하고 있는 것이니라!",
        "벌써 4분의 1이 줄었느니라! 이 기세로 밀어붙여라! 짐이 명령한다!",
      ]), "허세");
    }
  }
  if (prevHpRate > 0.5 && newHpRate <= 0.5 && newHpRate > 0) {
    if (state.enemy.isBoss) {
      shakeScreen(1.5);
      flashScreen("red", 0.25);
      setDialogue("보았느냐! 벌써 절반이 줄었다! 이제 보스가 더 사납게 덤빈다!", "허세");
      spawnParticles(22);
    } else {
      shakeScreen(0.5);
    }
  }
  if (prevHpRate > 0.25 && newHpRate <= 0.25 && newHpRate > 0) {
    if (state.enemy.isBoss) {
      shakeScreen(1.8);
      spawnParticles(28);
      setDialogue("흐흥! 거의 다 왔느니라! 이번엔 짐이 직접 나설 것이니라!", "각성");
    } else {
      shakeScreen(0.8);
    }
  }
  const prevUltimate = state.ultimate;
  state.ultimate = clamp(state.ultimate + (source === "auto" ? 1.5 : 6) * stats.chargeGain, 0, 100);
  if (prevUltimate < 50 && state.ultimate >= 50 && !state.firstUlt50Seen) {
    state.firstUlt50Seen = true;
    window.setTimeout(() => showToast("✦ 궁극기 50%! 계속 막고 쌓으면 — 보스도 한 방에 날려요!"), 300);
  }
  if (prevUltimate < 100 && state.ultimate >= 100) {
    if (!state.firstUltimateSeen) {
      state.firstUltimateSeen = true;
      showUltimateFirstAlert();
    } else {
      showToast("✦ 궁극기 준비! 궁극기 버튼을 누르세요!");
    }
  }
  if (source !== "auto") spawnDamage(damage, crit || source !== "auto", label);
  if (source !== "auto") spawnParticles(source === "ultimate" ? 34 : 16);
  if (state.enemy.hp <= 0) defeatEnemy();
}

function gainTributes(amount, source = "click") {
  const gain = Math.max(0, Math.round(amount));
  if (!gain) return;
  state.tributes += gain;
  if (source !== "auto") {
    const node = document.createElement("span");
    node.className = "damage-pop good tribute-pop";
    node.textContent = `공물 +${formatNumber(gain)}`;
    node.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 180)}px`);
    el.damageLayer.appendChild(node);
    window.setTimeout(() => node.remove(), 820);
    // 막기/처치 보상은 코인이 적 → 공물 카운터로 호를 그리며 빨려옴
    if (source === "rescue" || source === "defeat" || source === "boss") {
      spawnCoinReward(gain, source === "boss" ? 14 : source === "defeat" ? 10 : 6);
    }
  }
}

// 공물 코인 보상 시각화 — 적 → 공물 카운터 방향으로 호를 그리며 빨려옴
function spawnCoinReward(totalAmount, count = 6) {
  const stage = el.stagePanel?.querySelector(".main-stage");
  if (!stage) return;
  const counter = el.tributeText;
  if (!counter) return;
  const stageRect = stage.getBoundingClientRect();
  const counterRect = counter.getBoundingClientRect();
  // 카운터 위치를 stage 좌표계로 변환 (% 단위)
  const targetX = ((counterRect.left + counterRect.width / 2 - stageRect.left) / stageRect.width) * 100;
  const targetY = ((counterRect.top + counterRect.height / 2 - stageRect.top) / stageRect.height) * 100;
  const actualCount = Math.min(14, Math.max(3, count));
  for (let i = 0; i < actualCount; i++) {
    const coin = document.createElement("span");
    coin.className = "coin-reward";
    // 시작: 적 영역 (우상단)
    const sx = 55 + Math.random() * 30;
    const sy = 25 + Math.random() * 25;
    // 호 중간점 (위로 솟구침)
    const midY = Math.min(sy, targetY) - 25 - Math.random() * 15;
    coin.style.setProperty("--sx", `${sx}%`);
    coin.style.setProperty("--sy", `${sy}%`);
    coin.style.setProperty("--mx", `${(sx + targetX) / 2}%`);
    coin.style.setProperty("--my", `${midY}%`);
    coin.style.setProperty("--ex", `${targetX}%`);
    coin.style.setProperty("--ey", `${targetY}%`);
    coin.style.animationDelay = `${i * 50}ms`;
    stage.appendChild(coin);
    const totalDur = 750 + i * 50;
    window.setTimeout(() => coin.remove(), totalDur);
    // 코인이 카운터에 도달하는 순간 카운터 펄스
    window.setTimeout(() => {
      if (counter) {
        counter.classList.remove("shard-gained");
        void counter.offsetWidth;
        counter.classList.add("shard-gained");
        window.setTimeout(() => counter.classList.remove("shard-gained"), 280);
      }
    }, totalDur - 80);
  }
}

function autoAttack(dt) {
  const stats = getStats();
  const rageMult = state.rageTimer > 0 ? 1.8 : 1;
  const evMult = state.floorEvent?.autoMult || 1;
  // 첫 판 1층: 자동공격 조금 약하게 — 막기 버튼의 필요성은 느끼되 너무 답답하지 않게
  const tutorialDampener = (state.floor === 1 && state.run <= 1) ? 0.65 : 1;
  const hpRate = state.enemy ? state.enemy.hp / state.enemy.maxHp : 1;
  const aideMult = stats.aideFinisherMult
    ? hpRate <= 0.2 ? stats.aideFinisherMult * stats.aideFinisherMult
      : hpRate <= 0.4 ? stats.aideFinisherMult
      : 1
    : 1;
  state.autoClock += dt * stats.autoSpeed * stats.autoTempo * rageMult * evMult;
  let fired = false;
  while (state.autoClock >= 1) {
    state.autoClock -= 1;
    dealEnemyDamage(stats.autoDamage * rageMult * evMult * tutorialDampener * aideMult, "auto");
    const tributeMult = state.floorEvent?.tributeMult || 1;
    gainTributes((0.35 + state.floor * 0.12) * tributeMult, "auto");
    fired = true;
  }
  if (fired && state.enemy && state.enemy.hp > 0) {
    // 자동 공격 강도에 따른 파티클 크기/색 변화
    const autoLevel = state.runUpgrades?.auto || 0;
    const isRage = state.rageTimer > 0;
    // 레벨 0도 2개로 — "뭔가 일어나고 있다" 느낌 확보
    const particleCount = isRage ? 3 : autoLevel >= 4 ? 3 : autoLevel >= 1 ? 2 : 2;
    const baseSize = isRage ? 10 : 6 + Math.min(6, autoLevel * 1.2);
    const colors = isRage
      ? ["#f09abb", "#ff6b9d", "#f7b731"]
      : autoLevel >= 3
        ? ["#86d8c7", "#b9dcff", "#f3c55f"]
        : ["#86d8c7", "#a8f5e0"];
    for (let pi = 0; pi < particleCount; pi++) {
      const p = document.createElement("span");
      p.className = "particle auto-tick";
      const size = baseSize + Math.random() * 3;
      p.style.setProperty("--x", `${Math.round((Math.random() - 0.5) * (isRage ? 120 : 80))}px`);
      p.style.setProperty("--y", `${Math.round(-30 - Math.random() * (isRage ? 90 : 60))}px`);
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = autoLevel >= 2 ? "2px" : "50%";
      el.particleLayer.appendChild(p);
      window.setTimeout(() => p.remove(), isRage ? 650 : 500);
    }
    // 적 이미지 히트 플래시 (레벨 0도 40% 확률 — 항상 뭔가 때리고 있다는 느낌)
    const flashChance = isRage ? 0.85 : 0.4 + Math.min(0.45, autoLevel * 0.1);
    if (el.arenaEnemy && Math.random() < flashChance) {
      el.arenaEnemy.classList.add("auto-hit-flash");
      window.setTimeout(() => el.arenaEnemy.classList.remove("auto-hit-flash"), isRage ? 180 : 120);
    }
    // 자동공격 데미지 숫자 — 레벨 0도 45% 확률로 표시
    const showAutoDmg = Math.random() < (isRage ? 0.8 : autoLevel >= 3 ? 0.55 : 0.45);
    if (showAutoDmg && el.damageLayer) {
      const stats2 = getStats();
      const dmgVal = Math.round(stats2.autoDamage * (isRage ? 1.8 : 1));
      const pop = document.createElement("span");
      pop.className = `damage-pop auto-damage-pop${isRage ? " rage-pop" : ""}`;
      pop.textContent = formatNumber(dmgVal);
      // 적 이미지가 왼편에 있으므로 -100~-160px 범위로 적 위에 표시
      pop.style.setProperty("--dx", `${Math.round(-130 + (Math.random() - 0.5) * 50)}px`);
      el.damageLayer.appendChild(pop);
      window.setTimeout(() => pop.remove(), 580);
    }
  }
}

function rescueAction(ev) {
  if (state.paused || state.cutscenePlaying) return;
  // 즉시 탭 피드백 — 막기 성공/실패 판정 전에 유저 입력 인식
  triggerTapFeedback();
  // 클릭 좌표 캡처 — hit-spark용 (없으면 stage 중앙 기본값)
  const tapCoord = (() => {
    if (!ev || !el.stagePanel) return null;
    const rect = el.stagePanel.getBoundingClientRect();
    const x = (ev.clientX != null ? ev.clientX : rect.left + rect.width / 2) - rect.left;
    const y = (ev.clientY != null ? ev.clientY : rect.top + rect.height / 2) - rect.top;
    return { x, y };
  })();
  ensureEnemy();
  const stats = getStats();
  const targetEnemy = state.enemy;
  const phase = getCombatPhase(state.enemy, stats);
  const isDanger = phase.dangerReady;
  const isCrisis = state.enemy.isBoss && state.enemy.attackTimer <= stats.timingWindow + 0.25;

  if (isDanger || isCrisis) {
    const timing = getTimingGrade(state.enemy.attackTimer, phase.windowSize || stats.timingWindow);
    playSfx(timing.key === "perfect" ? "perfect" : "rescue");
    state.rescueStreak = (state.rescueStreak || 0) + 1;
    state.bestRescueStreak = Math.max(state.bestRescueStreak || 0, state.rescueStreak);
    state.lastTimingGrade = timing.label;
    checkComboMilestone();
    const comboMult = getComboMultiplier();
    const prepMult = getPrepMultiplier(targetEnemy);
    setPose("rescue", 0.95, "가로채기");
    showScene("rescue", 0.62);
    triggerPulse("rescue", 0.55);
    // 막기 성공 시 마왕님 점프 애니메이션 + 보좌관 잔상 트레일
    if (el.mainCharacter) {
      el.mainCharacter.classList.remove("char-rescue-jump");
      void el.mainCharacter.offsetWidth;
      el.mainCharacter.classList.add("char-rescue-jump");
      window.setTimeout(() => el.mainCharacter.classList.remove("char-rescue-jump"), 450);
      const demonSide = el.mainCharacter.parentElement;
      if (demonSide) {
        demonSide.classList.remove("show-trail");
        void demonSide.offsetWidth;
        demonSide.classList.add("show-trail");
        window.setTimeout(() => demonSide.classList.remove("show-trail"), 600);
      }
    }
    showGradePopup(timing.key);
    // ⑤ BLOCK! 중앙 폭발 텍스트
    showBlockBurst(timing.key);
    // ② 첫 막기 성공 특별 연출 — isFirstBlock을 먼저 캡처해야 creditCut 지속시간에 반영됨
    const isFirstBlock = !state.firstBlockSeen;
    if (isFirstBlock) {
      state.firstBlockSeen = true;
      spawnParticles(36);
      flashScreen("gold", 0.45);
      // 첫 막기 = 게임 핵심 유머 훅 첫 노출
      showCreditCut("rescue", "실제: 보좌관이 막음", "발표: 짐의 위엄이 막았다!", 2.8);
      window.setTimeout(() => {
        showToast("🎉 첫 가로채기 성공! 적이 공격할 때(빨간불) 막으면 됩니다!");
        setDialogue("흐흥! 봤느냐! 짐의 보좌관이... 아니, 짐의 위엄으로 막은 것이니라!", "허세");
      }, 400);
      window.setTimeout(() => {
        if (!state.sideUnlocked) {
          showToast("💡 적 처치 후 [강화] 탭에서 보좌관을 강화할 수 있습니다!");
        }
      }, 2800);
    }
    state.floorInterceptCount = (state.floorInterceptCount || 0) + 1;
    state.runInterceptTotal = (state.runInterceptTotal || 0) + 1;
    if (timing.key === "perfect") {
      state.floorPerfectCount = (state.floorPerfectCount || 0) + 1;
      state.runPerfectTotal = (state.runPerfectTotal || 0) + 1;
      state._consecutivePerfect = (state._consecutivePerfect || 0) + 1;
      // 첫 판 첫 번째 PERFECT: 강렬한 축하 연출
      if (state.run <= 1 && !state._firstPerfectSeen) {
        state._firstPerfectSeen = true;
        spawnParticles(52);
        flashScreen("gold", 0.5);
        window.setTimeout(() => {
          setDialogue("PERFECT?! 짐이... 짐이 해낸 것이니라!! 원래 이 정도니라!!", "각성");
          showToast("✨ 첫 PERFECT! 완벽한 타이밍 — 짐은 역시 대단하구나!");
        }, 80);
      }
      // 연속 PERFECT 보너스
      if (state._consecutivePerfect === 2) {
        spawnParticles(32);
        window.setTimeout(() => {
          setDialogue("잠깐, 짐이 진짜로 강한 건가...? 아니, 아니, 그럴 리가!!", "각성");
          showToast("2연속 PERFECT! 혹시 진짜 마왕?");
        }, 120);
      } else if (state._consecutivePerfect >= 5 && state._consecutivePerfect % 5 === 0) {
        spawnParticles(72);
        flashScreen("gold", 0.65);
        shakeScreen(3);
        gainTributes((state._consecutivePerfect * 8 + state.floor * 5), "rescue");
        window.setTimeout(() => {
          setDialogue(`${state._consecutivePerfect}연속?! 흑흑... 짐이 원래 이런 마왕이었던 것이니라!! 감동이구나!!`, "각성");
        }, 80);
      } else if (state._consecutivePerfect >= 3) {
        spawnParticles(48);
        window.setTimeout(() => {
          setDialogue("이건... 이건 원래 짐이 이 정도였던 것이니라. 그래 맞다!!", "각성");
          showToast(`${state._consecutivePerfect}연속 PERFECT!! 전설의 마왕!`);
        }, 120);
      }
    } else {
      state._consecutivePerfect = 0;
    }
    state.rageTimer = 0;
    const _creditTruths_perfect = [
      "실제: 보좌관이 0.1초 차이로 완벽히 막음",
      "실제: 보좌관 3명이 동시에 달려들어 막음",
      "실제: 보좌관이 타이밍 연습 3시간 만에 성공",
      "실제: 보좌관이 죽기살기로 막음",
    ];
    const _creditTruths_normal = [
      "실제: 보좌관이 막음",
      "실제: 보좌관이 대신 맞을 뻔함",
      "실제: 보좌관이 살짝 맞으면서 막음",
      "실제: 보좌관이 눈 감고 막음 (운)",
      "실제: 보좌관이 넘어지며 막음",
      "실제: 보좌관이 비명 지르며 막음",
    ];
    showCreditCut(
      "rescue",
      isFirstBlock ? "실제: 보좌관이 목숨 걸고 막음" : (timing.key === "perfect" ? randomPick(_creditTruths_perfect) : randomPick(_creditTruths_normal)),
      isFirstBlock ? "발표: 짐의 위엄이 공격을 막은 것이니라!" : (timing.key === "perfect"
        ? randomPick([
            "발표: 짐의 완전무결한 반응속도가 막은 것이니라!",
            "발표: 완벽? 당연하지. 짐은 항상 이 정도니라!",
            "발표: PERFECT는 짐한테 기본이니라!",
            "발표: 짐의 카리스마가 공격 자체를 녹였느니라!",
            "발표: 짐이 일부러 완벽하게 막아준 것이니라!",
          ])
        : randomPick([
            "발표: 짐의 위엄이 공격을 지웠느니라!",
            "발표: 짐이 일부러 막을 기회를 준 것이니라!",
            "발표: 보았느냐, 짐의 계획대로니라!",
            "발표: 짐의 눈빛 하나로 적이 주춤한 것이니라!",
            "발표: 짐이 미리 예측하고 막으라 명한 것이니라!",
            "발표: 막힌 건 적 실력이 부족한 탓이니라!",
            "발표: 짐의 오라가 공격을 빗나가게 한 것이니라!",
            "발표: 짐의 기세에 눌려 적이 힘을 잃은 것이니라!",
            "발표: 이 정도는 짐에게 재채기 수준이니라!",
            "발표: 짐의 전략이 적의 타이밍을 완벽히 읽었느니라!",
          ])),
      isFirstBlock ? 2.4 : 1.35,
    );
    // 적 도발에 대한 마왕 반박 대사 (막기 성공)
    const counterLines = timing.key === "perfect"
      ? ["흐흥! 그게 최선이냐? 짐에겐 재채기 수준이니라!", "완벽하게 막았느니라! 이게 바로 짐이다!", "PERFECT? 당연하지! 짐은 원래 이 정도니라!"]
      : ["막았느니라! 짐을 누가 건드려?!", "이 정도 공격이 통할 것 같았나?!", "방금 건... 짐이 일부러 맞아준 척이니라!"];
    setDialogue(randomPick(counterLines), "허세");
    shakeScreen(timing.key === "perfect" ? 2.4 : 1.4);
    // 타격감: hitstop + 흰 플래시 + 적 임팩트 연출
    // PERFECT는 280ms로 격투게임 finisher급 시간 정지 (GREAT 110ms의 2.5배)
    hitstop(timing.key === "perfect" ? 280 : 110);
    // PERFECT 전용 — 카메라 줌인 + 4방향 수렴 빛 (Guilty Gear Roman Cancel 컨벤션)
    if (timing.key === "perfect") {
      triggerPerfectConverge();
    }
    spawnImpactFlash();
    spawnImpactRay();
    enemyImpactHit();
    const dignityBefore = state.dignity;
    const streakDignityBonus = (state.rescueStreak % 3 === 0 && state.rescueStreak >= 3 && stats.streakDignityBonus)
      ? stats.streakDignityBonus : 0;
    state.dignity = clamp(state.dignity + stats.dignityRecover * stats.guardPower * timing.charge + streakDignityBonus, 0, stats.maxDignity);
    const dignityGained = Math.round(state.dignity - dignityBefore);
    if (dignityGained > 0) spawnDamage(dignityGained, true, "dignity");
    state.ultimate = clamp(state.ultimate + 18 * stats.chargeGain * timing.charge * prepMult, 0, 100);
    const evRescueMult = state.floorEvent?.rescueMult || 1;
    const evTributeMult = state.floorEvent?.tributeMult || 1;
    gainTributes((4 + state.floor * 1.15) * stats.rewardMult * timing.reward * comboMult * prepMult * evRescueMult * evTributeMult, "rescue");
    state.enemy.attackTimer = state.enemy.attackMax + (targetEnemy.isBoss ? 1.0 : 0.65);
    const damage = (stats.counterDamage + targetEnemy.maxHp * (targetEnemy.isBoss ? 0.12 : 0.18)) * prepMult;
    dealEnemyDamage(damage * timing.damage * comboMult, "rescue", timing.label);
    state.prep = Math.max(0, (state.prep || 0) - (timing.key === "perfect" ? 48 : targetEnemy.isBoss ? 58 : 70));
    el.stagePanel.querySelector(".prep-max-hint")?.remove();
    if (targetEnemy.prepBonus) {
      addPrep(20, true);
      showToast("잔소리 흡수! 명분 +20% 획득");
    }
    if (state.rescueStreak > 1 && state.rescueStreak % 3 === 0 && state.rescueStreak !== 3) {
      const streakLines = [
        `연속 허세 ${state.rescueStreak}! 마왕님이 자기 실력이라고 우깁니다.`,
        `${state.rescueStreak}연속! 콤보 배율 x${getComboMultiplier().toFixed(2)} 적용 중!`,
        `허세 ${state.rescueStreak}연속 달성! 공물 보너스 중입니다.`,
      ];
      showToast(randomPick(streakLines));
    }
    // 10, 20, 30회 마일스톤: 강화된 보너스 + 체면 회복
    if (state.rescueStreak > 0 && state.rescueStreak % 10 === 0) {
      const milestoneBonus = state.rescueStreak * 2.5;
      state.dignity = clamp(state.dignity + milestoneBonus, 0, stats.maxDignity);
      shakeScreen(3);
      flashScreen("gold", 0.45);
      setDialogue(randomPick([
        `${state.rescueStreak}연속?! 짐의 이름이 전설이 되는구나...`,
        `흐흥! ${state.rescueStreak}번 막기, 물론 짐이 직접 한 거니라!`,
        `${state.rescueStreak}연속 달성... 짐은 역시 대단하구나. 흑흑.`,
      ]), "감동");
      spawnParticles(40);
      showToast(`🎉 ${state.rescueStreak}연속 달성! 체면 +${Math.round(milestoneBonus)} 보너스!`);
    }
    if (state.enemy === targetEnemy && state.rescueStreak > 1 && state.rescueStreak % 5 === 0) {
      const streakBonus = (stats.counterDamage * 0.72 + state.floor * 8) * comboMult * prepMult;
      state.ultimate = clamp(state.ultimate + 9 * stats.chargeGain, 0, 100);
      gainTributes((7 + state.floor * 1.8) * stats.rewardMult * comboMult, "rescue");
      dealEnemyDamage(streakBonus, "rescue", "허세 연계");
      triggerPulse("counter", 0.55);
      showCreditCut("streak", "실제: 연속으로 보좌관이 수습함", randomPick([
        "발표: 짐의 연속 위엄 작전 성공!",
        "발표: 짐이 처음부터 이렇게 계획했느니라!",
        "발표: 연속 허세! 짐의 진정한 실력이니라!",
        "발표: 보좌관? 무슨 보좌관? 다 짐이 한 것이니라!",
      ]), 1.45);
      showToast(`연속 가로채기 ${state.rescueStreak}: 허세 연계가 터졌습니다.`);
    }
    if (state.enemy === targetEnemy && targetEnemy.isBoss) {
      state.enemy.breakGauge = clamp(state.enemy.breakGauge - 34 * stats.breakPower, 0, 100);
      if (state.enemy.breakGauge <= 0) {
        state.enemy.breakGauge = 100;
        state.enemy._breakCount = (state.enemy._breakCount || 0) + 1;
        shakeScreen(2.5);
        dealEnemyDamage(state.enemy.maxHp * 0.18, "break", "브레이크!");
        state.dignity = clamp(state.dignity + 16, 0, stats.maxDignity);
        state.ultimate = clamp(state.ultimate + 22, 0, 100);
        showCreditCut("streak", "실제: 보좌관이 적의 집중 흐름을 끊음", "발표: 짐의 위엄이 적의 의지를 꺾었다!", 1.6);
        const breakN = state.enemy._breakCount;
        if (breakN === 3) {
          // 브레이크 3회 달성 보너스
          dealEnemyDamage(state.enemy.maxHp * 0.12, "break", "파멸 브레이크!");
          state.ultimate = clamp(state.ultimate + 30, 0, 100);
          spawnParticles(36);
          setDialogue("브레이크 세 번?! 짐이... 짐이 진짜 강한 건가?!", "각성");
          showToast("★★★ 브레이크 3회 달성! 보너스 피해 + 궁극기 +30%!");
        } else {
          const breakMsg = `브레이크 ${breakN}/3! 3회 달성 시 ★★★ 보너스!`;
          showToast(breakMsg);
        }
      }
    }
    return;
  }

  if (phase.aiming) {
    setPose("threat", 0.42, "긴장");
    triggerPulse("brace", 0.34);
    addPrep(4 + state.floor * 0.08, true);
    setDialogue(randomPick([
      "아직이다... 짐의 완벽한 순간은 조금 뒤에 오느니라!",
      "흐, 흠. 지금 누른 건 준비 동작이니라!",
      "보좌관아, 공격이 들어올 때 짐을 빛내거라!",
    ]), "긴장");
    gainTributes((0.35 + state.floor * 0.08) * stats.rewardMult, "click");
    shakeScreen(0.4);
    // aiming 탭은 토스트 자제 — 처음 두 번만 힌트
    const aimTaps = (state._aimTapCount = (state._aimTapCount || 0) + 1);
    if (aimTaps <= 2) {
      showToast(`조준 중 — ${stats.timingWindow.toFixed(1)}초 안에 막으세요!`);
    }
    return;
  }

  // 기력 충전 클릭 횟수 추적
  state._prepClickCount = (state._prepClickCount || 0) + 1;
  if (state._prepClickCount === 1 && state.run <= 1) {
    // 첫 탭: 마왕님 등장 연출 — 파티클 + 특별 대사
    spawnParticles(20);
    flashScreen("mint", 0.22);
    setDialogue("오! 시작하는구나! 보좌관들, 준비해라! 짐이 지켜보고 있겠느니라!", "명령");
    window.setTimeout(() => showToast("기력을 쌓는 중! 적이 공격할 때(빨간 버튼) 막으면 기력만큼 더 강하게 반격!"), 300);
  }

  // 빠른 연속 탭 콤보 — 리듬감 있는 클릭에 보너스
  const now_tap = performance.now();
  const tapGap = now_tap - (state._lastTapTs || 0);
  state._lastTapTs = now_tap;
  if (tapGap < 450) {
    state._tapCombo = (state._tapCombo || 0) + 1;
  } else {
    state._tapCombo = 0;
  }
  const tapCombo = state._tapCombo;

  // 콤보에 따라 반음씩 올라가는 click — 리듬게임 효과음 패턴
  // 0~3: 0~3반음, 4~7: 4~7반음, 8+: 8~12반음 (clamp)
  const clickPitch = Math.min(12, tapCombo);
  playSfx("click", { pitchSemis: clickPitch });
  setPose("proud", 0.58, "명령");
  triggerPulse("assist", 0.3);
  // 기력 탭 → 적 반응 (기력 높을수록 더 크게) + 가벼운 흔들림으로 묵직함 추가
  if (el.arenaEnemy) {
    const prepNow = state.prep || 0;
    const flinchClass = prepNow >= 80 ? "enemy-flinch-hard" : prepNow >= 40 ? "enemy-flinch" : "enemy-flinch-soft";
    el.arenaEnemy.classList.remove("enemy-flinch-soft", "enemy-flinch", "enemy-flinch-hard");
    void el.arenaEnemy.offsetWidth;
    el.arenaEnemy.classList.add(flinchClass);
    window.setTimeout(() => el.arenaEnemy.classList.remove("enemy-flinch-soft", "enemy-flinch", "enemy-flinch-hard"), 180);
    // 콤보 단계별 임팩트: 0~3 약함, 4~7 중, 8+ 강 (hitstop+ray)
    const intensity = prepNow >= 80 ? 0.55 : prepNow >= 40 ? 0.35 : 0.22;
    shakeScreen(intensity + Math.min(0.4, tapCombo * 0.04));
    if (tapCombo >= 8) {
      hitstop(50);
      spawnImpactRay();
    } else {
      // 일반 탭에도 미니 hitstop으로 격투게임 무게감
      hitstop(prepNow >= 40 ? 22 : 14);
    }
  }
  // 클릭 좌표 hit-spark — 격투게임 임팩트
  spawnTapHitSpark(tapCoord, tapCombo);
  // 마왕 lunge — 펀치 모션
  if (el.mainCharacter) {
    el.mainCharacter.classList.remove("char-tap-lunge");
    void el.mainCharacter.offsetWidth;
    el.mainCharacter.classList.add("char-tap-lunge");
    window.setTimeout(() => el.mainCharacter?.classList.remove("char-tap-lunge"), 220);
  }
  const prepBefore = state.prep || 0;
  const ragePrepMult = state.rageTimer > 0 ? 2.0 : 1;
  const evPrepMult = state.floorEvent?.prepMult || 1;
  // 콤보 보너스: 4탭+ 연속 시 +15%, 8탭+ 연속 시 +30%
  const comboBonus = tapCombo >= 8 ? 1.3 : tapCombo >= 4 ? 1.15 : 1;
  const gainedPrep = addPrep((11 + state.floor * 0.28) * ragePrepMult * evPrepMult * comboBonus, true);

  // Vampire Survivors 스타일 매 탭 +N 미니 숫자 — 클릭 좌표 기준 위로 튀어오름
  if (el.stagePanel && tapCoord) {
    const mini = document.createElement("span");
    mini.className = "prep-gain-mini";
    if (tapCombo >= 8) mini.classList.add("prep-gain-mini-hot");
    else if (tapCombo >= 4) mini.classList.add("prep-gain-mini-warm");
    mini.textContent = `+${Math.round(gainedPrep)}`;
    // stage-panel 좌표 기준 (tapCoord와 일치)
    mini.style.left = `${tapCoord.x}px`;
    mini.style.top = `${tapCoord.y}px`;
    el.stagePanel.appendChild(mini);
    window.setTimeout(() => mini.remove(), 620);
  }

  // 콤보 달성 피드백
  if (tapCombo === 4) {
    spawnParticles(14);
    showTapComboPopup(4);
  } else if (tapCombo === 8) {
    spawnParticles(24);
    flashScreen("mint", 0.18);
    showTapComboPopup(8);
    setDialogue("훌륭하다! 보좌관들의 박자가 맞아가고 있느니라!", "허세");
  } else if (tapCombo === 15) {
    spawnParticles(36);
    flashScreen("gold", 0.22);
    showTapComboPopup(15);
    setDialogue(randomPick([
      "오오오! 이, 이건... 보좌관들이 완전히 달아올랐느니라! 물론 짐의 지시 덕분이니라!",
      "15연속!! 이 기력이라면... 막기 한 방에 적이 날아가느니라!!",
    ]), "각성");
  } else if (tapCombo > 8 && tapCombo % 4 === 0) {
    spawnParticles(tapCombo >= 15 ? 20 : 12);
    showTapComboPopup(tapCombo);
    if (tapCombo >= 20 && tapCombo % 8 === 0) {
      flashScreen("mint", 0.15);
      setDialogue(randomPick([
        "멈추지 마라! 기력이 폭발적이니라!!",
        "보좌관들이 미쳐 날뛰고 있느니라! 짐의 명령이 통한 것이니라!!",
      ]), "각성");
    }
  }
  // 기력 게인 숫자 팝업 — 처음 12탭 또는 마일스톤 구간
  if (gainedPrep > 0 && (state._prepClickCount <= 12 || state.prep >= 70)) {
    showPrepGainPop(gainedPrep);
  }
  if (gainedPrep > 0 && state.prep >= 100 && prepBefore < 100) {
    showToast("기력 MAX! 이제 적이 공격할 때 막으세요!");
    flashScreen("mint", 0.3);
    // ④ 전투 영역에 "지금 막으세요!" 오버레이
    showPrepMaxHint();
  } else if (gainedPrep > 0 && state.prep >= 70 && prepBefore < 70) {
    showToast("기력 70%! 막기 반격 위력 최대!");
  }
  setDialogue(gainedPrep > 0
    ? "좋다. 그 공물은 짐의 위엄을 증명하는 데 쓰겠노라."
    : "흐흥, 이미 기력은 충분하니라. 이제 짐이 보여줄 차례다.", "위엄");
  state.ultimate = clamp(state.ultimate + 6 * stats.chargeGain, 0, 100);
  gainTributes((1 + state.floor * 0.32) * stats.rewardMult, "click");
  dealEnemyDamage(stats.assistDamage * 0.62, "assist", "보좌");
}

function showTapComboPopup(count) {
  const existing = document.querySelector(".tap-combo-popup");
  if (existing) existing.remove();
  const pop = document.createElement("div");
  pop.className = "tap-combo-popup";
  const label = count >= 8 ? `${count}연속! +30%` : `${count}연속! +15%`;
  pop.textContent = label;
  el.stagePanel?.appendChild(pop);
  window.setTimeout(() => {
    pop.classList.add("tcp-exit");
    window.setTimeout(() => pop.remove(), 300);
  }, 900);
}

function showPrepGainPop(amount) {
  if (amount <= 0) return;
  const pop = document.createElement("div");
  pop.className = "prep-gain-pop";
  pop.textContent = `+${Math.round(amount)}%`;
  el.stagePanel?.appendChild(pop);
  window.setTimeout(() => {
    pop.classList.add("pgp-exit");
    window.setTimeout(() => pop.remove(), 280);
  }, 480);
}

function showMissedPopup() {
  const wrapper = document.createElement("div");
  wrapper.className = "grade-popup";
  // 첫 3번 피격은 위로 메시지, 이후는 간결하게
  const missCount = (state._missCount = (state._missCount || 0) + 1);
  const label = missCount <= 3 ? "조금 더 기다렸다가!" : "타이밍 미스!";
  wrapper.innerHTML = `<span class="grade-popup-text grade-missed">${label}</span>`;
  document.body.appendChild(wrapper);
  window.setTimeout(() => wrapper.remove(), 900);
  // 첫 2번 피격: 힌트 토스트
  if (missCount <= 2) {
    window.setTimeout(() => showToast("빨간 테두리가 깜박일 때 막기 버튼을 누르세요!"), 500);
  }
}

function enemyHits() {
  if (state.paused || state.cutscenePlaying) return;
  ensureEnemy();
  const stats = getStats();
  const damageMod = state.enemy.damageMod || 1;
  const hitReductionEv = state.floorEvent?.hitReduction || 0;
  // 보스 카드 모디파이어 — 방어:받는 피해 -30%, 광기:+20%
  const bossMod = state.enemy.isBoss ? getBossModifier() : null;
  const incomingMod = bossMod ? bossMod.incomingMod : 1;
  const loss = Math.round((state.enemy.isBoss ? 22 : stats.hitLoss) * damageMod * incomingMod * (1 - Math.min(0.55, (stats.guardPower - 1) * 0.45)) * (1 - hitReductionEv));
  state.dignity = clamp(state.dignity - loss, 0, stats.maxDignity);
  // 공물 누출 — 막기 실패 시 누적 공물의 일부가 적에게 빨려나감
  // 1층 튜토리얼/2층은 면제, 보스전 5%, 일반전 3%, 최소 1, 최대 999
  if (state.floor >= 3 && state.shards >= 20) {
    const leakRate = state.enemy.isBoss ? 0.05 : 0.03;
    const leakAmount = Math.min(999, Math.max(1, Math.floor(state.shards * leakRate)));
    state.shards = Math.max(0, state.shards - leakAmount);
    spawnShardLeak(leakAmount);
    showToast(`💸 공물 ${formatNumber(leakAmount)} 빼앗김`);
  }
  const prevUltimateHit = state.ultimate;
  const hitCharge = 12 * stats.chargeGain + (stats.hitChargeBonus || 0);
  state.ultimate = clamp(state.ultimate + hitCharge, 0, 100);
  if (prevUltimateHit < 100 && state.ultimate >= 100) {
    if (!state.firstUltimateSeen) {
      state.firstUltimateSeen = true;
      showUltimateFirstAlert();
    } else {
      showToast("✦ 궁극기 준비! 궁극기 버튼을 누르세요!");
      setDialogue("흐흥! 마침내 짐의 절초식을 쓸 때가 왔느니라! 궁극기 버튼을 눌러라!", "각성");
    }
  }
  playSfx("hit");
  showMissedPopup();
  // 피격 빨간 플래시 — stage-panel 에 hit-flash 클래스 토글
  el.stagePanel.classList.add("hit-flash");
  window.setTimeout(() => el.stagePanel.classList.remove("hit-flash"), 420);
  // 전화면 위협 비네트 한 번 깜박 + 강한 흔들림
  flashDangerVignette();
  shakeScreen(1.6);
  state.enemy.attackTimer = state.enemy.attackMax + (state.enemy.isBoss ? 2.2 : 1.65);
  const brokenStreak = state.rescueStreak || 0;
  state.rescueStreak = 0;
  if (brokenStreak >= 3) {
    window.setTimeout(() => {
      const streakPopup = document.createElement("div");
      streakPopup.className = "streak-break-popup";
      streakPopup.innerHTML = `<span class="sb-num">${brokenStreak}연속</span><span class="sb-label">끊김</span>`;
      el.stagePanel?.appendChild(streakPopup);
      window.setTimeout(() => streakPopup.remove(), 900);
    }, 120);
  }
  // 콤보 도박 — 미정산 베팅 강제 손실
  forfeitComboBet(brokenStreak);
  state.prep = Math.max(0, Math.floor((state.prep || 0) * 0.35));
  state.lastTimingGrade = "피격";
  setPose("hit", 0.9, "피격");
  showScene("hit", 0.72);
  triggerPulse("hit", 0.52);
  const hitTruths = [
    "실제: 마왕님이 맞음",
    "실제: 마왕님이 또 맞음",
    "실제: 보좌관이 막기 실패함",
    "실제: 타이밍을 놓쳤음",
  ];
  const hitClaims = [
    "발표: 방금 건 전략적 피격이니라!",
    "발표: 적의 힘을 시험해 본 것뿐이니라!",
    "발표: 짐은 아직 전혀 아프지 않느니라!",
    "발표: 일부러 맞아줌으로써 적을 방심시킨 것이니라!",
    "발표: 짐은 약점 따위 없느니라. 그냥 자비를 베푼 것뿐!",
    "발표: 짐의 체면은 여전히 완벽하니라!",
    "발표: 아픈 게 아니라 감동받은 것이니라!",
    "발표: 방금 건 짐이 연구 목적으로 맞아본 것이니라!",
    "발표: 적이 감히 짐을 건드리다니, 무례함에 기절한 것이니라!",
    "발표: 짐이 한 박자 쉬어준 것이니라. 자비니라!",
    "발표: 이건 전략적 체면 손실이니라. 나중에 갚겠느니라!",
  ];
  showCreditCut(
    "hit",
    randomPick(hitTruths),
    randomPick(hitClaims),
    1.45,
  );
  setDialogue(randomPick([
    "아, 아프지 않았다...! 방금 건 일부러 맞아준 것이니라!",
    "으으... 짐의 체면에는 흠집도 없느니라!",
    "방금 건 방심이 아니라 전략적 피격이니라!",
    "흑흑... 아, 아니다! 짐은 멀쩡하느니라!",
    "보좌관들아... 다음엔 좀 더 빨리 막아라. 아니, 짐이 일부러 두고 본 것이니라!",
    "이건 짐의 내구력 테스트였느니라. 결과: 아직도 위엄 있음!",
    "적이... 강하군. 아니, 짐이 봐준 것이니라. 확실히.",
    "으으... 체면이 조금 구겨졌느니라. '조금'이니라!",
  ]), "울먹임");
  spawnDamage(loss, false, "체면");
  spawnParticles(12);
  state.floorHitCount = (state.floorHitCount || 0) + 1;
  state.runHitTotal = (state.runHitTotal || 0) + 1;
  state._consecutivePerfect = 0;
  // 피격 후 분노 보너스 — 3초간 rage 상태
  state.rageTimer = 3.0;
  el.stagePanel.classList.add("rage-mode");
  const dignityAfterHit = state.dignity / stats.maxDignity;
  if (dignityAfterHit <= 0.15) {
    showToast("⚠️ 체면 위기! 지금 당장 막기로 기력 쌓고 다음 공격을 막으세요!");
    // 극한 위기 — 마왕이 절박하게 울부짖음
    window.setTimeout(() => {
      setDialogue(randomPick([
        "흑흑흑... 보, 보좌관들! 지금 당장 막아라!!! 짐이 부탁한다!!!",
        "이, 이건 아니다...!!! 보좌관아! 다음 공격만은 꼭 막아주거라! 명령이 아니라 간청이니라!!!",
        "으으으... 짐이 쓰러지면... 안 되는데...! 보좌관아! 막아라!!!",
      ]), "울먹임");
      state._idleDialogueTimer = 2.5;
    }, 700);
  } else if (dignityAfterHit <= 0.3) {
    showToast("체면이 위험해요! 막기로 기력 쌓고 다음 공격을 반드시 막으세요");
    window.setTimeout(() => {
      setDialogue(randomPick([
        "흑... 체면이 많이 깎였다. 보좌관들... 이번엔 꼭 막아주거라. 짐이 거의 다 왔다.",
        "으으... 살짝 위험하다! 보좌관아! 다음 공격은 반드시 막거라! 명령이니라!",
        "아직 괜찮다! 짐은! 그렇지만... 보좌관들아 조금만 더 힘내거라! 짐도 응원한다!",
      ]), "울먹임");
      state._idleDialogueTimer = 3.0;
    }, 700);
  } else {
    showToast("전략적 피격! 3초간 자동공격 +80% — 공물 강화 탭을 확인하세요");
  }
  // 첫 피격 시 타이밍 힌트 팝업
  if (!state.firstHitSeen && state.run <= 1) {
    state.firstHitSeen = true;
    window.setTimeout(() => {
      const hint = document.createElement("div");
      hint.className = "first-hit-hint";
      hint.innerHTML = `
        <strong>막기 타이밍을 놓쳤어요!</strong>
        <p>적이 <em>빨간색</em>으로 빛날 때 막기를 누르세요.<br/>미리 <strong>막기를 눌러 기력을 쌓으면</strong> 반격이 더 강해져요!</p>
        <span class="hint-close">알겠어요!</span>
      `;
      hint.querySelector(".hint-close").addEventListener("click", () => hint.remove());
      document.body.appendChild(hint);
      window.setTimeout(() => { if (hint.parentNode) hint.remove(); }, 5000);
    }, 800);
  }
  if (state.dignity <= 0) {
    // 패배 직전 극적 연출 — 0.6초 후 환생 모달
    showDefeatMoment();
    window.setTimeout(() => openReincarnate(true), 680);
  }
}

function defeatEnemy() {
  const defeatedBoss = state.enemy.isBoss;
  const defeatedElite = state.enemy.isElite;
  const enemyName = state.enemy?.name || "";
  const oldFloor = state.floor;
  const stats = getStats();

  el.stagePanel.classList.remove("elite-enemy");
  playSfx(defeatedBoss ? "bossDefeat" : "defeat");
  shakeScreen(defeatedBoss ? 3.6 : defeatedElite ? 2.4 : 1.5);
  spawnParticles(defeatedBoss ? 60 : defeatedElite ? 42 : 28);
  // 처치 임팩트: hitstop + 흰 플래시 + 폭발 ray (모든 처치)
  hitstop(defeatedBoss ? 220 : defeatedElite ? 160 : 110);
  spawnImpactFlash();
  spawnImpactRay();
  // 격투게임 KO 모먼트: 슬로우모션 + KO 도장 + 카메라 줌 (보스/엘리트만)
  if (defeatedBoss || defeatedElite) {
    triggerKoSlowmo(defeatedBoss);
    showKoStamp(defeatedBoss, enemyName);
    triggerCameraDefeat(defeatedBoss, defeatedElite);
  }
  // 폭발 파편 분사
  spawnDefeatShards(defeatedBoss ? 18 : defeatedElite ? 12 : 8);
  // 적 이미지 처치 연출 — boss/elite/mob 별 다름
  if (el.arenaEnemy) {
    el.arenaEnemy.classList.remove("enemy-dying", "enemy-bloodied");
    el.arenaEnemy.classList.add(defeatedBoss ? "enemy-defeated-boss" : defeatedElite ? "enemy-defeated-elite" : "enemy-defeated");
    window.setTimeout(() => {
      el.arenaEnemy.classList.remove("enemy-defeated", "enemy-defeated-elite", "enemy-defeated-boss");
    }, 600);
  }
  setPose("counter", defeatedBoss ? 1.8 : 1.1, defeatedBoss ? "보스 격파" : "우쭐");
  const bossDefeatLines = oldFloor >= 25
    ? [
        "...짐이 마왕이 되려고 이 길을 선택했던 것 같다. 이제야 확실히 알겠느니라.",
        "신화가 된다는 건 이런 것이구나. 무섭지 않다. 짐은 처음부터 여기 속한 존재니라.",
        "30층... 거의 다 왔느니라. 이 여정이 끝나도, 짐은 달라진 것 같다. 아니, 원래의 짐이 된 것이니라.",
      ]
    : oldFloor >= 20
    ? [
        "흐... 20층을 넘었구나. 보좌관들아 — 아니, 오늘만큼은 수고했다고 해주마.",
        "전설 구간을 넘어섰느니라. 짐도... 조금은 전설이 되어가는 것 같다. 말하지 마라.",
      ]
    : oldFloor >= 15
    ? [
        "흐흥! 이 정도면 짐이 진짜 마왕 자격이 있는 건 아닐까... 아니, 원래부터 있었느니라!",
        "보좌관들아, 수고했다. 공은... 반반이니라. (결코 전부 짐의 것은 아니다, 조금은.)",
      ]
    : oldFloor >= 10
    ? [
        "이 정도 보스쯤은 짐의 아침 운동 수준이니라! (손이 조금 떨리는 건 기분 탓이니라)",
        "보았느냐! 10층 보스! 짐은... 사실 이길 수 있을지 반신반의했느니라. 말하지 마라.",
      ]
    : [
        "보았느냐! 계획대로니라. 보좌관들이 열심히 한... 아니, 짐이 전략적으로 지시했느니라!",
        "첫 보스! 흐흥, 짐은 처음부터 알고 있었느니라. (떨렸던 건 비밀이니라)",
      ];
  const mobDefeatLines = oldFloor >= 25
    ? [
        "신화 구간의 적도 짐 앞엔 결국 같으니라.",
        "짐은 이제 두렵지 않다. 아니... 원래부터 두렵지 않았느니라.",
      ]
    : oldFloor >= 20
    ? [
        "전설의 마왕성에 도전한 것까지는 훌륭하다. 하지만 짐이 있는 한 무너지지 않느니라.",
        "또 하나. 짐은 이미 이 구간이 익숙해졌느니라. 두려움이 익숙함으로 바뀐 것 같다.",
      ]
    : oldFloor >= 10
    ? [
        "흐흥, 이 구간쯤 되니 적도 점점 강해지는군. 짐도... 그에 맞게 성장하고 있는 것이니라.",
        "짐의 위엄이 점점 알려지고 있다. 보좌관 덕분이... 아니, 짐의 명성 때문이니라.",
      ]
    : [
        "흐흥, 또 하나가 쓰러졌느니라. 보좌관들이 잘... 아니, 짐의 전략이 통한 것이니라.",
        "짐의 명령 한 마디면 충분하니라. (실제로는 여러 마디였지만 그건 디테일이니라)",
      ];
  const eliteDefeatLines = [
    "정예라고? 짐 앞에선 다 거기서 거기니라. 보좌관들이 처리했지만... 짐의 명령이 있었느니라!",
    "흐흥! 엘리트가 쓰러졌다! 역시 보좌관들이... 아니, 짐의 전략이 완벽했던 것이니라!",
    "정예 적도 짐의 마왕성엔 어울리지 않느니라. 처리 완료. 공은 짐에게로.",
  ];
  setDialogue(defeatedBoss ? randomPick(bossDefeatLines) : (defeatedElite ? randomPick(eliteDefeatLines) : randomPick(mobDefeatLines)), "허세");

  // 보스 처치 후 챕터 엔딩 독백 — 마왕의 성장을 짧게 드러냄
  if (defeatedBoss) {
    const chapterMonologues = {
      5:  { text: "...5층까지 왔구나. 여기까지가 짐의 한계라고 생각했던 때가 있었느니라. 하지만 짐은 아직 멈추지 않았다.", mood: "울먹임" },
      10: { text: "10층. 여기서 많은 마왕들이 포기했다고 한다. 짐은... 포기가 무엇인지 아직 모르겠느니라.", mood: "결심" },
      15: { text: "15층. 짐이 진짜 마왕이 될 수 있을지 처음으로 믿어지기 시작한 층이니라. 보좌관들아, 잘 들어라. 수고했다.", mood: "각성" },
      20: { text: "20층. 짐은 변했느니라. 처음엔 허세만 가득했는데... 지금은 조금 달라진 것 같다. 조금 더 마왕답게.", mood: "각성" },
      25: { text: "25층... 마지막 5층만 남았느니라. 짐이 여기까지 온 건... 혼자가 아니었기 때문이니라. 말하지 마라.", mood: "각성" },
      30: { text: "30층 돌파. 짐이... 해냈느니라. 이 여정에서 짐은 진짜 파멸의 군주가 되었다. 보좌관들이여, 수고했다.", mood: "각성" },
    };
    const monologue = chapterMonologues[oldFloor];
    if (monologue) {
      window.setTimeout(() => {
        setDialogue(monologue.text, monologue.mood);
      }, 2800);
    }
  }

  showFloorClearBanner(oldFloor, defeatedBoss);
  const totalKills = (state.runInterceptTotal || 0) + (state.runHitTotal || 0) + (state.floor || 1);
  const mobCreditDur = (!defeatedBoss && totalKills <= 5) ? 1.7 : 1.1;
  const mobTruths = [
    "실제: 자동 공격으로 처치",
    "실제: 보좌관들이 조용히 처리함",
    "실제: 부하들이 다 했음",
    "실제: 마왕님은 구경만 함",
    "실제: 꼬물 부하들의 집단 공격",
    "실제: 보좌관이 기습을 성공시킴",
    "실제: 보좌관이 몰래 해치움",
    "실제: 마왕님은 턱 괴고 앉아 있었음",
    "실제: 피격 중 보좌관이 역전시킴",
    "실제: 보좌관이 짐의 명령 전에 처리함",
  ];
  const mobClaims = [
    "발표: 짐의 명령 한 마디로 쓰러졌다!",
    "발표: 짐의 위엄에 압도돼 스스로 쓰러졌다!",
    "발표: 짐이 원래부터 계획한 것이니라!",
    "발표: 짐의 기운이 적을 녹였느니라!",
    "발표: 짐의 전략이 완벽하게 통했느니라!",
    "발표: 짐이 한 눈짓에 쓰러뜨렸느니라!",
    "발표: 마왕의 아우라가 발동됐느니라!",
    "발표: 짐이 원래 이렇게 강하니라!",
    "발표: 짐의 카리스마가 적을 녹였느니라!",
    "발표: 짐이 눈을 감고도 할 수 있느니라!",
  ];
  const bossTruths = [
    "실제: 보좌관들이 처치함",
    "실제: 보좌관 팀워크로 격파",
    "실제: 보좌관이 마지막 일격을 가함",
    "실제: 보좌관들이 혼신의 힘을 다함",
  ];
  const bossClaims = [
    "발표: 짐의 압도적 위엄으로 격파!",
    "발표: 짐이 진두지휘한 결과니라!",
    "발표: 짐의 절초식이 통했느니라!",
    "발표: 짐이 계획한 대로 완벽한 격파!",
  ];
  if (defeatedBoss) {
    showCreditCut(
      "streak",
      randomPick(bossTruths),
      randomPick(bossClaims),
      1.8,
    );
  }

  // 층 클리어 시 현재 전투력 토스트 — "나는 강해지고 있다" 피드백
  const dpsNow = Math.round(stats.autoDamage * stats.autoSpeed * stats.autoTempo);
  const counterNow = Math.round(stats.counterDamage);
  if (!defeatedBoss && oldFloor % 5 === 0 && oldFloor >= 5) {
    // 초반 전투력 스냅샷 저장 (1판 3층 기준)
    if (!state._baseDps && state.run <= 1 && oldFloor === 3) {
      state._baseDps = dpsNow;
      state._baseCounter = counterNow;
    }
    const growthLine = state._baseDps && dpsNow > state._baseDps
      ? ` (시작 대비 x${(dpsNow / state._baseDps).toFixed(1)})`
      : "";
    window.setTimeout(() => showToast(`전투력 — 자동 ${formatNumber(dpsNow)}/s · 반격 ${formatNumber(counterNow)}${growthLine}`), 250);
  }

  // 구간 돌입 시 분위기 전환 알림
  const tierMessages = {
    6:  ["어둠이 짙어집니다. 적들이 더 사나워집니다!", "6층부터는 본격 구간 — 조금 긴장되는 건 기분 탓입니다."],
    11: ["냉기 구간 돌입! 엘리트 적이 등장합니다!", "11층 — 마왕님도 처음엔 무섭다고 인정하셨습니다. (비공개)"],
    16: ["심연 구간! 진짜 시험이 시작됩니다. 집중하세요.", "16층 — 여기서 포기한 마왕이 많습니다. 당신은 다릅니다!"],
    21: ["전설 구간 진입! 역대 마왕들도 쓰러진 곳입니다.", "21층 — 이제 전설이 될 차례입니다. 마왕님 화이팅!"],
    26: ["신화의 영역! 30층까지 단 5층만 남았습니다!", "26층 — 끝이 보입니다. 마왕님의 여정이 완성됩니다!"],
  };
  if (tierMessages[state.floor]) {
    window.setTimeout(() => {
      showToast(randomPick(tierMessages[state.floor]));
      flashScreen("gold", 0.3);
      const tierDialoguesPool = {
        6: [
          { text: "흐, 흠. 이제 좀 재밌어지는군. 짐은 아직... 여유로운 것이니라.", mood: "허세" },
          { text: "6층부터 본격적이라고? 그래도 짐이 두려워하지 않는다는 건 변하지 않느니라. (조금은 무섭다)", mood: "울먹임" },
        ],
        11: [
          { text: "냉기가... 흠. 짐은 추위를 두려워하지 않느니라. 절대로. (보좌관들아, 외투 좀...)", mood: "울먹임" },
          { text: "11층. 짐도 사실 이 구간이 쉽지 않다는 걸 안다. 하지만 마왕은 포기하지 않느니라!", mood: "결심" },
        ],
        16: [
          { text: "...이건, 솔직히 강하다. 그래도 짐이 여기까지 온 이유가 있느니라. 포기란 없다!", mood: "결심" },
          { text: "심연의 기운... 짐이 마왕이 맞는 걸까. 아니, 지금 이 자리에 서 있다는 게 그 증거니라!", mood: "각성" },
        ],
        21: [
          { text: "전설의 구간에 짐이 서 있다. 여기 오는 동안... 많은 것을 배웠느니라. 보좌관들에게도.", mood: "각성" },
          { text: "역대 마왕들도 쓰러진 곳. 짐은 다를 것이니라. 왜냐면... 짐은 이 여정을 기억하고 있기 때문이니라!", mood: "각성" },
        ],
        26: [
          { text: "신화의 영역. 짐이 이 곳에 서기까지... 보좌관들, 그리고 이 긴 싸움. 고맙다. 말하지 마라.", mood: "각성" },
          { text: "30층이 보인다. 짐은 처음과는 다른 마왕이 된 것 같다. 더 강하고... 더 솔직한 마왕이니라.", mood: "각성" },
        ],
      };
      const tierPool = tierDialoguesPool[state.floor];
      if (tierPool) {
        const picked = randomPick(tierPool);
        setDialogue(picked.text, picked.mood);
      }
    }, defeatedBoss ? 1200 : 500);
  }
  state.floor += 1;
  const prevBest = state.bestFloor;
  state.bestFloor = Math.max(state.bestFloor, state.floor);
  if (state.bestFloor > prevBest && state.run > 1) {
    window.setTimeout(() => {
      showToast(`신기록! ${state.bestFloor}F — 지난 판 최고보다 ${state.bestFloor - prevBest}층 앞섬`);
      // HUD 최고 기록 강조 펄스
      el.bestFloorText?.closest(".hud-stat")?.classList.add("record-pulse");
      window.setTimeout(() => el.bestFloorText?.closest(".hud-stat")?.classList.remove("record-pulse"), 1800);
    }, 400);
  }

  // 보스 처치 후 다음 목표 예고 — "다음 보스는 여기야" 당근 제시
  if (defeatedBoss && state.floor <= 30) {
    const nextBossFloorNum = Math.ceil(state.floor / 5) * 5;
    if (nextBossFloorNum <= 30) {
      const nextBossPreview = makeEnemyPreview(nextBossFloorNum);
      const floorsAway = nextBossFloorNum - state.floor;
      const bossRewardHints = {
        5:  "궁극기 파츠 파편 획득",
        10: "궁극기 파츠 파편 + 특성 보상",
        15: "희귀 파츠 파편 + 영구 성장",
        20: "전설 파츠 + 심연 특성",
        25: "신화 파츠 + 마왕 칭호 강화",
        30: "대단원! 전 파츠 + 최종 엔딩",
      };
      const rewardHint = bossRewardHints[nextBossFloorNum] || "파츠 파편 + 특성";
      const label = nextBossPreview ? nextBossPreview.name : `${nextBossFloorNum}F 보스`;
      // 첫 보스 처치 시 공유 배너와 겹치지 않도록 지연
      const teaserDelay = (!state.firstBossDefeated && oldFloor <= 5) ? 3500 : 2200;
      window.setTimeout(() => {
        showNextBossTeaser(nextBossFloorNum, label, floorsAway, rewardHint);
      }, teaserDelay);
    }
  }
  // 보스 카드 모디파이어: 약탈은 공물 x2/체면 -50%, 다른 카드는 영향 없음
  const bossRewardMod = defeatedBoss ? getBossModifier() : null;
  const dignityRewardMod = bossRewardMod ? bossRewardMod.dignityRewardMod : 1;
  const lootMod = bossRewardMod ? bossRewardMod.lootMod : 1;
  state.dignity = clamp(state.dignity + (defeatedBoss ? 18 * dignityRewardMod : 7), 0, stats.maxDignity);
  state.ultimate = clamp(state.ultimate + (defeatedBoss ? 24 : 9), 0, 100);
  gainTributes((defeatedBoss ? 18 : 6) * Math.max(1, oldFloor) * stats.rewardMult * lootMod, defeatedBoss ? "boss" : "defeat");
  if (stats.shardPerFloor) {
    state.shards += stats.shardPerFloor;
    showToast(`파편 수집가: 파편 +${stats.shardPerFloor}`);
  }

  // 2층 진입 시 사이드 패널 해금
  if (!state.sideUnlocked && state.floor >= 2) {
    state.sideUnlocked = true;
    const recUpgrade = getRecommendedRunUpgrade();
    const recDef = runUpgradeDefs.find(u => u.id === recUpgrade);
    const recHint = recDef ? ` 추천: ${recDef.name}` : "";
    showToast(`강화 패널 해금! 공물로 강화하세요.${recHint}`);
    const bottomPanels2 = document.querySelector(".bottom-panels");
    if (bottomPanels2) {
      bottomPanels2.classList.add("side-unlocking");
      window.setTimeout(() => bottomPanels2.classList.remove("side-unlocking"), 1200);
    }
    window.setTimeout(() => {
      switchTab("upgrade");
      // 추천 강화 카드 spotlight — 어디를 눌러야 하는지 명확히
      window.setTimeout(() => {
        const recBtn = el.runUpgradeGrid?.querySelector(".run-upgrade.recommended");
        if (recBtn) {
          recBtn.classList.add("first-unlock-spotlight");
          window.setTimeout(() => recBtn.classList.remove("first-unlock-spotlight"), 3500);
        }
      }, 300);
    }, 500);
  }

  const delay = defeatedBoss ? 600 : 320;

  // 층 전환 스와이프 효과
  const swipe = document.createElement("div");
  swipe.className = defeatedBoss ? "floor-swipe boss-swipe" : "floor-swipe";
  document.body.appendChild(swipe);
  window.setTimeout(() => swipe.remove(), 480);

  // 클리어 등급 계산
  const interceptRate = state.floorInterceptCount > 0
    ? state.floorInterceptCount / Math.max(1, state.floorInterceptCount + state.floorHitCount)
    : 0;
  const perfects = state.floorPerfectCount;
  let clearGrade = "C";
  if (interceptRate >= 1 && perfects >= 2) clearGrade = "S";
  else if (interceptRate >= 0.85 && perfects >= 1) clearGrade = "A";
  else if (interceptRate >= 0.6) clearGrade = "B";
  const gradeColors = { S: "#ffe566", A: "#f09abb", B: "#86d8c7", C: "#b9dcff" };
  window.setTimeout(() => showClearGrade(clearGrade, gradeColors[clearGrade], interceptRate, state.floorInterceptCount), 80);
  // ① 층 클리어 "NF 돌파!" 연출
  if (!defeatedBoss) {
    window.setTimeout(() => showFloorClearBurst(state.floor - 1), 160);
  }

  // 층 카운터 리셋
  state.floorInterceptCount = 0;
  state.floorPerfectCount = 0;
  state.floorHitCount = 0;

  // 다음 층 이벤트 롤
  state.floorEvent = rollFloorEvent(state.floor);
  if (state.floorEvent) {
    window.setTimeout(() => {
      showFloorEventBanner(state.floorEvent);
    }, defeatedBoss ? 2800 : 600);
  }

  // 첫 판 첫 번째 적 처치
  if (!state.firstFloorCleared && !defeatedBoss && state.floor >= 2 && state.run <= 1) {
    state.firstFloorCleared = true;
    const usedBlock = state.firstBlockSeen;
    window.setTimeout(() => {
      spawnParticles(48);
      if (usedBlock) {
        setDialogue("보았느냐! 짐의 보좌관이... 아니, 짐의 위엄이 이겼다! 막기를 쓰면 반격이 강해지니라!", "허세");
      } else {
        setDialogue("흠... 자동으로 이겼지만 — 기력을 쌓고 막기를 쓰면 훨씬 강한 반격이 나가느니라!", "명령");
        window.setTimeout(() => showToast("💡 탭해서 기력 충전 → 빨간불에 막기 = 강력한 반격!"), 600);
      }
    }, delay + 100);
  }
  // 다음 층 적 예고 오버레이 — 층 전환 직전 0.8초
  {
    const previewEnemy = makeEnemyPreview(state.floor);
    if (previewEnemy) {
      const preview = document.createElement("div");
      preview.className = "next-enemy-preview";
      const isBossNext = state.floor % 5 === 0;
      preview.innerHTML = `<span class="nep-label">${isBossNext ? "⚠ 보스 등장!" : "다음"}</span><strong class="nep-name">${previewEnemy.name}</strong><span class="nep-intent">${previewEnemy.intent}</span>`;
      el.stagePanel?.appendChild(preview);
      window.setTimeout(() => preview.remove(), defeatedBoss ? 900 : 700);
    }
  }
  state.paused = true;
  window.setTimeout(() => {
    state.enemy = makeEnemy(state.floor);
    _lastEnemyFloor = state.floor;
    state.paused = false;
    // 새 적 등장 슬라이드인
    if (el.arenaEnemy) {
      el.arenaEnemy.src = state.enemy.image;
      el.arenaEnemy.classList.remove("enemy-defeated", "enemy-defeated-elite", "enemy-defeated-boss", "enemy-dying", "enemy-bloodied");
      el.arenaEnemy.classList.add("enemy-enter");
      window.setTimeout(() => el.arenaEnemy.classList.remove("enemy-enter"), 420);
    }
    // 적 이름도 팝인
    if (el.enemyName) {
      el.enemyName.classList.remove("enemy-name-pop");
      void el.enemyName.offsetWidth;
      el.enemyName.classList.add("enemy-name-pop");
      window.setTimeout(() => el.enemyName.classList.remove("enemy-name-pop"), 500);
    }

    // 보스층 진입 시 소울라이크 타이틀 표시
    if (state.enemy.isBoss) {
      const bossName = state.enemy.name;
      const bossIntent = state.enemy.intent;
      shakeScreen(1.5);
      spawnParticles(24);
      const bossFloorLines = state.floor >= 25
        ? ["전설급 보스가 마왕님을 기다리고 있습니다. 짐은... 짐은 준비됐느니라!"]
        : state.floor >= 15
        ? ["강력한 보스입니다. 기력 70%와 궁극기를 아껴두었나요?", "이 보스, 짐도 처음 보는 놈이니라. 하지만 두렵지 않으니라! (조금)"]
        : state.floor >= 10
        ? ["10층 이상 보스는 다릅니다. 브레이크 게이지를 노리세요!", "짐이 이 보스를 처치하면 전설이 시작될 것이니라!"]
        : ["저, 저기... 보스가 나타났습니다! 짐은 당연히 알고 있었느니라!", "흐, 흠. 보스라고 해도 짐의 위엄 앞엔 소용없느니라."];
      window.setTimeout(() => {
        setDialogue(randomPick(bossFloorLines), "긴장");
        // 보스 선전포고 대사
        const bossTaunt = state.enemy?.taunt;
        if (bossTaunt && el.enemyIntentText) {
          const tauntLine = randomPick(bossTaunt);
          el.enemyIntentText.textContent = tauntLine;
          el.enemyIntentBadge?.classList.add("boss-taunt-flash");
          window.setTimeout(() => {
            el.enemyIntentBadge?.classList.remove("boss-taunt-flash");
            el.enemyIntentText.textContent = bossIntent;
          }, 2200);
        }
        // boss-intro-banner(8800)는 0~2050ms 표시, boss-title-overlay(9990)는 분리해서 후속 등장
        // 두 풀스크린이 겹치지 않게 1900ms 지연 → intro-banner fade-out과 자연스럽게 교대
        window.setTimeout(() => {
          showBossTitleOverlay(bossName, bossIntent, state.enemy?.image);
        }, 1900);
        // 보스 등장 시 강화 탭으로 자동 전환 후 2.5초 뒤 원래대로
        if (state.sideUnlocked) {
          switchTab("upgrade");
          window.setTimeout(() => switchTab("upgrade"), 2500);
        }
      }, 180);
      // 브레이크 게이지 첫 등장 설명 (최초 1회)
      if (!state.breakTutorialSeen) {
        state.breakTutorialSeen = true;
        window.setTimeout(() => {
          showToast("💥 브레이크: 보스 막기 3회 성공 시 폭발! → 체면+16, 궁극기+22%, 보스 HP -18%");
          window.setTimeout(() => showToast("기력 70% 이상에서 막으면 브레이크 속도 2배!"), 2200);
        }, 1400);
      }
    } else {
      // 잡몹 등장 시 이름 팝업 (보스 아닐 때)
      window.setTimeout(() => {
        showEnemyNameBadge(state.enemy.name, state.enemy.title);
        if (state.enemy.isElite) {
          shakeScreen(1.8);
          spawnParticles(18);
          flashScreen("red", 0.18);
          window.setTimeout(() => showToast(`⚔️ 엘리트 등장! ${state.enemy.name} — HP +45%, 피해 +30%`), 300);
          el.stagePanel.classList.add("elite-enemy");
        } else {
          el.stagePanel.classList.remove("elite-enemy");
        }
        // 새 적 종류 첫 만남 — 마왕 반응 대사
        const kind = state.enemy?.kind;
        if (kind && !state.seenEnemyKinds.includes(kind)) {
          state.seenEnemyKinds.push(kind);
          const firstMeetLines = {
            golem: [
              { mood: "울먹임", text: `저, 저게 골렘이냐...?! 짐은 무섭지 않다. 절대로! 보좌관들아 먼저 가거라!` },
              { mood: "허세", text: `흠! 골렘이구나. 짐이 원래 골렘 같은 건 손 하나로 처리하는데... 이번엔 보좌관들이 해봐라.` },
            ],
            dragon: [
              { mood: "울먹임", text: `으... 드, 드래곤이다!! 잔소리 잘 하겠지만... 짐은 더 잘하니라! 보좌관 나서라!` },
              { mood: "허세", text: `용?! 이건 좀 특별한 경험이구나. 물론 짐은 처음 봐도 두렵지 않으니라. (두렵다)` },
            ],
            fairy: [
              { mood: "위엄", text: `요정이 감히 짐에게 덤비다니! 귀엽지만... 보좌관아, 봐줄 것 없다. 처리해라.` },
              { mood: "허세", text: `오, 요정이구나. 짐은 원래 요정과는 친하다. 하지만 저건 적이니까 혼내줘야겠느니라!` },
            ],
          };
          const lines = firstMeetLines[kind];
          if (lines) {
            window.setTimeout(() => {
              const line = randomPick(lines);
              setDialogue(line.text, line.mood);
            }, 500);
          }
        }
      }, 150);
      // 높은 층에서 적들이 마왕을 알아보고 두려워하는 반응
      if (state.floor >= 20 && Math.random() < 0.45) {
        const fearLines = state.floor >= 28
          ? ["전설의 마왕님이 실존했다니...!", "30층까지 올라온 마왕... 우리는 살아남을 수 있나?"]
          : state.floor >= 20
          ? ["저... 저게 그 소문의 마왕님인가?!", "이 층까지 올라온 마왕이라고? 도망치자!!"]
          : [];
        if (fearLines.length) {
          window.setTimeout(() => showToast(`적: "${randomPick(fearLines)}"`), 600);
        }
      }
    }

    // 보스 직전 층(4F, 9F ...) 진입 예고 — 다음 보스 이름 미리 노출
    if (!state.enemy.isBoss && state.floor % 5 === 4) {
      const nextBossFloor = state.floor + 1;
      const expectedShards = Math.max(2, Math.round((nextBossFloor / 5) * 3 * stats.rewardMult));
      const nextBossData = bossPool[Math.floor((nextBossFloor * 1.7 + state.run) % bossPool.length)];
      const nextBossName = nextBossData?.name || "강력한 보스";
      window.setTimeout(() => {
        showToast(`⚠ 다음 층 보스: ${nextBossName}! 격파 시 파편 +${expectedShards}. 기력 70% 이상으로 준비하세요.`);
        // 궁극기 상태에 따른 전략 힌트 대사
        const ultPct = Math.round(state.ultimate || 0);
        const preBossDialogue = ultPct >= 100
          ? `궁극기가 꽉 찼느니라! ${nextBossName}에게 즉시 날릴 준비 완료! (보좌관이 만든 것이니라)`
          : ultPct >= 60
          ? `좋다. 이 층에서 궁극기(${ultPct}%)를 채우면 ${nextBossName}에게 첫 타로 퍼부을 수 있느니라!`
          : `흠, 궁극기가 ${ultPct}%밖에 안 됐구나. 보좌관들아, 이 층에서 기력을 채워 막기를 많이 해라!`;
        setDialogue(preBossDialogue, ultPct >= 100 ? "각성" : "긴장");
        // 다음 보스 이름 배너 잠깐 표시
        const bossTeaser = document.createElement("div");
        bossTeaser.className = "boss-teaser-banner";
        bossTeaser.innerHTML = `<span>다음 보스</span><strong>${nextBossName}</strong><em>${nextBossData?.intent || ""}</em>`;
        el.stagePanel.appendChild(bossTeaser);
        window.setTimeout(() => bossTeaser.remove(), 3200);
        // 보스 직전 — 강화 탭 자동 전환 (유저가 준비할 시간 확보)
        if (state.sideUnlocked) {
          window.setTimeout(() => switchTab("upgrade"), 600);
        }
      }, 400);
    }

    if (defeatedBoss) {
      const shardGain = Math.max(2, Math.round((oldFloor / 5) * 3 * stats.rewardMult));
      state.shards += shardGain;
      showToast(`보스 격파! 마왕의 파편 +${shardGain}`);
      // 파편 획득 팝업 강조
      window.setTimeout(() => {
        const shardBanner = document.createElement("div");
        shardBanner.className = "shard-gain-banner";
        shardBanner.innerHTML = `<span>마왕의 파편</span><strong>+${shardGain}</strong><em>환생 시 영구 강화에 사용!</em>`;
        el.stagePanel.appendChild(shardBanner);
        window.setTimeout(() => shardBanner.remove(), 2600);
      }, 600);
      // 첫 보스 처치 특별 연출
      if (!state.firstBossDefeated && oldFloor <= 5) {
        state.firstBossDefeated = true;
        spawnParticles(60);
        flashScreen("gold", 0.7);
        window.setTimeout(() => {
          setDialogue("흑흑... 짐이... 짐이 진짜 마왕인 건가?! 아니, 원래 알고 있었느니라!!", "각성");
        }, 300);
      }
      // 보스 처치 후 전황 보고서 (2초 지연)
      window.setTimeout(() => showBossReport(oldFloor, shardGain), 2000);
      // 30층 보스 처치 시 엔딩 시퀀스
      if (oldFloor >= 30 && !state.endingSeen) {
        state.endingSeen = true;
        window.setTimeout(() => showEndingSequence(state.run), 3500);
      }
      if (state.cutscenePlaying) state.pendingPartChoice = { reason: "보스 기억 조각", nextTraitReason: "보스 처치 보상" };
      else window.setTimeout(() => openPartChoice("보스 기억 조각", "보스 처치 보상"), 250);
    } else if (shouldOpenTraitReward(defeatedBoss)) {
      if (state.cutscenePlaying) state.queuedTraitChoice = "층수 돌파 보상";
      else window.setTimeout(() => openChoice("층수 돌파 보상"), 220);
    }
  }, delay);
}

function useUltimate() {
  if (state.paused || state.cutscenePlaying || state.ultimate < 100) return;
  playSfx("ultimate");
  ensureEnemy();
  const stats = getStats();
  const crisisBonus = state.enemy.attackTimer <= stats.timingWindow + 0.4 ? stats.crisisUltimate + 0.65 : 0;
  state.ultimate = 0;
  state.paused = true;
  state.cutscenePlaying = true;
  state._cutsceneSkippable = false;
  setPose("ultimate", 1.8, "궁극기");
  triggerPulse("counter", 0.8);
  setDialogue("흐흥, 짐이 원래 하려던 일이니라!", "각성");
  el.cutscene.classList.remove("hidden");

  const rawSlots = getEquippedPartIds().map((id) => partDefs[id]).filter(Boolean);
  // 파츠 없을 때 기본 컷씬 카드 사용
  const defaultPart = {
    role: "도입", name: "마왕의 위엄", attr: "",
    image: "assets/mainchar_proud_clean.png",
    caption: "흐흥, 짐이 원래 하려던 일이니라!",
  };
  const slots = rawSlots.length > 0 ? rawSlots : [defaultPart];
  let index = 0;
  const nextFrame = () => {
    const part = slots[index];
    el.cutsceneRole.textContent = part.role;
    el.cutsceneTitle.textContent = part.name;
    el.cutsceneCaption.textContent = part.caption;
    el.cutsceneCard.style.backgroundImage = `linear-gradient(180deg, rgba(44,25,48,0.08), rgba(44,25,48,0.88)), url("${part.image}")`;
    spawnParticles(22);
    index += 1;
    if (index < slots.length) window.setTimeout(nextFrame, 720);
    else window.setTimeout(() => {
      state._cutsceneSkippable = true;
      state._pendingCrisisBonus = crisisBonus;
      if (el.cutsceneSkipHint) el.cutsceneSkipHint.classList.remove("hidden");
      // 1800ms 후 자동 종료 (스킵 안 하면)
      state._cutsceneAutoResolve = window.setTimeout(() => {
        if (state._cutsceneSkippable) {
          state._cutsceneSkippable = false;
          if (el.cutsceneSkipHint) el.cutsceneSkipHint.classList.add("hidden");
          resolveUltimate(state._pendingCrisisBonus ?? 0);
        }
      }, 1800);
    }, 720);
  };
  nextFrame();
}

function skipCutsceneIfDone() {
  if (!state._cutsceneSkippable) return;
  state._cutsceneSkippable = false;
  if (el.cutsceneSkipHint) el.cutsceneSkipHint.classList.add("hidden");
  if (state._cutsceneAutoResolve) {
    clearTimeout(state._cutsceneAutoResolve);
    state._cutsceneAutoResolve = null;
  }
  resolveUltimate(state._pendingCrisisBonus ?? 0);
}

function resolveUltimate(crisisBonus) {
  const stats = getStats();
  // 결정타 풀스크린 컷인 — 흰 플래시 + 거대 "절초식!" 텍스트 + 강한 흔들림
  triggerUltimateFinisher();
  shakeScreen(4.2);
  hitstop(280);
  if (state.enemy) {
    const targetEnemy = state.enemy;
    const damage = state.enemy.maxHp * (0.42 + (0.28 + crisisBonus) * stats.ultimatePower) + stats.counterDamage * 3.2;
    dealEnemyDamage(damage, "ultimate");
    if (state.enemy === targetEnemy) {
      state.enemy.attackTimer = state.enemy.attackMax + (state.enemy.isBoss ? 2.4 : 1.4);
    }
    if (state.enemy === targetEnemy && state.enemy.isBoss) {
      state.enemy.breakGauge = clamp(state.enemy.breakGauge - 70 * stats.breakPower, 0, 100);
    }
  }
  // 궁극기 사용 후 creditCut — 핵심 유머: 보좌관들이 다 했는데 마왕이 자기 절초식이라고 함
  const ultimateTruths = [
    "실제: 보좌관들이 합동 필살기 시전",
    "실제: 평소에 갈고 닦은 보좌관들의 실력",
    "실제: 보좌관이 다 함. 마왕님은 포즈만",
    "실제: 보좌관이 3초 동안 목숨 걸고 처리",
  ];
  const ultimateClaims = [
    "발표: 짐의 절초식이 드디어 발동되었느니라!!",
    "발표: 짐이 원래 이 기술을 아꼈던 것이니라!",
    "발표: 이것이 바로 짐의 파멸 군주 비전이니라!!",
    "발표: 짐의 위엄이 폭발하는 순간이니라!!",
  ];
  showCreditCut("rescue", randomPick(ultimateTruths), randomPick(ultimateClaims), 2.0);
  el.cutscene.classList.add("hidden");
  state.cutscenePlaying = false;
  const pendingPart = state.pendingPartChoice;
  const queuedTrait = state.queuedTraitChoice;
  if (pendingPart) {
    state.pendingPartChoice = null;
    openPartChoice(pendingPart.reason, pendingPart.nextTraitReason);
  } else if (queuedTrait) {
    state.queuedTraitChoice = "";
    openChoice(queuedTrait);
  } else {
    state.paused = false;
  }
}

function pickTraits(count) {
  const bag = [...traitDefs];
  const picks = [];
  while (picks.length < count && bag.length) {
    const roll = Math.random();
    let rarity = "B";
    if (roll > 0.88) rarity = "S";
    else if (roll > 0.5) rarity = "A";
    const candidates = bag.filter((trait) => trait.rarity === rarity);
    const list = candidates.length ? candidates : bag;
    const chosen = list[Math.floor(Math.random() * list.length)];
    picks.push(chosen);
    bag.splice(bag.indexOf(chosen), 1);
  }
  return picks;
}

function openChoice(reason) {
  if (state.choiceOpen || state.partChoiceOpen || state.cutscenePlaying) return;
  state.choiceOpen = true;
  state.paused = true;
  // 현재 빌드 방향에 따른 안내 맞춤화
  const _tag = state.activeBuildTag || "";
  const _choiceHints = {
    "반격": "반격 빌드 유지 추천 — 타이밍 막기가 3배 강해집니다",
    "방치": "방치 빌드 추천 — 탭 없이도 자동공격이 강해집니다",
    "궁극기": "궁극기 빌드 — 자동은 느리지만 궁극기 한 방이 터집니다",
    "생존": "생존 빌드 — 맞아도 오히려 강해지는 빌드입니다",
    "치명": "치명타 빌드 — 랜덤하지만 터지면 엄청납니다",
    "보스": "보스 특화 — 다음 보스전에 확실히 강해집니다",
    "계승": "콤보 눈덩이 — 연속 막기를 유지할수록 폭발합니다",
  };
  const hintSuffix = _tag && _choiceHints[_tag] ? ` · ${_choiceHints[_tag]}` : " · 첫 선택이 빌드 방향을 결정합니다";
  el.choiceReason.textContent = `${reason}${hintSuffix}`;
  el.choiceGrid.innerHTML = "";
  const styleHints = {
    "방치": "👾 그냥 두면 됨 — 클릭 안 해도 강함",
    "속도": "⚡ 빠른 자동 — 클릭보다 방치에 집중",
    "생존": "🛡️ 맞아도 버팀 — 피격이 오히려 이득",
    "반격": "⚔️ 타이밍 빡빡 — 성공하면 3배 폭발",
    "치명": "🎲 도박 빌드 — 크리 터지면 대폭발, 평타는 약함",
    "보스": "💥 보스 특화 — 잡몹은 느려짐",
    "궁극기": "✦ 궁극기 빌드 — 자동 공격 멈춤, 궁극기로 올인",
    "계승": "♾️ 눈덩이 — 콤보 쌓을수록 보상 폭발",
  };
  const currentTag = state.activeBuildTag || "";
  const synergies = {
    "방치": ["방치", "속도"],
    "속도": ["속도", "방치"],
    "생존": ["생존", "반격"],
    "반격": ["반격", "생존", "치명"],
    "치명": ["치명", "반격"],
    "보스": ["보스"],
    "궁극기": ["궁극기"],
    "계승": ["계승"],
  };
  pickTraits(3).forEach((trait) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.rarity = trait.rarity;
    button.dataset.tag = trait.tag;
    const isCurrentBuild = currentTag && currentTag === trait.tag;
    const isSynergy = currentTag && !isCurrentBuild && (synergies[currentTag] || []).includes(trait.tag);
    const synergyBadge = isCurrentBuild
      ? `<span class="synergy-badge synergy-match">현재 빌드 강화</span>`
      : isSynergy ? `<span class="synergy-badge synergy-good">시너지 좋음</span>` : "";
    const statPreview = getTraitStatPreview(trait.id);
    const isFirstSeen = !(state.seenTraits || []).includes(trait.id);
    const firstSeenBadge = isFirstSeen ? `<span class="first-seen-badge">첫 발견!</span>` : "";
    button.innerHTML = `
      <img class="choice-icon" src="${trait.image}" alt="" />
      <span class="rarity-pill">${trait.rarity}급</span>
      ${synergyBadge}
      ${firstSeenBadge}
      <strong>${trait.name}</strong>
      <p>${trait.desc}</p>
      ${statPreview ? `<span class="trait-stat-preview">${statPreview}</span>` : ""}
      <em class="claim-line">${getTraitClaimLine(trait)}</em>
      <span class="card-tag">${trait.tag}</span>
      <span class="style-hint">${styleHints[trait.tag] || ""}</span>
    `;
    button.addEventListener("click", () => chooseTrait(trait.id));
    el.choiceGrid.appendChild(button);
  });
  // 카드 순차 등장 — 뽑기 기대감
  el.choiceGrid.querySelectorAll(".choice-card").forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(16px) scale(0.94)";
    window.setTimeout(() => {
      card.style.transition = "opacity 0.28s ease, transform 0.28s cubic-bezier(0.34,1.56,0.64,1)";
      card.style.opacity = "";
      card.style.transform = "";
    }, 80 + i * 120);
  });
  // 첫 3회 특성 선택에서 선택 힌트 카드 표시
  const traitChoiceCount = (state.seenTraits || []).length;
  if (traitChoiceCount <= 2) {
    const hint = document.createElement("div");
    hint.className = "trait-choice-hint";
    hint.innerHTML = currentTag
      ? `<strong>현재 빌드: ${currentTag}</strong> — "현재 빌드 강화" 또는 "시너지 좋음" 배지를 노리세요!`
      : `하나를 골라 마왕님을 강화하세요. 다음에 또 고를 기회가 있습니다!`;
    el.choiceGrid.appendChild(hint);
  }
  el.choiceModal.classList.remove("hidden");
}

function chooseTrait(id) {
  const trait = traitDefs.find((item) => item.id === id);
  if (!trait) return;
  const isFirstSeen = !(state.seenTraits || []).includes(id);
  state.traits.push(id);
  if (isFirstSeen) {
    state.seenTraits = [...(state.seenTraits || []), id];
    flashScreen("gold", 0.3);
    spawnParticles(24);
  }
  state.choiceOpen = false;
  state.paused = false;
  el.choiceModal.classList.add("hidden");
  setPose("proud", 1.1, "보상");
  setDialogue(isFirstSeen
    ? `오, 이게 바로 '${trait.name}'이란 것이니라! 짐이 처음 써보는구나.`
    : `${trait.name}? 흠, 짐에게 어울리는 힘이니라.`, "허세");
  showToast(isFirstSeen ? `✨ 첫 발견: ${trait.name} 장착!` : `${trait.name} 장착`);
  const tagCounts = {};
  state.traits.forEach(id => {
    const t = traitDefs.find(d => d.id === id);
    if (t) tagCounts[t.tag] = (tagCounts[t.tag] || 0) + 1;
  });
  state.activeBuildTag = Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || "";
  // 특성 선택 후 빌드 방향 요약 — "내가 뭘 만들고 있는지" 즉시 피드백
  const buildSummaries = {
    "방치": "방치 빌드 — 탭 안 해도 적이 녹아요",
    "속도": "속도 빌드 — 자동 공격이 빠르게 쌓여요",
    "생존": "생존 빌드 — 맞아도 버티고 회복해요",
    "반격": "반격 빌드 — 타이밍 맞추면 3배 폭발!",
    "치명": "치명타 빌드 — 크리 터지면 대폭발이에요",
    "보스": "보스 특화 — 보스전에서 피해 2배!",
    "궁극기": "궁극기 빌드 — 궁극기로 올인!",
    "계승": "눈덩이 빌드 — 층 쌓을수록 보상 폭발",
  };
  if (state.activeBuildTag && state.traits.length >= 2) {
    const summary = buildSummaries[state.activeBuildTag];
    if (summary) window.setTimeout(() => showToast(`빌드 방향: ${summary}`), 600);
  }
  render();
}

function pickParts(count) {
  return Object.values(partDefs)
    .map((part) => {
      const level = getPartLevel(part.id);
      return { part, score: Math.random() + (level === 0 ? 1.6 : 0) + 1 / (level + 1) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.part);
}

function getPartEffectPreview(partId, existingLevel) {
  const part = partDefs[partId];
  if (!part) return "";
  const scale = 1 + existingLevel * 0.5;
  const effects = part.effect;
  const labels = {
    guard: "막기 보너스",
    dignity: "체면 회복",
    charge: "궁극기 충전",
    assist: "공물 바치기",
    timing: "타이밍 윈도우",
    ultimate: "궁극기 위력",
    break: "브레이크 속도",
    boss: "보스 피해",
    crit: "치명타 확률",
    reward: "보상 배율",
  };
  const parts = Object.entries(effects)
    .map(([key, val]) => {
      const pct = Math.round(val * scale * 100);
      return `${labels[key] || key} +${pct}%`;
    })
    .slice(0, 2);
  return parts.join(" · ");
}

function openPartChoice(reason, nextTraitReason = "") {
  if (state.partChoiceOpen || state.cutscenePlaying) return;
  state.partChoiceOpen = true;
  state.paused = true;
  state.pendingTraitChoice = nextTraitReason;
  el.partReason.textContent = `${reason}: 새 컷을 얻거나 기존 컷을 강화합니다.`;
  el.partGrid.innerHTML = "";
  const currentPartIds = getEquippedPartIds();
  const currentAttrs = new Set(currentPartIds.map(id => partDefs[id]?.attr).filter(Boolean));
  pickParts(3).forEach((part) => {
    const level = getPartLevel(part.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card";
    button.dataset.rarity = level === 0 ? "S" : level >= 2 ? "A" : "B";
    const alreadyEquipped = currentPartIds.includes(part.id);
    const hasAttrSynergy = !alreadyEquipped && currentAttrs.has(part.attr);
    const partSynergyBadge = alreadyEquipped
      ? `<span class="synergy-badge synergy-match">업그레이드</span>`
      : hasAttrSynergy ? `<span class="synergy-badge synergy-good">${part.attr} 시너지</span>` : "";
    const effectPreview = getPartEffectPreview(part.id, level);
    button.innerHTML = `
      <img class="choice-icon" src="${part.image}" alt="" />
      <span class="rarity-pill">${level === 0 ? "NEW" : `Lv.${level + 1}`}</span>
      ${partSynergyBadge}
      <strong>${part.name}</strong>
      <p>${part.desc}</p>
      ${effectPreview ? `<span class="trait-stat-preview">${effectPreview}</span>` : ""}
      <em class="claim-line">${part.caption}</em>
      <span class="card-tag">${part.role} · ${part.attr}</span>
    `;
    button.addEventListener("click", () => choosePart(part.id));
    el.partGrid.appendChild(button);
  });
  el.partModal.classList.remove("hidden");
}

function choosePart(id) {
  const part = partDefs[id];
  if (!part) return;
  if (!state.ownedParts) state.ownedParts = {};
  if (!state.partLevels) state.partLevels = {};
  const beforeLevel = getPartLevel(id);
  state.ownedParts[id] = true;
  state.partLevels[id] = beforeLevel + 1;
  const slotIndex = partSlotDefs.findIndex((slot) => slot.key === part.roleKey);
  if (slotIndex >= 0) {
    state.slots = normalizeSlots(state.slots);
    state.slots[slotIndex] = id;
  }
  state.partChoiceOpen = false;
  el.partModal.classList.add("hidden");
  showToast(beforeLevel === 0 ? `${part.name} 획득` : `${part.name} Lv.${beforeLevel + 1}`);
  const nextReason = state.pendingTraitChoice;
  state.pendingTraitChoice = "";
  if (nextReason) window.setTimeout(() => openChoice(nextReason), 120);
  else state.paused = false;
  render();
}

function getReincarnateTeaser() {
  const best = state.bestFloor;
  const intercepts = state.runInterceptTotal || 0;
  const perfects = state.runPerfectTotal || 0;
  const hits = state.runHitTotal || 0;
  const streak = state.bestRescueStreak || 0;
  const ult = Math.round(state.ultimate || 0);
  const floor = state.floor || 1;
  const totalActs = intercepts + hits;

  // 개인화된 아쉬움 기반 티저 — 이번 판 데이터로 구체적인 다음 목표 제시
  if (intercepts === 0 && totalActs > 0) {
    return `💡 다음 판: 빨간불에 막기를 한 번만 성공하면 반격이 3배 세져요!`;
  }
  if (hits > intercepts && totalActs >= 3) {
    return `⚡ 막기 성공률 ${Math.round(intercepts / totalActs * 100)}% — 다음 판엔 좀 더 빨리 막으면 훨씬 멀리 갈 수 있어요!`;
  }
  if (perfects === 0 && intercepts >= 2) {
    return `✨ 다음 판 도전: 빨간불 직전에 막으면 PERFECT! 반격 2배 + 공물 보너스`;
  }
  if (ult >= 60 && ult < 100) {
    return `⚡ 궁극기 ${ult}% 남긴 채로 끝났어요. 다음엔 먼저 궁극기를 써보세요!`;
  }
  if (streak >= 5) {
    return `🔥 ${streak}연속 달성! 다음 판에서 이 기록을 깨보세요`;
  }
  if (streak === 0 && intercepts >= 1) {
    return `🔗 연속 막기를 이어가면 콤보 배율이 올라가 공물이 폭발해요!`;
  }
  // 층수 기반 폴백
  if (best < 5) return `🔓 5F 보스를 처치하면 궁극기 영상 파츠 선택 해금`;
  if (best < 10) return `🔓 10F 돌파 시 마왕님 칭호 "성장하는 마왕" 달성 가능`;
  if (best < 15) return `🔓 15F 이상이면 "공포의 마왕" 칭호 해금`;
  if (best < 30) return `🔓 30F 달성 시 전설급 칭호 "전설의 파멸군주" 해금`;
  return `🏆 모든 칭호 달성! 계속 기록을 갱신하세요`;
}

function calculateRunScore() {
  const totalActions = (state.runInterceptTotal || 0) + (state.runHitTotal || 0);
  const interceptRate = totalActions > 0 ? (state.runInterceptTotal || 0) / totalActions : 0;
  const perfectBonus = 1 + Math.min(1.5, (state.runPerfectTotal || 0) * 0.06);
  const streakBonus = 1 + Math.min(0.8, (state.bestRescueStreak || 0) * 0.04);
  const floorScore = state.floor * 100;
  return Math.round(floorScore * interceptRate * perfectBonus * streakBonus);
}

function openReincarnate(forced = false) {
  state.paused = true;
  const gain = calculateReincarnateGain();
  if (forced && !state.reincarnateRewardClaimed) {
    state.shards += gain;
    state.reincarnateRewardClaimed = true;
  }
  // 첫 강제 패배 시 첫 영구 강화를 경험하게 보너스 파편 증정 (1회)
  const isFirstForcedDeath = forced && state.run <= 1 && !state._firstDeathBonus;
  if (isFirstForcedDeath && state.shards < 7) {
    const bonus = 7 - state.shards;
    state.shards += bonus;
    state._firstDeathBonus = true;
    window.setTimeout(() => {
      showToast(`💠 첫 도전 기념! 파편 +${bonus}개 — 영구 강화를 체험해보세요!`);
    }, 800);
  }
  const carry = getCarryTraitId();
  const carryName = traitDefs.find((trait) => trait.id === carry)?.name;
  const teaser = getReincarnateTeaser();
  const carryLine = carryName ? `<span class="reinc-carry">계승 특성: ${carryName}</span>` : "";
  const floorRecord = state.floor > 1 ? ` · 이번 판 ${state.floor}F 도달` : "";
  const bestRecord = state.bestFloor > 1 ? ` · 역대 최고 ${state.bestFloor}F` : "";
  const recordLine = `<span class="reinc-record">${floorRecord}${bestRecord}</span>`;
  const totalShards = forced ? state.shards : state.shards + gain;
  const affordableUpgrade = upgradeDefs.find(u => {
    const level = state.permanent[u.id] || 0;
    const cost = Math.round(u.baseCost * Math.pow(1.42, level));
    return totalShards >= cost;
  });
  const shardHint = affordableUpgrade
    ? `<div class="reinc-shard-hint buyable">파편 ${totalShards}개 → <strong>${affordableUpgrade.name}</strong> 구매 가능!</div>`
    : totalShards === 0
    ? `<div class="reinc-shard-hint">보스를 처치하면 파편을 얻습니다. 다음 판에 도전!</div>`
    : `<div class="reinc-shard-hint">파편 ${totalShards}개 — 조금 더 모으면 영구 강화 가능!</div>`;
  // 다음 판 예상 전투력 (영구 업그레이드 기준으로 1층에서 기본 스탯 시뮬)
  const curDps = Math.round(getStats().autoDamage * getStats().autoSpeed);
  const curCounter = Math.round(getStats().counterDamage);
  const nextPowerLine = `<div class="reinc-power-preview">다음 판 시작 — 자동 <strong>${formatNumber(curDps)}/s</strong> · 반격 <strong>${formatNumber(curCounter)}</strong>${carryName ? ` · ${carryName} 계승` : ""}</div>`;
  // 이번 판 점수 계산
  const runScore = calculateRunScore();
  const prevBestScore = state.permanent.bestRunScore || 0;
  const isNewRecord = runScore > prevBestScore && runScore > 0;
  if (isNewRecord) state.permanent.bestRunScore = runScore;
  // 이번 판 베스트 플레이 요약
  const totalActions = (state.runInterceptTotal || 0) + (state.runHitTotal || 0);
  const interceptRate = totalActions > 0 ? Math.round((state.runInterceptTotal || 0) / totalActions * 100) : 0;
  const runGrade = (state.runPerfectTotal || 0) >= 5 && interceptRate >= 90 ? "S"
    : (state.runPerfectTotal || 0) >= 2 && interceptRate >= 70 ? "A"
    : interceptRate >= 50 ? "B" : "C";
  const gradeColors = { S: "#ffe566", A: "#f09abb", B: "#86d8c7", C: "#b9dcff" };
  const scoreLabel = isNewRecord
    ? `<span class="reinc-score new-record">🏆 신기록 ${runScore.toLocaleString()}점!</span>`
    : runScore > 0
      ? `<span class="reinc-score">이번 판 ${runScore.toLocaleString()}점 <em>(최고 ${prevBestScore.toLocaleString()})</em></span>`
      : "";
  const runSummaryLine = totalActions > 0
    ? `<div class="reinc-run-summary">
        <span class="reinc-run-grade" style="color:${gradeColors[runGrade]}">${runGrade}</span>
        <span>막기 <strong>${state.runInterceptTotal || 0}</strong>회</span>
        <span>PERFECT <strong>${state.runPerfectTotal || 0}</strong>회</span>
        <span>피격 <strong>${state.runHitTotal || 0}</strong>회</span>
        <span>최고 연속 <strong>${state.bestRescueStreak || 0}</strong>회</span>
        ${scoreLabel}
      </div>`
    : "";
  const gradeEmoji = { S: "🌟", A: "⭐", B: "✨", C: "💫" };
  const reachedFloor = state.floor - 1;
  const boastLine = reachedFloor >= 25
    ? `"짐은 전설이니라. 30층도 문제없다." (보좌관들이 다 함)`
    : reachedFloor >= 15
    ? `"이 정도는 짐에게 식은 죽이니라!" (보좌관 3명 쓰러짐)`
    : reachedFloor >= 5
    ? `"짐의 위엄으로 보스를 물리쳤느니라!" (실제: 보좌관이 막음)`
    : forced
    ? `"이, 이건 전략적 후퇴니라! (체면 0%로 떨어짐)"`
    : `"짐이 원래 이 정도는 껌이니라!" (1층에서 환생)`;
  const shareText = [
    `👑 귀염뽀짝 파멸의 군주`,
    `${reachedFloor}층 도달 · ${runGrade}등급 ${gradeEmoji[runGrade] || ""}`,
    boastLine,
    `막기 ${state.runInterceptTotal || 0}회 · PERFECT ${state.runPerfectTotal || 0}회 · 피격 ${state.runHitTotal || 0}회`,
    runScore > 0 ? `${runScore.toLocaleString()}점` : "",
    `▶ https://criel2019.github.io/cute-lord-of-destruction/`,
  ].filter(Boolean).join("\n");
  const shareBtnLabel = navigator.share ? "📢 결과 공유" : "📋 결과 복사";
  const shareBtn = `<button class="run-share-btn" type="button" data-share-text="${shareText.replace(/"/g, "&quot;")}">${shareBtnLabel}</button>`;
  if (el.reincarnateTitle) {
    el.reincarnateTitle.textContent = forced
      ? `제 ${state.run}판 종료 — 체면 상실`
      : `제 ${state.run}판 환생 준비`;
  }
  // 첫 패배 시 "괜찮아요" 안내 배너
  const showFirstDeathBanner = forced && state.run <= 1 && !state._firstDeathSeen;
  if (showFirstDeathBanner) {
    state._firstDeathSeen = true;
    const firstDeathBanner = document.createElement("div");
    firstDeathBanner.className = "first-death-banner";
    firstDeathBanner.innerHTML = `
      <strong>💠 괜찮아요! 죽어도 계속됩니다</strong>
      <p>파편으로 영구 강화를 사면 <em>다음 판부터 더 강하게</em> 시작해요.<br/>
      짐은 쓰러졌지만... 위엄은 영원하니라! (보좌관들이 계속 일함)</p>
    `;
    el.reincarnateModal.querySelector(".modal-panel")?.prepend(firstDeathBanner);
  }
  const gainBadge = gain > 0
    ? `<span class="reinc-gain-badge">+${gain} 💠 파편 획득!</span>`
    : "";
  el.reincarnateSummary.innerHTML = forced
    ? `${gainBadge}${recordLine}${runSummaryLine}${carryLine}${shardHint}${nextPowerLine}<br/><span class="reinc-teaser">${teaser}</span>${shareBtn}`
    : `${gainBadge}${recordLine}${runSummaryLine}${carryLine}${shardHint}${nextPowerLine}<br/><span class="reinc-teaser">${teaser}</span>${shareBtn}`;
  const shareBtnEl = el.reincarnateSummary.querySelector(".run-share-btn");
  if (shareBtnEl) {
    shareBtnEl.addEventListener("click", () => {
      const txt = shareBtnEl.dataset.shareText;
      if (navigator.share) {
        navigator.share({ text: txt }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(txt).then(() => {
          shareBtnEl.textContent = "✅ 복사됨!";
          window.setTimeout(() => { shareBtnEl.textContent = "📋 결과 공유"; }, 2000);
        }).catch(() => {
          shareBtnEl.textContent = "복사 실패 (직접 선택하세요)";
        });
      }
    });
  }
  renderUpgrades();
  // 재도전 버튼 텍스트 — 상황에 맞게 개인화
  if (el.restartRunBtn) {
    const intercepts = state.runInterceptTotal || 0;
    const hits = state.runHitTotal || 0;
    const bestFloorVal = state.bestFloor || 1;
    const btnLabels = forced
      ? intercepts === 0
        ? "다시 해보기! (이번엔 막기를 써봐요)"
        : hits > intercepts
          ? `다시 해보기! (${state.run + 1}판)`
          : `${state.run + 1}판 시작 — 설욕!`
      : bestFloorVal >= 25
        ? `${state.run + 1}판 — 30층 도전!`
        : bestFloorVal >= 15
          ? `${state.run + 1}판 — ${Math.ceil(bestFloorVal / 5) * 5 + 5}F 목표!`
          : `${state.run + 1}판 시작`;
    el.restartRunBtn.textContent = btnLabels;
  }
  // "계속 버티기" 버튼 — 강화 살 수 있으면 강조
  if (el.closeReincarnateBtn && !forced) {
    const totalShardsNow = state.shards + (forced ? 0 : gain);
    const canBuyPermanent = upgradeDefs.some(u => {
      const lv = state.permanent[u.id] || 0;
      const cost = Math.round(u.baseCost * Math.pow(1.42, lv));
      return totalShardsNow >= cost;
    });
    el.closeReincarnateBtn.textContent = canBuyPermanent
      ? "💠 강화하고 계속!"
      : "계속 버티기";
  }
  el.reincarnateModal.classList.remove("hidden");
}

function calculateReincarnateGain() {
  const stats = getStats();
  return Math.max(1, Math.round((state.floor * 0.7 + Math.floor(state.bestFloor / 5) * 2) * stats.rewardMult));
}

function getCarryTraitId() {
  const rank = { B: 1, A: 2, S: 3 };
  return [...state.traits].sort((a, b) => {
    const ta = traitDefs.find((trait) => trait.id === a);
    const tb = traitDefs.find((trait) => trait.id === b);
    return (rank[tb?.rarity] || 0) - (rank[ta?.rarity] || 0);
  })[0] || "";
}

function restartRun(addPendingReward = false) {
  if (addPendingReward && !state.reincarnateRewardClaimed) state.shards += calculateReincarnateGain();
  const carry = getCarryTraitId();
  const prevRun = state.run;
  const prevStats = getStats();
  const prevDps = prevStats.autoDamage * prevStats.autoSpeed;
  state.run += 1;
  state.floor = 1;
  state.tributes = 0;
  state.dignity = getStats().maxDignity;
  state.ultimate = 0;
  state.autoClock = 0;
  state.prep = 0;
  state.rescueStreak = 0;
  state.pose = "idle";
  state.poseTimer = 0;
  state.pulseKind = "";
  state.pulseTimer = 0;
  state.sceneSrc = "";
  state.sceneKind = "";
  state.sceneTimer = 0;
  state.creditKind = "";
  state.creditTimer = 0;
  state.traits = carry ? [carry] : [];
  state.runUpgrades = { click: 0, auto: 0, guard: 0, showoff: 0, crit: 0 };
  state.enemy = makeEnemy(1);
  state._prepClickCount = 0;   // 2판 이후에도 신규 목표 안내 초기화
  state.paused = false;
  state.choiceOpen = false;
  state.partChoiceOpen = false;
  state.cutscenePlaying = false;
  state.reincarnateRewardClaimed = false;
  state.slowmoTimer = 0;
  state.slowmoDone = true;        // 환생 후엔 슬로모 튜토리얼 재실행 안함
  state.introSeen = true;         // 인트로는 한 번만
  state.sideUnlocked = state.run > 1;
  state.firstFloorCleared = false;
  state.floorEvent = null;
  state.rageTimer = 0;
  state.floorInterceptCount = 0;
  state.floorPerfectCount = 0;
  state.floorHitCount = 0;
  state.runInterceptTotal = 0;
  state.runPerfectTotal = 0;
  state.runHitTotal = 0;
  state._firstPerfectSeen = false;
  el.stagePanel.classList.remove("rage-mode");
  el.reincarnateModal.classList.add("hidden");
  const carryTrait = traitDefs.find(t => t.id === carry);
  if (carryTrait) {
    setDialogue(`${carryTrait.name}을 이어받았으니라! 이번 판은 다를 것이니라!`, "허세");
  } else {
    setDialogue(carry ? "좋다. 이번에도 짐의 위엄을 보조하거라." : "흥... 이번엔 절대 안 맞을 것이니라.", "울먹임");
  }
  saveGame();

  window.setTimeout(() => {
    if (carryTrait) {
      window.setTimeout(() => showToast(`계승 ✓ ${carryTrait.name} — 이 특성을 들고 시작합니다`), 1800);
    }
    if (prevRun > 0) {
      const newStats = getStats();
      const newDps = newStats.autoDamage * newStats.autoSpeed;
      const pct = prevDps > 0 ? Math.round((newDps / prevDps - 1) * 100) : 0;
      window.setTimeout(() => {
        spawnParticles(pct > 0 ? 40 : 18);
        flashScreen(pct > 0 ? "gold" : "mint", pct > 0 ? 0.4 : 0.22);
        const banner = document.createElement("div");
        banner.className = "run-power-banner";
        const runNum = state.run;
        const prevBest = state.bestFloor;
        const nextTarget = prevBest <= 4 ? 5 : Math.min(30, Math.ceil(prevBest / 5) * 5 + 5);
        const growLine = pct > 0
          ? `<strong>+${pct}% 강해짐!</strong>`
          : `<strong>이번엔 더 잘할 수 있어!</strong>`;
        const carryLine = carryTrait ? `<em>${carryTrait.name} 계승 ✓</em>` : "";
        const targetLine = `<em style="color:rgba(134,216,199,0.9)">목표: ${nextTarget}F 도달 (지난 최고 ${prevBest}F)</em>`;
        banner.innerHTML = `<span>제 ${runNum}판 시작</span>${growLine}${carryLine}${targetLine}`;
        el.stagePanel.appendChild(banner);
        window.setTimeout(() => banner.remove(), 3600);
      }, carryTrait ? 1200 : 700);
      // 배너 사라진 뒤 — 영구 강화 유도 (파편이 있을 때만)
      if (state.shards > 0) {
        const recPerm = getRecommendedUpgrade();
        const permDef = upgradeDefs.find(u => u.id === recPerm);
        const permHint = permDef ? permDef.name : "영구 강화";
        window.setTimeout(() => showToast(`💠 파편 ${state.shards}개 — 환생 모달에서 [${permHint}] 강화 가능!`), 4200);
      }
    }
  }, 300);
}

function getRecommendedUpgrade() {
  const stats = getStats();
  const dignityRate = state.dignity / stats.maxDignity;
  const urgentPowerUpgrade = upgradeDefs.find(u => {
    const level = state.permanent[u.id] || 0;
    const cost = Math.round(u.baseCost * Math.pow(1.42, level));
    return state.shards >= cost;
  });
  if (dignityRate < 0.4) return "dignity";
  if ((state.permanent.power || 0) < 2) return "power";
  if ((state.permanent.ultimate || 0) < 1 && state.bestFloor >= 5) return "ultimate";
  return urgentPowerUpgrade?.id || "power";
}

function renderUpgrades() {
  el.upgradeGrid.innerHTML = "";
  const recommendedId = getRecommendedUpgrade();
  const curStats = getStats();
  upgradeDefs.forEach((upgrade) => {
    const level = state.permanent[upgrade.id] || 0;
    const cost = Math.round(upgrade.baseCost * Math.pow(1.42, level));
    const affordable = state.shards >= cost;
    const recommended = recommendedId === upgrade.id && affordable;

    // 다음 레벨 업그레이드 시 구체적 수치 변화 계산
    let nextPreview = "";
    const prevPerm = state.permanent[upgrade.id] || 0;
    state.permanent[upgrade.id] = prevPerm + 1;
    const nextStats = getStats();
    state.permanent[upgrade.id] = prevPerm;
    if (upgrade.id === "power") {
      const diff = Math.round(nextStats.counterDamage - curStats.counterDamage);
      nextPreview = `반격 +${diff}`;
    } else if (upgrade.id === "dignity") {
      const diff = Math.round(nextStats.maxDignity - curStats.maxDignity);
      nextPreview = `체면 +${diff}`;
    } else if (upgrade.id === "reward") {
      const pct = Math.round((nextStats.rewardMult / curStats.rewardMult - 1) * 100);
      nextPreview = `파편 +${pct}%`;
    } else if (upgrade.id === "ultimate") {
      const pct = Math.round((nextStats.ultimatePower / curStats.ultimatePower - 1) * 100);
      nextPreview = `궁극기 +${pct}%`;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `upgrade-card${affordable ? " affordable" : ""}${recommended ? " recommended" : ""}`;
    button.disabled = !affordable;
    button.innerHTML = `
      <span class="rarity-pill">Lv.${level}</span>
      <strong>${upgrade.name}</strong>
      <p>${upgrade.desc}</p>
      ${nextPreview ? `<span class="upgrade-preview-delta">▲ ${nextPreview}</span>` : ""}
      ${recommended ? `<span class="recommend-badge">추천</span>` : ""}
      <span class="card-tag">비용 ${cost} 파편</span>
    `;
    button.addEventListener("click", () => {
      const beforeLv = state.permanent[upgrade.id] || 0;
      button.classList.add("buy-bounce");
      window.setTimeout(() => button.classList.remove("buy-bounce"), 420);
      buyUpgrade(upgrade.id, cost);
      const afterLv = state.permanent[upgrade.id] || 0;
      if (afterLv > beforeLv) {
        const pop = document.createElement("span");
        pop.className = "run-upgrade-levelup";
        pop.textContent = `Lv.${beforeLv} → Lv.${afterLv}`;
        button.appendChild(pop);
        window.setTimeout(() => pop.remove(), 820);
      }
    });
    el.upgradeGrid.appendChild(button);
  });
}

function buyUpgrade(id, cost) {
  if (state.shards < cost) return;
  const statsBefore = getStats();
  state.shards -= cost;
  state.permanent[id] = (state.permanent[id] || 0) + 1;
  state.dignity = clamp(state.dignity + 20, 0, getStats().maxDignity);
  playSfx("upgrade");
  flashScreen("gold", 0.5);
  spawnParticles(32);
  const statsAfter = getStats();
  const upgradeDef = upgradeDefs.find(u => u.id === id);
  if (upgradeDef) {
    const level = state.permanent[id];
    const feedbacks = {
      power: `반격 피해 ${Math.round(statsBefore.counterDamage)} → ${Math.round(statsAfter.counterDamage)} (+${Math.round((statsAfter.counterDamage/statsBefore.counterDamage - 1)*100)}%)`,
      dignity: `체면 최대 ${Math.round(statsBefore.maxDignity)} → ${Math.round(statsAfter.maxDignity)} (+${Math.round((statsAfter.maxDignity/statsBefore.maxDignity - 1)*100)}%)`,
      reward: `파편 획득 +${Math.round((statsAfter.rewardMult/statsBefore.rewardMult - 1)*100)}% 향상`,
      ultimate: `궁극기 위력 +${Math.round((statsAfter.ultimatePower/statsBefore.ultimatePower - 1)*100)}% 향상`,
    };
    showToast(`✦ ${upgradeDef.name} Lv.${level} 영구 강화!`);
    window.setTimeout(() => showToast(feedbacks[id] || "강화 완료!"), 500);
    // 영구 강화 creditCut — "짐의 그릇이 커지는 것이니라" vs "파편으로 보좌관이 성장함"
    const permTruths = {
      power:   "실제: 보좌관들이 반격 수련 완료",
      dignity: "실제: 보좌관들이 방어막 두텁게",
      reward:  "실제: 보좌관이 파편 수집 효율화",
      ultimate:"실제: 보좌관들이 절초식 더 연습",
    };
    const permClaims = {
      power:   "발표: 짐의 반격 기운이 한 단계 각성!",
      dignity: "발표: 짐의 체면이 더욱 두터워졌느니라!",
      reward:  "발표: 짐의 영향력이 세계로 뻗어나감!",
      ultimate:"발표: 짐의 절초식이 더욱 완성됐느니라!",
    };
    window.setTimeout(() => showCreditCut(
      "rescue",
      permTruths[id] || "실제: 보좌관이 열심히 성장함",
      permClaims[id] || "발표: 짐의 그릇이 커졌느니라!",
      1.8,
    ), 200);
    // 영구 강화 마왕 대사 — 환생 맥락이므로 살짝 진지한 톤 허용
    const permDialogues = {
      power:   "흐흥! 반격이 더 강해졌다. 보좌관들이 성장한... 아니, 짐의 기운이 반격에 깃든 것이니라!",
      dignity: "체면이 더 두터워졌느니라. 보좌관들의 노력이... 아, 짐의 위엄이 증폭된 것이니라!",
      reward:  "이제 더 많은 파편이 모이겠군. 보좌관들이 효율적으로... 아니, 짐의 명성이 퍼진 것이니라!",
      ultimate:"절초식이 더 강해졌느니라. 보좌관들이 열심히 연습한... 짐이 원래 이 정도니라!",
    };
    window.setTimeout(() => setDialogue(permDialogues[id] || "짐의 그릇이 커졌느니라!", "각성"), 400);
    if (id === "power") state._nextBlockCritGuaranteed = true;
  }
  renderUpgrades();
  render();
  saveGame();
}

function getRunUpgradeCost(upgrade) {
  const level = state.runUpgrades?.[upgrade.id] || 0;
  return Math.round(upgrade.baseCost * Math.pow(upgrade.growth, level));
}

function getRecommendedRunUpgrade() {
  const stats = getStats();
  const dignityRate = state.dignity / stats.maxDignity;
  if (dignityRate < 0.58) return "guard";
  if (state.ultimate < 72 && state.floor >= 3) return "showoff";
  if ((state.runUpgrades.auto || 0) < 1) return "auto";
  return "click";
}

function buyRunUpgrade(id) {
  const upgrade = runUpgradeDefs.find((item) => item.id === id);
  if (!upgrade) return;
  const cost = getRunUpgradeCost(upgrade);
  if (state.tributes < cost) return;
  const statsBefore = getStats();
  const dpsBefore = statsBefore.autoDamage * statsBefore.autoSpeed;
  const maxDignityBefore = statsBefore.maxDignity;
  state.tributes -= cost;
  state.runUpgrades[id] = (state.runUpgrades[id] || 0) + 1;
  const statsAfter = getStats();
  const dpsAfter = statsAfter.autoDamage * statsAfter.autoSpeed;
  playSfx("upgrade");
  setPose("proud", 0.7, "강화");
  triggerPulse(id === "guard" ? "brace" : "assist", 0.42);
  const isFirstEverUpgrade = Object.values(state.runUpgrades).every(v => v <= 1) && state.runUpgrades[id] === 1;
  // 강화 구매 creditCut — 핵심 유머: 보좌관이 강해지는데 마왕이 자기 공으로 돌림
  const upgradeTruths = {
    auto:   "실제: 보좌관들이 더 열심히 일함",
    click:  "실제: 반격 수련은 보좌관이 함",
    guard:  "실제: 보좌관들이 방패막이가 됨",
    showoff:"실제: 보좌관이 카메라 앵글 조정",
    crit:   "실제: 보좌관의 비밀 무기 해금",
  };
  const upgradeClaims = {
    auto:   "발표: 짐의 명령이 더욱 위엄있어짐!",
    click:  "발표: 짐의 주먹에 신성한 기운이!",
    guard:  "발표: 짐의 체면이 두꺼워졌느니라!",
    showoff:"발표: 짐의 허세가 한 단계 진화!",
    crit:   "발표: 짐이 원래 이 정도였느니라!",
  };
  const creditTruth = upgradeTruths[id] || "실제: 보좌관이 다 함";
  const creditClaim = upgradeClaims[id] || "발표: 짐의 위엄이 강해졌느니라!";
  window.setTimeout(() => showCreditCut("streak", creditTruth, creditClaim, 1.5), 150);

  if (isFirstEverUpgrade) {
    setDialogue("흐흥! 공물로 강화라... 짐의 보좌관들이 쓸만해지는군. 아니, 원래부터 짐 덕분이니라!", "허세");
    window.setTimeout(() => showToast("💡 강화할수록 자동으로 더 강해집니다!"), 600);
  } else {
    setDialogue(randomPick([
      `${upgrade.name}? 흠, 짐의 위엄에 걸맞은 공물이니라.`,
      `좋다. 보좌관이 조금 쓸만해졌느니라.`,
      `이 정도 강화는 짐이 원래 계획한 것이니라.`,
      `짐은 항상 최고의 보좌관만 쓰느니라. 당연히 짐의 선견지명이니라.`,
    ]), "허세");
  }
  showToast(`${upgrade.name} Lv.${state.runUpgrades[id]} 강화!`);
  if (id === "auto" || id === "click") {
    const pct = Math.round((dpsAfter / dpsBefore - 1) * 100);
    const beforeFmt = formatNumber(Math.round(dpsBefore));
    const afterFmt = formatNumber(Math.round(dpsAfter));
    if (pct > 0) window.setTimeout(() => showToast(`전투력 ${beforeFmt} → ${afterFmt}/s (+${pct}%)`), 500);
  } else if (id === "guard") {
    const dignityPct = Math.round((statsAfter.maxDignity / maxDignityBefore - 1) * 100);
    const beforeDig = Math.round(maxDignityBefore);
    const afterDig = Math.round(statsAfter.maxDignity);
    if (dignityPct > 0) window.setTimeout(() => showToast(`체면 ${beforeDig} → ${afterDig} (+${dignityPct}%)`), 500);
  } else if (id === "showoff") {
    const chargeAfter = Math.round(statsAfter.chargeGain * 100);
    window.setTimeout(() => showToast(`궁극기 충전 속도 ${chargeAfter}% · 가로채기 공물 보너스 향상!`), 500);
  } else if (id === "crit") {
    const critPct = Math.round(statsAfter.critChance * 100);
    const critMult = statsAfter.critMult.toFixed(1);
    window.setTimeout(() => showToast(`치명타 ${critPct}% 확률로 x${critMult} 피해!`), 500);
  }
  spawnParticles(20);
  spawnDamage(`${upgrade.name} Lv.${state.runUpgrades[id]}`, false, "upgrade");
  // 구매한 카드에 레벨업 오버레이 표시
  const purchasedBtn = el.runUpgradeGrid.querySelector(`[data-run-upgrade="${id}"]`);
  if (purchasedBtn) {
    const lvBadge = document.createElement("div");
    lvBadge.className = "levelup-badge";
    lvBadge.textContent = `Lv.${state.runUpgrades[id]} ↑`;
    purchasedBtn.appendChild(lvBadge);
    window.setTimeout(() => lvBadge.remove(), 900);
  }
  // 강화 구매 → 전투 화면에 즉각 효과 가시화
  window.setTimeout(() => showUpgradePowerSurge(id, statsAfter), 300);
  // 다음 막기 한 번에 강화 효과를 즉각 체감하게 — 크리 보장 플래그
  if (id === "click" || id === "crit") {
    state._nextBlockCritGuaranteed = true;
  }
  render();
  saveGame();
}

function showUpgradePowerSurge(id, stats) {
  const stage = el.stagePanel;
  if (!stage) return;
  const labels = {
    click: `반격력 ↑ ${formatNumber(Math.round(stats.counterDamage))}/막기`,
    auto: `자동공격 ↑ ${formatNumber(Math.round(stats.autoDamage * stats.autoSpeed))}/s`,
    guard: `체면 ↑ MAX ${formatNumber(Math.round(stats.maxDignity))}`,
    showoff: `궁극기 충전 ↑ x${stats.chargeGain.toFixed(2)}`,
    crit: `치명타 ↑ ${Math.round(stats.critChance * 100)}% · x${stats.critMult.toFixed(1)}`,
  };
  const label = labels[id];
  if (!label) return;
  const surge = document.createElement("div");
  surge.className = "upgrade-power-surge";
  surge.textContent = label;
  stage.appendChild(surge);
  window.setTimeout(() => surge.remove(), 1800);
}

function renderRunUpgrades() {
  if (!state.sideUnlocked) {
    const lockKey = "locked";
    if (renderCache.runUpgrades !== lockKey) {
      renderCache.runUpgrades = lockKey;
      const previewCards = runUpgradeDefs.slice(0, 3).map(upgrade => `
        <div class="run-upgrade run-upgrade-preview" aria-hidden="true">
          <span class="upgrade-icon"><img src="${upgrade.image}" alt="" /></span>
          <span class="upgrade-copy">
            <strong>${upgrade.name}</strong>
            <p>${upgrade.desc}</p>
          </span>
          <span class="cost">${upgrade.baseCost} 공물</span>
        </div>
      `).join("");
      el.runUpgradeGrid.innerHTML = `
        <div class="side-lock-hint">🔒 1층 클리어 후 해금됩니다<br/><span style="font-size:11px;opacity:0.65">적 처치 후 공물로 아래 강화를 구매할 수 있어요</span></div>
        <div class="lock-preview-grid">${previewCards}</div>
      `;
    }
    return;
  }
  const recommendedId = getRecommendedRunUpgrade();
  const key = runUpgradeDefs
    .map((upgrade) => {
      const level = state.runUpgrades?.[upgrade.id] || 0;
      const cost = getRunUpgradeCost(upgrade);
      return `${upgrade.id}:${level}:${cost}:${state.tributes >= cost ? 1 : 0}:${recommendedId === upgrade.id ? 1 : 0}`;
    })
    .join("|");
  if (renderCache.runUpgrades === key) return;
  renderCache.runUpgrades = key;

  const currentStats = getStats();
  el.runUpgradeGrid.innerHTML = runUpgradeDefs
    .map((upgrade) => {
      const level = state.runUpgrades?.[upgrade.id] || 0;
      const cost = getRunUpgradeCost(upgrade);
      const affordable = state.tributes >= cost;
      const recommended = recommendedId === upgrade.id;
      let statPreview = "";
      let nextStatPreview = "";
      if (upgrade.id === "click") {
        const curVal = Math.round(currentStats.counterDamage);
        const nextMult = (1 + (level + 1) * 0.32) / (1 + level * 0.32);
        const nextVal = Math.round(curVal * nextMult);
        const pct = Math.round((nextMult - 1) * 100);
        statPreview = `반격 ${formatNumber(curVal)}/막기`;
        nextStatPreview = `→ ${formatNumber(nextVal)} (+${pct}%)`;
      } else if (upgrade.id === "auto") {
        const dps = Math.round(currentStats.autoDamage * currentStats.autoSpeed);
        const nextMult = (1 + (level + 1) * 0.38) / (1 + level * 0.38) * (1 + (level + 1) * 0.08) / (1 + level * 0.08 + 1.2);
        const pct = Math.round(((1 + (level + 1) * 0.38) / Math.max(0.01, 1 + level * 0.38) - 1) * 100);
        statPreview = `자동 ${formatNumber(dps)}/s`;
        nextStatPreview = pct > 0 ? `→ +${pct}%` : "";
      } else if (upgrade.id === "guard") {
        statPreview = `체면 ${formatNumber(Math.round(currentStats.maxDignity))} MAX`;
        nextStatPreview = `→ +8%`;
      } else if (upgrade.id === "showoff") {
        statPreview = `궁극기 충전 x${currentStats.chargeGain.toFixed(2)}`;
        nextStatPreview = `→ +8%`;
      } else if (upgrade.id === "crit") {
        const curCrit = Math.round(currentStats.critChance * 100);
        statPreview = `치명타 ${curCrit}% · x${currentStats.critMult.toFixed(1)}`;
        nextStatPreview = `→ ${Math.min(75, curCrit + 5)}% · x${(currentStats.critMult + 0.25).toFixed(1)}`;
      }
      const statLine = statPreview ? `<span class="upgrade-stat-preview">${statPreview} <span class="stat-next">${nextStatPreview}</span></span>` : "";
      const truthLine = upgrade.truth ? `<span class="upgrade-truth">${upgrade.truth}</span>` : "";
      return `
        <button class="run-upgrade${affordable ? " affordable" : ""}${recommended ? " recommended" : ""}" type="button" data-run-upgrade="${upgrade.id}" ${affordable ? "" : "disabled"}>
          <span class="upgrade-icon"><img src="${upgrade.image}" alt="" /></span>
          <span class="upgrade-copy">
            <strong>${upgrade.name} Lv.${level}</strong>
            <p>${upgrade.desc}</p>
            ${statLine}
            ${truthLine}
          </span>
          ${recommended ? `<span class="recommend-badge">추천</span>` : ""}
          <span class="cost">${formatNumber(cost)}</span>
        </button>
      `;
    })
    .join("");
  el.runUpgradeGrid.querySelectorAll("[data-run-upgrade]").forEach((button) => {
    button.addEventListener("click", () => {
      const upgradeId = button.dataset.runUpgrade;
      const beforeLv = state.runUpgrades?.[upgradeId] || 0;
      // 카드 위치 기준 부동 텍스트 위해 position:relative 보장
      if (getComputedStyle(button).position === "static") button.style.position = "relative";
      button.classList.add("buy-bounce");
      window.setTimeout(() => button.classList.remove("buy-bounce"), 420);
      buyRunUpgrade(upgradeId);
      const afterLv = state.runUpgrades?.[upgradeId] || 0;
      // 실제 구매 성공한 경우만 +Lv 폼업
      if (afterLv > beforeLv) {
        const pop = document.createElement("span");
        pop.className = "run-upgrade-levelup";
        pop.textContent = `+1 Lv → ${afterLv}`;
        button.appendChild(pop);
        window.setTimeout(() => pop.remove(), 820);
      }
    });
  });

  // 공물 → 파편 변환 버튼: 공물 충분하고 모든 강화가 일정 레벨 이상일 때 표시
  const totalLevels = runUpgradeDefs.reduce((sum, u) => sum + (state.runUpgrades?.[u.id] || 0), 0);
  const convertRate = 15;
  const canConvert = state.tributes >= convertRate && totalLevels >= 6;
  let convBtn = el.runUpgradeGrid.querySelector(".tribute-convert-btn");
  if (canConvert && !convBtn) {
    convBtn = document.createElement("button");
    convBtn.className = "run-upgrade tribute-convert-btn affordable";
    convBtn.type = "button";
    convBtn.innerHTML = `
      <span class="upgrade-icon">💎</span>
      <span class="upgrade-copy">
        <strong>공물 → 파편 변환</strong>
        <p>공물 ${convertRate}개를 파편 1개로 환전 (영구 성장)</p>
      </span>
      <span class="cost">${convertRate} 공물</span>
    `;
    convBtn.addEventListener("click", () => {
      if (state.tributes < convertRate) return;
      state.tributes -= convertRate;
      state.shards = (state.shards || 0) + 1;
      playSfx("defeat");
      showToast(`파편 +1 획득! (총 ${state.shards}개)`);
      spawnDamage("파편 +1", false, "upgrade");
      render();
      saveGame();
    });
    el.runUpgradeGrid.appendChild(convBtn);
  } else if (!canConvert && convBtn) {
    convBtn.remove();
  }
}

function renderTraits() {
  const stacks = getTraitStacks();
  const ids = Object.keys(stacks).filter((id) => traitDefs.some((item) => item.id === id));
  const curStatsForCache = getStats();
  const cacheKey = (ids.map((id) => `${id}:${stacks[id]}`).join("|") || "empty")
    + `:dps${Math.round(curStatsForCache.autoDamage * curStatsForCache.autoSpeed)}`
    + `:ctr${Math.round(curStatsForCache.counterDamage)}`;
  if (renderCache.traits === cacheKey) return;
  renderCache.traits = cacheKey;

  if (!ids.length) {
    const floorsLeft = Math.max(0, 2 - state.floor);
    const emptyMsg = floorsLeft > 0
      ? `${2 - state.floor + 1}층만 더 클리어하면 특성 3택이 열립니다!`
      : `2층 격파 후 첫 3택 특성 보상이 열립니다.`;
    el.traitList.innerHTML = `<div class="trait-empty">${emptyMsg}<br /><span style="font-size:11px;opacity:0.7">귀여운 폭군(자동+24%) · 울먹이는 생존본능(체면+28%) · 별빛 폭발(치명타+10%) 등 11종 중 선택</span></div>`;
    return;
  }
  const tagCounts = {};
  ids.forEach(id => {
    const t = traitDefs.find(d => d.id === id);
    if (t) tagCounts[t.tag] = (tagCounts[t.tag] || 0) + 1;
  });
  const topTag = Object.entries(tagCounts).sort((a,b) => b[1]-a[1])[0];
  const curStats = getStats();
  const dps = Math.round(curStats.autoDamage * curStats.autoSpeed * curStats.autoTempo);
  const counter = Math.round(curStats.counterDamage);
  const maxDig = Math.round(curStats.maxDignity);
  const statSummaryHtml = `<div class="build-stat-summary">
    <span>자동 <strong>${formatNumber(dps)}/s</strong></span>
    <span>반격 <strong>${formatNumber(counter)}</strong></span>
    <span>체면 <strong>${formatNumber(maxDig)}</strong></span>
  </div>`;
  const buildStrengthMap = {
    "방치": "방치 빌드 — 탭 없이도 부하들이 싸움. 자동 강화에 집중!",
    "속도": "속도 빌드 — 자동 공격이 빠름. 층이 빠르게 넘어감!",
    "생존": "생존 빌드 — 맞아도 OK. 궁극기 충전이 유리!",
    "반격": "반격 빌드 — 타이밍 성공 시 폭발. 막기 타이밍이 핵심!",
    "치명": "치명 빌드 — 크리 터지면 대폭발. 크리 확률을 더 올리세요!",
    "보스": "보스 특화 — 잡몹은 느리지만 보스 순삭. 보스까지 버텨요!",
    "궁극기": "궁극기 빌드 — 자동 공격 없음. 궁극기 1회로 보스 반토막!",
    "계승": "눈덩이 빌드 — 콤보 쌓을수록 폭발. 막기를 연속으로!",
  };
  const buildStrength = topTag ? buildStrengthMap[topTag[0]] || "" : "";
  const buildSummaryHtml = topTag
    ? `<div class="build-summary">빌드: <strong>${topTag[0]}</strong> (${state.traits.length}특성)${buildStrength ? `<span class="build-strength-line">${buildStrength}</span>` : ""}</div>`
    : "";
  el.traitList.innerHTML = statSummaryHtml + buildSummaryHtml + ids
    .map((id) => {
      const trait = traitDefs.find((item) => item.id === id);
      const statLine = getTraitStatPreview(id);
      return `
        <div class="trait-card">
          <img class="trait-icon" src="${trait.image}" alt="" />
          <div>
            <div class="trait-meta"><span>${trait.rarity}급</span><span>x${stacks[id]}</span></div>
            <strong>${trait.name}</strong>
            <p>${trait.desc}</p>
            ${statLine ? `<span class="trait-stat-preview">${statLine}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderParts() {
  const ids = getEquippedPartIds();
  const power = getPartPower(ids);
  const owned = Object.keys(partDefs).filter((id) => state.ownedParts?.[id] || getPartLevel(id) > 0).length;
  const key = `${ids.map((id) => `${id}:${getPartLevel(id)}`).join("|")}:${owned}:${power.synergyName}`;
  if (renderCache.parts === key) return;
  renderCache.parts = key;

  if (ids.length === 0) {
    el.partSlots.innerHTML = partSlotDefs.map((slot, i) => {
      const nextBoss = Math.ceil(state.floor / 5) * 5;
      const hint = i === 0 ? `${nextBoss}F 보스 처치로 획득` : `보스 처치 후 선택`;
      return `
        <div class="part-card part-card--locked">
          <div class="part-thumb part-thumb--empty">
            <span class="part-lock-icon">🔒</span>
          </div>
          <div class="part-body">
            <span class="enemy-label">${slot.label} 슬롯</span>
            <strong>파츠 미장착</strong>
            <p>${hint} — 궁극기 연출에 반영됩니다.</p>
          </div>
        </div>
      `;
    }).join("");
  } else {
    el.partSlots.innerHTML = ids
      .map((id, index) => {
        const part = partDefs[id];
        return `
          <div class="part-card">
            <div class="part-thumb">
              <span class="part-level">Lv.${getPartLevel(id)}</span>
              <img src="${part.image}" alt="" />
            </div>
            <div class="part-body">
              <span class="enemy-label">${partSlotDefs[index].label} · ${part.attr}</span>
              <strong>${part.name}</strong>
              <p>${part.desc}</p>
            </div>
          </div>
        `;
      })
      .join("");
  }
  el.memoryText.textContent = `${owned}/${Object.keys(partDefs).length}개 · ${power.synergyName}`;
}

function renderStageReward() {
  if (!el.stageRewardText || !el.stageRewardDeck) return;

  const ids = getEquippedPartIds();
  const power = getPartPower(ids);
  const stats = getStats();
  const owned = Object.keys(partDefs).filter((id) => state.ownedParts?.[id] || getPartLevel(id) > 0).length;
  const total = Object.keys(partDefs).length;
  const dignityRate = state.dignity / stats.maxDignity;
  const dignityPercent = Math.round(dignityRate * 100);
  const dignityCritical = dignityRate <= 0.4;
  const nextBossFloor = state.floor % 5 === 0 ? state.floor : Math.ceil(state.floor / 5) * 5;
  const floorsLeft = Math.max(0, nextBossFloor - state.floor);
  const nextTraitFloor = getNextTraitRewardFloor(state.floor);
  const nextTraitLabel = state.floor === nextTraitFloor ? `${state.floor}F 보상` : `${nextTraitFloor}F 보상`;
  const bossLabel = state.enemy?.isBoss ? "지금 보스" : `${nextBossFloor}F 보스`;
  const ultimateLabel = state.ultimate >= 100 ? "궁극기 준비" : `궁극기 ${Math.round(state.ultimate)}%`;
  const goal30 = state.bestFloor < 30 ? ` · 목표 30층` : ` · 30층 클리어!`;
  // 첫 판 초반(1~3층)은 단계별 신규 목표 안내
  const isNewPlayer = state.run <= 1 && state.floor <= 3 && (state._prepClickCount || 0) < 18;
  const prepPct = Math.round(state.prep || 0);
  const newPlayerGoal = !state.firstBlockSeen
    ? `① 탭해서 기력 쌓기 — 지금 기력 ${prepPct}%`
    : (state._prepClickCount || 0) < 8
      ? `② 기력 50%+ 쌓은 뒤 빨간 불(위험) 때 막기!`
      : !state.sideUnlocked
        ? `③ 적 처치 후 [강화] 탭에서 보좌관을 강화하세요!`
        : `④ 강화 탭에서 공물로 보좌관 강화 → 5F 보스 도전!`;
  const rewardText = isNewPlayer
    ? newPlayerGoal
    : dignityCritical
      ? `⚠ 체면 위기 ${dignityPercent}% — 다음 공격을 막아라!`
      : state.ultimate >= 100
        ? `✦ 궁극기 사용 가능! 파츠 ${owned}/${total}개`
        : state.enemy?.isBoss
          ? `▶ 보스 격파 → 영상 파츠 선택 (${owned}/${total}개)`
          : `▶ ${nextBossFloor}F 보스까지 ${floorsLeft}층 · 파츠 ${owned}/${total}개`;
  const key = `${state.floor}:${state.enemy?.isBoss ? 1 : 0}:${rewardText}:${nextTraitLabel}:${bossLabel}:${ultimateLabel}:${dignityPercent}:${ids.map((id) => `${id}:${getPartLevel(id)}`).join("|")}:${state._prepClickCount || 0}:${state.firstBlockSeen ? 1 : 0}:${state.sideUnlocked ? 1 : 0}`;
  if (renderCache.stageReward === key) return;
  renderCache.stageReward = key;

  el.stageRewardText.textContent = rewardText;
  if (el.stageMilestones) {
    const cycleStart = (Math.floor((state.floor - 1) / 5) * 5) + 1;
    const dots = Array.from({ length: 5 }, (_, i) => {
      const dotFloor = cycleStart + i;
      const isCurrent = dotFloor === state.floor;
      const isPassed = dotFloor < state.floor;
      const isBoss = dotFloor % 5 === 0;
      let cls = isPassed ? "dot-passed" : isCurrent ? "dot-current" : "dot-future";
      if (isBoss) cls += " dot-boss";
      return `<span class="boss-dot ${cls}" title="${dotFloor}F${isBoss ? ' 보스' : ''}"></span>`;
    }).join("");
    const eventChip = state.floorEvent
      ? `<span class="floor-event-chip">${state.floorEvent.label}</span>`
      : "";
    el.stageMilestones.innerHTML = `<span class="boss-dots-row">${dots}</span><span>${bossLabel}</span><span>${ultimateLabel}</span>${eventChip}`;
  }
  el.stageRewardDeck.innerHTML = ids
    .map((id) => {
      const part = partDefs[id];
      return `
        <span class="stage-part-chip">
          <img src="${part.image}" alt="" />
          <span>${part.role}</span>
          <strong>Lv.${getPartLevel(id)}</strong>
        </span>
      `;
    })
    .join("");

  // 파츠 시너지가 활성화됐을 때 전투 화면에 배너 상시 표시
  const isNonDefaultSynergy = power.synergyName && power.synergyName !== "기본 허세";
  let synergyBadgeEl = el.stagePanel?.querySelector(".active-synergy-badge");
  if (isNonDefaultSynergy && ids.length >= 2) {
    if (!synergyBadgeEl) {
      synergyBadgeEl = document.createElement("div");
      synergyBadgeEl.className = "active-synergy-badge";
      el.stagePanel?.appendChild(synergyBadgeEl);
    }
    synergyBadgeEl.textContent = `✦ ${power.synergyName}`;
  } else if (synergyBadgeEl) {
    synergyBadgeEl.remove();
  }
}

function render() {
  if (!_motesStarted) { _motesStarted = true; startStageMotes(); }
  ensureEnemy();
  const stats = getStats();
  state.dignity = clamp(state.dignity, 0, stats.maxDignity);
  const threatRate = clamp(1 - state.enemy.attackTimer / state.enemy.attackMax, 0, 1);
  const phase = getCombatPhase(state.enemy, stats);
  const dangerReady = phase.dangerReady;
  const impactSoon = phase.impactSoon;
  const timingStart = clamp(1 - stats.timingWindow / state.enemy.attackMax, 0, 1);
  const orbProgress = dangerReady ? threatRate : phase.aiming ? clamp(threatRate * 0.78, 0, 0.72) : 0;
  const enemyHpRate = state.enemy.hp / state.enemy.maxHp;
  const dignityRate = state.dignity / stats.maxDignity;
  const dignityPercent = Math.round(dignityRate * 100);
  const dignityCritical = dignityRate <= 0.4;
  applyHpDangerClass(dignityRate);
  const comboMult = getComboMultiplier();
  const prepRate = clamp(state.prep || 0, 0, 100);
  const prepMult = getPrepMultiplier(state.enemy);
  const nextStreakBonus = (state.rescueStreak || 0) > 0 && (state.rescueStreak + 1) % 3 === 0;

  if (el.runText) {
    el.runText.textContent = `${state.run}`;
    el.runText.closest(".hud-stat")?.classList.toggle("hidden-run", state.run <= 1);
    el.runChip?.classList.toggle("hidden-run", state.run <= 1);
  }
  if (el.streakChip && el.streakText) {
    const sn = state.rescueStreak || 0;
    el.streakText.textContent = sn >= 7 ? `🔥${sn}` : sn >= 3 ? `⚡${sn}` : `${sn}`;
    el.streakChip.classList.toggle("hidden-streak", sn < 2);
    el.streakChip.classList.toggle("streak-fever", sn >= 7);
    el.streakChip.classList.toggle("streak-hot", sn >= 3 && sn < 7);
  }
  el.floorText.textContent = `${state.floor}F`;
  el.floorText.title = `${state.floor}층 / 30층`;
  if (el.bestFloorText) {
    el.bestFloorText.textContent = `${state.bestFloor}F`;
  }
  // 점진적 disclosure — 신규 유저(첫 보스 처치 전) 자원 chip 숨김
  // 첫 5층 보스 클리어 시 .firstBossDefeated=true → chip 등장
  const isNewbie = !state.firstBossDefeated && state.run <= 1;
  el.bestChip?.classList.toggle("hud-chip-onboarding-hidden", isNewbie || state.bestFloor <= 1);
  el.tributeChip?.classList.toggle("hud-chip-onboarding-hidden", isNewbie && (state.tributes || 0) < 1);
  el.shardChip?.classList.toggle("hud-chip-onboarding-hidden", isNewbie && (state.shards || 0) < 1);
  if (el.floorProgressBar) {
    const totalFloors = 30;
    const progress = Math.min(state.floor / totalFloors, 1);
    el.floorProgressBar.style.width = `${progress * 100}%`;
    const isCurrentBoss = state.enemy?.isBoss;
    el.floorProgressBar.parentElement?.classList.toggle("floor-bar-boss", isCurrentBoss);
    el.floorProgressBar.title = `${state.floor}F / ${totalFloors}F`;
    // "보스까지 N층" 라벨 — 항상 표시
    const progressTrack = el.floorProgressBar.parentElement;
    if (progressTrack) {
      let bossLbl = progressTrack.querySelector(".boss-distance-label");
      if (!bossLbl) {
        bossLbl = document.createElement("span");
        bossLbl.className = "boss-distance-label";
        progressTrack.appendChild(bossLbl);
      }
      const nextBossFloor = Math.ceil(state.floor / 5) * 5;
      const floorsLeft = nextBossFloor - state.floor;
      const nextBossPreview = (!isCurrentBoss && nextBossFloor <= 30) ? makeEnemyPreview(nextBossFloor) : null;
      const bossNameHint = nextBossPreview ? ` · ${nextBossPreview.name}` : "";
      if (state.floor >= 30 || state.floor === totalFloors) {
        bossLbl.textContent = "최종층!";
        bossLbl.className = "boss-distance-label boss-lbl--final";
      } else if (isCurrentBoss) {
        bossLbl.textContent = `${state.floor}F 보스 전투 중!`;
        bossLbl.className = "boss-distance-label boss-lbl--now";
      } else if (floorsLeft <= 1) {
        bossLbl.textContent = `다음 층: ${nextBossFloor}F 보스${bossNameHint}!`;
        bossLbl.className = "boss-distance-label boss-lbl--imminent";
      } else {
        bossLbl.textContent = `보스까지 ${floorsLeft}층${bossNameHint}`;
        bossLbl.className = "boss-distance-label";
      }
    }
  }
  updateDemonTitle();
  applyStageHue();
  el.shardText.textContent = formatNumber(state.shards);
  pulseValue(el.shardText, state.shards);
  el.dignityText.textContent = `${dignityPercent}%`;
  pulseValue(el.dignityText, dignityPercent);
  const ultRound = Math.round(state.ultimate);
  el.ultimateText.textContent = `${ultRound}%`;
  el.ultimateInlineText.textContent = `${ultRound}%`;
  pulseValue(el.ultimateText, ultRound);
  pulseValue(el.ultimateInlineText, ultRound);
  el.enemyLabel.textContent = state.enemy.title;
  el.enemyName.textContent = state.enemy.name;
  if (el.enemyArt) el.enemyArt.style.backgroundImage = `url("${state.enemy.image}")`;
  el.arenaEnemy.src = state.enemy.image;
  el.enemyHpText.textContent = `${formatNumber(state.enemy.hp)} / ${formatNumber(state.enemy.maxHp)}`;
  el.enemyHpBar.style.width = `${clamp(enemyHpRate * 100, 0, 100)}%`;
  // 보스 HP바: 보스일 때만 표시, 게임 스타일 디자인
  el.stagePanel?.classList.toggle("boss-active", !!state.enemy.isBoss);
  el.stagePanel?.classList.toggle("boss-low", !!state.enemy.isBoss && enemyHpRate <= 0.25);
  if (state.enemy.isBoss) {
    if (el.bossHpFill) el.bossHpFill.style.setProperty("--boss-hp-rate", String(clamp(enemyHpRate, 0, 1)));
    if (el.bossHpGhost) el.bossHpGhost.style.setProperty("--boss-hp-ghost", String(clamp(enemyHpRate, 0, 1)));
    if (el.bossHpName) el.bossHpName.textContent = state.enemy.name || "보스";
    if (el.bossHpNum) el.bossHpNum.textContent = `${formatNumber(state.enemy.hp)} / ${formatNumber(state.enemy.maxHp)}`;
  }
  applyBossModifierBadge();
  // 적 HP 단계에 따라 바 색상 변화
  el.enemyHpBar.parentElement?.classList.toggle("hp-phase-low", enemyHpRate <= 0.25);
  el.enemyHpBar.parentElement?.classList.toggle("hp-phase-mid", enemyHpRate > 0.25 && enemyHpRate <= 0.5);
  // 적 HP 낮아질수록 arenaEnemy에 dying 클래스 → CSS로 시각화
  if (el.arenaEnemy) {
    el.arenaEnemy.classList.toggle("enemy-dying", enemyHpRate <= 0.25);
    el.arenaEnemy.classList.toggle("enemy-bloodied", enemyHpRate > 0.25 && enemyHpRate <= 0.5);
  }
  el.heroHpText.textContent = `${formatNumber(state.dignity)} / ${formatNumber(stats.maxDignity)}`;
  el.heroHpBar.style.width = `${clamp(dignityRate * 100, 0, 100)}%`;
  el.castText.textContent = `${Math.max(0, state.enemy.attackTimer).toFixed(1)}초`;
  if (el.threatText) el.threatText.textContent = dangerReady ? "지금 막으세요!" : state.enemy.intent;
  if (el.enemyIntentBadge && el.enemyIntentText) {
    const intentStr = dangerReady
      ? impactSoon ? "지금 막지 않으면 맞습니다!!" : "공격이 온다! 막아야 합니다!"
      : phase.aiming
        ? `조준 중 — ${state.enemy.intent || "마왕님을 노립니다"}`
        : state.enemy.intent || "마왕님을 노리는 중";
    el.enemyIntentText.textContent = intentStr;
    el.enemyIntentBadge.classList.toggle("intent--danger", dangerReady);
    el.enemyIntentBadge.classList.toggle("intent--aiming", phase.aiming && !dangerReady);
  }
  el.threatBar.style.width = `${clamp(threatRate * 100, 0, 100)}%`;
  if (!isMobile) {
    el.timingCall.textContent = dangerReady
      ? impactSoon ? "맞기 직전!!" : state.ultimate >= 100 ? "✦ 궁극기 먼저! → 막기!" : "빨간 버튼으로 막기!"
      : phase.aiming
        ? `조준 중 — ${Math.max(0, state.enemy.attackTimer).toFixed(1)}초 후 공격!`
        : dignityCritical
          ? `⚠ 체면 위험 ${dignityPercent}%`
          : state.ultimate >= 100
            ? "✦ 궁극기 준비 완료!"
            : prepRate >= 70
              ? "기력 MAX — 공격 타이밍 기다려!"
              : prepRate >= 30
                ? `기력 충전 중 ${Math.round(prepRate)}% — 계속 탭!`
                : "탭해서 기력 모으기!";
  }
  const streakN = state.rescueStreak || 0;
  if (!isMobile) {
    el.comboText.textContent = streakN >= 7
      ? `🔥 FEVER ${streakN}연속 · x${comboMult.toFixed(2)}`
      : streakN >= 3
        ? `⚡ ${streakN}연속 · x${comboMult.toFixed(2)}`
        : streakN >= 1
          ? `${streakN}연속 · x${comboMult.toFixed(2)}`
          : dignityCritical ? `체면 위험 ${dignityPercent}%` : state.ultimate >= 100 ? "궁극기 준비!" : `기력 ${Math.round(prepRate)}%`;
    el.comboText.dataset.streak = streakN >= 7 ? "fever" : streakN >= 3 ? "hot" : streakN >= 1 ? "warm" : "";
  }
  const breakCount = state.enemy.isBoss ? (state.enemy._breakCount || 0) : 0;
  const breakStars = state.enemy.isBoss
    ? "★".repeat(Math.min(3, breakCount)) + "☆".repeat(Math.max(0, 3 - breakCount))
    : "";
  const breakCharge = Math.round(100 - (state.enemy.breakGauge || 100));
  el.breakText.textContent = state.enemy.isBoss
    ? `${breakStars} 브레이크 ${breakCharge}%`
    : `${breakCharge}%`;
  el.breakBar.style.width = `${clamp(breakCharge, 0, 100)}%`;
  // 브레이크 80% 이상 → 임박 강조
  el.breakBar.parentElement?.classList.toggle("break-near", state.enemy.isBoss && breakCharge >= 80);
  el.ultimateBar.style.setProperty("--ult-fill", `${clamp(state.ultimate, 0, 100)}%`);
  el.ultimateBtn.disabled = state.ultimate < 100 || state.paused || state.cutscenePlaying;
  el.ultimateBtn.classList.toggle("ultimate-ready", state.ultimate >= 100 && !state.paused && !state.cutscenePlaying);
  if (el.ultimateBtnLabel) {
    el.ultimateBtnLabel.textContent = state.ultimate >= 100
      ? "궁극기!"
      : `궁극기 ${Math.round(state.ultimate)}%`;
  }
  if (!isMobile) {
    el.prepText.textContent = dangerReady
      ? `기력 ${Math.round(prepRate)}%`
      : prepRate >= 70
        ? `기력 ${Math.round(prepRate)}% ★`
        : `기력 ${Math.round(prepRate)}%`;
  }
  el.prepBar.style.width = `${prepRate}%`;
  el.prepBar.style.setProperty("--prep-multiplier-text", `"x${prepMult.toFixed(2)}"`);
  el.prepBar.closest(".prep-gauge")?.classList.toggle("prep-charged", prepRate >= 70);
  const enemyLowHp = state.enemy && state.enemy.hp / state.enemy.maxHp <= 0.25;
  const aimSecs = Math.max(0, state.enemy.attackTimer);
  el.tapLabel.textContent = dangerReady
    ? state.ultimate >= 100 && !impactSoon ? "✦ 궁극기 먼저!" : nextStreakBonus ? "⚡ 연속 막기!" : "★ 지금 막아!"
    : phase.aiming ? (aimSecs <= 1.2 ? "⚠ 지금 막아!" : "⏱ 막을 준비!")
    : dignityCritical ? "🚨 체면 위기!"
    : enemyLowHp ? "💥 마무리 일격!"
    : prepRate < 20 ? "탭 탭 탭!"
    : prepRate < 60 ? "기력 충전 중..."
    : "막을 준비 완료!";
  if (!isMobile && el.enemyAttackStat) {
    el.enemyAttackStat.textContent = dangerReady
      ? "⚡ 막기!"
      : phase.aiming
        ? `조준 중 ${Math.max(0, state.enemy.attackTimer).toFixed(1)}s`
        : impactSoon ? "맞는다!!" : `HP ${Math.round(state.enemy.hp / state.enemy.maxHp * 100)}%`;
    el.enemyAttackStat.classList.toggle("stat-danger", dangerReady || impactSoon);
  }
  if (!isMobile) {
    el.clickPowerText.textContent = dangerReady
      ? `반격 x${prepMult.toFixed(2)}`
      : phase.aiming ? "막을 준비" : dignityCritical ? `체면 ${dignityPercent}%` : `반격 x${prepMult.toFixed(2)}`;
    el.autoPowerText.textContent = dangerReady ? "위험!" : phase.aiming ? "조준 감지" : state.rescueStreak ? `연속 ${state.rescueStreak}회` : `자동 ${formatNumber(stats.autoDamage * stats.autoSpeed * stats.autoTempo)}/s`;
  }
  el.tapBtn.classList.toggle("danger-ready", dangerReady);
  el.tapBtn.classList.toggle("watching", phase.aiming);
  el.tapBtn.classList.toggle("near-aim", phase.aiming && aimSecs <= 1.2 && !dangerReady);
  el.tapBtn.classList.toggle("assist-ready", !dangerReady && !phase.aiming && prepRate < 100);
  el.tapBtn.classList.toggle("finish-ready", !dangerReady && enemyLowHp);
  // 기력 단계별 버튼 시각 강화
  el.tapBtn.classList.toggle("prep-low", !dangerReady && !phase.aiming && prepRate < 30);
  el.tapBtn.classList.toggle("prep-mid", !dangerReady && !phase.aiming && prepRate >= 30 && prepRate < 70);
  el.tapBtn.classList.toggle("prep-high", !dangerReady && !phase.aiming && prepRate >= 70);
  // 공격 타이머 카운트다운 (aiming 이후 표시)
  const timerSecs = Math.max(0, state.enemy.attackTimer);
  if (phase.aiming || dangerReady) {
    el.tapBtn.dataset.countdown = dangerReady ? "!" : timerSecs.toFixed(1);
  } else {
    delete el.tapBtn.dataset.countdown;
  }
  el.dignityText.closest(".hud-stat")?.classList.toggle("critical", dignityCritical);
  el.ultimateText.closest(".hud-stat")?.classList.toggle("ready", state.ultimate >= 100);
  el.stagePanel.classList.toggle("aiming", phase.aiming);
  const wasDanger = el.stagePanel.classList.contains("danger");
  el.stagePanel.classList.toggle("danger", dangerReady);
  if (dangerReady && !wasDanger) spawnAttackTelegraph();
  // 적 말풍선 taunt 텍스트 업데이트
  if (el.arenaEnemy) {
    const threatCard = el.arenaEnemy.closest(".threat-card");
    if (threatCard) {
      const idleTaunt = state._currentEnemyTaunt || "";
      const tauntText = dangerReady
        ? "지금이다!!"
        : phase.aiming
          ? state.enemy.intent || "마왕님… 각오해라"
          : idleTaunt;
      threatCard.dataset.taunt = tauntText;
    }
  }
  el.stagePanel.classList.toggle("impact-soon", impactSoon);
  el.stagePanel.classList.toggle("combo-warm", (state.rescueStreak || 0) >= 1);
  el.stagePanel.classList.toggle("combo-hot", (state.rescueStreak || 0) >= 3);
  el.stagePanel.classList.toggle("combo-fever", (state.rescueStreak || 0) >= 7);
  // HP 위급 비네트 — 30% 이하면 화면 가장자리 빨간 펄스
  const dignityPct = stats.maxDignity ? (state.dignity || 0) / stats.maxDignity : 1;
  el.stagePanel.classList.toggle("low-hp", dignityPct <= 0.3 && dignityPct > 0.15);
  el.stagePanel.classList.toggle("crisis-hp", dignityPct <= 0.15 && dignityPct > 0);
  // 보스/엘리트 idle 클래스 토글
  if (el.arenaEnemy) {
    el.arenaEnemy.classList.toggle("is-boss", !!state.enemy?.isBoss);
    el.arenaEnemy.classList.toggle("is-elite", !!state.enemy?.isElite);
  }
  updateFightCombo(state.rescueStreak || 0);
  el.stagePanel.classList.toggle("is-boss", state.enemy.isBoss);
  setBgmBossMode(state.enemy.isBoss);
  el.stagePanel.classList.toggle("low-dignity", dignityCritical);
  el.stagePanel.classList.toggle("dignity-crisis", dignityRate <= 0.2);
  const bossFinishing = state.enemy.isBoss && state.enemy.hp / state.enemy.maxHp <= 0.25;
  const bossAngry = state.enemy.isBoss && state.enemy.hp / state.enemy.maxHp <= 0.5 && !bossFinishing;
  el.stagePanel.classList.toggle("boss-finishing", bossFinishing);
  el.stagePanel.classList.toggle("boss-angry", bossAngry);
  // 층수 구간별 배경 테마 — floor-tier-overlay div에 CSS 변수 적용
  const floorTier = state.floor >= 26 ? "legend" : state.floor >= 21 ? "abyss" : state.floor >= 16 ? "deep" : state.floor >= 11 ? "mid" : state.floor >= 6 ? "rise" : "early";
  el.stagePanel.dataset.floorTier = floorTier;
  {
    let tierOverlay = el.stagePanel.querySelector(".floor-tier-overlay");
    if (!tierOverlay) {
      tierOverlay = document.createElement("div");
      tierOverlay.className = "floor-tier-overlay";
      el.stagePanel.insertBefore(tierOverlay, el.stagePanel.firstChild);
    }
    const tierColors = {
      early:  ["rgba(108,58,104,0.22)", "rgba(44,25,80,0.25)"],
      rise:   ["rgba(134,216,199,0.18)", "rgba(44,80,120,0.22)"],
      mid:    ["rgba(240,154,187,0.22)", "rgba(108,58,104,0.28)"],
      deep:   ["rgba(108,58,104,0.32)", "rgba(80,10,60,0.30)"],
      abyss:  ["rgba(180,20,50,0.30)", "rgba(44,0,60,0.35)"],
      legend: ["rgba(200,140,0,0.28)", "rgba(243,197,95,0.20)"],
    };
    const [c1, c2] = tierColors[floorTier] || tierColors.early;
    tierOverlay.style.setProperty("--tier-color1", c1);
    tierOverlay.style.setProperty("--tier-color2", c2);
    // HUD도 층별로 색조 변화
    const hudTints = {
      early:  "rgba(14,10,18,0.88)",
      rise:   "rgba(10,18,24,0.90)",
      mid:    "rgba(18,10,24,0.90)",
      deep:   "rgba(20,6,18,0.92)",
      abyss:  "rgba(22,4,12,0.94)",
      legend: "rgba(20,14,4,0.92)",
    };
    document.documentElement.style.setProperty("--hud-bg", hudTints[floorTier] || hudTints.early);
  }
  el.stagePanel.classList.toggle("ultimate-ready", state.ultimate >= 100);
  el.stagePanel.classList.toggle("enemy-low-hp", state.enemy && state.enemy.hp / state.enemy.maxHp <= 0.25);
  // 기력 탭 힌트 — 5번 미만 클릭한 신규 유저에게만 표시
  el.stagePanel.classList.toggle("prep-hint", (state._prepClickCount || 0) < 5 && !phase.aiming && !dangerReady);
  // 보스 직전 층(4F, 9F, ...) 긴장감 클래스
  const isPreBoss = !state.enemy.isBoss && state.floor % 5 === 4;
  el.stagePanel.classList.toggle("pre-boss", isPreBoss);
  el.bossAlert?.classList.toggle("hidden", !isPreBoss);
  el.stagePanel.classList.toggle("hit", state.pose === "hit");
  el.stagePanel.classList.toggle("proud", state.pose === "proud" || state.pose === "rescue" || state.pose === "counter");
  el.stagePanel.classList.toggle("prepared", prepRate >= 70);
  el.stagePanel.classList.toggle("scene-rescue", state.sceneKind === "rescue" && state.sceneTimer > 0);
  el.stagePanel.classList.toggle("scene-hit", state.sceneKind === "hit" && state.sceneTimer > 0);
  el.stagePanel.classList.toggle("rage-mode", state.rageTimer > 0);
  ["assist", "brace", "rescue", "hit", "counter"].forEach((kind) => {
    el.stagePanel.classList.toggle(`pulse-${kind}`, state.pulseKind === kind && state.pulseTimer > 0);
  });
  ["방치", "속도", "생존", "반격", "치명", "보스", "궁극기", "계승"].forEach(tag => {
    el.stagePanel.classList.toggle(`build-${tag}`, state.activeBuildTag === tag);
  });
  el.moodText.textContent = state.mood;
  if (renderCache.dialogue !== state.dialogue) {
    renderCache.dialogue = state.dialogue;
    el.dialogueText.classList.remove("dialogue-fade");
    void el.dialogueText.offsetWidth;
    el.dialogueText.textContent = state.dialogue;
    el.dialogueText.classList.add("dialogue-fade");
  }
  const buyableCount = state.sideUnlocked ? runUpgradeDefs.filter(u => state.tributes >= getRunUpgradeCost(u)).length : 0;
  const canAffordUpgrade = buyableCount > 0;
  // 공물이 늘어서 새로 구매 가능해졌을 때 HUD 바운스 + 최초 1회 힌트
  {
    const prev = el.tributeText._lastVal;
    if (state.tributes !== prev) {
      el.tributeText.textContent = formatNumber(state.tributes);
      el.tributeText._lastVal = state.tributes;
      if (canAffordUpgrade && state.tributes > prev) {
        const chip = el.tributeText.closest(".hud-stat--tribute");
        if (chip && !chip.classList.contains("tribute-bounce")) {
          chip.classList.add("tribute-bounce");
          window.setTimeout(() => chip.classList.remove("tribute-bounce"), 600);
        }
        if (!state._firstUpgradeHintSeen && state.run <= 1) {
          state._firstUpgradeHintSeen = true;
          window.setTimeout(() => showToast("🔸 강화 가능! 아래 [강화] 탭을 눌러보세요!"), 200);
        }
      }
    }
  }
  el.dpsText.textContent = canAffordUpgrade
    ? `강화 ${buyableCount}개 가능! (${formatNumber(state.tributes)} 공물)`
    : state.rescueStreak >= 3
    ? `연속 ${state.rescueStreak}회 · ${formatNumber(state.tributes)} 공물`
    : `${formatNumber(state.tributes)} 공물`;
  el.dpsText.dataset.canBuy = canAffordUpgrade ? "true" : "false";
  // 구매 가능한 강화 개수를 탭 뱃지로 표시
  const upgradeTabBtn = document.querySelector('.tab-btn[data-tab="upgrade"]');
  if (upgradeTabBtn) {
    upgradeTabBtn.classList.toggle("has-buyable", canAffordUpgrade);
    upgradeTabBtn.dataset.badge = canAffordUpgrade ? String(buyableCount) : "";
  }
  const canBuyUpgrade = canAffordUpgrade;
  const recRunUpgrade = canBuyUpgrade ? runUpgradeDefs.find(u => u.id === getRecommendedRunUpgrade()) : null;
  const objCard = el.objectiveText.closest(".objective-card") || el.objectiveText.parentElement;
  if (objCard) {
    objCard.classList.toggle("can-buy", canBuyUpgrade && !dangerReady && !dignityCritical);
  }
  el.objectiveText.textContent = dangerReady
    ? `⚡ 막기! 기력 ${Math.round(prepRate)}% → x${prepMult.toFixed(2)} 반격`
    : phase.aiming
      ? `조준 중 — 막기 준비! ${stats.timingWindow.toFixed(1)}s 안에 눌러야 성공`
      : dignityCritical
        ? `체면 ${dignityPercent}% 위험! 반드시 다음 공격을 막으세요`
        : canBuyUpgrade && recRunUpgrade
          ? `추천 강화: ${recRunUpgrade.name} — ${recRunUpgrade.desc} (강화 탭)`
          : canBuyUpgrade
            ? `공물 ${formatNumber(state.tributes)}개 — 강화 탭에서 구매 가능!`
            : (() => {
                if (state.sideUnlocked) {
                  const cheapest = runUpgradeDefs.map(u => getRunUpgradeCost(u)).sort((a,b) => a-b)[0] || 0;
                  const needed = Math.max(0, cheapest - Math.floor(state.tributes));
                  if (needed > 0) return `다음 강화까지 공물 ${formatNumber(needed)}개 더 필요 — 막기로 모으세요!`;
                }
                return nextStreakBonus
                  ? `${state.rescueStreak + 1}번째 막기 성공 시 연속 보너스! 기력 ${Math.round(prepRate)}%`
                  : prepRate >= 70
                    ? `기력 ${Math.round(prepRate)}% 충전 — 막으면 x${prepMult.toFixed(2)} 반격!`
                    : `막기를 눌러 기력 쌓기 → 적 공격 때 막으면 강한 반격!`;
              })();

  el.stagePanel.style.setProperty("--threat-progress", `${clamp(threatRate * 100, 0, 100)}%`);
  el.stagePanel.style.setProperty("--orb-progress", `${clamp(orbProgress * 100, 0, 100)}%`);
  el.stagePanel.style.setProperty("--timing-start", `${timingStart * 100}%`);
  el.stagePanel.style.setProperty("--danger-intensity", `${dangerReady ? 1 : phase.aiming ? clamp(threatRate, 0.28, 0.72) : 0}`);
  el.stagePanel.style.setProperty("--prep-progress", `${prepRate}%`);

  // 층 이벤트 배너
  let eventBanner = document.getElementById("floorEventBanner");
  if (state.floorEvent) {
    if (!eventBanner) {
      eventBanner = document.createElement("div");
      eventBanner.id = "floorEventBanner";
      eventBanner.className = "floor-event-banner";
      el.stagePanel.prepend(eventBanner);
    }
    eventBanner.textContent = `✦ ${state.floorEvent.label} — ${state.floorEvent.desc}`;
    eventBanner.classList.toggle("rage-event", state.floorEvent.id === "fast_enemy");
  } else if (eventBanner) {
    eventBanner.remove();
  }

  if (state.sceneTimer > 0 && state.sceneSrc) {
    if (el.sceneOverlay.getAttribute("src") !== state.sceneSrc) el.sceneOverlay.src = state.sceneSrc;
    el.sceneOverlay.classList.toggle("hit-scene", state.sceneKind === "hit");
    el.sceneOverlay.classList.toggle("rescue-scene", state.sceneKind === "rescue");
    el.sceneOverlay.classList.remove("hidden");
  } else {
    el.sceneOverlay.classList.add("hidden");
    el.sceneOverlay.classList.remove("hit-scene", "rescue-scene");
  }
  if (el.creditCut) {
    const showingCredit = state.creditTimer > 0;
    const wasHidden = el.creditCut.classList.contains("hidden");
    el.creditCut.classList.toggle("credit-hit", state.creditKind === "hit");
    el.creditCut.classList.toggle("credit-streak", state.creditKind === "streak");
    if (showingCredit) {
      el.creditTruth.textContent = state.creditTruth;
      el.creditClaim.textContent = state.creditClaim;
      if (wasHidden) {
        el.creditCut.classList.remove("hidden");
        el.creditCut.style.animation = "none";
        void el.creditCut.offsetWidth;
        // duration에 맞춰 animation 길이 동적 설정 — 2.4s면 2.4s 애니로
        const dur = state._creditDuration || 1.25;
        el.creditCut.style.animationDuration = `${dur}s`;
        el.creditCut.style.animation = "";
      }
    } else {
      el.creditCut.classList.add("hidden");
      el.creditCut.style.animationDuration = "";
    }
  }
  // 상황에 따른 캐릭터 이미지 선택 (impactSoon > pose 순위)
  const heroImage = impactSoon
    ? heroSprites.hit
    : (heroSprites[state.pose] || heroSprites.idle);
  if (el.mainCharacter.getAttribute("src") !== heroImage) el.mainCharacter.src = heroImage;

  // 신규 유저 단순화 — 첫 판 초반은 막기 버튼만 강조
  const isEarlyNewbie = state.run <= 1 && state.floor <= 3 && !state.firstBlockSeen;
  el.stagePanel.classList.toggle("newbie-focus", isEarlyNewbie);

  // 하단 탭 패널 잠금 상태 반영
  const bottomPanels = document.querySelector(".bottom-panels");
  if (bottomPanels) {
    const isLocked = !state.sideUnlocked && state.run <= 1 && state.floor < 2;
    bottomPanels.classList.toggle("side-locked", isLocked);
    bottomPanels.classList.toggle("newbie-dimmed", isEarlyNewbie);
  }
  if (el.reincarnateBtn) {
    const dignityFull = state.dignity >= getStats().maxDignity * 0.95;
    el.reincarnateBtn.classList.toggle("newbie-hidden", isEarlyNewbie && dignityFull);
  }
  if (el.saveBtn) {
    el.saveBtn.classList.toggle("newbie-hidden", isEarlyNewbie);
  }

  renderParts();
  renderStageReward();
  renderTraits();
  renderRunUpgrades();
  // 강화 탭에서 위협 발생 시 경고 배너 표시
  const upgradeTabActive = document.querySelector('.tab-btn[data-tab="upgrade"]')?.classList.contains("active");
  let upgradeWarnBanner = document.getElementById("upgradeWarnBanner");
  if (upgradeTabActive && (dangerReady || (phase.aiming && Math.max(0, state.enemy.attackTimer) <= 1.8))) {
    if (!upgradeWarnBanner) {
      upgradeWarnBanner = document.createElement("div");
      upgradeWarnBanner.id = "upgradeWarnBanner";
      upgradeWarnBanner.className = "upgrade-warn-banner";
      document.getElementById("tabUpgrade")?.prepend(upgradeWarnBanner);
    }
    upgradeWarnBanner.textContent = dangerReady ? "⚡ 지금 막아! 적이 공격 중!" : "⏱ 막기 준비! 곧 공격이 들어옵니다!";
    upgradeWarnBanner.classList.toggle("danger", dangerReady);
  } else if (upgradeWarnBanner) {
    upgradeWarnBanner.remove();
  }
  // 환생 버튼에 예상 파편 수 표시 (floor 변경 시만 갱신)
  if (el.reincarnateBtn && state.run >= 1) {
    const gainKey = `gain:${state.floor}:${Math.floor(state.tributes)}`;
    const gainSpan = el.reincarnateBtn.querySelector(".reinc-gain-hint");
    if (!gainSpan || gainSpan.dataset.key !== gainKey) {
      const gain = calculateReincarnateGain();
      if (!gainSpan) {
        const s = document.createElement("span");
        s.className = "reinc-gain-hint";
        s.dataset.key = gainKey;
        s.textContent = `+${gain}`;
        el.reincarnateBtn.appendChild(s);
      } else {
        gainSpan.textContent = `+${gain}`;
        gainSpan.dataset.key = gainKey;
      }
    }
  }
}

let _shakeTimer = null;
function shakeScreen(intensity = 1) {
  const stage = el.stagePanel;
  stage.style.setProperty("--shake-intensity", `${Math.round(intensity * 4)}px`);
  if (_shakeTimer) {
    clearTimeout(_shakeTimer);
    stage.classList.remove("shaking");
    void stage.offsetWidth;
  }
  stage.classList.add("shaking");
  _shakeTimer = window.setTimeout(() => {
    stage.classList.remove("shaking");
    _shakeTimer = null;
  }, 220);
}

let _hitstopTimer = null;
function hitstop(durationMs = 120) {
  const stage = el.stagePanel;
  if (!stage) return;
  if (_hitstopTimer) {
    clearTimeout(_hitstopTimer);
    stage.classList.remove("hitstop");
  }
  stage.classList.add("hitstop");
  _hitstopTimer = window.setTimeout(() => {
    stage.classList.remove("hitstop");
    _hitstopTimer = null;
  }, durationMs);
}

function spawnImpactFlash() {
  const div = document.createElement("div");
  div.className = "impact-flash";
  document.body.appendChild(div);
  window.setTimeout(() => div.remove(), 220);
}

// PERFECT 막기 전용 — 카메라 줌인 + 4방향 빛줄기 수렴 (Guilty Gear Roman Cancel 컨벤션)
function triggerPerfectConverge() {
  const stage = el.stagePanel?.querySelector(".main-stage") || el.stagePanel;
  if (!stage) return;
  // 줌인
  stage.classList.remove("perfect-zoom-in");
  void stage.offsetWidth;
  stage.classList.add("perfect-zoom-in");
  window.setTimeout(() => stage.classList.remove("perfect-zoom-in"), 360);
  // 4방향 수렴 빛줄기
  const dirs = ["top", "bottom", "left", "right"];
  dirs.forEach((d) => {
    const ray = document.createElement("div");
    ray.className = `perfect-converge-ray perfect-converge-ray-${d}`;
    stage.appendChild(ray);
    window.setTimeout(() => ray.remove(), 480);
  });
}

// 공물 누출 시각화 — 플레이어 위치에서 황금 파편이 적 방향으로 빨려나감
function spawnShardLeak(amount) {
  const stage = el.stagePanel?.querySelector(".main-stage");
  if (!stage) return;
  // 파편 개수: amount에 비례하지만 cap (4~12개)
  const count = Math.min(12, Math.max(4, Math.ceil(Math.log2(amount + 1) + 2)));
  for (let i = 0; i < count; i++) {
    const shard = document.createElement("span");
    shard.className = "shard-leak";
    // 시작 위치: 플레이어 영역 (좌하단 근처)
    const sx = 25 + Math.random() * 25;
    const sy = 60 + Math.random() * 25;
    // 종료 위치: 적 영역 (우상단 근처)
    const ex = 60 + Math.random() * 25;
    const ey = 20 + Math.random() * 25;
    shard.style.setProperty("--sx", `${sx}%`);
    shard.style.setProperty("--sy", `${sy}%`);
    shard.style.setProperty("--ex", `${ex}%`);
    shard.style.setProperty("--ey", `${ey}%`);
    shard.style.animationDelay = `${i * 30}ms`;
    stage.appendChild(shard);
    window.setTimeout(() => shard.remove(), 850 + i * 30);
  }
  // 잠깐 shard 카운터 흔들기 (값 빠짐 강조)
  if (el.shardText) {
    el.shardText.classList.remove("shard-leaked");
    void el.shardText.offsetWidth;
    el.shardText.classList.add("shard-leaked");
    window.setTimeout(() => el.shardText.classList.remove("shard-leaked"), 700);
  }
}

// ── 카메라 다이내믹스: 보스 진입/처치 시 main-stage transform 줌인 ──
let _camTimer = null;
function triggerCameraBossEntry() {
  const stage = el.stagePanel;
  if (!stage) return;
  if (_camTimer) { clearTimeout(_camTimer); _camTimer = null; }
  stage.classList.remove("cam-boss-entry", "cam-boss-defeat", "cam-elite-defeat");
  void stage.offsetWidth;
  stage.classList.add("cam-boss-entry");
  _camTimer = window.setTimeout(() => {
    stage.classList.remove("cam-boss-entry");
    _camTimer = null;
  }, 1400);
}
// 궁극기 결정타 — 풀스크린 흰 플래시 + 거대 "절초식!" 텍스트 + 방사형 빛줄기
function triggerUltimateFinisher() {
  // 흰 플래시 (강도 강화 + 0.5초 지속)
  const flash = document.createElement("div");
  flash.className = "ultimate-finisher-flash";
  document.body.appendChild(flash);
  window.setTimeout(() => flash.remove(), 600);

  // 풀스크린 컷인 — "절초식!" 거대 텍스트 + 방사형 빛
  const cutin = document.createElement("div");
  cutin.className = "ultimate-finisher-cutin";
  // 방사형 빛줄기 8개
  for (let i = 0; i < 8; i++) {
    const ray = document.createElement("span");
    ray.className = "ufc-ray";
    ray.style.setProperty("--rot", `${i * 45 + Math.random() * 8}deg`);
    ray.style.animationDelay = `${i * 30}ms`;
    cutin.appendChild(ray);
  }
  // 거대 텍스트
  const text = document.createElement("div");
  text.className = "ufc-text";
  // 보스/일반 적 구분해서 다른 텍스트
  const isBossFight = !!(state.enemy && state.enemy.isBoss);
  const labels = isBossFight
    ? ["✦ 절초식! ✦", "✦ 비전 폭발! ✦", "✦ 마왕의 일격! ✦"]
    : ["✦ 처치! ✦", "✦ 일격! ✦", "✦ 비전! ✦"];
  text.textContent = labels[Math.floor(Math.random() * labels.length)];
  cutin.appendChild(text);
  // 서브 텍스트
  const sub = document.createElement("div");
  sub.className = "ufc-sub";
  sub.textContent = "ULTIMATE";
  cutin.appendChild(sub);
  document.body.appendChild(cutin);
  window.setTimeout(() => {
    cutin.classList.add("fade-out");
    window.setTimeout(() => cutin.remove(), 250);
  }, 750);
}

function triggerCameraDefeat(isBoss, isElite) {
  const stage = el.stagePanel;
  if (!stage) return;
  if (_camTimer) { clearTimeout(_camTimer); _camTimer = null; }
  stage.classList.remove("cam-boss-entry", "cam-boss-defeat", "cam-elite-defeat");
  void stage.offsetWidth;
  if (isBoss) {
    stage.classList.add("cam-boss-defeat");
    _camTimer = window.setTimeout(() => {
      stage.classList.remove("cam-boss-defeat");
      _camTimer = null;
    }, 1100);
  } else if (isElite) {
    stage.classList.add("cam-elite-defeat");
    _camTimer = window.setTimeout(() => {
      stage.classList.remove("cam-elite-defeat");
      _camTimer = null;
    }, 650);
  }
}

function spawnImpactRay() {
  const stage = el.stagePanel;
  if (!stage) return;
  const ray = document.createElement("div");
  ray.className = "impact-ray";
  stage.appendChild(ray);
  window.setTimeout(() => ray.remove(), 460);
}

// 격투게임 hit-spark — 클릭 좌표에서 별 모양 4-6개 분사
function spawnTapHitSpark(coord, tapCombo = 0) {
  const stage = el.stagePanel;
  if (!stage || !coord) return;
  const sparkCount = tapCombo >= 8 ? 6 : tapCombo >= 4 ? 5 : 4;
  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement("span");
    spark.className = "tap-hit-spark";
    const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.4;
    const dist = 18 + Math.random() * 22 + Math.min(12, tapCombo);
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist);
    const size = 6 + Math.random() * 4 + Math.min(4, tapCombo * 0.3);
    spark.style.left = `${coord.x}px`;
    spark.style.top = `${coord.y}px`;
    spark.style.setProperty("--dx", `${dx}px`);
    spark.style.setProperty("--dy", `${dy}px`);
    spark.style.setProperty("--sz", `${size}px`);
    if (tapCombo >= 8) spark.classList.add("tap-hit-spark-hot");
    stage.appendChild(spark);
    window.setTimeout(() => spark.remove(), 380);
  }
  // 중앙 큰 ring 1개
  const ring = document.createElement("span");
  ring.className = "tap-hit-ring";
  ring.style.left = `${coord.x}px`;
  ring.style.top = `${coord.y}px`;
  if (tapCombo >= 8) ring.classList.add("tap-hit-ring-hot");
  stage.appendChild(ring);
  window.setTimeout(() => ring.remove(), 320);
}

function enemyImpactHit() {
  if (!el.arenaEnemy) return;
  el.arenaEnemy.classList.remove("enemy-impact");
  void el.arenaEnemy.offsetWidth;
  el.arenaEnemy.classList.add("enemy-impact");
  window.setTimeout(() => el.arenaEnemy?.classList.remove("enemy-impact"), 340);
}

function spawnAttackTelegraph() {
  const stage = el.stagePanel?.querySelector(".main-stage");
  if (!stage) return;
  const tg = document.createElement("span");
  tg.className = "attack-telegraph";
  stage.appendChild(tg);
  window.setTimeout(() => tg.remove(), 460);
}

function flashDangerVignette() {
  const v = document.getElementById("dangerVignette");
  if (!v) return;
  v.classList.remove("flash");
  void v.offsetWidth;
  v.classList.add("flash");
  window.setTimeout(() => v.classList.remove("flash"), 470);
}

function applyHpDangerClass(dignityRate) {
  document.body.classList.toggle("hp-critical", dignityRate <= 0.25);
  document.body.classList.toggle("hp-warning", dignityRate > 0.25 && dignityRate <= 0.5);
}

function getStageHue(floor) {
  // 1~3 새벽(파랑) / 4~6 대낮(시안) / 7~9 노을(주황) / 10~14 밤(보라) / 15+ 핏빛
  if (floor <= 3) return 220;       // deep blue
  if (floor <= 6) return 195;       // cyan/teal daylight
  if (floor <= 9) return 28;        // sunset orange
  if (floor <= 14) return 270;      // night purple
  if (floor <= 19) return 320;      // magenta
  return 0;                          // blood red 20+
}

function applyStageHue() {
  const hue = getStageHue(state.floor || 1);
  el.stagePanel?.style.setProperty("--stage-hue", String(hue));
  el.stagePanel?.classList.toggle("stage-night", state.floor >= 10 && state.floor < 15);
  el.stagePanel?.classList.toggle("stage-blood", state.floor >= 20);
}

function spawnStageMote() {
  const stage = el.stagePanel?.querySelector(".main-stage");
  if (!stage) return;
  const mote = document.createElement("span");
  mote.className = "stage-mote";
  const x = Math.random() * 100;
  const y = 5 + Math.random() * 30;
  const dur = 6 + Math.random() * 5;
  const drift = (Math.random() - 0.5) * 80;
  mote.style.setProperty("--mote-x", `${x}%`);
  mote.style.setProperty("--mote-y", `${y}%`);
  mote.style.setProperty("--mote-dur", `${dur}s`);
  mote.style.setProperty("--mote-drift", `${drift}px`);
  const size = 2 + Math.random() * 3;
  mote.style.width = `${size}px`;
  mote.style.height = `${size}px`;
  stage.appendChild(mote);
  window.setTimeout(() => mote.remove(), dur * 1000 + 200);
}

let _moteInterval = null;
let _motesStarted = false;
function startStageMotes() {
  if (_moteInterval) return;
  _moteInterval = window.setInterval(() => {
    if (document.hidden) return;
    if (state.paused) return;
    spawnStageMote();
  }, 850);
}

function spawnDefeatShards(count = 10) {
  const stage = el.stagePanel;
  if (!stage) return;
  const colors = ["#fff7d6", "#ffe066", "#ff9de2", "#86d8c7", "#b9dcff", "#ffaa6e"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "defeat-shard";
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 90 + Math.random() * 140;
    s.style.setProperty("--sdx", `${Math.round(Math.cos(angle) * dist)}px`);
    s.style.setProperty("--sdy", `${Math.round(Math.sin(angle) * dist - 30)}px`);
    s.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 720)}deg`);
    s.style.background = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 10;
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;
    s.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    stage.appendChild(s);
    window.setTimeout(() => s.remove(), 900);
  }
}

const _pulseLastValues = new Map();
function pulseValue(node, value, direction = "auto") {
  if (!node) return;
  const key = node.id || node.className;
  const prev = _pulseLastValues.get(key);
  _pulseLastValues.set(key, value);
  if (prev === undefined || prev === value) return;
  const cls = direction === "down" ? "value-pulse-down"
    : direction === "flash" ? "value-pulse-flash"
    : (typeof prev === "number" && typeof value === "number" && value < prev) ? "value-pulse-down"
    : "value-pulse-up";
  node.classList.remove("value-pulse-up", "value-pulse-down", "value-pulse-flash");
  void node.offsetWidth;
  node.classList.add(cls);
  window.setTimeout(() => node.classList.remove(cls), 460);
}

function flashScreen(color = "white", duration = 0.35) {
  const div = document.createElement("div");
  div.className = `screen-flash ${color}`;
  div.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:9999;--flash-dur:${duration}s`;
  document.body.appendChild(div);
  window.setTimeout(() => div.remove(), duration * 1000 + 50);
}

let _fightComboLast = 0;
let _fightComboHideTimer = null;
function updateFightCombo(streak) {
  const node = el.fightCombo;
  const numNode = el.fightComboNum;
  const multNode = el.fightComboMult;
  if (!node || !numNode) return;
  const next = Math.max(0, streak | 0);
  if (next < 2) {
    if (_fightComboLast >= 2 && !node.classList.contains("hidden")) {
      // 콤보가 끊기면 큰 COMBO BREAK 배너 (3 이상에서만)
      if (_fightComboLast >= 3) {
        showComboBreak(_fightComboLast);
      }
      node.classList.remove("fc-pop", "fc-mega", "fc-milestone", "fc-legend");
      node.classList.add("fc-fade");
      window.clearTimeout(_fightComboHideTimer);
      _fightComboHideTimer = window.setTimeout(() => {
        node.classList.add("hidden");
        node.classList.remove("fc-fade");
      }, 380);
    }
    _fightComboLast = next;
    return;
  }
  // 2 이상
  window.clearTimeout(_fightComboHideTimer);
  node.classList.remove("hidden", "fc-fade");
  numNode.textContent = String(next);
  node.classList.toggle("fc-mega", next >= 10);
  node.classList.toggle("fc-legend", next >= 20);
  // 배율 표시 — 막기 보상에 곱해지는 실제 배율
  if (multNode) {
    const mult = (typeof getComboMultiplier === "function") ? getComboMultiplier() : 1;
    multNode.textContent = `x${mult.toFixed(2)}`;
  }
  // pop 재트리거
  node.classList.remove("fc-pop", "fc-milestone");
  void node.offsetWidth;
  // 마일스톤(3/5/10/20)에는 더 큰 임팩트
  if (next === 3 || next === 5 || next === 10 || next === 20 || next === 30) {
    node.classList.add("fc-milestone");
    // 마일스톤 폭발 파티클
    spawnComboMilestoneBurst(next);
  } else {
    node.classList.add("fc-pop");
  }
  _fightComboLast = next;
}

// 콤보 마일스톤 — 콤보 카운터 주변에서 황금 별 파티클 분사
function spawnComboMilestoneBurst(streak) {
  const node = el.fightCombo;
  if (!node) return;
  const stage = el.stagePanel?.querySelector(".main-stage");
  if (!stage) return;
  const stageRect = stage.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  const cx = ((nodeRect.left + nodeRect.width / 2 - stageRect.left) / stageRect.width) * 100;
  const cy = ((nodeRect.top + nodeRect.height / 2 - stageRect.top) / stageRect.height) * 100;
  const count = Math.min(20, 6 + Math.floor(streak / 2));
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "combo-milestone-star";
    if (streak >= 20) star.classList.add("legend");
    else if (streak >= 10) star.classList.add("mega");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 30 + Math.random() * 25;
    star.style.left = `${cx}%`;
    star.style.top = `${cy}%`;
    star.style.setProperty("--dx", `${Math.cos(angle) * dist}vw`);
    star.style.setProperty("--dy", `${Math.sin(angle) * dist}vh`);
    star.style.animationDelay = `${i * 18}ms`;
    stage.appendChild(star);
    window.setTimeout(() => star.remove(), 900 + i * 18);
  }
}

// 콤보 깨짐 배너 — 화면 중앙에 짧게
function showComboBreak(brokenStreak) {
  const stage = el.stagePanel;
  if (!stage) return;
  const banner = document.createElement("div");
  banner.className = "combo-break-banner";
  banner.innerHTML = `<span class="cbb-num">${brokenStreak}</span><span class="cbb-label">COMBO BREAK</span>`;
  stage.appendChild(banner);
  window.setTimeout(() => banner.remove(), 900);
}

// ── 탭 즉시 피드백 + KO 슬로우모션 + KO 도장 ──────────────
let _tapFeedbackTimer = null;
function triggerTapFeedback() {
  if (!el.stagePanel) return;
  el.stagePanel.classList.remove("tap-feedback");
  void el.stagePanel.offsetWidth;
  el.stagePanel.classList.add("tap-feedback");
  if (_tapFeedbackTimer) window.clearTimeout(_tapFeedbackTimer);
  _tapFeedbackTimer = window.setTimeout(() => {
    el.stagePanel?.classList.remove("tap-feedback");
  }, 100);
  // 햅틱 (모바일)
  if (navigator.vibrate) {
    try { navigator.vibrate(8); } catch (e) {}
  }
}

let _koActive = false;
function triggerKoSlowmo(isBoss = false) {
  if (!el.stagePanel) return;
  if (_koActive) return;
  _koActive = true;
  const cls = isBoss ? "ko-slowmo-boss" : "ko-slowmo";
  el.stagePanel.classList.add(cls);
  // 햅틱 강하게
  if (navigator.vibrate) {
    try { navigator.vibrate(isBoss ? [40, 30, 80] : [25]); } catch (e) {}
  }
  window.setTimeout(() => {
    el.stagePanel?.classList.remove("ko-slowmo", "ko-slowmo-boss");
    _koActive = false;
  }, isBoss ? 600 : 360);
}

function showKoStamp(isBoss = false, enemyName = "") {
  const stamp = document.createElement("div");
  stamp.className = isBoss ? "ko-stamp ko-stamp-boss" : "ko-stamp";
  const text = isBoss ? "BOSS DOWN" : "K.O.";
  stamp.innerHTML = `
    <span class="ko-stamp-text">${text}</span>
    ${enemyName ? `<span class="ko-stamp-name">${enemyName}</span>` : ""}
  `;
  document.body.appendChild(stamp);
  window.setTimeout(() => stamp.remove(), isBoss ? 1100 : 700);
}

// ── 콤보 도박 정산 시스템 ──────────────────────────────────
// 마일스톤 도달 시 일시정지 + 정산/계속 결정 모달
// 정산: 즉시 보상 받고 콤보 0
// 계속: 콤보 유지하고 다음 마일스톤까지 (실패 시 직전 마일스톤 보상의 50% 잃음)
const COMBO_MILESTONES = [
  { streak: 10, shards: 1, lootMult: 1.5, dignityBonus: 4,  label: "Bronze",  color: "#c89878" },
  { streak: 20, shards: 3, lootMult: 2.5, dignityBonus: 8,  label: "Silver",  color: "#d8d8e0" },
  { streak: 35, shards: 7, lootMult: 4.0, dignityBonus: 16, label: "Gold",    color: "#ffd76a" },
  { streak: 55, shards: 14,lootMult: 6.5, dignityBonus: 28, label: "Diamond", color: "#b8e8ff" },
];

function getNextComboMilestone(streak) {
  for (const m of COMBO_MILESTONES) {
    if (streak < m.streak) return m;
  }
  return null;
}
function getCurrentComboMilestone(streak) {
  let last = null;
  for (const m of COMBO_MILESTONES) {
    if (streak >= m.streak) last = m;
    else break;
  }
  return last;
}

function checkComboMilestone() {
  const streak = state.rescueStreak || 0;
  const m = COMBO_MILESTONES.find(x => x.streak === streak);
  if (!m) return;
  if (state.paused) return; // 보스 카드 등 다른 모달 중이면 패스
  showComboBetModal(m);
}

function showComboBetModal(m) {
  let overlay = document.getElementById("comboBetOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "comboBetOverlay";
    overlay.className = "combo-bet-overlay";
    overlay.innerHTML = `
      <div class="cb-bg"></div>
      <div class="cb-panel">
        <div class="cb-header">
          <span class="cb-title">콤보 ${m.streak}연속 도달!</span>
          <span class="cb-grade" id="cbGrade">${m.label}</span>
        </div>
        <p class="cb-question" id="cbQuestion">지금 정산할까, 더 갈까?</p>
        <div class="cb-rewards">
          <div class="cb-card cb-card--cashout" data-action="cashout">
            <div class="cb-card-icon">💰</div>
            <div class="cb-card-title">정산하기</div>
            <div class="cb-card-rewards" id="cbCashoutRewards"></div>
            <div class="cb-card-flavor">안전. 콤보 0으로 리셋.</div>
          </div>
          <div class="cb-card cb-card--continue" data-action="continue">
            <div class="cb-card-icon">🔥</div>
            <div class="cb-card-title">더 가자</div>
            <div class="cb-card-rewards" id="cbContinueRewards"></div>
            <div class="cb-card-flavor">콤보 끊기면 <em>50% 손실</em>.</div>
          </div>
        </div>
        <div class="cb-timer-bar"><div class="cb-timer-fill" id="cbTimerFill"></div></div>
        <p class="cb-tip">10초 안에 결정하지 않으면 자동 정산됩니다.</p>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('[data-action="cashout"]').addEventListener("click", () => {
      hideComboBetModal();
      cashoutComboBet(m);
    });
    overlay.querySelector('[data-action="continue"]').addEventListener("click", () => {
      hideComboBetModal();
      continueComboBet(m);
    });
  }
  // 보상 텍스트 업데이트
  const cashout = overlay.querySelector("#cbCashoutRewards");
  const cont = overlay.querySelector("#cbContinueRewards");
  cashout.innerHTML = `
    <div class="cb-r-row"><span>파편</span><strong>+${m.shards} 💠</strong></div>
    <div class="cb-r-row"><span>공물</span><strong>×${m.lootMult.toFixed(1)}</strong></div>
    <div class="cb-r-row"><span>체면</span><strong>+${m.dignityBonus}</strong></div>
  `;
  const next = getNextComboMilestone(m.streak);
  if (next) {
    cont.innerHTML = `
      <div class="cb-r-row cb-r-future"><span>다음 (${next.streak}연속)</span></div>
      <div class="cb-r-row"><span>파편</span><strong>+${next.shards} 💠</strong></div>
      <div class="cb-r-row"><span>공물</span><strong>×${next.lootMult.toFixed(1)}</strong></div>
      <div class="cb-r-row"><span>체면</span><strong>+${next.dignityBonus}</strong></div>
    `;
  } else {
    cont.innerHTML = `
      <div class="cb-r-row cb-r-future"><span>최고 등급 도달!</span></div>
      <div class="cb-r-row"><span>이후 연속</span><strong>×${(m.lootMult * 0.5).toFixed(1)} 추가</strong></div>
    `;
  }
  // 등급 색상
  const gradeEl = overlay.querySelector("#cbGrade");
  if (gradeEl) gradeEl.style.color = m.color;
  overlay.classList.remove("hidden");
  state.paused = true;
  state._comboBetActive = true;
  state._comboBetMilestone = m;
  // 타이머 (10초)
  const fill = overlay.querySelector("#cbTimerFill");
  if (fill) {
    fill.style.transition = "none";
    fill.style.width = "100%";
    void fill.offsetWidth;
    fill.style.transition = "width 10s linear";
    fill.style.width = "0%";
  }
  if (state._comboBetTimer) window.clearTimeout(state._comboBetTimer);
  state._comboBetTimer = window.setTimeout(() => {
    if (state._comboBetActive) {
      hideComboBetModal();
      cashoutComboBet(m);
    }
  }, 10000);
  playSfx("perfect");
}

function hideComboBetModal() {
  const overlay = document.getElementById("comboBetOverlay");
  if (overlay) overlay.classList.add("hidden");
  state.paused = false;
  state._comboBetActive = false;
  if (state._comboBetTimer) {
    window.clearTimeout(state._comboBetTimer);
    state._comboBetTimer = null;
  }
}

function cashoutComboBet(m) {
  // 즉시 보상 지급
  const maxDig = (typeof stats !== "undefined" && stats?.maxDignity) ? stats.maxDignity : 999;
  state.dignity = clamp((state.dignity || 0) + m.dignityBonus, 0, maxDig);
  state.shards = (state.shards || 0) + m.shards;
  // 공물 즉시 보너스 = 마지막 적 처치 보상 기준 추정 → 직접 베이스 계산
  const baseLoot = Math.max(8, Math.floor((state.floor || 1) * 6 * (m.lootMult - 1)));
  gainTributes(baseLoot, "comboCashout");
  // 콤보 리셋 + 잠금 해제
  state.rescueStreak = 0;
  state._lastCashedMilestone = m.streak;
  // 화면 임팩트
  flashScreen("gold", 0.55);
  spawnParticles(28);
  showToast(`💰 ${m.label} 정산! +${m.shards}💠 +${m.dignityBonus}체면 +${baseLoot}공물`);
  showComboCashoutBurst(m);
  playSfx("ultimate");
}

function continueComboBet(m) {
  // 베팅 유지 — 다음 마일스톤까지 콤보 살리고, 끊기면 50% 페널티
  state._comboBetPending = m; // 도달했지만 정산 안 한 마일스톤
  showToast(`🔥 ${m.label} 베팅 유지! 다음 ${(getNextComboMilestone(m.streak)?.streak || m.streak + 20)}연속까지 가세요!`);
  flashScreen("rose", 0.35);
  playSfx("rescue");
}

function forfeitComboBet(brokenStreak) {
  const pending = state._comboBetPending;
  if (!pending) return;
  // 50% 페널티: 절반만 받음
  const half = (n) => Math.max(0, Math.floor(n * 0.5));
  const lostShards = pending.shards - half(pending.shards);
  const lostDignity = pending.dignityBonus - half(pending.dignityBonus);
  state.shards = (state.shards || 0) + half(pending.shards);
  const maxDig2 = (typeof stats !== "undefined" && stats?.maxDignity) ? stats.maxDignity : 999;
  state.dignity = clamp((state.dignity || 0) + half(pending.dignityBonus), 0, maxDig2);
  showToast(`💢 베팅 실패! ${pending.label} 50% 손실 (-${lostShards}💠 -${lostDignity}체면)`);
  flashScreen("rose", 0.5);
  shakeScreen(1.4);
  state._comboBetPending = null;
  state._lastCashedMilestone = 0;
}

function showComboCashoutBurst(m) {
  const burst = document.createElement("div");
  burst.className = "combo-cashout-burst";
  burst.innerHTML = `<span class="ccb-grade">${m.label}</span><span class="ccb-text">정산 완료!</span>`;
  burst.style.setProperty("--ccb-color", m.color);
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1400);
}

// ── 보스 카드 시스템 ───────────────────────────────────────
const BOSS_MODIFIERS = {
  shield: { label: "🛡 방어", className: "mod-shield", incomingMod: 0.7,  damageMod: 1.0,  attackTimeMod: 1.25, lootMod: 1.0,  dignityRewardMod: 1.0 },
  gamble: { label: "⚔ 광기", className: "mod-gamble", incomingMod: 1.2,  damageMod: 1.6,  attackTimeMod: 1.0,  lootMod: 1.0,  dignityRewardMod: 1.0 },
  loot:   { label: "💰 약탈", className: "mod-loot",   incomingMod: 1.0,  damageMod: 1.0,  attackTimeMod: 1.0,  lootMod: 2.0,  dignityRewardMod: 0.5 },
};

function getBossModifier() {
  const id = state._bossModifierId;
  return id ? BOSS_MODIFIERS[id] : null;
}

function showBossCardsModal() {
  const node = el.bossCardsOverlay;
  if (!node) return;
  // 이미 띄워져 있거나 이미 선택된 적 있으면 패스
  if (state._bossModifierId || !node.classList.contains("hidden")) return;
  if (el.bossCardsName && state.enemy?.name) {
    el.bossCardsName.textContent = `${state.enemy.name} 등장!`;
  }
  node.classList.remove("hidden");
  // 카드 선택 동안은 게임 멈춤 — 결정에 집중
  state._bossCardsPaused = true;
  state.paused = true;
  // BGM/사운드 살짝
  try { playSfx("danger"); } catch {}
}

function hideBossCardsModal() {
  el.bossCardsOverlay?.classList.add("hidden");
  if (state._bossCardsPaused) {
    state._bossCardsPaused = false;
    state.paused = false;
  }
}

function applyBossModifierBadge() {
  const badge = el.bossModifierBadge;
  if (!badge) return;
  const mod = getBossModifier();
  badge.classList.remove("active", "mod-shield", "mod-gamble", "mod-loot");
  if (mod && state.enemy?.isBoss) {
    badge.classList.add("active", mod.className);
    badge.textContent = mod.label;
  } else {
    badge.textContent = "";
  }
}

function chooseBossCard(modId) {
  if (!BOSS_MODIFIERS[modId]) return;
  state._bossModifierId = modId;
  // 보스 적의 공격 시간/속도 조정
  if (state.enemy?.isBoss) {
    const mod = BOSS_MODIFIERS[modId];
    state.enemy.attackMax = (state.enemy.attackMax || 8) * mod.attackTimeMod;
    state.enemy.attackTimer = Math.max(state.enemy.attackTimer || 0, state.enemy.attackMax * 0.6);
  }
  applyBossModifierBadge();
  hideBossCardsModal();
  try { playSfx("ultimate"); } catch {}
  showToast(`${BOSS_MODIFIERS[modId].label} 작전 선택!`);
  // stage hue를 모디파이어 색조로 살짝
  const stageHueMap = { shield: 210, gamble: 0, loot: 38 };
  if (el.stagePanel) el.stagePanel.style.setProperty("--stage-hue", String(stageHueMap[modId] || 230));
}

// 보스 카드 버튼 이벤트 — DOMContentLoaded 후 한 번만
function bindBossCardListeners() {
  const overlay = el.bossCardsOverlay;
  if (!overlay) return;
  overlay.querySelectorAll(".boss-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mod = btn.getAttribute("data-mod");
      if (mod) chooseBossCard(mod);
    });
  });
}

function spawnDamage(amount, good = false, label = "") {
  const isCrit = good && !label;
  const node = document.createElement("span");

  // 데미지 양 + 층수에 비례한 폰트 크기 계산
  const floor = (state && state.floor) || 1;
  const floorScale = good ? Math.min(1.55, 1 + (floor - 1) * 0.022) : 1;
  const baseSize = isCrit ? 1.6 : 1.0;
  const sizeBoost = Math.min(1.4, 1 + Math.log10(Math.max(1, amount) / 100) * 0.18);
  const fontSize = (baseSize * sizeBoost * floorScale).toFixed(2);

  // 콤보 수 표시 (반격 숫자에 콤보 5 이상일 때)
  const streak = state && state.rescueStreak || 0;
  let text;
  if (label === "체면") {
    text = `체면 -${formatNumber(amount)}`;
  } else if (label === "dignity") {
    text = `체면 +${formatNumber(amount)}`;
  } else if (label) {
    text = streak >= 5 ? `${label} ×${streak}` : label;
  } else {
    text = isCrit ? `CRIT!\n${formatNumber(amount)}` : formatNumber(amount);
  }

  if (isCrit) {
    node.className = "damage-pop good crit-pop";
    node.style.fontSize = `${fontSize}em`;
    node.style.whiteSpace = "pre";
    // 파티클 폭발 추가
    for (let i = 0; i < 8; i++) {
      const p = document.createElement("span");
      p.className = "particle crit-particle";
      const angle = (i / 8) * Math.PI * 2;
      const dist = 40 + Math.random() * 40;
      p.style.setProperty("--pdx", `${Math.round(Math.cos(angle) * dist)}px`);
      p.style.setProperty("--pdy", `${Math.round(Math.sin(angle) * dist)}px`);
      el.damageLayer.appendChild(p);
      window.setTimeout(() => p.remove(), 600);
    }
  } else if (label === "dignity") {
    node.className = "damage-pop good dignity-pop";
    node.style.fontSize = "0.85em";
  } else {
    node.className = `damage-pop${good ? " good" : ""}`;
    node.style.fontSize = `${fontSize}em`;
  }

  node.textContent = text;
  const dx = label ? -120 + Math.round((Math.random() - 0.5) * 42) : Math.round((Math.random() - 0.5) * 150);
  node.style.setProperty("--dx", `${dx}px`);
  el.damageLayer.appendChild(node);
  window.setTimeout(() => node.remove(), 820);
}

function spawnPrep(amount) {
  const node = document.createElement("span");
  node.className = "damage-pop good prep-pop";
  node.textContent = `기력 +${Math.round(amount)}%`;
  node.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 130)}px`);
  el.damageLayer.appendChild(node);
  window.setTimeout(() => node.remove(), 820);
}

function spawnParticles(count) {
  const colors = ["#f09abb", "#86d8c7", "#f3c55f", "#b9dcff", "#ff9de2", "#a8f5e0", "#ffe066"];
  for (let i = 0; i < count; i += 1) {
    const p = document.createElement("span");
    p.className = "particle";
    const size = 5 + Math.random() * 9;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.setProperty("--x", `${Math.round((Math.random() - 0.5) * 320)}px`);
    p.style.setProperty("--y", `${Math.round(-50 - Math.random() * 200)}px`);
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.particleLayer.appendChild(p);
    window.setTimeout(() => p.remove(), 600 + Math.random() * 200);
  }
}

// 토스트 메시지 분류: critical(반드시 표시) / tutorial(필수 학습) / info(생략 가능)
const _CRITICAL_TOAST_PATTERNS = [
  /신기록/, /보스 격파/, /^💰/, /^🔥/, /^💢/, /파편 \+\d/, /획득$/, /해금/, /돌파/,
];
const _TUTORIAL_TOAST_PATTERNS = [
  /처음/, /첫 /, /💡/, /기력 MAX/, /기력 70%/, /가로채기/, /빨간/, /막기/, /궁극기 준비/, /궁극기 50%/,
];

function _classifyToastPriority(message) {
  for (const re of _CRITICAL_TOAST_PATTERNS) if (re.test(message)) return "critical";
  for (const re of _TUTORIAL_TOAST_PATTERNS) if (re.test(message)) return "tutorial";
  return "info";
}

let _lastToastTime = 0;
const _MIN_TOAST_INTERVAL = 600; // 동일 시점 폭격 방지

function showToast(message) {
  const priority = _classifyToastPriority(message);
  const isBossFight = !!(state.enemy && (state.enemy.isBoss || state.enemy.isElite));
  const isDanger = !!(el.stagePanel && (el.stagePanel.classList.contains("danger") || el.stagePanel.classList.contains("aiming")));
  // 보스/엘리트 전투 중이거나 적이 공격 준비(빨간불) 중이면 info 토스트는 차단
  if ((isBossFight || isDanger) && priority === "info") return;
  // 튜토리얼 토스트는 첫 학습 시기 외에는 보스전에서 차단
  if (isBossFight && priority === "tutorial" && state.run > 1 && state.firstBlockSeen) return;
  // 신규 유저 — 동시 최대 1개
  const isNewbie = (state.floor <= 3 && state.run <= 1) || (!state.firstBlockSeen);
  const maxToasts = isNewbie ? 1 : 1; // 항상 1개로 제한 (이전 2 → 1)
  while (el.toastStack.children.length >= maxToasts) {
    el.toastStack.firstChild?.remove();
  }
  // 직전 토스트와 동일 메시지 스팸 방지
  const lastToast = el.toastStack.lastChild;
  if (lastToast && lastToast.textContent === message) return;
  // 600ms 이내 연속 호출이면 critical만 통과
  const now = performance.now();
  if (now - _lastToastTime < _MIN_TOAST_INTERVAL && priority !== "critical") return;
  _lastToastTime = now;
  const toast = document.createElement("div");
  toast.className = `toast toast-${priority}`;
  toast.textContent = message;
  el.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 1600);
  window.setTimeout(() => toast.remove(), 1950);
}

function showGradePopup(timingKey) {
  const labelMap = { perfect: "PERFECT!", great: "GREAT!", guard: "가로채기 성공", early: "" };
  const text = labelMap[timingKey];
  if (!text) return;
  const wrapper = document.createElement("div");
  wrapper.className = "grade-popup";
  const span = document.createElement("span");
  span.className = `grade-popup-text grade-${timingKey}`;
  span.textContent = text;
  wrapper.appendChild(span);
  document.body.appendChild(wrapper);
  window.setTimeout(() => wrapper.remove(), 920);

  if (timingKey === "perfect") {
    const stage = el.stagePanel;
    stage.classList.add("perfect-flash");
    window.setTimeout(() => stage.classList.remove("perfect-flash"), 320);
  }
}

function showBlockBurst(timingKey) {
  const stage = el.stagePanel;
  if (!stage) return;
  const burst = document.createElement("div");
  burst.className = `block-burst block-burst--${timingKey}`;
  const streak = state.rescueStreak || 0;
  const floor = state.floor || 1;
  // streak/층수에 따라 더 과한 문구
  let label;
  if (timingKey === "perfect") {
    if (streak >= 7) label = randomPick(["PERFECT!! 전설이니라!", "신의 영역이니라!!", "짐이 원래 이래!!"]);
    else if (streak >= 4) label = randomPick(["PERFECT!! 보좌관이 최고야!", "짐의 위엄이다!!", "이건 다 계획이니라!"]);
    else label = randomPick(["PERFECT BLOCK!", "완벽하니라!", "예측했느니라!"]);
  } else if (timingKey === "great") {
    if (streak >= 3) label = randomPick(["GREAT!! 연속이니라!", "훌륭하다 보좌관!"]);
    else label = randomPick(["GREAT BLOCK!", "잘 막았느니라!"]);
  } else {
    if (floor >= 15) label = randomPick(["BLOCK! 짐이 막— 아 보좌관이", "막았다! (보좌관이)", "어림없다!"]);
    else label = randomPick(["BLOCK!", "막았느니라!", "통과 못 한다!"]);
  }
  burst.textContent = label;
  stage.appendChild(burst);
  window.setTimeout(() => burst.remove(), 750);
}

function showBossTitleOverlay(bossName, bossIntent, bossImage) {
  const overlay = document.createElement("div");
  overlay.className = "boss-title-overlay";
  const imgHtml = bossImage ? `<img src="${bossImage}" alt="" class="boss-title-img" />` : "";
  overlay.innerHTML = `
    ${imgHtml}
    <div class="boss-title-name">${bossName}</div>
    <div class="boss-title-line"></div>
    <div class="boss-title-sub">${bossIntent}</div>
  `;
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 2300);
}

function showNextBossTeaser(bossFloor, bossName, floorsAway, rewardHint) {
  const existing = document.querySelector(".next-boss-teaser");
  if (existing) existing.remove();
  const card = document.createElement("div");
  card.className = "next-boss-teaser";
  const awayText = floorsAway <= 0 ? "바로 다음 층!" : `${floorsAway}층 후 등장`;
  card.innerHTML = `
    <span class="nbt-kicker">다음 목표</span>
    <strong class="nbt-floor">${bossFloor}F 보스</strong>
    <span class="nbt-name">${bossName}</span>
    <span class="nbt-away">${awayText}</span>
    <em class="nbt-reward">▶ ${rewardHint}</em>
  `;
  document.body.appendChild(card);
  window.setTimeout(() => {
    card.classList.add("nbt-exit");
    window.setTimeout(() => card.remove(), 400);
  }, 3800);
}

function showEnemyNameBadge(name, label) {
  const badge = document.createElement("div");
  badge.className = "enemy-name-badge";
  badge.innerHTML = `<span class="enemy-badge-label">${label}</span><strong class="enemy-badge-name">${name}</strong>`;
  document.body.appendChild(badge);
  window.setTimeout(() => {
    badge.classList.add("enemy-badge-exit");
    window.setTimeout(() => badge.remove(), 300);
  }, 1200);
}

function showEnemyTauntBubble(kind, isBoss) {
  const key = isBoss ? (kind + "_boss") : kind;
  const pool = enemyTaunts[key] || enemyTaunts[kind] || ["..!"];
  const text = randomPick(pool);
  const existing = document.querySelector(".enemy-taunt-bubble");
  if (existing) existing.remove();
  const bubble = document.createElement("div");
  bubble.className = "enemy-taunt-bubble";
  bubble.textContent = text;
  el.stagePanel.appendChild(bubble);
  window.setTimeout(() => {
    bubble.classList.add("taunt-exit");
    window.setTimeout(() => bubble.remove(), 300);
  }, 1800);
}

// ④ 기력 MAX 시 전투 영역 "지금 막으세요!" 힌트
function showPrepMaxHint() {
  if (el.stagePanel.querySelector(".prep-max-hint")) return;
  const hint = document.createElement("div");
  hint.className = "prep-max-hint";
  hint.textContent = "기력 MAX — 지금 막으세요!";
  el.stagePanel.appendChild(hint);
  // 적이 공격하거나 기력 소진 시 자동 제거
  const cleanup = () => { hint.remove(); };
  window.setTimeout(cleanup, 6000);
}

// ① 층 클리어 "NF 돌파!" 금빛 flash
function showDefeatMoment() {
  // 빨간 화면 가득 채우기 + 마왕 최후 대사
  flashScreen("red", 0.7);
  shakeScreen(3.5);
  spawnParticles(0);
  const defeatLines = [
    "으... 이, 이건 전략적 후퇴니라! 절대 진 게 아니니라!!",
    "기다려라...! 짐은 아직... 짐은 여기서 끝나지 않느니라!",
    "보좌관들아...! 짐을 배신한 것이냐...! 흑흑.",
    "이건 꿈이니라...! 짐이 이런 잡것에게...!",
  ];
  setDialogue(randomPick(defeatLines), "울먹임");
  // 화면 전체 어두워지는 패배 오버레이
  const overlay = document.createElement("div");
  overlay.className = "defeat-overlay";
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 700);
}

function showFloorClearBurst(floor) {
  const burst = document.createElement("div");
  burst.className = "floor-clear-burst";
  // 층수별 감탄사
  const floorSuffix = floor >= 25 ? " 전설이니라!!" : floor >= 20 ? " 경이롭다!!" : floor >= 15 ? " 대단하다!!" : floor >= 10 ? " 훌륭하니라!" : floor >= 5 ? " 돌파!" : " 클리어!";
  burst.textContent = `${floor}F${floorSuffix}`;
  el.stagePanel.appendChild(burst);
  // 전투 영역 황금 flash
  el.stagePanel.classList.add("floor-clear-flash");
  window.setTimeout(() => {
    burst.remove();
    el.stagePanel.classList.remove("floor-clear-flash");
  }, 900);
}

function showFloorEventBanner(ev) {
  if (!ev) return;
  const banner = document.createElement("div");
  banner.className = "floor-event-banner";
  const iconMap = { tribute_up: "🔸", hustle: "👑", fast_enemy: "⚡", prep_boost: "💥", dignity_up: "♥", auto_frenzy: "🌀" };
  const icon = iconMap[ev.id] || "✦";
  banner.innerHTML = `<span class="feb-icon">${icon}</span><span class="feb-label">${ev.label}</span><span class="feb-desc">${ev.desc}</span>`;
  el.stagePanel.appendChild(banner);
  window.setTimeout(() => banner.remove(), 2600);
  // 층 이벤트 마왕 반응 대사
  const eventDialogues = {
    tribute_up:  [
      { mood: "허세", text: "흐흥! 공물 풍년이구나! 짐의 위엄이 대지를 기름지게 한 것이니라!" },
      { mood: "명령", text: "공물이 쏟아진다! 보좌관들, 최대한 쓸어담아라! 짐이 명령하는 것이니라!" },
    ],
    hustle: [
      { mood: "각성", text: "허세의 날이니라! 오늘만큼은 짐도... 진짜로 힘을 쓸 것이니라! (보좌관이 더 열심히 할 것이니라)" },
      { mood: "허세", text: "가로채기 보상이 폭발한다! 이 층, 짐의 위엄이 절정에 달했느니라!" },
    ],
    fast_enemy: [
      { mood: "울먹임", text: "적이 빠르게 달려온다... 조금 당황했느니라! 아니, 전혀 당황하지 않았느니라!" },
      { mood: "긴장", text: "이 층은 적이 사납구나. 보좌관들! 집중해라! 짐은... 여기서 지켜볼 것이니라!" },
    ],
    prep_boost: [
      { mood: "각성", text: "기력이 폭발하는 층이니라! 빠르게 쌓고 막기로 터트려라! 짐의 명령이다!" },
      { mood: "허세", text: "오오! 기력이 두 배로 쌓인다! 이 기세라면... 짐도 한 번 직접 해볼 것 같으니라!" },
    ],
    dignity_up: [
      { mood: "위엄", text: "왕의 위엄이 보호막이 되는 층이니라! 어떤 공격도 짐의 체면을 완전히 깎을 수 없느니라!" },
      { mood: "허세", text: "피격 손실이 줄어들었다! 짐이 원래 이 정도 내구력이니라. 원래부터!" },
    ],
    auto_frenzy: [
      { mood: "명령", text: "꼬물 부하들이 날뛰는 층이니라! 자동 공격이 폭발한다! 짐은 구경하겠느니라!" },
      { mood: "허세", text: "이 층은 보좌관들이 미쳐 날뛰는구나. 물론 짐의 지시로 그런 것이니라!" },
    ],
  };
  const lines = eventDialogues[ev.id];
  if (lines) {
    window.setTimeout(() => {
      const line = randomPick(lines);
      setDialogue(line.text, line.mood);
    }, 400);
  }
}

function showClearGrade(grade, color, interceptRate, interceptCount) {
  const pct = Math.round(interceptRate * 100);
  const gradeLabels = { S: "완벽 수비!", A: "훌륭한 막기!", B: "괜찮아요!", C: "다음엔 더!" };
  const gradeLabel = gradeLabels[grade] || "";
  const wrapper = document.createElement("div");
  wrapper.className = `grade-popup grade-popup--${grade.toLowerCase()}`;
  wrapper.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <span class="grade-popup-text" style="color:${color};text-shadow:0 0 24px ${color}88,0 2px 0 rgba(44,25,48,0.5)">${grade}</span>
      <span style="font-size:0.95rem;font-weight:800;color:${color};opacity:0.9;letter-spacing:0.04em;">${gradeLabel}</span>
      <span style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:0.06em;">가로채기 ${interceptCount}회 · ${pct}% 성공</span>
    </div>
  `;
  document.body.appendChild(wrapper);
  const duration = grade === "S" ? 1900 : grade === "A" ? 1650 : 1400;
  if (grade === "S") {
    spawnParticles(28);
    flashScreen("gold", 0.2);
    window.setTimeout(() => setDialogue(randomPick([
      "완벽이니라!!! 이 층은 짐의 역대 최고 퍼포먼스였느니라! (보좌관이 다 함)",
      "S급! 흐흥! 역시 짐의 지시가 완벽했기 때문이니라!!! 보좌관들도... 수고했다.",
      "모두 가로채기 성공이니라! 짐은 처음부터 이렇게 될 줄 알았느니라!!!",
    ]), "각성"), 300);
  } else if (grade === "A") {
    window.setTimeout(() => setDialogue(randomPick([
      "훌륭하다! 거의 완벽이었느니라. 조금 더 하면 S도 될 것이니라!",
      "A급! 짐의 지시가 거의 완벽했느니라. 다음엔 전부 가로채리라!",
    ]), "허세"), 300);
  } else if (grade === "C") {
    window.setTimeout(() => showToast("💡 S등급 팁: 기력 70%+ 쌓은 후 빨간불에 막기!"), 500);
  }
  window.setTimeout(() => wrapper.remove(), duration);
}

function showInGameShareBanner(title, subtitle, shareText) {
  const banner = document.createElement("div");
  banner.className = "ingame-share-banner";
  const canShare = !!navigator.share;
  const btnLabel = canShare ? "📢 공유하기" : "📋 복사";
  banner.innerHTML = `
    <div class="isb-body">
      <strong class="isb-title">${title}</strong>
      <span class="isb-sub">${subtitle}</span>
    </div>
    <button class="isb-btn" type="button">${btnLabel}</button>
    <button class="isb-close" type="button">✕</button>
  `;
  document.body.appendChild(banner);
  const shareBtn = banner.querySelector(".isb-btn");
  const closeBtn = banner.querySelector(".isb-close");
  const dismiss = () => {
    banner.classList.add("isb-exit");
    window.setTimeout(() => banner.remove(), 350);
  };
  shareBtn.addEventListener("click", () => {
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText).then(() => {
        shareBtn.textContent = "✅ 복사됨!";
        window.setTimeout(dismiss, 1200);
      }).catch(() => { shareBtn.textContent = "직접 선택하세요"; });
    }
  });
  closeBtn.addEventListener("click", dismiss);
  window.setTimeout(dismiss, 7000);
}

function showEndingSequence(runCount) {
  const overlay = document.createElement("div");
  overlay.className = "ending-overlay";
  const runLabel = runCount > 1 ? `(${runCount}판만에)` : "(첫 판에!)";
  const shareText = [
    `👑 귀염뽀짝 파멸의 군주 — 30층 완전 정복! ${runLabel}`,
    `실제: 보좌관들이 다 해줌`,
    `발표: 짐이 처음부터 이길 줄 알았느니라!`,
    `최고층 ${state.bestFloor}F · 총 판수 ${state.run} · 파편 ${state.shards}개`,
    `▶ https://criel2019.github.io/cute-lord-of-destruction/`,
  ].join("\n");
  const shareBtnLabel = navigator.share ? "📢 클리어 공유!" : "📋 결과 복사";
  overlay.innerHTML = `
    <div class="ending-inner">
      <div class="ending-sparkle">✦ ✦ ✦</div>
      <h2 class="ending-title">마왕성 전 층 완전 정복!</h2>
      <p class="ending-sub">30층 보스를 쓰러뜨렸습니다 ${runLabel}</p>
      <div class="ending-quote">
        "흐흥... 짐이 처음부터 이길 줄 알았느니라.<br/>
        물론 보좌관들이 없었다면... 아, 아무것도 아니니라!"
      </div>
      <div class="ending-stats">
        <span>최고층 ${state.bestFloor}F</span>
        <span>·</span>
        <span>총 판수 ${state.run}</span>
        <span>·</span>
        <span>파편 ${state.shards}개</span>
      </div>
      <p class="ending-hint">계속해서 더 강해지거나, 환생으로 새로운 도전을!</p>
      <div class="ending-actions">
        <button class="command-btn ending-share-btn" type="button" data-share-text="${shareText.replace(/"/g, "&quot;")}">${shareBtnLabel}</button>
        <button class="command-btn primary ending-close-btn" type="button">계속하기</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  flashScreen("gold", 0.8);
  spawnParticles(60);
  playSfx("ultimate");
  const shareBtnEl = overlay.querySelector(".ending-share-btn");
  if (shareBtnEl) {
    shareBtnEl.addEventListener("click", () => {
      const txt = shareBtnEl.dataset.shareText;
      if (navigator.share) {
        navigator.share({ text: txt }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(txt).then(() => {
          shareBtnEl.textContent = "✅ 복사됨!";
          window.setTimeout(() => { shareBtnEl.textContent = "📋 결과 복사"; }, 2000);
        }).catch(() => { shareBtnEl.textContent = "직접 선택하세요"; });
      }
    });
  }
  overlay.querySelector(".ending-close-btn").addEventListener("click", () => {
    overlay.classList.add("ending-exit");
    window.setTimeout(() => overlay.remove(), 500);
  });
  window.setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.classList.add("ending-exit");
      window.setTimeout(() => overlay.remove(), 500);
    }
  }, 15000);
}

function showBossReport(floorNum, shardGain) {
  const intercepts = state.floorInterceptCount || 0;
  const perfects = state.floorPerfectCount || 0;
  const hits = state.floorHitCount || 0;
  const bestStreak = state.bestRescueStreak || 0;
  const totalRate = intercepts + hits > 0 ? Math.round(intercepts / (intercepts + hits) * 100) : 0;

  const grade = perfects >= 3 && hits === 0 ? "S"
    : perfects >= 1 && hits <= 1 ? "A"
    : intercepts >= hits ? "B" : "C";

  const gradeComments = {
    S: [
      "실제: 보좌관이 한 대도 안 맞음 / 발표: 짐의 위엄이 공격을 소멸시킨 것이니라!",
      "실제: 보좌관 전원 완벽 수행 / 발표: 짐이 처음부터 계획한 것이니라!",
    ],
    A: [
      "실제: 보좌관이 잘 막음 / 발표: 짐의 지휘가 탁월했던 것이니라!",
      "실제: 보좌관이 거의 다 막음 / 발표: 짐의 전략이 빛난 것이니라!",
    ],
    B: [
      "실제: 보좌관이 살짝 맞으면서 막음 / 발표: 짐이 전략적으로 1-2번 맞아준 것이니라!",
      "실제: 보좌관이 어찌저찌 막음 / 발표: 짐의 위엄이 결국 이긴 것이니라!",
    ],
    C: [
      "실제: 보좌관이 많이 맞음 / 발표: 짐이 전략적 후퇴를 반복한 것이니라!",
      "실제: 보좌관이 거의 쓰러질 뻔 / 발표: 짐이... 다음엔 더 잘할 것이니라!",
    ],
  };
  const gradeComment = randomPick(gradeComments[grade] || gradeComments.C);

  const nextZonePreviews = {
    5:  "6F부터: 적이 강해집니다. 특성 시너지를 쌓기 시작하세요!",
    10: "11F부터: 엘리트 적 등장! 브레이크 × 기력 콤보가 핵심입니다.",
    15: "16F부터: 심연 구간 — 특성 2개 이상 시너지가 진가를 발휘합니다.",
    20: "21F부터: 전설 구간 — 궁극기 타이밍이 승부를 가릅니다.",
    25: "26F부터: 신화 영역 — 30F까지 단 5층! 지금 빌드로 끝냅니다.",
  };
  const nextZoneLine = nextZonePreviews[floorNum]
    ? `<p class="boss-report-next-zone">▶ ${nextZonePreviews[floorNum]}</p>`
    : "";

  const report = document.createElement("div");
  report.className = "boss-report-card";
  const shareText = [
    `👑 귀염뽀짝 파멸의 군주 — ${floorNum}F 보스 처치! [${grade}]`,
    `막기 ${intercepts}회 · PERFECT ${perfects}회 · 막기율 ${totalRate}%`,
    `실제: 보좌관이 다 막음 / 발표: 짐의 위엄이니라!`,
    `▶ https://criel2019.github.io/cute-lord-of-destruction/`,
  ].join("\n");
  const shareBtnHtml = `<button class="boss-report-share" type="button">${navigator.share ? "📢 공유하기" : "📋 결과 복사"}</button>`;
  report.innerHTML = `
    <div class="boss-report-header">
      <span class="boss-report-floor">${floorNum}F 보스 처치</span>
      <span class="boss-report-grade grade-${grade.toLowerCase()}">${grade}</span>
    </div>
    <div class="boss-report-stats">
      <div class="boss-report-row"><span>막기 성공</span><strong>${intercepts}회</strong></div>
      <div class="boss-report-row"><span>PERFECT</span><strong>${perfects}회</strong></div>
      <div class="boss-report-row"><span>피격</span><strong>${hits}회</strong></div>
      <div class="boss-report-row"><span>막기율</span><strong>${totalRate}%</strong></div>
      <div class="boss-report-row"><span>최고 연속</span><strong>${bestStreak}회</strong></div>
      <div class="boss-report-row"><span>파편 획득</span><strong>+${shardGain}</strong></div>
    </div>
    <p class="boss-report-comment">${gradeComment}</p>
    ${nextZoneLine}
    ${shareBtnHtml}
    <span class="boss-report-close">탭하여 닫기</span>
  `;
  document.body.appendChild(report);
  const close = () => {
    report.classList.add("boss-report-exit");
    window.setTimeout(() => report.remove(), 400);
  };
  const shareBtn = report.querySelector(".boss-report-share");
  if (shareBtn) {
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (navigator.share) {
        navigator.share({ text: shareText }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareText).then(() => {
          shareBtn.textContent = "✅ 복사됨!";
          window.setTimeout(close, 1200);
        }).catch(() => { shareBtn.textContent = "직접 선택하세요"; });
      }
    });
  }
  report.addEventListener("click", close);
  window.setTimeout(close, 5500);
}

function showUltimateFirstAlert() {
  flashScreen("gold", 0.5);
  playSfx("ultimate");
  setDialogue("흐흥! 마침내 짐의 절초식을 쓸 때가 왔느니라! 아래 ✦궁극기 버튼을 눌러라!!", "각성");
  const alert = document.createElement("div");
  alert.className = "ultimate-first-alert";
  alert.innerHTML = `
    <span class="uf-icon">✦</span>
    <strong class="uf-title">궁극기 준비 완료!</strong>
    <p class="uf-hint">아래 ✦궁극기 버튼을 누르세요</p>
  `;
  document.body.appendChild(alert);
  window.setTimeout(() => {
    alert.classList.add("uf-exit");
    window.setTimeout(() => alert.remove(), 500);
  }, 2200);
}

function showFloorClearBanner(floorNum, isBoss) {
  // 격투게임 컨벤션 KO 시퀀스 — 풀스크린 오버레이 시간차 분리
  // boss-defeat-flash(0~700ms, z:9100) → boss-victory-overlay(1100~2300ms, z:9250) → floor-clear-banner(2400~4800ms)
  // KO 도장(z:9580)은 defeatEnemy에서 0ms에 단독 표시됨 (1100ms까지)
  if (isBoss) {
    const flash = document.createElement("div");
    flash.className = "boss-defeat-flash";
    document.body.appendChild(flash);
    window.setTimeout(() => flash.remove(), 700);
    // 보스 격파 풀스크린 텍스트 — KO 도장이 사라진 직후(+1100ms) 등장
    const bossVictoryLines = floorNum >= 25
      ? ["전설이 시작됐느니라!", "짐은 원래 이 정도니라!!"]
      : floorNum >= 15
      ? ["흐흥! 역시 짐이었느니라!", "보좌관들아, 짐이 계획한 대로니라!"]
      : floorNum >= 10
      ? ["이 보스도 짐의 발 아래니라!", "계획대로니라. 처음부터 알았느니라!"]
      : ["보았느냐! 짐이 이겼느니라!", "흐흥, 이게 바로 짐이니라!"];
    const victoryLine = randomPick(bossVictoryLines);
    window.setTimeout(() => {
      const overlay = document.createElement("div");
      overlay.className = "boss-victory-overlay";
      overlay.textContent = victoryLine;
      document.body.appendChild(overlay);
      window.setTimeout(() => {
        overlay.classList.add("boss-victory-exit");
        window.setTimeout(() => overlay.remove(), 500);
      }, 1200);
    }, 1100);
  }
  const totalActions = (state.floorInterceptCount || 0) + (state.floorHitCount || 0);
  const perfects = state.floorPerfectCount || 0;
  const intercepts = state.floorInterceptCount || 0;
  let statLine = "";
  if (isBoss && perfects >= 2) statLine = `PERFECT ${perfects}회 — 완벽한 보좌!`;
  else if (isBoss && intercepts > 0) statLine = `가로채기 ${intercepts}회 성공`;
  else if (!isBoss && intercepts >= 2) statLine = `가로채기 ${intercepts}회`;
  else if (!isBoss && perfects >= 1) statLine = `PERFECT ${perfects}회`;
  const banner = document.createElement("div");
  banner.className = `floor-clear-banner${isBoss ? " boss-clear" : ""}`;
  banner.innerHTML = isBoss
    ? `<span class="floor-clear-num">BOSS</span><span class="floor-clear-label">처치!</span><span class="floor-clear-sub">${floorNum}F 완전 클리어${statLine ? ` · ${statLine}` : ""}</span>`
    : `<span class="floor-clear-num">${floorNum}F</span><span class="floor-clear-label">클리어</span>${statLine ? `<span class="floor-clear-sub">${statLine}</span>` : ""}`;
  // 보스인 경우 victory-overlay 종료 후(+2400ms) 등장, 일반은 즉시
  const showBanner = () => {
    document.body.appendChild(banner);
    window.setTimeout(() => {
      banner.classList.add("floor-clear-exit");
      window.setTimeout(() => banner.remove(), 400);
    }, isBoss ? 2200 : 1100);
  };
  if (isBoss) window.setTimeout(showBanner, 2400);
  else showBanner();
}

const murmurPools = {
  idle: [
    "흐음... 짐은 원래 더 강하지만 오늘은 좀 봐주는 중이니라.",
    "보좌관아, 짐이 기침한 건 전략이니라.",
    "짐은 항상 이겼느니라. 지금도, 앞으로도.",
    "흐흥. 오늘 날씨가 짐의 위엄에 걸맞구나.",
    "이 층 마저 깨면 짐의 허세가 완성될 것이니라!",
    "왜 보좌관은 항상 짐보다 열심히 싸우는 것이냐...",
    "...고맙다. 아니, 짐이 시킨 거니라!",
    "음... 공물이 좀 더 있으면 좋겠구나. 아니, 짐이 욕심을 부리는 게 아니라 전략이니라.",
    "지금 짐이 생각하는 건 완벽한 작전이니라. 비밀이지만.",
    "보좌관아, 저 적 눈빛이 왜 저러냐. 짐이 무서운 건 아니니라. 전혀.",
  ],
  danger: [
    "...이거, 짐도 좀 당황했느니라. 아니, 전혀 안 당황했다!",
    "...사실 저 적, 좀 무서운 것 같기도 하고... 아니다.",
    "이봐, 보좌관! 짐을 위해 뭔가 해야 하지 않겠나?!",
    "흥... 짐이 원하면 피할 수 있으니라. 원하지 않을 뿐!",
    "위기? 짐에겐 전략적 순간이라고 부르느니라.",
    "보, 보좌관아... 지금이 가로채기 타이밍이라고!! 짐이 시키는 것이니라!",
    "적이 공격을 준비 중이다... 아니, 짐은 당연히 알고 있었으니라!",
  ],
  lowDignity: [
    "...흠. 짐의 체면이 좀 위험하구나. 전략적 후퇴를 고려 중이니라.",
    "이봐, 이건 진짜로 막아야 하지 않겠나? 물론 짐이 시키는 거지만.",
    "체면이... 바닥나면 안 되니라. 절대. 진짜로.",
    "흐... 이제 막으면 짐이 회복할 수 있으니라. 제발 막아라!!",
    "지금 이 상황은... 아, 그냥 막기 버튼 눌러라!",
    "보좌관아, 짐이 진짜로 위험하니라. 한 번만 막아라!",
    "다음 공격은 반드시 막아야 한다! 기력 쌓고 기다려라!!",
  ],
  proud: [
    "흐흥! 짐이 원래 이 정도니라!",
    "역시 짐의 위엄이 통했느니라.",
    "보좌관, 수고했다. 이건 짐의 명령이었느니라.",
    "그렇지, 이게 바로 짐의 실력이니라!",
    "...뭐, 이 정도는 당연한 거지. 짐이니까.",
    "흐흥! 연속으로 이기다니, 짐의 전략이 완벽했던 것이니라!",
  ],
};
let _murmurInterval = null;
function startMurmurLoop() {
  if (_murmurInterval) return;
  const getInterval = () => {
    const isDanger = el.stagePanel.classList.contains("danger");
    return isDanger ? 4500 : 7000;
  };
  const tick = () => {
    if (!state.paused && !state.cutscenePlaying && state.poseTimer <= 0) {
      const isDanger = el.stagePanel.classList.contains("danger") || el.stagePanel.classList.contains("aiming");
      const isProud = el.stagePanel.classList.contains("combo-hot") || el.stagePanel.classList.contains("combo-fever");
      const isLowDignity = el.stagePanel.classList.contains("low-dignity");
      if (isDanger) {
        setDialogue(randomPick(murmurPools.danger), randomPick(["긴장", "울먹임"]));
      } else if (isLowDignity) {
        setDialogue(randomPick(murmurPools.lowDignity), "울먹임");
      } else if (isProud) {
        setDialogue(randomPick(murmurPools.proud), randomPick(["위엄", "허세"]));
      } else if (state.pose === "idle") {
        setDialogue(randomPick(murmurPools.idle), randomPick(["울먹임", "위엄", "허세", "긴장"]));
      }
    }
    _murmurInterval = window.setTimeout(tick, getInterval());
  };
  _murmurInterval = window.setTimeout(tick, 7000);
}

function randomPick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function playIntro() {
  if (state.introSeen) return;
  state.introSeen = true;
  state.paused = true;

  // 마왕 캐릭터 등장 연출
  if (el.mainCharacter) {
    el.mainCharacter.classList.add("char-intro-entrance");
    window.setTimeout(() => el.mainCharacter.classList.remove("char-intro-entrance"), 900);
  }

  // 인트로 즉시 탭 힌트 표시 — 클릭 전에 유저가 봐야 함
  const mainStage = el.stageTap;
  let tapHintEl = null;
  if (mainStage && !mainStage.querySelector(".tap-hint-label")) {
    tapHintEl = document.createElement("span");
    tapHintEl.className = "tap-hint-label";
    tapHintEl.innerHTML = "👆 여기 탭하면<br><strong>기력 충전!</strong>";
    mainStage.appendChild(tapHintEl);
  }

  const lines = [
    { mood: "울먹임", text: "...흥. 저, 저게 또 짐을 혼내러 왔구나! 보좌관들, 준비해— 아니! 짐이 지시하는 것이니라!", delay: 0 },
    { mood: "허세", text: "빨간 빛이 번쩍이면... 그때 짐이 직접 막— 아니, 보좌관에게 막으라 명 할 것이니라! 물론 짐이 하고 싶어서가 아니라 전략이니라!", delay: 1600 },
  ];

  const introTimers = [];
  lines.forEach(({ mood, text, delay }) => {
    introTimers.push(window.setTimeout(() => {
      setDialogue(text, mood);
      if (delay === 0) spawnParticles(8);
    }, delay));
  });

  const finishIntro = () => {
    introTimers.forEach(t => clearTimeout(t));
    clearTimeout(introEndTimer);
    state.paused = false;
    // 인트로 종료 → creditCut 2.6s 동안 → 첫 공격 기회 (2.4s) — 첫 OMG 순간 최대한 빨리
    if (state.enemy && state.floor === 1 && state.run <= 1) {
      state.enemy.attackTimer = 2.4;
    }
    showCreditCut(
      "rescue",
      "실제: 보좌관이 지금도 막고 있음",
      "발표: 짐이 모두 계획한 것이니라!",
      2.6,
    );
    window.setTimeout(() => {
      showToast("빨간 버튼으로 적의 공격을 가로채세요!");
      el.tapBtn.classList.add("intro-pulse");
      window.setTimeout(() => el.tapBtn.classList.remove("intro-pulse"), 3000);
    }, 2700);
    // 탭 힌트는 인트로 시작 시 이미 추가됨 — 첫 클릭 시 제거
    if (tapHintEl) {
      const removeTapHint = () => { if (tapHintEl) { tapHintEl.remove(); tapHintEl = null; } };
      mainStage.addEventListener("click", removeTapHint, { once: true });
    }
    // creditCut(2.6s) 끝난 뒤 인포카드 표시 — 첫 막기 성공 전에만 (이미 알고 있으면 불필요)
    window.setTimeout(() => {
      if (!state.firstBlockSeen) showLoopInfoCard();
    }, 3000);
  };

  // 클릭 시 인트로 즉시 종료 (클릭이 막기 역할도 함)
  const skipHandler = () => {
    el.tapBtn.removeEventListener("click", skipHandler);
    el.stageTap.removeEventListener("click", skipHandler);
    finishIntro();
  };
  el.tapBtn.addEventListener("click", skipHandler, { once: true });
  el.stageTap.addEventListener("click", skipHandler, { once: true });

  const introEndTimer = window.setTimeout(() => {
    el.tapBtn.removeEventListener("click", skipHandler);
    el.stageTap.removeEventListener("click", skipHandler);
    finishIntro();
  }, 2800);
}

function showLoopInfoCard() {
  const card = document.createElement("div");
  card.className = "loop-info-card";
  card.innerHTML = `
    <div class="loop-info-row">
      <span class="loop-step">탭 → 기력 ↑</span>
      <span class="loop-arrow">→</span>
      <span class="loop-step">빨간 불 = 막기!</span>
      <span class="loop-arrow">→</span>
      <span class="loop-step highlight">보좌관이 반격 💥</span>
    </div>
    <span class="loop-info-sub">실제: 보좌관이 다 함 &nbsp;/&nbsp; 발표: 짐의 위엄이니라! 👑</span>
  `;
  document.body.appendChild(card);
  window.setTimeout(() => {
    card.classList.add("loop-info-exit");
    window.setTimeout(() => card.remove(), 400);
  }, 4500);
}

function getTraitClaimLine(trait) {
  const lines = {
    "방치": "☞ 클릭 안 해도 OK — 부하들이 알아서 처리",
    "속도": "☞ 자동 공격이 빨라져 잡몹이 더 빨리 죽음",
    "생존": "☞ 맞아도 괜찮아 — 오래 버틸수록 궁극기 충전",
    "반격": "☞ 타이밍 성공 시 피해 x3 — 고위험 고보상",
    "치명": "☞ 운이 좋으면 피해 폭발 — 기대값이 높음",
    "보스": "☞ 보스전에서 모든 피해 x2 (잡몹은 느려짐)",
    "궁극기": "☞ 자동 공격 포기 대신 궁극기 1회로 승부",
    "계승": "☞ 가로채기 콤보가 쌓일수록 보상이 눈덩이처럼",
  };
  return lines[trait.tag] || "☞ 이 힘도 원래 짐의 것이니라.";
}

function update(now) {
  let dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  ensureEnemy();

  // 슬로모션 튜토리얼: 첫 판 첫 번째 위험 순간을 천천히
  if (state.slowmoTimer > 0) {
    state.slowmoTimer -= dt;
    dt *= 0.22;
    if (state.slowmoTimer <= 0) {
      el.stagePanel.classList.remove("slowmo-hint");
    }
  }

  state.pulseTimer = Math.max(0, (state.pulseTimer || 0) - dt);
  state.sceneTimer = Math.max(0, (state.sceneTimer || 0) - dt);
  state.creditTimer = Math.max(0, (state.creditTimer || 0) - dt);

  if (!state.paused && !state.cutscenePlaying) {
    state.poseTimer = Math.max(0, state.poseTimer - dt);
    if (state.poseTimer <= 0 && state.pose !== "idle") setPose("idle", 0, state.dignity < getStats().maxDignity * 0.42 ? "울먹임" : "위엄");
    const evEnemySpeed = state.floorEvent?.enemySpeedMult || 1;
    state.enemy.attackTimer -= dt * evEnemySpeed;

    // 첫 판 첫 번째 danger 진입 시 슬로모션 트리거
    if (!state.slowmoDone && !state.slowmoTimer && state.run <= 1 && state.floor === 1) {
      const phase = getCombatPhase(state.enemy, getStats());
      if (phase.dangerReady) {
        state.slowmoTimer = 2.2;
        state.slowmoDone = true;
        el.stagePanel.classList.add("slowmo-hint");
        el.tapBtn.classList.add("tut-arrow");
        window.setTimeout(() => el.tapBtn.classList.remove("tut-arrow"), 2800);
        showToast("지금이 가로채기! 빨간 버튼을 누르세요!");
      }
    }

    if (state.enemy.attackTimer <= 0) enemyHits();

    // 아이들 마왕 혼잣말 — idle 포즈 중 5~9초마다 맥락 대사
    {
      const phase = getCombatPhase(state.enemy, getStats());
      if (state.pose === "idle" && !phase.aiming && !phase.dangerReady) {
        state._idleDialogueTimer = (state._idleDialogueTimer || 5.0) - dt;
        if (state._idleDialogueTimer <= 0) {
          const line = getContextualIdleLine();
          setDialogue(line.text, line.mood);
          state._idleDialogueTimer = 5.0 + Math.random() * 4.0;
        }
      } else {
        state._idleDialogueTimer = 3.0;
      }
    }

    // aiming 시작 시 적 도발 말풍선
    const _curPhaseForTaunt = getCombatPhase(state.enemy, getStats());
    if (_curPhaseForTaunt.aiming && !_wasAiming && !_wasDanger && state.enemy) {
      const tauntKind = state.enemy.kind || "knight";
      showEnemyTauntBubble(tauntKind, state.enemy.isBoss);
    }
    _wasAiming = _curPhaseForTaunt.aiming;
    _wasDanger = _curPhaseForTaunt.dangerReady;

    // 일반 대기 중 적 도발 텍스트 — 6~9초마다 교체
    {
      const phase = _curPhaseForTaunt;
      if (!phase.aiming && !phase.dangerReady && state.enemy && !state.enemy.isBoss) {
        state._idleEnemyTauntTimer = (state._idleEnemyTauntTimer || 0) - dt;
        if (state._idleEnemyTauntTimer <= 0) {
          const taunts = enemyTaunts[state.enemy.kind] || [];
          if (taunts.length > 0) {
            state._currentEnemyTaunt = randomPick(taunts);
            // 도발 대응 마왕 반응 (25% 확률)
            if (Math.random() < 0.25) {
              const reactions = [
                { mood: "울먹임", text: `저, 저게 무슨 소리니라... 무섭지 않다!` },
                { mood: "허세", text: `흥! 짐에게 저런 말을 하다니 배짱이 있구나. 보좌관들이 혼내줄 것이니라.` },
                { mood: "명령", text: `보좌관들! 저 버릇없는 놈을 정리해라! 명령이니라!` },
                { mood: "위엄", text: `짐에게 도발하다니... 처음이자 마지막이 될 것이니라.` },
              ];
              window.setTimeout(() => {
                const r = randomPick(reactions);
                setDialogue(r.text, r.mood);
              }, 400);
            }
          } else {
            state._currentEnemyTaunt = "";
          }
          state._idleEnemyTauntTimer = 6.0 + Math.random() * 3.0;
        }
      } else {
        // 조준/위험 진입 시 idle taunt 숨기기
        state._currentEnemyTaunt = "";
        state._idleEnemyTauntTimer = 2.0;
      }
    }

    // 위험 경고 비프 + 미세 진동 (impactSoon 시 0.35초 간격)
    if (!state.paused) {
      const phase2 = getCombatPhase(state.enemy, getStats());
      if (phase2.impactSoon) {
        const now2 = performance.now();
        if (now2 - _lastDangerBeep > 350) {
          _lastDangerBeep = now2;
          playSfx("danger");
          shakeScreen(0.6);
        }
      }
    }

    // rage 타이머 처리
    if (state.rageTimer > 0) {
      state.rageTimer -= dt;
      if (state.rageTimer <= 0) {
        state.rageTimer = 0;
        el.stagePanel.classList.remove("rage-mode");
      }
    }

    autoAttack(dt);
  }

  saveClock += dt;
  if (saveClock >= 3) {
    saveClock = 0;
    saveGame();
  }

  render();
  requestAnimationFrame(update);
}

// 첫 인터랙션 시 AudioContext resume (브라우저 정책 대응)
function resumeAudio() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
}
document.addEventListener("click", resumeAudio, { once: true });
document.addEventListener("keydown", resumeAudio, { once: true });

// 탭 전환
function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.classList.add("active");
  const id = "tab" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const target = document.getElementById(id);
  if (target) target.classList.remove("hidden");
  if (tabName === "upgrade") { renderCache.runUpgrades = ""; renderRunUpgrades(); }
  if (tabName === "build") { renderCache.traits = ""; renderTraits(); }
  if (tabName === "parts") renderParts();
}
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});
// 초기 강화 탭 렌더 보장
window.setTimeout(() => { renderCache.runUpgrades = ""; renderRunUpgrades(); }, 0);

// 하단 탭 패널 스와이프 전환 (모바일)
(function setupTabSwipe() {
  const tabOrder = ["upgrade", "build", "parts"];
  const panels = document.querySelector(".bottom-panels");
  if (!panels) return;
  let _swipeStartX = 0;
  let _swipeStartY = 0;
  panels.addEventListener("touchstart", (e) => {
    _swipeStartX = e.touches[0].clientX;
    _swipeStartY = e.touches[0].clientY;
  }, { passive: true });
  panels.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - _swipeStartX;
    const dy = e.changedTouches[0].clientY - _swipeStartY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    const activeBtn = document.querySelector(".tab-btn.active");
    const currentTab = activeBtn?.dataset.tab || "upgrade";
    const idx = tabOrder.indexOf(currentTab);
    if (dx < 0 && idx < tabOrder.length - 1) switchTab(tabOrder[idx + 1]);
    else if (dx > 0 && idx > 0) switchTab(tabOrder[idx - 1]);
  }, { passive: true });
})();

el.stageTap.addEventListener("click", (ev) => rescueAction(ev));
el.tapBtn.addEventListener("click", (ev) => rescueAction(ev));
el.ultimateBtn.addEventListener("click", useUltimate);
el.reincarnateBtn.addEventListener("click", () => openReincarnate(false));
// HUD 파편 칩 클릭 → 환생 모달 (파편 용도 바로 확인)
const shardChipEl = el.shardText?.closest(".hud-stat--shard") || el.shardText?.closest(".hud-chip");
if (shardChipEl) {
  shardChipEl.style.cursor = "pointer";
  shardChipEl.title = "파편: 환생 시 영구 강화에 사용";
  shardChipEl.addEventListener("click", () => openReincarnate(false));
}
el.saveBtn.addEventListener("click", () => saveGame(true));
el.restartRunBtn.addEventListener("click", () => restartRun(true));
el.closeReincarnateBtn.addEventListener("click", () => {
  el.reincarnateModal.classList.add("hidden");
  state.paused = false;
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    rescueAction();
  }
  if (event.key.toLowerCase() === "q") useUltimate();
  if (event.key === "Escape") skipCutsceneIfDone();
});

el.cutscene.addEventListener("click", skipCutsceneIfDone);

ensureEnemy();
state.dignity = clamp(state.dignity, 0, getStats().maxDignity);
render();

// 첫 실행 시 스플래시 → 인트로 시퀀스
if (!state.introSeen) {
  (function showSplash() {
    const splash = document.createElement("div");
    splash.className = "game-splash";
    splash.innerHTML = `
      <div class="splash-inner">
        <img src="assets/mainchar_proud_clean.png" alt="마왕님" class="splash-char splash-char--bounce" />
        <div class="splash-title">귀염뽀짝 파멸의 군주</div>
        <div class="splash-credit-preview">
          <div class="splash-credit-row">
            <span class="splash-credit-label">실제</span>
            <span class="splash-credit-text">보좌관이 막음</span>
          </div>
          <div class="splash-credit-divider">vs</div>
          <div class="splash-credit-row splash-credit-row--claim">
            <span class="splash-credit-label">발표</span>
            <span class="splash-credit-text">짐의 위엄이 막았다!</span>
          </div>
        </div>
        <div class="splash-tagline">허세 마왕님이 아무것도 안 하는데 다 한 척하는 RPG</div>
        <div class="splash-hint splash-hint--pulse">탭해서 막아라! ▶</div>
      </div>
    `;
    document.body.appendChild(splash);
    const dismiss = () => {
      startBgm();
      splash.classList.add("splash-exit");
      window.setTimeout(() => {
        splash.remove();
        window.setTimeout(playIntro, 200);
      }, 380);
      splash.removeEventListener("click", dismiss);
    };
    splash.addEventListener("click", dismiss);
    window.setTimeout(dismiss, 2800);
  })();
} else if (state.enemy) {
  // 2판+ 첫 로드 시 — 적 이름 + 마왕 복귀 브리핑
  window.setTimeout(() => showEnemyNameBadge(state.enemy.name, state.enemy.title), 600);
  window.setTimeout(() => {
    const floorStr = `${state.floor}F`;
    const runStr = `${state.run}판`;
    const ultPct = Math.round(state.ultimate || 0);
    const dignityPct = Math.round((state.heroHp / state.maxHeroHp) * 100);
    const isBoss = state.enemy?.isBoss;
    const buildTag = state.activeBuildTag || "";
    const briefs = isBoss
      ? [
          { mood: "긴장", text: `보좌관들! ${floorStr} 보스가 기다리고 있다! 짐이... 전략을 짜고 있었느니라! 막기 준비!` },
          { mood: "명령", text: `${runStr} ${floorStr} 보스전이다! 짐이 잠깐 눈 감고 전략 구상 중이었느니라. 보좌관들 긴장해라!` },
        ]
      : ultPct >= 80
      ? [
          { mood: "각성", text: `${floorStr}에서 돌아왔구나. 궁극기가 ${ultPct}%다! 짐이 미리 채워뒀느니라. 보좌관이 아니라 짐이!` },
          { mood: "허세", text: `오, 궁극기 ${ultPct}%. 짐이 자리 비운 사이 보좌관들이... 아니! 짐의 지시로 충전된 것이니라!` },
        ]
      : dignityPct <= 40
      ? [
          { mood: "울먹임", text: `...체면이 ${dignityPct}%밖에 없다. 보좌관들, 다음 공격은 절대 놓치면 안 된다. 짐이 명령이니라!` },
          { mood: "울먹임", text: `체면이 많이 깎였구나. 짐이 잠깐 자리 비웠더니... 보좌관들 정신 차려!` },
        ]
      : buildTag === "반격"
      ? [
          { mood: "허세", text: `${runStr} ${floorStr}. 반격 빌드다! 짐의 가장 최선의 선택이었느니라. 막기 타이밍이 핵심!` },
          { mood: "위엄", text: `반격 빌드로 ${floorStr}까지 왔다. 짐이 예언한 대로니라. 계속 막기로 간다!` },
        ]
      : buildTag === "방치"
      ? [
          { mood: "명령", text: `${floorStr}이다. 방치 빌드니까 보좌관들이 알아서 한다. 짐은 그냥 지켜보면 되느니라!` },
          { mood: "허세", text: `자동 공격 빌드로 여기까지 왔구나. 물론 짐의 전략이었느니라. 탭 안 해도 괜찮다!` },
        ]
      : [
          { mood: "허세", text: `돌아왔구나! ${runStr} ${floorStr}이다. 보좌관들, 짐이 잠깐 자리 비웠지만 기다린 보람이 있을 것이니라!` },
          { mood: "위엄", text: `${floorStr}. 짐의 귀환이다. 보좌관들 준비되었느냐? 이 층은 짐이... 지시할 것이니라.` },
          { mood: "명령", text: `${runStr} ${floorStr}에서 다시 시작이다! 짐은 잠깐 눈 감고 전략 구상 중이었느니라. 막기 준비해라!` },
        ];
    const brief = briefs[Math.floor(Math.random() * briefs.length)];
    setDialogue(brief.text, brief.mood);
  }, 1000);
}

// 첫 인터랙션 시 BGM 시작 (브라우저 autoplay 정책 우회)
document.addEventListener("click", () => startBgm(), { once: true });
document.addEventListener("keydown", () => startBgm(), { once: true });

startMurmurLoop();
requestAnimationFrame(update);


// 탭 숨김/복귀 시 방치 보상 표시
let _hiddenAt = null;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    _hiddenAt = Date.now();
    suspendBgm();
  } else if (_hiddenAt !== null) {
    resumeBgm();
    const away = (Date.now() - _hiddenAt) / 1000;
    _hiddenAt = null;
    if (away >= 30) {
      const autoStats = getStats();
      const idleGain = Math.round(autoStats.autoDamage * autoStats.autoSpeed * autoStats.autoTempo * away * 0.6);
      const idleTributes = Math.round((0.35 + state.floor * 0.12) * away * 0.6);
      const minLabel = away >= 60 ? `${Math.floor(away / 60)}분 ${Math.round(away % 60)}초` : `${Math.round(away)}초`;
      // 복귀 마왕 대사 — "자리 비웠지만 사실 전략 짜고 있었다"
      window.setTimeout(() => {
        const returnLines = away >= 300
          ? [
              { mood: "허세", text: `${minLabel} 동안 짐이 전략적으로 자리를 비웠느니라. 보좌관들이 잘 버텼다! 짐이 예측한 대로니라.` },
              { mood: "위엄", text: `오! ${minLabel} 걸렸구나. 짐은 잠깐 눈 감고 패권 구상 중이었느니라. 그 사이 보좌관들이 수고했다.` },
              { mood: "명령", text: `${minLabel} 만에 귀환이다! 짐이 없어도 보좌관들이 알아서 잘 싸웠다. 물론 짐이 지시해두고 간 것이니라!` },
            ]
          : [
              { mood: "허세", text: `${minLabel} 동안 짐이 잠깐 전략을 재구성했느니라. 준비됐으니 다시 가자!` },
              { mood: "울먹임", text: `...짐도 화장실 갈 때가 있느니라. 전략적 이석이었다. 절대로 도망간 게 아니니라!` },
              { mood: "명령", text: `돌아왔다! ${minLabel}이었지만 짐은 계속 지휘 중이었느니라. 보좌관들 어디 있냐!` },
            ];
        const line = returnLines[Math.floor(Math.random() * returnLines.length)];
        setDialogue(line.text, line.mood);
      }, 200);
      if (idleTributes > 0) {
        state.tributes += idleTributes;
        showToast(`${minLabel} 자리 비운 사이 보좌관들이 공물 +${idleTributes} 수집!`);
        spawnDamage(`+${idleTributes} 공물`, true, "idle");
      }
      // 오프라인 자동 공격 데미지를 적에게 실제 적용
      if (idleGain > 0 && state.enemy && state.enemy.hp > 0) {
        ensureEnemy();
        const prevHp = state.enemy.hp;
        state.enemy.hp = Math.max(0, state.enemy.hp - idleGain);
        const dealt = prevHp - state.enemy.hp;
        if (dealt > 0 && state.enemy.hp > 0) {
          window.setTimeout(() => showToast(`보좌관 오프라인 작전: ${formatNumber(dealt)} 피해 입힘 (남은 HP ${formatNumber(Math.round(state.enemy.hp))})`), 600);
        } else if (prevHp > 0 && state.enemy.hp <= 0) {
          window.setTimeout(() => {
            showToast(`보좌관들이 자리 비운 사이 적을 처치! (${minLabel})`);
            defeatEnemy();
          }, 400);
        }
      }
    }
  }
});
