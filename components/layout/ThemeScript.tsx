// Inline script to set theme before first paint — prevents flash
// This runs as a raw <script> injected into <head>
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('rd-theme');
        var theme = (stored === 'dark' || stored === 'light') ? stored : 'light';
        document.documentElement.classList.add(theme);
      } catch(e) {
        document.documentElement.classList.add('light');
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
