export function hashString(str: string): number {
  str = str.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getColorScheme(name: string) {
  const colorSchemes = [
    'amber', 'blue', 'crimson', 'cyan', 'grass',
    'green', 'indigo', 'orange', 'pink', 'purple'
  ];
  
  const index = hashString(name) % colorSchemes.length;
  const color = colorSchemes[index];
  
  return {
    bg: `bg-[--${color}-4]`,
    text: `text-[--${color}-11]`,
    border: `border-[--${color}-6]`,
    hover: `hover:bg-[--${color}-5]`,
    dot: `bg-current`
  };
} 