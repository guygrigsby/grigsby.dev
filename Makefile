.DEFAULT_GOAL := build
.PHONY: build install refresh test e2e lint check dev preview redeploy clean

node_modules: package.json package-lock.json
	npm install
	@touch node_modules

build: node_modules ## Build the static site into dist/
	npm run build

install: ## Clean install from the lockfile, the way CI does it
	npm ci

refresh: node_modules ## Re-read project descriptions from GitHub
	node scripts/refresh-repos.ts

test: node_modules ## Unit tests
	npm run test

e2e: build ## Browser smoke test against the built site
	npx playwright test

lint: node_modules ## Types and astro diagnostics
	npm run check

check: lint test build e2e ## Everything CI runs

dev: node_modules ## Local dev server
	npm run dev

preview: build ## Serve dist/ as it will be served in production
	npm run preview

redeploy: check ## Build, verify, ship to Cloudflare
	npx wrangler deploy

clean:
	rm -rf dist .astro test-results playwright-report
