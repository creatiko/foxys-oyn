<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import FoxysLandingVideo from '../assets/Foxys_LandingVideo.mp4'
import FoxysLogo from '@/components/FoxysLogo.vue'

interface HeroStar {
  id: number
  left: string
  top: string
  size: number
  delay: string
  duration: string
}

const heroStars: HeroStar[] = Array.from(
  { length: 28 },
  (_, index) => ({
    id: index,
    left: `${(index * 37 + 11) % 100}%`,
    top: `${(index * 17 + 3) % 72}%`,
    size: 2 + (index % 3),
    delay: `${(index % 9) * 0.4}s`,
    duration: `${2.2 + (index % 5) * 0.35}s`,
  }),
)

const videoRef = ref<HTMLVideoElement | null>(null)
const isMuted = ref(true)

// const heroRoot = ref<HTMLElement | null>(null)
// const heroVideo = ref<HTMLVideoElement | null>(null)

const heroIsOpen = ref(false)

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
}

function toggleSound(): void {
  const video = videoRef.value

  if (!video) {
    return
  }

  video.muted = !video.muted
  isMuted.value = video.muted
}

// function scrollPastHero(): void {
//   heroRoot.value?.nextElementSibling?.scrollIntoView({
//     behavior: 'smooth',
//     block: 'start',
//   })
// }

function scrollDown(): void {
  const hero = document.querySelector<HTMLElement>('#home')

  if (!hero) {
    return
  }

  window.scrollTo({
    top: hero.offsetTop + hero.offsetHeight,
    behavior: 'smooth',
  })
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

  const video = videoRef.value

  if (video) {
    video.pause()
  }

})
</script>

<template>
  <header
    id="home"
    class="relative flex min-h-svh w-full items-end justify-start overflow-hidden px-[clamp(20px,9.6vw,185px)] pb-[clamp(88px,11.8vh,128px)] pt-32.5 text-left"
  >
    <!-- Background video -->
    <video
      ref="videoRef"
      class="pointer-events-none absolute inset-0 z-0 size-full object-cover object-[50%_30%]"
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
      class="pointer-events-none absolute inset-0 z-1 [background:var(--hero-video-overlay)]"
      aria-hidden="true"
    ></div>
    

    <!-- Stars -->    
    <div
      class="stars pointer-events-none absolute inset-0 z-2"
      aria-hidden="true"
    >
      <span
        v-for="star in heroStars"
        :key="star.id"
        class="hero-star absolute rounded-full bg-white"
        :style="{
          left: star.left,
          top: star.top,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDelay: star.delay,
          animationDuration: star.duration,
        }"
      ></span>
    </div>

    <!-- Hero content -->
    <div
      class="relative z-10 flex flex-col items-center px-5 text-center pb-5 xs:pb-8"
    >
      <!-- Foxy's logo -->
      <FoxysLogo color="white" width="350" />

      <!-- Hours --> <!-- Opening status -->
      <div
        class="mt-8.5 inline-flex items-center gap-2 rounded-full border border-beige/20 bg-[rgba(4,26,31,0.55)] px-4.5 py-2.25 font-navigation text-[1.15rem] tracking-tight text-surface backdrop-blur"
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

        <span v-if="heroIsOpen">
          Open now &bull;
        </span>          
        <span v-else>
          Closed now &bull; Opens 
        </span>
        9:00 <span class="text-0.70rem">AM</span> &mdash;
        2:00 <span class="text-0.70rem">AM</span> daily
      </div>
    </div>

    <!-- Ocean waves -->
    <div
      class="ocean pointer-events-none absolute inset-x-0 bottom-0 z-5 h-30 overflow-hidden sm:h-38"
      aria-hidden="true"
    >
      <!-- Back wave -->
      <svg
        class="wave wave3 absolute bottom-0 left-0 h-full w-[200%]"
        viewBox="0 0 3200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,100 C200,150 400,50 600,100 C800,150 1000,50 1200,100 C1400,150 1500,80 1600,100 L1600,200 L0,200 Z"
          fill="#0E7C86"
        />

        <path
          d="M1600,100 C1800,150 2000,50 2200,100 C2400,150 2600,50 2800,100 C3000,150 3100,80 3200,100 L3200,200 L1600,200 Z"
          fill="#0E7C86"
        />
      </svg>

      <!-- Middle wave -->
      <svg
        class="wave wave2 absolute bottom-0 left-0 h-full w-[200%]"
        viewBox="0 0 3200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,120 C220,70 420,160 620,110 C820,60 1020,150 1220,110 C1400,80 1500,120 1600,110 L1600,200 L0,200 Z"
          fill="#0A5F68"
        />

        <path
          d="M1600,110 C1820,70 2020,160 2220,110 C2420,60 2620,150 2820,110 C3000,80 3100,120 3200,110 L3200,200 L1600,200 Z"
          fill="#0A5F68"
        />
      </svg>

      <!-- Front wave -->
      <svg
        class="wave wave1 absolute bottom-0 left-0 h-full w-[200%]"
        viewBox="0 0 3200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,140 C250,100 450,170 650,130 C850,90 1050,160 1250,130 C1400,110 1500,140 1600,130 L1600,200 L0,200 Z"
          fill="#073F47"
        />

        <path
          d="M1600,130 C1850,100 2050,170 2250,130 C2450,90 2650,160 2850,130 C3000,110 3100,140 3200,130 L3200,200 L1600,200 Z"
          fill="#073F47"
        />
      </svg>
    </div>

    <!-- Scroll cue -->
    <div
      class="scroll-cue absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-navigation text-[1.15rem] font-normal uppercase tracking-[0.16em] text-white"
    >
      <div class="hero-scroll-cue flex flex-col items-center gap-1"
      @click="scrollDown">
        <span
          class="uppercase tracking-[0.16em] text-inverse/90"
        >
          Scroll
        </span>

        <svg
          class="size-4 text-inverse/90"
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
      </div>
    </div>

    <!-- Sound control -->
    <button
      type="button"
      class="sound-btn absolute top-25 right-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-[#063038]/40 px-3 py-2 text-white backdrop-blur-md sm:right-7"
      :aria-pressed="!isMuted"
      :aria-label="
        isMuted
          ? 'Unmute video sound'
          : 'Mute video sound'
      "
      @click="toggleSound"
    >
      <span
        class="sound-ico"
        aria-hidden="true"
      >
        <svg
          v-if="isMuted"
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            d="M11 5 6 9H3v6h3l5 4V5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <path
            d="m18 9 4 4m0-4-4 4"
            stroke-linecap="round"
          />
        </svg>

        <svg
          v-else
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            d="M11 5 6 9H3v6h3l5 4V5Z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <path
            d="M15 9.5a4 4 0 0 1 0 5"
            stroke-linecap="round"
          />

          <path
            d="M17.5 7a7 7 0 0 1 0 10"
            stroke-linecap="round"
          />
        </svg>
      </span>

      <span
        class="sound-words flex items-center gap-1 text-[1.15rem] font-navigation font-black tracking-wider"
        aria-hidden="true"
      >
        <span
          class="sound-word"
          :class="{
            'opacity-100 text-accent': !isMuted,
            'opacity-45': isMuted,
          }"
        >
          On
        </span>

        <span class="sound-sep opacity-50">
          /
        </span>

        <span
          class="sound-word"
          :class="{
            'opacity-100 text-accent': isMuted,
            'opacity-45': !isMuted,
          }"
        >
          Off
        </span>
      </span>
    </button>
  </header>
