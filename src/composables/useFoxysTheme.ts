import { readonly, ref } from 'vue'

export type FoxysTheme = 'tropical-v1'

export interface FoxysThemeOption {
  value: FoxysTheme
  label: string
}

const STORAGE_KEY = 'foxys-theme'

export const foxysThemes: FoxysThemeOption[] = [
  {
    value: 'tropical-v1',
    label: "Foxy's Tropical V1",
  },
]

const activeTheme = ref<FoxysTheme>('tropical-v1')

function isFoxysTheme(value: string | null): value is FoxysTheme {
  return foxysThemes.some((theme) => theme.value === value)
}

function applyTheme(theme: FoxysTheme): void {
  activeTheme.value = theme

  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme)
  }
}

function loadTheme(): void {
  const savedTheme =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null

  applyTheme(isFoxysTheme(savedTheme) ? savedTheme : 'tropical-v1')
}

export function useFoxysTheme() {
  return {
    activeTheme: readonly(activeTheme),
    themes: foxysThemes,
    applyTheme,
    loadTheme,
  }
}
