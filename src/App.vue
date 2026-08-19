<script setup lang="ts">
import { 
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'

import NormalHero from '@/components/NormalHero.vue'
import SectionWhyHere from '@/components/SectionWhyHere.vue'
import SectionAfterDark from '@/components/SectionAfterDark.vue'
import SectionTheWalls from '@/components/SectionTheWalls.vue'
import SectionFoxyCalypso from '@/components/SectionFoxyCalypso.vue'
import SectionVisitUs from '@/components/SectionVisitUs.vue'
import GoogleReviews from '@/components/GoogleReviews.vue'
import PostcardMaker from '@/components/PostcardMaker.vue'
import OldYearsNight from '@/components/OldYearsNight.vue'
import OldYearsNightHero from '@/components/OldYearsNightHero.vue'
import foxysLogo from './assets/foxys-logo.png'
import foxyTailBlack from './assets/logos/foxy-tail-black.svg'

import { API_URL } from '@/config/api'

const travelAbortController = new AbortController()


const familyMembers: FamilyMember[] = [
  {
    role: 'Founder',
    name: 'Philicianno "Foxy" Callwood',
    description:
      'Quick with a song, a joke, or a story, Foxy has been welcoming visitors to "his island" for five decades. He\'s received numerous awards for his contributions to heritage and tourism in the British Virgin Islands, including an MBE (Member of the British Empire) from H.M. Queen Elizabeth II.',
    borderClass: 'border-t-family-founder',
  },
  {
    role: 'Co-founder',
    name: 'Tessa Callwood',
    description:
      'Tessa met a young Foxy Callwood in 1972, crewing together across the Atlantic aboard the schooner Nordyls. When they reached Jost Van Dyke, Foxy invited her ashore, and the two became partners in business and in life. "That," Tessa says, "is how I started my life enmeshed in the web of creation and drama that was to be the hallmarks of the Foxy\'s brand" — first as the beach bar\'s chief cook, then as wife and mother, all while dreaming up the parties and events that became a Foxy\'s hallmark.',
    borderClass: 'border-t-family-cofounder',
  },
  {
    role: 'Second generation',
    name: 'Justine Callwood',
    description:
      "The first-born child of Foxy and Tessa, and a sixth-generation Jost Van Dyke islander, Justine was quite literally raised in the bar. A graduate of Lehigh University with a degree in Business Administration and English, she's gone on to launch other bars and restaurants in the US and BVI — including our sister location, Foxy's Taboo, along with Barefoot Buddha and Jumbie's.",
    borderClass: 'border-t-family-nextgen',
  },
]

const navigation: NavigationItem[] = [
  {
    name: 'Home',
    tab: 'home',
  },
  {
    name: "Old Year's Night",
    tab: 'oyn',
  },
  {
    name: 'Eat & Drink',
    tab: 'menu',
  },
  {
    name: 'Events',
    tab: 'events',
  },
  {
    name: 'Shop',
    tab: 'shop',
  },
  {
    name: 'Our Story',
    tab: 'story',
  },
  {
    name: 'Plan Your Trip',
    tab: 'plan',
  },
]
const activeTab = ref<SiteTab>('home')

const tabFromHash: Record<string, SiteTab> = {
  home: 'home',

  menu: 'menu',

  oyn: 'oyn',
  nye: 'oyn',
  'old-years-night': 'oyn',
  reserve: 'oyn',

  plan: 'plan',
  journey: 'plan',
  visit: 'plan',

  story: 'story',
  about: 'story',
  why: 'story',

  shop: 'shop',
  foxhole: 'shop',

  events: 'events',
  faq: 'events',
  newsletter: 'events',
  'private-events': 'events',
  contact: 'events',
}

const mobileMenuOpen = ref<boolean>(false)

const visibleFamilyCards = ref<Set<number>>(new Set())

const visitSection = ref<HTMLElement | null>(null)
const visitVisible = ref(false)
const tabooSection = ref<HTMLElement | null>(null)
const tabooVisible = ref(false)
const menuSection = ref<HTMLElement | null>(null)
const menuVisible = ref(false)
const afterDarkSection = ref<HTMLElement | null>(null)
const afterDarkVisible = ref(false)
const journeySection = ref<HTMLElement | null>(null)
const journeyVisible = ref(false)
const journeyTrack = ref<HTMLElement | null>(null)
const arrivalSection = ref<HTMLElement | null>(null)
const arrivalVisible = ref(false)
const boatArrived = ref(false)

const crossingConditions = reactive({
  temperature: '—',
  wind: '—',
  waveHeight: '—',
  note: 'Loading live conditions…',
})

const checkoutCreating = ref(false)
const checkoutOrder = ref<CheckoutOrder | null>(null)

const cartItems = ref<CartItem[]>([])
const cartOpen = ref(false)
const cartValidating = ref(false)
const cartError = ref('')
const validatedCart = ref<ValidatedCartResponse | null>(null)

const cartItemCount = computed(() => {
  return cartItems.value.reduce(
    (total, item) => total + item.quantity,
    0,
  )
})

const cartSubtotalCents = computed(() => {
  if (validatedCart.value) {
    return validatedCart.value.subtotalCents
  }

  return cartItems.value.reduce(
    (total, item) =>
      total
      + item.unitPriceCents * item.quantity,
    0,
  )
})

//paypal checkout
const deliveryTelephone = ref('')

const deliveryTelephoneError = computed(() => {
  const telephone =
    deliveryTelephone.value.trim()

  if (telephone === '') {
    return ''
  }

  if (!telephone.startsWith('+')) {
    return 'Mobile number must start with + and include the country code.'
  }

  /*
   * Ignore formatting characters when checking
   * the international number length.
   */
  const normalized =
    '+'
    + telephone
      .slice(1)
      .replace(/\D/g, '')

  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    return 'Please enter a valid mobile number with country code.'
  }

  return ''
})

