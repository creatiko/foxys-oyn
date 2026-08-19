<script setup lang="ts">

import tabooStaffImage from '../assets/taboo/taboo-staff.jpg'
import tabooDockImage from '../assets/taboo/taboo-dock.jpg'
import tabooSignImage from '../assets/taboo/taboo-sign.jpg'

</script>

<template>
<section
        id="taboo"
        class="bg-[linear-gradient(180deg,#FFD84E_0%,#17C9D9_100%)] py-20 sm:py-28"
      >
        <div class="mx-auto w-full max-w-7xl px-2 sm:px-6 lg:px-2">
          <div
            class="flex flex-wrap items-stretch justify-center gap-7 rounded-lg bg-driftwood-dark px-6 py-7 shadow-[0_18px_40px_rgba(6,48,56,0.20)] sm:px-11 sm:py-10"
          >
            <!-- Left: staff image -->
            <div
              class="min-w-0 flex-[1_1_320px] overflow-hidden rounded-lg shadow-[0_18px_40px_rgba(6,48,56,0.20)] sm:max-w-100"
            >
              <img
                :src="tabooStaffImage"
                alt="Foxy's Taboo staff member at Diamond Cay"
                loading="lazy"
                class="block h-full min-h-80 w-full object-cover"
              />
            </div>

            <!-- Middle: text and dock image -->
            <div
              class="flex min-w-0 flex-[1_1_380px] flex-col gap-5.5 self-center sm:max-w-130"
            >
              <div>
                <span
                  class="mb-2 block font-mono text-sm uppercase tracking-[0.14em] text-beige"
                >
                  Two spots, one family
                </span>

                <h3
                  class="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-normal uppercase leading-[1.15] tracking-[0.01em] text-white"
                >
                  Foxy's Taboo
                </h3>

                <p
                  class="mt-3 font-body text-base leading-normal text-[#FFF3E4]"
                >
                  A quieter counterpart to the main bar at Diamond
                  Cay, on the eastern shore of Jost Van Dyke —
                  known for fresh local fish and lobster, with
                  calmer snorkeling right off the point.
                </p>

                <p
                  class="mt-2.5 font-mono text-md leading-normal text-white"
                >
                  <a
                    href="tel:+12843400703"
                    class="underline-offset-4 hover:underline"
                  >
                    +1 (284) 340-0703
                  </a>

                  <span aria-hidden="true">
                    &bull;
                  </span>

                  Open daily, 9 AM - 8 PM
                </p>

                <div class="mt-5 grid w-full grid-cols-1 gap-3">
                  <a
                    href="https://foxysbar.com/foxys-taboo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-turquoise px-6.5 py-3.75 text-center font-body text-xl font-extrabold leading-tight text-sand no-underline transition-colors hover:bg-[#14D8C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Visit Foxy's Taboo Site ↗
                  </a>

                  <a
                    href="https://www.google.com/maps/dir/?api=1&origin=18.4446099,-64.7485994&destination=18.4496233,-64.7266042"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-full border-[1.5px] border-white/60 bg-transparent px-6.5 py-3.75 text-center font-body text-xl font-extrabold leading-tight text-white no-underline transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Get Directions from Foxy's ↗
                  </a>
                </div>
              </div>

              <!-- Middle: dock image -->
              <div
                class="overflow-hidden rounded-lg shadow-[0_18px_40px_rgba(6,48,56,0.20)] aspect-[2.3/1]"
              >
                <img
                  :src="tabooDockImage"
                  alt="Aerial view of the dock and turquoise water at Foxy's Taboo, Diamond Cay"
                  loading="lazy"
                  class="block h-full w-full object-cover"
                />
              </div>
            </div>

            <!-- Right: directional-sign image -->
            <div
              class="min-w-0 flex-[1_1_320px] overflow-hidden rounded-lg shadow-[0_18px_40px_rgba(6,48,56,0.20)] sm:max-w-100"
            >
              <img
                :src="tabooSignImage"
                alt="Hand-painted Foxy's Taboo directional sign nailed to a palm tree"
                loading="lazy"
                class="block h-full min-h-80 w-full object-cover object-[15%_center]"
              />
            </div>
          </div>
        </div>
      </section>
</template>
