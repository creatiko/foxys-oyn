<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'

import { API_URL } from '@/config/api'

import girlsDancingVideo from '@/assets/oyn/20260112_Foxys_OYN_ThankYou_720_28s_V7.mp4'
import girlsDancingPoster from '@/assets/oyn/20260112_Foxys_OYN_ThankYou_720_28s_V7.png'
import wheelandBrothersImage from '@/assets/oyn/wheeland-brothers.jpg'
import maxxCabelloImage from '@/assets/oyn/Maxx-Photo4_header_bg_1920x856.jpg'
import greenhouseBandImage from '@/assets/oyn/greenhouse-band.jpg'
import rashidiImage from '@/assets/oyn/MC-Rashidi.jpg'
import djDean from '@/assets/oyn/DjDean-on-black.png'
import oynCrowdImage from '@/assets/oyn/oyn-crowd.jpg'
import oynChampagneImage from '@/assets/oyn/oyn-champagne.jpg'
import oynToastImage from '@/assets/oyn/oyn-toast.jpg'
import venueMapAll from '@/assets/oyn/venue-map-all.jpeg'
import venueMapEntry from '@/assets/oyn/venue-map-entry.jpeg'
import venueMapVip from '@/assets/oyn/venue-map-vip.jpeg'
import venueMapBbq from '@/assets/oyn/venue-map-bbq.jpeg'
import venueMapCrust from '@/assets/oyn/venue-map-crust.jpeg'

type PlanGroup = 'arrival' | 'stay' | 'size'
type ArrivalChoice = 'yacht' | 'ferry' | 'charter'
type StayChoice = 'overnight' | 'day'
type SizeChoice = 'couple' | 'group' | 'crew'
type TicketKey = 'entry' | 'vip' | 'bbq' | 'crust'

type PlanSelections = {
  arrival: ArrivalChoice | null
  stay: StayChoice | null
  size: SizeChoice | null
}

type Artist = {
  role: string
  name: string
  image: string
  alt: string
  objectPosition?: string
  bio: string
  spotifyUrl: string
  spotifyEmbedUrl: string
  links?: Array<{
    label: string
    url: string
  }>
}

type TimelineItem = {
  time: string
  title: string
  description: string
}

type TicketTier = {
  id: number
  key: TicketKey
  name: string

  priceCents: number
  price: string
  priceSuffix: string
  alternatePrice?: string

  features: string[]

  inventoryAvailable: number | null
  minimumPerOrder: number
  maximumPerOrder: number | null
  soldOut: boolean

  backgroundClass: string
  activeClass: string
}

type TicketApiTier = {
  id: number
  key: string
  name: string

  priceCents: number
  priceSuffix: string | null
  alternatePrice: string | null

  features: string[]

  inventory: {
    total: number | null
    sold: number
    available: number | null
  }

  minimumPerOrder: number
  maximumPerOrder: number | null
  soldOut: boolean
}

type TicketApiResponse = {
  event: {
    id: number
    slug: string
    name: string
    eventDate: string
    timezone: string
    currency: string
  }

  ticketTypes: TicketApiTier[]
}

const ticketStyles: Record<
  TicketKey,
  {
    backgroundClass: string
    activeClass: string
  }
> = {
  entry: {
    backgroundClass: 'bg-oyn-ticket-entry',
    activeClass: 'ring-oyn-ticket-entry-ring',
  },

  vip: {
    backgroundClass: 'bg-oyn-ticket-vip',
    activeClass: 'ring-oyn-ticket-vip-ring',
  },

  bbq: {
    backgroundClass: 'bg-oyn-ticket-bbq',
    activeClass: 'ring-oyn-ticket-bbq-ring',
  },

  crust: {
    backgroundClass: 'bg-oyn-ticket-crust',
    activeClass: 'ring-oyn-ticket-crust-ring',
  },
}

type VenueMap = {
  src: string
  alt: string
  note: string
}

const emit = defineEmits<{
  buyTicket: [ticket: TicketTier]
}>()

type OYNGalleryImage = {
  src: string
  alt: string
  caption: string
}

const OYNGalleryImages: OYNGalleryImage[] = [
  {
    src: oynCrowdImage,
    alt: "The crowd with their hands raised at a past Old Year's Night",
    caption: 'The whole beach becomes the dance floor',
  },
  {
    src: oynChampagneImage,
    alt: 'Champagne and celebration on the sand',
    caption: 'One island. One legendary midnight.',
  },
  {
    src: oynToastImage,
    alt: 'Guests toasting under string lights and crowns',
    caption: 'The old year goes out loud',
  },
]

