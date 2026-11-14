// 기존 공식 SpinePlayer 4.3.13(WebGL)을 재사용합니다.
// 인스턴스마다 Skeleton, AnimationState 및 atlas texture loader가 독립적입니다.
export function assertVersion(version) {
  if (!/^4\.3(?:\.|$)/.test(version || '')) {
    throw new Error(`Spine 4.3 추출 파일이 필요합니다. 감지된 버전: ${version || '없음'}`);
  }
}

export async function checkSkeleton(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  let version;
  if (/\.json$/i.test(url.pathname)) {
    version = (await response.json()).skeleton?.spine;
  } else {
    // Spine 4.3 binary: 8-byte hash 뒤 varint 길이의 UTF-8 version 문자열.
    const data = new Uint8Array(await response.arrayBuffer());
    let offset = 8, size = 0, shift = 0, byte;
    do {
      if (offset >= data.length || shift > 28) throw new Error('잘못된 SKEL 헤더');
      byte = data[offset++]; size |= (byte & 127) << shift; shift += 7;
    } while (byte & 128);
    if (size < 2 || offset + size - 1 > data.length) throw new Error('잘못된 SKEL 버전 문자열');
    version = new TextDecoder().decode(data.subarray(offset, offset + size - 1));
  }
  assertVersion(version);
}

export class SpineActor {
  constructor(host, config, report, speed = 1) {
    this.host = host; this.config = config; this.report = report; this.speed = speed;
    this.disposed = false; this.player = null;
  }
  async load() {
    const c = this.config;
    if (!c.skeleton && !c.atlas) { this.report('placeholder', '리소스 미연결 · 임시 도형'); return; }
    try {
      if (!c.skeleton || !c.atlas) throw new Error('skeleton과 atlas 경로를 모두 설정해 주세요.');
      if (!window.spine?.SpinePlayer) throw new Error('공식 Spine 4.3 런타임을 불러오지 못했습니다.');
      if (!c.animations.idle) throw new Error('추출 파일을 확인하고 animations.idle을 설정해 주세요.');
      const skeleton = new URL(c.skeleton, document.baseURI);
      const atlas = new URL(c.atlas, document.baseURI);
      await checkSkeleton(skeleton);
      if (this.disposed) return;
      this.player = new window.spine.SpinePlayer(this.host, {
        skeleton: skeleton.href, atlas: atlas.href,
        animation: c.animations.idle,
        ...(c.skin ? { skin: c.skin } : {}),
        alpha: true, backgroundColor: '#00000000',
        premultipliedAlpha: c.premultipliedAlpha,
        showControls: false, showLoading: false, interactive: false,
        viewport: c.viewport,
        success: (player) => {
          if (this.disposed) return;
          if (!player.skeleton.data.findAnimation(c.animations.idle)) {
            this.fail(new Error(`Idle 애니메이션을 찾을 수 없습니다: ${c.animations.idle}`)); return;
          }
          player.animationState.data.defaultMix = this.config.defaultMix ?? 0.08;
          player.speed = this.speed;
          player.setAnimation(c.animations.idle, true);
          this.report('ready', c.animations.idle);
        },
        error: (_player, message) => { if (!this.disposed) this.fail(new Error(String(message))); },
      });
    } catch (error) { if (!this.disposed) this.fail(error); }
  }
  fail(error) {
    console.error(`[Battle/${this.config.label}]`, error);
    this.report('error', error.message);
  }
  reset() {
    if (!this.player?.skeleton || this.player.error) return;
    this.player.animationState.clearTracks();
    this.player.setAnimation(this.config.animations.idle, true);
    this.player.speed = this.speed;
  }
  dispose() { this.disposed = true; this.player?.dispose(); this.host.replaceChildren(); }
}
