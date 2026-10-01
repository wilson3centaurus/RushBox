type IconName =
  | "home"
  | "cart"
  | "orders"
  | "user"
  | "truck"
  | "package"
  | "bag"
  | "search"
  | "back"
  | "plus"
  | "minus"
  | "star"
  | "pin"
  | "clock"
  | "phone"
  | "chat"
  | "check"
  | "chevron"
  | "bell"
  | "wallet"
  | "users"
  | "chart"
  | "store"
  | "settings"
  | "logout"
  | "camera"
  | "close"
  | "bike"
  | "receipt"
  | "shield"
  | "flag"
  | "tag"
  | "menu"
  | "zap"
  | "layers"
  | "edit"
  | "trash"
  | "id";

const PATHS: Record<IconName, string> = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20a1 1 0 0 0 1 1H9.5v-5.5h5V21h3a1 1 0 0 0 1-1V9.5",
  cart: "M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6M9 20.5h.01M17 20.5h.01",
  orders: "M5 4.5h14v15l-3.5-2-3.5 2-3.5-2-3.5 2v-15ZM9 9h6M9 13h6",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5a7.5 7.5 0 0 1 15 0",
  truck: "M3 6.5h10.5v10H3zM13.5 10h3.8l2.7 3v3.5h-6.5zM7 19.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM17 19.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z",
  package: "m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3ZM4 7.2 12 11.5l8-4.3M12 11.5V21",
  bag: "M6 8h12l1 12.5H5L6 8ZM9 8V6.5a3 3 0 0 1 6 0V8",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16.2 16.2 21 21",
  back: "M15 5.5 8.5 12l6.5 6.5",
  plus: "M12 5.5v13M5.5 12h13",
  minus: "M5.5 12h13",
  star: "m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8L12 4Z",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2",
  phone: "M6.5 3.5 9 4l1.2 3.6-1.8 1.5a11.5 11.5 0 0 0 5.5 5.5l1.5-1.8L18.9 14l.6 2.5a2 2 0 0 1-2.1 2.5A14.5 14.5 0 0 1 4 5.6a2 2 0 0 1 2.5-2.1Z",
  chat: "M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5v-10Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  chevron: "m9 5.5 6.5 6.5L9 18.5",
  bell: "M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5ZM10 19a2.2 2.2 0 0 0 4 0",
  wallet: "M4 7.5h13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h11M16 13h.01",
  users: "M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M17.5 14.2a6.5 6.5 0 0 1 4 5.8",
  chart: "M4 20V4M4 20h16M8 17V11M12.5 17V7M17 17v-4",
  store: "M4 9.5 5.5 4.5h13L20 9.5M4 9.5h16M4 9.5v10h16v-10M4 9.5a2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.8-1.6L13.3 2h-4l-.4 2.9a7 7 0 0 0-2.8 1.6l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 3.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.8 1.6l.4 2.9h4l.4-2.9a7 7 0 0 0 2.8-1.6l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12Z",
  logout: "M14 7.5V5.5h-9v13h9v-2M10.5 12H21M18 8.5l3.5 3.5-3.5 3.5",
  camera: "M4 8h3.5l1.5-2h6l1.5 2H20v11H4V8ZM12 16.5a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z",
  close: "M6 6l12 12M18 6 6 18",
  bike: "M6 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM18 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM6 15.5h6l4-8.5h-3M14 7h3.5l1.5 8.5",
  receipt: "M6 3.5h12v17l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5v-16ZM9.5 8h5M9.5 12h5",
  shield: "m12 3 7 2.5v6c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5v-6L12 3ZM9 12l2 2 4-4",
  flag: "M6 21V4M6 4.5h10l-1.5 3.5L16 11.5H6",
  tag: "M4 12.5V4.5h8l8 8-8 8-8-8ZM8.5 9h.01",
  menu: "M4 7h16M4 12h16M4 17h16",
  zap: "M13.5 3 5.5 13.5h5L10 21l8-10.5h-5L13.5 3Z",
  layers: "M12 3.5 21 8.5l-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  trash: "M4.5 7h15M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  id: "M3.5 5.5h17v13h-17v-13ZM8.5 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 16c.6-1.7 1.6-2.5 3-2.5s2.4.8 3 2.5M14 10h4M14 13.5h3",
};

const FILLED: Partial<Record<IconName, boolean>> = { star: true, zap: true };

export function Icon({
  name,
  className = "w-5 h-5",
  strokeWidth = 1.7,
  filled,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  const isFilled = filled ?? FILLED[name] ?? false;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={isFilled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export type { IconName };
