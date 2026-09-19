/**
 * Single Instance Lock Enforcer for Web / PWA Applications
 * Uses Web Locks API (navigator.locks) to restrict execution to a single tab/instance per machine.
 */
(function () {
  const LOCK_NAME = 'app_single_instance_lock';

  function renderDuplicateNotice() {
    // Stop body scrolling if possible
    if (document.documentElement) document.documentElement.style.overflow = 'hidden';
    if (document.body) document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.id = 'single-instance-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(15, 23, 42, 0.95);
      color: #ffffff;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
    `;

    overlay.innerHTML = `
      <div style="max-width: 480px; background: #1e293b; padding: 32px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; color: #f8fafc;">应用已在运行中</h2>
        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
          为了防止数据同步冲突，一台机器或浏览器中只能运行一个应用实例。请切换到已打开的标签页，或者关闭其他标签页后重试。
        </p>
        <button id="retry-single-instance-btn" style="
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        ">刷新并重新尝试</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const retryBtn = document.getElementById('retry-single-instance-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        window.location.reload();
      });
      retryBtn.addEventListener('mouseover', () => {
        retryBtn.style.backgroundColor = '#1d4ed8';
      });
      retryBtn.addEventListener('mouseout', () => {
        retryBtn.style.backgroundColor = '#2563eb';
      });
    }
  }

  async function initSingleInstanceLock() {
    if (!('locks' in navigator)) {
      console.warn('[SingleInstance] Web Locks API is not supported in this browser environment.');
      return;
    }

    try {
      await navigator.locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
        if (!lock) {
          console.warn('[SingleInstance] Duplicate instance detected. Restricting execution.');
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', renderDuplicateNotice);
          } else {
            renderDuplicateNotice();
          }
          return;
        }

        console.log('[SingleInstance] Single instance lock acquired successfully.');

        // Keep lock held until document is unloaded / closed
        await new Promise(() => {});
      });
    } catch (err) {
      console.error('[SingleInstance] Error requesting Web Lock:', err);
    }
  }

  initSingleInstanceLock();
})();
