import { battleConfig as config } from './config.js';
import { SpineActor } from './spine-actor.js';

function initializeBattle() {
  const root = document.querySelector('#battle');
  const actors = [];
  const statuses = new Map();
  const status = root.querySelector('[data-battle-status]');
  const debug = root.querySelector('[data-battle-debug]');
  const debugEnabled = new URLSearchParams(location.search).get('battleDebug') === '1';
  debug.hidden = !debugEnabled;

  for (const id of ['player', 'dummy']) {
    const c = config[id];
    const figure = root.querySelector(`[data-actor="${id}"]`);
    const health = root.querySelector(`[data-health="${id}"]`);
    health.max = c.maxHealth; health.value = c.maxHealth;
    root.querySelector(`[data-health-text="${id}"]`).textContent = `${c.maxHealth} / ${c.maxHealth}`;
    const actor = new SpineActor(figure.querySelector('.battle-spine'), { ...c, defaultMix: config.defaultMix }, (state, message) => {
      figure.dataset.state = state;
      figure.querySelector('.battle-actor-status').textContent = `${c.label} · ${message}`;
      statuses.set(id, state);
      status.textContent = [...statuses.values()].includes('error') ? '리소스 로딩 오류 · 아래 메시지를 확인해 주세요.' :
        statuses.size === 2 && [...statuses.values()].every(s => s === 'ready') ? 'SPINE 4.3 · IDLE' : '1단계 · 리소스 연결 전 미리보기';
      root.querySelector(`[data-debug-actor="${id}"]`).textContent = message;
    }, config.playbackSpeed);
    actors.push(actor);
    actor.load();
  }

  if (config.background) {
    const image = new Image();
    image.onload = () => { root.querySelector('.battle-stage').style.backgroundImage = `url("${image.src}")`; };
    image.onerror = () => { console.error('[Battle/background]', image.src); status.textContent = `배경 로딩 실패: ${config.background}`; };
    image.src = new URL(config.background, document.baseURI).href;
  }
  function reset() {
    actors.forEach(actor => actor.reset());
    for (const id of ['player', 'dummy']) root.querySelector(`[data-health="${id}"]`).value = config[id].maxHealth;
  }
  root.querySelector('[data-battle-reset]').addEventListener('click', reset);
  root.addEventListener('keydown', event => {
    if (event.repeat || event.target.closest('input, select, textarea, button')) return;
    if (event.code === config.keys.reset) { event.preventDefault(); reset(); }
  });
  // 페이지를 떠날 때만 해제합니다. bfcache 복귀에서는 기존 인스턴스를 보존합니다.
  window.addEventListener('pagehide', event => { if (!event.persisted) actors.forEach(actor => actor.dispose()); });

}
if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', initializeBattle, { once: true });
else initializeBattle();
