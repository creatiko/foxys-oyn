<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    rating: number | null
    size?: number
  }>(),
  {
    size: 24,
  },
)

function getStarFill(index: number): number {
  const rating = props.rating ?? 0
  const amount = rating - index

  return Math.max(
    0,
    Math.min(100, amount * 100),
  )
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1"
    role="img"
    :aria-label="`${rating ?? 0} out of 5 stars`"
  >
    <span
      v-for="index in 5"
      :key="index"
      class="relative inline-block shrink-0"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
      }"
    >
      <!-- Empty star -->
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        class="absolute inset-0 block"
        :width="size"
        :height="size"
      >
        <path
          d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.47 6.14 20.56l1.12-6.54L2.51 9.39l6.56-.95L12 2.5z"
          fill="rgba(255,237,160,0.25)"
          stroke="#FFEDA0"
          stroke-width="1.25"
          stroke-linejoin="round"
        />
      </svg>

      <!-- Filled portion -->
      <span
        class="absolute inset-y-0 left-0 overflow-hidden"
        :style="{
          width: `${getStarFill(index - 1)}%`,
        }"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          class="absolute left-0 top-0 block max-w-none"
          :width="size"
          :height="size"
        >
          <path
            d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.54L12 17.47 6.14 20.56l1.12-6.54L2.51 9.39l6.56-.95L12 2.5z"
            fill="#FFEDA0"
            stroke="#FFEDA0"
            stroke-width="1.25"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </span>
  </div>
</template>