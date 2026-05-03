const SAVE_KEY = "cute-lord-rescue-save-v2";

const $ = (selector) => document.querySelector(selector);

// ── Web Audio SFX (사용자 인터랙션 후 초기화) ──
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return _audioCtx;
}

function playSfx(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === "perfect") {
      // 밝고 짧은 핑 — 성공감
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "rescue") {
      // 부드러운 탁 — 가로채기
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "hit") {
      // 둔탁한 충격음 — 피격
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.14);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "danger") {
      // 날카로운 경고음 — 위험
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "ultimate") {
      // 웅장한 스윕 — 궁극기
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === "defeat") {
      // 짧은 팡파르 — 적 처치
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.1);
      osc.frequency.setValueAtTime(784, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === "click") {
      // 부드러운 팝 — 기력 충전 탭
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
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

const el = {
  runText: $("#runText"),
  floorText: $("#floorText"),
  bestFloorText: $("#bestFloorText"),
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
};

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
  idle: "assets/mainchar_hit_proud_clean.png",
  threat: "assets/mainchar_hit_proud_clean.png",
  hit: "assets/mainchar_hit_proud_clean.png",
  proud: "assets/mainchar_proud_clean.png",
  rescue: "assets/mainchar_proud_clean.png",
  counter: "assets/mainchar_proud_clean.png",
  ultimate: "assets/mainchar_proud_clean.png",
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
  knight: ["이 약한 마왕아!", "막아볼 테냐?!", "핫! 각오해!"],
  golem: ["우 두 두 두...", "피하지 마... 못하지!", "쿵!!!!"],
  dragon: ["불꽃 잔소리 간다!", "뜨거워라~!", "나도 무는 거 알지?"],
  fairy: ["이번엔 못 막아!", "헤헤, 어디 보자~", "변칙 공격이다!"],
  angel: ["죄를 고하라!", "훈계 시간이다!", "하늘의 심판을!"],
  bishop: ["질서를 따르거라!", "마왕 따위...", "무릎 꿇어라!"],
  dragon_boss: ["별빛 박치기!", "으르렁...!", "용의 힘을 봐라!"],
  golem_boss: ["꿀밤 간다!", "막을 수 있나?!", "성벽이 무너진다!"],
};

const enemyPool = [
  { kind: "knight", name: "솜방망이 기사", title: "일반 적", image: "assets/enemy_clicker_knight_clean.png", intent: "빠른 망치로 마왕님을 연속 가격합니다.", speedMod: 1.22, damageMod: 0.72 },
  { kind: "golem", name: "졸린 설탕 골렘", title: "일반 적", image: "assets/enemy_clicker_golem_clean.png", intent: "느리지만 육중한 주먹을 모읍니다.", speedMod: 0.72, damageMod: 1.55 },
  { kind: "dragon", name: "마카롱 새끼용", title: "일반 적", image: "assets/enemy_clicker_dragon_clean.png", intent: "불꽃 잔소리를 쌓습니다. 막으면 2배 반격!", speedMod: 1.0, damageMod: 1.0, prepBonus: true },
  { kind: "fairy", name: "훈계 요정", title: "일반 적", image: "assets/enemy_clicker_fairy_clean.png", intent: "타이밍 맞추기 어려운 변칙 공격입니다.", speedMod: 0.88, damageMod: 0.9, narrowWindow: true },
];

const bossPool = [
  { kind: "angel", name: "마왕님 훈계 천사장", title: "보스", image: "assets/boss_angel_clean.png", intent: "즉사급 훈계를 준비합니다." },
  { kind: "bishop", name: "질서의 사탕 주교", title: "보스", image: "assets/boss_bishop_clean.png", intent: "마왕님 체면을 꺾는 설교를 시전합니다." },
  { kind: "dragon", name: "분홍 혜성룡", title: "보스", image: "assets/boss_dragon_clean.png", intent: "거대한 별빛 박치기를 준비합니다." },
  { kind: "golem", name: "성벽 크림 골렘", title: "보스", image: "assets/boss_golem_clean.png", intent: "피할 수 없는 꿀밤을 충전합니다." },
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
  { id: "power", name: "허세의 무게", desc: "도움 반격 +18%", baseCost: 8 },
  { id: "dignity", name: "왕의 체면", desc: "체면 최대치 +20%", baseCost: 7 },
  { id: "reward", name: "파편 회수", desc: "파편 획득 +16%", baseCost: 9 },
  { id: "ultimate", name: "영상 증폭", desc: "궁극기 피해 +18%", baseCost: 10 },
];

const runUpgradeDefs = [
  { id: "click", name: "보좌 손길", desc: "공물/가로채기 피해 증가", baseCost: 8, growth: 1.58, image: "assets/vfx/protect_sigil.png" },
  { id: "auto", name: "꼬물 부하", desc: "자동으로 적 체력 감소", baseCost: 12, growth: 1.62, image: "assets/trait_wiggle.png" },
  { id: "guard", name: "체면 방패", desc: "피격 손실 감소와 회복 증가", baseCost: 10, growth: 1.55, image: "assets/ultimate_tear.png" },
  { id: "showoff", name: "허세 연출", desc: "가로채기 성공 공물과 궁극기 충전 증가", baseCost: 16, growth: 1.7, image: "assets/vfx/counter_spark.png" },
  { id: "crit", name: "치명적 허세", desc: "치명타 확률 +5% · 치명타 위력 +25%", baseCost: 28, growth: 1.85, image: "assets/vfx/impact_burst.png" },
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
  knight: "엘리트",
  golem: "엘리트",
  dragon: "엘리트",
  fairy: "엘리트",
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
  // 1층 잡몹 HP: 막기 버튼 누르면 빠르게 죽는 것을 체감하게 — 너무 높으면 첫 경험이 답답함
  const hpBase = 44 + floor * 18 + Math.pow(floor, 1.15) * 7;
  const hpMod = (!isBoss && floor === 1 && state.run <= 1) ? 1.35 : 1;
  const maxHp = Math.round(hpBase * hpMod * (isBoss ? 2.1 + floor * 0.018 : 1));
  const speedMod = (!isBoss && data.speedMod) ? data.speedMod : 1;
  const baseAttackMax = Math.max(isBoss ? 7.8 : 5.2, (isBoss ? 8.8 : 6.4) - floor * 0.01);
  const attackMax = isBoss ? baseAttackMax : Math.max(3.4, baseAttackMax / speedMod);
  const firstAttackDelay = isBoss ? 1.0 : 0.6;
  // 1층 첫 적: 빠르게 첫 공격 → 유저가 바로 가로채기 메카닉 경험
  const firstAttackTimer = (!isBoss && floor === 1 && state.run <= 1)
    ? 3.0
    : Math.max(attackMax + firstAttackDelay, isBoss ? 5.2 : 4.2);
  return {
    ...data,
    image: (isBoss ? cleanBossImages[data.kind] : cleanEnemyImages[data.kind]) || data.image,
    isBoss,
    isElite,
    name: isElite ? (eliteNames[data.kind] || data.name) : data.name,
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
    if (state.floor !== _lastEnemyFloor) {
      _lastEnemyFloor = state.floor;
      const flavor = floorFlavors[state.floor];
      if (flavor && !state.enemy.isBoss) {
        window.setTimeout(() => showToast(flavor), 300);
      }
    }
  }
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
  state.creditKind = kind;
  state.creditTruth = truth;
  state.creditClaim = claim;
  state.creditTimer = duration;
}

