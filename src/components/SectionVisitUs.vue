<script setup lang="ts">
import { 
  computed,
  onMounted,
  ref,
} from 'vue'

type SiteTab =
  | 'home'
  | 'oyn'
  | 'menu'
  | 'events'
  | 'story'
  | 'shop'
  | 'plan'

const activeTab = ref<SiteTab>('home')

import visitBar from '../assets/bar/IMG_0206.jpg'
import visitSign from '../assets/bar/visit-sign.jpg'
import visitDock from '../assets/bar/visit-dock.png'
import visitPatio from '../assets/bar/visit-patio.png'

import {
  useFoxysGoogleReviews,
} from '../composables/useFoxysGoogleReviews'

const {
  foxysGooglePlace,
  loadFoxysGoogleReviews,
} = useFoxysGoogleReviews()


const fallbackGoogleMapsUrl =
  'https://www.google.com/maps/search/?api=1&query=18.4446099,-64.7485994'

const foxysGoogleMapsUrl = computed(() => {
  return (
    foxysGooglePlace.value?.googleMapsURI ??
    fallbackGoogleMapsUrl
  )
})

onMounted(() => {

  void loadFoxysGoogleReviews()

})
</script>

<template>
      <section
          id="visit"
        class="relative bg-(image:--section-gradient-yellow) py-20 text-sand sm:py-28"
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
                Visit Us
              </span>
            </div>

            <!-- Heading -->
            <h2
              class="font-display text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
            >
              Find us on the sand
            </h2>

            <!-- Photos -->
            <div
              class="mt-8 grid grid-cols-1 gap-3.5 min-[521px]:grid-cols-2"
            >
              <!-- Left column -->
              <div class="flex min-w-0 flex-col gap-3.5">
                <img
                  :src="visitBar"
                  alt="Foxy's under its blue tin roof, with guests at painted picnic tables on the sand"
                  loading="lazy"
                  class="block h-65 w-full rounded-[10px] object-cover shadow-[0_10px_26px_rgba(6,48,56,0.16)] min-[521px]:h-105"
                />

                <img
                  :src="visitSign"
                  alt="The hand-carved Foxy's sign hanging from an anchor on the beach"
                  loading="lazy"
                  class="block h-55 w-full rounded-[10px] object-cover shadow-[0_10px_26px_rgba(6,48,56,0.16)]"
                />
              </div>

              <!-- Right column -->
              <div class="flex min-w-0 flex-col gap-3.5">
                <img
                  :src="visitDock"
                  alt="The dock leading to Foxy's beach, with palm trees, boats, and the blue-roofed building beyond"
                  loading="lazy"
                  class="block h-55 w-full rounded-[10px] object-cover shadow-[0_10px_26px_rgba(6,48,56,0.16)]"
                />

                <img
                  :src="visitPatio"
                  alt="Foxy's sandy patio under the shade trees"
                  loading="lazy"
                  class="block h-65 w-full rounded-[10px] object-cover shadow-[0_10px_26px_rgba(6,48,56,0.16)] min-[521px]:h-105"
                />
              </div>
            </div>

            <!-- Details and actions -->
            <div
              class="mt-11 grid grid-cols-1 items-center gap-10 min-[801px]:grid-cols-2"
            >
              <!-- Visit information -->
              <ul class="m-0 flex list-none flex-col gap-4.5 p-0">
                <li class="flex gap-4">
                  <div
                    class="w-22.5 shrink-0 pt-1 font-mono text-[0.86rem] uppercase tracking-[0.08em] text-sand"
                  >
                    Address
                  </div>

                  <div
                    class="min-w-0 font-body text-[1.33rem] leading-[1.45] text-sand"
                  >
                    Great Harbour, Jost Van Dyke<br />
                    British Virgin Islands

                    <small
                      class="mt-0.5 block text-[1.22rem] leading-[1.4] text-sand/80"
                    >
                      18.4446° N, 64.7486° W
                    </small>
                  </div>
                </li>

                <li class="flex gap-4">
                  <div
                    class="w-22.5 shrink-0 pt-1 font-mono text-[0.86rem] uppercase tracking-[0.08em] text-sand"
                  >
                    Hours
                  </div>

                  <div
                    class="min-w-0 font-body text-[1.33rem] leading-[1.45] text-sand"
                  >
                    Open daily

                    <small
                      class="mt-0.5 block text-[1.22rem] leading-[1.4] text-sand/80"
                    >
                      9:00 AM - 2:00 AM
                    </small>
                  </div>
                </li>

                <li class="flex gap-4">
                  <div
                    class="w-22.5 shrink-0 pt-1 font-mono text-[0.86rem] uppercase tracking-[0.08em] text-sand"
                  >
                    Phone
                  </div>

                  <div
                    class="min-w-0 font-body text-[1.33rem] leading-[1.45] text-sand"
                  >
                    <a
                      href="tel:+12844423074"
                      class="transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sand"
                    >
                      +1 (284) 442-3074
                    </a>
                  </div>
                </li>

                <li class="flex gap-4">
                  <div
                    class="w-22.5 shrink-0 pt-1 font-mono text-[0.86rem] uppercase tracking-[0.08em] text-sand"
                  >
                    Getting here
                  </div>

                  <div
                    class="min-w-0 font-body text-[1.33rem] leading-[1.45] text-sand"
                  >
                    By ferry from West End, Tortola, from Red Hook,
                    St. Thomas, or by your own boat

                    <small
                      class="mt-0.5 block text-[1.22rem] leading-[1.45] text-sand/80"
                    >
                      No road access · crossing times and operators
                      are on the

                      <button
                        type="button"
                        class="font-semibold text-sand underline decoration-1 underline-offset-4 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
                        @click="activeTab = 'plan'"
                      >
                        Plan Your Trip
                      </button>

                      tab.
                    </small>
                  </div>
                </li>
              </ul>

              <!-- Rating and links -->
              <div
                class="rounded-lg border border-[rgba(6,48,56,0.08)] bg-driftwood-dark p-6.5 shadow-[0_10px_26px_rgba(6,48,56,0.16)]"
              >

                <div class="flex flex-col gap-2.5">
                  
                  <a
                    :href="foxysGoogleMapsUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(255,248,231,0.32)] bg-[rgba(255,248,231,0.1)] px-4 py-3.25 font-body text-[1.22rem] text-beige transition-colors hover:border-beige hover:bg-[rgba(255,248,231,0.2)] focus-visible:border-beige focus-visible:bg-[rgba(255,248,231,0.2)] focus-visible:outline-none"
                  >
                    <span>Open in Google Maps</span>

                    <span
                      aria-hidden="true"
                      class="shrink-0 text-[#FFEDA0]"
                    >
                      ↗
                    </span>
                  </a>

                  <a
                    href="tel:+12844423074"
                    class="flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(255,248,231,0.32)] bg-[rgba(255,248,231,0.1)] px-4 py-3.25 font-body text-[1.22rem] text-beige transition-colors hover:border-beige hover:bg-[rgba(255,248,231,0.2)] focus-visible:border-beige focus-visible:bg-[rgba(255,248,231,0.2)] focus-visible:outline-none"
                  >
                    <span>Call +1 (284) 442-3074</span>

                    <span
                      aria-hidden="true"
                      class="shrink-0 text-[#FFEDA0]"
                    >
                      ☎
                    </span>
                  </a>

                  <a href="https://wa.me/12844423074?text=Hi%20Foxy's!%20I%20have%20a%20question." 
                    class="flex items-center justify-between gap-3 rounded-[10px] border border-[rgba(255,248,231,0.32)] bg-[rgba(255,248,231,0.1)] px-4 py-3.25 font-body text-[1.22rem] text-beige transition-colors hover:border-beige hover:bg-[rgba(255,248,231,0.2)] focus-visible:border-beige focus-visible:bg-[rgba(255,248,231,0.2)] focus-visible:outline-none"
                    target="_blank" 
                    rel="noopener">

                      <span>Message on WhatsApp</span>

                      <span
                        aria-hidden="true"
                        class="shrink-0 text-[#FFEDA0]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />

                          <circle cx="8.5" cy="11" r="1" fill="currentColor" stroke="none" />
                          <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
                          <circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none" />
                        </svg>
                      </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
      </section>
</template>
