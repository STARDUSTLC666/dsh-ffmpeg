// Generated: shared optional update controls; edit the original client templates.
(function(){
/* DSH workbench UI v1. MIT. Canonical source: dsh-suite/ui/workbench-ui.js.
 * Vendored into each plugin: no Suite or extra runtime dependency is required.
 * Styles are scoped to .dshw and never replace the host chrome or theme.
 */
function createWorkbenchUI(React) {
  const h = React.createElement;
  const { useEffect, useId, useRef } = React;
  const cx = (...values) => values.filter(Boolean).join(' ');
  const paths = {
    book: ['M4 4h6a3 3 0 0 1 2 2v15a4 4 0 0 0-4-2H4z', 'M20 4h-6a3 3 0 0 0-2 2v15a4 4 0 0 1 4-2h4z'],
    calendar: ['M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z', 'M7 3v4M17 3v4M3 10h18'],
    mail: ['M3 5h18v14H3z', 'm3 6 9 7 9-7'],
    rss: ['M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16', 'M4 19h.01'],
    slides: ['M3 4h18v13H3z', 'M12 17v4M8 21h8'],
    shield: ['m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z', 'm8 12 3 3 5-6'],
    layers: ['M5 3h16v16H5z', 'M2 7v15h15'],
    play: ['m9 6 9 6-9 6Z'],
    video: ['M3 5h12v14H3z', 'm15 10 6-4v12l-6-4'],
    search: ['M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z', 'm16 16 5 5'],
    plus: ['M12 5v14M5 12h14'],
    refresh: ['M20 7a9 9 0 1 0 1 8', 'M20 2v5h-5'],
    settings: ['m9 3-.7 2.4-2 .9L4 5.8 2.5 8.4l1.7 1.8v2.3L2.5 14 4 17l2.5-.4 1.9 1L9 20h3l.8-2.4 2-1 2.5.4 1.5-2.7-1.7-1.9v-2.2l1.7-1.8-1.5-2.6-2.5.4-2-1L12 3Z', 'M14 11.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z'],
    close: ['m6 6 12 12M18 6 6 18'],
    left: ['m14 5-7 7 7 7'],
    right: ['m10 5 7 7-7 7'],
    down: ['m5 9 7 7 7-7'],
    filter: ['M4 5h16M7 12h10M10 19h4'],
    download: ['M12 3v12m-5-5 5 5 5-5', 'M4 16v5h16v-5'],
    upload: ['M12 16V4m-5 5 5-5 5 5', 'M4 16v5h16v-5'],
    copy: ['M8 8h13v13H8z', 'M16 8V3H3v13h5'],
    external: ['M14 3h7v7m0-7L10 14', 'M10 3H3v18h18v-7'],
    file: ['M4 3h10l6 6v12H4z', 'M14 3v6h6M8 13h8M8 17h6'],
    folder: ['M3 5h7l2 3h9v12H3z'],
    edit: ['m15 4 5 5-10 10-6 1 1-6Z', 'm13 6 5 5'],
    trash: ['M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'],
    more: ['M5 12h.01M12 12h.01M19 12h.01'],
    info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v6M12 7h.01'],
    check: ['m5 12 4 4L19 6'],
    quote: ['M4 12h6v7H3v-7c0-4 2-6 5-7M15 12h6v7h-7v-7c0-4 2-6 5-7'],
    star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z'],
    reply: ['m9 5-7 7 7 7v-5h6c3 0 5 2 6 5 0-8-4-11-12-11Z'],
    link: ['m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0', 'm14 8 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0'],
  };
  function Icon({ name = 'file', size = 20, ...props }) {
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false, ...props },
      (paths[name] || paths.file).map((d, index) => h('path', { key: index, d })));
  }
  function Button({ children, icon, variant, className, ...props }) {
    return h('button', { type: 'button', ...props, className: cx('w-button', variant && 'w-' + variant, className) }, icon ? h(Icon, { name: icon, size: 18 }) : null, children);
  }
  function IconButton({ label, icon, ...props }) {
    return h(Button, { ...props, icon, className: cx('w-icon-button', props.className), 'aria-label': label, title: label });
  }
  function Page({ title, subtitle, actions, children, workbench = false, className, rootRef, ...props }) {
    return h('section', { ...props, ref: rootRef, className: cx('dshw', 'w-page', className), 'data-main': workbench ? 'true' : 'false' },
      h(Styles, { key: 'styles' }),
      h('header', { className: 'w-page-header' }, h('div', { className: 'w-heading' }, h('h1', null, title), subtitle ? h('p', { className: 'w-subtitle' }, subtitle) : null), actions ? h('div', { className: 'w-header-actions' }, actions) : null),
      h('div', { className: 'w-body' }, children));
  }
  function Tabs({ items, value, onChange, label, children }) {
    const id = useId();
    const active = items.some(item => item.id === value) ? value : items[0]?.id;
    function keys(event, index) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      const node = event.currentTarget.parentElement?.querySelectorAll('[role=tab]')[next];
      if (node) { onChange(items[next].id); node.focus(); }
    }
    return h('div', { className: 'w-tabs-layout' },
      h('div', { className: 'w-tabs', role: 'tablist', 'aria-label': label }, items.map((item, index) => h('button', {
        type: 'button', role: 'tab', key: item.id, id: id + '-' + item.id, 'aria-controls': id + '-panel', 'aria-selected': active === item.id, tabIndex: active === item.id ? 0 : -1,
        onClick: () => onChange(item.id), onKeyDown: event => keys(event, index),
      }, item.label, item.count !== undefined ? h('span', { className: 'w-count' }, item.count) : null))),
      h('div', { className: 'w-tab-panel', id: id + '-panel', role: 'tabpanel', 'aria-labelledby': id + '-' + active }, children));
  }
  function Status({ children, tone = 'info', className }) {
    if (!children) return null;
    return h('div', { className: cx('dshw', 'w-status', 'w-status-' + tone, className), role: tone === 'error' ? 'alert' : 'status', 'aria-live': tone === 'error' ? 'assertive' : 'polite' }, h(Icon, { name: tone === 'success' ? 'check' : 'info', size: 18 }), h('div', null, children));
  }
  function Empty({ title, children, action, icon = 'file' }) {
    return h('div', { className: 'dshw w-empty' }, h(Styles, { key: 'styles' }), h(Icon, { name: icon, size: 32 }), h('h2', null, title), children ? h('div', { className: 'w-muted' }, children) : null, action ? h('div', { className: 'w-toolbar' }, action) : null);
  }
  function Split({ list, detail, selected, onBack, backLabel, className, listWidth = 360 }) {
    const ref = useRef(null);
    useEffect(() => {
      if (!selected || !ref.current || ref.current.clientWidth > 760) return;
      const heading = ref.current.querySelector('.w-detail h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }, [selected]);
    return h('div', { ref, className: cx('w-split', className), 'data-selected': selected ? 'true' : 'false', style: { '--w-list-width': listWidth + 'px' } },
      h('div', { className: 'w-master' }, list),
      h('div', { className: 'w-detail' }, selected ? h(Button, { className: 'w-back', icon: 'left', variant: 'ghost', onClick: onBack }, backLabel) : null, detail));
  }
  function Row({ title, meta, description, active, onClick, children, status, className, disabled }) {
    return h('div', { className: cx('w-row', active && 'w-selected', className) },
      children ? h('div', { className: 'w-row-select' }, children) : null,
      h('button', { type: 'button', className: 'w-row-button', onClick, disabled, 'aria-pressed': !!active },
        h('span', { className: 'w-row-head' }, h('strong', null, title), status ? h('span', { className: 'w-tag' }, status) : null),
        meta ? h('span', { className: 'w-row-meta' }, meta) : null,
        description ? h('span', { className: 'w-row-description' }, description) : null));
  }
  function Search({ label, value, onChange, ...props }) {
    const id = useId();
    return h('div', { className: 'w-search' }, h(Icon, { name: 'search', size: 18 }), h('input', { type: 'search', id, 'aria-label': label, placeholder: label, value, onChange, ...props }));
  }
  function Switch({ label, checked, onChange, disabled }) {
    return h('label', { className: 'w-switch-label' }, h('span', null, label), h('input', { type: 'checkbox', role: 'switch', checked, disabled, onChange, 'aria-label': label }), h('span', { className: 'w-switch-track', 'aria-hidden': true }));
  }
  function Dialog({ title, children, onClose, closeLabel, className, busy = false }) {
    const id = useId(), panel = useRef(null);
    useEffect(() => {
      const previous = document.activeElement;
      panel.current?.querySelector('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')?.focus();
      return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }); };
    }, []);
    function keydown(event) {
      if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); event.stopPropagation(); if (!busy) onClose(); return; }
      if (event.key !== 'Tab') return;
      const controls = [...panel.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!controls.length) { event.preventDefault(); panel.current.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    return h('div', { className: 'dshw w-overlay', onClick: event => { if (!busy && event.target === event.currentTarget) onClose(); } },
      h(Styles, { key: 'styles' }),
      h('section', { ref: panel, className: cx('w-dialog', className), role: 'dialog', 'aria-modal': true, 'aria-labelledby': id, tabIndex: -1, onKeyDown: keydown },
        h('header', { className: 'w-dialog-header' }, h('h2', { id }, title), h(IconButton, { icon: 'close', label: closeLabel, disabled: busy, onClick: onClose })), h('div', { className: 'w-dialog-body' }, children)));
  }
  function register(ctx, { id, label, icon, component, inject, order = 50 }) {
    // The two slots are optional. Existing settings and manual tools still load
    // in hosts without a workbench, while RC.3 owns navigation/pinning itself.
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: id, inject: () => ({ ...(inject?.() || {}), workbench: true }) }, component));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id, order, label }, function WorkbenchIcon({ size }) { return h(Icon, { name: icon, size }); }));
  }
  const styles = `
.dshw{--w-bg:var(--dsw-alias-bg-layer-1,#fff);--w-soft:var(--dsw-alias-bg-layer-2,#f7f8fa);--w-text:var(--dsw-alias-label-primary,#18202c);--w-muted:var(--dsw-alias-label-secondary,#667085);--w-border:var(--dsw-alias-border-l3,#e7e9ef);--w-accent:var(--dsh-plugin-workbench-accent,#4f6bdb);--w-selected:color-mix(in srgb,var(--w-accent) 10%,var(--w-bg));--w-primary:var(--w-text);--w-on-primary:var(--w-bg);container-type:inline-size;container-name:dsh-workbench;color:var(--w-text);font:14px/1.65 var(--dsh-font-family-content,system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif);min-width:0;max-width:100%;box-sizing:border-box;text-align:start;color-scheme:inherit}
.dshw *,.dshw *:before,.dshw *:after{box-sizing:border-box}.dshw h1,.dshw h2,.dshw h3,.dshw h4,.dshw p{margin:0}.dshw h1{font-size:30px;line-height:1.25;letter-spacing:-.025em;font-weight:650}.dshw h2{font-size:24px;line-height:1.35;font-weight:650;letter-spacing:-.015em;overflow-wrap:anywhere}.dshw h3,.dshw h4{font-size:16px;line-height:1.4;font-weight:600}.dshw a{color:var(--w-accent);text-underline-offset:3px;overflow-wrap:anywhere}.dshw button,.dshw input,.dshw select,.dshw textarea{font:inherit;color:inherit;max-width:100%}.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]),.dshw select,.dshw textarea{background:var(--dsw-specific-input-major,var(--w-bg));border:1px solid var(--w-border);border-radius:8px;padding:8px 11px;min-width:0;line-height:1.5}.dshw input:not([type=checkbox]):not([type=radio]):not([type=file]),.dshw select{min-height:38px}.dshw textarea{resize:vertical}.dshw input[type=checkbox],.dshw input[type=radio]{width:16px;height:16px;flex-shrink:0;accent-color:var(--w-accent)}.dshw :focus-visible{outline:2px solid var(--w-accent);outline-offset:3px}.dshw button:disabled,.dshw input:disabled,.dshw select:disabled,.dshw textarea:disabled{opacity:.5;cursor:not-allowed}.dshw label{font-size:13px}.dshw fieldset{min-width:0;border:1px solid var(--w-border);border-radius:8px}.dshw summary{cursor:pointer;font-weight:550;list-style:none;display:flex;align-items:center;gap:8px}.dshw summary::-webkit-details-marker{display:none}.dshw summary:after{content:'';display:block;margin-inline-start:auto;width:7px;height:7px;border-inline-end:1.75px solid currentColor;border-bottom:1.75px solid currentColor;transform:rotate(45deg);flex-shrink:0}.dshw details[open]>summary:after{transform:rotate(225deg)}.dshw details>summary+*{margin-top:12px}.dshw pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;max-width:100%;background:var(--w-soft);border-radius:6px;padding:14px}.dshw img,.dshw video,.dshw iframe{max-width:100%}
.w-page{display:flex;flex-direction:column;position:relative;padding:0;min-height:540px;gap:0}.w-page[data-main=true]{height:100%;min-height:0;padding:calc(24px + var(--dsh-frame-top-clearance,0px)) 28px 0 max(28px,var(--dsh-frame-leading-clearance,0px));overflow:auto}.dshw[data-main=true]{background:var(--w-bg)}.dshw.w-page,.dshw .w-body,.dshw .w-tab-panel{overflow-x:clip}.w-page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:22px;flex-shrink:0}.w-heading{min-width:0}.w-subtitle{margin-top:8px!important;font-size:14px;color:var(--w-muted);line-height:1.6}.w-header-actions,.w-toolbar,.w-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-width:0}.w-header-actions{justify-content:flex-end}.w-body,.w-tabs-layout{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0}.w-body{overflow:auto}.w-tab-panel{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:auto}.w-tabs{display:flex;align-items:stretch;gap:20px;border-bottom:1px solid var(--w-border);flex-shrink:0;overflow-x:auto;scrollbar-width:thin}.dshw .w-tabs>button{border:0;border-bottom:2px solid transparent;background:transparent;padding:11px 8px 13px;white-space:nowrap;font-size:14px;font-weight:550;cursor:pointer;color:var(--w-muted);display:flex;align-items:center;gap:7px}.dshw .w-tabs>button[aria-selected=true]{border-bottom-color:var(--w-accent);color:var(--w-accent)}.w-count,.w-tag{font-size:12px;line-height:1.5;display:inline-flex;align-items:center;flex-shrink:0;background:var(--w-soft);border-radius:5px;padding:1px 6px;color:var(--w-muted)}.w-tabs [aria-selected=true] .w-count,.w-selected .w-tag{color:var(--w-accent);background:var(--w-selected)}
.dshw .w-button{display:inline-flex;justify-content:center;align-items:center;gap:7px;background:var(--w-bg);border:1px solid var(--w-border);border-radius:8px;padding:8px 12px;min-height:36px;line-height:1.4;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;white-space:normal}.dshw .w-button:not(:disabled):hover{background:var(--w-soft)}.dshw .w-primary{background:var(--w-primary);border-color:var(--w-primary);color:var(--w-on-primary)}.dshw .w-primary:not(:disabled):hover{background:var(--w-primary);opacity:.9}.dshw .w-ghost{background:transparent;border-color:transparent}.dshw .w-danger{color:var(--dsw-alias-state-error-primary,#b43c3c)}.dshw .w-icon-button{width:36px;min-width:36px;padding:8px}.dshw .w-button svg{flex-shrink:0}.w-muted{color:var(--w-muted);font-size:12px;line-height:1.6}.w-section{padding:24px 0;border-bottom:1px solid var(--w-border);min-width:0}.w-section>h3{margin-bottom:12px}.w-section>p+p{margin-top:8px}.w-fields{display:grid;gap:16px;min-width:0}.w-field{display:grid;gap:6px;min-width:0}.w-field>input,.w-field>select,.w-field>textarea{width:100%}.w-status{display:flex;align-items:flex-start;gap:8px;padding:11px 13px;margin:12px 0;border:1px solid var(--w-border);border-radius:8px;background:var(--w-soft);font-size:13px;overflow-wrap:anywhere;flex-shrink:0}.w-status>svg{flex-shrink:0;margin-top:2px}.w-status-error{color:var(--dsw-alias-state-error-primary,#ad3636)}.w-status-success{color:var(--dsw-alias-state-success-primary,#24794a)}.w-status-warn{color:var(--dsw-alias-state-warning-primary,#8a5a00)}.w-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;width:100%;max-width:580px;padding:48px 24px;margin:auto;min-height:280px;overflow-wrap:anywhere}.w-empty>svg{color:var(--w-muted)}.w-empty h2{font-size:20px}.w-empty .w-muted{font-size:14px}.w-empty .w-toolbar{justify-content:center}
.w-split{display:grid;grid-template-columns:minmax(240px,var(--w-list-width)) minmax(0,1fr);min-height:460px;flex:1;min-width:0}.w-master{min-width:0;border-inline-end:1px solid var(--w-border);overflow:auto;padding-bottom:24px}.w-detail{min-width:0;padding:26px 28px;overflow:auto;overflow-wrap:anywhere;display:flex;flex-direction:column}.w-master-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:20px 16px}.w-search{display:flex;align-items:center;gap:8px;border:1px solid var(--w-border);border-radius:8px;padding:0 10px;min-width:0;flex:1;background:var(--w-bg)}.w-search>svg{color:var(--w-muted);flex-shrink:0}.dshw .w-search>input{border:0!important;background:transparent!important;padding:8px 0!important;width:100%;outline-offset:0}.w-row{display:flex;gap:0;min-width:0;position:relative;border-bottom:1px solid var(--w-border);border-inline-start:3px solid transparent}.w-row-select{display:flex;align-items:flex-start;padding:21px 0 0 14px}.dshw .w-row-button{display:flex;flex-direction:column;align-items:stretch;gap:7px;text-align:start;width:100%;padding:18px 18px 18px 16px;border:0;background:transparent;color:inherit;min-width:0;cursor:pointer;line-height:1.5}.dshw .w-row-button:hover{background:var(--w-soft)}.w-row-head{display:flex;align-items:flex-start;gap:10px;justify-content:space-between;min-width:0}.w-row-head>strong{font-size:14px;line-height:1.5;font-weight:600;overflow-wrap:anywhere}.w-row-meta,.w-row-description{color:var(--w-muted);font-size:12px;line-height:1.6;overflow-wrap:anywhere}.w-row-description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.w-selected{background:var(--w-selected);border-inline-start-color:var(--w-accent)}.w-back{display:none!important}.w-detail-title{margin-bottom:12px!important}.w-detail-meta{color:var(--w-muted);font-size:13px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.w-detail-footer{padding:24px 0;display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:auto;border-top:1px solid var(--w-border)}.w-detail-footer .w-muted{flex:1;min-width:160px}.w-definition{display:grid;grid-template-columns:minmax(80px,120px) minmax(0,1fr);gap:8px 16px;font-size:14px;margin:20px 0}.w-definition dt{color:var(--w-muted)}.w-definition dd{margin:0;min-width:0;overflow-wrap:anywhere}
.w-switch-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;position:relative;cursor:pointer}.w-switch-label>input{position:absolute;opacity:0;inset-inline-end:0;width:36px!important;height:22px!important;margin:0;cursor:pointer}.w-switch-track{width:36px;height:22px;border-radius:12px;display:block;background:var(--w-border);border:1px solid var(--w-border);pointer-events:none;padding:2px;transition:background .15s}.w-switch-track:before{content:'';display:block;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px #0002;transition:transform .15s}.w-switch-label>input:checked+.w-switch-track{background:var(--w-accent);border-color:var(--w-accent)}.w-switch-label>input:checked+.w-switch-track:before{transform:translateX(14px)}.w-switch-label>input:focus-visible+.w-switch-track{outline:2px solid var(--w-accent);outline-offset:3px}.w-switch-label:has(>input:disabled){opacity:.5;cursor:not-allowed}
.w-overlay{position:fixed;inset:0;background:#0005;display:flex;justify-content:flex-end;z-index:1000;padding:12px;overflow:auto}.w-dialog{width:min(620px,100%);max-height:100%;display:flex;flex-direction:column;min-height:0;background:var(--w-bg);color:var(--w-text);border:1px solid var(--w-border);border-radius:12px;box-shadow:0 18px 70px #0003}.w-dialog-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 24px;border-bottom:1px solid var(--w-border);flex-shrink:0}.w-dialog-header>h2{font-size:20px}.w-dialog-body{overflow:auto;padding:20px 24px;min-height:0}.w-editor-grid{display:grid;grid-template-columns:210px minmax(0,1fr) 300px;min-height:500px;flex:1}.w-editor-list{padding:20px 12px;border-inline-end:1px solid var(--w-border);min-width:0}.w-editor-canvas{background:var(--w-soft);padding:20px;min-width:0;display:flex;flex-direction:column;gap:14px}.w-editor-inspector{padding:24px;border-inline-start:1px solid var(--w-border);min-width:0;overflow:auto}.w-editor-inspector h3{margin-bottom:18px}.w-preview-empty{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:12px;aspect-ratio:16/9;min-height:180px;background:var(--w-soft);border:1px solid var(--w-border);border-radius:8px;padding:24px;color:var(--w-muted)}.w-content-pad{padding:24px 0}.w-stack{display:flex;flex-direction:column;gap:16px;min-width:0}.w-scroll-x{overflow:auto;max-width:100%}
@container dsh-workbench (max-width:1000px){.w-editor-grid{grid-template-columns:160px minmax(0,1fr)}.w-editor-inspector{grid-column:1/-1;border-inline-start:0;border-top:1px solid var(--w-border)}.w-header-actions{max-width:60%}.w-split{grid-template-columns:minmax(240px,32%) minmax(0,1fr)}}
@container dsh-workbench (max-width:760px){.w-page-header{gap:14px;flex-wrap:wrap;padding-bottom:18px}.w-heading{flex:1;min-width:170px}.dshw h1{font-size:24px}.w-header-actions{max-width:100%;justify-content:flex-start}.w-subtitle{font-size:13px}.w-tabs{gap:12px}.dshw .w-tabs>button{padding:10px 4px 12px}.w-split{display:block;min-height:360px}.w-split[data-selected=false]>.w-detail{display:none}.w-split[data-selected=true]>.w-master{display:none}.w-master{border-inline-end:0}.w-detail{padding:20px 0}.w-back{display:inline-flex!important;align-self:flex-start;margin:0 0 16px!important}.w-detail h2{font-size:22px}.w-master-toolbar{padding:16px 0}.dshw .w-row-button{padding:16px 10px}.w-detail-footer{position:static}.w-detail-footer .w-muted{flex-basis:100%}.w-editor-grid{display:flex;flex-direction:column}.w-editor-list{border-inline-end:0;border-bottom:1px solid var(--w-border);padding:16px 0}.w-editor-canvas{padding:16px 0;background:var(--w-bg)}.w-editor-inspector{padding:20px 0}.w-dialog-header,.w-dialog-body{padding:16px}.w-button{min-height:40px}.w-definition{grid-template-columns:80px minmax(0,1fr)}}
@media(max-width:700px){.w-page[data-main=true]{padding:calc(16px + var(--dsh-frame-top-clearance,0px)) 16px 0 max(16px,var(--dsh-frame-leading-clearance,0px))}.w-overlay{padding:8px}.w-dialog{width:100%}}
@media(prefers-reduced-motion:reduce){.dshw *,.dshw *:before{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;
  function Styles() { return h('style', null, styles); }
  return { Icon, Button, IconButton, Page, Tabs, Status, Empty, Split, Row, Search, Switch, Dialog, Styles, register, styles };
}

/* One update control per plugin. Only transport, idle guards and installation
 * coordination are shared; no global update page or update-all action exists. */
function __stardustUpdatesGuards() {
  const key = Symbol.for('stardustlc.plugin-updates.guards.v1');
  return globalThis[key] ||= { values: new Map(), listeners: new Set(), viewListeners: new Set(), clients: new Set() };
}
function __stardustUpdatesGuard(React, name, { dirty = false, busy = false, retainOnClose = false } = {}) {
  const token = React.useRef(null);
  if (!token.current) token.current = {};
  React.useLayoutEffect(() => {
    const pool = __stardustUpdatesGuards();
    if (!dirty && !busy) for (const [key, value] of pool.values) if (value.name === name && value.orphan) pool.values.delete(key);
    pool.values.set(token.current, { name, dirty: !!dirty, busy: !!busy, retainOnClose, orphan: false });
    for (const listener of pool.listeners) listener();
  }, [name, !!dirty, !!busy, retainOnClose]);
  React.useEffect(() => () => {
    const pool = __stardustUpdatesGuards(), value = pool.values.get(token.current);
    if (value?.retainOnClose && (value.dirty || value.busy)) value.orphan = true;
    else pool.values.delete(token.current);
    for (const listener of pool.listeners) listener();
  }, []);
}
function __StardustPluginUpdatesFooter({ React, name }) {
  const [, render] = React.useState(0), pool = __stardustUpdatesGuards();
  React.useEffect(() => { const fn = () => render(value => value + 1); pool.viewListeners.add(fn); return () => pool.viewListeners.delete(fn); }, []);
  const client = [...pool.clients].find(client => typeof client.Footer === 'function' && client.has(name));
  if (!client) return null;
  return React.createElement(client.Footer, { name });
}
function __stardustUpdatesInlinePage(React, element, name) {
  return React.cloneElement(element, null, element.props.children, React.createElement(__StardustPluginUpdatesFooter, { key: 'plugin-updates', React, name }));
}
function __stardustUpdatesDetailName(subject, rows) {
  if (!subject || !['bundle', 'row'].includes(subject.kind)) return null;
  if (subject.kind === 'row' && subject.pkg?.name === '@stardustlc/dsh-suite') {
    const component = rows.find(row => row.bundledBy === subject.pkg.name && (subject.row?.moduleName === row.name || subject.row?.moduleName?.startsWith(row.name + '/')));
    if (component) return component.name;
  }
  return rows.some(row => row.name === subject.pkg?.name) ? subject.pkg.name : null;
}
function __stardustUpdatesNativeFormState(document) {
  let dirty = false, busy = false;
  for (const scope of document.querySelectorAll('[data-plugin-detail],[data-plugin-row-detail]')) for (const button of scope.querySelectorAll('button')) {
    if (!button.getClientRects().length || button.closest('.plugin-updates-footer')) continue;
    const label = (button.getAttribute('aria-label') || button.textContent || '').trim();
    if (/^(?:正在保存|保存中|Saving)(?:[.…\s]|$)/i.test(label) || button.getAttribute('aria-busy') === 'true') busy = true;
    if (!button.disabled && button.getAttribute('aria-disabled') !== 'true' && /^(?:保存(?:更改|设置|配置)?|Save(?: changes| settings| configuration)?)(?:\s+(?:Ctrl|⌘|Enter|↵).*)?$/i.test(label)) dirty = true;
  }
  return { dirty, busy };
}
function __stardustUpdatesDisplayRows(next, known) {
  for (const row of next.rows) known.set(row.name, row);
  if (!['verifying', 'installing', 'cancelling', 'unknown', 'restore-failed'].includes(next.job?.state)) return next;
  const rows = [...next.rows];
  for (const row of known.values()) if ((row.name === next.job.name || row.bundledBy === next.job.name) && !rows.some(item => item.name === row.name)) rows.push({ ...row, updating: true });
  return { ...next, rows };
}
function __stardustUpdatesSuiteRows(next, participants) {
  // The official manager lists top-level dependencies, not Suite's transitive
  // components. Project active, build-identified clients for display only.
  // Installation and preferences still use the real Suite row from the host.
  const suite = next.rows.find(row => row.name === '@stardustlc/dsh-suite' && row.enabled);
  if (!suite) return next;
  const rows = [...next.rows], names = new Set(rows.map(row => row.name));
  for (const item of participants) if (item.suiteComponent && item.packageVersion && item.label && !names.has(item.name)) {
    names.add(item.name);
    rows.push({ name: item.name, version: item.packageVersion, enabled: true, sourceKind: 'suite', loadError: false, label: item.label, labelEn: item.labelEn, bundledBy: suite.name });
  }
  return { ...next, rows };
}
function __stardustUpdatesWrap(definition, participant) {
  return { ...definition, factory(require) {
    const original = definition.factory(require);
    if (!original || typeof original !== 'object') return original;
    const React = require('react');
    return { ...original, apply(ctx, ...args) {
      const result = original.apply?.call(this, ctx, ...args);
      // The optional alpha.3 slot stays dormant in older hosts; its scoped
      // injection unregisters naturally when the plugin is unloaded.
      if (participant.iconData && participant.sectionIds?.length && typeof ctx.inject === 'function') ctx.inject(['slots'], host => {
        for (const id of new Set(participant.sectionIds)) host.slots.inject('settings.section.icon', () => host.slots.register({ name: 'settings.section.icon', id }, function PluginSettingsIcon({ size = 20 }) {
          return React.createElement('img', { src: participant.iconData, alt: '', 'aria-hidden': true, width: size, height: size, style: { objectFit: 'contain', display: 'block', flexShrink: 0 } });
        }));
      });
      if (typeof ctx.inject === 'function') ctx.inject(['slots', 'locale', 'remote', 'remote.pluginManager'], host => __stardustUpdatesJoin(host, React, require, participant));
      return result;
    } };
  } };
}
function __stardustUpdatesJoin(host, React, require, participant) {
  const key = Symbol.for('stardustlc.plugin-updates.client.v1'), pools = globalThis[key] ||= new WeakMap(), root = host.root || host;
  if (typeof root.plugin !== 'function') return;
  let record = pools.get(root);
  if (!record) {
    record = { refs: new Map(), timer: null, version: participant.version, alive: true, hold: false, uiRevision: 2 };
    pools.set(root, record);
    __stardustUpdatesActivate(record, pools, root, React, require);
  } else if (record.uiRevision !== 2 && !record.migration) {
    // The first loaded participant may still own a pre-footer client. Keep
    // its references and draft guards, wait for any admitted install, then
    // replace that one client fiber instead of running two window heartbeats.
    const shared = record;
    record.migration = Promise.resolve().then(async () => {
      while (shared.alive && shared.hold) await new Promise(resolve => setTimeout(resolve, 500));
      if (!shared.alive || !shared.refs.size) return;
      await shared.fiber?.dispose?.();
      if (!shared.refs.size) return;
      shared.alive = true; shared.uiRevision = 2; pools.set(root, shared);
      __stardustUpdatesActivate(shared, pools, root, React, require);
    }).catch(() => { /* The original page remains usable if host disposal fails. */ });
  }
  clearTimeout(record.timer);
  const ref = {}; record.refs.set(ref, participant);
  host.effect(() => () => {
    record.refs.delete(ref);
    const stop = () => {
      if (record.refs.size || !record.alive) return;
      if (record.hold) { record.timer = setTimeout(stop, 1000); return; }
      record.alive = false; Promise.resolve(record.fiber?.dispose?.()).catch(() => {});
    };
    if (!record.refs.size) record.timer = setTimeout(stop, 1000);
  });
}
function __stardustUpdatesActivate(shared, pools, root, React, require) {
  shared.fiber = root.plugin({ name: 'stardustlc-plugin-updates-client', inject: ['slots', 'locale', 'remote', 'remote.pluginManager'], apply(ctx) {
    const client = __stardustUpdatesClient(ctx, React, require, shared);
    ctx.effect(() => () => { shared.alive = false; client.dispose(); if (pools.get(root) === shared) pools.delete(root); });
  } });
  Promise.resolve(shared.fiber).catch(() => { shared.alive = false; if (pools.get(root) === shared) pools.delete(root); });
}
function __stardustUpdatesClient(ctx, React, require, shared) {
  const h = React.createElement, W = createWorkbenchUI(React), route = new URL('api/stardustlc/plugin-updates', document.baseURI);
  const { useState, useEffect } = React, id = crypto.randomUUID(), listeners = new Set(), pool = __stardustUpdatesGuards(), requests = new Set(), notified = new Set(), knownRows = new Map();
  let alive = true, registered = false, state = null, lastInteraction = Date.now(), inPoll = false, manualOperation = false, legacyHint = null;
  const language = () => String(ctx.locale?.getSnapshot?.().active || '').startsWith('en') ? 'en' : 'zh';
  const t = (zh, en) => language() === 'en' ? en : zh;
  const preferences = name => state?.preferences.packages[name] || { checkEnabled: true, autoInstall: false, deferredUntil: 0, ignoredVersion: null };
  const originalRow = name => state?.rows.find(row => row.name === name);
  const rowFor = name => { const row = originalRow(name); return row?.bundledBy ? originalRow(row.bundledBy) : row; };
  const activeJob = () => ['verifying', 'installing', 'cancelling'].includes(state?.job?.state);
  function notify() { shared.hold = manualOperation || activeJob(); for (const listener of listeners) listener(); for (const listener of pool.viewListeners) listener(); }
  async function api(body = { action: 'state' }) {
    const controller = new AbortController(); requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), body.action === 'check' ? 95000 : 45000);
    try {
      const response = await fetch(route, { method: 'POST', credentials: 'same-origin', cache: 'no-store', signal: controller.signal, headers: { 'content-type': 'application/json', 'x-stardustlc-updates': '1' }, body: JSON.stringify(body) });
      let data; try { data = await response.json(); } catch { throw new Error('service-unavailable'); }
      if (!response.ok || !data.ok) throw new Error(response.status === 403 ? 'owner-required' : data.code || 'service-unavailable');
      return data.value;
    } catch (error) { if (error?.name === 'AbortError') throw new Error('service-unavailable'); throw error; }
    finally { clearTimeout(timeout); requests.delete(controller); }
  }
  function pageState(manual = manualOperation) {
    const values = [...pool.values.values()], nativeForm = __stardustUpdatesNativeFormState(document);
    const dialog = [...document.querySelectorAll('[role="dialog"],dialog[open]')].some(node => node.getClientRects().length && !(manual && (node.closest('.plugin-updates-footer') || node.querySelector('.plugin-updates-footer'))));
    return { action: 'heartbeat', id, dirty: nativeForm.dirty || values.some(value => value.dirty), busy: nativeForm.busy || values.some(value => value.busy) || dialog, idleForMs: Math.min(86400000, Math.max(0, Date.now() - lastInteraction)) };
  }
  const heartbeat = () => api(pageState());
  function interaction() { lastInteraction = Date.now(); if (registered && alive) void heartbeat().catch(() => {}); }
  const guardChanged = () => { if (registered && alive) void heartbeat().catch(() => {}); };
  for (const event of ['pointerdown', 'keydown', 'input']) document.addEventListener(event, interaction, { capture: true, passive: true });
  pool.listeners.add(guardChanged);
  const close = () => { void fetch(route, { method: 'POST', credentials: 'same-origin', keepalive: true, headers: { 'content-type': 'application/json', 'x-stardustlc-updates': '1' }, body: JSON.stringify({ action: 'client-close', id }) }).catch(() => {}); };
  window.addEventListener('pagehide', close);
  async function refresh() { const next = await api(); if (alive) { state = __stardustUpdatesDisplayRows(__stardustUpdatesSuiteRows(next, shared.refs.values()), knownRows); notify(); } return next; }
  function useSnapshot() {
    const [, render] = useState(0);
    useEffect(() => { const fn = () => render(value => value + 1); listeners.add(fn); const stop = ctx.locale?.subscribe?.(fn); return () => { listeners.delete(fn); stop?.(); }; }, []);
    return state;
  }
  function message(code) {
    return ({
      'page-dirty': t('有未保存的修改。请先保存或放弃修改，再更新。', 'Save or discard unsaved changes before updating.'),
      'page-busy': t('有页面操作或对话框尚未结束，请完成后再试。', 'Finish the active page operation or close its dialog, then retry.'),
      'page-not-ready': t('还有窗口状态未确认，或旧版插件尚未提供状态保护。请刷新相关窗口，必要时先手动更新旧版插件。', 'A window state is unknown or an older plugin lacks state protection. Refresh the affected windows and manually update legacy plugins if needed.'),
      busy: t('DSH 正在执行任务或安装，请等操作结束。', 'DSH is running a task or installation. Wait for it to finish.'),
      'activity-unknown': t('无法确认任务是否空闲，已暂停安装。', 'Installation paused because task activity is unknown.'),
      'restart-required': t('更新服务需要重启后继续。请在方便时手动重启 DSH。', 'The updater needs a restart. Restart DSH manually when convenient.'),
      'operation-unconfirmed': t('上次安装未确认或恢复失败。请在官方插件管理中检查并修复，之后手动重启 DSH。', 'The last installation is unconfirmed or recovery failed. Check and repair it in native plugin management, then restart DSH manually.'),
      'check-first': t('检查结果已过期，请重新检查。', 'This check expired. Check again.'),
      'release-changed': t('发布信息已变化，本次未安装。请重新检查。', 'Release metadata changed. Nothing was installed; check again.'),
      'preferences-conflict': t('另一个窗口修改了偏好，已刷新，请重试。', 'Preferences changed in another window. They have been refreshed; retry.'),
      'preferences-unreadable': t('更新偏好文件无法读取，自动安装已关闭。请检查当前 profile 的 stardustlc-plugin-updates.json。', 'Preferences could not be read. Automatic installation is off. Check stardustlc-plugin-updates.json in this profile.'),
      'no-update': t('版本已变化或暂不兼容，请重新检查。', 'The version changed or is incompatible. Check again.'),
      'source-not-registry': t('本地源码、Git 等安装，请通过原安装方式更新。', 'Update local, Git and other external sources through their original installation method.'),
      'managed-by-suite': t('这个插件随 Suite 安装，通过 Suite 更新。', 'This plugin was installed through Suite and is updated through Suite.'),
      'owner-required': t('只有 profile 拥有者能管理更新。', 'Only the profile owner can manage updates.'),
    })[code] || t('操作未完成，请刷新后重试。DSH 不会因此自动重启。', 'The operation could not be completed. Refresh and retry. DSH will not restart automatically.');
  }
  // releaseOf() keeps the failing engine/peer range check as a stable code; say which
  // environment has to change instead of only reporting that the release is incompatible.
  function requirement(release) {
    return ({
      'dsh-version': t('需要换成与该版本匹配的 DSH 本体', 'it needs a different DSH version'),
      'node-version': t('需要换成与该版本匹配的 Node.js', 'it needs a different Node.js version'),
      deprecated: t('作者已把这个版本标记为弃用', 'the author marked this release as deprecated'),
      'not-bundle': t('这个版本不是可加载的 DSH 插件包', 'this release is not a loadable DSH plugin bundle'),
    })[release?.reason] || t('发布元数据的兼容范围与当前环境不符', 'its published compatibility range does not match this environment');
  }
  function jobLabel(job) {
    return ({ verifying: t('正在核对版本', 'Verifying release'), installing: t('正在安装', 'Installing'), cancelling: t('正在请求取消', 'Requesting cancellation'), complete: t('已更新', 'Updated'), 'restart-required': t('已安装，等待你手动重启', 'Installed; manual restart needed'), restored: t('更新未成功，已恢复原版本', 'Update failed; previous version restored'), 'restore-failed': t('恢复未成功，请检查官方插件管理', 'Recovery failed; check native plugin management'), unknown: t('结果未确认，请检查官方插件管理', 'Result unconfirmed; check native plugin management'), cancelled: t('已取消', 'Cancelled'), failed: t('更新未成功', 'Update failed') })[job.state] || job.state;
  }
  function FooterFrame({ name, label, subtitle, actions, children }) {
    return h('section', { className: 'dshw plugin-updates-footer', 'data-plugin-update-footer': name, 'aria-label': label + t(' · 版本与更新', ' · Version and updates') },
      h('style', null, W.styles),
      h('style', null, '.plugin-updates-footer{box-sizing:border-box;flex-shrink:0;margin-top:28px;padding-top:18px;border-top:1px solid var(--dsw-alias-border-l3,#e5e7eb);min-width:0;max-width:100%;color:var(--dsw-alias-label-primary,#202124)}.plugin-updates-footer .updates-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px}.plugin-updates-footer h2{font-size:14px;line-height:22px;margin:0;font-weight:600}.plugin-updates-footer .updates-subtitle,.plugin-updates-footer .updates-version{font:12px/1.6 ui-monospace,monospace;overflow-wrap:anywhere;margin:4px 0}.plugin-updates-footer .updates-options{margin-top:12px}.plugin-updates-footer .updates-options>summary{cursor:pointer;font-size:12px;line-height:22px;color:var(--dsw-alias-label-secondary,#657080)}.plugin-updates-footer .updates-options>summary:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#6b79df);outline-offset:4px}.plugin-updates-footer .updates-settings{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px;padding:14px 0 0}.plugin-updates-footer .updates-note{margin:5px 0 0;font-size:12px;line-height:1.6}.plugin-updates-footer>.w-section{margin:10px 0 0;padding:0;border:0}.plugin-updates-footer .w-toolbar{margin-top:10px!important}.plugin-updates-footer .w-switch-label{max-width:100%;gap:12px;align-items:flex-start}.plugin-updates-footer .w-switch-track{flex-shrink:0}.plugin-updates-footer .updates-notes{margin-top:12px;padding:12px;border:1px solid var(--dsw-alias-border-l3,#e5e7eb);border-radius:10px}.plugin-updates-footer .updates-notes pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:240px;overflow:auto;font:12px/1.7 ui-monospace,monospace}.plugin-updates-footer .w-overlay{z-index:1002}@media(max-width:600px){.plugin-updates-footer .updates-head{gap:8px}.plugin-updates-footer .w-toolbar{gap:6px;flex-wrap:wrap}.plugin-updates-footer .w-button{max-width:100%}}'),
      h('div', { className: 'updates-head' }, h('div', null, h('h2', null, t('版本与更新', 'Version and updates')), h('p', { className: 'updates-subtitle w-muted' }, subtitle)), actions), children);
  }
  function Panel({ name }) {
    const snapshot = useSnapshot(), [error, setError] = useState(''), [working, setWorking] = useState(false), [checking, setChecking] = useState(false), [dialog, setDialog] = useState(null), [notes, setNotes] = useState(null), [notesOpen, setNotesOpen] = useState(false), [loadingNotes, setLoadingNotes] = useState(false);
    const row = rowFor(name), original = originalRow(name), target = row?.name || name, prefs = preferences(target), job = snapshot?.job?.name === target ? snapshot.job : null;
    async function perform(callback) { setError(''); setWorking(true); try { await callback(); await refresh(); } catch (error) { setError(error.message); await refresh().catch(() => {}); } finally { setWorking(false); } }
    async function save(changes, consent) { await api({ action: 'preferences', name: target, revision: state.preferences.revision, changes, consent }); }
    async function check() { setError(''); setChecking(true); try { await api({ action: 'check', name: target }); await refresh(); } catch (error) { setError(error.message); } finally { setChecking(false); } }
    async function install() {
      setDialog(null); manualOperation = true; notify();
      await perform(async () => {
        try {
          await heartbeat();
          const started = await api({ action: 'install', name: row.name, version: row.release.version, confirmation: 'update-installed-plugin' });
          while (alive) {
            await new Promise(resolve => setTimeout(resolve, 800)); await heartbeat(); await refresh();
            if (state.job?.id !== started.id) throw new Error('operation-unconfirmed');
            if (!activeJob()) break;
          }
        } finally { manualOperation = false; notify(); }
      });
    }
    async function showNotes() {
      if (notesOpen) { setNotesOpen(false); return; }
      setNotesOpen(true); setNotes(null); setLoadingNotes(true); setError('');
      try { setNotes(await api({ action: 'notes', name: target, version: row.release.version })); } catch (error) { setError(error.message); } finally { setLoadingNotes(false); }
    }
    if (!snapshot || !row) return h(W.Status, null, t('此插件尚未安装或已从当前 profile 移除。', 'This plugin is not installed in the current profile.'));
    const title = language() === 'en' ? original.labelEn : original.label;
    const ownPage = pageState(true), unconfirmed = ['unknown', 'restore-failed'].includes(snapshot.job?.state), pageBusy = ownPage.busy || (snapshot.pages.clients || []).some(client => client.id !== id && client.busy), installLocked = working || activeJob() || unconfirmed || snapshot.updaterRestart || snapshot.preferenceError || !snapshot.activity.known || snapshot.activity.busy || snapshot.pages.dirty || ownPage.dirty || pageBusy || !snapshot.pages.known;
    const checkingThis = checking || snapshot.checkingNames?.includes(target);
    const status = row.sourceKind !== 'registry' ? t('本地 / 外部来源，保留原安装方式', 'Local / external source; keep original install method') : row.loadError ? t('加载异常，请先检查官方插件管理', 'Loading error; check native plugin management') : row.error ? t('检查失败，可以重试', 'Check failed; retry available') : row.release && !row.release.compatible ? t('新版本暂不兼容当前环境：', 'Latest release is incompatible with this environment: ') + requirement(row.release) : row.available ? (prefs.ignoredVersion === row.release.version ? t('已忽略提醒，仍可手动更新', 'Reminder ignored; manual update available') : t('有新版本', 'Update available')) : row.checkedAt ? t('当前已是最新稳定版', 'Latest stable version') : t('尚未检查', 'Not checked yet');
    return h(FooterFrame, { name, label: title, subtitle: original.name + ' · ' + original.version, actions: h(W.Button, { icon: 'refresh', disabled: checkingThis || row.sourceKind !== 'registry', onClick: check }, checkingThis ? t('正在检查…', 'Checking…') : target === '@stardustlc/dsh-suite' ? t('检查整包更新', 'Check Suite updates') : t('检查更新', 'Check for updates')) },
      original.bundledBy && h(W.Status, null, t('此插件随 Suite 安装。以下设置与安装作用于 Suite 整包，以保持组件版本一致。单独安装的插件可以独立更新。', 'This plugin was installed through Suite. These controls update Suite as a package so its components stay consistent. Independently installed plugins update individually.')),
      h('section', { className: 'w-section' }, (original.bundledBy || row.available) && h('p', { className: 'updates-version' }, target + ' · ' + row.version, row.release?.version && row.release.version !== row.version ? ' → ' + row.release.version : ''), h('p', { className: 'w-muted updates-note' }, status), !row.enabled && h('p', { className: 'w-muted' }, t('当前已停用，更新后仍保持停用。', 'Currently disabled; it will remain disabled after updating.')), row.checkedAt && h('p', { className: 'w-muted updates-note' }, t('上次检查：', 'Last checked: ') + new Date(row.checkedAt).toLocaleString(language() === 'en' ? 'en-US' : 'zh-CN')),
        h('div', { className: 'w-toolbar' }, row.available && row.sourceKind === 'registry' && h(W.Button, { variant: 'primary', icon: 'download', disabled: installLocked || row.loadError, onClick: () => setDialog('install') }, target === '@stardustlc/dsh-suite' ? t('更新 Suite 整包', 'Update whole Suite') : t('更新此插件', 'Update this plugin')), row.release && h(W.Button, { variant: 'ghost', onClick: showNotes, 'aria-expanded': notesOpen }, t('更新记录', 'Release notes')), row.available && h(W.Button, { variant: 'ghost', disabled: working, onClick: () => perform(() => api({ action: 'later', name: target, revision: state.preferences.revision })) }, t('明天再提醒', 'Remind me tomorrow')), row.available && prefs.ignoredVersion !== row.release.version && h(W.Button, { variant: 'ghost', disabled: working, onClick: () => perform(() => api({ action: 'ignore', name: target, revision: state.preferences.revision, version: row.release.version })) }, t('忽略此版本提醒', 'Ignore this reminder')))),
      notesOpen && h('section', { className: 'updates-notes', 'aria-label': t('更新记录', 'Release notes') }, h('strong', null, target + ' · ' + (notes?.version || row.release?.version || '')), loadingNotes ? h('p', null, t('正在读取…', 'Loading…')) : notes?.text ? h('pre', null, notes.text) : h('p', null, t('未找到此版本的独立更新记录。', 'No separate notes were found for this version.')), notes?.url && h('a', { href: notes.url, target: '_blank', rel: 'noreferrer noopener' }, t('查看仓库更新记录', 'View repository changelog'))),
      h('details', { className: 'updates-options' }, h('summary', null, t('更新选项', 'Update options'), ' · ', prefs.checkEnabled ? t('自动检查：开', 'Checks: on') : t('自动检查：关', 'Checks: off'), ' · ', prefs.autoInstall ? t('自动安装：开', 'Install: on') : t('自动安装：关', 'Install: off')), h('section', { className: 'updates-settings', 'aria-label': t('这个插件的更新偏好', 'Update preferences for this plugin') },
        h('div', null, h(W.Switch, { label: t('自动检查这个插件的更新', 'Automatically check this plugin'), checked: prefs.checkEnabled, disabled: working || !!snapshot.preferenceError || row.sourceKind !== 'registry', onChange: event => perform(() => save({ checkEnabled: event.target.checked })) }), h('p', { className: 'w-muted updates-note' }, t('默认开启，每天最多一次。只影响这个插件，关闭后仍可手动检查。', 'On by default, at most once daily. This affects only this plugin; manual checks remain available.'))),
        h('div', null, h(W.Switch, { label: t('空闲时自动安装这个插件的补丁', 'Install patches for this plugin while idle'), checked: prefs.autoInstall, disabled: working || !!snapshot.preferenceError || row.sourceKind !== 'registry', onChange: event => event.target.checked ? setDialog('automatic') : perform(() => save({ autoInstall: false })) }), h('p', { className: 'w-muted updates-note' }, t('默认关闭。明确开启后，仅空闲且没有未保存修改时安装兼容补丁。其他插件的开关不变。', 'Off by default. Explicitly enable compatible patches while idle with no unsaved changes. Other plugins’ settings stay unchanged.'))))),
      error && h(W.Status, { tone: 'error' }, message(error)), snapshot.preferenceError && h(W.Status, { tone: 'error' }, message('preferences-unreadable')),
      snapshot.pendingRestart && h(W.Status, null, snapshot.updaterRestart ? message('restart-required') : t('已有更新等待手动重启后生效。你可以继续工作，自动安装已暂停。', 'Some updates need a manual restart. Continue your work; automatic installation is paused.')),
      prefs.autoInstall && snapshot.autoReady === false && h(W.Status, null, message('page-not-ready')),
      snapshot.pages.clients.some(client => !client.fresh) && h(W.Status, null, h('p', null, t('有窗口已断开，无法确认是否还有未保存修改。仍在使用的窗口请先保存并刷新；已关闭的窗口可以手动重新确认。', 'A disconnected window may contain unsaved changes. Save and refresh windows still in use. If they are closed, you can confirm that manually.')), h(W.Button, { onClick: () => setDialog('windows') }, t('重新确认已关闭的窗口', 'Confirm closed windows'))),
      (snapshot.pages.dirty || ownPage.dirty) && h(W.Status, null, message('page-dirty')), (snapshot.activity.busy || pageBusy) && h(W.Status, null, message(snapshot.activity.busy ? 'busy' : 'page-busy')),
      prefs.deferredUntil > Date.now() && h(W.Status, null, t('此插件已推迟提醒和自动安装 24 小时，仍可手动更新。', 'Reminders and automatic installation for this plugin are deferred for 24 hours. Manual updates remain available.')),
      unconfirmed && h(W.Status, { tone: 'error' }, message('operation-unconfirmed')),
      job && h('section', { className: 'w-section', 'aria-label': t('这个插件的更新进度', 'Update progress for this plugin') }, h('h3', null, jobLabel(job)), h('p', { className: 'w-muted' }, job.from + ' → ' + job.to + (job.mode === 'automatic' ? t(' · 自动补丁更新', ' · Automatic patch') : '')), (job.reason || job.outcome?.result?.error?.code) && h(W.Status, { tone: 'error' }, message(job.reason || job.outcome.result.error.code)), activeJob() && h(W.Button, { disabled: job.state === 'cancelling', onClick: () => perform(() => api({ action: 'cancel', id: job.id })) }, t('取消更新', 'Cancel update')), h('p', { className: 'w-muted updates-note' }, t('安装开始后，取消由官方包管理器处理；已落盘的写入以实际结果或恢复状态为准。', 'After installation starts, the native package manager handles cancellation. Completed writes and recovery are reported as they occur.'))),
      dialog && h(W.Dialog, { title: dialog === 'windows' ? t('断开的窗口都已关闭？', 'Are the disconnected windows closed?') : dialog === 'automatic' ? t('允许这个插件自动安装补丁？', 'Allow automatic patches for this plugin?') : t('确认更新此插件', 'Confirm this plugin update'), closeLabel: t('关闭', 'Close'), onClose: () => setDialog(null) },
        target === '@stardustlc/dsh-suite' && h('p', null, t('此处操作的是 Suite 整包，包含 18 个组件。独立安装的其他插件不受影响。', 'This action applies to the whole Suite, including its 18 components. Other independently installed plugins are unaffected.')),
        dialog === 'windows' ? h('div', { className: 'w-stack' }, h('p', null, t('只清除超过 45 秒未回应的其他窗口记录。请先确认它们已经关闭；仍在使用的窗口请保存修改并刷新。当前或仍在回应的窗口保护会保留。', 'Only other windows silent for over 45 seconds are cleared. Confirm that they are closed; save and refresh windows still in use. Current and responsive windows remain protected.')), h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('取消', 'Cancel')), h(W.Button, { onClick: () => { setDialog(null); void perform(() => api({ ...pageState(true), action: 'reconfirm-windows', confirmation: 'other-stale-windows-are-closed' })); } }, t('已关闭，重新确认状态', 'They are closed; reconfirm')))) :
        dialog === 'automatic' ? h('div', { className: 'w-stack' }, h('p', null, (language() === 'en' ? row.labelEn : row.label) + ' · ' + target), h('p', null, t('你正在主动启用这个插件的自动安装。只处理兼容的稳定补丁；有任务、未保存修改、未知窗口或等待重启时暂停。', 'You are explicitly enabling automatic installation for this plugin. Only compatible stable patches qualify; running tasks, unsaved changes, unknown windows or a pending restart pause it.')), h('p', null, t('不会自动重启 DSH，其他插件不会跟着开启。可随时关闭。', 'DSH will not restart automatically, and other plugins will not be enabled for automatic updates. Turn it off anytime.')), h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('保持关闭', 'Keep off')), h(W.Button, { variant: 'primary', onClick: () => { setDialog(null); void perform(() => save({ checkEnabled: true, autoInstall: true }, 'enable-idle-patch-updates')); } }, t('允许此插件自动安装补丁', 'Allow patches for this plugin')))) :
        h('div', { className: 'w-stack' }, h('p', { className: 'updates-version' }, target + ': ' + row.version + ' → ' + row.release.version), h('p', null, t('通过 DSH 官方插件管理器安装。需要重启时，由你手动决定时间；停用状态会保留。', 'Install through DSH’s native plugin manager. Choose when to restart if needed; disabled status is preserved.')), h('p', { className: 'w-muted' }, t('来源：npm 官方 registry，网络不可达时回退 npmmirror。安装前再次核对版本与完整性。', 'Source: official npm registry, with npmmirror fallback if unreachable. Version and integrity are checked again before installation.')), (ownPage.dirty || snapshot.pages.dirty) && h(W.Status, null, message('page-dirty')), h('div', { className: 'w-toolbar' }, h(W.Button, { onClick: () => setDialog(null) }, t('取消', 'Cancel')), h(W.Button, { variant: 'primary', disabled: installLocked || row.loadError, onClick: install }, t('确认安装此版本', 'Install this version')))))
    );
  }
  function NativeFooter({ subject }) {
    const snapshot = useSnapshot(), name = __stardustUpdatesDetailName(subject, snapshot?.rows || []);
    return name ? h(Panel, { name }) : null;
  }
  function Reminder() {
    useSnapshot();
    const row = state?.rows.find(row => { const prefs = preferences(row.name); return row.available && !row.updating && !row.bundledBy && prefs.checkEnabled && prefs.deferredUntil <= Date.now() && prefs.ignoredVersion !== row.release.version && !notified.has(row.name + '@' + row.release.version); });
    if (!row && !legacyHint) return null;
    let Toast; try { Toast = require('@deepseek-ai/dsh-client-ui-primitives').Toast; } catch { return null; }
    if (!Toast) return null;
    const hint = legacyHint, key = hint ? 'legacy-' + hint : row.name + '@' + row.release.version;
    return h(Toast, { key, text: hint ? hint + t('：请打开「插件」中的此插件详情页，在底部管理更新。', ': open its details in Plugins to manage updates at the bottom.') : (language() === 'en' ? row.labelEn : row.label) + t('有新版本，可在页面底部查看。', ' has an update. Review it at the bottom of its page.'), icon: h(W.Icon, { name: 'refresh', size: 18 }), holdMs: 7000, onDone: () => { if (hint) legacyHint = null; else notified.add(key); notify(); } });
  }
  function register() {
    if (!alive) return;
    if (!registered) {
      registered = true; pool.clients.add(client);
      ctx.slots.inject('plugins.detail.section', () => ctx.slots.register({ name: 'plugins.detail.section', id: 'stardustlc.plugin-update-footer', order: 1000 }, NativeFooter));
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'stardustlc.plugin-update-reminder' }, Reminder));
      notify();
    }
  }
  async function poll() {
    if (inPoll || !alive || !shared.refs.size) return;
    inPoll = true;
    try { await refresh(); register(); await heartbeat(); }
    catch { /* Owner-only controls stay absent for guests and unsupported hosts. */ }
    finally { inPoll = false; }
  }
  const timer = setInterval(() => { void poll(); }, 15000), first = setTimeout(() => { void poll(); }, 100);
  const client = { t, Footer: Panel, Button: W.Button, open(name) { const footer = [...document.querySelectorAll('[data-plugin-update-footer]')].find(node => node.getAttribute('data-plugin-update-footer') === name); if (footer) footer.scrollIntoView({ block: 'end', behavior: 'smooth' }); else { legacyHint = name; notify(); } }, has: name => registered && !!originalRow(name), row: rowFor, dispose() {
    close(); alive = false; clearTimeout(first); clearInterval(timer); pool.clients.delete(client);
    pool.listeners.delete(guardChanged); listeners.clear();
    for (const event of ['pointerdown', 'keydown', 'input']) document.removeEventListener(event, interaction, true);
    window.removeEventListener('pagehide', close);
    for (const controller of requests) controller.abort();
    for (const listener of pool.viewListeners) listener();
  } };
  return client;
}

/* STARDUSTLC_UPDATE_CLIENT_BODY_START */
window.__ModuleLoader__.load(__stardustUpdatesWrap({id:"dsh-ffmpeg",factory:require=>({apply(){}})},{"name":"dsh-ffmpeg","version":"0.1.0","hasWorkbench":false,"packageVersion":"0.7.6","label":"FFmpeg","labelEn":"FFmpeg","suiteComponent":true,"sectionIds":[],"iconData":"data:image/webp;base64,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"}));

/* STARDUSTLC_UPDATE_CLIENT_BODY_END */
})();
