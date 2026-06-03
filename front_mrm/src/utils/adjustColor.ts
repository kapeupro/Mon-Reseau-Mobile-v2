import { useThemeStore } from '@/store/themes';

export const adjustColor = (color: string) => {
  const theme = useThemeStore.getState().theme;

  if (theme === 'default') {
    return color;
  }

  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  r = Math.min(r + 20, 255);
  g = Math.min(g + 20, 255);
  b = Math.min(b + 20, 255);

  if (theme === 'monochrome') {
    r = Math.min(r + 100, 255);
  }

  if (theme === 'deuteranomalie') {
    g = Math.min(g + 100, 255);
  }

  if (theme === 'protanomalie') {
    b = Math.min(b + 100, 255);
  }

  const newR = r.toString(16).padStart(2, '0');
  const newG = g.toString(16).padStart(2, '0');
  const newB = b.toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
};
