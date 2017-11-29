class PID {
  private prevError = 0;
  private integral = 0;
  public output: number;
  public maxIntegral = 10000;

  constructor(readonly KP: number, readonly KI: number, readonly KD: number){}

  public step(dt: number, measuredError: number) {
    dt = dt || 1;
    let error = measuredError;
    this.integral = clamp(this.integral + (error * dt), -this.maxIntegral, this.maxIntegral);
    let derivative = (error - this.prevError) / dt;
    let output = this.KP*error + this.KI*this.integral + this.KD*derivative;
    this.prevError = error;
    return output;
  }
}