const artists: Artist[] = [
  {
    role: 'Headliner',
    name: 'The Wheeland Brothers',
    image: wheelandBrothersImage,
    alt: 'The Wheeland Brothers walking on the beach with buoys and a ukulele',
    objectPosition: 'center 38%',
    bio:
      'Two Southern California surfers blending surf rock, reggae, hip hop, and acoustic pop into a playful, good-time sound. Their album <a href="https://shopwheelandbrothers.com/products/pacific-vibrations-cd" target="_blank" rel="noopener noreferrer">Pacific Vibration</a> made them fan favorites on <a href="https://www.siriusxm.com/channels/no-shoes-radio" target="_blank" rel="noopener noreferrer">Sirius XM\'s No Shoes Radio</a> and <a href="https://www.siriusxm.com/channels/radio-margaritaville" target="_blank" rel="noopener noreferrer">Radio Margaritaville</a>, where their single “Song To The Sun” was the most played track of summer 2022 on both stations. They have shared stages with 311, Slightly Stoopid, Donavon Frankenreiter, and Michael Franti, played Tortuga Music Festival and Kaaboo Del Mar, and were personally picked by Kenny Chesney to open his 2022 summer tour.',
    spotifyUrl: 'https://open.spotify.com/artist/5mabMBNdrC8AIPmjpiqvEq',
    spotifyEmbedUrl:
      'https://open.spotify.com/embed/artist/5mabMBNdrC8AIPmjpiqvEq?utm_source=generator',
  },
  {
    role: 'Opening act',
    name: 'Maxx Cabello',
    image: maxxCabelloImage,
    alt: 'Maxx Cabello sitting with his guitar inside a vintage truck',
    bio:
      'Tattoos & Blues — The American music flame will never go out as long as artists such as Maxx Cabello Jr. take the torch and keep it burning. This amazing guitarist, soulful vocalist, and prolific songwriter hails from the streets of the San Francisco Bay Area, where he is turning heads and bending the ears of veteran musicians and music aficionados. Straight out of the South Bay, this quiet-spoken, polite college student turns into a powerful and captivating artist when he begins to play the guitar.',
    spotifyUrl: 'https://open.spotify.com/artist/48WyHYmPh1KSoKsKU5QDcp',
    spotifyEmbedUrl:
      'https://open.spotify.com/embed/artist/48WyHYmPh1KSoKsKU5QDcp?utm_source=generator',
  },
  {
    role: 'Also performing',
    name: 'GreenHouse Band',
    image: greenhouseBandImage,
    alt: 'GreenHouse Band, four musicians in green outfits',
    bio:
      'An international sensation that masterfully blends authentic Caribbean flavors with modern Top 40 hits and danceable rhythms. Led by veteran keyboardist Jazzique Chiverton — known to fans as “Golden Fingers” — who has toured internationally since age 15, the band delivers a powerful performance designed to get crowds on their feet. Known for their community-driven approach, they recently wrapped their 15-track album Green Energy, featuring the lead wave “First Surge,” bringing an unstoppable wave of modern reggae and soca pop to global audiences.',
    spotifyUrl: 'https://open.spotify.com/artist/7ta14nJJuEHZlbp62Jbu07',
    spotifyEmbedUrl:
      'https://open.spotify.com/embed/artist/7ta14nJJuEHZlbp62Jbu07?utm_source=generator',
  },
  {
    role: 'Returning MC',
    name: 'Rashidi',
    image: rashidiImage,
    alt: 'MC Rashidi returns to Foxy\'s Old Year\'s Night stage',
    objectPosition: 'center 30%',
    bio:
      "Foxy's favorite hype man is back on the mic. Rashidi keeps the crowd laughing between sets, gets everyone counting down together, and makes sure nobody's checked out before midnight hits.",
    spotifyUrl: '',
    spotifyEmbedUrl:
      '',
  },
  {
    role: 'Stay Tuned',
    name: 'Guests',
    image: '',
    alt: 'Lineup still filling in',
    bio:
      "We're still locking in one more act for the stage this year. Check back as December gets closer, or ask us in person for the latest.",
    spotifyUrl: '',
    spotifyEmbedUrl:
      '',
  },
  {
    role: 'Closing DJ',
    name: 'DJ Dean',
    image: djDean,
    alt: 'DJ Dean closes out the night at Foxy\'s Old Year\'s Night',
    bio:
      "Dean takes over out front once the bands wrap and DJs until the very last song of the night, keeping the sand packed long after midnight.",
    spotifyUrl: '',
    spotifyEmbedUrl:
      '',
  },
]

