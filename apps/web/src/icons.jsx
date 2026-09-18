import React from 'react';

const I = ({ children, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);

export const IcPlus = (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
export const IcPlusC = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></I>;
export const IcArrowUp = (p) => <I {...p}><path d="M12 19V5m0 0-6 6m6-6 6 6" /></I>;
export const IcMic = (p) => <I {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></I>;
export const IcGauge = (p) => <I {...p}><path d="M4 14a8 8 0 1 1 16 0" /><path d="M12 14 15 9" /></I>;
export const IcShield = (p) => <I {...p}><path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6Z" /><path d="m9 12 2 2 4-4" /></I>;
export const IcRobot = (p) => <I {...p}><rect x="5" y="8" width="14" height="10" rx="3" /><path d="M12 8V5M9 3.5h.01" /><circle cx="12" cy="4" r="1" /><path d="M9.5 12.5v1.5M14.5 12.5v1.5" /></I>;
export const IcSpeaker = (p) => <I {...p}><path d="M4 10v4h3l5 4V6l-5 4Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" /></I>;
export const IcGrid = (p) => <I {...p}><circle cx="7" cy="7" r="2.2" /><circle cx="17" cy="7" r="2.2" /><circle cx="7" cy="17" r="2.2" /><circle cx="17" cy="17" r="2.2" /></I>;
export const IcBell = (p) => <I {...p}><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></I>;
export const IcCompass = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-4 1 2-5Z" /></I>;
export const IcFilter = (p) => <I {...p}><path d="M4 5h16l-6 7v6l-4 2v-8Z" /></I>;
export const IcCollapse = (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9.5 4v16" /></I>;
export const IcChevR = (p) => <I {...p}><path d="m9 6 6 6-6 6" /></I>;
export const IcAt = (p) => <I {...p}><circle cx="12" cy="12" r="4" /><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" /></I>;
export const IcClip = (p) => <I {...p}><path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5L9.5 17.5a2 2 0 0 1-3-3L15 6" /></I>;
export const IcEdit = (p) => <I {...p}><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17Z" /><path d="m13.5 6.5 3 3" /></I>;
export const IcBrain = (p) => <I {...p}><path d="M9.5 3A3.5 3.5 0 0 0 6 6.5c-2 .5-3 2-3 4 0 1.5.7 2.8 2 3.5-.2 2.5 1.5 4.5 4 4.5 1 1.5 3 1.5 3 1.5V4.5S11 3 9.5 3Z" /><path d="M14.5 3A3.5 3.5 0 0 1 18 6.5c2 .5 3 2 3 4 0 1.5-.7 2.8-2 3.5.2 2.5-1.5 4.5-4 4.5-1 1.5-3 1.5-3 1.5V4.5S13 3 14.5 3Z" /></I>;
export const IcPalette = (p) => <I {...p}><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2.2-.9 2.2-2 0-1-.7-1.6-.7-2.5 0-1.1.9-2 2-2h2A3.5 3.5 0 0 0 21 11c0-4.5-4-8-9-8Z" /><circle cx="8" cy="10" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="16" cy="10" r="1" /></I>;
export const IcHelp = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.8.4-.9 1-.9 1.7" /><path d="M12 17v.01" /></I>;
export const IcCoin = (p) => <I {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9M15 9.5c-.6-1-1.7-1.5-3-1.5-1.8 0-3 .9-3 2.2 0 2.8 6 1.6 6 4.3 0 1.3-1.2 2.2-3 2.2-1.3 0-2.4-.5-3-1.5" /></I>;
export const IcScale = (p) => <I {...p}><path d="M12 4v16M8 20h8" /><path d="M5 7h14" /><path d="m5 7-2.5 5a3 3 0 0 0 5 0Z" /><path d="m19 7-2.5 5a3 3 0 0 0 5 0Z" /></I>;
export const IcGem = (p) => <I {...p}><path d="M7 4h10l4 5-9 11L3 9Z" /><path d="M3 9h18M9.5 4 8 9l4 11M14.5 4 16 9l-4 11" /></I>;
export const IcUser = (p) => <I {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.9-3.6 3.7-5.5 7-5.5s6.1 1.9 7 5.5" /></I>;
export const IcKeys = (p) => <I {...p}><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" /></I>;
export const IcSparkUser = (p) => <I {...p}><circle cx="10" cy="8" r="3.2" /><path d="M4 19c.8-3 3.2-4.8 6-4.8" /><path d="M17 4.5 18 8l3.5 1L18 10l-1 3.5L16 10l-3.5-1L16 8Z" /></I>;
export const IcChip = (p) => <I {...p}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" /></I>;
export const IcAssistant = (p) => <I {...p}><circle cx="12" cy="9" r="4" /><path d="M8 9a4 4 0 0 0 8 0" /><path d="M5 20c.9-3.2 3.6-5 7-5s6.1 1.8 7 5" /><path d="M12 5V3.5" /></I>;
export const IcDb = (p) => <I {...p}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></I>;
export const IcApps = (p) => <I {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></I>;
export const IcInfo = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></I>;
export const IcShieldAlert = (p) => <I {...p}><path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6Z" /><path d="M12 8v4M12 15v.01" /></I>;
export const IcTerminal = (p) => <I {...p}><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><path d="m7 9.5 3 3-3 3M12.5 15.5H17" /></I>;
export const IcSearch = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></I>;
export const IcFolder = (p) => <I {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></I>;
export const IcBolt = (p) => <I {...p}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></I>;
export const IcUsers = (p) => <I {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M16 15.5c2.8.2 4.8 1.8 5.5 4.5" /></I>;
export const IcPlug = (p) => <I {...p}><path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5Z" /><path d="M12 16v5" /></I>;
export const IcClock = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></I>;
export const IcGear = (p) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.15-1.45l2-1.55-2-3.46-2.35.95A7 7 0 0 0 14 5.05L13.6 2.5h-3.2L10 5.05a7 7 0 0 0-2.5 1.44l-2.35-.95-2 3.46 2 1.55A7 7 0 0 0 5 12c0 .49.05.97.15 1.45l-2 1.55 2 3.46 2.35-.95A7 7 0 0 0 10 18.95l.4 2.55h3.2l.4-2.55a7 7 0 0 0 2.5-1.44l2.35.95 2-3.46-2-1.55c.1-.48.15-.96.15-1.45Z" /></I>;
export const IcSend = (p) => <I {...p}><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></I>;
export const IcStop = (p) => <I {...p}><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" /></I>;
export const IcCheck = (p) => <I {...p}><path d="m4 12.5 5 5L20 6.5" /></I>;
export const IcWarn = (p) => <I {...p}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.5" /></I>;
export const IcTrash = (p) => <I {...p}><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" /></I>;
export const IcEye = (p) => <I {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></I>;
export const IcDown = (p) => <I {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" /></I>;
export const IcX = (p) => <I {...p}><path d="m5 5 14 14M19 5 5 19" /></I>;
export const IcDoc = (p) => <I {...p}><path d="M6 2.5h8l4 4V21.5H6Z" /><path d="M14 2.5v4h4M9 12h6M9 16h6" /></I>;
export const IcSheet = (p) => <I {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 4v16" /></I>;
export const IcImg = (p) => <I {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m4.5 17 5-5 4 4 3-3 3 3" /></I>;
export const IcRefresh = (p) => <I {...p}><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" /></I>;
export const IcPanel = (p) => <I {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></I>;
export const IcSpark = (p) => <I {...p}><path d="M12 2.5 14 9l6.5 2L14 13.5 12 20l-2-6.5L3.5 11 10 9Z" /></I>;
export const IcFile = (p) => <I {...p}><path d="M6 2.5h8l4 4V21.5H6Z" /></I>;
export const IcChevD = (p) => <I {...p}><path d="m6 9 6 6 6-6" /></I>;

export const Logo = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="7" width="14" height="11" rx="4" fill="currentColor" />
    <rect x="9" y="10.5" width="2" height="4" rx="1" fill="#0b0e0d" />
    <rect x="13" y="10.5" width="2" height="4" rx="1" fill="#0b0e0d" />
    <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
export const IcCloud = (p) => <I {...p}><path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.3 10 4 4 0 0 1 17.5 18Z" /></I>;
export const IcEyeOff = (p) => <I {...p}><path d="M4 4l16 16" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3 3.6M6.4 6.9A17 17 0 0 0 2.5 12S6 18 12 18a9 9 0 0 0 3.5-.7" /></I>;
export const IcArrowUpR = (p) => <I {...p}><path d="M7 17 17 7M9 7h8v8" /></I>;
export const IcPie = (p) => <I {...p}><path d="M12 3a9 9 0 1 0 9 9h-9Z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15Z" /></I>;
export const IcMonitor = (p) => <I {...p}><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M9 20h6M12 16.5V20" /></I>;
export const IcVideo = (p) => <I {...p}><rect x="3" y="6.5" width="13" height="11" rx="2.5" /><path d="m16 10.5 5-3v9l-5-3Z" /></I>;
export const IcWallet = (p) => <I {...p}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 9.5h18M16 14h.01" /></I>;
export const IcMoreH = (p) => <I {...p}><circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.1" fill="currentColor" stroke="none" /></I>;
export const IcArchive = (p) => <I {...p}><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></I>;
export const IcPin = (p) => <I {...p}><path d="M9.5 3.5h5l-.8 6.2 3.3 2.8v1.5H7v-1.5l3.3-2.8Z" /><path d="M12 14v6.5" /></I>;
export const IcPhone = (p) => <I {...p}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></I>;
export const IcStar = (p) => <I {...p}><path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.3-.8Z" /></I>;

/* -------- 侧栏图标 v2（线性圆润，对齐设计稿 1） -------- */
export const IcDo = (p) => <I {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5.2" /><path d="M13.2 7.2 9.6 12.4h2.5l-1 4.4 3.3-5.2h-2.5Z" /></I>;
export const IcRemote = (p) => <I {...p}><rect x="9.5" y="4.5" width="8" height="15" rx="2.4" /><path d="M13 17.2h.01" /><path d="M6.2 9.2a4.6 4.6 0 0 0 0 5.6" /><path d="M15.2 9.3h4.6v3.8h-1.1l-1.4 1.5v-1.5h-2.1Z" /><path d="M16.7 11.2h1.6" /></I>;
export const IcWs = (p) => <I {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><rect x="7.5" y="10.8" width="9" height="6.4" rx="1" /><path d="M7.5 13.6h9M12 10.8v6.4" /></I>;
export const IcMarket = (p) => <I {...p}><path d="M11.6 4.6c1.1 0 1.9.8 1.9 1.8v1.2h3.2a1.4 1.4 0 0 1 1.4 1.4v3.1h1.2c1 0 1.8.8 1.8 1.9s-.8 1.9-1.8 1.9h-1.2v3.1a1.4 1.4 0 0 1-1.4 1.4h-3.2v-1.2c0-1-.8-1.8-1.9-1.8s-1.9.8-1.9 1.8v1.2H6.5a1.4 1.4 0 0 1-1.4-1.4v-3.1H3.9c-1 0-1.8-.8-1.8-1.9s.8-1.9 1.8-1.9h1.2V9a1.4 1.4 0 0 1 1.4-1.4h3.2V6.4c0-1 .8-1.8 1.9-1.8Z" /><path d="m20 2.6.55 1.35L21.9 4.5l-1.35.55L20 6.4l-.55-1.35L18.1 4.5l1.35-.55Z" /></I>;
export const IcTimer = (p) => <I {...p}><circle cx="10.8" cy="10.8" r="7.3" /><path d="M10.8 6.6v4.2l2.7 1.9" /><rect x="14.6" y="14.6" width="6.9" height="6.4" rx="1.4" /><path d="M16.6 13.4v1.9M19.5 13.4v1.9M14.6 17.2h6.9" /></I>;
export const IcLib = (p) => <I {...p}><path d="M4 20.2h16" /><rect x="5.4" y="7.2" width="3" height="13" rx=".8" /><rect x="10" y="5.4" width="3" height="14.8" rx=".8" /><path d="m14.9 8 3.1-.9 3 12-3.1.9Z" /><path d="M6.9 9.6v1.2M11.5 8.2v1.2" /></I>;
export const IcIdea = (p) => <I {...p}><path d="M12 6.8a4.7 4.7 0 0 0-2.6 8.6c.6.5.9 1.1.9 1.9h3.4c0-.8.3-1.4.9-1.9A4.7 4.7 0 0 0 12 6.8Z" /><path d="M10.7 19.6h2.6M11.1 21.6h1.8" /><path d="M12 2.6v1.5M6.2 4.9l1 1M17.8 4.9l-1 1M4.2 10.6h1.5M18.3 10.6h1.5" /></I>;
