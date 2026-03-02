type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeoutMs: 300_000, // 5 minutes
  halfOpenMaxAttempts: 1,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private options: CircuitBreakerOptions;

  constructor(
    private name: string,
    options?: Partial<CircuitBreakerOptions>
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async execute<T>(fn: () => Promise<T>, fallback?: T): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeoutMs) {
        this.state = "half-open";
        this.halfOpenAttempts = 0;
      } else {
        if (fallback !== undefined) return fallback;
        throw new Error(`Circuit breaker [${this.name}] is OPEN`);
      }
    }

    if (this.state === "half-open" && this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      if (fallback !== undefined) return fallback;
      throw new Error(`Circuit breaker [${this.name}] half-open limit reached`);
    }

    try {
      if (this.state === "half-open") this.halfOpenAttempts++;
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback !== undefined) return fallback;
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset() {
    this.state = "closed";
    this.failureCount = 0;
    this.halfOpenAttempts = 0;
  }
}
