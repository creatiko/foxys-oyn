<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  formatEntertainmentItem,
  useEntertainmentSchedule,
  type EntertainmentScheduleItem,
} from '../composables/useEntertainmentSchedule'

import dancingPic from '../assets/why-here/dancing-pic-e1733954021887.jpg'
import partyingPic from '../assets/why-here/IMG_3950.jpg'
import giraffePic from '../assets/why-here/IMG_4011.jpg'


const sunsetTime = ref('--:--')
const sunsetAvailable = ref(true)

const travelAbortController = new AbortController()
  
interface WhyCarouselImage {
  src: string
  alt: string
}

const whyCarouselImages: WhyCarouselImage[] = [
  {
    src: dancingPic,
    alt: "Guests dancing at Foxy's Tamarind Bar",
  },
  {
    src: partyingPic,
    alt: "Guests partying together at Foxy's",
  },
  {
    src: giraffePic,
    alt: "Guests partying at Foxy's Tamarind Bar",
  }
]

const activeWhyCarouselImage = ref(0)

function previousWhyCarouselImage(): void {
  activeWhyCarouselImage.value =
    activeWhyCarouselImage.value === 0
      ? whyCarouselImages.length - 1
      : activeWhyCarouselImage.value - 1
}

function nextWhyCarouselImage(): void {
  activeWhyCarouselImage.value =
    activeWhyCarouselImage.value ===
    whyCarouselImages.length - 1
      ? 0
      : activeWhyCarouselImage.value + 1
}

function selectWhyCarouselImage(index: number): void {
  activeWhyCarouselImage.value = index
}


interface whyReason {
  name: string
  description: string
  borderClass: string
  backgroundClass: string
  textClass: string
}

const whyHere: whyReason[] = [
  {
    name: 'You can\'t drive here',
    description:
      'No bridge, no road, no shortcut—everyone on this beach crossed open water to get here. Arrive by dinghy, or swim ashore and let us put the drink in your hand once your feet hit the sand.',
    borderClass: 'border-t-[#083C4D]',
    backgroundClass:'bg-[#0B6E8C] bg-[linear-gradient(155deg,rgba(6,48,56,0.08),transparent_40%)]',
    textClass: 'text-white'
  },
  {
    name: 'Decades running, never remade',
    description: "<p>Same harbor. Same family. Same easy welcome, passed down and shared with generations of regulars. </p><p class='mt-2'>Not a place dreamed up by a brand team last season. Just Foxy's — still feeling like home.</p>",
    borderClass: 'border-t-[#B8860B]',
    backgroundClass:'bg-[#FFD84E] bg-[linear-gradient(155deg,rgba(6,48,56,0.08),transparent_40%)]',
    textClass: 'text-black'
  },
  {
    name: 'Open to everyone, every night',
    description: "<p>Whether it's a random Tuesday with rum drinks and stories beneath the tamarind tree, or Old Year's Night with Great Harbour alive from shore to sea. </p><p class='mt-2'>Foxy's brings sailors, islanders and visitors together in the unmistakable spirit of Jost Van Dyke.</p>",
    borderClass: 'border-t-[#8F0F26]',
    backgroundClass:'bg-[#DE2F3E] bg-[linear-gradient(155deg,rgba(6,48,56,0.08),transparent_40%)]',
    textClass: 'text-white'
  },
  {
    name: 'No two days—or nights—match',
    description: "<p>At Foxy's, the fun starts at lunchtime, when charter sailors, powerboaters and cruise guests come ashore for food, drinks and island time.</p><p class='mt-2'>As evening settles in, the crowd finds its own rhythm—sometimes the whole anchorage, sometimes a few regulars and a dog asleep in the sand.</p>",
    borderClass: 'border-t-[#0F4A2E]',
    backgroundClass: 'bg-[#1B7A4B] bg-[linear-gradient(155deg,rgba(6,48,56,0.08),transparent_40%)]',
    textClass: 'text-white'
  },
]

