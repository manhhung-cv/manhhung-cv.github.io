(() => {
  'use strict';

  let isProtectionEnabled = true;
  const pageOrigin = location.origin;
  const originalOpen = window.open;
  const nativeFakeRegistry = new WeakSet();

  // 1. NGỤY TRANG FUNCTION NATIVE (Spoof Function.prototype.toString)
  const originalToString = Function.prototype.toString;
  const spoofedToString = function () {
    if (nativeFakeRegistry.has(this)) {
      return `function ${this.name || ''}() { [native code] }`;
    }
    return originalToString.call(this);
  };
  nativeFakeRegistry.add(spoofedToString);
  Function.prototype.toString = spoofedToString;

  function disguiseAsNative(fn, name) {
    nativeFakeRegistry.add(fn);
    try {
      Object.defineProperty(fn, 'name', { value: name, configurable: true, writable: false });
    } catch (_) {}
    return fn;
  }

  // Báo cáo hành vi chặn về tầng ISOLATED Bridge
  function dispatchBlockEvent(type, detailUrl) {
    window.dispatchEvent(new CustomEvent('__nopp_blocked__', {
      detail: JSON.stringify({
        type,
        url: String(detailUrl || ''),
        at: Date.now()
      })
    }));
  }

  // Nhận tín hiệu đồng bộ cấu hình từ ISOLATED Bridge
  window.addEventListener('__nopp_sync_config__', (e) => {
    let payload = e.detail;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (_) { return; }
    }
    if (payload && typeof payload.enabled === 'boolean') {
      isProtectionEnabled = payload.enabled;
    }
  });

  // 2. CAN THIỆP WINDOW.OPEN & BẢO VỆ CHỐNG IFRAME TRAMPOLINE
  function protectedWindowOpen(url, name, features) {
    if (!isProtectionEnabled) {
      return originalOpen.call(window, url, name, features);
    }

    const targetName = String(name || '').trim().toLowerCase();
    const isSelfNav = targetName === '_self' || targetName === '_top' || targetName === '_parent';

    // Cho phép điều hướng nội bộ hợp lệ
    if (isSelfNav) {
      try {
        const dest = new URL(url, location.href);
        if (dest.origin === pageOrigin) {
          return originalOpen.call(window, url, name, features);
        }
      } catch (_) {}
    }

    dispatchBlockEvent('window.open', url || 'about:blank');
    return null;
  }

  disguiseAsNative(protectedWindowOpen, 'open');
  window.open = protectedWindowOpen;

  // Khóa khả năng tạo iframe trắng để lấy lại window.open nguyên mẫu
  const originalCreateElement = document.createElement;
  document.createElement = function (tagName, options) {
    const el = originalCreateElement.call(document, tagName, options);
    if (String(tagName).toLowerCase() === 'iframe') {
      const protoGetter = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')?.get;
      if (protoGetter) {
        Object.defineProperty(el, 'contentWindow', {
          get() {
            const win = protoGetter.call(this);
            if (win && win.open !== protectedWindowOpen) {
              try { win.open = protectedWindowOpen; } catch (_) {}
            }
            return win;
          },
          configurable: true
        });
      }
    }
    return el;
  };
  disguiseAsNative(document.createElement, 'createElement');

  // 3. CAN THIỆP THẺ <a> VÀ CLICK-JACKING OVERLAYS
  document.addEventListener('click', (e) => {
    if (!isProtectionEnabled) return;

    // A. Bắt link ngoài tự mở tab mới hoặc javascript: URI
    const anchor = e.target.closest('a');
    if (anchor) {
      const rawHref = anchor.getAttribute('href') || '';
      const target = (anchor.getAttribute('target') || '').trim().toLowerCase();

      if (/^javascript:/i.test(rawHref) && !/^javascript:\s*(void\(0\);?|;?)$/i.test(rawHref)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        dispatchBlockEvent('javascript-link', rawHref);
        return false;
      }

      if (target === '_blank' && anchor.href) {
        try {
          const dest = new URL(anchor.href, location.href);
          if (dest.origin !== pageOrigin) {
            e.preventDefault();
            e.stopImmediatePropagation();
            dispatchBlockEvent('external-tab', anchor.href);
            return false;
          }
        } catch (_) {}
      }
    }

    // B. Xóa lớp phủ bẫy click tàng hình (Invisible Overlay)
    const targetNode = e.target;
    if (targetNode && targetNode !== document.body && targetNode !== document.documentElement) {
      const style = window.getComputedStyle(targetNode);
      const isFixed = style.position === 'fixed' || style.position === 'absolute';
      const zIndex = parseInt(style.zIndex, 10) || 0;

      if (isFixed && zIndex > 9999) {
        const rect = targetNode.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (rect.width >= vw * 0.9 && rect.height >= vh * 0.9 && targetNode.children.length === 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          targetNode.style.setProperty('display', 'none', 'important');
          targetNode.style.setProperty('pointer-events', 'none', 'important');
          dispatchBlockEvent('click-overlay', location.href);
          return false;
        }
      }
    }
  }, true);

  // 4. BẮT ĐIỀU HƯỚNG TỰ ĐỘNG BẰNG NAVIGATION API
  if (window.navigation?.addEventListener) {
    window.navigation.addEventListener('navigate', (e) => {
      if (!isProtectionEnabled) return;
      const destination = e.destination?.url;
      if (!destination) return;

      try {
        const dest = new URL(destination, location.href);
        if (dest.origin !== pageOrigin && e.userInitiated === false && e.cancelable) {
          e.preventDefault();
          dispatchBlockEvent('programmatic-redirect', destination);
        }
      } catch (_) {}
    });
  }
})();