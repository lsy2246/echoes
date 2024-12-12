export function hashString(str: string): number {
  str = str.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getColorScheme(name: string) {
  const colorSchemes = [
    {
      name: "amber",
      bg: "bg-[--amber-a3]",
      text: "text-[--amber-11]",
      border: "border-[--amber-a6]",
    },
    {
      name: "blue",
      bg: "bg-[--blue-a3]",
      text: "text-[--blue-11]",
      border: "border-[--blue-a6]",
    },
    {
      name: "crimson",
      bg: "bg-[--crimson-a3]",
      text: "text-[--crimson-11]",
      border: "border-[--crimson-a6]",
    },
    {
      name: "cyan",
      bg: "bg-[--cyan-a3]",
      text: "text-[--cyan-11]",
      border: "border-[--cyan-a6]",
    },
    {
      name: "grass",
      bg: "bg-[--grass-a3]",
      text: "text-[--grass-11]",
      border: "border-[--grass-a6]",
    },
    {
      name: "mint",
      bg: "bg-[--mint-a3]",
      text: "text-[--mint-11]",
      border: "border-[--mint-a6]",
    },
    {
      name: "orange",
      bg: "bg-[--orange-a3]",
      text: "text-[--orange-11]",
      border: "border-[--orange-a6]",
    },
    {
      name: "pink",
      bg: "bg-[--pink-a3]",
      text: "text-[--pink-11]",
      border: "border-[--pink-a6]",
    },
    {
      name: "plum",
      bg: "bg-[--plum-a3]",
      text: "text-[--plum-11]",
      border: "border-[--plum-a6]",
    },
    {
      name: "violet",
      bg: "bg-[--violet-a3]",
      text: "text-[--violet-11]",
      border: "border-[--violet-a6]",
    },
  ];

  const index = hashString(name) % colorSchemes.length;
  const scheme = colorSchemes[index];

  return {
    bg: scheme.bg,
    text: scheme.text,
    border: scheme.border,
    hover: `hover:${scheme.bg.replace("3", "4")}`,
    dot: `bg-current`,
  };
}
