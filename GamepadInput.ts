/// <reference path="Input.ts"/>

type ButtonMap = {[key in Action]: number};

class GamepadInput extends Input {
  constructor(readonly gamepadNumber: number) {
    super();
  }

  readonly map: ButtonMap = {
    JUMP: 0,
    BLOCK: 1,
    FIRE: 2,
    PAUSE: -1,
    RESUME: -1,
  }

  tick() {
    const gamepad = this.gamepad;

    this.copyOldState();
    if(gamepad) {
      this.updateMap(gamepad);
      this.readState(gamepad);
    }
    else this.clearState();
  }

  getAxis(axis: number) {
    const gamepad = this.gamepad;
    if(!gamepad) return 0;
    this.updateMap(gamepad);
    const raw = gamepad.axes[axis];
    return this.isDeadZone(raw) ? 0 : raw;
  }

  private get gamepad(): Gamepad|null{
    return navigator.getGamepads()[this.gamepadNumber];
  }

  private readState(gamepad: Gamepad) {
    for(let key in this.map) {
      let action = key as Action;
      let button = this.map[action];
      this.state.buttons[action] = gamepad.buttons[button].pressed;
    }

    for(let a = 0; a < gamepad.axes.length; a++) {
      this.state.axes[a] = gamepad.axes[a];
    }
  }

  private clearState() {
    for(let b in this.state.buttons) this.state.buttons[b as Action] = false;
    for(let a in this.state.axes) this.state.axes[a] = 0;
  }

  private isDeadZone(raw: number) {
    return Math.abs(raw)<0.2;
  }

  private updateMap(gamepad: Gamepad) {
    this.map.PAUSE = gamepad.mapping === 'standard' ? 9 : 7;
    this.map.RESUME = navigator.userAgent.indexOf('Xbox') > -1 ? this.map.JUMP : this.map.PAUSE;
  }
}
