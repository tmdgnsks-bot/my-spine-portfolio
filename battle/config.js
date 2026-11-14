// 경로는 index.html 기준입니다. null인 리소스는 요청하지 않습니다.
export const battleConfig = {
  background: null,
  playbackSpeed: 1,
  keys: { attack: 'KeyA', heavy: 'KeyS', skill: 'KeyD', dodge: 'Space', reset: 'KeyR' },
  player: {
    label: 'PLAYER', maxHealth: 1000, skeleton: null, atlas: null,
    animations: { idle: null, attack: [], heavy: null, skill: null, dodge: null },
    premultipliedAlpha: true, skin: null,
    viewport: { padLeft: '10%', padRight: '10%', padTop: '10%', padBottom: '5%' },
  },
  dummy: {
    label: 'TRAINING DUMMY', maxHealth: 1000, skeleton: null, atlas: null,
    animations: { idle: null, hit: null },
    premultipliedAlpha: true, skin: null,
    viewport: { padLeft: '10%', padRight: '10%', padTop: '10%', padBottom: '5%' },
  },
  // 2~4단계에서 연결할 값. 시간 단위는 초, 거리는 씬 기준 px입니다.
  inputBuffer: 0.18,
  defaultMix: 0.08,
  attacks: {
    attack: { damage: 40, hitEvent: 'hit', fallbackHitTime: 0.22, hitstop: 0.045, mix: 0.03, shake: 2, knockback: 6, comboWindow: [0.3, 0.55], cancelWindow: [0.45, 0.6] },
    heavy: { damage: 90, hitEvent: 'hit', fallbackHitTime: 0.42, hitstop: 0.065, mix: 0.02, shake: 4, knockback: 12 },
    skill: { damage: 120, hitEvent: 'hit', fallbackHitTime: 0.5, hitstop: 0.06, mix: 0.03, shake: 3, knockback: 10 },
  },
};
