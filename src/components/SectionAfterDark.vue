<script setup lang="ts">
import { 
  computed,
  onMounted,
  ref,
} from 'vue'

import {
  formatEntertainmentItem,
  useEntertainmentSchedule,
} from '../composables/useEntertainmentSchedule'


import concertVideo from '../assets/oyn/A001_01010001_C087.mp4'
import concertPoster from '../assets/oyn/A001_01010001_C087.png'
import fireDancePoster from '../assets/why-here/firedance.jpg'
import liveMusicDj from '../assets/live-music-dj.jpg'
import afterDarkMusician from '../assets/live-music/491442100_18498351199050674_8154730713048722083_n.jpg'
// import afterDarkDancing from '../assets/live-music/619908590_18551031658050674_5863142191513110760_n.jpg'
import afterDarkFriends from '../assets/bar/group-at-bar.jpg'
import girlsDancingVideo from '../assets/oyn/C0088_trimmed.mp4'
import girlsDancingPoster from '../assets/oyn/C0088_trimmed.png'
import poolAndBubbles from '../assets/oyn/pool-and-bubbles.jpg'
import ElvisPan from '../assets/live-music/performer_elvis.jpeg'
import IslandBob from '../assets/live-music/performer_island_bob.jpeg'

interface AfterDarkSlide {
  type: 'image' | 'video'
  src: string
  poster?: string
  alt: string
  caption: string
}

const afterDarkSlides: AfterDarkSlide[] = [
  {
    type: 'video',
    src: girlsDancingVideo,
    poster: girlsDancingPoster,
    alt: "Women dancing at Foxy's legendary OYN party",
    caption: "Dancing into the night at Foxy's",
  },
  {
    type: 'video',
    src: concertVideo,
    poster: concertPoster,
    alt: "Concert performance at Foxy's",
    caption: 'Live music and dancing',
  },
  {
    type: 'image',
    src: afterDarkFriends,
    alt: "Group of friends posing together at the bar at Foxy's",
    caption: 'Friends enjoying the night at Foxy\'s',
  },
  {
    type: 'image',
    src: poolAndBubbles,
    alt: "People enjoying the pool and bubbles at Foxy's",
    caption: 'The fun continues with bubbles',
  },
  {
    type: 'image',
    src: liveMusicDj,
    alt: "Live music and DJ performance at Foxy's",
    caption: 'Live music, DJs, and dancing',
  },
]

const activeAfterDarkSlide = ref(0)

const currentAfterDarkSlide = computed(
  () => afterDarkSlides[activeAfterDarkSlide.value],
)

function previousAfterDarkSlide(): void {
  activeAfterDarkSlide.value =
    activeAfterDarkSlide.value === 0
      ? afterDarkSlides.length - 1
      : activeAfterDarkSlide.value - 1
}

function nextAfterDarkSlide(): void {
  activeAfterDarkSlide.value =
    activeAfterDarkSlide.value === afterDarkSlides.length - 1
      ? 0
      : activeAfterDarkSlide.value + 1
}

function selectAfterDarkSlide(index: number): void {
  activeAfterDarkSlide.value = index
}

interface AfterDarkPhoto {
  src: string
  alt: string
}

const afterDarkTopPhotos: AfterDarkPhoto[] = [
  {
    src: fireDancePoster,
    alt: `A fire dancer performing on the sand at Foxy's after dark, with guests watching under string lights`,
  },
  {
    src: afterDarkMusician,
    alt: `A musician performing live at Foxy's after dark, with guests seated under string lights and flags`,
  },
]


const {
  schedule,
  scheduleLoading,
  scheduleError,
  loadEntertainmentSchedule,
} = useEntertainmentSchedule()

const weeklyScheduleDays = computed(() => {
  return schedule.value?.week ?? []
})

interface DailyPerformer {
  id: string
  headlineText: string
  displayText?: string
  image: string
  imageAlt?: string
}

interface Schedule {
  dailyItems: DailyPerformer[]
  // Add your other schedule properties here
}

const dailyPerformerSchedule: Schedule = {
  dailyItems: [
    {
      id: 'daily-performer-1',
      headlineText: 'Elvis',
      displayText: 'Steel pan at lunch',
      image: ElvisPan,
      imageAlt: 'Elvis performing live with his steel pan at Foxy\'s',
    },
    {
      id: 'daily-performer-2',
      headlineText: 'Island Bob',
      displayText: 'Guitar from 4pm',
      image: IslandBob,
      imageAlt: 'Island Bob performing live',
    },
  ],
}