const paypalButtonContainer = ref<HTMLElement | null>(null)

const paypalCapturing = ref(false)
const paymentComplete = ref(false)

const paidOrder =
  ref<PaidOrderResponse['order'] | null>(
    null
  )

let cartValidationRequestId = 0

let familyObserver: IntersectionObserver | null = null

let menuObserver: IntersectionObserver | null = null

let travelObserver: IntersectionObserver | null = null

let boatObserver: IntersectionObserver | null = null

type SiteTab =
  | 'home'
  | 'oyn'
  | 'menu'
  | 'events'
  | 'story'
  | 'shop'
  | 'plan'

type TicketKey =
  | 'entry'
  | 'vip'
  | 'bbq'
  | 'crust'

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

type CartItem = {
  ticketTypeId: number
  key: TicketKey
  name: string
  quantity: number
  unitPriceCents: number
  minimumPerOrder: number
  maximumPerOrder: number | null
}

type ValidatedCartItem = {
  ticketTypeId: number
  key: TicketKey
  name: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
  available: number | null
  minimumPerOrder: number
  maximumPerOrder: number | null
}

//PayPal Checkout Order Response
type PayPalApprovalData = {
  orderID: string
}

type PayPalButtonsOptions = {
  fundingSource?: string

  style?: {
    layout?: 'vertical' | 'horizontal'
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black'
    shape?: 'rect' | 'pill'
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay'
  }

  createOrder: () => Promise<string>

  onApprove: (
    data: PayPalApprovalData,
  ) => Promise<void>

  onCancel?: () => void

  onError?: (
    error: unknown,
  ) => void
}

type PayPalButtonsInstance = {
  render: (
    container: HTMLElement | string,
  ) => Promise<void>
}

type PayPalNamespace = {
  FUNDING: {
    PAYPAL: string
  }

  Buttons: (
    options: PayPalButtonsOptions,
  ) => PayPalButtonsInstance
}

declare global {
  interface Window {
    paypal?: PayPalNamespace
  }
}

type CreatePayPalOrderResponse = {
  paypalOrderId: string
  status: string | null
}

type PaidOrderResponse = {
  order: {
    id: string
    status: 'paid'
    paypalCaptureId: string | null

    payer: {
      name: string | null
      email: string | null
      telephone: string | null
    }

    items: ValidatedCartItem[]
    itemCount: number
    totalCents: number
    currency: string
    paidAt: string | null
  }
}
// end Paypal Checkout Order Response

type ValidatedCartResponse = {
  valid: true

  event: {
    id: number
    slug: string
    name: string
    eventDate: string
    currency: string
  }

  items: ValidatedCartItem[]
  itemCount: number
  subtotalCents: number
  currency: string
}

type ApiValidationError = {
  message?: string
  errors?: Record<string, string[]>
}

type CheckoutOrder = {
  id: string
  status: 'pending_payment'
  reservationExpiresAt: string

  event: {
    id: number
    slug: string
    name: string
    eventDate: string
  }

  items: ValidatedCartItem[]
  itemCount: number
  subtotalCents: number
  totalCents: number
  currency: string
}

type CreateOrderResponse = {
  order: CheckoutOrder
}

interface NavigationItem {
  name: string
  tab: SiteTab
}

interface FamilyMember {
  role: string
  name: string
  description: string
  borderClass: string
}

function showTab(
  tab: SiteTab,
  updateHash = true,
): void {
  activeTab.value = tab
  mobileMenuOpen.value = false

  if (updateHash) {
    window.history.replaceState(
      null,
      '',
      `#${tab}`,
    )
  }

  /*
   * Change content immediately and return to the top.
   * There is no animated journey through all the hidden sections.
   */
  void nextTick(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    })
  })
}

