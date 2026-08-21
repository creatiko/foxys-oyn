<script setup lang="ts">
import { 
  computed,
  nextTick,
  ref,
  watch,
} from 'vue'

import OldYearsNight from '@/components/OldYearsNight.vue'
import FoxysLogo from '@/components/FoxysLogo.vue'
import foxysLogoPng from './assets/foxys-logo.png'
import SandSeparator from '@/components/separators/SandSeparator.vue'
import WaveSeparator from '@/components/separators/WaveSeparator.vue'

type SiteTheme = 'sand-v1' | 'tropical-v1'

const siteTheme = ref<SiteTheme>('sand-v1')

const separatorComponent = computed(() =>
  siteTheme.value === 'sand-v1'
    ? SandSeparator
    : WaveSeparator,
)

import { API_URL } from '@/config/api'

const navigation: NavigationItem[] = [
  {
    name: 'Home',
    key: 'home',
    href: 'https://foxysbar.com/',
  },
  {
    name: "Old Year's Night",
    key: 'oyn',
    href: '#old-years-night-hero',
  },
  {
    name: 'about',
    key: 'about',
    href: 'https://foxysbar.com/about-us/',
  },
  {
    name: 'Shop',
    key: 'shop',
    href: 'https://shopfoxysbvi.com/',
  },
  {
    name: 'Menus',
    key: 'menu',
    href: 'https://foxysbar.com/menus/',
  },
  {
    name: 'News',
    key: 'news',
    href: 'https://foxysbar.com/foxys-blog/',
  },
  {
    name: 'Events',
    key: 'events',
    href: 'https://foxysbar.com/events/',
  },
  {
    name: "Foxy's Taboo",
    key: 'taboo',
    href: 'https://foxysbar.com/foxys-taboo/',
  },
]

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

const mobileMenuOpen = ref(false)

const paypalButtonContainer = ref<HTMLElement | null>(null)

const paypalCapturing = ref(false)
const paymentComplete = ref(false)
const finalSaleAccepted = ref(false)

const paidOrder =
  ref<PaidOrderResponse['order'] | null>(
    null
  )

let cartValidationRequestId = 0

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

type NavigationKey =
  | 'home'
  | 'oyn'
  | 'about'
  | 'shop'
  | 'menu'
  | 'news'
  | 'events'
  | 'taboo'

interface NavigationItem {
  name: string
  key: NavigationKey
  href: string
}