function dealEnemyDamage(amount, source = "auto", label = "") {
  ensureEnemy();
  const stats = getStats();
  let damage = amount;
  if (state.enemy.isBoss) {
    damage *= stats.bossDamage;
  } else {
    damage *= (stats.mobDamageMulti || 1);
  }
  const crit = Math.random() < stats.critChance;
  if (crit) damage *= stats.critMult;
  if (crit && source !== "auto") shakeScreen(1.5);

  const prevHpRate = state.enemy.hp / state.enemy.maxHp;
  state.enemy.hp = Math.max(0, state.enemy.hp - damage);
  const newHpRate = state.enemy.hp / state.enemy.maxHp;
  if (prevHpRate > 0.5 && newHpRate <= 0.5 && newHpRate > 0) {
    if (state.enemy.isBoss) {
      showToast("보스 체력 50%! 보스가 화났습니다!");
      shakeScreen(1.5);
      flashScreen("red", 0.25);
      setDialogue("보았느냐! 벌써 절반이 줄었다! 이제 보스가 더 사납게 덤빈다!", "허세");
      spawnParticles(22);
    } else {
      showToast("적 체력 50% — 마무리 준비!");
      shakeScreen(0.5);
    }
  }
  if (prevHpRate > 0.25 && newHpRate <= 0.25 && newHpRate > 0) {
    if (state.enemy.isBoss) {
      showToast("보스 체력 25%! 궁극기 쓸 절호의 기회!");
      shakeScreen(1.8);
      spawnParticles(28);
      setDialogue("흐흥! 거의 다 왔느니라! 이번엔 짐이 직접 나설 것이니라!", "각성");
    } else {
      showToast("적 체력 25%! 한 번만 더!");
      shakeScreen(0.8);
    }
  }
  const prevUltimate = state.ultimate;
  state.ultimate = clamp(state.ultimate + (source === "auto" ? 1.5 : 6) * stats.chargeGain, 0, 100);
  if (prevUltimate < 100 && state.ultimate >= 100) {
    showToast("✦ 궁극기 준비! [궁극기] 버튼 또는 Q키를 누르세요!");
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
    const particleCount = isRage ? 2 : autoLevel >= 4 ? 2 : 1;
    const baseSize = isRage ? 10 : 4 + Math.min(6, autoLevel * 1.2);
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
    // 적 이미지 히트 플래시 (강화 레벨이 높을수록 더 자주)
    const flashChance = 0.3 + Math.min(0.5, autoLevel * 0.1);
    if (el.arenaEnemy && Math.random() < flashChance) {
      el.arenaEnemy.classList.add("auto-hit-flash");
      window.setTimeout(() => el.arenaEnemy.classList.remove("auto-hit-flash"), isRage ? 180 : 120);
    }
    // 자동공격 데미지 숫자 — 항상 표시 (rage 시 더 자주)
    const showAutoDmg = Math.random() < (isRage ? 0.7 : autoLevel >= 3 ? 0.45 : 0.25);
    if (showAutoDmg && el.damageLayer) {
      const stats2 = getStats();
      const dmgVal = Math.round(stats2.autoDamage * (isRage ? 1.8 : 1));
      const pop = document.createElement("span");
      pop.className = `damage-pop auto-damage-pop${isRage ? " rage-pop" : ""}`;
      pop.textContent = formatNumber(dmgVal);
      pop.style.setProperty("--dx", `${Math.round(-140 + (Math.random() - 0.5) * 60)}px`);
      el.damageLayer.appendChild(pop);
      window.setTimeout(() => pop.remove(), 580);
    }
  }
}

