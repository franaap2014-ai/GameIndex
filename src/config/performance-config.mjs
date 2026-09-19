export const PERFORMANCE_MODE = String(process.env.PERFORMANCE_MODE ?? "true").toLowerCase() === "true";
export const DEV_TOOLS = String(process.env.DEV_TOOLS ?? "false").toLowerCase() === "true";

export const performanceConfig = Object.freeze({
  enabled: PERFORMANCE_MODE,
  initialGameLimit: 24,
  maxGameLimit: 100,
  searchLimit: 30,
  lazyImages: true,
  lazyRoutes: true,
  lazyAI: true,
  lazyMusic: true,
  deferNonCriticalRequests: true,
  reduceAnimations: true,
  reduceBlur: true,
  reduceBackgroundEffects: true,
  cachePublicData: true,
  disableDevelopmentPolling: true,
  limitConcurrentHeavyTasks: true,
  maxConcurrentAITasks: Math.max(1, Number(process.env.MAX_CONCURRENT_AI_TASKS || 1)),
  publicCacheSeconds: 30,
  staleWhileRevalidateSeconds: 120,
});
