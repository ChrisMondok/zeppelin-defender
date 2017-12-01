var assetsLoaded: Promise<void>;

function addAsset(asset: Promise<void>) {
  assetsLoaded = assetsLoaded || Promise.resolve();
  assetsLoaded = assetsLoaded.then(() => asset);
}

window.addEventListener('load', () => {
  assetsLoaded.then(() => {
    const loadingDiv = document.querySelector('div')!;
    loadingDiv.parentElement!.removeChild(loadingDiv);

    let game = (window as any).game = new Game();

    requestAnimationFrame(draw);

    function draw(ts: number) {
      game.tick(ts);
      game.draw();
      requestAnimationFrame(draw);
    }
  }, e => {
    const loadingDiv = document.querySelector('div')!;
    loadingDiv.innerText = e;
  });
});

const audioContext = new AudioContext();

function fillWithAudioBuffer(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    addAsset(
      fetch(url)
      .then(data => {
        if(data.status < 200 || data.status > 400) throw new Error(`Could not load ${url}`);
        return data.arrayBuffer();
      })
      .then(ab => {
        return new Promise<AudioBuffer>((resolve, reject) => {
          audioContext.decodeAudioData(ab, resolve, (e) => {
            reject(`Could not decode ${url}`);
          });
        });

      }).then((buffer: AudioBuffer) => {
        target[propertyKey] = buffer;
      }));
  }
}

function fillWithImage(url: string): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    const promise = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => reject(`Could not load image ${url}`);
      image.src = url;
      target[propertyKey] = image;
    });
    addAsset(promise);
  }
}
