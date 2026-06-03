/**
 * Helper to handle dynamic browser viewport scaling and bypass benign ResizeObserver notifications.
 */

export function setupResizeObserverAndViewport() {
  if (typeof window === 'undefined') return;

  // Bypass ResizeObserver notifications in development & production
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('ResizeObserver loop completed with undelivered notifications') || 
      args[0]?.includes?.('ResizeObserver loop limit exceeded')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    if (
      e.message?.includes?.('ResizeObserver loop completed with undelivered notifications') || 
      e.message?.includes?.('ResizeObserver loop limit exceeded')
    ) {
      e.stopImmediatePropagation();
    }
  });

  // Calculate high accuracy viewport height for mobile keyboards
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  // Return a cleanup callback for react effects
  return () => {
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  };
}
