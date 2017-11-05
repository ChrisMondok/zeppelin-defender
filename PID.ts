class PID {
  private prevError = 0;
  private integral = 0;
  public output: number;

  constructor(readonly KP: number, readonly KI: number, readonly KD: number){}

  public step(dt: number, measuredError: number) {
    dt = dt || 1;
    let error = measuredError;
    this.integral = this.integral + (error * dt);
    let derivative = (error - this.prevError) / dt;
    let output = this.KP*error + this.KI*this.integral + this.KD*derivative;
    this.prevError = error;
    return output;
  }
}
