import type { MouseEvent } from 'react';

export function tiltCard(event: MouseEvent<HTMLElement>) {
  if (window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  element.style.setProperty('--mx', `${x * 100}%`);
  element.style.setProperty('--my', `${y * 100}%`);
  element.style.transform = `perspective(900px) rotateX(${(y - .5) * -3}deg) rotateY(${(x - .5) * 3}deg)`;
}

export function resetCard(event: MouseEvent<HTMLElement>) {
  event.currentTarget.style.transform = '';
}