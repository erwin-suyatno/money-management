## Capability Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [extract-component-props](rules/extract-component-props.md) | get props type, wrapper component, extend props, inherit props, ComponentProps | Extract types from .vue components |
| [vue-tsc-strict-templates](rules/vue-tsc-strict-templates.md) | undefined component, template error, strictTemplates | Catch undefined components in templates |
| [fallthrough-attributes](rules/fallthrough-attributes.md) | fallthrough, $attrs, wrapper component | Type-check fallthrough attributes |
| [strict-css-modules](rules/strict-css-modules.md) | css modules, $style, typo | Catch CSS module class typos |
| [data-attributes-config](rules/data-attributes-config.md) | data-*, strictTemplates, attribute | Allow data-* attributes |
| [volar-3-breaking-changes](rules/volar-3-breaking-changes.md) | volar, vue-language-server, editor | Fix Volar 3.0 upgrade issues |
| [module-resolution-bundler](rules/module-resolution-bundler.md) | cannot find module, @vue/tsconfig, moduleResolution | Fix module resolution errors |
| [define-model-update-event](rules/define-model-update-event.md) | defineModel, update event, undefined | Fix model update errors |
| [with-defaults-union-types](rules/with-defaults-union-types.md) | withDefaults, union type, default | Fix union type defaults |
| [deep-watch-numeric](rules/deep-watch-numeric.md) | watch, deep, array, Vue 3.5 | Efficient array watching |
| [vue-directive-comments](rules/vue-directive-comments.md) | @vue-ignore, @vue-skip, template | Control template type checking |
| [vue-router-typed-params](rules/vue-router-typed-params.md) | route params, typed router, unplugin | Fix route params typing |

## Efficiency Rules

| Rule | Keywords | Description |
|------|----------|-------------|
| [hmr-vue-ssr](rules/hmr-vue-ssr.md) | hmr, ssr, hot reload | Fix HMR in SSR apps |
| [pinia-store-mocking](rules/pinia-store-mocking.md) | pinia, mock, vitest, store | Mock Pinia stores |

## Reference

