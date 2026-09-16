// Inline script to set theme before first paint — prevents flash
// Defaults to light mode as specified
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('rd-theme');
        // Default to light mode unless user explicitly chose dark
        var theme = (stored === 'dark') ? 'dark' : 'light';
        document.documentElement.classList.add(theme);
      } catch(e) {
        // Fallback to light mode on any error
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
