// Inline script to set theme before first paint and suppress extension message-port drops
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('rd-theme');
        var theme = (stored === 'dark') ? 'dark' : 'light';
        document.documentElement.classList.add(theme);
      } catch(e) {
        document.documentElement.classList.add('light');
      }

      // Suppress unhandled Chrome extension port/message channel disconnect warnings
      if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', function(event) {
          if (event && event.reason && typeof event.reason.message === 'string') {
            if (
              event.reason.message.indexOf('A listener indicated an asynchronous response') !== -1 ||
              event.reason.message.indexOf('message channel closed') !== -1
            ) {
              event.preventDefault();
            }
          }
        });
      }
    })();
  `;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
