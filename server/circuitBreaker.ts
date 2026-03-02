type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerOptions {
    failureThreshold: number;
    cooldownMs: number;
    name: string;
}

interface BreakerState {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    successCount: number;
}

const breakers = new Map<string, BreakerState>();

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
    failureThreshold: 3,
    cooldownMs: 5 * 60 * 1000, // 5 minutes
    name: "unknown",
};

function getState(name: string): BreakerState {
    if (!breakers.has(name)) {
        breakers.set(name, {
            state: "closed",
            failureCount: 0,
            lastFailureTime: 0,
            successCount: 0,
        });
    }
    return breakers.get(name)!;
}

export async function withCircuitBreaker<T>(
    fetchFn: () => Promise<T>,
    options: Partial<CircuitBreakerOptions> & { name: string }
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const breaker = getState(opts.name);

    // Check if circuit is open
    if (breaker.state === "open") {
        const elapsed = Date.now() - breaker.lastFailureTime;
        if (elapsed < opts.cooldownMs) {
            throw new Error(`Circuit breaker OPEN for ${opts.name} — cooldown ${Math.ceil((opts.cooldownMs - elapsed) / 1000)}s remaining`);
        }
        // Transition to half-open
        breaker.state = "half-open";
        breaker.successCount = 0;
    }

    try {
        const result = await fetchFn();

        // Success — reset or close circuit
        if (breaker.state === "half-open") {
            breaker.successCount++;
            if (breaker.successCount >= 2) {
                breaker.state = "closed";
                breaker.failureCount = 0;
            }
        } else {
            breaker.failureCount = 0;
        }

        return result;
    } catch (error) {
        breaker.failureCount++;
        breaker.lastFailureTime = Date.now();

        if (breaker.failureCount >= opts.failureThreshold) {
            breaker.state = "open";
            console.error(`[CircuitBreaker] ${opts.name} TRIPPED after ${breaker.failureCount} failures`);
        }

        throw error;
    }
}

export function getBreakerStatus(): Record<string, { state: CircuitState; failures: number }> {
    const status: Record<string, { state: CircuitState; failures: number }> = {};
    for (const [name, breaker] of breakers) {
        status[name] = { state: breaker.state, failures: breaker.failureCount };
    }
    return status;
}

export function resetBreaker(name: string): void {
    breakers.delete(name);
}
