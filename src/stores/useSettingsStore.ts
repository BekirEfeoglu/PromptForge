import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMConnectionMode, LLMProvider, LLMSettings } from '@/types';

function encode(value: string): string {
  if (!value) return '';
  return btoa(encodeURIComponent(value));
}

function decode(value: string): string {
  if (!value) return '';
  try {
    return decodeURIComponent(atob(value));
  } catch {
    return value;
  }
}

interface SettingsStore {
  llm: LLMSettings;
  setProvider: (provider: LLMProvider) => void;
  setConnectionMode: (mode: LLMConnectionMode) => void;
  setProxyUrl: (url: string) => void;
  setApiKey: (provider: LLMProvider, key: string) => void;
  setModel: (provider: LLMProvider, model: string) => void;
  getApiKey: (provider: LLMProvider) => string;
  isConfigured: () => boolean;
}

const DEFAULT_LLM_SETTINGS: LLMSettings = {
  provider: 'openai',
  api_mode: 'direct',
  proxy_url: '',
  openai_key: '',
  anthropic_key: '',
  openai_model: 'gpt-4o',
  anthropic_model: 'claude-sonnet-4-6',
};

function normalizeLlmSettings(settings: Partial<LLMSettings> | undefined): LLMSettings {
  return {
    ...DEFAULT_LLM_SETTINGS,
    ...settings,
    provider: settings?.provider === 'anthropic' ? 'anthropic' : 'openai',
    api_mode: settings?.api_mode === 'proxy' ? 'proxy' : 'direct',
  };
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      llm: DEFAULT_LLM_SETTINGS,

      setProvider: (provider) =>
        set((state) => ({ llm: { ...normalizeLlmSettings(state.llm), provider } })),

      setConnectionMode: (mode) =>
        set((state) => ({ llm: { ...normalizeLlmSettings(state.llm), api_mode: mode } })),

      setProxyUrl: (url) =>
        set((state) => ({ llm: { ...normalizeLlmSettings(state.llm), proxy_url: url.trim() } })),

      setApiKey: (provider, key) =>
        set((state) => ({
          llm: {
            ...normalizeLlmSettings(state.llm),
            [`${provider}_key`]: encode(key),
          },
        })),

      setModel: (provider, model) =>
        set((state) => ({
          llm: {
            ...normalizeLlmSettings(state.llm),
            [`${provider}_model`]: model,
          },
        })),

      getApiKey: (provider) => {
        const llm = normalizeLlmSettings(get().llm);
        return decode(provider === 'openai' ? llm.openai_key : llm.anthropic_key);
      },

      isConfigured: () => {
        const llm = normalizeLlmSettings(get().llm);
        if (llm.api_mode === 'proxy') return llm.proxy_url.trim().length > 0;
        const key = llm.provider === 'openai' ? llm.openai_key : llm.anthropic_key;
        return !!key;
      },
    }),
    {
      name: 'promptforge-settings',
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SettingsStore> | undefined;
        return {
          ...current,
          ...persistedState,
          llm: normalizeLlmSettings(persistedState?.llm),
        };
      },
    }
  )
);
