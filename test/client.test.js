import assert from 'node:assert/strict'
import test from 'node:test'

test('client bundle registers hero, composer and dock entries', async () => {
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        loaded = definition
      },
    },
  }

  await import(`${new URL('../client.js', import.meta.url).href}?test=1`)
  assert.ok(loaded, 'module loader received the bundle')
  assert.equal(loaded.id, 'dsh-workspace-memory')

  const React = {
    createElement() {
      return null
    },
    Fragment: 'fragment',
    useState() {
      return [undefined, () => {}]
    },
    useEffect() {},
    useRef() {
      return { current: null }
    },
  }
  const registrations = []
  const ctx = {
    slots: {
      inject(name, callback) {
        callback()
        return () => {}
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      },
    },
    remote: {},
    locale: { getLocale: () => ({ id: 'zh' }) },
  }

  const app = loaded.factory((name) => {
    if (name === 'react') return React
    throw new Error(`unexpected require: ${name}`)
  })
  app.apply(ctx)

  const names = registrations.map((entry) => entry.options.name)
  assert.deepEqual(names.sort(), [
    'conversation.hero.options',
    'conversation.input.dock',
    'conversation.input.overlay',
  ])

  // The plugin no longer claims a slot in the app's navigation rail.
  assert.equal(names.includes('sidebar.panellist'), false)
  assert.equal(names.includes('main'), false)

  const hero = registrations.find((entry) => entry.options.name === 'conversation.hero.options')
  assert.equal(hero.options.id, 'workspace-memory-inject')
  assert.equal(hero.options.label(), '注入记忆')

  const composerPill = registrations.find((entry) => entry.options.name === 'conversation.input.overlay')
  assert.equal(composerPill.options.id, 'workspace-memory-inject-composer')

  // The dock entry orders after the composer card, so it renders below the input.
  const dock = registrations.find((entry) => entry.options.name === 'conversation.input.dock')
  assert.equal(dock.options.id, 'workspace-memory-dock')
  assert.equal(dock.options.order, 2)

  // `remote.commands` must be declared by name: reading `ctx.remote.commands`
  // without it fails with `cannot get property "remote.commands" without inject`.
  assert.deepEqual(app.inject, ['slots', 'remote', 'remote.commands', 'locale'])
})
