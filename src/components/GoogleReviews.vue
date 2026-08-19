<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  useFoxysGoogleReviews,
} from '@/composables/useFoxysGoogleReviews'

const {
  foxysGooglePlace,
  foxysGoogleReviewsLoading,
  foxysGoogleReviewsError,
  loadFoxysGoogleReviews,
} = useFoxysGoogleReviews()

const currentReviewIndex = ref(0)

let rotationTimer: number | null = null

const currentReview = computed(() => {
  const reviews =
    foxysGooglePlace.value?.reviews ?? []

  return (
    reviews[currentReviewIndex.value] ??
    null
  )
})

const fallbackGoogleMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=18.4446099,-64.7485994'

const foxysGoogleMapsUrl = computed(() => {
  return (
    foxysGooglePlace.value?.googleMapsURI ??
    fallbackGoogleMapsUrl
  )
})

function reviewStars(rating: number): string {
  const roundedRating = Math.max(
    0,
    Math.min(5, Math.round(rating)),
  )

  return (
    '★'.repeat(roundedRating) +
    '☆'.repeat(5 - roundedRating)
  )
}

function stopRotation(): void {
  if (rotationTimer !== null) {
    window.clearInterval(rotationTimer)
    rotationTimer = null
  }
}

function startRotation(): void {
  stopRotation()

  const reviewCount =
    foxysGooglePlace.value?.reviews.length ??
    0

  const reducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

  if (
    reducedMotion ||
    reviewCount < 2
  ) {
    return
  }

  rotationTimer = window.setInterval(() => {
    currentReviewIndex.value =
      (currentReviewIndex.value + 1) %
      reviewCount
  }, 5500)
}

function showReview(index: number): void {
  currentReviewIndex.value = index
  startRotation()
}

onMounted(async () => {
  await loadFoxysGoogleReviews()
  startRotation()
})

onBeforeUnmount(() => {
  stopRotation()
})
</script>