function handleNavigation(
  item: NavigationItem,
  event: MouseEvent,
): void {
  mobileMenuOpen.value = false

  if (item.key !== 'oyn') {
    return
  }

  event.preventDefault()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
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

function addTicketToCart(
  ticket: TicketTier,
): void {
  if (
    paymentComplete.value
    || paidOrder.value
  ) {
    startNewTransaction()
  } else if (checkoutOrder.value) {
    resetPendingCheckout()
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
  if (checkoutOrder.value) {
    resetPendingCheckout()
  }

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

  if (checkoutOrder.value) {
    resetPendingCheckout()
  }

  const minimum = item.minimumPerOrder

  const maximum =
    item.maximumPerOrder ?? 50

  item.quantity = Math.min(
    maximum,
    Math.max(minimum, quantity),
  )

  validatedCart.value = null
  cartError.value = ''

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
    || !finalSaleAccepted.value
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

function resetPendingCheckout(): void {
  checkoutOrder.value = null
  checkoutCreating.value = false
  paypalCapturing.value = false

  cartError.value = ''
  validatedCart.value = null

  finalSaleAccepted.value = false

  paypalButtonContainer.value
    ?.replaceChildren()
}

// clear the cart and reset the checkout state when the user clicks another ticket purchase
function startNewTransaction(): void {
  paymentComplete.value = false
  paidOrder.value = null
  checkoutOrder.value = null

  cartError.value = ''
  validatedCart.value = null

  checkoutCreating.value = false
  paypalCapturing.value = false

  finalSaleAccepted.value = false
}

// NEWSLETTER SUBSCRIPTIONS
const newsletterWebsite = ref('')
const newsletterEmail = ref('')
const newsletterSubmitting = ref(false)
const newsletterMessage = ref('')
const newsletterStatus = ref<
  'idle' |
  'success' |
  'already' |
  'error'
>('idle')


async function submitNewsletter(): Promise<void> {
  if (newsletterSubmitting.value) {
    return
  }

  newsletterSubmitting.value = true
  newsletterMessage.value = ''
  newsletterStatus.value = 'idle'

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/subscribers`,
      {
        method: 'POST',

        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: newsletterEmail.value,
          website: newsletterWebsite.value,
        }),
      },
    )

    const data = await response.json()

    console.log('Subscriber response:', {
      status: response.status,
      ok: response.ok,
      data,
    })

    if (response.status === 429) {
      newsletterStatus.value = 'error'

      newsletterMessage.value =
        'Too many attempts. Please try again later.'

      return
    }

    if (!response.ok) {
      newsletterStatus.value = 'error'

      newsletterMessage.value =
        data?.errors?.email?.[0]
        ?? 'We couldn’t subscribe that email.'

      return
    }

    if (data.status === 'already_subscribed') {
      newsletterStatus.value = 'already'

      newsletterMessage.value =
        'You’re already subscribed.'

      return
    }

    newsletterStatus.value = 'success'

    newsletterMessage.value =
      'Thanks — you’re subscribed.'

    newsletterEmail.value = ''
  }
  catch {
    newsletterStatus.value = 'error'

    newsletterMessage.value =
      'We couldn’t subscribe you right now. Please try again.'
  }
  finally {
    newsletterSubmitting.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-(--palette-oyn-purple-deep) "  :data-theme="siteTheme">
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
            :src="foxysLogoPng"
            alt="Foxy's"
            class="absolute left-0 top-1 w-47.5 max-w-none object-contain drop-shadow-md sm:w-56.25 lg:w-62.5"
          />
        </a>

        <!-- Desktop navigation -->
        <div class="hidden items-center gap-8 2xl:flex">
          <div
            class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pl-4 scrollbar-none sm:pl-8 [&::-webkit-scrollbar]:hidden"
            aria-label="Website sections"
          >
            <a
              v-for="item in navigation"
              :key="item.key"
              :href="item.href"
              :target="item.key === 'shop' ? '_blank' : undefined"
              :rel="item.key === 'shop' ? 'noopener noreferrer' : undefined"
              class="relative shrink-0 overflow-visible rounded-full border px-4 py-2 font-navigation text-[1.22rem] font-black uppercase tracking-normal transition"
              :class="[
                'border-navbar-border bg-transparent text-navbar-foreground hover:border-navbar-active-border hover:bg-navbar-active hover:text-navbar-active-foreground',
                item.key === 'oyn' ? 'oyn-nav-button' : '',
              ]"
              @click="handleNavigation(item, $event)"
            >
              <!-- Old Year's Night sparkles -->
              <template v-if="item.key === 'oyn'">
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
            </a>
          </div>

          
        </div>

        <!-- Mobile menu button -->
        <button
          type="button"
          class="
            ml-3
            inline-flex
            min-h-11.5
            shrink-0
            items-center
            gap-2.5
            rounded-full
            border-[1.5px]
            border-sand/40
            bg-sand/8
            py-2.75
            pr-4.5
            pl-3.75
            text-sand
            2xl:hidden
            text-cream
          "
          aria-label="Open menu"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          @click="mobileMenuOpen = true"
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
          <span
            class="
              font-navigation
              text-[1.15rem]
              font-medium
              uppercase
              tracking-[0.04em]
            "
          >
            Menu
          </span>
        </button>
      </nav>

      <!-- Mobile menu backdrop -->
       <Teleport to="body">
        <!-- Backdrop -->
        <div
          class="
            fixed
            inset-0
            z-190
            bg-[rgba(4,20,24,0.62)]
            backdrop-blur-[3px]
            transition-[opacity,visibility]
            duration-280
            2xl:hidden
          "
          :class="
            mobileMenuOpen
              ? 'visible pointer-events-auto opacity-100'
              : 'invisible pointer-events-none opacity-0'
          "
          aria-hidden="true"
          @click="mobileMenuOpen = false"
        />

        <!-- Mobile drawer -->
        <aside
          id="mobile-menu"
          class="
            fixed
            inset-y-0
            right-0
            z-200
            flex
            h-dvh
            w-[min(88vw,420px)]
            flex-col
            bg-[linear-gradient(180deg,#0C2E36_0%,#0A2830_100%)]
            shadow-[-18px_0_48px_rgba(4,10,14,0.5)]
            transition-transform
            duration-300
            ease-[cubic-bezier(.22,.7,.3,1)]
            2xl:hidden
          "
          :class="
            mobileMenuOpen
              ? 'translate-x-0'
              : 'pointer-events-none translate-x-[102%]'
          "
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          :aria-hidden="!mobileMenuOpen"
        >
          <!-- Header -->
          <div
            class="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-cream/10
              pt-5.5
              pr-5
              pb-4
              pl-6
            "
          >
            <span class="font-display text-[1.7rem] text-cream">
              Where to?
            </span>

            <button
              type="button"
              class="
                flex
                size-11.5
                items-center
                justify-center
                rounded-full
                border-[1.5px]
                border-cream/25
                text-xl
                text-cream
              "
              aria-label="Close menu"
              @click="mobileMenuOpen = false"
            >
              ✕
            </button>
          </div>

          <!-- Navigation -->
          <nav
            class="
              flex
              min-h-0
              flex-1
              flex-col
              overflow-y-auto
              py-2
            "
          >
            <a
              v-for="item in navigation"
              :key="item.key"
              :href="item.href"
              :target="item.key === 'shop' ? '_blank' : undefined"
              :rel="item.key === 'shop' ? 'noopener noreferrer' : undefined"
              class="
                flex
                min-h-15
                shrink-0
                items-center
                border-b
                border-cream/5
                px-6
                font-navigation
                text-[1.34rem]
                font-medium
                transition-colors
              "
              :class="
                item.key === 'oyn'
                  ? 'bg-[rgba(212,175,95,0.16)] text-accent shadow-[inset_4px_0_0_currentColor]'
                  : 'text-cream  active:bg-cream/5'
              "
              @click="handleNavigation(item, $event)"
            >
              <span>
                {{ item.name }}

                <span
                  v-if="item.key === 'oyn'"
                  aria-hidden="true"
                  class="ml-2 text-[0.8em] text-accent "
                >
                  ✦
                </span>
              </span>
            </a>
          </nav>

          <!-- Footer -->
          <div
            class="
              shrink-0
              border-t
              border-cream/10
              px-6
              pt-4.5
              pb-[calc(20px+env(safe-area-inset-bottom))]
            "
          >
            <a
              href="tel:+12844423074"
              class="
                block
                py-2
                text-center
                font-navigation
                text-[1.15rem]
                text-cream/80
              "
            >
              Call +1 284 442-3074
            </a>
          </div>
        </aside>
      </Teleport>
    </header>

    <main>
      
      <component
        :is="separatorComponent"
        class="absolute inset-x-0 bottom-7.5 z-10"
        v-bind="
          siteTheme === 'sand-v1'
            ? {
                topColor: 'transparent',
                bottomColor: 'transparent',
                position: '0%',
              }
            : {}
        "
      /> 

      <!-- Old Year's Night content -->
      <OldYearsNight
      class="mt-10"
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
     <Teleport to="body">
        <!-- Cart backdrop -->
        <div
          class="
            fixed inset-0 z-210
            bg-overlay
            transition-opacity duration-280
            motion-reduce:transition-none
          "
          :class="
            cartOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          "
          @click="cartOpen = false"
        />

        <!-- Cart drawer -->
        <aside
          class="
            fixed inset-y-0 right-0 z-220
            flex h-dvh w-full max-w-md flex-col
            bg-white py-6 pr-6 pl-8
            text-sand shadow-2xl

            transition-transform duration-300
            ease-[cubic-bezier(.22,.7,.3,1)]
            motion-reduce:transition-none
          "
          :class="
            cartOpen
              ? 'translate-x-0'
              : 'pointer-events-none translate-x-[102%]'
          "
          role="dialog"
          aria-modal="true"
          aria-label="Your ticket cart"
          :aria-hidden="!cartOpen"
        >
                  <div class="flex items-center justify-between">
          <h2 class="font-display text-3xl uppercase">
            Your cart
          </h2>

          <button
              type="button"
              class="
                flex
                size-11.5
                items-center
                justify-center
                rounded-full
                border-[1.5px]
                border-black/25
                text-xl
                text-black
              "
              aria-label="Close cart"
              @click="cartOpen = false"
            >
              ✕
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
            class="rounded-lg border border-sand/20 p-4"
          >
            <div class="flex justify-between gap-4">
              <div>
                <h3 class="font-body font-black">
                  {{ item.name }}
                </h3>

                <p class="mt-1 text-sm text-sand/75">
                  {{ formatMoney(item.unitPriceCents) }}
                  each
                </p>
              </div>

              <button
                type="button"
                class="text-sm font-bold text-coral-bright"
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
          class="mt-6 border-t border-sand/20 pt-5"
        >
          <div class="flex justify-between font-body text-lg font-black">
            <span>Subtotal</span>

            <span>
              {{ formatMoney(cartSubtotalCents) }}
            </span>
          </div>

          <!-- <div class="mt-5">
            <label
              for="delivery-telephone"
              class="block font-body font-bold text-sand"
            >
              Mobile number
              <span class="font-normal text-sand/60">
                (optional)
              </span>
            </label>

            <p class="mt-1 font-body text-sm text-sand/70">
              Enter a mobile number if you'd like your
              tickets delivered by SMS as well as email.
            </p>

            <input
              id="delivery-telephone"
              v-model="deliveryTelephone"
              type="tel"
              autocomplete="tel"
              placeholder="+1 284 555 1234"
              class="mt-3 w-full rounded-lg border border-sand/25 bg-overlay-faint px-4 py-3 font-body text-sand placeholder:text-sand/40"
            >
            <p
              v-if="deliveryTelephoneError"
              class="mt-2 font-body text-sm font-bold text-coral-bright"
              role="alert"
            >
              {{ deliveryTelephoneError }}
            </p>
          </div> -->

          <div
            class="
              mt-5 rounded-lg
              border border-sand/20
              bg-overlay-faint
              px-4 py-3
            "
          >
            <p
              class="
                font-body text-sm leading-relaxed
                text-sand/80
              "
            >
              <strong class="font-black text-red-700">
                All ticket sales are final.
              </strong>
              If your travel plans change and you cannot make it
              to Foxy's, you are responsible for transferring your
              tickets to a third party.
            </p>
          </div>

          <!-- Before local order creation -->
          <div
            v-if="!checkoutOrder"
            class="mt-5"
          >
            <div
              class="
                rounded-lg
                border border-cart-foreground/20
                bg-overlay-faint
                px-4 py-4
              "
            >
              <p
                id="final-sale-policy"
                class="
                  font-body text-sm leading-relaxed
                  text-cart-foreground/80
                "
              >
                <strong
                  class="
                    font-black
                    text-cart-foreground
                  "
                >
                  All ticket sales are final.
                </strong>

                If your travel plans change and you cannot make it
                to Foxy's, you are responsible for transferring your
                tickets to a third party.
              </p>

              <!-- Final sale acknowledgment -->
              <label
                for="final-sale-accepted"
                class="
                  mt-4 flex cursor-pointer
                  items-start gap-3
                  border-t border-cart-foreground/15
                  pt-4
                  font-body
                "
              >
                <input
                  id="final-sale-accepted"
                  v-model="finalSaleAccepted"
                  type="checkbox"
                  class="
                    mt-0.5 size-5 shrink-0
                    cursor-pointer
                    accent-accent
                  "
                  aria-describedby="final-sale-policy"
                >

                <span
                  class="
                    text-sm font-bold
                    text-cart-foreground
                  "
                >
                  I understand that ticket sales are final.
                </span>
              </label>
            </div>

            <button
              type="button"
              class="
                mt-4 w-full rounded-lg
                bg-orange-dark px-5 py-4
                font-body font-black
                text-accent-foreground
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
              :disabled="
                cartValidating
                || checkoutCreating
                || !validatedCart
                || Boolean(cartError)
                || Boolean(deliveryTelephoneError)
                || !finalSaleAccepted
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
          </div>

          <!-- Reserved order and PayPal -->
          <div
            v-else
            class="mt-5"
          >
            <div
              class="rounded-lg border border-orange-dark/40 bg-orange-dark/20 px-4 py-3"
            >
              <p class="font-body font-black text-black">
                Your tickets are temporarily reserved.
              </p>

              <p class="mt-1 font-body text-sm text-sand/80">
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
          class="mt-8 text-sand/75"
        >
          Your cart is empty.
        </p>
        <!-- Cart error message -->
        <p
          v-if="cartError"
          class="mt-2 rounded-lg  px-4 py-3 font-body text-sm font-bold text-coral-bright"
        >
          {{ cartError }}
        </p>

        </aside>
      </Teleport>


    <component
      :is="separatorComponent"
      class="absolute inset-x-0 bottom-0 z-10"
      v-bind="
        siteTheme === 'sand-v1'
          ? {
              topColor: 'transparent',
              bottomColor: 'bg-accent-deep',
              position: '0%',
            }
          : {}
      "
    /> 
  
    <!-- Footer -->
    <footer
      class="
        bg-accent-deep
        px-6
        py-14
        text-center
      "
    >
      <div class="mx-auto max-w-130">
        <!-- Foxy's logo -->
        <FoxysLogo
          color="white"
          class="mx-auto h-auto w-52"
        />

        <!-- Newsletter -->
        <div class="mx-auto mt-8 max-w-130">
          <h4
            class="
              mx-auto
              max-w-[26ch]
              font-display
              text-2xl
              font-normal
              uppercase
              tracking-[0.02em]
              text-cream
            "
          >
            Be first to know what's happening at Foxy's
          </h4>

          <form
            class="
              mt-5
              flex
              flex-col
              gap-3
              sm:flex-row
            "
            @submit.prevent="submitNewsletter"
          >
          <div
              class="absolute left-[-9999px]"
              aria-hidden="true"
            >
              <label for="newsletter-website">
                Website
              </label>

              <input
                id="newsletter-website"
                v-model="newsletterWebsite"
                name="website"
                type="text"
                tabindex="-1"
                autocomplete="off"
              >
            </div>
            <label
              for="footer-email"
              class="sr-only"
            >
              Email address
            </label>

            <input
              id="footer-email"
              v-model.trim="newsletterEmail"
              type="email"
              required
              placeholder="name@email.com"
              class="
                min-h-12
                min-w-0
                flex-1
                rounded-full
                border
                border-cream/30
                px-4.5
                font-body
                text-[1.15rem]
                text-cream
                outline-none
                placeholder:text-cream/50
                focus:border-turquoise
                focus:ring-2
                focus:ring-turquoise/30
              "
            >

            <button
              type="submit"
              :disabled="newsletterSubmitting"
              class="
                min-h-12
                shrink-0
                rounded-full
                bg-coral
                px-6
                transition
                hover:brightness-105
                disabled:cursor-wait
                disabled:opacity-60
                cursor-pointer
              "
            >
              <span class="font-body text-[1.15rem] font-bold text-sand">
                {{ newsletterSubmitting ? 'Submitting…' : 'Notify me' }}</span>
            </button>
          </form>

          <p
            v-if="newsletterMessage"
            class="mt-3 font-body text-[1.15rem]"
            :class="{
              'text-turquoise':
                newsletterStatus === 'success',

              'text-accent':
                newsletterStatus === 'already',

              'text-coral-bright':
                newsletterStatus === 'error',
            }"
          >
            {{ newsletterMessage }}
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.newsletter-submit{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
  padding: 14px 30px;
  background: var(--palette-coral);
  color: var(--sand);
  border: none;
  border-radius: 999px;
  font-family: var(--font-family-navigation);
  font-weight: 600;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: filter 0.15s ease;
}

.newsletter-submit:hover {
  filter: brightness(1.06);
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