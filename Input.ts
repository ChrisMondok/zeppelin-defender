type Action = 'JUMP' | 'BLOCK' | 'FIRE' | 'PAUSE' | 'RESUME';

abstract class Input {
  wasPressed(button: Action) {
    return this.state.buttons[button] && !this.previousState.buttons[button];
  }

  wasReleased(button: Action) {
    return !this.state.buttons[button] && this.previousState.buttons[button];
  }

  abstract getAxis(axis: number): number;

  abstract tick(): void;

  protected copyOldState() {
    for(let key in this.state.buttons) {
      const b = key as Action;
      this.previousState.buttons[b] = this.state.buttons[b] || false;
    }

    for(let a in this.state.axes) {
      this.previousState.axes[a] = this.state.axes[a];
    }
  }

  protected readonly previousState: InputSnapshot = {
    buttons: {BLOCK: false, JUMP: false, FIRE: false, PAUSE: false, RESUME: false},
    axes: {}
  };

  protected readonly state: InputSnapshot = {
    buttons: {BLOCK: false, JUMP: false, FIRE: false, PAUSE: false, RESUME: false},
    axes: {}
  };
}

type InitializedIHaveBindings = {
  doButtonBindings: (input: Input) => void;
  doAxisBindings: (input: Input) => void;

  __bindingsInitialized: true;

  __onGamepadPress: Array<{button: Action, action: () => void}>;
  __onGamepadRelease: Array<{button: Action, action: () => void}>;
  __axisBindings: Array<{axis: number, bindTo: string}>;
}

type InputSnapshot = {
  buttons: {[key in Action]: boolean}
  axes: {[key: number]: number}
};

function bindTo(button: Action, type: 'press' | 'release'): MethodDecorator {
  return function<T>(target: T, propertyKey: keyof T, descriptor: PropertyDescriptor) {
    const initializedTarget = initializeBindingTarget(target);
    if(type === 'press') {
      initializedTarget.__onGamepadPress.push({button, action: (target as any)[propertyKey]});
    }
    else {
      initializedTarget.__onGamepadRelease.push({button, action: (target as any)[propertyKey]});
    }
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

    for(const b of this.__onGamepadRelease) {
      if(input.wasReleased(b.button)) b.action.call(this);
    }
  }

  function doAxisBindings(this: InitializedIHaveBindings, input: GamepadInput) {
    if(!input) return;

    for(const b of this.__axisBindings) {
      (this as any)[b.bindTo] = input.getAxis(b.axis);
    }
  }
}

type BindingConfig = {button: Action};

function hasBindings(bindable: any): bindable is InitializedIHaveBindings{
  return !!bindable.__bindingsInitialized;
}
