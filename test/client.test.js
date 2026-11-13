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
    'conversation.input.overlay',
    'conversation.input.right',
    'shell.overlay',
  ])

  // The plugin no longer claims a slot in the app's navigation rail.
  assert.equal(names.includes('sidebar.panellist'), false)
  assert.equal(names.includes('main'), false)

  const hero = registrations.find((entry) => entry.options.name === 'conversation.hero.options')
  assert.equal(hero.options.id, 'workspace-memory-inject')
  assert.equal(hero.options.label(), '注入记忆')

  const composerPill = registrations.find((entry) => entry.options.name === 'conversation.input.overlay')
  assert.equal(composerPill.options.id, 'workspace-memory-inject-composer')

  // The trigger sits in the composer's control row just before the
  // progress-narration trigger, which registers order 40 there.
  const trigger = registrations.find((entry) => entry.options.name === 'conversation.input.right')
  assert.equal(trigger.options.id, 'workspace-memory-dock')
  assert.ok(trigger.options.order < 40, 'the trigger sits left of the narration trigger')

  // `remote.commands` must be declared by name: reading `ctx.remote.commands`
  // without it fails with `cannot get property "remote.commands" without inject`.
  assert.deepEqual(app.inject, ['slots', 'remote', 'remote.commands', 'locale'])
})

test('the memory dock opens its panel as a modal', async () => {
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        loaded = definition
      },
    },
    addEventListener() {},
    removeEventListener() {},
  }

  await import(`${new URL('../client.js', import.meta.url).href}?test=modal`)

  // A React mock that records every element it is asked to create, so the
  // rendered tree can be inspected for the modal's semantics.
  const created = []
  let state = null
  let setState = null
  const React = {
    createElement(type, props, ...children) {
      const element = { type, props: props ?? {}, children: children.flat() }
      created.push(element)
      return element
    },
    Fragment: 'fragment',
    useState(initial) {
      if (state === null) {
        state = typeof initial === 'function' ? initial() : initial
        setState = (next) => {
          state = typeof next === 'function' ? next(state) : next
        }
      }
      return [state, setState]
    },
    useEffect() {},
    useRef() {
      return { current: null }
    },
    useSyncExternalStore(subscribe, getSnapshot) {
      return getSnapshot()
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

  const trigger = registrations.find((entry) => entry.options.name === 'conversation.input.right')
  const modal = registrations.find((entry) => entry.options.name === 'shell.overlay')
  assert.ok(modal, 'the modal is registered on the frame-wide overlay layer')
  assert.equal(modal.options.id, 'workspace-memory-modal')

  const renderTrigger = () => {
    created.length = 0
    trigger.component({})
  }
  const renderModal = () => {
    created.length = 0
    modal.component({})
  }

  renderTrigger()
  const button = created.find((element) => element.type === 'button')
  assert.ok(button, 'the trigger renders a button')
  assert.equal(button.props['aria-haspopup'], 'dialog')
  assert.equal(button.props['aria-expanded'], false)

  // Nothing renders on the overlay layer before the trigger is used.
  renderModal()
  assert.equal(created.length, 0, 'the overlay stays empty while closed')

  button.props.onClick()

  renderTrigger()
  assert.equal(created.find((element) => element.type === 'button').props['aria-expanded'], true)

  renderModal()
  const dialog = created.find((element) => element.props?.role === 'dialog')
  assert.ok(dialog, 'the open modal renders a dialog element')
  assert.equal(dialog.props['aria-modal'], true)
  assert.equal(dialog.props['aria-label'], '工作区记忆')

  // The modal sits on a fixed, centred backdrop that opts into pointer events.
  const backdrop = created.find(
    (element) => element.props?.role === 'presentation' && element.props?.style?.position === 'fixed',
  )
  assert.ok(backdrop, 'the dialog renders on a fixed backdrop')
  assert.equal(backdrop.props.style.zIndex, 10050)
  assert.equal(backdrop.props.style.pointerEvents, 'auto')

  // Clicking the backdrop dismisses the panel.
  backdrop.props.onMouseDown({ target: backdrop, currentTarget: backdrop })
  renderModal()
  assert.equal(created.length, 0, 'clicking the backdrop closes the panel')
})

test('client copy follows a Traditional Chinese host locale', async () => {
  let loaded
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        loaded = definition
      },
    },
  }

  await import(`${new URL('../client.js', import.meta.url).href}?test=zh-tw`)
  assert.ok(loaded, 'module loader received the bundle')

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
  let localeId = 'zh-TW'
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
    locale: { getLocale: () => ({ id: localeId }) },
  }

  const app = loaded.factory((name) => {
    if (name === 'react') return React
    throw new Error(`unexpected require: ${name}`)
  })
  app.apply(ctx)

  const hero = registrations.find((entry) => entry.options.name === 'conversation.hero.options')

  // A Traditional Chinese host locale selects the Traditional copy.
  assert.equal(hero.options.label(), '注入記憶')

  // Other Traditional Chinese locales resolve the same way.
  localeId = 'zh-HK'
  assert.equal(hero.options.label(), '注入記憶')

  // Simplified Chinese keeps the Simplified copy.
  localeId = 'zh'
  assert.equal(hero.options.label(), '注入记忆')

  // English stays English.
  localeId = 'en'
  assert.equal(hero.options.label(), 'Inject memory')
})