interface WeatherApiAstronomyResponse {
  location?: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    tz_id: string
    localtime: string
  }

  astronomy?: {
    astro?: {
      sunrise: string
      sunset: string
      moonrise: string
      moonset: string
      moon_phase: string
      moon_illumination: number
      is_moon_up: number
      is_sun_up: number
    }
  }

  error?: {
    code: number
    message: string
  }
}

const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY as
  | string
  | undefined

const greatHarbourCoordinates = '18.4446,-64.7486'

async function loadSunsetTime(): Promise<void> {
  sunsetAvailable.value = true
  sunsetTime.value = '--:--'

  if (!weatherApiKey) {
    console.error(
      'Missing VITE_WEATHER_API_KEY in your environment file.',
    )

    sunsetAvailable.value = false
    return
  }

  const query = new URLSearchParams({
    key: weatherApiKey,
    q: greatHarbourCoordinates,
  })

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/astronomy.json?${query.toString()}`,
      {
        signal: travelAbortController.signal,
      },
    )

    const data =
      (await response.json()) as WeatherApiAstronomyResponse

    if (!response.ok || data.error) {
      throw new Error(
        data.error?.message ??
          `WeatherAPI request failed with status ${response.status}.`,
      )
    }

    const sunset = data.astronomy?.astro?.sunset

    if (!sunset) {
      throw new Error(
        'WeatherAPI did not return a sunset time.',
      )
    }

    sunsetTime.value = sunset

    console.log('WeatherAPI astronomy location:', {
      name: data.location?.name,
      region: data.location?.region,
      country: data.location?.country,
      timezone: data.location?.tz_id,
      sunset,
    })
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      return
    }

    console.error(
      'WeatherAPI sunset request failed:',
      error,
    )

    sunsetAvailable.value = false
  }
}

const dailyPerformers = [
  {
    id: 'elvis',
    displayText: 'Elvis — steel pan, lunchtime',
  },
  {
    id: 'island-bob',
    displayText: 'Island Bob — guitar, 4pm',
  },
] as const

/* Get the schedule from the backend */
const {
  schedule,
  scheduleLoading,
  scheduleError,
  loadEntertainmentSchedule,
} = useEntertainmentSchedule()

const todayDayName = computed(() => {
  return (
    schedule.value?.today?.dayName
    ?? ''
  )
})

const currentDayEvent =
  computed<
    EntertainmentScheduleItem | null
  >(() => {
    return (
      schedule.value?.today?.items.find(
        (item) =>
          item.type !== 'performer',
      )
      ?? null
    )
  })

onMounted(() => {
  void loadSunsetTime()
  void loadEntertainmentSchedule()
})

onBeforeUnmount(() => {
  travelAbortController.abort()
}) 
</script>

<template>
<section
        id="why"
        class="scroll-mt-20 bg-[radial-gradient(ellipse_at_10%_90%,rgba(255,255,255,0.10),transparent_45%),var(--section-gradient-blue)] py-20 sm:py-28"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <!-- Heading -->
          <div class="max-w-4xl">
            <div class="flex items-center gap-1">
              <svg
                class="relative top-px block size-8 shrink-0 fill-black"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M6 3.5 16 10 6 16.5v-13Z" />
              </svg>

              <p class="m-0 text-mono text-md uppercase tracking-tight text-black">
                Why here
              </p>
            </div>

            <h2
            class="font-display text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
            >
              Not just a party. <br>Foxy's!
            </h2>

            <p class="mt-6 text-xl leading-8 text-black">
              The Caribbean has no shortage of beach bars. Here's what nobody
              else can copy.
            </p>

            <!-- Sunset badge -->
            <div
              class="sunset-badge"
              style="margin-bottom: 8px"
            >
              <svg
                class="sun"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  fill="#B3400A"
                />

                <g
                  stroke="#B3400A"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <path d="M12 1v3" />
                  <path d="M12 20v3" />
                  <path d="M1 12h3" />
                  <path d="M20 12h3" />
                  <path d="M4.2 4.2l2.1 2.1" />
                  <path d="M17.7 17.7l2.1 2.1" />
                  <path d="M19.8 4.2l-2.1 2.1" />
                  <path d="M6.3 17.7l-2.1 2.1" />
                </g>
              </svg>

              <b>{{ sunsetTime }}</b>

              <span>
                tonight's sunset — golden hour starts about 45 min before
              </span>
            </div>
          </div>

          <div
            class="today-schedule"
            aria-live="polite"
          >
            <span class="today-schedule-label">
              Happening Today
            </span>

            <div
              v-if="scheduleLoading"
              class="today-schedule-headline"
            >
              Loading today's event…
            </div>

            <template v-else-if="currentDayEvent">
              <div class="today-schedule-headline">
                Today is {{ todayDayName }}:
                {{
                  formatEntertainmentItem(
                    currentDayEvent,
                  )
                }}
              </div>

              <ul class="today-schedule-list">
                <li
                  v-for="performer in dailyPerformers"
                  :key="performer.id"
                >
                  {{ performer.displayText }}
                </li>

                <li>
                  {{
                    formatEntertainmentItem(
                      currentDayEvent,
                    )
                  }}<template
                    v-if="currentDayEvent.timeLabel"
                  >, {{ currentDayEvent.timeLabel }}</template>
                </li>
              </ul>
            </template>

            <div
              v-else-if="scheduleError"
              class="today-schedule-error"
            >
              {{ scheduleError }}
            </div>

            <template v-else>
              <div class="today-schedule-headline">
                Today is {{ todayDayName || 'today' }}
              </div>

              <ul class="today-schedule-list">
                <li
                  v-for="performer in dailyPerformers"
                  :key="performer.id"
                >
                  {{ performer.displayText }}
                </li>
              </ul>
            </template>
          </div>

          <!-- Image carousel -->
          <div
            class="relative mt-12 overflow-hidden rounded-md border border-sand/20 bg-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Foxy's party photos"
          >
            <div class="relative aspect-video overflow-hidden sm:aspect-2/1">
              <img
                :key="whyCarouselImages[activeWhyCarouselImage].src"
                :src="whyCarouselImages[activeWhyCarouselImage].src"
                :alt="whyCarouselImages[activeWhyCarouselImage].alt"
                class="h-full w-full object-cover"
              />

              <!-- Image overlay -->
              <div
                class="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent"
                aria-hidden="true"
              ></div>

              <!-- Previous -->
              <button
                type="button"
                class="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand shadow-lg backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:left-5"
                aria-label="Show previous photo"
                @click="previousWhyCarouselImage"
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

              <!-- Next -->
              <button
                type="button"
                class="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand shadow-lg backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-5"
                aria-label="Show next photo"
                @click="nextWhyCarouselImage"
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

              <!-- Photo count -->
              <div
                class="absolute bottom-4 right-4 rounded-full bg-ink/75 px-3 py-1 font-mono text-xs font-semibold tracking-wide text-sand backdrop-blur"
                aria-live="polite"
              >
                {{ activeWhyCarouselImage + 1 }} /
                {{ whyCarouselImages.length }}
              </div>
            </div>

            <!-- Carousel dots -->
            <div
              class="flex items-center justify-center gap-2 bg-ink px-4 py-4"
              role="tablist"
              aria-label="Choose a party photo"
            >
              <button
                v-for="(image, index) in whyCarouselImages"
                :key="image.src"
                type="button"
                role="tab"
                class="h-2.5 rounded-full transition-[width,background-color] duration-300"
                :class="
                  activeWhyCarouselImage === index
                    ? 'w-8 bg-gold'
                    : 'w-2.5 bg-sand/35 hover:bg-sand/70'
                "
                :aria-label="`Show photo ${index + 1}`"
                :aria-selected="activeWhyCarouselImage === index"
                @click="selectWhyCarouselImage(index)"
              ></button>
            </div>
          </div>

          <!-- Four reason cards -->
          <div
            class="mt-16 grid grid-cols-1 gap-5 min-[861px]:grid-cols-2"
          >
            <article
              v-for="(reason, index) in whyHere"
              :key="reason.name"
              :data-family-index="index"
              data-family-card
              class="
                rounded-md
                border-t-[3px]
                px-6
                py-6.5
                shadow-brand-md
                transition-[opacity,transform,box-shadow]
                duration-800
                ease-out
                hover:-translate-y-1
                hover:shadow-brand-lift
                motion-reduce:translate-y-0
                motion-reduce:opacity-100
                motion-reduce:transition-none
              "
              :class="[
                reason.borderClass,
                reason.backgroundClass,
                reason.textClass,
                // visibleFamilyCards.has(index)
                //   ? 'translate-y-0 opacity-100'
                //   : 'translate-y-7 opacity-0',
              ]"
            >
              <h3
                class="font-body text-2xl font-extrabold leading-[1.2] tracking-wide sm:text-[1.6rem]"
              >
                {{ reason.name }}
              </h3>

              <p class="mt-2.25 text-lg leading-relaxed sm:text-[1.2rem]" v-html="reason.description">
              </p>
            </article>
          </div>
        </div>
      </section>
</template>
<style scoped>

.sunset-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  margin-top: 20px;

  background:
    linear-gradient(
      100deg,
      #ff9a3c 0%,
      #ffc93c 52%,
      #ffe894 100%
    );

  border: 2px solid rgba(120, 45, 5, 0.28);
  border-radius: 999px;

  padding: 13px 24px;

  box-shadow:
    0 2px 6px rgba(6, 48, 56, 0.14);
}

.sunset-badge .sun {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
}

.sunset-badge b {
  color: #5c1f02;

  font-family:
    "IBM Plex Mono",
    monospace;

  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;

  letter-spacing: 0.01em;
  white-space: nowrap;
}

.sunset-badge span {
  color: #5c1f02;

  margin-left: 2px;

  font-family:
    "Nunito",
    -apple-system,
    sans-serif;

  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.35;
}

@media (max-width: 640px) {
  .sunset-badge {
    padding: 12px 18px;
  }

  .sunset-badge b {
    font-size: 1.32rem;
  }

  .sunset-badge span {
    font-size: 1.02rem;
  }
}
.today-schedule {
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-top: 14px;

  background: rgba(6, 48, 56, 0.09);
  border: 1px solid rgba(6, 48, 56, 0.3);
  border-radius: 8px;

  padding: 16px 20px;
}

.today-schedule-label {
  color: #063038;

  font-family:
    "IBM Plex Mono",
    monospace;

  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.3;

  letter-spacing: 0.1em;
  text-transform: uppercase;

  opacity: 0.75;
}

.today-schedule-headline {
  color: #063038;

  font-family:
    "Lilita One",
    sans-serif;

  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.25;

  letter-spacing: 0.02em;
}

.today-schedule-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 22px;

  margin: 0;
  padding: 0;

  list-style: none;
}

.today-schedule-list li {
  display: flex;
  align-items: center;
  gap: 7px;

  color: #063038;

  font-family:
    "Nunito",
    -apple-system,
    sans-serif;

  font-size: 1.14rem;
  font-weight: 400;
  line-height: 1.45;

  opacity: 0.85;
}

.today-schedule-list li::before {
  content: "●";

  color: #ff4e5b;
  font-size: 0.5rem;
  line-height: 1;

  flex: 0 0 auto;
}

.today-schedule-error {
  color: #8f0f26;

  font-family:
    "Nunito",
    -apple-system,
    sans-serif;

  font-size: 1.05rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .today-schedule {
    padding: 15px 17px;
  }

  .today-schedule-headline {
    font-size: 1.3rem;
  }

  .today-schedule-list {
    flex-direction: column;
    gap: 7px;
  }

  .today-schedule-list li {
    font-size: 1.08rem;
  }
}
</style>