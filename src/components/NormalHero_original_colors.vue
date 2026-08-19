<script setup lang="ts">
import { 
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import FoxysLandingVideo from '../assets/Foxys_LandingVideo.mp4'
  
interface HeroStar {
  id: number
  left: string
  top: string
  delay: string
}

const heroStars: HeroStar[] = Array.from(
  { length: 22 },
  (_, index) => ({
    id: index,
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 7 + 2) % 18}%`,
    delay: `${(index % 9) * 0.42}s`,
  }),
)

const heroIsOpen = ref(false)
const heroStatusText = ref('Checking hours…')

let heroStatusInterval: number | undefined

function updateHeroStatus(): void {
  const hourPart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Puerto_Rico',
    hour: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .find((part) => part.type === 'hour')

  const hour = Number(hourPart?.value ?? 0)

  heroIsOpen.value =
    hour >= 9 || hour < 2

  heroStatusText.value = heroIsOpen.value
    ? 'Open now · 9:00 AM – 2:00 AM daily'
    : 'Closed now · Opens 9:00 AM · 9:00 AM – 2:00 AM daily'
}
onMounted(() => {
  updateHeroStatus()

  heroStatusInterval = window.setInterval(
    updateHeroStatus,
    60_000,
  )
})

onBeforeUnmount(() => {
  if (heroStatusInterval !== undefined) {
    window.clearInterval(heroStatusInterval)
  }
}) 
</script>

<template>
  <header
    id="home"
    class="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#06191c] px-4 pb-20 pt-32.5 text-center sm:px-6"
  >
    <!-- Background video -->
    <video
      class="pointer-events-none absolute inset-0 z-0 size-full object-cover"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      aria-hidden="true"
    >
      <source
        :src="FoxysLandingVideo"
        type="video/mp4"
      />
    </video>

    <!-- Video overlay -->
    <div
      class="pointer-events-none absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(6,25,28,0.55)_0%,rgba(6,25,28,0.35)_45%,rgba(6,25,28,0.75)_100%)]"
      aria-hidden="true"
    ></div>

    <!-- Stars -->
    <div
      class="pointer-events-none absolute inset-0 z-2"
      aria-hidden="true"
    >
      <span
        v-for="star in heroStars"
        :key="star.id"
        class="hero-star absolute rounded-full bg-beige"
        :style="{
          left: star.left,
          top: star.top,
          animationDelay: star.delay,
        }"
      ></span>
    </div>

    <!-- Hero content -->
    <div class="relative z-10 mx-auto max-w-225">
      <h1
        class="font-display text-[clamp(2.5rem,7.2vw,3.9rem)] font-normal uppercase leading-[1.05] tracking-[0.01em] text-beige [text-shadow:0_4px_0_rgba(0,0,0,0.15)]"
      >
        Come as you are

        <br />

        <em class="font-inherit italic text-gold">
          Stay till the music stops
        </em>
      </h1>

      <p
        class="mx-auto mt-4.5 max-w-180 font-body text-[clamp(1.22rem,2.1vw,1.6rem)] font-medium leading-[1.6] text-beige"
      >
        Pouring rum and hosting the best parties since 1968.

        <br class="hidden sm:block" />

        Open every day, all day, into the night.
      </p>

      <!-- Opening status -->
      <div
        class="mt-8.5 inline-flex items-center gap-2 rounded-full border border-beige/20 bg-[rgba(4,26,31,0.55)] px-4.5 py-2.25 font-mono text-[0.96rem] tracking-wider text-beige backdrop-blur"
        :class="{
          'hero-status-closed': !heroIsOpen,
        }"
        aria-live="polite"
      >
        <span
          class="size-2 rounded-full"
          :class="
            heroIsOpen
              ? 'bg-[#4ADE80]'
              : 'bg-coral'
          "
          aria-hidden="true"
        ></span>

        <span>
          {{ heroStatusText }}
        </span>
      </div>
    </div>

    <!-- Scroll cue -->
    <button
      type="button"
      class="absolute bottom-5.5 left-1/2 z-10 -translate-x-1/2 font-mono text-[0.3rem] uppercase tracking-[0.16em] text-beige/90"
    >
      <span class="hero-scroll-cue flex flex-col items-center gap-1">
        <span>Scroll</span>

        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 5v14m0 0-6-6m6 6 6-6"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </span>
    </button>
  </header>
</template>
<style scoped>
.hero-scroll-cue {
  animation: hero-scroll-bounce 1.6s ease-in-out infinite;
}

@keyframes hero-scroll-bounce {
  0%,
  100% {
    transform: translateY(-4px);
  }

  50% {
    transform: translateY(10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-scroll-cue {
    animation: none;
  }
}
</style>