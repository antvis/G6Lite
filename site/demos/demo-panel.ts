const CLUSTER_STYLE =
  'position:absolute;top:10px;right:10px;z-index:30;display:flex;gap:6px;align-items:center;pointer-events:auto;';

const MENU_STYLE_ID = 'g6lite-canvas-menu-style';

export type CanvasMenuItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type OpenMenu = {
  close: () => void;
  trigger: HTMLElement;
  menu: HTMLElement;
};

let openMenu: OpenMenu | null = null;

const MENU_STYLE = `
    .g6-canvas-menu-trigger {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      height: 28px;
      min-width: 4.5rem;
      padding: 0 8px 0 10px;
      border: 0;
      border-radius: 8px;
      background: rgba(255,255,255,.96);
      color: #334155;
      font: 500 12px/1 system-ui, sans-serif;
      box-shadow: 0 1px 2px rgba(15,23,42,.08);
      cursor: pointer;
    }
    .g6-canvas-menu-trigger svg {
      flex: none;
      transition: transform .15s ease;
    }
    .g6-canvas-menu-trigger[aria-expanded="true"] svg {
      transform: rotate(180deg);
    }
    .g6-canvas-menu {
      position: fixed;
      z-index: 80;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 8.75rem;
      max-height: min(420px, 70vh);
      margin: 0;
      padding: 4px;
      overflow: auto;
      border: 0;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(15,23,42,.14);
    }
    .g6-canvas-menu button {
      display: flex;
      align-items: center;
      width: 100%;
      height: 28px;
      padding: 0 10px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #334155;
      font: 500 12px/1 system-ui, sans-serif;
      text-align: left;
      white-space: nowrap;
      cursor: pointer;
    }
    .g6-canvas-menu button:hover,
    .g6-canvas-menu button:focus-visible {
      background: #f3f5fb;
      outline: none;
    }
    .g6-canvas-menu button[aria-selected="true"] {
      background: #e6ebfe;
      color: #5366ad;
    }
    .g6-canvas-menu button:disabled {
      opacity: .45;
      cursor: default;
    }
    .g6-canvas-menu-label {
      padding: 6px 10px 2px;
      color: #94a3b8;
      font: 500 11px/1 system-ui, sans-serif;
    }
    .g6-canvas-menu-label:not(:first-child) {
      margin-top: 4px;
    }
`;

function ensureMenuStyle() {
  let style = document.getElementById(MENU_STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = MENU_STYLE_ID;
    document.head.append(style);
  }
  if (style.textContent !== MENU_STYLE) style.textContent = MENU_STYLE;
}

function textWidth(text: string) {
  const probe = document.createElement('span');
  probe.style.cssText =
    'position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:500 12px/1 system-ui,sans-serif;';
  probe.textContent = text;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.ceil(width);
}

export function mountCanvasControl(container: HTMLElement, control: HTMLElement) {
  ensureCluster(container).append(control);
}

function ensureCluster(container: HTMLElement) {
  container.style.position = 'relative';
  let cluster = container.querySelector<HTMLElement>(':scope > [data-canvas-controls]');
  if (!cluster) {
    cluster = document.createElement('div');
    cluster.dataset.canvasControls = '';
    cluster.dataset.captureIgnore = '';
    cluster.style.cssText = CLUSTER_STYLE;
    container.append(cluster);
  }
  return cluster;
}

function closeOpenMenu() {
  openMenu?.close();
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (event) => {
    if (!openMenu) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (openMenu.trigger.contains(target) || openMenu.menu.contains(target)) return;
    closeOpenMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOpenMenu();
  });
}

