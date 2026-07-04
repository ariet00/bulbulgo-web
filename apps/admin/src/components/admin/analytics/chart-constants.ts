// Light, recharts-free chart constants. Kept in its own module so pages can
// import palette values without dragging the recharts (~5MB) module graph into
// their static bundle. The chart components themselves live in ./charts and are
// loaded lazily via ./charts-lazy.
export const CHART_COLORS = [
    '#2563eb', // blue
    '#16a34a', // green
    '#dc2626', // red
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#64748b', // slate
] as const
