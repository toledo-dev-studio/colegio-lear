export const COLOR_PALETTE = [
    { bg: "bg-sky-500/20", border: "border-sky-500/60", dot: "bg-sky-500", text: "text-sky-700 dark:text-sky-300" },
    { bg: "bg-emerald-500/20", border: "border-emerald-500/60", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
    { bg: "bg-violet-500/20", border: "border-violet-500/60", dot: "bg-violet-500", text: "text-violet-700 dark:text-violet-300" },
    { bg: "bg-rose-500/20", border: "border-rose-500/60", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
    { bg: "bg-amber-500/20", border: "border-amber-500/60", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
    { bg: "bg-teal-500/20", border: "border-teal-500/60", dot: "bg-teal-500", text: "text-teal-700 dark:text-teal-300" },
    { bg: "bg-indigo-500/20", border: "border-indigo-500/60", dot: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300" },
    { bg: "bg-pink-500/20", border: "border-pink-500/60", dot: "bg-pink-500", text: "text-pink-700 dark:text-pink-300" },
];

/**
 * Return a color for a calendar item according the unique identifier to not use same color
 * @param id Calendar item id
 * @returns Color for specific id
 */
export const colorOf = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;    
    return COLOR_PALETTE[h % COLOR_PALETTE.length];
};

export const getRandomColor = (): (typeof COLOR_PALETTE)[number] => {
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};