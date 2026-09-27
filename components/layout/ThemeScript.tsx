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

      // Suppress unhandled Chrome extension port/message channel disconnect warnings (e.g., Adobe Acrobat, React DevTools)
      if (typeof window !== 'undefined') {
        var isExtensionChannelNoise = function(err) {
          if (!err) return false;
          var msg = '';
          try {
            msg = (typeof err === 'string')
              ? err
              : (err.message || err.description || err.stack || String(err));
          } catch(e) {
            msg = '';
          }
          return (
            msg.indexOf('A listener indicated an asynchronous response') !== -1 ||
            msg.indexOf('message channel closed before a response was received') !== -1 ||
            msg.indexOf('AdobeClean') !== -1
          );
        };

        // 1. Intercept unhandled promise rejections in capture phase
        window.addEventListener('unhandledrejection', function(event) {
          if (event && isExtensionChannelNoise(event.reason)) {
            try {
              event.preventDefault();
              if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
              }
            } catch(e) {}
          }
        }, true);

        // 2. Intercept uncaught error events in capture phase
        window.addEventListener('error', function(event) {
          if (event && (isExtensionChannelNoise(event.message) || isExtensionChannelNoise(event.error))) {
            try {
              event.preventDefault();
              if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
              }
            } catch(e) {}
            return true;
          }
        }, true);

        // 3. Filter console.error from extension bridge drops
        try {
          var origConsoleError = console.error;
          console.error = function() {
            for (var i = 0; i < arguments.length; i++) {
              if (isExtensionChannelNoise(arguments[i])) {
                return;
              }
            }
            return origConsoleError.apply(console, arguments);
          };
        } catch(e) {}
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
