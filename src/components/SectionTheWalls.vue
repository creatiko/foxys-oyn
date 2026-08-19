<script setup lang="ts">
import { 
  ref,
} from 'vue'

import dancingUnderFlags from '../assets/bar/Dancing_under_flags.jpg'
import EastportYachtclubBurgee from '../assets/burgee/EastportYachtclubBurgee.jpg'

interface WallCarouselImage {
  src: string
  alt: string
}

// interface WallReview {
//   quote: string
//   source: string
// }

const wallCarouselImages: WallCarouselImage[] = [
  {
    src: dancingUnderFlags,
    alt: "Guests dancing under the flags at Foxy's",
  },
  {
    src: EastportYachtclubBurgee,
    alt: "Foxy and the Eastport Yacht Club burgee",
  },
]


// const wallReviews: WallReview[] = [
//   {
//     quote:
//       'Loved the conch fritters and the shrimp poke bowl — a nice change from the usual burger.',
//     source: 'Paraphrased from a recent Google review',
//   },
//   {
//     quote:
//       "Fast, friendly service — the poke bowls didn't last long enough to get a photo.",
//     source: 'Paraphrased from a recent Google review',
//   },
//   {
//     quote:
//       'The Friday buffet is worth it — ribs, mahi mahi, jerk chicken, all the sides, one big plate.',
//     source: 'Paraphrased from a recent Google review',
//   },
//   {
//     quote:
//       'Swam up from our boat for bushwhackers and apps — best ambiance around, and a fun little gift shop too.',
//     source: 'Paraphrased from a recent Google review',
//   },
// ]

const activeWallImage = ref(0)
// const activeWallReview = ref(0)

function previousWallImage(): void {
  activeWallImage.value =
    activeWallImage.value === 0
      ? wallCarouselImages.length - 1
      : activeWallImage.value - 1
}

function nextWallImage(): void {
  activeWallImage.value =
    activeWallImage.value === wallCarouselImages.length - 1
      ? 0
      : activeWallImage.value + 1
}

function selectWallImage(index: number): void {
  activeWallImage.value = index
}

// function previousWallReview(): void {
//   activeWallReview.value =
//     activeWallReview.value === 0
//       ? wallReviews.length - 1
//       : activeWallReview.value - 1
// }

// function nextWallReview(): void {
//   activeWallReview.value =
//     activeWallReview.value === wallReviews.length - 1
//       ? 0
//       : activeWallReview.value + 1
// }


</script>

<template>
      <section
        id="wall"
        class="bg-(image:--section-gradient-blue) py-20 sm:py-28 "
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
              Since the 1960s
            </span>
          </div>

          <!-- Heading -->
          <h2
            class="font-display text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
          >
            The walls tell the history.
          </h2>
          <!-- copy -->
            <p class="mt-6 max-w-4xl font-body text-2xl leading-8 text-black sm:text-2xl">
              Every burgee nailed to the rafters is a real yacht that really tied up here.<br>
              Nobody designed these walls &mdash; they just happened, one visitor at a time.
            </p>

          <!-- Image carousel -->
          <div
            class="relative mt-12 overflow-hidden rounded-md border border-sand/20 bg-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Foxy's history photos"
          >
            <div class="relative aspect-16/10 overflow-hidden sm:aspect-video">
              <img
                :key="wallCarouselImages[activeWallImage].src"
                :src="wallCarouselImages[activeWallImage].src"
                :alt="wallCarouselImages[activeWallImage].alt"
                class="h-full w-full object-cover"
              />

              <div
                class="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent"
                aria-hidden="true"
              ></div>

              <!-- Previous -->
              <button
                type="button"
                class="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:left-5"
                aria-label="Show previous photo"
                @click="previousWallImage"
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
                class="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-sand/30 bg-ink/70 text-sand backdrop-blur transition hover:border-gold hover:bg-ink hover:text-gold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-gold sm:right-5"
                aria-label="Show next photo"
                @click="nextWallImage"
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

              <div
                class="absolute bottom-4 right-4 rounded-full bg-ink/75 px-3 py-1 font-mono text-xs font-semibold text-sand backdrop-blur"
                aria-live="polite"
              >
                {{ activeWallImage + 1 }} /
                {{ wallCarouselImages.length }}
              </div>
            </div>

            <!-- Image dots -->
            <div class="flex items-center justify-center gap-2 bg-ink px-4 py-4">
              <button
                v-for="(image, index) in wallCarouselImages"
                :key="image.src"
                type="button"
                class="h-2.5 rounded-full transition-[width,background-color] duration-300"
                :class="
                  activeWallImage === index
                    ? 'w-8 bg-gold'
                    : 'w-2.5 bg-sand/35 hover:bg-sand/70'
                "
                :aria-label="`Show photo ${index + 1}`"
                :aria-current="
                  activeWallImage === index
                    ? 'true'
                    : undefined
                "
                @click="selectWallImage(index)"
              ></button>
            </div>
          </div>           
        </div>        
      </section>
</template>
