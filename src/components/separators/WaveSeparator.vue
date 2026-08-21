<template>
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
</template>

<style scoped>

.wave3 {
  animation: wave-drift-back 18s linear infinite;
}

.wave2 {
  animation: wave-drift-middle 14s linear infinite;
}

.wave1 {
  animation: wave-drift-front 10s linear infinite;
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
@media (prefers-reduced-motion: reduce) {
  .wave {
    animation: none;
  }
}
</style>