function rescueAction() {
  if (state.paused || state.cutscenePlaying) return;
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
    const comboMult = getComboMultiplier();
    const prepMult = getPrepMultiplier(targetEnemy);
    setPose("rescue", 0.95, "가로채기");
    showScene("rescue", 0.62);
    triggerPulse("rescue", 0.55);
    // 막기 성공 시 마왕님 점프 애니메이션
    if (el.mainCharacter) {
      el.mainCharacter.classList.remove("char-rescue-jump");
      void el.mainCharacter.offsetWidth;
      el.mainCharacter.classList.add("char-rescue-jump");
      window.setTimeout(() => el.mainCharacter.classList.remove("char-rescue-jump"), 380);
    }
    showGradePopup(timing.key);
    // ⑤ BLOCK! 중앙 폭발 텍스트
    showBlockBurst(timing.key);
    // ② 첫 막기 성공 특별 연출
    if (!state.firstBlockSeen) {
      state.firstBlockSeen = true;
      window.setTimeout(() => {
        showToast("🎉 첫 가로채기 성공! 적이 공격할 때(빨간불) 막으면 됩니다!");
        setDialogue("흐흥! 봤느냐! 짐의 보좌관이... 아니, 짐의 위엄으로 막은 것이니라!", "허세");
      }, 400);
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
          showToast(`🌟 ${state._consecutivePerfect}연속 PERFECT!! 전설적인 타이밍 — 공물 보너스!`);
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
    showCreditCut(
      "rescue",
      timing.key === "perfect" ? "실제: 보좌관이 완벽하게 막음" : "실제: 보좌관이 대신 맞을 뻔함",
      timing.key === "perfect"
        ? randomPick([
            "발표: 짐의 완전무결한 반응속도가 막은 것이니라!",
            "발표: 완벽? 당연하지. 짐은 항상 이 정도니라!",
            "발표: PERFECT는 짐한테 기본이니라!",
            "발표: 짐의 카리스마가 공격 자체를 녹였느니라!",
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
          ]),
      1.35,
    );
    // 적 도발에 대한 마왕 반박 대사 (막기 성공)
    const counterLines = timing.key === "perfect"
      ? ["흐흥! 그게 최선이냐? 짐에겐 재채기 수준이니라!", "완벽하게 막았느니라! 이게 바로 짐이다!", "PERFECT? 당연하지! 짐은 원래 이 정도니라!"]
      : ["막았느니라! 짐을 누가 건드려?!", "이 정도 공격이 통할 것 같았나?!", "방금 건... 짐이 일부러 맞아준 척이니라!"];
    setDialogue(randomPick(counterLines), "허세");
    shakeScreen(timing.key === "perfect" ? 2 : 1);
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
    if (state.enemy === targetEnemy && state.rescueStreak > 1 && state.rescueStreak % 3 === 0) {
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
    showToast(`조준 중 — 기력 +4% 쌓임. ${stats.timingWindow.toFixed(1)}초 안에 막으세요!`);
    return;
  }

  // 기력 충전 클릭 횟수 추적 — 힌트 제거용
  state._prepClickCount = (state._prepClickCount || 0) + 1;
  playSfx("click");
  setPose("proud", 0.58, "명령");
  triggerPulse("assist", 0.3);
  const prepBefore = state.prep || 0;
  const ragePrepMult = state.rageTimer > 0 ? 2.0 : 1;
  const evPrepMult = state.floorEvent?.prepMult || 1;
  const gainedPrep = addPrep((11 + state.floor * 0.28) * ragePrepMult * evPrepMult, true);
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
  const loss = Math.round((state.enemy.isBoss ? 22 : stats.hitLoss) * damageMod * (1 - Math.min(0.55, (stats.guardPower - 1) * 0.45)) * (1 - hitReductionEv));
  state.dignity = clamp(state.dignity - loss, 0, stats.maxDignity);
  const prevUltimateHit = state.ultimate;
  const hitCharge = 12 * stats.chargeGain + (stats.hitChargeBonus || 0);
  state.ultimate = clamp(state.ultimate + hitCharge, 0, 100);
  if (prevUltimateHit < 100 && state.ultimate >= 100) {
    showToast("✦ 궁극기 준비! [궁극기] 버튼 또는 Q키를 누르세요!");
    setDialogue("흐흥! 마침내 짐의 절초식을 쓸 때가 왔느니라! 궁극기 버튼을 눌러라!", "각성");
  }
  playSfx("hit");
  showMissedPopup();
  // 피격 빨간 플래시 — stage-panel 에 hit-flash 클래스 토글
  el.stagePanel.classList.add("hit-flash");
  window.setTimeout(() => el.stagePanel.classList.remove("hit-flash"), 420);
  state.enemy.attackTimer = state.enemy.attackMax + (state.enemy.isBoss ? 2.2 : 1.65);
  state.rescueStreak = 0;
  state.prep = Math.max(0, Math.floor((state.prep || 0) * 0.35));
  state.lastTimingGrade = "피격";
  setPose("hit", 0.9, "피격");
  showScene("hit", 0.72);
  triggerPulse("hit", 0.52);
  showCreditCut(
    "hit",
    "실제: 마왕님이 맞음",
    randomPick([
      "발표: 방금 건 전략적 피격이니라!",
      "발표: 적의 힘을 시험해 본 것뿐이니라!",
      "발표: 짐은 아직 전혀 아프지 않느니라!",
      "발표: 일부러 맞아줌으로써 적을 방심시킨 것이니라!",
      "발표: 짐은 약점 따위 없느니라. 그냥 자비를 베푼 것뿐!",
      "발표: 짐의 체면은 여전히 완벽하니라!",
      "발표: 아픈 게 아니라 감동받은 것이니라!",
      "발표: 방금 건 짐이 연구 목적으로 맞아본 것이니라!",
      "발표: 적이 감히 짐을 건드리다니, 무례함에 기절한 것이니라!",
    ]),
    1.45,
  );
  setDialogue(randomPick([
    "아, 아프지 않았다...! 방금 건 일부러 맞아준 것이니라!",
    "으으... 짐의 체면에는 흠집도 없느니라!",
    "방금 건 방심이 아니라 전략적 피격이니라!",
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
  if (dignityAfterHit <= 0.2) {
    showToast("⚠️ 체면 위기! 지금 당장 막기로 기력 쌓고 다음 공격을 막으세요!");
  } else if (dignityAfterHit <= 0.4) {
    showToast("체면이 위험해요! 막기로 기력 쌓고 다음 공격을 반드시 막으세요");
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
  const oldFloor = state.floor;
  const stats = getStats();

  el.stagePanel.classList.remove("elite-enemy");
  playSfx("defeat");
  shakeScreen(defeatedBoss ? 3 : defeatedElite ? 2 : 1.2);
  spawnParticles(defeatedBoss ? 40 : defeatedElite ? 30 : 20);
  setPose("counter", defeatedBoss ? 1.8 : 1.1, defeatedBoss ? "보스 격파" : "우쭐");
  const bossDefeatLines = oldFloor >= 25
    ? ["전설의 마왕은 이렇게 만들어지느니라. 짐이 원래 알고 있었다!", "이 보스... 실력이 나쁘지 않았느니라. 짐에겐 턱없이 부족하지만."]
    : oldFloor >= 15
    ? ["흐흥, 짐이 설계한 함정이 완벽하게 작동했느니라!", "보좌관들아, 수고했다. 공은 반반이니라. (전부 짐의 것)"]
    : oldFloor >= 10
    ? ["이 정도 보스쯤은 짐의 아침 운동 수준이니라!", "보았느냐! 10층 보스라도 짐의 위엄 앞엔 종이니라!"]
    : ["보았느냐! 짐이 원래 쓰러뜨리려던 보스니라!", "흐흥, 계획대로니라. 짐은 처음부터 알고 있었느니라!"];
  const mobDefeatLines = oldFloor >= 20
    ? ["또 하나가 역사의 뒤안길로 사라졌느니라.", "짐의 마왕성은 이제 방문객을 거절하는 중이니라."]
    : oldFloor >= 10
    ? ["흐흥, 10층 이상은 이렇게 다루는 것이니라.", "짐의 위엄이 점점 유명해지는군. 적도 알아보는 듯하다."]
    : ["흐흥, 또 하나가 짐의 위엄 앞에 쓰러졌느니라.", "짐의 명령 한 마디로 충분하니라."];
  setDialogue(defeatedBoss ? randomPick(bossDefeatLines) : randomPick(mobDefeatLines), "허세");
  showFloorClearBanner(oldFloor, defeatedBoss);
  showCreditCut(
    "streak",
    defeatedBoss ? "실제: 보조들이 처치함" : "실제: 자동 공격으로 처치",
    defeatedBoss ? "발표: 짐의 압도적 위엄으로 격파!" : "발표: 짐의 명령 한 마디로 쓰러졌다!",
    defeatedBoss ? 1.8 : 1.1,
  );

  // 층 클리어 시 현재 전투력 토스트 — "나는 강해지고 있다" 피드백
  const dpsNow = Math.round(stats.autoDamage * stats.autoSpeed * stats.autoTempo);
  const counterNow = Math.round(stats.counterDamage);
  if (!defeatedBoss && oldFloor % 3 === 0 && oldFloor >= 3) {
    window.setTimeout(() => showToast(`현재 전투력 — 자동 ${formatNumber(dpsNow)}/s · 반격 ${formatNumber(counterNow)}`), 250);
  }

  // 구간 돌입 시 분위기 전환 알림
  const tierMessages = {
    6:  ["어둠이 짙어집니다. 적들이 더 사나워집니다!", "6층부터는 본격적입니다. 마왕님 각오하세요."],
    11: ["냉기가 느껴집니다. 엘리트 적이 등장합니다!", "중반부 돌입! 적들이 변칙 공격을 씁니다."],
    16: ["심연의 기운이 퍼집니다. 진짜 시험이 시작됩니다.", "16층 돌파! 적들의 분노가 최고조입니다!"],
    21: ["전설 구간 진입! 역대 마왕들도 쓰러진 곳입니다.", "심연을 넘어 전설로 — 짐은 아직 무섭지 않으니라!"],
    26: ["신화의 영역! 30층까지 단 5층만 남았습니다!", "전설을 초월하는 마왕 — 이게 바로 짐이니라!"],
  };
  if (tierMessages[state.floor]) {
    window.setTimeout(() => {
      showToast(randomPick(tierMessages[state.floor]));
      flashScreen("gold", 0.3);
      const tierDialogues = {
        6:  "흐, 흠. 이제 좀 재밌어지는군. 짐은 아직 여유롭느니라.",
        11: "냉기? 짐에겐 시원한 바람이니라. 보좌관들, 각오해라.",
        16: "...이건 조금 강하구나. 하지만 짐의 위엄이 더 강하니라!",
        21: "전설의 구간? 흥. 전설이란 바로 짐 같은 존재를 말하는 것이니라!",
        26: "신화의 영역... 짐은 원래 여기 속한 존재니라. 물론이지.",
      };
      if (tierDialogues[state.floor]) {
        setDialogue(tierDialogues[state.floor], "허세");
      }
    }, defeatedBoss ? 1200 : 500);
  }
  state.floor += 1;
  const prevBest = state.bestFloor;
  state.bestFloor = Math.max(state.bestFloor, state.floor);
  if (state.bestFloor > prevBest && state.run > 1) {
    window.setTimeout(() => showToast(`신기록! ${state.bestFloor}F — 지난 판 최고보다 ${state.bestFloor - prevBest}층 앞섬`), 400);
  }
  state.dignity = clamp(state.dignity + (defeatedBoss ? 18 : 7), 0, stats.maxDignity);
  state.ultimate = clamp(state.ultimate + (defeatedBoss ? 24 : 9), 0, 100);
  gainTributes((defeatedBoss ? 18 : 6) * Math.max(1, oldFloor) * stats.rewardMult, "kill");
  if (stats.shardPerFloor) {
    state.shards += stats.shardPerFloor;
    showToast(`파편 수집가: 파편 +${stats.shardPerFloor}`);
  }

  // 2층 진입 시 사이드 패널 해금
  if (!state.sideUnlocked && state.floor >= 2) {
    state.sideUnlocked = true;
    const recUpgrade = getRecommendedRunUpgrade();
    const recDef = runUpgradeDefs.find(u => u.id === recUpgrade);
    showToast("오른쪽 패널 해금! 공물로 강화를 구매하세요!");
    window.setTimeout(() => {
      if (recDef) showToast(`추천 첫 구매: ${recDef.name} — ${recDef.desc}`);
    }, 900);
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
      showToast(`✦ 층 이벤트: ${state.floorEvent.label} — ${state.floorEvent.desc}`);
    }, defeatedBoss ? 3000 : 700);
  }

  // 첫 판 첫 번째 적 처치 — 특별 축하 연출
  if (!state.firstFloorCleared && !defeatedBoss && state.floor >= 2 && state.run <= 1) {
    state.firstFloorCleared = true;
    window.setTimeout(() => {
      spawnParticles(48);
      showToast("첫 번째 적 처치! 짐의 위엄이 드디어 증명되었느니라!");
      setDialogue("보았느냐! 짐의 보좌관이... 아니, 짐의 위엄이 이겼다!", "허세");
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
        showBossTitleOverlay(bossName, bossIntent);
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
        setDialogue(`저, 저기... 다음은 ${nextBossName}이 온다는 걸 짐이 이미 알았느니라! 준비됐느니라!`, "긴장");
        // 다음 보스 이름 배너 잠깐 표시
        const bossTeaser = document.createElement("div");
        bossTeaser.className = "boss-teaser-banner";
        bossTeaser.innerHTML = `<span>다음 보스</span><strong>${nextBossName}</strong><em>${nextBossData?.intent || ""}</em>`;
        el.stagePanel.appendChild(bossTeaser);
        window.setTimeout(() => bossTeaser.remove(), 3200);
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
          showToast("🎉 첫 보스 처치! 마왕님 전설의 시작이니라! 파편으로 영구 강화 가능!");
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

  const slots = getEquippedPartIds().map((id) => partDefs[id]);
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
  shakeScreen(3);
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
  el.choiceReason.textContent = `${reason}: 이번 판의 허세를 강화합니다.`;
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
    button.innerHTML = `
      <img class="choice-icon" src="${part.image}" alt="" />
      <span class="rarity-pill">${level === 0 ? "NEW" : `Lv.${level + 1}`}</span>
      ${partSynergyBadge}
      <strong>${part.name}</strong>
      <p>${part.desc}</p>
      <em class="claim-line">컷 카드 캡션: ${part.caption}</em>
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
    : `<div class="reinc-shard-hint">파편 ${totalShards}개 보유 — 아래 영구 강화에 사용하세요</div>`;
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
  const shareText = [
    `귀염뽀짝 파멸의 군주`,
    `${state.floor - 1}층 도달 · ${runGrade}등급 ${gradeEmoji[runGrade] || ""}`,
    `막기 ${state.runInterceptTotal || 0}회 · PERFECT ${state.runPerfectTotal || 0}회`,
    forced ? `체면 완전 상실 (짐은 하나도 무섭지 않았느니라!)` : `자진 환생 (전략적 후퇴니라!)`,
    runScore > 0 ? `${runScore.toLocaleString()}점` : "",
  ].filter(Boolean).join("\n");
  const shareBtn = `<button class="run-share-btn" type="button" data-share-text="${shareText.replace(/"/g, "&quot;")}">📋 결과 복사</button>`;
  el.reincarnateSummary.innerHTML = forced
    ? `마왕님 체면이 바닥났습니다. 파편 +${gain}개 회수.${recordLine}${runSummaryLine}${carryLine}${shardHint}${nextPowerLine}<br/><span class="reinc-teaser">${teaser}</span>${shareBtn}`
    : `환생 시 파편 +${gain}개 획득.${recordLine}${runSummaryLine}${carryLine}${shardHint}${nextPowerLine}<br/><span class="reinc-teaser">${teaser}</span>${shareBtn}`;
  const shareBtnEl = el.reincarnateSummary.querySelector(".run-share-btn");
  if (shareBtnEl) {
    shareBtnEl.addEventListener("click", () => {
      const txt = shareBtnEl.dataset.shareText;
      navigator.clipboard?.writeText(txt).then(() => {
        shareBtnEl.textContent = "✅ 복사됨!";
        window.setTimeout(() => { shareBtnEl.textContent = "📋 결과 복사"; }, 2000);
      }).catch(() => {
        shareBtnEl.textContent = "복사 실패 (직접 선택하세요)";
      });
    });
  }
  renderUpgrades();
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
    showToast(`제 ${state.run}판 시작!`);
    if (carryTrait) {
      window.setTimeout(() => showToast(`계승: ${carryTrait.name} — 이 특성을 들고 시작합니다`), 600);
    }
    if (prevRun > 0) {
      const newStats = getStats();
      const newDps = newStats.autoDamage * newStats.autoSpeed;
      const pct = prevDps > 0 ? Math.round((newDps / prevDps - 1) * 100) : 0;
      if (pct > 0) {
        window.setTimeout(() => {
          spawnParticles(16);
          showToast(`지난 판보다 ${pct}% 더 강함!`);
          // 시각적 성장 배너
          const banner = document.createElement("div");
          banner.className = "run-power-banner";
          banner.innerHTML = `제 ${state.run}판 시작<strong>+${pct}% 강해짐!</strong>`;
          el.stagePanel.appendChild(banner);
          window.setTimeout(() => banner.remove(), 2400);
        }, carryTrait ? 1200 : 800);
      }
      // 이번 판 목표 힌트
      const runGoal = state.bestFloor <= 5
        ? `목표: 5층 보스 처치! 지난 최고: ${state.bestFloor}F`
        : state.bestFloor <= 10
          ? `목표: 10층 돌파! 파편 ${state.shards}개 모였어요`
          : `목표: ${Math.ceil(state.bestFloor / 5) * 5 + 5}F 도전! 현재 최고 ${state.bestFloor}F`;
      window.setTimeout(() => showToast(`📍 ${runGoal}`), carryTrait ? 1900 : 1400);
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
    button.addEventListener("click", () => buyUpgrade(upgrade.id, cost));
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
    showToast(`${upgradeDef.name} Lv.${level} 강화!`);
    window.setTimeout(() => showToast(feedbacks[id] || "강화 완료!"), 500);
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
  setDialogue(`${upgrade.name}? 흠, 짐의 위엄에 걸맞은 공물이니라.`, "허세");
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
      if (upgrade.id === "click") {
        statPreview = `반격 ${formatNumber(Math.round(currentStats.counterDamage))}/막기`;
      } else if (upgrade.id === "auto") {
        const dps = Math.round(currentStats.autoDamage * currentStats.autoSpeed);
        statPreview = `자동 ${formatNumber(dps)}/s`;
      } else if (upgrade.id === "guard") {
        statPreview = `체면 ${formatNumber(Math.round(currentStats.maxDignity))} MAX`;
      } else if (upgrade.id === "showoff") {
        statPreview = `궁극기 충전 x${currentStats.chargeGain.toFixed(2)}`;
      } else if (upgrade.id === "crit") {
        statPreview = `치명타 ${Math.round(currentStats.critChance * 100)}% · x${currentStats.critMult.toFixed(1)}`;
      }
      const statLine = statPreview ? `<span class="upgrade-stat-preview">${statPreview} →</span>` : "";
      return `
        <button class="run-upgrade${affordable ? " affordable" : ""}${recommended ? " recommended" : ""}" type="button" data-run-upgrade="${upgrade.id}" ${affordable ? "" : "disabled"}>
          <span class="upgrade-icon"><img src="${upgrade.image}" alt="" /></span>
          <span class="upgrade-copy">
            <strong>${upgrade.name} Lv.${level}</strong>
            <p>${upgrade.desc}</p>
            ${statLine}
          </span>
          ${recommended ? `<span class="recommend-badge">추천</span>` : ""}
          <span class="cost">${formatNumber(cost)}</span>
        </button>
      `;
    })
    .join("");
  el.runUpgradeGrid.querySelectorAll("[data-run-upgrade]").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.add("buy-bounce");
      window.setTimeout(() => button.classList.remove("buy-bounce"), 320);
      buyRunUpgrade(button.dataset.runUpgrade);
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
      return `
        <div class="trait-card">
          <img class="trait-icon" src="${trait.image}" alt="" />
          <div>
            <div class="trait-meta"><span>${trait.rarity}급</span><span>x${stacks[id]}</span></div>
            <strong>${trait.name}</strong>
            <p>${trait.desc}</p>
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
  const rewardText = dignityCritical
    ? `체면 ${dignityPercent}% · 다음 공격 막고 마왕님 살리기`
    : state.ultimate >= 100
      ? `궁극기 준비 · 지금 반격 컷 연출 가능 · ${owned}/${total}개`
      : state.enemy?.isBoss
        ? `지금 보스 격파 → 영상 파츠 선택 · ${owned}/${total}개 · ${power.synergyName}`
        : `${nextBossFloor}F 보스까지 ${floorsLeft}층${goal30} · ${owned}/${total}개`;
  const key = `${state.floor}:${state.enemy?.isBoss ? 1 : 0}:${rewardText}:${nextTraitLabel}:${bossLabel}:${ultimateLabel}:${dignityPercent}:${ids.map((id) => `${id}:${getPartLevel(id)}`).join("|")}`;
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
  const comboMult = getComboMultiplier();
  const prepRate = clamp(state.prep || 0, 0, 100);
  const prepMult = getPrepMultiplier(state.enemy);
  const nextStreakBonus = (state.rescueStreak || 0) > 0 && (state.rescueStreak + 1) % 3 === 0;

  if (el.runText) {
    el.runText.textContent = `${state.run}`;
    el.runText.closest(".hud-stat")?.classList.toggle("hidden-run", state.run <= 1);
  }
  if (el.streakChip && el.streakText) {
    const sn = state.rescueStreak || 0;
    el.streakText.textContent = sn >= 7 ? `🔥${sn}` : sn >= 3 ? `⚡${sn}` : `${sn}`;
    el.streakChip.classList.toggle("hidden-streak", sn < 2);
    el.streakChip.classList.toggle("streak-fever", sn >= 7);
    el.streakChip.classList.toggle("streak-hot", sn >= 3 && sn < 7);
  }
  el.floorText.textContent = `${state.floor}F`;
  if (el.bestFloorText) el.bestFloorText.textContent = `${state.bestFloor}F`;
  if (el.floorProgressBar) {
    const cycleFloor = ((state.floor - 1) % 5) + 1;
    el.floorProgressBar.style.width = `${(cycleFloor / 5) * 100}%`;
    el.floorProgressBar.parentElement?.classList.toggle("floor-bar-boss", state.enemy?.isBoss);
  }
  updateDemonTitle();
  el.shardText.textContent = formatNumber(state.shards);
  el.dignityText.textContent = `${dignityPercent}%`;
  el.ultimateText.textContent = `${Math.round(state.ultimate)}%`;
  el.ultimateInlineText.textContent = `${Math.round(state.ultimate)}%`;
  el.enemyLabel.textContent = state.enemy.title;
  el.enemyName.textContent = state.enemy.name;
  if (el.enemyArt) el.enemyArt.style.backgroundImage = `url("${state.enemy.image}")`;
  el.arenaEnemy.src = state.enemy.image;
  el.enemyHpText.textContent = `${formatNumber(state.enemy.hp)} / ${formatNumber(state.enemy.maxHp)}`;
  el.enemyHpBar.style.width = `${clamp(enemyHpRate * 100, 0, 100)}%`;
  // 적 HP 단계에 따라 바 색상 변화
  el.enemyHpBar.parentElement?.classList.toggle("hp-phase-low", enemyHpRate <= 0.25);
  el.enemyHpBar.parentElement?.classList.toggle("hp-phase-mid", enemyHpRate > 0.25 && enemyHpRate <= 0.5);
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
  el.timingCall.textContent = dangerReady
    ? impactSoon ? "맞기 직전!!" : "막기!"
    : phase.aiming
      ? "조준 중 — 막을 준비!"
      : dignityCritical
        ? `체면 위험 ${dignityPercent}%`
        : state.ultimate >= 100
          ? "✦ 궁극기 준비!"
          : prepRate >= 70
            ? `기력 ${Math.round(prepRate)}% ★`
            : `기력 ${Math.round(prepRate)}%`;
  const streakN = state.rescueStreak || 0;
  el.comboText.textContent = streakN >= 7
    ? `🔥 FEVER ${streakN}연속 · x${comboMult.toFixed(2)}`
    : streakN >= 3
      ? `⚡ ${streakN}연속 · x${comboMult.toFixed(2)}`
      : streakN >= 1
        ? `${streakN}연속 · x${comboMult.toFixed(2)}`
        : dignityCritical ? `체면 위험 ${dignityPercent}%` : state.ultimate >= 100 ? "궁극기 준비!" : `기력 ${Math.round(prepRate)}%`;
  el.comboText.dataset.streak = streakN >= 7 ? "fever" : streakN >= 3 ? "hot" : streakN >= 1 ? "warm" : "";
  const breakCount = state.enemy.isBoss ? (state.enemy._breakCount || 0) : 0;
  const breakStars = state.enemy.isBoss
    ? "★".repeat(Math.min(3, breakCount)) + "☆".repeat(Math.max(0, 3 - breakCount))
    : "";
  el.breakText.textContent = state.enemy.isBoss
    ? `${breakStars} ${Math.round(state.enemy.breakGauge)}%`
    : `${Math.round(state.enemy.breakGauge)}%`;
  el.breakBar.style.width = `${clamp(state.enemy.breakGauge, 0, 100)}%`;
  el.ultimateBar.style.width = `${clamp(state.ultimate, 0, 100)}%`;
  el.ultimateBtn.disabled = state.ultimate < 100 || state.paused || state.cutscenePlaying;
  el.ultimateBtn.classList.toggle("ultimate-ready", state.ultimate >= 100 && !state.paused && !state.cutscenePlaying);
  if (el.ultimateBtnLabel) {
    el.ultimateBtnLabel.textContent = state.ultimate >= 100
      ? "궁극기!"
      : `궁극기 ${Math.round(state.ultimate)}%`;
  }
  el.prepText.textContent = dangerReady
    ? `기력 ${Math.round(prepRate)}%`
    : prepRate >= 70
      ? `기력 ${Math.round(prepRate)}% ★`
      : `기력 ${Math.round(prepRate)}%`;
  el.prepBar.style.width = `${prepRate}%`;
  el.prepBar.style.setProperty("--prep-multiplier-text", `"x${prepMult.toFixed(2)}"`);
  el.prepBar.closest(".prep-gauge")?.classList.toggle("prep-charged", prepRate >= 70);
  const enemyLowHp = state.enemy && state.enemy.hp / state.enemy.maxHp <= 0.25;
  el.tapLabel.textContent = dangerReady
    ? nextStreakBonus ? "⚡ 연속 막기!" : "★ 지금 막아!"
    : phase.aiming ? "⏱ 막을 준비!"
    : dignityCritical ? "🚨 위기! 막아!"
    : enemyLowHp ? "💥 마무리!"
    : prepRate < 30 ? "탭 — 보좌관 준비!"
    : prepRate < 70 ? `보좌관 출동 준비 ${Math.round(prepRate)}%`
    : "보좌관 대기 완료 — 기다리는 중!";
  if (el.enemyAttackStat) {
    el.enemyAttackStat.textContent = dangerReady
      ? "⚡ 막기!"
      : phase.aiming
        ? `조준 중 ${Math.max(0, state.enemy.attackTimer).toFixed(1)}s`
        : impactSoon ? "맞는다!!" : `HP ${Math.round(state.enemy.hp / state.enemy.maxHp * 100)}%`;
    el.enemyAttackStat.classList.toggle("stat-danger", dangerReady || impactSoon);
  }
  el.clickPowerText.textContent = dangerReady
    ? `반격 x${prepMult.toFixed(2)}`
    : phase.aiming ? "막을 준비" : dignityCritical ? `체면 ${dignityPercent}%` : `반격 x${prepMult.toFixed(2)}`;
  el.autoPowerText.textContent = dangerReady ? "위험!" : phase.aiming ? "조준 감지" : state.rescueStreak ? `연속 ${state.rescueStreak}회` : `자동 ${formatNumber(stats.autoDamage * stats.autoSpeed * stats.autoTempo)}/s`;
  el.tapBtn.classList.toggle("danger-ready", dangerReady);
  el.tapBtn.classList.toggle("watching", phase.aiming);
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
  el.stagePanel.classList.toggle("danger", dangerReady);
  // 적 말풍선 taunt 텍스트 업데이트
  if (el.arenaEnemy) {
    const threatCard = el.arenaEnemy.closest(".threat-card");
    if (threatCard) {
      const tauntText = dangerReady
        ? "지금이다!!"
        : phase.aiming
          ? state.enemy.intent || "마왕님… 각오해라"
          : "";
      threatCard.dataset.taunt = tauntText;
    }
  }
  el.stagePanel.classList.toggle("impact-soon", impactSoon);
  el.stagePanel.classList.toggle("combo-warm", (state.rescueStreak || 0) >= 1);
  el.stagePanel.classList.toggle("combo-hot", (state.rescueStreak || 0) >= 3);
  el.stagePanel.classList.toggle("combo-fever", (state.rescueStreak || 0) >= 7);
  el.stagePanel.classList.toggle("is-boss", state.enemy.isBoss);
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
  el.dialogueText.textContent = state.dialogue;
  const buyableCount = state.sideUnlocked ? runUpgradeDefs.filter(u => state.tributes >= getRunUpgradeCost(u)).length : 0;
  const canAffordUpgrade = buyableCount > 0;
  // 공물이 늘어서 새로 구매 가능해졌을 때 HUD 바운스
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
        el.creditCut.style.animation = "";
      }
    } else {
      el.creditCut.classList.add("hidden");
    }
  }
  // 상황에 따른 캐릭터 이미지 선택 (impactSoon > pose 순위)
  const heroImage = impactSoon
    ? heroSprites.hit
    : (heroSprites[state.pose] || heroSprites.idle);
  if (el.mainCharacter.getAttribute("src") !== heroImage) el.mainCharacter.src = heroImage;

  // 하단 탭 패널 잠금 상태 반영
  const bottomPanels = document.querySelector(".bottom-panels");
  if (bottomPanels) {
    const isLocked = !state.sideUnlocked && state.run <= 1 && state.floor < 2;
    bottomPanels.classList.toggle("side-locked", isLocked);
  }

  renderParts();
  renderStageReward();
  renderTraits();
  renderRunUpgrades();
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

function flashScreen(color = "white", duration = 0.35) {
  const div = document.createElement("div");
  div.className = `screen-flash ${color}`;
  div.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:9999;--flash-dur:${duration}s`;
  document.body.appendChild(div);
  window.setTimeout(() => div.remove(), duration * 1000 + 50);
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

function showToast(message) {
  // 신규 유저 (처음 3분 / 3층 이하) — 동시 최대 1개로 제한
  const isNewbie = (state.floor <= 3 && state.run <= 1) || (!state.firstBlockSeen);
  const maxToasts = isNewbie ? 1 : 3;
  while (el.toastStack.children.length >= maxToasts) {
    el.toastStack.firstChild?.remove();
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  el.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 1800);
  window.setTimeout(() => toast.remove(), 2200);
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
  const labelMap = { perfect: "PERFECT BLOCK!", great: "GREAT BLOCK!", guard: "BLOCK!", early: "BLOCK!" };
  burst.textContent = labelMap[timingKey] || "BLOCK!";
  stage.appendChild(burst);
  window.setTimeout(() => burst.remove(), 700);
}

function showBossTitleOverlay(bossName, bossIntent) {
  const overlay = document.createElement("div");
  overlay.className = "boss-title-overlay";
  overlay.innerHTML = `
    <div class="boss-title-name">${bossName}</div>
    <div class="boss-title-line"></div>
    <div class="boss-title-sub">${bossIntent}</div>
  `;
  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 2300);
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
  burst.textContent = `${floor}F 돌파!`;
  el.stagePanel.appendChild(burst);
  // 전투 영역 황금 flash
  el.stagePanel.classList.add("floor-clear-flash");
  window.setTimeout(() => {
    burst.remove();
    el.stagePanel.classList.remove("floor-clear-flash");
  }, 900);
}

function showClearGrade(grade, color, interceptRate, interceptCount) {
  const pct = Math.round(interceptRate * 100);
  const wrapper = document.createElement("div");
  wrapper.className = "grade-popup";
  wrapper.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <span class="grade-popup-text" style="color:${color};text-shadow:0 0 24px ${color}88,0 2px 0 rgba(44,25,48,0.5)">${grade}</span>
      <span style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:0.06em;">가로채기 ${interceptCount}회 · ${pct}% 성공</span>
    </div>
  `;
  document.body.appendChild(wrapper);
  window.setTimeout(() => wrapper.remove(), 1400);
}

function showEndingSequence(runCount) {
  const overlay = document.createElement("div");
  overlay.className = "ending-overlay";
  const runLabel = runCount > 1 ? `(${runCount}판만에)` : "(첫 판에!)";
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
      <button class="command-btn primary ending-close-btn" type="button">계속하기</button>
    </div>
  `;
  document.body.appendChild(overlay);
  flashScreen("gold", 0.8);
  spawnParticles(60);
  playSfx("ultimate");
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

  const gradeComment = {
    S: "완벽한 보좌! 짐의 위엄이 빛났느니라.",
    A: "훌륭하니라. 짐은 만족스럽다!",
    B: "그럭저럭이니라. 보좌관은 더 열심히 할 것이니라.",
    C: "흠... 짐이 몇 번 당한 것 같으니라."
  }[grade];

  const report = document.createElement("div");
  report.className = "boss-report-card";
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
    <span class="boss-report-close">탭하여 닫기</span>
  `;
  document.body.appendChild(report);
  const close = () => {
    report.classList.add("boss-report-exit");
    window.setTimeout(() => report.remove(), 400);
  };
  report.addEventListener("click", close);
  window.setTimeout(close, 5500);
}

function showFloorClearBanner(floorNum, isBoss) {
  if (isBoss) {
    const flash = document.createElement("div");
    flash.className = "boss-defeat-flash";
    document.body.appendChild(flash);
    window.setTimeout(() => flash.remove(), 700);
    // 보스 격파 풀스크린 텍스트
    const overlay = document.createElement("div");
    overlay.className = "boss-victory-overlay";
    const bossVictoryLines = floorNum >= 25
      ? ["전설이 시작됐느니라!", "짐은 원래 이 정도니라!!"]
      : floorNum >= 15
      ? ["흐흥! 역시 짐이었느니라!", "보좌관들아, 짐이 계획한 대로니라!"]
      : floorNum >= 10
      ? ["이 보스도 짐의 발 아래니라!", "계획대로니라. 처음부터 알았느니라!"]
      : ["보았느냐! 짐이 이겼느니라!", "흐흥, 이게 바로 짐이니라!"];
    overlay.textContent = randomPick(bossVictoryLines);
    document.body.appendChild(overlay);
    window.setTimeout(() => {
      overlay.classList.add("boss-victory-exit");
      window.setTimeout(() => overlay.remove(), 500);
    }, 1200);
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
  document.body.appendChild(banner);
  window.setTimeout(() => {
    banner.classList.add("floor-clear-exit");
    window.setTimeout(() => banner.remove(), 400);
  }, isBoss ? 1800 : 900);
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

  const lines = [
    { mood: "울먹임", text: "...흥. 저, 저게 또 짐을 혼내러 왔구나. 막기 버튼을 눌러 기력을 쌓아라!", delay: 0 },
    { mood: "명령", text: "적이 빨간색으로 빛나면 막기 버튼을 눌러야 한다! 기력이 높을수록 반격이 강해진다!", delay: 1600 },
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
    if (state.enemy && state.floor === 1 && state.run <= 1) {
      state.enemy.attackTimer = 3.2;
    }
    // 인트로 종료 시 게임의 핵심 유머 — creditCut을 미리 한번 맛보기
    showCreditCut(
      "rescue",
      "실제: 보좌관이 지금도 막고 있음",
      "발표: 짐이 모두 계획한 것이니라!",
      2.2,
    );
    showToast("빨간 버튼으로 적의 공격을 가로채세요!");
    el.tapBtn.classList.add("intro-pulse");
    window.setTimeout(() => el.tapBtn.classList.remove("intro-pulse"), 3000);
    // 첫 클릭 전 — 화면 전체 탭 힌트 라벨 표시
    const mainStage = el.stageTap;
    if (mainStage && !mainStage.querySelector(".tap-hint-label")) {
      const tapHint = document.createElement("span");
      tapHint.className = "tap-hint-label";
      tapHint.textContent = "화면을 탭 → 기력 충전!";
      mainStage.appendChild(tapHint);
      const removeTapHint = () => {
        tapHint.remove();
        mainStage.removeEventListener("click", removeTapHint);
      };
      mainStage.addEventListener("click", removeTapHint, { once: true });
    }
    showLoopInfoCard();
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
  }, 3500);
}

function showLoopInfoCard() {
  const card = document.createElement("div");
  card.className = "loop-info-card";
  card.innerHTML = `
    <div class="loop-info-row">
      <span class="loop-step">① 막기 클릭</span>
      <span class="loop-arrow">→</span>
      <span class="loop-step">② 기력 쌓기</span>
      <span class="loop-arrow">→</span>
      <span class="loop-step">③ 위험 시 막기</span>
      <span class="loop-arrow">→</span>
      <span class="loop-step highlight">💥 강한 반격!</span>
    </div>
    <span class="loop-info-sub">기력이 높을수록 반격이 더 강해집니다</span>
  `;
  document.body.appendChild(card);
  window.setTimeout(() => {
    card.classList.add("loop-info-exit");
    window.setTimeout(() => card.remove(), 400);
  }, 4000);
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

    // aiming 시작 시 적 도발 말풍선
    const _curPhaseForTaunt = getCombatPhase(state.enemy, getStats());
    if (_curPhaseForTaunt.aiming && !_wasAiming && !_wasDanger && state.enemy) {
      const tauntKind = state.enemy.kind || "knight";
      showEnemyTauntBubble(tauntKind, state.enemy.isBoss);
    }
    _wasAiming = _curPhaseForTaunt.aiming;
    _wasDanger = _curPhaseForTaunt.dangerReady;

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

el.stageTap.addEventListener("click", rescueAction);
el.tapBtn.addEventListener("click", rescueAction);
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
        <img src="assets/mainchar_proud_clean.png" alt="마왕님" class="splash-char" />
        <div class="splash-title">귀염뽀짝 파멸의 군주</div>
        <div class="splash-tagline">허세 마왕님이 사실 아무것도 못 하는데<br/>보좌관들이 다 해주는 클리커 RPG</div>
        <div class="splash-quote">"짐이 한 거니라... 보좌관은 아무 관계 없느니라."</div>
        <div class="splash-hint">탭해서 시작 ▶</div>
      </div>
    `;
    document.body.appendChild(splash);
    const dismiss = () => {
      splash.classList.add("splash-exit");
      window.setTimeout(() => {
        splash.remove();
        window.setTimeout(playIntro, 200);
      }, 380);
      splash.removeEventListener("click", dismiss);
    };
    splash.addEventListener("click", dismiss);
    window.setTimeout(dismiss, 3500);
  })();
} else if (state.enemy) {
  // 2판+ 첫 로드 시 적 이름 표시
  window.setTimeout(() => showEnemyNameBadge(state.enemy.name, state.enemy.title), 600);
}

startMurmurLoop();
requestAnimationFrame(update);

// 탭 숨김/복귀 시 방치 보상 표시
let _hiddenAt = null;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    _hiddenAt = Date.now();
  } else if (_hiddenAt !== null) {
    const away = (Date.now() - _hiddenAt) / 1000;
    _hiddenAt = null;
    if (away >= 30) {
      const autoStats = getStats();
      const idleGain = Math.round(autoStats.autoDamage * autoStats.autoSpeed * autoStats.autoTempo * away * 0.6);
      const idleTributes = Math.round((0.35 + state.floor * 0.12) * away * 0.6);
      const minLabel = away >= 60 ? `${Math.floor(away / 60)}분 ${Math.round(away % 60)}초` : `${Math.round(away)}초`;
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
