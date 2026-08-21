<script setup lang="ts">
import oldYearsNightHero from '@/assets/oyn/old-years-night-hero.webp'
</script>

<template>
  <section
    id="old-years-night-hero"
    class="px-4.5 pt-11 pb-6 sm:px-6 sm:pt-19 sm:pb-9"
  >
    <div
      class="
        media-lift
        relative
        mx-auto
        flex
        min-h-130
        w-full
        max-w-360
        aspect-4/5
        items-center
        justify-center
        overflow-hidden
        rounded-[20px]
        border-4
        border-accent
        bg-no-repeat
        px-6
        text-center

        sm:min-h-110
        sm:aspect-1835/1000
      "
      :style="{
        backgroundImage: `url(${oldYearsNightHero})`,
      }"
    >
      <!-- overlays -->
      <div
        aria-hidden="true"
        class="
          absolute
          inset-0
          bg-[radial-gradient(120%_90%_at_50%_40%,rgba(8,20,24,0.04)_0%,rgba(8,20,24,0.28)_65%,rgba(8,20,24,0.52)_100%)]
        "
      />

      <div
        aria-hidden="true"
        class="
          absolute
          inset-0
          bg-[linear-gradient(180deg,rgba(11,130,146,0.30)_0%,rgba(11,20,30,0.08)_40%,rgba(8,20,24,0.52)_100%)]
        "
      />

       <!-- Content -->
      <div
        class="relative z-10 flex w-full flex-col items-center"
      >
        <span
          class="
            mb-4.5
            inline-flex
            rounded-full
            bg-accent
            px-5
            py-2
            font-navigation
            text-[1.15rem]
            font-bold
            uppercase
            tracking-[0.2em]
            text-[#0A7C89]
            shadow-[0_4px_14px_rgba(0,0,0,0.35)]
          "
        >
          Flagship annual event
        </span>

        <h1
          class="
            font-display
            text-[clamp(3.3rem,9.2vw,6.6rem)]
            font-normal
            uppercase
            leading-[0.95]
            tracking-[0.01em]
            text-accent
            [text-shadow:0_3px_12px_rgba(0,0,0,0.85),0_6px_34px_rgba(0,0,0,0.7)]
          "
        >
          Old Year's Night
        </h1>

        <p
          class="
            mt-4.5
            max-w-212.5
            font-body
            text-[clamp(1.8rem,3.9vw,2.6rem)]
            font-semibold
            italic
            leading-[1.05]
            text-[#FF8A73]
            [text-shadow:0_2px_6px_rgba(0,0,0,0.28),0_0_18px_rgba(0,0,0,0.18)]
          "
        >
          The one night this whole island tips over
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
#old-years-night-hero > div {
  background-size: 130% auto;
  background-position: 81% 42%;
}

@media (max-width: 640px) {
  #old-years-night-hero > div {
    background-size: cover;
    background-position: center 38%;
  }
}
</style>