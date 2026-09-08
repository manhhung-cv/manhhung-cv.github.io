(function() {
  // 1. Vô hiệu hóa việc tạo constructor Function chứa debugger
  const OriginalFunction = window.Function;
  window.Function = function(...args) {
    if (args.length > 0) {
      const body = args[args.length - 1];
      if (typeof body === 'string' && body.includes('debugger')) {
        // Thay thế nội dung hàm bằng no-op
        args[args.length - 1] = body.replace(/debugger/g, '');
      }
    }
    return OriginalFunction.apply(this, args);
  };
  window.Function.prototype = OriginalFunction.prototype;

  // 2. Ngăn chặn việc chặn sự kiện bàn phím và chuột phải
  const captureStop = function(e) {
    // Cho phép F12 (123) hoặc tổ hợp Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    const isDevKey = e.keyCode === 123 || 
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key?.toUpperCase()));

    if (isDevKey || e.type === 'contextmenu') {
      e.stopImmediatePropagation();
    }
  };

  window.addEventListener('keydown', captureStop, true);
  window.addEventListener('keyup', captureStop, true);
  window.addEventListener('contextmenu', captureStop, true);

  // 3. Khôi phục menu chuột phải nếu bị thuộc tính inline chặn
  document.addEventListener('DOMContentLoaded', () => {
    document.oncontextmenu = null;
    document.onkeydown = null;
  });
})();