function loadTabFromHash(): void {
  const hash = window.location.hash
    .replace(/^#/, '')
    .trim()

  const matchingTab = tabFromHash[hash]

  if (matchingTab) {
    showTab(matchingTab, false)
  }
}

async function loadCrossingConditions(): Promise<void> {
  try {
    const weatherUrl =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=18.4446' +
      '&longitude=-64.7486' +
      '&current=temperature_2m,wind_speed_10m' +
      '&temperature_unit=fahrenheit' +
      '&wind_speed_unit=mph' +
      '&timezone=America%2FPuerto_Rico'

    const marineUrl =
      'https://marine-api.open-meteo.com/v1/marine' +
      '?latitude=18.4446' +
      '&longitude=-64.7486' +
      '&current=wave_height' +
      '&timezone=America%2FPuerto_Rico'

    const [weatherResponse, marineResponse] = await Promise.all([
      fetch(weatherUrl, {
        signal: travelAbortController.signal,
      }),
      fetch(marineUrl, {
        signal: travelAbortController.signal,
      }),
    ])

    if (!weatherResponse.ok || !marineResponse.ok) {
      throw new Error('Conditions request failed.')
    }

    const weatherData = await weatherResponse.json()
    const marineData = await marineResponse.json()

    const temperature = weatherData?.current?.temperature_2m
    const wind = weatherData?.current?.wind_speed_10m
    const waveMeters = marineData?.current?.wave_height

    if (temperature != null) {
      crossingConditions.temperature =
        `${Math.round(Number(temperature))}°F`
    }

    if (wind != null) {
      crossingConditions.wind =
        `${Math.round(Number(wind))} mph`
    }

    if (waveMeters != null) {
      const waveFeet = Number(waveMeters) * 3.281

      crossingConditions.waveHeight =
        `${waveFeet.toFixed(1)} ft`

      if (waveFeet < 3) {
        crossingConditions.note =
          'Looks like a calm crossing — always confirm with your captain or ferry operator.'
      } else if (waveFeet < 5) {
        crossingConditions.note =
          'Could be a little bumpy — check with your captain or ferry operator before departing.'
      } else {
        crossingConditions.note =
          'Choppier than usual — confirm with your captain or ferry operator before you cross.'
      }
    } else {
      crossingConditions.note =
        'Live wave data is unavailable right now — check with your captain or ferry operator.'
    }
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === 'AbortError'
    ) {
      return
    }

    console.error('Conditions fetch error:', error)

    crossingConditions.note =
      'Could not load live conditions — check a marine forecast before you cross.'
  }
}

function addTicketToCart(
  ticket: TicketTier,
): void {
  if (
    paymentComplete.value
    || paidOrder.value
  ) {
    startNewTransaction()
  }

  cartError.value = ''

  const existingItem = cartItems.value.find(
    (item) => item.ticketTypeId === ticket.id,
  )

  if (existingItem) {
    const nextQuantity =
      existingItem.quantity + 1

    if (
      existingItem.maximumPerOrder !== null
      && nextQuantity
        > existingItem.maximumPerOrder
    ) {
      cartError.value =
        `${ticket.name} is limited to `
        + `${existingItem.maximumPerOrder} per order.`

      cartOpen.value = true
      return
    }

    existingItem.quantity = nextQuantity
  } else {
    cartItems.value.push({
      ticketTypeId: ticket.id,
      key: ticket.key,
      name: ticket.name,

      quantity: Math.max(
        1,
        ticket.minimumPerOrder,
      ),

      unitPriceCents: ticket.priceCents,

      minimumPerOrder:
        ticket.minimumPerOrder,

      maximumPerOrder:
        ticket.maximumPerOrder,
    })
  }

  cartOpen.value = true

  void validateCart()
}

function removeCartItem(
  ticketTypeId: number,
): void {
  cartItems.value = cartItems.value.filter(
    (item) =>
      item.ticketTypeId !== ticketTypeId,
  )

  cartError.value = ''
  validatedCart.value = null

  if (cartItems.value.length > 0) {
    void validateCart()
  }
}

function setCartQuantity(
  ticketTypeId: number,
  quantity: number,
): void {
  const item = cartItems.value.find(
    (cartItem) =>
      cartItem.ticketTypeId === ticketTypeId,
  )

  if (!item || !Number.isInteger(quantity)) {
    return
  }

  const minimum = item.minimumPerOrder

  const maximum =
    item.maximumPerOrder ?? 50

  item.quantity = Math.min(
    maximum,
    Math.max(minimum, quantity),
  )

  validatedCart.value = null

  void validateCart()
}

function handleCartQuantityChange(
  ticketTypeId: number,
  event: Event,
): void {
  const input =
    event.target as HTMLInputElement

  setCartQuantity(
    ticketTypeId,
    Number(input.value),
  )
}

function getFirstApiError(
  data: ApiValidationError,
): string {
  const firstErrorGroup = data.errors
    ? Object.values(data.errors)[0]
    : undefined

  return firstErrorGroup?.[0]
    ?? data.message
    ?? 'The cart could not be validated.'
}

async function validateCart(): Promise<void> {
  const requestId =
    ++cartValidationRequestId

  if (cartItems.value.length === 0) {
    validatedCart.value = null
    cartError.value = ''
    cartValidating.value = false
    return
  }

  cartValidating.value = true
  cartError.value = ''

  try {
    const response = await fetch(
      `${API_URL}/events/old-years-night-2026/cart/validate`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          items: cartItems.value.map(
            (item) => ({
              ticketTypeId:
                item.ticketTypeId,

              quantity:
                item.quantity,
            }),
          ),
        }),
      },
    )

    const data = (await response.json()) as
      | ValidatedCartResponse
      | ApiValidationError

    /*
     * Ignore an older response if a newer cart
     * validation request has already started.
     */
    if (requestId !== cartValidationRequestId) {
      return
    }

    if (!response.ok) {
      throw new Error(
        getFirstApiError(
          data as ApiValidationError
        )
      )
    }

    validatedCart.value =
      data as ValidatedCartResponse
  } catch (error) {
    if (requestId !== cartValidationRequestId) {
      return
    }

    validatedCart.value = null

    cartError.value =
      error instanceof Error
        ? error.message
        : 'The cart could not be validated.'
  } finally {
    if (requestId === cartValidationRequestId) {
      cartValidating.value = false
    }
  }
}

