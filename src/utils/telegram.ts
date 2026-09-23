export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramWebAppInstance {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
  };
  ready(): void;
  expand(): void;
  close(): void;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebAppInstance;
    };
  }
}

export function getTelegramWebApp(): TelegramWebAppInstance | undefined {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return undefined;
}

export function isTelegramWebAppContext(): boolean {
  const tg = getTelegramWebApp();
  return !!(tg && tg.initData && tg.initDataUnsafe && tg.initDataUnsafe.user);
}
