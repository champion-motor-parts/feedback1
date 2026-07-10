@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f8f7f5;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(217, 121, 45, 0.1), transparent 34rem),
    #f8f7f5;
  color: #201816;
  font-family: Arial, Helvetica, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.table-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
}

.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2;
}

.animate-enter {
  animation: enter-up 260ms ease-out both;
}

.animate-enter-delayed {
  animation: enter-up 320ms ease-out 80ms both;
}

.pressable {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.pressable:active {
  transform: scale(0.98);
}

.celebration-layer {
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.celebration-piece {
  position: absolute;
  top: -12px;
  left: var(--x);
  width: var(--w);
  height: var(--h);
  border-radius: 3px;
  background: var(--c);
  opacity: 0;
  transform: translate3d(0, -20px, 0) rotate(0deg);
  animation: confetti-fall var(--d) ease-in var(--delay) forwards;
}

.firework {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid var(--c);
  opacity: 0;
  animation: firework-pop 760ms ease-out var(--delay) forwards;
}

@keyframes enter-up {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes confetti-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -20px, 0) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--drift), 105vh, 0) rotate(var(--r));
  }
}

@keyframes firework-pop {
  0% {
    opacity: 0;
    transform: scale(0.2);
    box-shadow:
      0 0 0 0 var(--c),
      0 0 0 0 var(--c),
      0 0 0 0 var(--c);
  }
  25% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(5);
    box-shadow:
      18px 0 0 -1px var(--c),
      -18px 0 0 -1px var(--c),
      0 18px 0 -1px var(--c),
      0 -18px 0 -1px var(--c);
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }

  .celebration-layer {
    display: none;
  }
}