function formatMoney(
  amountCents: number,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100)
}

async function createCheckoutOrder(): Promise<void> {
  if (
    cartItems.value.length === 0
    || cartValidating.value
    || checkoutCreating.value
  ) {
    return
  }

  checkoutCreating.value = true
  cartError.value = ''

  try {
    /*
     * Revalidate immediately before reserving.
     */
    await validateCart()

    if (!validatedCart.value) {
      return
    }

    const response = await fetch(
      `${API_URL}/events/old-years-night-2026/orders`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          items: cartItems.value.map(
            (item) => ({
              ticketTypeId:
                item.ticketTypeId,

              quantity:
                item.quantity,
            }),
          ),

          deliveryTelephone:
            deliveryTelephone.value.trim() || null,
            
        }),
      },
    )

    const data = (await response.json()) as
      | CreateOrderResponse
      | ApiValidationError

    if (!response.ok) {
      throw new Error(
        getFirstApiError(
          data as ApiValidationError
        )
      )
    }

    checkoutOrder.value =
      (data as CreateOrderResponse).order
  } catch (error) {
    checkoutOrder.value = null

    cartError.value =
      error instanceof Error
        ? error.message
        : 'Checkout could not be started.'
  } finally {
    checkoutCreating.value = false
  }
}

// paypal checkout: the PayPal SDK’s createOrder callback should return the PayPal order ID, and 
// onApprove should call the server-side capture endpoint.
async function createPayPalOrder(
  localOrderId: string,
): Promise<string> {
  if (deliveryTelephoneError.value) {
    cartError.value =
      deliveryTelephoneError.value

    throw new Error(
      deliveryTelephoneError.value
    )
  }
  const response = await fetch(
    `${API_URL}/orders/${localOrderId}/paypal`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        deliveryTelephone:
          deliveryTelephone.value.trim()
          || null,
      }),
    },
  )

  const data = await readJsonResponse<
    CreatePayPalOrderResponse
    | ApiValidationError
  >(response)

  if (!response.ok) {
    throw new Error(
      getFirstApiError(
        data as ApiValidationError,
      ),
    )
  }

  return (
    data as CreatePayPalOrderResponse
  ).paypalOrderId
}

async function capturePayPalOrder(
  localOrderId: string,
): Promise<void> {
  paypalCapturing.value = true
  cartError.value = ''

  try {
    const response = await fetch(
      `${API_URL}/orders/${localOrderId}/paypal/capture`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({}),
      },
    )

    const data = await readJsonResponse<
      CreatePayPalOrderResponse
      | ApiValidationError
    >(response)

    if (!response.ok) {
      throw new Error(
        getFirstApiError(
          data as ApiValidationError,
        ),
      )
    }

    paidOrder.value =
      (data as PaidOrderResponse).order

    paymentComplete.value = true

    cartItems.value = []
    validatedCart.value = null
  } catch (error) {
    cartError.value =
      error instanceof Error
        ? error.message
        : 'Payment could not be confirmed.'
  } finally {
    paypalCapturing.value = false
  }
}

async function renderPayPalButtons(): Promise<void> {
  const paypal = window.paypal
  const container =
    paypalButtonContainer.value

  const localOrder =
    checkoutOrder.value

  if (!localOrder || !container) {
    return
  }

  if (!paypal) {
    cartError.value =
      'PayPal could not be loaded. Please refresh the page.'

    return
  }

  /*
   * Remove a prior button instance if this
   * function runs again.
   */
  container.replaceChildren()

  try {
    await paypal
      .Buttons({
        /*
         * Show only the PayPal wallet button for
         * this first integration.
         */
        fundingSource:
          paypal.FUNDING.PAYPAL,

        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },

        createOrder: async () => {
          return createPayPalOrder(
            localOrder.id
          )
        },

        onApprove: async () => {
          await capturePayPalOrder(
            localOrder.id
          )
        },

        onCancel: () => {
          cartError.value =
            'PayPal checkout was cancelled. Your tickets remain reserved until the displayed expiration time.'
        },

        onError: (error) => {
          console.error(
            'PayPal checkout error:',
            error,
          )

          cartError.value =
            'PayPal checkout encountered an error. Please try again.'
        },
      })
      .render(container)
  } catch (error) {
    console.error(
      'Unable to render PayPal buttons:',
      error,
    )

    cartError.value =
      'PayPal checkout could not be displayed.'
  }
}
// end paypal checkout

// safe response parser
async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const responseText = await response.text()

  if (!responseText.trim()) {
    throw new Error(
      `The server returned an empty response `
      + `(${response.status} ${response.statusText}).`,
    )
  }

  try {
    return JSON.parse(responseText) as T
  } catch {
    console.error(
      'Non-JSON server response:',
      responseText,
    )

    throw new Error(
      `The server returned an invalid response `
      + `(${response.status} ${response.statusText}).`,
    )
  }
}

// checkoutOrder watcher: when a new order is created, render the PayPal buttons
watch(
  checkoutOrder,
  async (order) => {
    if (
      !order
      || paymentComplete.value
    ) {
      return
    }

    await nextTick()

    await renderPayPalButtons()
  },
)

