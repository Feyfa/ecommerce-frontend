# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

Use Node.js 22.13 or newer within the Node.js 22 release line.

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Format Frontend Source

Vue and JavaScript source uses four-space indentation enforced by Prettier:

```sh
npm run format
npm run format:check
```

Run `format:check` before handing off a change. CI runs for Jira task branch
pushes and for pull requests targeting `main` or `staging`. It installs
dependencies with `npm ci`, then runs `format:check`, `lint`, `test:unit`, and
the production build in that order.

### Lint Frontend Source

ESLint checks all Vue and JavaScript source, unit tests, and repository-level
JavaScript configuration. The check uses the recommended JavaScript and Vue
rules and fails when either an error or warning remains:

```sh
npm run lint
```

Apply supported automatic fixes with:

```sh
npm run lint:fix
```

Review automatic changes before keeping them. Prettier remains responsible for
formatting, so run `format:check` after applying lint fixes.

### Run Unit Tests

Vitest and Vue Test Utils run component behavior in jsdom:

```sh
npm run test:unit
```

Use `npm run test:unit:watch` while developing a focused unit test.

CI uses `test:unit` in non-watch mode. A failing unit test fails the existing
`Build Vue frontend` job and prevents its build step from running.
