// Real recorded book page-turn sample (client/public/sounds/page-turn.mp3),
// not synthesized — "Single book paging" from Mixkit's free sound-effects
// library (mixkit.co/free-sound-effects/page/), usable for free in personal
// and commercial projects under the Mixkit license, no attribution required.

let ctx: AudioContext | null = null;
let bufferPromise: Promise<AudioBuffer> | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Fetches + decodes the page-turn sample once and caches the AudioBuffer for instant replay. */
function loadPageTurnBuffer(audio: AudioContext): Promise<AudioBuffer> {
  if (!bufferPromise) {
    bufferPromise = fetch('/sounds/page-turn.mp3')
      .then((res) => res.arrayBuffer())
      .then((data) => audio.decodeAudioData(data));
  }
  return bufferPromise;
}

export function playPageTurn(): void {
  const audio = getContext();
  if (!audio) return;

  void loadPageTurnBuffer(audio).then((buffer) => {
    const source = audio.createBufferSource();
    source.buffer = buffer;

    const gain = audio.createGain();
    gain.gain.value = 0.55;

    source.connect(gain).connect(audio.destination);
    source.start();
  });
}