const timeline: TimelineItem[] = [
  {
    time: '8:15 PM',
    title: 'Maxx Cabello opens the night',
    description:
      "Maxx is back for another Old Year's Night — Bay Area blues guitar and soulful vocals that turn the beach into a sing-along from the first note.",
  },
  {
    time: '10:00 PM',
    title: 'The Wheeland Brothers take the stage',
    description:
      'This is when it stops being a beach bar and starts being a dance floor. Locals, yachties, and day-trippers all end up shoulder to shoulder.',
  },
  {
    time: '11:45 PM',
    title: 'GreenHouse Band takes over',
    description:
      'GreenHouse Band picks up the energy and carries the crowd toward midnight.',
  },
  {
    time: 'Midnight',
    title: 'The countdown',
    description:
      'For one minute, this speck of sand is the loudest place in the Caribbean — the whole beach counting down together, the anchored boats lit up across the harbour.',
  },
  {
    time: 'Just after midnight',
    title: 'GreenHouse Band keeps it going',
    description:
      "GreenHouse Band keeps playing on for the crowd that is not ready to let the year go yet.",
  },
  {
    time: '1:15 AM',
    title: 'DJ Dean closes it out',
    description:
      'Dean takes over out front and DJs until the very last song of the night.',
  },
]

const countdown = reactive({
  days: '0',
  hours: '00',
  minutes: '00',
  seconds: '00',
})

let countdownInterval: number | undefined

function updateCountdown(): void {
  const target = new Date('2026-12-31T23:59:59-04:00').getTime()
  const difference = Math.max(0, target - Date.now())

  countdown.days = String(Math.floor(difference / 86_400_000))
  countdown.hours = String(
    Math.floor((difference % 86_400_000) / 3_600_000),
  ).padStart(2, '0')
  countdown.minutes = String(
    Math.floor((difference % 3_600_000) / 60_000),
  ).padStart(2, '0')
  countdown.seconds = String(
    Math.floor((difference % 60_000) / 1_000),
  ).padStart(2, '0')
}

function addOldYearsToCalendar(): void {
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: "Old Year's Night at Foxy's",
    dates: '20261231T220000/20270101T060000',
    details:
      'The Wheeland Brothers headlining, Maxx Cabello opening, plus GreenHouse Band. Great Harbour, Jost Van Dyke, BVI.',
    location: 'Great Harbour, Jost Van Dyke, British Virgin Islands',
  })

  window.open(
    `https://www.google.com/calendar/render?${query.toString()}`,
    '_blank',
    'noopener,noreferrer',
  )
}

const selections = reactive<PlanSelections>({
  arrival: null,
  stay: null,
  size: null,
})

const itineraryBuilt = ref(false)
const itineraryHeadline = ref('Your Midnight Journey')
const itinerarySteps = ref<string[]>([])
const itineraryResult = ref<HTMLElement | null>(null)

const canBuildNight = computed(() => {
  return Boolean(selections.arrival && selections.stay && selections.size)
})

const planOptions = {
  arrival: [
    { value: 'yacht', label: 'By yacht' },
    { value: 'ferry', label: 'Ferry' },
    { value: 'charter', label: 'Private charter' },
  ],
  stay: [
    { value: 'overnight', label: 'Overnight on JVD' },
    { value: 'day', label: 'Day trip back to Tortola' },
  ],
  size: [
    { value: 'couple', label: 'Just us (1–2)' },
    { value: 'group', label: 'Small group (3–6)' },
    { value: 'crew', label: 'Full crew (7+)' },
  ],
} as const

function selectPlanOption(group: PlanGroup, value: string): void {
  if (group === 'arrival') {
    selections.arrival = value as ArrivalChoice
  } else if (group === 'stay') {
    selections.stay = value as StayChoice
  } else {
    selections.size = value as SizeChoice
  }

  itineraryBuilt.value = false
}

