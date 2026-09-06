import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// A short, automatic build identifier - the commit this build was made
// from - rather than a version number someone has to remember to bump by
// hand. Vercel sets its own env var for this; falls back to running git
// directly for local dev, and to "dev" if neither is available.
function getBuildVersion() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  }
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(getBuildVersion()),
    'import.meta.env.BUILD_DATE': JSON.stringify(new Date().toISOString()),
  },
})
