(() => {
  'use strict';

  const STORAGE_KEYS = Object.freeze({
    WHITELIST: 'nopp_whitelist_domains',
    STATS: 'nopp_blocked_stats'
  });

  function getRegistrableDomain(hostname) {
    if (!hostname) return '';
    const cleanHost = String(hostname).toLowerCase().trim().replace(/^\[|\]$/g, '');
    if (cleanHost === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(cleanHost)) {
      return cleanHost;
    }
    const parts = cleanHost.split('.').filter(Boolean);
    if (parts.length <= 2) return parts.join('.');

    const secondLevelTlds = new Set(['com', 'edu', 'gov', 'net', 'org', 'co', 'ac']);
    if (parts.length >= 3 && secondLevelTlds.has(parts[parts.length - 2])) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }

  globalThis.NoPPShared = Object.freeze({
    STORAGE_KEYS,
    getRegistrableDomain
  });
})();