</template>

<style scoped>
.hero-video-overlay {
  background:
    linear-gradient(
      180deg,
      rgba(6, 48, 56, 0.16) 0%,
      rgba(6, 48, 56, 0.12) 40%,
      rgba(6, 48, 56, 0.34) 100%
    );
}

.hero-logo-large {
  display: block;
  width: clamp(230px, 38vw, 520px);
  height: auto;
}

.hero-logo-large svg{
  fill:red;
}

.hero-star {
  opacity: 0.65;
  box-shadow: 0 0 7px rgba(255, 255, 255, 0.75);
  animation-name: hero-star-twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.wave3 {
  animation: wave-drift-back 18s linear infinite;
}

.wave2 {
  animation: wave-drift-middle 14s linear infinite;
}

.wave1 {
  animation: wave-drift-front 10s linear infinite;
}

.hero-scroll-cue{
  text-shadow: 0 0 3px rgba(4, 16, 20, 1), 0 0 10px rgba(4, 16, 20, 0.95), 0 0 22px rgba(4, 16, 20, 0.85);
  animation: scroll-bounce 1.6s ease-in-out infinite;
}

@keyframes hero-star-twinkle {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.75);
  }

  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes wave-drift-back {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@keyframes wave-drift-middle {
  from {
    transform: translateX(-50%);
  }

  to {
    transform: translateX(0);
  }
}

@keyframes wave-drift-front {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@keyframes scroll-bounce {
  0%,
  100% {
    transform: translateY(-2px);
  }

  50% {
    transform: translateY(7px);
  }
}

@media (max-width: 640px) {

  .hero-logo-large {
    width: min(76vw, 330px);
  }

  .sound-btn {
    bottom: 1.25rem;
  }

  .scroll-cue {
    bottom: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-star,
  .wave,
  .scroll-arrow {
    animation: none;
  }
}
</style>
