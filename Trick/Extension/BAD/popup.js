document.addEventListener('DOMContentLoaded', () => {
  const disableDebugger = document.getElementById('disableDebugger');
  const restoreHotkeys = document.getElementById('restoreHotkeys');

  // Đọc cấu hình đã lưu
  chrome.storage.local.get(['disableDebugger', 'restoreHotkeys'], (res) => {
    if (res.disableDebugger !== undefined) disableDebugger.checked = res.disableDebugger;
    if (res.restoreHotkeys !== undefined) restoreHotkeys.checked = res.restoreHotkeys;
  });

  // Lưu cấu hình khi thay đổi
  const save = () => {
    chrome.storage.local.set({
      disableDebugger: disableDebugger.checked,
      restoreHotkeys: restoreHotkeys.checked
    });
  };

  disableDebugger.addEventListener('change', save);
  restoreHotkeys.addEventListener('change', save);
});