// clear the cart and reset the checkout state when the user clicks another ticket purchase
function startNewTransaction(): void {
  paymentComplete.value = false
  paidOrder.value = null
  checkoutOrder.value = null

  cartError.value = ''
  validatedCart.value = null

  checkoutCreating.value = false
  paypalCapturing.value = false
}

onMounted(() => {
  loadTabFromHash()
  // void loadBurgees()

  window.addEventListener(
    'hashchange',
    loadTabFromHash,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'hashchange',
    loadTabFromHash,
  )
})

onMounted(async () => {
  await nextTick()

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (reducedMotion) {
    visibleFamilyCards.value = new Set(
      familyMembers.map((_, index) => index),
    )

    return
  }

  familyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        const card = entry.target as HTMLElement
        const index = Number(card.dataset.familyIndex)

        visibleFamilyCards.value = new Set([
          ...visibleFamilyCards.value,
          index,
        ])

        familyObserver?.unobserve(card)
      })
    },
    {
      threshold: 0.2,
    },
  )

  document
    .querySelectorAll<HTMLElement>('[data-family-card]')
    .forEach((card) => {
      familyObserver?.observe(card)
    })
})

onBeforeUnmount(() => {
  familyObserver?.disconnect()
})

onMounted(() => {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (reducedMotion) {
    menuVisible.value = true
    return
  }

  menuObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        return
      }

      menuVisible.value = true
      menuObserver?.disconnect()
    },
    {
      threshold: 0.15,
    },
  )

  if (menuSection.value) {
    menuObserver.observe(menuSection.value)
  }
})

onBeforeUnmount(() => {
  menuObserver?.disconnect()
})

onMounted(() => {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (reducedMotion) {
    journeyVisible.value = true
    arrivalVisible.value = true
    afterDarkVisible.value = true
    boatArrived.value = true
  } else {
    travelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          if (entry.target === journeySection.value) {
            journeyVisible.value = true
          }

          if (entry.target === arrivalSection.value) {
            arrivalVisible.value = true
          }

          if (entry.target === afterDarkSection.value) {
            afterDarkVisible.value = true
          }

          travelObserver?.unobserve(entry.target)
        })
      },
      {
        threshold: 0.15,
      },
    )

    if (journeySection.value) {
      travelObserver.observe(journeySection.value)
    }

    if (afterDarkSection.value) {
      travelObserver.observe(afterDarkSection.value)
    }

    if (arrivalSection.value) {
      travelObserver.observe(arrivalSection.value)
    }

    boatObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        boatArrived.value = true
        boatObserver?.disconnect()
      },
      {
        threshold: 0.5,
      },
    )

    if (journeyTrack.value) {
      boatObserver.observe(journeyTrack.value)
    }
  }

  void loadCrossingConditions()
})

onBeforeUnmount(() => {
  travelObserver?.disconnect()
  boatObserver?.disconnect()
})

let locationObserver: IntersectionObserver | null = null

onMounted(() => {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  // Always show the sections when animation is unavailable or disabled
  if (
    reducedMotion ||
    !('IntersectionObserver' in window)
  ) {
    visitVisible.value = true
    tabooVisible.value = true
    return
  }

  locationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        if (entry.target === visitSection.value) {
          visitVisible.value = true
        }

        if (entry.target === tabooSection.value) {
          tabooVisible.value = true
        }

        locationObserver?.unobserve(entry.target)
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    },
  )

  if (visitSection.value) {
    locationObserver.observe(visitSection.value)
  } else {
    visitVisible.value = true
  }

  if (tabooSection.value) {
    locationObserver.observe(tabooSection.value)
  } else {
    tabooVisible.value = true
  }
})

onBeforeUnmount(() => {
  locationObserver?.disconnect()
})

</script>