export function mountCanvasMenu(
  container: HTMLElement,
  options: {
    caption?: string;
    items: readonly CanvasMenuItem[];
    value: string;
    action?: boolean;
    onSelect: (value: string) => void;
  },
) {
  ensureMenuStyle();
  const action = options.action === true;
  let items = [...options.items];
  let value = options.value;

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'g6-canvas-menu-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', options.caption || '操作');
  const triggerLabel = document.createElement('span');
  trigger.append(triggerLabel);
  trigger.insertAdjacentHTML(
    'beforeend',
    '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>',
  );

  const menu = document.createElement('div');
  menu.className = 'g6-canvas-menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  const renderTrigger = () => {
    const current = items.find((item) => item.value === value);
    triggerLabel.textContent = action ? options.caption || '操作' : current?.label || options.caption || '';
    const labelWidth = textWidth(triggerLabel.textContent || '');
    const contentWidth = action
      ? labelWidth
      : Math.max(labelWidth, ...items.map((item) => textWidth(item.label)));
    trigger.style.minWidth = `${Math.min(contentWidth, 168) + 28}px`;
  };

  const renderMenu = () => {
    menu.replaceChildren();
    for (const item of items) {
      const option = document.createElement('button');
      option.type = 'button';
      option.dataset.value = item.value;
      option.textContent = item.label;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', !action && item.value === value ? 'true' : 'false');
      option.disabled = item.disabled === true;
      option.addEventListener('click', () => {
        if (option.disabled) return;
        if (!action) value = item.value;
        options.onSelect(item.value);
        renderTrigger();
        close();
      });
      menu.append(option);
    }
  };

  const place = () => {
    const rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.visibility = 'hidden';
    const menuRect = menu.getBoundingClientRect();
    const margin = 8;
    let top = rect.bottom + 6;
    if (top + menuRect.height > window.innerHeight - margin) top = rect.top - menuRect.height - 6;
    let left = rect.right - menuRect.width;
    left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));
    top = Math.max(margin, top);
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = '';
  };

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (openMenu?.menu === menu) openMenu = null;
  };

  const open = () => {
    if (openMenu && openMenu.menu !== menu) openMenu.close();
    renderMenu();
    document.body.append(menu);
    place();
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = { close, trigger, menu };
  };

  trigger.addEventListener('click', () => {
    if (trigger.getAttribute('aria-expanded') === 'true') close();
    else open();
  });

  const watch = new MutationObserver(() => {
    if (trigger.isConnected) return;
    close();
    menu.remove();
    watch.disconnect();
  });
  watch.observe(container, { childList: true, subtree: true });

  renderTrigger();
  const field = document.createElement('div');
  field.style.cssText =
    'display:inline-flex;flex:none;align-items:center;gap:4px;color:#64748b;font:500 12px/1 system-ui,sans-serif;';
  if (!action && options.caption) {
    const caption = document.createElement('span');
    caption.textContent = options.caption;
    field.append(caption);
  }
  field.append(trigger);
  ensureCluster(container).append(field);

  return {
    trigger,
    setItems(next: readonly CanvasMenuItem[]) {
      items = [...next];
      renderTrigger();
      if (!menu.hidden) renderMenu();
    },
    setValue(next: string) {
      value = next;
      renderTrigger();
    },
  };
}

export function mountGroupedChoices(
  container: HTMLElement,
  groups: ReadonlyArray<{
    label: string;
    values: readonly string[];
    selected: string;
    onChange: (value: string) => void;
  }>,
) {
  ensureMenuStyle();
  const state = groups.map((group) => ({ ...group, value: group.selected }));

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'g6-canvas-menu-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', '画布');
  const triggerLabel = document.createElement('span');
  trigger.append(triggerLabel);
  trigger.insertAdjacentHTML(
    'beforeend',
    '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>',
  );

  const menu = document.createElement('div');
  menu.className = 'g6-canvas-menu';
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;

  const summary = () => state.map((group) => group.value).join(' · ');

  const renderTrigger = () => {
    triggerLabel.textContent = summary();
    trigger.style.minWidth = `${textWidth(summary()) + 28}px`;
  };

  const renderMenu = () => {
    menu.replaceChildren();
    for (const group of state) {
      const heading = document.createElement('div');
      heading.className = 'g6-canvas-menu-label';
      heading.textContent = group.label;
      menu.append(heading);
      for (const value of group.values) {
        const option = document.createElement('button');
        option.type = 'button';
        option.textContent = value;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', value === group.value ? 'true' : 'false');
        option.addEventListener('click', () => {
          group.value = value;
          group.onChange(value);
          renderTrigger();
          close();
        });
        menu.append(option);
      }
    }
  };

  const place = () => {
    const rect = trigger.getBoundingClientRect();
    menu.hidden = false;
    menu.style.visibility = 'hidden';
    const menuRect = menu.getBoundingClientRect();
    const margin = 8;
    let top = rect.bottom + 6;
    if (top + menuRect.height > window.innerHeight - margin) top = Math.max(margin, rect.top - menuRect.height - 6);
    let left = rect.right - menuRect.width;
    left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = '';
  };

  const close = () => {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (openMenu?.menu === menu) openMenu = null;
  };

  trigger.addEventListener('click', () => {
    if (trigger.getAttribute('aria-expanded') === 'true') {
      close();
      return;
    }
    if (openMenu && openMenu.menu !== menu) openMenu.close();
    renderMenu();
    document.body.append(menu);
    place();
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = { close, trigger, menu };
  });

  const watch = new MutationObserver(() => {
    if (trigger.isConnected) return;
    close();
    menu.remove();
    watch.disconnect();
  });
  watch.observe(container, { childList: true, subtree: true });

  renderTrigger();
  ensureCluster(container).append(trigger);
  return { trigger };
}

