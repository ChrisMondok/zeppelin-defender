/// <reference path="Input.ts"/>

type KeyMap = {[key in Action]: string} &
  {left: string, right: string, up: string, down: string};

class KeyboardInput extends Input {
  static keyboardState: {[key: string]: boolean} = {};

  readonly map: KeyMap = {
    BLOCK: 'KeyZ',
    FIRE: 'KeyX',
    JUMP: 'Space',
    RESUME: 'Space',
    PAUSE: 'Escape',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
  };

  getAxis(axis: number): number {
    const negativeCode = axis === 0 ? this.map.left : this.map.up;
    const positiveCode = axis === 0 ? this.map.right : this.map.down;

    const negativeState = KeyboardInput.keyboardState[negativeCode];
    const positiveState = KeyboardInput.keyboardState[positiveCode];

    return Number(positiveState === true) - Number(negativeState === true);
  }

  tick() {
    this.copyOldState();
    this.readState();
  }

  private readState() {
    for(let key in this.map) {
      let action = key as Action;
      let code = this.map[action];
      this.state.buttons[action] = KeyboardInput.keyboardState[code] === true;
    }
  }
}

window.addEventListener('load', () => {
  document.body.addEventListener('keydown', (e) => {
    KeyboardInput.keyboardState[e.code] = true;
  });

  document.body.addEventListener('keyup', (e) => {
    KeyboardInput.keyboardState[e.code] = false;
  });
});

window.addEventListener('blur', () => {
  for(const code in KeyboardInput.keyboardState) {
    KeyboardInput.keyboardState[code] = false;
  }
});