onMounted(() => {
  void loadEntertainmentSchedule()
})
</script>

<template>
<section
        id="after-dark"
        class="relative bg-(image:--section-gradient-yellow) py-20 text-sand sm:py-28"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <!-- Marker -->
          <div class="mb-4.5 inline-flex items-center gap-2.5">
            <span
              class="h-0 w-0 border-y-11 border-y-transparent border-l-18 border-l-sand"
              aria-hidden="true"
            ></span>

            <span
              class="font-mono text-[0.94rem] uppercase tracking-[0.14em] text-sand"
            >
              After Dark
            </span>
          </div>

          <!-- Heading -->
          <h2
            class="max-w-155 font-display text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
          >
            Something's usually happening after dark
          </h2>

          <!-- Top photo grid -->
          <div
            class="mt-6 grid grid-cols-2 gap-3.5"
          >
            <img
              v-for="photo in afterDarkTopPhotos"
              :key="photo.src"
              :src="photo.src"
              :alt="photo.alt"
              loading="lazy"
              class="block h-32.5 w-full rounded-[10px] object-cover shadow-[0_18px_40px_rgba(6,48,56,0.2)] min-[701px]:h-45"
            />
          </div>


          <!-- Daily performers -->
          <section
            v-if="dailyPerformerSchedule?.dailyItems?.length"
            class="border-t border-sand/15 py-4 mt-12"
          >
            <div
              class="grid gap-6 lg:grid-cols-[140px_auto_auto] lg:items-start lg:justify-start"
            >
              <h2
                class="font-label text-2xl font-bold tracking-wide text-sand lg:pt-1"
              >
                Every day
              </h2>

              <article
                v-for="item in dailyPerformerSchedule.dailyItems"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <img
                  :src="item.image"
                  :alt="item.imageAlt || item.headlineText"
                  class="h-33 w-33 shrink-0 rounded-[10px] object-cover"
                  loading="lazy"
                >

                <div class="min-w-0">
                  <h3
                    class="font-label text-2xl font-black leading-tight text-sand"
                  >
                    {{ item.headlineText }}
                  </h3>

                  <p
                    v-if="item.displayText"
                    class="mt-2 font-body text-xl leading-snug text-sand/70"
                  >
                    {{ item.displayText }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <!-- Loading -->
          <div
            v-if="scheduleLoading"
            class="mt-11 border-t border-[rgba(6,48,56,0.16)] py-8 font-body text-[1.2rem] text-sand"
          >
            Loading this week's lineup…
          </div>

          <!-- Schedule -->
          <div
            v-else-if="weeklyScheduleDays.length"
            class="mt-11 flex flex-col border-t border-[rgba(6,48,56,0.16)]"
          >
            <div
              v-for="(day, dayIndex) in weeklyScheduleDays"
              :key="day.dayOfWeek"
              class="flex flex-col items-start gap-2 border-b border-[rgba(8,33,30,0.15)] px-2.5 py-3.5 sm:flex-row sm:gap-6 sm:px-3.5 sm:py-4"
              :class="{
                'bg-navbar-button-border':
                  dayIndex % 2 === 0,
              }"
            >
            
              <!-- Day -->
              <div
                class="shrink-0 font-mono text-[1.2rem] text-black sm:w-35.5 sm:text-[1.3rem]"
              >
                {{ day.dayName }}

                <span
                  v-if="day.badgeText"
                  class="mt-1.75 block w-max rounded-full bg-gold-deep px-2.25 py-0.75 font-mono text-[0.82rem] uppercase tracking-[0.06em] text-beige"
                >
                  {{ day.badgeText }}
                </span>
              </div>

              <!-- Events -->
               <div
                  v-if="day.items.length"
                  class="flex min-w-0 flex-1 flex-col gap-2.25"
                >
                  <div
                    v-for="item in day.items"
                    :key="item.id"
                    class="flex items-baseline gap-2.5 sm:gap-4"
                  >
                    <span
                      class="w-31 shrink-0 font-mono text-[0.99rem] text-sand sm:w-35.5 sm:text-[1.06rem]"
                    >
                      {{ item.timeLabel || 'Time TBA' }}
                    </span>

                    <span
                      class="min-w-0 font-body text-[1.2rem] font-normal leading-[1.4] text-sand sm:text-[1.3rem]"
                    >
                      {{ formatEntertainmentItem(item) }}
                    </span>
                  </div>
                </div>

              <p
                v-else
                class="font-body text-[1.1rem] italic text-[rgba(6,48,56,0.68)]"
              >
                No event currently posted.
              </p>
            </div>
          </div>

          <!-- Error -->
          <p
            v-else-if="scheduleError"
            class="mt-8 rounded-lg border border-gold-deep/30 bg-white/30 px-5 py-4 font-body font-bold text-gold-deep"
          >
            {{ scheduleError }}
          </p>
         

          <!-- Bottom photo grid -->
          <!-- <div
            class="mt-6 grid grid-cols-2 gap-3.5"
          >
            <img
              v-for="photo in afterDarkBottomPhotos"
              :key="photo.src"
              :src="photo.src"
              :alt="photo.alt"
              loading="lazy"
              class="block h-32.5 w-full rounded-[10px] object-cover shadow-[0_18px_40px_rgba(6,48,56,0.2)] min-[701px]:h-45"
            />
          </div> -->

          

          <!-- After Dark media carousel -->
          <div
            class="relative mt-12 overflow-hidden rounded-md border border-sand/20 bg-ink shadow-[0_18px_40px_rgba(0,0,0,0.38)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Foxy's after dark photos and video"
          >
            <div class="relative aspect-16/10 overflow-hidden sm:aspect-video">
              <!-- Video slide -->
              <video
                v-if="currentAfterDarkSlide.type === 'video'"
                :key="`video-${currentAfterDarkSlide.src}`"
                class="h-full w-full object-cover"
                :poster="currentAfterDarkSlide.poster"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
                :aria-label="currentAfterDarkSlide.alt"
              >
                <source
                  :src="currentAfterDarkSlide.src"
                  type="video/mp4"
                />

                Your browser does not support this video.

                <img
                  v-if="currentAfterDarkSlide.poster"
                  :src="currentAfterDarkSlide.poster"
                  :alt="currentAfterDarkSlide.alt"
                />
              </video>

              <!-- Image slides -->
              <img
                v-else
                :key="`image-${currentAfterDarkSlide.src}`"
                :src="currentAfterDarkSlide.src"
                :alt="currentAfterDarkSlide.alt"
                class="h-full w-full object-cover"
              />

              <!-- Dark overlay -->
              <div
                class="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-ink/10"
                aria-hidden="true"
              ></div>

              <!-- Caption -->
              <div class="absolute inset-x-0 bottom-0 px-5 pb-5 pt-16 sm:px-7 sm:pb-7">
                <p class="font-display text-2xl tracking-[0.04em] text-gold sm:text-3xl">
                  {{ currentAfterDarkSlide.caption }}
                </p>
              </div>

              <!-- Previous button -->
              <button
                type="button"
                class="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand shadow-lg backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:left-5"
                aria-label="Show previous after dark slide"
                @click="previousAfterDarkSlide"
              >
                <svg
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>

              <!-- Next button -->
              <button
                type="button"
                class="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand shadow-lg backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-5"
                aria-label="Show next after dark slide"
                @click="nextAfterDarkSlide"
              >
                <svg
                  class="size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                  />
                </svg>
              </button>

              <!-- Slide count -->
              <div
                class="absolute right-4 top-4 rounded-full bg-ink/75 px-3 py-1 font-mono text-xs font-semibold tracking-wide text-sand backdrop-blur"
                aria-live="polite"
              >
                {{ activeAfterDarkSlide + 1 }} /
                {{ afterDarkSlides.length }}
              </div>
            </div>

            <!-- Carousel controls -->
            <div class="flex items-center justify-center gap-2 bg-ink px-4 py-4">
              <button
                v-for="(slide, index) in afterDarkSlides"
                :key="`${slide.type}-${slide.src}`"
                type="button"
                class="h-2.5 rounded-full transition-[width,background-color] duration-300"
                :class="
                  activeAfterDarkSlide === index
                    ? 'w-8 bg-gold'
                    : 'w-2.5 bg-sand/35 hover:bg-sand/70'
                "
                :aria-label="`Show after dark slide ${index + 1}`"
                :aria-current="
                  activeAfterDarkSlide === index
                    ? 'true'
                    : undefined
                "
                @click="selectAfterDarkSlide(index)"
              ></button>
            </div>
          </div>
        </div>
      </section>
</template>
