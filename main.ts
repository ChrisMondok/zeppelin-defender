let assetsLoaded: Promise<void>;

function addAsset(asset: Promise<void>) {
  assetsLoaded = assetsLoaded || Promise.resolve();
  assetsLoaded = assetsLoaded.then(() => asset);
}

window.addEventListener('load', () => {
  assetsLoaded.then(() => {
    let game = (window as any).game = new Game();

    const counter = new FPSCounter(game);

    requestAnimationFrame(draw);

    function draw(ts: number) {
      game.tick(ts);
      game.draw();
      requestAnimationFrame(draw);
    }
  });
});

const audioContext = new AudioContext();

function fillWithAudioBuffer(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    addAsset(
      fetch(url)
      .then(data => data.arrayBuffer())
      .then(ab => {
        return new Promise<AudioBuffer>((resolve, reject) => {
          audioContext.decodeAudioData(ab, resolve, reject);
        });

      }).then((buffer: AudioBuffer) => {
        target[propertyKey] = buffer;
      }));
  }
}
