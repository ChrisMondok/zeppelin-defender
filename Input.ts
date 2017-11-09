class GamepadInput {
  private readonly previousState: GamepadSnapshot = {
    buttons: {},
    axes: {}
  };

  private readonly state: GamepadSnapshot = {
    buttons: {},
    axes: {}
  };

  constructor(readonly gamepadNumber: number) {}

  tick() {
    const gamepad = this.gamepad;

    this.copyOldState();
    if(gamepad) this.readState(gamepad);
    else this.clearState();
  }

  wasPressed(button: number) {
    return this.state.buttons[button] && !this.previousState.buttons[button];
  }

  wasReleased(button: number) {
    return !this.state.buttons[button] && this.previousState.buttons[button];
  }

  getAxis(axis: number) {
    const gamepad = this.gamepad;
    if(!gamepad) return 0;
    const raw = gamepad.axes[axis];
    return this.isDeadZone(raw) ? 0 : raw;
  }

  private get gamepad(): Gamepad|null{
    return navigator.getGamepads()[this.gamepadNumber];
  }

  private copyOldState() {
    for(let b in this.state.buttons) {
      this.previousState.buttons[b] = this.state.buttons[b] || false;
    }

    for(let a in this.state.axes) {
      this.previousState.axes[a] = this.state.axes[a];
    }
  }

  private readState(gamepad: Gamepad) {
    for(let b = 0; b < gamepad.buttons.length; b++) {
      this.state.buttons[b] = gamepad.buttons[b].pressed;
    }

    for(let a = 0; a < gamepad.axes.length; a++) {
      this.state.axes[a] = gamepad.axes[a];
    }
  }

  private clearState() {
    for(let b in this.state.buttons) this.state.buttons[b] = false;
    for(let a in this.state.axes) this.state.axes[a] = 0;
  }

  private isDeadZone(raw: number) {
    return Math.abs(raw)<0.2;
  }

}

type InitializedIHaveBindings = {
  doButtonBindings: (input: GamepadInput) => void;
  doAxisBindings: (input: GamepadInput) => void;

  __bindingsInitialized: true;

  __onGamepadPress: Array<{button: number, action: () => void}>;
  __onGamepadRelease: Array<{button: number, action: () => void}>;
  __axisBindings: Array<{axis: number, bindTo: string}>;
}

type GamepadSnapshot = {
  buttons: {[key: number]: boolean}
  axes: {[key: number]: number}
};

function bindTo(type: 'press' | 'release', {button}: BindingConfig): MethodDecorator {
  return function<T>(target: T, propertyKey: keyof T, descriptor: PropertyDescriptor) {
    const initializedTarget = initializeBindingTarget(target);
    initializedTarget.__onGamepadPress.push({button, action: (target as any)[propertyKey]});
  }
}

function bindToAxis(axis: number): PropertyDecorator {
  return function<T>(target: T, propertyKey: keyof T) {
    const initializedTarget = initializeBindingTarget(target);
    initializedTarget.__axisBindings.push({axis, bindTo: propertyKey});
  }
}

function initializeBindingTarget<T>(target: T): T&InitializedIHaveBindings {
  const t = target as any;
  if(t.__bindingsInitialized) return t;

  if('doButtonBindings' in t || 'doAxisBindings' in t) {
    throw new Error(`Initializing bindings for ${t.constructor.name} would replace existing methods?`);
  }

  t.doButtonBindings = doButtonBindings;
  t.doAxisBindings = doAxisBindings;

  t.__bindingsInitialized = true;
  t.__onGamepadPress = [];
  t.__onGamepadRelease = [];
  t.__axisBindings = [];

  return t;

  function doButtonBindings(this: InitializedIHaveBindings, input: GamepadInput) {
    for(const b of this.__onGamepadPress) {
      if(input.wasPressed(b.button)) b.action.call(this);
    }
  }

  function doAxisBindings(this: InitializedIHaveBindings, input: GamepadInput) {
    if(!input) return;

    for(const b of this.__axisBindings) {
      (this as any)[b.bindTo] = input.getAxis(b.axis);
    }
  }
}

type BindingConfig = {button: number};

function hasBindings(bindable: any): bindable is InitializedIHaveBindings{
  return !!bindable.__bindingsInitialized;
}