<template>
  <section
          id="reviews"
          class="relative bg-[linear-gradient(180deg,#1ECBDE_0%,#35D9E9_50%,#1ECBDE_100%)] py-20 text-sand sm:py-28"
        >          
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section marker -->
      <div class="mb-4.5 inline-flex items-center gap-2.5">
        <span
          aria-hidden="true"
          class="h-0 w-0 border-y-11 border-y-transparent border-l-18 border-l-sand"
        ></span>

        <span
          class="font-mono text-[0.94rem] uppercase tracking-[0.14em] text-sand"
        >
          What guests say
        </span>
      </div>

      <h2
        class="font-['Lilita_One',sans-serif] text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
      >
        Don't take our word for it
      </h2>

      <!-- Loading -->
      <div
        v-if="foxysGoogleReviewsLoading"
        class="mt-8 rounded-[10px] border border-sand/15 bg-white/20 p-6"
        aria-live="polite"
      >
        <p
          class="font-body text-[1.2rem] text-sand"
        >
          Loading Google reviews…
        </p>
      </div>

      <!-- Error -->
      <div
        v-else-if="foxysGoogleReviewsError"
        class="mt-8 rounded-[10px] border border-gold-deep/30 bg-white/25 p-6"
        role="alert"
      >
        <p
          class="font-body font-bold text-gold-deep"
        >
          {{ foxysGoogleReviewsError }}
        </p>
      </div>

      <!-- Google data -->
      <template v-else-if="foxysGooglePlace">
        <p
          class="mt-5 max-w-175 font-body text-[1.25rem] leading-[1.55] text-sand"
        >
          <template
            v-if="
              foxysGooglePlace.rating !== null
            "
          >
            {{ foxysGooglePlace.rating.toFixed(1) }}
            stars across
            {{
              foxysGooglePlace.userRatingCount.toLocaleString()
            }}
            visitor ratings.
          </template>

          Here's the gist of what they keep saying.
        </p>

        <!-- Live statistics -->
        <div
          class="mt-9 grid grid-cols-1 gap-5 min-[520px]:grid-cols-3"
        >
          <div>
            <b
              class="block font-mono text-[1.7rem] text-sand"
            >
              {{
                foxysGooglePlace.rating !== null
                  ? `${foxysGooglePlace.rating.toFixed(1)}★`
                  : '—'
              }}
            </b>

            <span
              class="font-body text-[0.96rem] text-sand-dim"
            >
              average guest rating
            </span>
          </div>

          <div>
            <b
              class="block font-mono text-[1.7rem] text-sand"
            >
              {{
                foxysGooglePlace.userRatingCount.toLocaleString()
              }}
            </b>

            <span
              class="font-body text-[0.96rem] text-sand-dim"
            >
              visitor ratings
            </span>
          </div>

          <div>
            <b
              class="block font-mono text-[1.7rem] text-sand"
            >
              Since 1968
            </b>

            <span
              class="font-body text-[0.96rem] text-sand-dim"
            >
              serving this beach
            </span>
          </div>
        </div>

        <!-- Review carousel -->
        <div
          v-if="currentReview"
          class="mt-7.5 rounded-xl border border-sand/15 bg-white/25 p-5 shadow-[0_10px_26px_rgba(6,48,56,0.16)] sm:p-7"
        >
          <!-- Author attribution -->
          <div
            class="flex flex-wrap items-center justify-between gap-4"
          >
            <component
              :is="
                currentReview.author.uri
                  ? 'a'
                  : 'div'
              "
              :href="
                currentReview.author.uri ??
                undefined
              "
              :target="
                currentReview.author.uri
                  ? '_blank'
                  : undefined
              "
              :rel="
                currentReview.author.uri
                  ? 'noopener noreferrer'
                  : undefined
              "
              class="flex items-center gap-3"
            >
              <!-- This image comes directly from the
                   Google author attribution API. -->
              <img
                v-if="
                  currentReview.author.photoURI
                "
                :src="
                  currentReview.author.photoURI
                "
                :alt="`${currentReview.author.displayName}'s Google profile photo`"
                class="h-11 w-11 shrink-0 rounded-full object-cover"
                referrerpolicy="no-referrer"
              />

              <span
                v-else
                aria-hidden="true"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand/10 font-bold text-sand"
              >
                {{
                  currentReview.author.displayName
                    .charAt(0)
                    .toUpperCase()
                }}
              </span>

              <span>
                <strong
                  class="block font-body text-[1.14rem] font-extrabold text-sand"
                >
                  {{
                    currentReview.author.displayName
                  }}
                </strong>

                <span
                  v-if="
                    currentReview.relativePublishTimeDescription
                  "
                  class="block font-body text-[0.94rem] text-sand-dim"
                >
                  {{
                    currentReview.relativePublishTimeDescription
                  }}
                </span>
              </span>
            </component>

            <span
              class="font-mono text-[1.02rem] tracking-[0.08em] text-gold-deep"
              :aria-label="`${currentReview.rating} out of 5 stars`"
            >
              {{
                reviewStars(
                  currentReview.rating,
                )
              }}
            </span>
          </div>

          <blockquote
            class="mt-6 font-body text-[1.24rem] leading-[1.6] text-sand sm:text-[1.32rem]"
          >
            “{{ currentReview.text }}”
          </blockquote>

          <!-- Direct source review -->
          <a
            v-if="currentReview.googleMapsURI"
            :href="currentReview.googleMapsURI"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 inline-block font-body text-[1rem] font-bold text-sand underline decoration-1 underline-offset-4 hover:opacity-70"
          >
            View this review on Google Maps ↗
          </a>

          <!-- Dots -->
          <div
            v-if="
              foxysGooglePlace.reviews.length >
              1
            "
            class="mt-6 flex flex-wrap items-center gap-2"
            aria-label="Choose a Google review"
          >
            <button
              v-for="(
                review,
                index
              ) in foxysGooglePlace.reviews"
              :key="review.id"
              type="button"
              class="h-2.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none"
              :class="
                index === currentReviewIndex
                  ? 'w-7 bg-sand'
                  : 'w-2.5 bg-sand/25 hover:bg-sand/50'
              "
              :aria-label="`Show review ${index + 1}`"
              :aria-current="
                index === currentReviewIndex
                  ? 'true'
                  : undefined
              "
              @click="showReview(index)"
            ></button>
          </div>
        </div>

        <p
          v-else
          class="mt-8 font-body text-[1.2rem] text-sand"
        >
          Google did not return any written
          reviews for this place.
        </p>

        <!-- Required contextual notices -->
        <div
          class="mt-6 border-t border-sand/15 pt-5 font-body text-[0.93rem] leading-[1.55] text-sand-dim"
        >
          <p>
            Reviews are selected and ordered by
            Google Maps for relevance. Content provided by Google Maps and are not verified by Foxy's.
          </p>

          <!-- Additional providers returned by Google -->
          <p
            v-if="
              foxysGooglePlace.attributions
                .length
            "
            class="mt-1"
          >
            Additional data providers:

            <template
              v-for="(
                attribution,
                index
              ) in foxysGooglePlace.attributions"
              :key="
                `${attribution.provider}-${index}`
              "
            >
              <span v-if="index > 0">
                ,
              </span>

              <a
                v-if="
                  attribution.providerURI
                "
                :href="
                  attribution.providerURI
                "
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-2"
              >
                {{ attribution.provider }}
              </a>

              <span v-else>
                {{ attribution.provider }}
              </span>
            </template>
          </p>
        </div>

        <a
          :href="foxysGoogleMapsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-7 inline-block font-body text-[1.24rem] font-bold text-sand underline decoration-1 underline-offset-4 hover:opacity-70"
        >
          Read all reviews on Google Maps ↗
        </a>
      </template>
    </div>
  </section>
</template>