/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@skeletonlabs/skeleton-svelte/dist/**/*.{html,js,svelte,ts}',
  ],
  safelist: [
    // Skeleton UI 색상 시스템 - Property + Color + Shade
    {
      pattern:
        /^(accent|bg|border|caret|decoration|divide|fill|outline|ring|shadow|stroke|text)-(primary|secondary|tertiary|success|warning|error|surface)-(50|100|200|300|400|500|600|700|800|900|950)$/,
    },
  ],
}
