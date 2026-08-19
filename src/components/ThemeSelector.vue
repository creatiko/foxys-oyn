<script setup lang="ts">
import {
  useFoxysTheme,
  type FoxysTheme,
} from '@/composables/useFoxysTheme'

const {
  activeTheme,
  themes,
  applyTheme,
} = useFoxysTheme()

function handleThemeChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  applyTheme(target.value as FoxysTheme)
}
</script>

<template>
  <label
    v-if="themes.length > 1"
    class="inline-flex items-center gap-2 font-navigation text-xs font-bold uppercase tracking-[0.08em] text-navbar-foreground"
  >
    <span class="sr-only">Theme</span>

    <select
      :value="activeTheme"
      aria-label="Choose website theme"
      class="min-h-9 rounded-full border border-navbar-border bg-navbar px-3 py-1.5 text-navbar-foreground outline-none backdrop-blur transition hover:border-navbar-foreground focus:border-secondary-hover focus:ring-2 focus:ring-secondary-hover/40"
      @change="handleThemeChange"
    >
      <option
        v-for="theme in themes"
        :key="theme.value"
        :value="theme.value"
        class="bg-surface-strong text-inverse"
      >
        {{ theme.label }}
      </option>
    </select>
  </label>
</template>
