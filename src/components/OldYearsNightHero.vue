<script setup lang="ts">
import oldYearsNightHero from '../assets/oyn/old-years-night-hero.jpg'
</script>

<template>
  <section
    id="old-years-night-hero"
    class="relative flex min-h-svh items-center justify-center overflow-hidden px-5 pb-16 pt-32 text-center sm:px-6"
  >
    <!-- Background -->
    <img
      :src="oldYearsNightHero"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 h-full w-full object-cover object-[center_38%] md:object-[center_42%]"
    />

    <!-- Radial darkening -->
    <div
      aria-hidden="true"
      class="absolute inset-0 [background:var(--oyn-hero-radial-overlay)]"
    />

    <!-- Vertical overlay -->
    <div
      aria-hidden="true"
      class="absolute inset-0 [background:var(--oyn-hero-vertical-overlay)]"
    />

    <!-- Content -->
    <div
      class="relative z-10 mx-auto flex w-full max-w-250 flex-col items-center"
    >
      <span
        class="mb-4.5 inline-flex rounded-full bg-oyn-accent px-5 py-2 font-mono text-[0.82rem] font-bold uppercase tracking-[0.2em] text-oyn-hero-badge-foreground shadow-oyn-hero-badge sm:text-[0.98rem]"
      >
        Flagship annual event
      </span>

      <h1
        class="font-display text-[clamp(3.3rem,9.2vw,6.6rem)] font-normal uppercase leading-[0.95] tracking-[0.01em] text-accent text-shadow-(--theme-oyn-hero-title-shadow)"
      >
        Old Year's Night
      </h1>

      <p
        class="mt-4.5 max-w-212.5 font-hand text-[clamp(2.2rem,5.4vw,3.6rem)] font-bold leading-[1.05] text-oyn-hero-tagline text-shadow-(--theme-oyn-hero-tagline-shadow)"
      >
        The one night this whole island tips over.
      </p>

      <div
        aria-hidden="true"
        class="mt-5.5 h-0.5 w-16 bg-oyn-accent/75"
      />
    </div>
            <!-- Scroll cue -->
        <button
          type="button"
          class="absolute bottom-5.5 left-1/2 z-10 -translate-x-1/2 font-mono text-[0.3rem] uppercase tracking-[0.16em] text-oyn-foreground/90"
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
  </section>
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