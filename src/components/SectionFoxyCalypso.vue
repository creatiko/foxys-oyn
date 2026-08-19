<script setup lang="ts">

import foxyCalypso from '../assets/family/95606105_10158334790212579_1370582737701830656_n.jpg'

</script>

<template>
      <section
        id="calypso"
        class="relative bg-(image:--section-gradient-coral) py-20 text-sand sm:py-28"
      >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <!-- Section marker -->
          <div class="mb-4.5 inline-flex items-center gap-2.5">
            <span
              class="h-0 w-0 border-y-11 border-y-transparent border-l-18 border-l-coral"
              aria-hidden="true"
            ></span>

            <span
              class="font-mono text-md uppercase tracking-[0.14em] text-sand-dim"
            >
              Foxy himself
            </span>
          </div>

          <!-- Heading -->
          <h2
            class="font-display text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
          >
            You might get a story
          </h2>

          <!-- Image and copy -->
          <div
            class="mt-8.5 grid grid-cols-1 items-center gap-6.5 min-[821px]:grid-cols-[minmax(0,320px)_minmax(0,1fr)] min-[821px]:gap-9"
          >
            <figure class="m-0 min-w-0">
              <img
                :src="foxyCalypso"
                alt="Foxy Callwood performing with his guitar"
                class="block h-auto w-full rounded-lg shadow-[0_18px_40px_rgba(6,48,56,0.2)]"
              />

              <figcaption
                class="mt-2.5 font-mono text-[0.9rem] uppercase leading-[1.4] tracking-[0.06em] text-[rgba(6,48,56,0.7)]"
              >
                Philicianno “Foxy” Callwood
              </figcaption>
            </figure>

            <div class="min-w-0">
              <p
                class="m-0 font-body text-2xl leading-[1.62] text-sand sm:text-2xl"
              >
                Foxy built this place with a guitar and a fast rhyme, making up calypso about whoever had just walked up the beach.<br>
                He still holds court here &mdash; stories, jokes, and a knack for finding the one thing about you worth a laugh.
              </p>

              <div
                class="mt-6 rounded-lg border border-[rgba(6,48,56,0.16)] bg-[rgba(255,248,231,0.52)] px-5 pb-5 pt-4.5 sm:px-6 sm:pb-6 sm:pt-5.5"
              >
                <h3
                  class="mb-2 font-body text-[1.25rem] font-extrabold leading-[1.3] text-sand sm:text-[1.34rem]"
                >
                  Your part is easy
                </h3>

                <p
                  class="m-0 font-body text-[1.15rem] leading-[1.55] text-sand sm:text-[1.19rem]"
                >
                  Say hello. Ask what Great Harbour looked like in 1968, or where the tamarind tree stood. He's been talking to people who wandered in off boats since the beginning, and he'll out-quip most of them. You might just get a story. <br>Look by the Beach BBQ buffet area for Foxy most mornings and early afternoons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
</template>