<template>
  <div class="min-h-screen bg-page">
    <!-- Header -->
      <header
    class="fixed inset-x-0 top-0 z-50 overflow-visible border-b border-navbar-divider bg-navbar backdrop-blur"
  >
    <nav
      class="relative mx-auto flex h-18 max-w-7xl items-center justify-between overflow-visible px-4 sm:px-6 lg:px-8"
      aria-label="Main navigation"
  >
        <a
          href="#"
          class="relative z-20 block h-18 w-47.5 shrink-0 sm:w-56.25 lg:w-62.5"
          aria-label="Foxy's menu"
          @click="mobileMenuOpen = false"
        >
          <img
            :src="foxysLogo"
            alt="Foxy's"
            class="absolute left-0 top-1 w-47.5 max-w-none object-contain drop-shadow-md sm:w-56.25 lg:w-62.5"
          />
        </a>

        <!-- Desktop navigation -->
        <div class="hidden items-center gap-8 md:flex">
          <div
            class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pl-4 scrollbar-none sm:pl-8 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Website sections"
          >
            <button
              v-for="item in navigation"
              :key="item.tab"
              type="button"
              class="relative shrink-0 overflow-visible rounded-full border px-4 py-2 font-body text-sm font-black uppercase tracking-[0.02em] transition"
              :class="[
                activeTab === item.tab
                  ? 'border-navbar-active bg-navbar-active text-navbar-active-foreground'
                  : 'border-navbar-border bg-transparent text-navbar-foreground hover:border-navbar-border hover:text-navbar-foreground hover:bg-surface-muted',

                item.tab === 'oyn' ? 'oyn-nav-button' : '',

                item.tab === 'oyn' && activeTab === item.tab
                  ? 'is-active'
                  : '',
              ]"
              :aria-selected="activeTab === item.tab"
              :aria-controls="`tab-panel-${item.tab}`"
              @click="showTab(item.tab)"
            >
              <!-- Old Year's Night sparkles -->
              <template v-if="item.tab === 'oyn'">
                <span
                  class="oyn-star left-1.25 top-0.5 text-[8px]"
                  style="animation-delay: 0s"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <span
                  class="oyn-star right-1.25 top-0.5 text-[7px]"
                  style="animation-delay: 0.55s"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <span
                  class="oyn-star bottom-0.5 left-3 text-[6px]"
                  style="animation-delay: 0.95s"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <span
                  class="oyn-star bottom-0.5 right-3 text-[8px]"
                  style="animation-delay: 0.3s"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <span
                  class="oyn-star left-[38%] top-px text-[6px]"
                  style="animation-delay: 1.2s"
                  aria-hidden="true"
                >
                  ✦
                </span>

                <span
                  class="oyn-star bottom-px right-[32%] text-[7px]"
                  style="animation-delay: 0.75s"
                  aria-hidden="true"
                >
                  ✦
                </span>
              </template>

              <span class="relative z-10">
                {{ item.name }}
              </span>
            </button>
          </div>

          
        </div>

        <!-- Mobile menu button -->
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-lg text-navbar-icon hover:bg-navbar-icon/10 focus:outline-none focus:ring-2 focus:ring-accent md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>

          <svg
            v-else
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </nav>

      <!-- Mobile navigation -->
      <div
        v-show="mobileMenuOpen"
        id="mobile-menu"
        class="border-t border-navbar-divider bg-navbar-mobile-surface px-4 py-4 shadow-lg sm:hidden"
      >
        <div class="mx-auto flex max-w-7xl flex-col gap-1">
          <button
            v-for="item in navigation"
            :key="item.tab"
            type="button"
            class="rounded-lg px-4 py-3 text-left font-body font-semibold transition"
            :class="
              activeTab === item.tab
                ? 'bg-accent/10 text-accent'
                : 'text-navbar-icon hover:bg-navbar-icon/10 hover:text-accent'
            "
            :aria-current="
              activeTab === item.tab
                ? 'page'
                : undefined
            "
            @click="showTab(item.tab)"
          >
            {{ item.name }}
          </button>

          <a
            href="#reserve"
            class="mt-3 rounded-lg bg-accent px-4 py-3 text-center font-semibold text-accent-foreground hover:bg-accent-hover"
            @click="mobileMenuOpen = false"
          >
            Reserve
          </a>
        </div>
      </div>
    </header>

    <main>
      <!-- Old Year's Night hero -->
      <OldYearsNightHero
        v-if="activeTab === 'oyn'"
      />

      <!-- Home hero -->
      <NormalHero
        v-else-if="activeTab === 'home'"
      />

      <!-- Why Here -->
      <SectionWhyHere
        v-if="activeTab === 'home'"
      />

    <!-- After Dark -->
      <SectionAfterDark
        v-if="activeTab === 'home'"
      />

      <!-- The Walls -->
      <SectionTheWalls
        v-if="activeTab === 'home'"
      />

      <!-- Foxy Calypso -->
      <SectionFoxyCalypso
        v-if="activeTab === 'home'"
      />

      <!-- Visit-->
      <SectionVisitUs
        v-if="activeTab === 'home'"
      />

      <!-- Reviews -->  
      <GoogleReviews
        v-show="activeTab === 'home'"
      />

      <!-- Foxy's Postcard Generator -->
      <PostcardMaker
        v-show="activeTab === 'home'"
        :logo-src="foxyTailBlack"
      />

      <!-- Old Year's Night content -->
      <OldYearsNight
        v-show="activeTab === 'oyn'"
        @buy-ticket="addTicketToCart"
      />

    </main>
    <!-- Cart button -->
    <button
      v-if="cartItemCount > 0 || (paymentComplete && paidOrder)"
      type="button"
      class="fixed bottom-5 right-5 z-40 rounded-full bg-accent px-5 py-3 font-body font-black text-accent-foreground shadow-xl"
      @click="cartOpen = true"
    >
      <template v-if="paymentComplete && paidOrder">
        View order
      </template>

      <template v-else>
        Cart ({{ cartItemCount }})
      </template>
    </button>

    <!-- Cart overlay -->
    <div
      v-if="cartOpen"
      class="fixed inset-0 z-50 bg-overlay"
      @click.self="cartOpen = false"
    >
      <aside
        class="ml-auto flex h-full w-full max-w-md flex-col bg-cart-surface pl-8 pr-6 py-6 text-cart-foreground shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Your ticket cart"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-display text-3xl uppercase">
            Your cart
          </h2>

          <button
            type="button"
            class="rounded-full p-2 text-2xl"
            aria-label="Close cart"
            @click="cartOpen = false"
          >
            ×
          </button>
        </div>

        <!-- Completed payment -->
        <!-- Successful payment -->
        <div
          v-if="paymentComplete && paidOrder"
          class="mt-6 flex flex-1 flex-col"
        >
          <div
            class="rounded-lg border border-success-border/40 bg-overlay-soft px-5 py-4"
          >
            <p
              class="font-body text-lg font-black text-success"
            >
              Payment complete
            </p>

            <p
              class="mt-2 font-body text-sm text-inverse/85"
            >
              Order {{ paidOrder.id }}
            </p>

            <p
              v-if="paidOrder.payer.email"
              class="mt-1 font-body text-sm text-inverse/85"
            >
              Confirmation email:
              {{ paidOrder.payer.email }}
            </p>

            <p
              class="mt-3 font-body font-black text-success"
            >
              {{ formatMoney(paidOrder.totalCents) }}
            </p>
          </div>
        </div>

        <!-- Cart has added items -->
        <div
          v-if="cartItems.length"
          class="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-2 scrollbar-gutter-stable"
        >
          <article
            v-for="item in cartItems"
            :key="item.ticketTypeId"
            class="rounded-lg border border-cart-foreground/20 p-4"
          >
            <div class="flex justify-between gap-4">
              <div>
                <h3 class="font-body font-black">
                  {{ item.name }}
                </h3>

                <p class="mt-1 text-sm text-cart-foreground/75">
                  {{ formatMoney(item.unitPriceCents) }}
                  each
                </p>
              </div>

              <button
                type="button"
                class="text-sm font-bold text-accent"
                @click="removeCartItem(item.ticketTypeId)"
              >
                Remove
              </button>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <label
                :for="`quantity-${item.ticketTypeId}`"
                class="font-body text-sm"
              >
                Quantity
              </label>

              <input
                :id="`quantity-${item.ticketTypeId}`"
                type="number"
                :min="item.minimumPerOrder"
                :max="item.maximumPerOrder ?? 50"
                :value="item.quantity"
                class="w-20 rounded-md bg-input-surface px-3 py-2 text-input-foreground"
                @change="
                  handleCartQuantityChange(
                    item.ticketTypeId,
                    $event,
                  )
                "
              />
            </div>

            <p class="mt-3 text-right font-black">
              {{
                formatMoney(
                  item.unitPriceCents * item.quantity
                )
              }}
            </p>
          </article>
        </div>

        <div
          v-if="cartItems.length"
          class="mt-6 border-t border-cart-foreground/20 pt-5"
        >
          <div class="flex justify-between font-body text-lg font-black">
            <span>Subtotal</span>

            <span>
              {{ formatMoney(cartSubtotalCents) }}
            </span>
          </div>

          <div class="mt-5">
            <label
              for="delivery-telephone"
              class="block font-body font-bold text-cart-foreground"
            >
              Mobile number
              <span class="font-normal text-cart-foreground/60">
                (optional)
              </span>
            </label>

            <p class="mt-1 font-body text-sm text-cart-foreground/70">
              Enter a mobile number if you'd like your
              tickets delivered by SMS as well as email.
            </p>

            <input
              id="delivery-telephone"
              v-model="deliveryTelephone"
              type="tel"
              autocomplete="tel"
              placeholder="+1 284 555 1234"
              class="mt-3 w-full rounded-lg border border-cart-foreground/25 bg-overlay-faint px-4 py-3 font-body text-cart-foreground placeholder:text-cart-foreground/40"
            >
            <p
              v-if="deliveryTelephoneError"
              class="mt-2 font-body text-sm font-bold text-danger"
              role="alert"
            >
              {{ deliveryTelephoneError }}
            </p>
          </div>

          <!-- Before local order creation -->
          <button
            v-if="!checkoutOrder"
            type="button"
            class="mt-5 w-full rounded-lg bg-accent px-5 py-4 font-body font-black text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="
              cartValidating
              || checkoutCreating
              || !validatedCart
              || Boolean(cartError)
              || Boolean(deliveryTelephoneError)
            "
            @click="createCheckoutOrder"
          >
            <template v-if="checkoutCreating">
              Reserving tickets…
            </template>

            <template v-else-if="cartValidating">
              Checking cart…
            </template>

            <template v-else>
              Continue to checkout
            </template>
          </button>



          <!-- Reserved order and PayPal -->
          <div
            v-else
            class="mt-5"
          >
            <div
              class="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3"
            >
              <p class="font-body font-black text-warning">
                Your tickets are temporarily reserved.
              </p>

              <p class="mt-1 font-body text-sm text-cart-foreground/80">
                Complete payment before
                {{
                  new Intl.DateTimeFormat(
                    'en-US',
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                    },
                  ).format(
                    new Date(
                      checkoutOrder.reservationExpiresAt
                    ),
                  )
                }}.
              </p>
            </div>

            <div
              ref="paypalButtonContainer"
              class="mt-4 min-h-11"
            ></div>

            <p
              v-if="paypalCapturing"
              class="mt-3 text-center font-body text-sm font-bold text-warning"
              aria-live="polite"
            >
              Confirming your payment…
            </p>
          </div>
        </div>

        <!-- Empty cart message -->
        <p
          v-else
          class="mt-8 text-cart-foreground/75"
        >
          Your cart is empty.
        </p>
        <!-- Cart error message -->
        <p
          v-if="cartError"
          class="mt-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 font-body text-sm font-bold text-accent"
        >
          {{ cartError }}
        </p>
      </aside>
    </div>
  
    <!-- Footer -->
    <footer class="border-t border-footer-foreground/15 bg-footer-surface">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-8 text-center sm:px-6 md:flex-row md:text-left lg:px-8"
      >
        <a
          href="#home"
          class="block shrink-0"
          aria-label="Foxy's home"
        >
          <img
            :src="foxysLogo"
            alt="Foxy's"
            class="block h-auto w-37.5 object-contain sm:w-43.75"
          >
        </a>

        <p class="font-hand text-2xl text-footer-foreground sm:text-3xl">
          See you in Jost Van Dyke!
        </p>

        <p class="font-body text-right text-xs text-footer-muted">
          © {{ new Date().getFullYear() }} Foxy’s Tamarind Bar and Restaurant.<br> All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.burgee{
    background: 
      linear-gradient(
        100deg, 
        var(--theme-burgee-gradient-start) 0%, 
        var(--theme-burgee-gradient-mid) 55%, 
        var(--theme-burgee-gradient-end) 100%
        );

    clip-path: 
      polygon(
        0 0, 
        62% 0, 
        100% 50%, 
        62% 100%, 
        0 100%); 
        
    padding:12px 46px 12px 18px; 
    min-height:112px;
    display:flex; 
    flex-direction:column; 
    justify-content:center; 
    opacity:0; 
    transform:scale(.85);
    transition:opacity .5s ease, transform .5s ease; 
    box-shadow: 3px 6px 10px var(--theme-burgee-shadow);
    animation: burgee-enter 650ms ease-out forwards;
    }

    @keyframes burgee-enter {
      from {
        opacity: 0;
        transform: translateY(22px) rotate(-1deg);
      }

      to {
        opacity: 1;
        transform: translateY(0) rotate(0deg);
      }
    }
  .burgee:nth-child(3n){transform:scale(.85) rotate(-1.5deg);}
  .burgee:nth-child(3n+1){transform:scale(.85) rotate(1deg);}
  .burgee.in-view:nth-child(3n){transform:rotate(-1.5deg);}
  .burgee.in-view:nth-child(3n+1){transform:rotate(1deg);}
  .burgee.in-view{opacity:1; transform:none;}
  .burgee b{font-size:1.0rem; line-height:1.26; color:var(--theme-burgee-label); display:block;}
  .burgee span{font-family:var(--font-family-mono); font-size:0.75rem; color:var(--theme-burgee-meta); margin-top:3px; display:block;}
  @media (prefers-reduced-motion: reduce){ .burgee{transition:none;} }

