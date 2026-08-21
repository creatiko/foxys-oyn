<script setup lang="ts">
import { computed } from 'vue'

import sandBg from '@/assets/sand/sand-bg.webp'
import sandMask from '@/assets/sand/sand-mask.webp'

const props = withDefaults(
  defineProps<{
    topColor?: string
    bottomColor?: string
    position?: string
  }>(),
  {
    topColor: 'transparent',
    bottomColor: 'transparent',
    position: '0%',
  },
)

const separatorStyle = computed(() => ({
  '--sand-bg': `url("${sandBg}")`,
  '--sand-mask': `url("${sandMask}")`,
  '--sd-a': props.topColor,
  '--sd-b': props.bottomColor,
  '--sd-x': props.position,
}))
</script>

<template>
  <div
    class="sand-divider"
    :style="separatorStyle"
    aria-hidden="true"
  />
</template>