*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #ffffff;
  --bg-secondary: #f7f7f5;
  --bg-info: #E6F1FB;
  --text-primary: #1a1a1a;
  --text-secondary: #666660;
  --border: rgba(0,0,0,0.12);
  --border-mid: rgba(0,0,0,0.2);
  --blue: #185FA5;
  --blue-light: #E6F1FB;
  --blue-text: #0C447C;
  --radius-md: 8px;
  --radius-lg: 12px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1c1c1a;
    --bg-secondary: #252523;
    --bg-info: #0C447C;
    --text-primary: #f0ede8;
    --text-secondary: #a09d98;
    --border: rgba(255,255,255,0.1);
    --border-mid: rgba(255,255,255,0.18);
    --blue: #85B7EB;
    --blue-light: #042C53;
    --blue-text: #B5D4F4;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

input, button, select {
  font-family: inherit;
}

button {
  cursor: pointer;
}

a {
  color: var(--blue);
}
