export function createMemoryRateLimiter(options = {}) {
  const now = typeof options.now === 'function' ? options.now : () => Date.now()
  const maxEntries = Math.max(100, Number(options.maxEntries) || 2000)
  const windowMs = Math.max(60_000, Number(options.windowMs) || 86_400_000)
  const buckets = new Map()

  function lockSeconds(failureCount) {
    if (failureCount < 5) return 0
    if (failureCount === 5) return 60
    if (failureCount === 6) return 120
    if (failureCount === 7) return 300
    if (failureCount === 8) return 900
    if (failureCount === 9) return 1800
    if (failureCount === 10) return 3600
    if (failureCount === 11) return 21600
    return 86400
  }

  function keys(usernameHash, ipHash) {
    return [`username:${usernameHash}`, `ip:${ipHash}`]
  }

  function prune() {
    const current = now()
    for (const [key, bucket] of buckets) {
      if (current - bucket.lastAttemptAt > windowMs && (!bucket.lockedUntil || bucket.lockedUntil <= current)) buckets.delete(key)
    }
    if (buckets.size <= maxEntries) return
    const sorted = [...buckets.entries()].sort((a, b) => a[1].lastAttemptAt - b[1].lastAttemptAt)
    sorted.slice(0, buckets.size - maxEntries).forEach(([key]) => buckets.delete(key))
  }

  function preflight(usernameHash, ipHash) {
    prune()
    const current = now()
    let lockedUntil = 0
    for (const key of keys(usernameHash, ipHash)) {
      const bucket = buckets.get(key)
      if (bucket && bucket.lockedUntil > lockedUntil) lockedUntil = bucket.lockedUntil
    }
    return {
      allowed: lockedUntil <= current,
      retry_after_seconds: lockedUntil <= current ? 0 : Math.max(1, Math.ceil((lockedUntil - current) / 1000))
    }
  }

  function record(usernameHash, ipHash, success) {
    prune()
    const current = now()
    if (success) {
      keys(usernameHash, ipHash).forEach(key => buckets.delete(key))
      return { locked_until: null, retry_after_seconds: 0 }
    }

    let maxLockedUntil = 0
    for (const key of keys(usernameHash, ipHash)) {
      const existing = buckets.get(key)
      const bucket = !existing || current - existing.windowStartedAt > windowMs
        ? { failureCount: 0, windowStartedAt: current, lastAttemptAt: current, lockedUntil: 0 }
        : { ...existing }
      bucket.failureCount += 1
      bucket.lastAttemptAt = current
      const seconds = lockSeconds(bucket.failureCount)
      bucket.lockedUntil = seconds > 0 ? current + seconds * 1000 : 0
      buckets.set(key, bucket)
      if (bucket.lockedUntil > maxLockedUntil) maxLockedUntil = bucket.lockedUntil
    }

    return {
      locked_until: maxLockedUntil ? new Date(maxLockedUntil).toISOString() : null,
      retry_after_seconds: maxLockedUntil ? Math.max(1, Math.ceil((maxLockedUntil - current) / 1000)) : 0
    }
  }

  return Object.freeze({ preflight, record, size: () => buckets.size })
}