export function mountChoiceSelect(
  container: HTMLElement,
  label: string,
  values: readonly string[],
  selected: string,
  onChange: (value: string) => void,
) {
  return mountCanvasMenu(container, {
    caption: label,
    items: values.map((value) => ({ value, label: value })),
    value: selected,
    onSelect: onChange,
  });
}

export function mountActionSelect(container: HTMLElement, buttons: HTMLButtonElement[], label = '操作') {
  if (!buttons.length) return null;
  const items = () =>
    buttons.map((button, index) => {
      const key = button.dataset.action ?? button.dataset.layout ?? button.dataset.placement ?? String(index);
      button.dataset.canvasControl = key;
      return {
        value: key,
        label: (button.textContent || key).trim(),
        disabled: button.disabled,
      };
    });
  const menu = mountCanvasMenu(container, {
    caption: label,
    action: true,
    items: items(),
    value: '',
    onSelect(value) {
      const button = buttons.find((item) => item.dataset.canvasControl === value);
      if (!button || button.disabled) return;
      button.click();
      menu.setItems(items());
    },
  });
  return menu;
}

function mountCanvasControls(container: HTMLElement, buttons: HTMLButtonElement[]) {
  if (!buttons.length) return;
  const choiceKey = buttons.every((button) => button.dataset.layout)
    ? 'layout'
    : buttons.every((button) => button.dataset.placement)
      ? 'placement'
      : null;
  if (!choiceKey) {
    mountActionSelect(container, buttons, '操作');
    return;
  }
  const labels = buttons.map((button) => (button.textContent || '').trim());
  mountChoiceSelect(container, choiceKey === 'layout' ? '布局' : '位置', labels, labels[0] ?? '', (value) => {
    buttons.find((button) => (button.textContent || '').trim() === value)?.click();
  });
}

export function createDemoPanel(
  container: string | HTMLElement,
  title: string,
  _description: string,
  controlsHtml: string,
) {
  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  containerEl.style.position = 'relative';

  const panel = document.createElement('div');
  const controls = document.createElement('div');
  controls.dataset.role = 'controls';
  controls.hidden = true;
  controls.innerHTML = controlsHtml;
  panel.append(controls);

  const buttons = [...controls.querySelectorAll('button')];
  mountCanvasControls(containerEl, buttons);
  const cluster = containerEl.querySelector<HTMLElement>(':scope > [data-canvas-controls]');
  if (cluster) panel.append(cluster);

  const status = document.createElement('div');
  status.dataset.role = 'status';
  status.dataset.captureIgnore = '';
  status.style.cssText =
    'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
  status.textContent = _description;
  panel.append(controls, status);
  containerEl.append(panel);

  return {
    panel,
    controls,
    setStatus(message: string) {
      status.textContent = message;
    },
  };
}

export const buttonStyle =
  'padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;';
