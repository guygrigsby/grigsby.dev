import { defineConfig } from 'vitest/config'

// Only *.test.ts here. test/e2e/*.spec.ts belongs to playwright, which needs a
// browser and a built site; vitest picking those up fails in a confusing way.
export default defineConfig({
  test: { include: ['test/**/*.test.ts'] },
})