- [Vue Language Tools](https://github.com/vuejs/language-tools)
- [vue-component-type-helpers](https://github.com/vuejs/language-tools/tree/master/packages/component-type-helpers)
- [Vue 3 Documentation](https://vuejs.org/)


---

---
title: Fix Slow Save Times with Code Actions Setting
impact: HIGH
impactDescription: fixes 30-60 second save delays in large Vue projects
type: capability
tags: performance, save-time, vscode, code-actions, volar
---

# Fix Slow Save Times with Code Actions Setting

**Impact: HIGH** - fixes 30-60 second save delays in large Vue projects

In large Vue projects, saving files can take 30-60+ seconds due to VSCode's code actions triggering expensive TypeScript state synchronization.

## Problem

Symptoms:
- Save operation takes 30+ seconds
- Editor becomes unresponsive during save
- CPU spikes when saving Vue files
- Happens more in larger projects

## Root Cause

VSCode emits document change events multiple times during save cycles. Each event triggers Volar to synchronize with TypeScript, causing expensive re-computation.

## Solution

Disable code actions or limit their timeout:

**Option 1: Disable code actions (fastest)**
```json
// .vscode/settings.json
{
  "vue.codeActions.enabled": false
}
```

**Option 2: Limit code action time**
```json
// .vscode/settings.json
{
  "vue.codeActions.savingTimeLimit": 1000
}
```

**Option 3: Disable specific code actions**
```json
// .vscode/settings.json
{
  "vue.codeActions.enabled": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "never"
  }
}
```

## VSCode Version Requirement

VSCode 1.81.0+ includes fixes that reduce save time issues. Upgrade if using an older version.

## Additional Optimizations

```json
// .vscode/settings.json
{
  "vue.codeActions.enabled": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {},
  "[vue]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "Vue.volar"
  }
}
```

## Reference

- [Vue Language Tools Discussion #2740](https://github.com/vuejs/language-tools/discussions/2740)


---

---
title: Allow Data Attributes with Strict Templates
impact: MEDIUM
impactDescription: fixes data-testid and data-* attribute errors in strict mode
type: capability
tags: dataAttributes, vueCompilerOptions, strictTemplates, data-testid, testing
---

# Allow Data Attributes with Strict Templates

**Impact: MEDIUM** - fixes data-testid and data-* attribute errors in strict mode

With `strictTemplates` enabled, `data-*` attributes on components cause type errors. Use the `dataAttributes` option to allow specific patterns.

## Problem

```vue
<template>
  <!-- Error: Property 'data-testid' does not exist on type... -->
  <MyComponent data-testid="submit-button" />

  <!-- Error: Property 'data-cy' does not exist on type... -->
  <MyComponent data-cy="login-form" />
</template>
```

## Solution

Configure `dataAttributes` to allow specific patterns:

```json
// tsconfig.json or tsconfig.app.json
{
  "vueCompilerOptions": {
    "strictTemplates": true,
    "dataAttributes": ["data-*"]
  }
}
```

Now all `data-*` attributes are allowed on any component.

## Specific Patterns

You can be more selective:

```json
{
  "vueCompilerOptions": {
    "dataAttributes": [
      "data-testid",
      "data-cy",
      "data-test-*"
    ]
  }
}
```

This only allows the specified patterns, not all data attributes.

## Common Testing Attributes

For testing libraries, allow their specific attributes:

| Library | Attribute | Pattern |
|---------|-----------|---------|
| Testing Library | `data-testid` | `"data-testid"` |
| Cypress | `data-cy` | `"data-cy"` |
| Playwright | `data-testid` | `"data-testid"` |
| Generic | All data attributes | `"data-*"` |

## Reference

- [Vue Language Tools Wiki - Vue Compiler Options](https://github.com/vuejs/language-tools/wiki/Vue-Compiler-Options)


---

---
title: Vue 3.5+ Deep Watch Numeric Depth
impact: MEDIUM
impactDescription: enables efficient array mutation watching with numeric deep option
type: capability
tags: watch, deep, vue-3.5, array, mutation, performance
---

# Vue 3.5+ Deep Watch Numeric Depth

**Impact: MEDIUM** - enables efficient array mutation watching with numeric deep option

Vue 3.5 introduced `deep: number` for watch depth control. This allows watching array mutations without the performance cost of deep traversal.

## Symptoms

- Array mutations not triggering watch callback
- Deep watch causing performance issues on large nested objects
- Unaware of new Vue 3.5 feature

> **Note:** TypeScript error "Type 'number' is not assignable to type 'boolean'" no longer occurs with Vue 3.5+ and current TypeScript versions. The types now correctly support numeric `deep` values.

## The Feature

```typescript
// Vue 3.5+ only
watch(items, (newVal) => {
  // Triggered on array mutations (push, pop, splice, etc.)
}, { deep: 1 })
```

| deep value | Behavior |
|------------|----------|
| `true` | Full recursive traversal (original behavior) |
| `false` | Only reference changes |
| `1` | One level deep - array mutations, not nested objects |
| `2` | Two levels deep |
| `n` | N levels deep |

## Fix

**Step 1: Ensure Vue 3.5+**
```bash
npm install vue@^3.5.0
```

**Step 2: Use numeric depth**
```typescript
import { watch, ref } from 'vue'

const items = ref([{ id: 1, data: { nested: 'value' } }])

// Watch array mutations only (push, pop, etc.)
watch(items, (newItems) => {
  console.log('Array mutated')
}, { deep: 1 })

// Won't trigger on: items.value[0].data.nested = 'new'
// Will trigger on: items.value.push(newItem)
```

## Performance Comparison

```typescript
const largeNestedData = ref({ /* deeply nested structure */ })

// SLOW - traverses entire structure
watch(largeNestedData, handler, { deep: true })

// FAST - only watches top-level changes
watch(largeNestedData, handler, { deep: 1 })

// FASTEST - only reference changes
watch(largeNestedData, handler, { deep: false })
```

## Alternative: watchEffect for Selective Tracking

```typescript
// Only tracks properties actually accessed
watchEffect(() => {
  // Only re-runs when items.value.length or first item changes
  console.log(items.value.length, items.value[0]?.id)
})
```

## TypeScript Note

If TypeScript complains about numeric deep, ensure:
1. Vue version is 3.5+
2. TypeScript version is current (types are included with `vue` package)
3. tsconfig targets correct node_modules types

## Reference

- [Vue Watchers Docs](https://vuejs.org/guide/essentials/watchers.html)
- [Vue 3.5 Release Notes](https://blog.vuejs.org/posts/vue-3-5)


---

---
title: defineModel Fires Update Event with Undefined
impact: MEDIUM
impactDescription: fixes runtime errors from unexpected undefined in model updates
type: capability
tags: defineModel, v-model, update-event, undefined, vue-3.5
---

# defineModel Fires Update Event with Undefined

**Impact: MEDIUM** - fixes runtime errors from unexpected undefined in model updates

> **Version Note:** This issue may be resolved in Vue 3.5+. Testing with Vue 3.5.26 could not reproduce the double emission with `undefined`. If you're on Vue 3.5+, verify the issue exists in your specific scenario before applying workarounds.

Components using `defineModel` may fire the `@update:model-value` event with `undefined` in certain edge cases. TypeScript types don't always reflect this behavior, potentially causing runtime errors when the parent expects a non-nullable value.

## Symptoms

- Parent component receives `undefined` unexpectedly
- Runtime error: "Cannot read property of undefined"
- Type mismatch between expected `T` and received `T | undefined`
- Issue appears when clearing/resetting the model value

## Root Cause

`defineModel` returns `Ref<T | undefined>` by default, even when `T` is non-nullable. The update event can fire with `undefined` when:
- Component unmounts
- Model is explicitly cleared
- Internal state resets

## Fix

**Option 1: Use required option (Vue 3.5+)**
```typescript
// Returns Ref<Item> instead of Ref<Item | undefined>
const model = defineModel<Item>({ required: true })
```

**Option 2: Type parent handler to accept undefined**
```vue
<template>
  <MyComponent
    v-model="item"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
// Handle both value and undefined
const handleUpdate = (value: Item | undefined) => {
  if (value !== undefined) {
    item.value = value
  }
}
</script>
```

**Option 3: Use default value in defineModel**
```typescript
const model = defineModel<string>({ default: '' })
```

## Type Declaration Pattern

```typescript
// In child component
interface Props {
  modelValue: Item
}
const model = defineModel<Item>({ required: true })

// Emits will be typed as (value: Item) not (value: Item | undefined)
```

## Reference

- [vuejs/core#12817](https://github.com/vuejs/core/issues/12817)
- [vuejs/core#10103](https://github.com/vuejs/core/issues/10103)
- [defineModel docs](https://vuejs.org/api/sfc-script-setup.html#definemodel)


---

---
title: Duplicate Vue Plugin Detection
impact: MEDIUM
impactDescription: fixes cryptic build errors from Vue plugin registered twice
type: capability
tags: vite, plugin, vue, duplicate, config, inline
---

# Duplicate Vue Plugin Detection

**Impact: MEDIUM** - fixes cryptic build errors from Vue plugin registered twice

When using Vite's JavaScript API, if the Vue plugin is loaded in `vite.config.js` and specified again in `inlineConfig`, it gets registered twice, causing cryptic build errors.

## Symptoms

- Build produces unexpected output or fails silently
- "Cannot read property of undefined" during build
- Different build behavior between CLI and JavaScript API
- Vue components render incorrectly after build

## Root Cause

Vite doesn't deduplicate plugins by name when merging configs. The Vue plugin's internal state gets corrupted when registered twice.

## Fix

**Option 1: Use configFile: false with inline plugins**
```typescript
import { build } from 'vite'
import vue from '@vitejs/plugin-vue'

await build({
  configFile: false,  // Don't load vite.config.js
  plugins: [vue()],
  // ... rest of config
})
```

**Option 2: Don't specify plugins in inlineConfig**
```typescript
// vite.config.js already has vue plugin
import { build } from 'vite'

await build({
  // Don't add vue plugin here - it's in vite.config.js
  root: './src',
  build: { outDir: '../dist' }
})
```

**Option 3: Filter out Vue plugin before merging**
```typescript
import { build, loadConfigFromFile } from 'vite'
import vue from '@vitejs/plugin-vue'

const { config } = await loadConfigFromFile({ command: 'build', mode: 'production' })

// Remove existing Vue plugin
const filteredPlugins = config.plugins?.filter(
  p => !p || (Array.isArray(p) ? false : p.name !== 'vite:vue')
) || []

await build({
  ...config,
  plugins: [...filteredPlugins, vue({ /* your options */ })]
})
```

## Detection Script

Add this to debug plugin registration:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'debug-plugins',
      configResolved(config) {
        const vuePlugins = config.plugins.filter(p => p.name?.includes('vue'))
        if (vuePlugins.length > 1) {
          console.warn('WARNING: Multiple Vue plugins detected:', vuePlugins.map(p => p.name))
        }
      }
    }
  ]
})
```

## Common Scenarios

| Scenario | Solution |
|----------|----------|
| Using `vite.createServer()` | Use `configFile: false` |
| Build script with custom config | Don't duplicate plugins |
| Monorepo with shared config | Check for plugin inheritance |

## Reference

- [Vite Issue #5335](https://github.com/vitejs/vite/issues/5335)
- [Vite JavaScript API](https://vite.dev/guide/api-javascript.html)


---

---
title: Extract Component Props
impact: HIGH
impactDescription: extract props, emits, slots types from .vue components
type: capability
tags: typescript, props, emits, slots, vue-component-type-helpers, wrapper, ComponentProps
---

# Extract Component Props

**Impact: HIGH** - extract props, emits, slots types from .vue components

Use `vue-component-type-helpers` to extract types from `.vue` components:

```bash
npm install -D vue-component-type-helpers
```

```typescript
import type { ComponentProps, ComponentEmit, ComponentSlots, ComponentExposed } from 'vue-component-type-helpers'
import MyButton from './MyButton.vue'

type Props = ComponentProps<typeof MyButton>
type Emits = ComponentEmit<typeof MyButton>
type Slots = ComponentSlots<typeof MyButton>
type Exposed = ComponentExposed<typeof MyButton>
```

## Wrapper Component Pattern

```typescript
import type { ComponentProps } from 'vue-component-type-helpers'
import BaseButton from './BaseButton.vue'

type BaseProps = ComponentProps<typeof BaseButton>

interface Props extends BaseProps {
  size: 'sm' | 'md' | 'lg'
}

defineProps<Props>()
```

## Do NOT Use

```typescript
// ❌ Includes Vue internal properties (onUpdate:*, class, style, etc.)
type Props = InstanceType<typeof MyButton>['$props']
```

## Note

Vue's built-in `ExtractPropTypes` is for runtime props objects (`props: { foo: String }`), not for `.vue` components.

## Reference

- [vue-component-type-helpers](https://github.com/vuejs/language-tools/tree/master/packages/component-type-helpers)


---

---
title: Enable Fallthrough Attributes Type Checking
impact: MEDIUM
impactDescription: enables IDE autocomplete for fallthrough attributes in wrapper components
type: capability
tags: fallthroughAttributes, vueCompilerOptions, component-library, wrapper-components
---

# Enable Fallthrough Attributes Type Checking

**Impact: MEDIUM** - enables type-aware attribute forwarding in component libraries

When building component libraries with wrapper components, enable `fallthroughAttributes` to get IDE autocomplete for attributes that will be forwarded to child elements.

## What It Does

Wrapper components that pass attributes to child elements can benefit from type-aware completion:

```vue
<!-- MyButton.vue - wrapper around native button -->
<template>
  <button v-bind="$attrs"><slot /></button>
</template>
```

## Solution

Enable `fallthroughAttributes` in your tsconfig:

```json
// tsconfig.json or tsconfig.app.json
{
  "vueCompilerOptions": {
    "fallthroughAttributes": true
  }
}
```

## How It Works

When `fallthroughAttributes: true`:
- Vue Language Server analyzes which element receives `$attrs`
- IDE autocomplete suggests valid attributes for the target element
- Helps developers discover available attributes

> **Note:** This primarily enables IDE autocomplete for valid fallthrough attributes. It does NOT reject invalid attributes as type errors - arbitrary attributes are still allowed.

## Related Options

Combine with `strictTemplates` for comprehensive checking:

```json
{
  "vueCompilerOptions": {
    "strictTemplates": true,
    "fallthroughAttributes": true
  }
}
```

## Reference

- [Vue Language Tools Wiki - Vue Compiler Options](https://github.com/vuejs/language-tools/wiki/Vue-Compiler-Options)


---

---
title: HMR Debugging for Vue SSR
impact: MEDIUM
impactDescription: fixes Hot Module Replacement breaking in Vue SSR applications
type: efficiency
tags: vite, hmr, ssr, vue, hot-reload, server-side-rendering
---

# HMR Debugging for Vue SSR

**Impact: MEDIUM** - fixes Hot Module Replacement breaking in Vue SSR applications

Hot Module Replacement breaks when modifying Vue component `<script setup>` sections in SSR applications. Changes cause errors instead of smooth updates, requiring full page reloads.

## Symptoms

- HMR works for `<template>` changes but breaks for `<script setup>`
- "Cannot read property of undefined" after saving
- Full page reload required after script changes
- HMR works in dev:client but not dev:ssr

## Root Cause

SSR mode has a different transformation pipeline. The Vue plugin's HMR boundary detection doesn't handle SSR modules the same way as client modules.

## Fix

**Step 1: Ensure correct SSR plugin configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  ssr: {
    // Don't externalize these for HMR to work
    noExternal: ['vue', '@vue/runtime-core', '@vue/runtime-dom']
  }
})
```

**Step 2: Configure dev server for SSR HMR**
```typescript
// server.ts
import { createServer } from 'vite'

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
})

// Use vite.ssrLoadModule for server-side imports
const { render } = await vite.ssrLoadModule('/src/entry-server.ts')

// Handle HMR
vite.watcher.on('change', async (file) => {
  if (file.endsWith('.vue')) {
    // Invalidate the module
    const mod = vite.moduleGraph.getModuleById(file)
    if (mod) {
      vite.moduleGraph.invalidateModule(mod)
    }
  }
})
```

**Step 3: Add HMR acceptance in entry-server**
```typescript
// entry-server.ts
import { createApp } from './main'

export async function render(url: string) {
  const app = createApp()
  // ... render logic
}

// Accept HMR updates
if (import.meta.hot) {
  import.meta.hot.accept()
}
```

## Framework-Specific Solutions

### Nuxt 3
HMR should work out of the box. If not:
```bash
rm -rf .nuxt node_modules/.vite
npm install
npm run dev
```

### Vite SSR Template
Ensure you're using the latest `@vitejs/plugin-vue`:
```bash
npm install @vitejs/plugin-vue@latest
```

## Debugging

Enable verbose HMR logging:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true
    }
  },
  logLevel: 'info'  // Shows HMR updates
})
```

## Known Limitations

- HMR for `<script>` (not `<script setup>`) may require full reload
- SSR components with external dependencies may not hot-reload
- State is not preserved for SSR components (expected behavior)

## Reference

- [vite-plugin-vue#525](https://github.com/vitejs/vite-plugin-vue/issues/525)
- [Vite SSR Guide](https://vite.dev/guide/ssr.html)


---

---
title: moduleResolution Bundler Migration Issues
impact: HIGH
impactDescription: fixes "Cannot find module" errors after @vue/tsconfig upgrade
type: capability
tags: moduleResolution, bundler, tsconfig, vue-tsconfig, node, esm
---

# moduleResolution Bundler Migration Issues

**Impact: HIGH** - fixes "Cannot find module" errors after @vue/tsconfig upgrade

Recent versions of `@vue/tsconfig` changed `moduleResolution` from `"node"` to `"bundler"`. This can break existing projects with errors like "Cannot find module 'vue'" or issues with `resolveJsonModule`.

## Symptoms

- `Cannot find module 'vue'` or other packages
- `Option '--resolveJsonModule' cannot be specified without 'node' module resolution`
- Errors appear after updating `@vue/tsconfig`
- Some third-party packages no longer resolve

## Root Cause

`moduleResolution: "bundler"` requires:
1. TypeScript 5.0+
2. Packages to have proper `exports` field in package.json
3. Different resolution rules than Node.js classic resolution

## Fix

**Option 1: Ensure TypeScript 5.0+ everywhere**
```bash
npm install -D typescript@^5.0.0
```

In monorepos, ALL packages must use TypeScript 5.0+.

**Option 2: Add compatibility workaround**
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolvePackageJsonExports": false
  }
}
```

Setting `resolvePackageJsonExports: false` restores compatibility with packages that don't have proper exports.

**Option 3: Revert to Node resolution**
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

## Which Packages Break?

Packages break if they:
- Lack `exports` field in package.json
- Have incorrect `exports` configuration
- Rely on Node.js-specific resolution behavior

## Diagnosis

```bash
# Check which resolution is being used
cat tsconfig.json | grep moduleResolution

# Test if a specific module resolves
npx tsc --traceResolution 2>&1 | grep "module-name"
```

## Reference

- [vuejs/tsconfig#8](https://github.com/vuejs/tsconfig/issues/8)
- [TypeScript moduleResolution docs](https://www.typescriptlang.org/tsconfig#moduleResolution)
- [Vite discussion#14001](https://github.com/vitejs/vite/discussions/14001)


---

---
title: Mocking Pinia Stores with Vitest
impact: HIGH
impactDescription: properly mocks Pinia stores in component tests
type: efficiency
tags: pinia, vitest, testing, mock, createTestingPinia, store
---

# Mocking Pinia Stores with Vitest

**Impact: HIGH** - properly mocks Pinia stores in component tests

Developers struggle to properly mock Pinia stores: `createTestingPinia` requires explicit `createSpy` configuration, and "injection Symbol(pinia) not found" errors occur without proper setup.

> **Important (@pinia/testing 1.0+):** The `createSpy` option is **REQUIRED**, not optional. Omitting it throws an error: "You must configure the `createSpy` option."

## Symptoms

- "injection Symbol(pinia) not found" error
- "You must configure the `createSpy` option" error
- Actions not properly mocked
- Store state not reset between tests

## Fix

**Pattern 1: Basic setup with createTestingPinia**
```typescript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import MyComponent from './MyComponent.vue'
import { useCounterStore } from '@/stores/counter'

test('component uses store', async () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,  // REQUIRED in @pinia/testing 1.0+
          initialState: {
            counter: { count: 10 }  // Set initial state
          }
        })
      ]
    }
  })

  // Get the store instance AFTER mounting
  const store = useCounterStore()

  // Actions are automatically stubbed
  await wrapper.find('button').trigger('click')
  expect(store.increment).toHaveBeenCalled()
})
```

**Pattern 2: Customize action behavior**
```typescript
test('component handles async action', async () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false  // Don't stub, use real actions
        })
      ]
    }
  })

  const store = useCounterStore()

  // Override specific action
  store.fetchData = vi.fn().mockResolvedValue({ items: [] })

  await wrapper.find('.load-button').trigger('click')
  expect(store.fetchData).toHaveBeenCalled()
})
```

**Pattern 3: Testing store directly**
```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('increments count', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)

    store.increment()
    expect(store.count).toBe(1)
  })
})
```

## Setup Store with Vitest

```typescript
// stores/counter.ts - Setup store syntax
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// Test file
test('setup store works', async () => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      counter: { count: 5 }
    }
  })

  const wrapper = mount(MyComponent, {
    global: { plugins: [pinia] }
  })

  const store = useCounterStore()
  expect(store.count).toBe(5)
  expect(store.doubleCount).toBe(10)
})
```

## Reset Between Tests

```typescript
describe('Store Tests', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('test 1', () => { /* ... */ })
  test('test 2', () => { /* ... */ })
})
```

## Reference

- [Pinia Testing Guide](https://pinia.vuejs.org/cookbook/testing.html)
- [Pinia Discussion #2092](https://github.com/vuejs/pinia/discussions/2092)


---

---
title: JSDoc Documentation for Script Setup Components
impact: MEDIUM
impactDescription: enables proper documentation for composition API components
type: capability
tags: jsdoc, script-setup, documentation, composition-api, component
---

# JSDoc Documentation for Script Setup Components

**Impact: MEDIUM** - enables proper documentation for composition API components

`<script setup>` doesn't have an obvious place to attach JSDoc comments for the component itself. Use a dual-script pattern.

## Problem

**Incorrect:**
```vue
<script setup lang="ts">
/**
 * This comment doesn't appear in IDE hover or docs
 * @component
 */
import { ref } from 'vue'

const count = ref(0)
</script>
```

JSDoc comments inside `<script setup>` don't attach to the component export because there's no explicit export statement.

## Solution

Use both `<script>` and `<script setup>` blocks:

**Correct:**
```vue
<script lang="ts">
/**
 * A counter component that displays and increments a value.
 *
 * @example
 * ```vue
 * <Counter :initial="5" @update="handleUpdate" />
 * ```
 *
 * @component
 */
export default {}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  /** Starting value for the counter */
  initial?: number
}>()

const emit = defineEmits<{
  /** Emitted when counter value changes */
  update: [value: number]
}>()

const count = ref(props.initial ?? 0)
</script>
```

## How It Works

- The regular `<script>` block's default export is merged with `<script setup>`
- JSDoc on `export default {}` attaches to the component
- Props and emits JSDoc in `<script setup>` still work normally

## What Gets Documented

| Location | Shows In |
|----------|----------|
| `export default {}` JSDoc | Component import hover |
| `defineProps` JSDoc | Prop hover in templates |
| `defineEmits` JSDoc | Event handler hover |

## Reference

- [Vue Language Tools Discussion #5932](https://github.com/vuejs/language-tools/discussions/5932)


---

---
title: Enable Strict CSS Modules Type Checking
impact: MEDIUM
impactDescription: catches typos in CSS module class names at compile time
type: capability
tags: strictCssModules, vueCompilerOptions, css-modules, style-module
---

# Enable Strict CSS Modules Type Checking

**Impact: MEDIUM** - catches typos in CSS module class names at compile time

When using CSS modules with `<style module>`, Vue doesn't validate class names by default. Enable `strictCssModules` to catch typos and undefined classes.

## Problem

CSS module class name errors go undetected:

```vue
<script setup lang="ts">
// No error for typo in class name
</script>

<template>
  <div :class="$style.buttn">Click me</div>
</template>

<style module>
.button {
  background: blue;
}
</style>
```

The typo `buttn` instead of `button` silently fails at runtime.

## Solution

Enable `strictCssModules` in your tsconfig:

```json
// tsconfig.json or tsconfig.app.json
{
  "vueCompilerOptions": {
    "strictCssModules": true
  }
}
```

Now `$style.buttn` will show a type error because `buttn` doesn't exist in the CSS module.

## What Gets Checked

| Access | With strictCssModules |
|--------|----------------------|
| `$style.validClass` | OK |
| `$style.typo` | Error: Property 'typo' does not exist |
| `$style['dynamic']` | OK (dynamic access not checked) |

## Limitations

- Only checks static property access (`$style.className`)
- Dynamic access (`$style[variable]`) is not validated
- Only works with `<style module>`, not external CSS files

## Reference

- [Vue Language Tools Wiki - Vue Compiler Options](https://github.com/vuejs/language-tools/wiki/Vue-Compiler-Options)


---

---
title: Volar 3.0 Breaking Changes
impact: HIGH
impactDescription: fixes editor integration after Volar/vue-language-server upgrade
type: capability
tags: volar, vue-language-server, neovim, vscode, ide, ts_ls, vtsls
---

# Volar 3.0 Breaking Changes

**Impact: HIGH** - fixes editor integration after Volar/vue-language-server upgrade

Volar 3.0 (vue-language-server 3.x) introduced breaking changes to the language server protocol. Editors configured for Volar 2.x will break with errors like "vue_ls doesn't work with ts_ls.. it expects vtsls".

## Symptoms

- `vue_ls doesn't work with ts_ls`
- TypeScript features stop working in Vue files
- No autocomplete, type hints, or error highlighting
- Editor shows "Language server initialization failed"

## Fix by Editor

### VSCode

Update the "Vue - Official" extension to latest version. It manages the language server automatically.

### NeoVim (nvim-lspconfig)

**Option 1: Use vtsls instead of ts_ls**
```lua
-- Replace ts_ls/tsserver with vtsls
require('lspconfig').vtsls.setup({})
require('lspconfig').volar.setup({})
```

**Option 2: Downgrade vue-language-server**
```bash
npm install -g @vue/language-server@2.1.10
```

### JetBrains IDEs

Update to latest Vue plugin. If issues persist, disable and re-enable the Vue plugin.

## What Changed in 3.0

| Feature | Volar 2.x | Volar 3.0 |
|---------|-----------|-----------|
| TypeScript integration | ts_ls/tsserver | vtsls recommended (Neovim) |
| Hybrid mode | Optional | Default |

## Workaround: Stay on 2.x

If upgrading is not possible:
```bash
npm install -g @vue/language-server@^2.0.0
```

Pin in your project's package.json to prevent accidental upgrades.

## Reference

- [vuejs/language-tools#5598](https://github.com/vuejs/language-tools/issues/5598)
- [NeoVim Vue Setup Guide](https://dev.to/danwalsh/solved-vue-3-typescript-inlay-hint-support-in-neovim-53ej)


---

---
title: Vue Template Directive Comments
impact: HIGH
impactDescription: enables fine-grained control over template type checking
type: capability
tags: vue-directive, vue-ignore, vue-expect-error, vue-skip, template, type-checking
---

# Vue Template Directive Comments

**Impact: HIGH** - enables fine-grained control over template type checking

Vue Language Tools supports special directive comments to control type checking behavior in templates.

## Available Directives

### @vue-ignore

Suppress type errors for the next line:

```vue
<template>
  <!-- @vue-ignore -->
  <Component :prop="valueWithTypeError" />
</template>
```

### @vue-expect-error

Assert that the next line should have a type error (useful for testing):

```vue
<template>
  <!-- @vue-expect-error -->
  <Component :invalid-prop="value" />
</template>
```

### @vue-skip

Skip type checking for an entire block:

```vue
<template>
  <!-- @vue-skip -->
  <div>
    <!-- Everything in here is not type-checked -->
    <LegacyComponent :any="props" :go="here" />
  </div>
</template>
```

### @vue-generic

Declare template-level generic types:

```vue
<template>
  <!-- @vue-generic {T extends string} -->
  <GenericList :items="items as T[]" />
</template>
```

## Use Cases

- Migrating legacy components with incomplete types
- Working with third-party components that have incorrect type definitions
- Temporarily suppressing errors during refactoring
- Testing that certain patterns produce expected type errors

## Reference

- [Vue Language Tools Wiki - Directive Comments](https://github.com/vuejs/language-tools/wiki/Directive-Comments)


---

---
title: Vue Router useRoute Params Union Type Narrowing
impact: MEDIUM
impactDescription: fixes "Property does not exist" errors with typed route params
type: capability
tags: vue-router, useRoute, unplugin-vue-router, typed-routes, params
---

# Vue Router useRoute Params Union Type Narrowing

**Impact: MEDIUM** - fixes "Property does not exist" errors with typed route params

With `unplugin-vue-router` typed routes, `route.params` becomes a union of ALL page param types. TypeScript cannot narrow `Record<never, never> | { id: string }` properly, causing "Property 'id' does not exist" errors even on the correct page.

## Symptoms

- "Property 'id' does not exist on type 'RouteParams'"
- `route.params.id` shows as `string | undefined` everywhere
- Union type of all route params instead of specific route
- Type narrowing with `if (route.name === 'users-id')` doesn't work

## Root Cause

`unplugin-vue-router` generates a union type of all possible route params. TypeScript's control flow analysis can't narrow this union based on route name checks.

## Fix

**Option 1: Pass route name to useRoute (recommended)**
```typescript
// pages/users/[id].vue
import { useRoute } from 'vue-router/auto'

// Specify the route path for proper typing
const route = useRoute('/users/[id]')

// Now properly typed as { id: string }
console.log(route.params.id)  // string, not string | undefined
```

**Option 2: Type assertion with specific route**
```typescript
import { useRoute } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router/auto-routes'

const route = useRoute() as RouteLocationNormalized<'/users/[id]'>
route.params.id  // Properly typed
```

**Option 3: Define route-specific param type**
```typescript
// In your page component
interface UserRouteParams {
  id: string
}

const route = useRoute()
const { id } = route.params as UserRouteParams
```

## Required tsconfig Setting

Ensure `moduleResolution: "bundler"` for unplugin-vue-router:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

## Caveat: Route Name Format

The route name matches the file path pattern:
- `pages/users/[id].vue` → `/users/[id]`
- `pages/posts/[slug]/comments.vue` → `/posts/[slug]/comments`

## Reference

- [unplugin-vue-router#337](https://github.com/posva/unplugin-vue-router/issues/337)
- [unplugin-vue-router#176](https://github.com/posva/unplugin-vue-router/discussions/176)
- [unplugin-vue-router TypeScript docs](https://uvr.esm.is/guide/typescript.html)


---

---
title: Enable Strict Template Checking
impact: HIGH
impactDescription: catches undefined components and props at compile time
type: capability
tags: vue-tsc, typescript, type-checking, templates, vueCompilerOptions
---

# Enable Strict Template Checking

**Impact: HIGH** - catches undefined components and props at compile time

By default, vue-tsc does not report errors for undefined components in templates. Enable `strictTemplates` to catch these issues during type checking.

## Which tsconfig?

Add `vueCompilerOptions` to the tsconfig that includes Vue source files. In projects with multiple tsconfigs (like those created with `create-vue`), this is typically `tsconfig.app.json`, not the root `tsconfig.json` or `tsconfig.node.json`.

**Incorrect (missing strict checking):**

```json
{
  "compilerOptions": {
    "strict": true
  }
  // vueCompilerOptions not configured - undefined components won't error
}
```

**Correct (strict template checking enabled):**

```json
{
  "compilerOptions": {
    "strict": true
  },
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
```

## Available Options

| Option | Default | Effect |
|--------|---------|--------|
| `strictTemplates` | `false` | Enables all checkUnknown* options below |
| `checkUnknownComponents` | `false` | Error on undefined/unregistered components |
| `checkUnknownProps` | `false` | Error on props not declared in component definition |
| `checkUnknownEvents` | `false` | Error on events not declared via `defineEmits` |
| `checkUnknownDirectives` | `false` | Error on unregistered custom directives |

## Granular Control

If `strictTemplates` is too strict, enable individual checks:

```json
{
  "vueCompilerOptions": {
    "checkUnknownComponents": true,
    "checkUnknownProps": false
  }
}
```

## Reference

- [Vue Compiler Options](https://github.com/vuejs/language-tools/wiki/Vue-Compiler-Options)
- [Vite Vue+TS Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-vue-ts)


---

---
title: withDefaults Incorrect Default with Union Types
impact: MEDIUM
impactDescription: fixes spurious "Missing required prop" warning with union type props
type: capability
tags: withDefaults, defineProps, union-types, defaults, vue-3.5
---

# withDefaults Incorrect Default with Union Types

**Impact: MEDIUM** - fixes spurious "Missing required prop" warning with union type props

Using `withDefaults` with union types like `false | string` may produce a Vue runtime warning "Missing required prop" even when a default is provided. The runtime value IS applied correctly, but the warning can be confusing.

## Symptoms

- Vue warns "Missing required prop" despite default being set
- Warning appears only with union types like `false | string`
- TypeScript types are correct
- Runtime value IS correct (the default is applied)

## Problematic Pattern

```typescript
// This produces a spurious warning (but works at runtime)
interface Props {
  value: false | string  // Union type
}

const props = withDefaults(defineProps<Props>(), {
  value: 'default'  // Runtime value IS correct, but Vue warns about missing prop
})
```

## Fix

**Option 1: Use Reactive Props Destructure (Vue 3.5+)**
```vue
<script setup lang="ts">
interface Props {
  value: false | string
}

// Preferred in Vue 3.5+
const { value = 'default' } = defineProps<Props>()
</script>
```

**Option 2: Use runtime declaration**
```vue
<script setup lang="ts">
const props = defineProps({
  value: {
    type: [Boolean, String] as PropType<false | string>,
    default: 'default'
  }
})
</script>
```

**Option 3: Split into separate props**
```typescript
interface Props {
  enabled: boolean
  customValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  enabled: false,
  customValue: 'default'
})
```

## Why Reactive Props Destructure Works

Vue 3.5's Reactive Props Destructure handles default values at the destructuring level, bypassing the type inference issues with `withDefaults`.

```typescript
// The default is applied during destructuring, not type inference
const { prop = 'default' } = defineProps<{ prop?: string }>()
```

## Enable Reactive Props Destructure

This is enabled by default in Vue 3.5+. For older versions:
```javascript
// vite.config.js
export default {
  plugins: [
    vue({
      script: {
        propsDestructure: true
      }
    })
  ]
}
```

## Reference

- [vuejs/core#12897](https://github.com/vuejs/core/issues/12897)
- [Reactive Props Destructure RFC](https://github.com/vuejs/rfcs/discussions/502)