const arrivalCopy: Record<ArrivalChoice, string[]> = {
  yacht: [
    "Clear customs at West End or Sopers Hole if you're arriving from the US side.",
    "Pick up a mooring ball in Great Harbour or White Bay — they fill up fast for Old Year's Night.",
    "Dinghy in to the beach; Foxy's is the one with decades of yacht flags on the ceiling.",
  ],
  ferry: [
    'Catch a ferry from West End, Tortola — several operators run the Jost Van Dyke route.',
    'The crossing runs roughly 25 minutes.',
    "You'll land right in Great Harbour, a short walk from Foxy's.",
  ],
  charter: [
    "Loop your charter captain in early — Old Year's Night is their busiest night of the year.",
    "Check who handles customs if you're coming from the US side — most captains sort it, but confirm.",
    "Ask about anchoring near Great Harbour versus White Bay for the walk to Foxy's.",
    'Confirm a pickup window for after midnight, since the whole bay gets busy.',
  ],
}

const stayCopy: Record<StayChoice, string[]> = {
  overnight: [
    "Book accommodation on JVD well ahead — rooms go early for Old Year's Night.",
    'No need to watch the last boat; enjoy the full night through breakfast.',
  ],
  day: [
    'Plan your last connection back to Tortola before crossings get busy.',
    "Some operators run special after-midnight return trips for Old Year's Night — worth asking ahead.",
  ],
}

const sizeCopy: Record<SizeChoice, string> = {
  couple:
    "Grab a spot near the dance floor — it's an easy place to end up dancing.",
  group:
    "Let Foxy's know your group size ahead of time if you want space together.",
  crew:
    'For 7+, reach out directly — larger groups are easier to seat with a heads-up.',
}

async function buildNight(): Promise<void> {
  if (!selections.arrival || !selections.stay || !selections.size) {
    return
  }

  const labels = {
    yacht: 'Yacht',
    ferry: 'Ferry',
    charter: 'Private Charter',
    overnight: 'Overnight',
    day: 'Day Trip',
  }

  itineraryHeadline.value =
    `Your Midnight Journey: ${labels[selections.arrival]} + ` +
    labels[selections.stay]

  itinerarySteps.value = [
    ...arrivalCopy[selections.arrival],
    ...stayCopy[selections.stay],
    sizeCopy[selections.size],
  ]

  itineraryBuilt.value = true
  await nextTick()
  itineraryResult.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  })
}

const tickets = ref<TicketTier[]>([])
const ticketsLoading = ref(false)
const ticketsError = ref('')

function isTicketKey(value: string): value is TicketKey {
  return [
    'entry',
    'vip',
    'bbq',
    'crust',
  ].includes(value as TicketKey)
}

function formatTicketPrice(
  priceCents: number,
  currency: string,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceCents / 100)
}

const venueMaps: Record<TicketKey | 'default', VenueMap> = {
  default: {
    src: venueMapAll,
    alt: "Foxy's Old Year's Night venue map showing all event areas",
    note: 'Choose a ticket tier to highlight the areas included with it.',
  },
  entry: {
    src: venueMapEntry,
    alt: 'Outback Entry access map with Foxhole, Tamarind Bar, Beach Level, and General Admission highlighted',
    note:
      'Outback Entry gets you General Admission, the Foxhole, Tamarind Bar, and Beach Level.',
  },
  vip: {
    src: venueMapVip,
    alt: 'Outback VIP access map with Foxhole, Tamarind Bar, Beach Level, General Admission, and Outback VIP highlighted',
    note:
      'Outback VIP adds the exclusive Outback VIP seating and lounge on top of everything Outback Entry includes.',
  },
  bbq: {
    src: venueMapBbq,
    alt: 'Upscale BBQ access map with Foxhole, Tamarind Bar, Beach Level, Upscale BBQ, and General Admission highlighted',
    note:
      'Upscale BBQ includes the sit-down BBQ at Beach Level, plus General Admission, Foxhole, and Tamarind Bar.',
  },
  crust: {
    src: venueMapCrust,
    alt: 'Upper Crust access map with Upper Crust, the second-floor Outback Buffet, Outback VIP, and the public event areas highlighted',
    note:
      "Upper Crust's elevated sit-down meal comes with Outback VIP, the second-floor Outback Buffet, General Admission, Foxhole, Tamarind Bar, and Beach Level.",
  },
}

const selectedTicket = ref<TicketKey | null>(null)
const venueMapSection = ref<HTMLElement | null>(null)
const currentVenueMap = computed(() => {
  return selectedTicket.value
    ? venueMaps[selectedTicket.value]
    : venueMaps.default
})