.burgee::before {
  content: '';
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      150deg,
      var(--theme-burgee-highlight),
      transparent 42%
    );

  pointer-events: none;
}

.burgee::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;

  background: var(--theme-burgee-edge);
}

.burgee:hover {
  transform:
    translateY(-5px)
    rotate(0deg)
    scale(1.025);

  filter: drop-shadow(
    0 14px 18px var(--theme-burgee-hover-shadow)
  );
}

.burgee-tilt-left {
  transform: rotate(-1.2deg);
}

.burgee-tilt-right {
  transform: rotate(1.2deg);
}

.burgee-content {
  position: relative;
  z-index: 1;
  width: 76%;
  padding: 18px 8px 18px 26px;
}

.burgee-name {
  margin: 0;

  color: var(--theme-burgee-title);

  font-family: var(--font-family-mono);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.15;
}

.burgee-location {
  margin: 7px 0 0;

  color: var(--theme-burgee-muted);

  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, 'Liberation Mono', monospace;
  font-size: 0.82rem;
  line-height: 1.25;
}

@media (max-width: 639px) {
  .burgee {
    min-height: 126px;
  }

  .burgee-content {
    padding-left: 30px;
  }

  .burgee-name {
    font-size: 1.2rem;
  }

  .burgee-location {
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .burgee {
    transition: none;
  }

  .burgee:hover {
    transform: none;
  }
}

@keyframes oyn-button-glow {
  0%,
  100% {
    box-shadow:
      inset 0 0 0 0 var(--theme-oyn-glow-transparent),
      0 0 0 0 var(--theme-oyn-glow-transparent);
  }

  50% {
    box-shadow:
      inset 0 0 10px 2px var(--theme-oyn-glow-medium),
      0 0 9px 1px var(--theme-oyn-glow-soft);
  }
}

@keyframes oyn-star-twinkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.3) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1) rotate(20deg);
  }
}

.oyn-nav-button:not(.is-active) {
  animation: oyn-button-glow 2.4s ease-in-out infinite;
}

.oyn-star {
  position: absolute;
  z-index: 20;
  color: var(--theme-oyn-sparkle);
  line-height: 1;
  pointer-events: none;
  text-shadow: 0 0 5px var(--theme-oyn-glow-strong);
  animation: oyn-star-twinkle 1.8s ease-in-out infinite;
}

.oyn-nav-button.is-active {
  animation: none;
  box-shadow: none;
}

.oyn-nav-button.is-active .oyn-star {
  opacity: 0;
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .oyn-nav-button,
  .oyn-star {
    animation: none;
  }

  .oyn-star {
    opacity: 0;
  }
}
</style>