async function selectTicket(ticket: TicketTier): Promise<void> {
  selectedTicket.value = ticket.key
  await nextTick()
  venueMapSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

async function loadTickets(): Promise<void> {
  ticketsLoading.value = true
  ticketsError.value = ''
  

  try {
    const response = await fetch(
      `${API_URL}/events/old-years-night-2026/ticket-types`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    const data = (await response.json()) as
      | TicketApiResponse
      | { message?: string }

    if (!response.ok) {
      throw new Error(
        'message' in data && data.message
          ? data.message
          : 'Unable to load tickets.',
      )
    }

    const ticketResponse = data as TicketApiResponse

    tickets.value = ticketResponse.ticketTypes
      .filter((ticket): ticket is TicketApiTier & {
        key: TicketKey
      } => isTicketKey(ticket.key))
      .map((ticket) => ({
        id: ticket.id,
        key: ticket.key,
        name: ticket.name,

        priceCents: ticket.priceCents,

        price: formatTicketPrice(
          ticket.priceCents,
          ticketResponse.event.currency,
        ),

        priceSuffix: ticket.priceSuffix ?? '',

        alternatePrice:
          ticket.alternatePrice ?? undefined,

        features: ticket.features,

        inventoryAvailable:
          ticket.inventory.available,

        minimumPerOrder:
          ticket.minimumPerOrder,

        maximumPerOrder:
          ticket.maximumPerOrder,

        soldOut: ticket.soldOut,

        ...ticketStyles[ticket.key],
      }))
  } catch (error) {
    console.error('Unable to load tickets:', error)

    ticketsError.value =
      error instanceof Error
        ? error.message
        : 'Unable to load tickets.'
  } finally {
    ticketsLoading.value = false
  }
}

onMounted(() => {
  void loadTickets()
  updateCountdown()
  countdownInterval = window.setInterval(updateCountdown, 1_000)
})

onBeforeUnmount(() => {
  if (countdownInterval !== undefined) {
    window.clearInterval(countdownInterval)
  }
})
</script>

<template>
  <section
    id="tab-panel-oyn"
    aria-labelledby="old-years-night-title"
    class="bg-(image:--section-gradient-primary) text-foreground font-body"
  >
    
    <div
      id="oyn-intro"
      class="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <p class="text-left text-lg leading-relaxed sm:text-2xl">
        Once a year, this stretch of sand becomes the loudest place in the Caribbean.
        <br class="hidden sm:block" />
        Here's what Old Year's Night at Foxy's actually looks like.
      </p>

      <!-- Featured video -->
      <div
        class="mt-12 rounded-lg border-[5px] border-media-frame-border bg-media-frame-surface p-3.5 shadow-oyn-hero"
      >
        <div
          class="aspect-16/10 overflow-hidden rounded-md sm:aspect-video"
        >
          <video
            :src="girlsDancingVideo"
            :poster="girlsDancingPoster"
            class="h-full w-full object-cover"
            autoplay
            muted
            loop
            playsinline
            controls
            preload="metadata"
            aria-label="Guests dancing at Foxy's Old Year's Night celebration"
          >
            Your browser does not support this video.
          </video>
        </div>
      </div>

      <!-- Lineup -->
      <div id="oyn-lineup" class="scroll-mt-24 pt-20">
        <p
          class="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80 font-mono"
        >
          The 2026 lineup
        </p>
        <h2
          class="mt-2 text-[clamp(1.15rem,2.5vw,2rem)] leading-none text-foreground font-body"
        >
          Who's playing December 31, 2026
        </h2>

        <div
          class="mt-8 flex flex-wrap items-center gap-6 rounded-lg bg-(image:--oyn-lineup-gradient) px-6 py-5 text-oyn-foreground shadow-oyn-card"
        >
          <div>
            <span
              class="block text-sm font-semibold uppercase tracking-[0.14em] text-oyn-warm font-mono"
            >
              Headlining
            </span>
            <div
              class="mt-1 text-2xl uppercase leading-none font-body font-black sm:text-3xl"
            >
              The Wheeland Brothers
            </div>
          </div>
          <div class="text-lg text-oyn-muted sm:text-xl">
            with Maxx Cabello opening, plus GreenHouse Band
          </div>
        </div>

        <div class="mt-7 grid gap-5 lg:grid-cols-3">
          <article
            v-for="artist in artists"
            :key="artist.name"
            class="flex flex-col overflow-hidden rounded-lg bg-oyn-artist-surface text-oyn-foreground shadow-oyn-card"
          >
            <img
              v-if="artist.image"
              :src="artist.image"
              :alt="artist.alt"
              class="h-60 w-full object-cover"
              :style="artist.objectPosition ? { objectPosition: artist.objectPosition } : undefined"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-60 w-full flex-col items-center justify-center gap-2.5 bg-(image:--oyn-artist-placeholder) text-center"
            >
              <span
                aria-hidden="true"
                class="text-4xl leading-none text-oyn-foreground/55"
              >
                ♪
              </span>

              <span
                class="px-2 py-4 font-mono text-md uppercase leading-tight tracking-wide text-oyn-foreground/55"
              >
                {{ artist.alt }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-6">
              <p
                class="text-sm font-semibold uppercase tracking-[0.12em] text-oyn-role font-mono"
              >
                {{ artist.role }}
              </p>
              <h3
                class="mt-2 text-2xl leading-none font-body font-black sm:text-2xl"
              >
                {{ artist.name }}
              </h3>
              <p
                class="mt-4 text-base leading-relaxed text-oyn-foreground/80 [&_a]:font-semibold [&_a]:text-oyn-link [&_a]:underline [&_a]:decoration-oyn-link [&_a]:underline-offset-4 hover:[&_a]:decoration-oyn-link"
                v-html="artist.bio"
              ></p>

              <div v-if="artist.spotifyUrl || artist.spotifyEmbedUrl" class="mt-auto pt-6">
                <a
                  :href="artist.spotifyUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="font-semibold text-oyn-warm hover:underline"
                >
                  Listen on Spotify →
                </a>
                <iframe
                  class="mt-4 w-full rounded-xl"
                  :src="artist.spotifyEmbedUrl"
                  height="152"
                  frameborder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  :title="`${artist.name} on Spotify`"
                ></iframe>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-9 grid gap-4 lg:grid-cols-3">
          <figure
            v-for="image in OYNGalleryImages"
            :key="image.src"
            class="group overflow-hidden rounded-xl border-[5px] border-media-frame-border shadow-oyn-lift"
          >
            <img
              :src="image.src"
              :alt="image.alt"
              class="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </figure>
        </div>

      </div>

      <!-- Countdown -->
      <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" aria-live="polite">
        <div
          v-for="unit in [
            { value: countdown.days, label: 'Days' },
            { value: countdown.hours, label: 'Hours' },
            { value: countdown.minutes, label: 'Mins' },
            { value: countdown.seconds, label: 'Secs' },
          ]"
          :key="unit.label"
          class="rounded-lg bg-oyn-countdown-surface p-5 text-center text-oyn-foreground shadow-oyn-soft"
        >
          <div
            class="text-[clamp(2rem,5vw,3.25rem)] font-semibold tabular-nums font-mono text-shadow-(--oyn-countdown-glow)"
          >
            {{ unit.value }}
          </div>
          <div
            class="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-oyn-muted font-mono"
          >
            {{ unit.label }}
          </div>
        </div>
      </div>
      <!-- add to calendar button -->
      <button
        type="button"
        class="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-foreground/45 px-6 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-foreground hover:bg-foreground hover:text-inverse font-mono"
        @click="addOldYearsToCalendar"
      >
        Add to calendar
      </button>

      <!-- Timeline -->
      <div class="pt-20">
        <p
          class="text-sm uppercase tracking-wide text-foreground/80 font-mono"
        >
          How the night unfolds
        </p>

        <div class="relative mt-8 border-l-2 border-foreground/30 pl-7">
          <article
            v-for="item in timeline"
            :key="`${item.time}-${item.title}`"
            class="relative pb-9 last:pb-0"
          >
            <span
              class="absolute -left-8.5 top-1 size-3 rounded-full bg-oyn-timeline-accent ring-1 ring-oyn-timeline-accent"
              aria-hidden="true"
            ></span>
            <p
              class="text-sm font-normal uppercase tracking-[0.08em] text-foreground font-mono"
            >
              {{ item.time }}
            </p>
            <h3 class="mt-1 text-xl font-bold sm:text-2xl">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-xl leading-relaxed text-muted">
              {{ item.description }}
            </p>
          </article>
        </div>
      </div>

      <!-- Tickets -->
      <div id="reserve" class="scroll-mt-24 pt-20">
        <p
          class="text-sm uppercase tracking-wide text-foreground/80 font-mono"
        >
          Tickets
        </p>
        <h2
          class="mt-2 text-[clamp(1.15rem,2.5vw,2rem)] leading-none text-foreground font-body"
        >
          Four ways to spend the night &mdash; from Outback Entry to Upper Crust. <br>
          What changes is where you watch from and what is included.
        </h2>
        <p class="mt-4 max-w-3xl text-lg leading-relaxed sm:text-xl">
        </p>
        <div
          v-if="ticketsLoading"
          class="py-10 text-center font-body text-lg"
        >
          Loading tickets…
        </div>

        <p
          v-else-if="ticketsError"
          class="rounded-lg border border-oyn-error-border bg-oyn-error-surface px-5 py-4 font-body font-bold text-oyn-error"
        >
          {{ ticketsError }}
        </p>

        <div
          v-else class="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="ticket in tickets"
            :key="ticket.key"
            role="button"
            tabindex="0"
            class="relative flex cursor-pointer flex-col overflow-hidden rounded-lg p-5 text-oyn-foreground shadow-oyn-card transition hover:-translate-y-1 hover:shadow-oyn-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            :class="[
              ticket.backgroundClass,
              ticket.activeClass,
              selectedTicket === ticket.key ? 'ring-2 ring-offset-2 ring-offset-transparent' : '',
            ]"
            @click="selectTicket(ticket)"
            @keydown.enter.prevent="selectTicket(ticket)"
            @keydown.space.prevent="selectTicket(ticket)"
          >
            <div class="pointer-events-none absolute inset-0 bg-(image:--oyn-ticket-shine)"></div>

            <div class="relative z-10 flex h-full flex-col">
              <h3
                class="text-2xl leading-none font-black tracking-[0.02em] font-body"
              >
                {{ ticket.name }}
              </h3>
              <div class="mt-3 text-4xl font-mono">
                {{ ticket.price }}
                <span class="text-sm font-normal text-oyn-muted">
                  {{ ticket.priceSuffix }}
                </span>
              </div>
              <p
                v-if="ticket.alternatePrice"
                class="mt-1 text-sm text-oyn-muted font-mono"
              >
                {{ ticket.alternatePrice }}
              </p>

              <ul class="mt-4 flex flex-1 flex-col gap-2.5">
                <li
                  v-for="feature in ticket.features"
                  :key="feature"
                  class="flex gap-2 text-sm leading-relaxed text-oyn-muted sm:text-base"
                >
                  <span class="shrink-0 text-oyn-warm">—</span>
                  <span>{{ feature }}</span>
                </li>
              </ul>

              <button
                type="button"
                :disabled="ticket.soldOut"
                class="mt-5 min-h-11 rounded-full border border-oyn-foreground/60 bg-oyn-foreground/15 px-5 py-2.5 text-base font-bold uppercase tracking-wider text-oyn-foreground transition hover:border-oyn-foreground hover:bg-oyn-foreground hover:text-oyn-action-foreground font-mono"
                @click.stop="emit('buyTicket', ticket)"
              >
                {{ ticket.soldOut ? 'Sold out' : 'Buy now' }}
              </button>
              <!-- Added STOP to prevent the scroll to the map  @click="emit('buyTicket', ticket)" -->
            </div>
          </article>
        </div>

        <p class="mt-4 text-md font-semibold italic text-foreground">
          Outback VIP, Upscale BBQ and Upper Crust are limited.
        </p>

        <div
          ref="venueMapSection"
          class="mt-7 rounded-lg bg-oyn-venue-surface p-4 text-oyn-foreground shadow-oyn-card sm:p-5"
        >
          <p
            class="rounded border border-dashed border-oyn-foreground/45 bg-oyn-foreground/10 px-5 py-4 text-center text-lg font-extrabold font-mono sm:text-xl"
          >
            Click on a ticket to see where you'll be on the map below.
          </p>
          <img
            :src="currentVenueMap.src"
            :alt="currentVenueMap.alt"
            class="mt-4 block h-auto w-full rounded-lg"
            loading="lazy"
          />
          <p class="mt-4 text-sm italic leading-relaxed text-oyn-foreground/80 sm:text-base">
            {{ currentVenueMap.note }}
          </p>
        </div>
      </div>

      <!-- Trip builder -->
      <div class="pt-20">
        <p
          class="text-sm uppercase tracking-wide text-foreground/80 font-mono"
        >
          Plan your night
        </p>
        <p class="mt-0 text-xl leading-relaxed sm:text-2xl">
          Answer three questions and we'll put together the shape of your trip.
        </p>

        <div
          class="mt-7 rounded-lg bg-(image:--oyn-planner-gradient) px-4 py-6 text-oyn-foreground shadow-oyn-card sm:p-8"
        >
          <div class="grid gap-8 lg:grid-cols-3">
            <fieldset>
              <legend class="w-full">
                <span
                  class="inline-flex size-7 items-center justify-center rounded-full bg-oyn-foreground/15 text-sm font-bold font-mono"
                >
                  1
                </span>
                <span
                  class="mt-3 block text-sm font-semibold uppercase tracking-widest text-oyn-muted font-mono"
                >
                  How are you arriving?
                </span>
              </legend>
              <div class="mt-3 flex flex-col gap-2.5">
                <button
                  v-for="option in planOptions.arrival"
                  :key="option.value"
                  type="button"
                  class="min-h-11 w-full rounded-full border px-4 py-2.5 text-left text-base transition font-mono"
                  :class="
                    selections.arrival === option.value
                      ? 'border-oyn-accent bg-oyn-accent font-bold text-oyn-action-foreground'
                      : 'border-oyn-foreground/50 bg-oyn-foreground/10 text-oyn-foreground hover:border-oyn-foreground'
                  "
                  @click="selectPlanOption('arrival', option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend class="w-full">
                <span
                  class="inline-flex size-7 items-center justify-center rounded-full bg-oyn-foreground/15 text-sm font-bold font-mono"
                >
                  2
                </span>
                <span
                  class="mt-3 block text-sm font-semibold uppercase tracking-widest text-oyn-muted font-mono"
                >
                  Staying over, or day trip?
                </span>
              </legend>
              <div class="mt-3 flex flex-col gap-2.5">
                <button
                  v-for="option in planOptions.stay"
                  :key="option.value"
                  type="button"
                  class="min-h-11 w-full rounded-full border px-4 py-2.5 text-left text-base transition font-mono"
                  :class="
                    selections.stay === option.value
                      ? 'border-oyn-accent bg-oyn-accent font-bold text-oyn-action-foreground'
                      : 'border-oyn-foreground/50 bg-oyn-foreground/10 text-oyn-foreground hover:border-oyn-foreground'
                  "
                  @click="selectPlanOption('stay', option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend class="w-full">
                <span
                  class="inline-flex size-7 items-center justify-center rounded-full bg-oyn-foreground/15 text-sm font-bold font-mono"
                >
                  3
                </span>
                <span
                  class="mt-3 block text-sm font-semibold uppercase tracking-widest text-oyn-muted font-mono"
                >
                  Party size
                </span>
              </legend>
              <div class="mt-3 flex flex-col gap-2.5">
                <button
                  v-for="option in planOptions.size"
                  :key="option.value"
                  type="button"
                  class="min-h-11 w-full rounded-full border px-4 py-2.5 text-left text-base transition font-mono"
                  :class="
                    selections.size === option.value
                      ? 'border-oyn-accent bg-oyn-accent font-bold text-oyn-action-foreground'
                      : 'border-oyn-foreground/50 bg-oyn-foreground/10 text-oyn-foreground hover:border-oyn-foreground'
                  "
                  @click="selectPlanOption('size', option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </fieldset>
          </div>

          <button
            type="button"
            class="mx-auto mt-8 block min-h-12 min-w-60 rounded-full px-7 py-3 text-2xl font-black tracking-[0.06em] transition font-body enabled:bg-oyn-action-surface enabled:text-oyn-action-foreground enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-oyn-action-surface/35 disabled:text-oyn-action-foreground/55"
            :disabled="!canBuildNight"
            @click="buildNight"
          >
            Build my night
          </button>

          <div
            v-if="itineraryBuilt"
            ref="itineraryResult"
            class="mt-7 border-t border-dashed border-oyn-foreground/30 pt-6"
          >
            <h3
              class="text-2xl text-oyn-warm font-body font-black"
            >
              {{ itineraryHeadline }}
            </h3>
            <ul class="mt-4 flex flex-col gap-3">
              <li
                v-for="step in itinerarySteps"
                :key="step"
                class="flex items-start gap-3 text-base leading-relaxed text-oyn-muted sm:text-xl"
              >
                <span class="mt-2 size-0 shrink-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-oyn-timeline-accent"></span>
                <span>{{ step }}</span>
              </li>
            </ul>
            <p class="mt-5 text-sm italic leading-relaxed text-oyn-foreground/80">
              Ferry times, mooring availability, and charter pricing change by season — this is a starting shape for your trip, not a booking. Confirm specifics directly with Foxy's or your ferry or charter operator before you travel.
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>
