<script setup lang="ts">
import {
  nextTick,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'

import postcard1 from '../assets/postcards/postcard1.jpg'
import postcard2 from '../assets/postcards/postcard2.jpg'
import postcard3 from '../assets/postcards/postcard3.jpg'
import postcard4 from '../assets/postcards/postcard4.jpg'
import postcard5 from '../assets/postcards/postcard5.jpg'
import postcard6 from '../assets/postcards/postcard6.jpg'
import postcard7 from '../assets/postcards/postcard7.jpg'
import postcard8 from '../assets/postcards/postcard8.jpg'
import postcard9 from '../assets/postcards/postcard9.jpg'
import postcard10 from '../assets/postcards/postcard10.jpg'
import postcard11 from '../assets/postcards/postcard11.jpg'
import postcard12 from '../assets/postcards/postcard12.jpg'

const props = defineProps<{
  logoSrc: string
}>()

type PostcardShape = 'landscape' | 'portrait'

type PostcardDesign =
  | 'towel'
  | 'sunset'
  | 'postmark'
  | 'night'

type LogoTone = 'dark' | 'light'

interface PostcardStyle {
  logoTone: LogoTone
  captionColor: string
  captionShadow: string | null
  finePrintColor: string

  drawBand: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    bandTop: number,
    bandHeight: number,
    imageHeight: number,
  ) => void

  drawDecoration: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    bandTop: number,
    bandHeight: number,
  ) => void

  drawEdge: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void
}

const postcardSamples = [
  postcard1,
  postcard2,
  postcard3,
  postcard4,
  postcard5,
  postcard6,
  postcard7,
  postcard8,
  postcard9,
  postcard10,
  postcard11,
  postcard12,
]

const postcardRotations = [
  '-rotate-3',
  'rotate-2',
  '-rotate-2',
  'rotate-3',
  '-rotate-1',
]

const captions = [
  '',
  `Wish you were at Foxy's!`,
  `Don't quit your daydream`,
  `One nation under rum`,
  `This is a state of mind`,
  `No shoes, no news`,
  `Gone to the sand`,
  `Sailed in for one drink`,
  `Still on island time`,
  `Anchored and staying a while`,
  `Last boat already left`,
]

const canvasRef = ref<HTMLCanvasElement | null>(null)

const selectedImage =
  shallowRef<HTMLImageElement | null>(null)

const logoImage =
  shallowRef<HTMLImageElement | null>(null)

const caption = ref('')
const shape = ref<PostcardShape>('landscape')
const design = ref<PostcardDesign>('towel')

const hasImage = ref(false)
const imageError = ref('')
const isRendering = ref(false)

const POSTCARD_FRAME = 32

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)

    image.onerror = () => {
      reject(new Error('The image could not be loaded.'))
    }

    image.src = source
  })
}

async function loadLogo(): Promise<void> {
  if (!props.logoSrc) {
    logoImage.value = null
    return
  }

  try {
    logoImage.value = await loadImage(props.logoSrc)
    renderPostcard()
  } catch (error) {
    console.error('Unable to load postcard logo:', error)
    logoImage.value = null
  }
}

function drawWaveTop(
  context: CanvasRenderingContext2D,
  width: number,
  bandTop: number,
  imageHeight: number,
): void {
  context.beginPath()
  context.moveTo(0, bandTop)

  for (let x = 0; x <= width; x += 30) {
    context.quadraticCurveTo(
      x + 15,
      imageHeight,
      x + 30,
      bandTop,
    )
  }
}

function drawDeckleTop(
  context: CanvasRenderingContext2D,
  width: number,
  bandTop: number,
): void {
  context.beginPath()
  context.moveTo(0, bandTop)

  const step = 22

  for (let x = 0; x <= width; x += step) {
    context.lineTo(
      x + step / 2,
      bandTop - 9,
    )

    context.lineTo(
      x + step,
      bandTop,
    )
  }
}

function drawFrond(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  flipped: boolean,
  colors: string[],
): void {
  const direction = flipped ? -1 : 1

  for (let index = 0; index < 5; index += 1) {
    context.fillStyle =
      colors[index % colors.length]

    context.save()
    context.translate(centerX, centerY)

    context.rotate(
      (-0.9 + index * 0.45) * direction,
    )

    context.beginPath()
    context.moveTo(0, 0)

    context.quadraticCurveTo(
      size * 0.5,
      -size * 0.15,
      size,
      0,
    )

    context.quadraticCurveTo(
      size * 0.5,
      size * 0.15,
      0,
      0,
    )

    context.fill()
    context.restore()
  }
}

function drawDots(
  context: CanvasRenderingContext2D,
  points: Array<[number, number, number]>,
  fill: string,
): void {
  context.fillStyle = fill

  points.forEach(([x, y, radius]) => {
    context.beginPath()
    context.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2,
    )
    context.fill()
  })
}

function drawPalmTree(
  context: CanvasRenderingContext2D,
  x: number,
  base: number,
  height: number,
  fill: string,
): void {
  context.fillStyle = fill
  context.beginPath()
  context.moveTo(x, base)

  context.quadraticCurveTo(
    x + height * 0.1,
    base - height * 0.55,
    x + height * 0.22,
    base - height,
  )

  context.lineTo(
    x + height * 0.3,
    base - height,
  )

  context.quadraticCurveTo(
    x + height * 0.2,
    base - height * 0.55,
    x + height * 0.09,
    base,
  )

  context.closePath()
  context.fill()

  drawFrond(
    context,
    x + height * 0.26,
    base - height,
    height * 0.4,
    false,
    [fill],
  )

  drawFrond(
    context,
    x + height * 0.26,
    base - height,
    height * 0.34,
    true,
    [fill],
  )
}

const postcardStyles: Record<
  PostcardDesign,
  PostcardStyle
> = {
  towel: {
    logoTone: 'dark',
    captionColor: '#6E0A1C',
    captionShadow: 'rgba(255,248,231,0.45)',
    finePrintColor: 'rgba(11,79,92,0.8)',

    drawBand(
      context,
      width,
      height,
      bandTop,
      _bandHeight,
      imageHeight,
    ) {
      const gradient =
        context.createLinearGradient(
          0,
          imageHeight,
          width,
          height,
        )

      gradient.addColorStop(0, '#FF5A5F')
      gradient.addColorStop(0.5, '#FFC300')
      gradient.addColorStop(1, '#06D6A0')

      context.fillStyle = gradient

      drawWaveTop(
        context,
        width,
        bandTop,
        imageHeight,
      )

      context.lineTo(width, height)
      context.lineTo(0, height)
      context.closePath()
      context.fill()
    },

    drawDecoration(
      context,
      width,
      _height,
      bandTop,
      bandHeight,
    ) {
      drawFrond(
        context,
        34,
        bandTop + 18,
        38,
        false,
        [
          'rgba(6,214,160,0.7)',
          'rgba(255,243,214,0.6)',
        ],
      )

      drawDots(
        context,
        [
          [width * 0.44, bandTop + 14, 3],
          [width * 0.52, bandTop + 34, 2],
          [
            width * 0.13,
            bandTop + bandHeight - 30,
            2.5,
          ],
        ],
        'rgba(255,255,255,0.8)',
      )
    },

    drawEdge(context, width, height) {
      const colors = [
        '#FF5A5F',
        '#FFC300',
        '#06D6A0',
        '#FFC300',
      ]

      const strokeWidth = 8

      colors.forEach((color, index) => {
        context.strokeStyle = color
        context.lineWidth = strokeWidth

        const inset = index * strokeWidth

        context.strokeRect(
          inset + strokeWidth / 2,
          inset + strokeWidth / 2,
          width - (inset + strokeWidth / 2) * 2,
          height - (inset + strokeWidth / 2) * 2,
        )
      })
    },
  },

  sunset: {
    logoTone: 'dark',
    captionColor: '#3B1008',
    captionShadow: 'rgba(255,214,150,0.5)',
    finePrintColor: 'rgba(74,20,10,0.8)',

    drawBand(
      context,
      width,
      height,
      bandTop,
      bandHeight,
    ) {
      const gradient =
        context.createLinearGradient(
          0,
          bandTop,
          0,
          height,
        )

      gradient.addColorStop(0, '#C4265C')
      gradient.addColorStop(0.42, '#F2643C')
      gradient.addColorStop(1, '#FFC300')

      context.fillStyle = gradient

      context.fillRect(
        0,
        bandTop,
        width,
        height - bandTop,
      )

      context.save()
      context.beginPath()

      context.rect(
        0,
        bandTop,
        width,
        height - bandTop,
      )

      context.clip()

      const centerX = width * 0.3
      const radius = bandHeight * 0.72

      const sunGradient =
        context.createRadialGradient(
          centerX,
          bandTop,
          4,
          centerX,
          bandTop,
          radius,
        )

      sunGradient.addColorStop(
        0,
        'rgba(255,240,190,0.95)',
      )

      sunGradient.addColorStop(
        1,
        'rgba(255,214,120,0)',
      )

      context.fillStyle = sunGradient
      context.beginPath()

      context.arc(
        centerX,
        bandTop,
        radius,
        0,
        Math.PI * 2,
      )

      context.fill()

      context.fillStyle =
        'rgba(255,248,231,0.14)'

      for (let index = 0; index < 4; index += 1) {
        context.fillRect(
          0,
          bandTop +
            16 +
            index * (bandHeight / 5),
          width,
          5 - index,
        )
      }

      context.restore()
    },

    drawDecoration(
      context,
      width,
      height,
      _bandTop,
      bandHeight,
    ) {
      drawPalmTree(
        context,
        24,
        height - POSTCARD_FRAME - 6,
        bandHeight * 0.62,
        'rgba(74,20,10,0.55)',
      )

      drawPalmTree(
        context,
        width * 0.13,
        height - POSTCARD_FRAME - 6,
        bandHeight * 0.44,
        'rgba(74,20,10,0.38)',
      )
    },

    drawEdge(context, width, height) {
      context.fillStyle = '#FFF8E7'

      const border = 16

      context.fillRect(0, 0, width, border)
      context.fillRect(
        0,
        height - border,
        width,
        border,
      )

      context.fillRect(0, 0, border, height)
      context.fillRect(
        width - border,
        0,
        border,
        height,
      )

      context.strokeStyle = '#C4265C'
      context.lineWidth = 2.5

      context.strokeRect(
        border + 2,
        border + 2,
        width - (border + 2) * 2,
        height - (border + 2) * 2,
      )
    },
  },

  postmark: {
    logoTone: 'dark',
    captionColor: '#0B4F5C',
    captionShadow: null,
    finePrintColor: 'rgba(11,79,92,0.62)',

    drawBand(
      context,
      width,
      height,
      bandTop,
    ) {
      context.fillStyle = '#FBF1DC'

      drawDeckleTop(
        context,
        width,
        bandTop,
      )

      context.lineTo(width, height)
      context.lineTo(0, height)
      context.closePath()
      context.fill()

      context.save()
      context.beginPath()
      context.rect(0, bandTop, width, 9)
      context.clip()

      const segment = 22
      const colors = [
        '#C4443B',
        '#1B4E9B',
      ]

      for (
        let index = 0, x = -segment;
        x < width + segment;
        x += segment, index += 1
      ) {
        context.fillStyle =
          colors[index % 2]

        context.beginPath()
        context.moveTo(x, bandTop)

        context.lineTo(
          x + segment * 0.5,
          bandTop,
        )

        context.lineTo(
          x + segment * 0.5 - 12,
          bandTop + 9,
        )

        context.lineTo(
          x - 12,
          bandTop + 9,
        )

        context.closePath()
        context.fill()
      }

      context.restore()
    },

    drawDecoration(
      context,
      width,
      _height,
      bandTop,
    ) {
      const centerX =
        width - POSTCARD_FRAME - 54

      const centerY =
        bandTop + 40

      const radius = 26

      context.save()
      context.globalAlpha = 0.55
      context.strokeStyle = '#C4443B'
      context.lineWidth = 2.5

      context.beginPath()

      context.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2,
      )

      context.stroke()

      context.lineWidth = 1.2
      context.beginPath()

      context.arc(
        centerX,
        centerY,
        radius - 6,
        0,
        Math.PI * 2,
      )

      context.stroke()

      context.fillStyle = '#C4443B'

      context.font =
        `700 10px 'IBM Plex Mono', monospace`

      context.textAlign = 'center'

      context.fillText(
        'B.V.I.',
        centerX,
        centerY - 2,
      )

      context.fillText(
        'EST 1968',
        centerX,
        centerY + 11,
      )

      context.textAlign = 'left'

      for (let index = 0; index < 4; index += 1) {
        context.fillRect(
          centerX - radius - 30,
          centerY - 9 + index * 6,
          22,
          2.5,
        )
      }

      context.restore()
    },

    drawEdge(context, width, height) {
      context.fillStyle = '#FBF1DC'

      const border = 14

      context.fillRect(0, 0, width, border)
      context.fillRect(
        0,
        height - border,
        width,
        border,
      )

      context.fillRect(0, 0, border, height)
      context.fillRect(
        width - border,
        0,
        border,
        height,
      )

      context.fillStyle = '#FFFFFF'

      const step = 22
      const radius = 6

      for (
        let x = step / 2;
        x < width;
        x += step
      ) {
        context.beginPath()

        context.arc(
          x,
          0,
          radius,
          0,
          Math.PI * 2,
        )

        context.fill()
        context.beginPath()

        context.arc(
          x,
          height,
          radius,
          0,
          Math.PI * 2,
        )

        context.fill()
      }

      for (
        let y = step / 2;
        y < height;
        y += step
      ) {
        context.beginPath()

        context.arc(
          0,
          y,
          radius,
          0,
          Math.PI * 2,
        )

        context.fill()
        context.beginPath()

        context.arc(
          width,
          y,
          radius,
          0,
          Math.PI * 2,
        )

        context.fill()
      }

      context.strokeStyle =
        'rgba(11,79,92,0.35)'

      context.lineWidth = 1

      context.strokeRect(
        border + 0.5,
        border + 0.5,
        width - (border + 0.5) * 2,
        height - (border + 0.5) * 2,
      )
    },
  },

  night: {
    logoTone: 'light',
    captionColor: '#FFCC3E',
    captionShadow: 'rgba(0,0,0,0.6)',
    finePrintColor: 'rgba(255,248,231,0.72)',

    drawBand(
      context,
      width,
      height,
      bandTop,
    ) {
      const gradient =
        context.createLinearGradient(
          0,
          bandTop,
          0,
          height,
        )

      gradient.addColorStop(0, '#0B4F5C')
      gradient.addColorStop(1, '#052A31')

      context.fillStyle = gradient

      context.fillRect(
        0,
        bandTop,
        width,
        height - bandTop,
      )
    },

    drawDecoration(
      context,
      width,
      _height,
      bandTop,
      bandHeight,
    ) {
      const y = bandTop
      const sag = 26
      const span = width / 5

      context.strokeStyle =
        'rgba(255,248,231,0.5)'

      context.lineWidth = 1.5
      context.beginPath()

      for (let index = 0; index < 5; index += 1) {
        context.moveTo(
          index * span,
          y - 6,
        )

        context.quadraticCurveTo(
          index * span + span / 2,
          y + sag,
          (index + 1) * span,
          y - 6,
        )
      }

      context.stroke()

      for (let index = 0; index < 5; index += 1) {
        const bulbX =
          index * span + span / 2

        const bulbY =
          y + sag * 0.72

        const glow =
          context.createRadialGradient(
            bulbX,
            bulbY,
            1,
            bulbX,
            bulbY,
            13,
          )

        glow.addColorStop(
          0,
          'rgba(255,214,110,0.85)',
        )

        glow.addColorStop(
          1,
          'rgba(255,204,62,0)',
        )

        context.fillStyle = glow
        context.beginPath()

        context.arc(
          bulbX,
          bulbY,
          13,
          0,
          Math.PI * 2,
        )

        context.fill()

        context.fillStyle = '#FFD86E'
        context.beginPath()

        context.arc(
          bulbX,
          bulbY,
          4,
          0,
          Math.PI * 2,
        )

        context.fill()
      }

      drawDots(
        context,
        [
          [
            width * 0.1,
            bandTop + bandHeight - 34,
            2,
          ],
          [
            width * 0.19,
            bandTop + bandHeight - 22,
            1.5,
          ],
          [
            width * 0.3,
            bandTop + bandHeight - 40,
            1.8,
          ],
        ],
        'rgba(255,248,231,0.75)',
      )
    },

    drawEdge(context, width, height) {
      context.fillStyle = '#052A31'

      const border = 18

      context.fillRect(0, 0, width, border)

      context.fillRect(
        0,
        height - border,
        width,
        border,
      )

      context.fillRect(0, 0, border, height)

      context.fillRect(
        width - border,
        0,
        border,
        height,
      )

      context.strokeStyle = '#FFCC3E'
      context.lineWidth = 2

      context.strokeRect(
        border + 2,
        border + 2,
        width - (border + 2) * 2,
        height - (border + 2) * 2,
      )
    },
  },
}

function fitCaption(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
): number {
  let size = 60

  context.font =
    `700 ${size}px 'Caveat', cursive`

  while (
    context.measureText(text).width >
      maximumWidth &&
    size > 24
  ) {
    size -= 2

    context.font =
      `700 ${size}px 'Caveat', cursive`
  }

  return size
}

function drawTintedLogo(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): void {
  const offscreen =
    document.createElement('canvas')

  offscreen.width =
    Math.max(1, Math.ceil(width))

  offscreen.height =
    Math.max(1, Math.ceil(height))

  const offscreenContext =
    offscreen.getContext('2d')

  if (!offscreenContext) {
    return
  }

  offscreenContext.drawImage(
    image,
    0,
    0,
    offscreen.width,
    offscreen.height,
  )

  offscreenContext.globalCompositeOperation =
    'source-in'

  offscreenContext.fillStyle = color

  offscreenContext.fillRect(
    0,
    0,
    offscreen.width,
    offscreen.height,
  )

  context.drawImage(
    offscreen,
    x,
    y,
    width,
    height,
  )
}

function renderPostcard(): void {
  const canvas = canvasRef.value
  const image = selectedImage.value

  if (!canvas || !image) {
    return
  }

  const context = canvas.getContext('2d')

  if (!context) {
    imageError.value =
      'Canvas is not supported by this browser.'

    return
  }

  isRendering.value = true
  imageError.value = ''

  try {
    const style =
      postcardStyles[design.value]

    const portrait =
      shape.value === 'portrait'

    const width =
      portrait ? 620 : 900

    const height =
      portrait ? 900 : 620

    canvas.width = width
    canvas.height = height

    const waveHeight = 18

    const bandHeight =
      portrait ? 176 : 168

    const imageHeight =
      height - bandHeight - waveHeight

    const bandTop =
      imageHeight + waveHeight

    const textX =
      POSTCARD_FRAME + 16

    const safeBottom =
      height - POSTCARD_FRAME - 8

    const scale = Math.max(
      width / image.width,
      imageHeight / image.height,
    )

    const sourceWidth =
      width / scale

    const sourceHeight =
      imageHeight / scale

    const sourceX =
      (image.width - sourceWidth) / 2

    const sourceY =
      (image.height - sourceHeight) / 2

    context.clearRect(
      0,
      0,
      width,
      height,
    )

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      imageHeight,
    )

    style.drawBand(
      context,
      width,
      height,
      bandTop,
      bandHeight,
      imageHeight,
    )

    style.drawDecoration(
      context,
      width,
      height,
      bandTop,
      bandHeight,
    )

    let rightLimit =
      width - POSTCARD_FRAME - 16

    const logo = logoImage.value

    if (
      logo &&
      logo.complete &&
      logo.naturalWidth
    ) {
      const logoHeight =
        portrait ? 86 : 96

      const logoWidth =
        logoHeight *
        (logo.naturalWidth /
          logo.naturalHeight)

      const logoX =
        width -
        POSTCARD_FRAME -
        18 -
        logoWidth

      const logoY =
        bandTop +
        (bandHeight - logoHeight) / 2 +
        (design.value === 'postmark'
          ? 14
          : 0)

      drawTintedLogo(
        context,
        logo,
        logoX,
        logoY,
        logoWidth,
        logoHeight,
        style.logoTone === 'light'
          ? '#FFF8E7'
          : '#063038',
      )

      rightLimit =
        logoX - 18
    }

    const hasCaptionText =
      caption.value.trim().length > 0

    let finePrintY: number

    if (hasCaptionText) {
      const captionSize =
        fitCaption(
          context,
          caption.value,
          rightLimit - textX,
        )

      context.save()

      if (style.captionShadow) {
        context.shadowColor =
          style.captionShadow

        context.shadowBlur = 6
        context.shadowOffsetY = 3
      }

      context.fillStyle =
        style.captionColor

      context.font =
        `700 ${captionSize}px 'Caveat', cursive`

      context.fillText(
        caption.value,
        textX,
        bandTop + 74,
      )

      context.restore()

      finePrintY =
        bandTop + 116
    } else {
      finePrintY =
        bandTop +
        Math.round(bandHeight / 2) +
        5
    }

    if (finePrintY > safeBottom) {
      finePrintY = safeBottom
    }

    context.font =
      `700 ${portrait ? 12 : 13}px ` +
      `'IBM Plex Mono', monospace`

    context.fillStyle =
      style.finePrintColor

    context.fillText(
      'EST. 1968  ·  BAREFOOT SINCE DAY ONE',
      textX,
      finePrintY,
    )

    style.drawEdge(
      context,
      width,
      height,
    )

    hasImage.value = true
  } finally {
    isRendering.value = false
  }
}

async function handleFileChange(
  event: Event,
): Promise<void> {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  if (!file) {
    return
  }

  imageError.value = ''

  if (!file.type.startsWith('image/')) {
    imageError.value =
      'Please choose an image file.'

    input.value = ''
    return
  }

  const objectUrl =
    URL.createObjectURL(file)

  try {
    selectedImage.value =
      await loadImage(objectUrl)

    hasImage.value = true

    await nextTick()
    renderPostcard()
  } catch (error) {
    console.error(
      'Unable to load postcard photo:',
      error,
    )

    imageError.value =
      'That photo could not be opened. Try a JPG, PNG, or WebP image.'

    selectedImage.value = null
    hasImage.value = false
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function savePostcard(): void {
  const canvas = canvasRef.value

  if (!canvas || !hasImage.value) {
    return
  }

  const link =
    document.createElement('a')

  link.download =
    'foxys-postcard.png'

  link.href =
    canvas.toDataURL('image/png')

  link.click()
}

watch(
  [
    caption,
    shape,
    design,
  ],
  () => {
    renderPostcard()
  },
)

watch(
  () => props.logoSrc,
  () => {
    void loadLogo()
  },
)

onMounted(async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await loadLogo()
})
</script>

<template>
  <section
    id="postcard"
    class="bg-[linear-gradient(180deg,#FFD84E_0%,#1ECBDE_100%)] px-5 py-16 sm:px-6 lg:py-24"
  >
    <div class="mx-auto w-full max-w-270">
      <div class="max-w-225">
        <div
          class="mb-4.5 inline-flex items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            class="h-0 w-0 border-y-11 border-y-transparent border-l-18 border-l-sand"
          />

          <span
            class="font-['IBM_Plex_Mono',monospace] text-[0.94rem] uppercase tracking-[0.14em] text-sand"
          >
            Wish You Were Here
          </span>
        </div>

        <h2
          class="font-['Lilita_One',sans-serif] text-[clamp(2.05rem,4.1vw,2.95rem)] font-normal uppercase leading-[1.08] tracking-[0.01em] text-sand"
        >
          Make yourself a postcard
        </h2>

        <p
          class="mt-4 font-body text-[1.34rem] leading-[1.62] text-sand"
        >
          Upload a photo, add a caption and a shape, Foxy's-style. <br>It stays on your device — nothing gets uploaded anywhere.
        </p>
      </div>

      <!-- Twelve finished postcard examples -->
      <div
        class="mt-10 columns-2 gap-3.5 md:columns-3 md:gap-5 xl:columns-4"
      >
        <figure
          v-for="(sample, index) in postcardSamples"
          :key="sample"
          :class="[
            postcardRotations[
              index % postcardRotations.length
            ],
          ]"
          class="mb-3.5 inline-block w-full break-inside-avoid rounded-lg bg-beige p-2.25 pb-5.5 shadow-[0_12px_26px_rgba(6,48,56,0.30)] transition duration-300 hover:relative hover:z-10 hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.04] hover:shadow-[0_18px_34px_rgba(6,48,56,0.38)] md:mb-5"
        >
          <img
            :src="sample"
            :alt="`Foxy's postcard example ${index + 1}`"
            loading="lazy"
            class="block h-auto w-full rounded-[5px]"
          />
        </figure>
      </div>

      <!-- Generator -->
      <div
        class="mt-8 flex flex-wrap items-start gap-9"
      >
        <div
          class="flex min-w-55 flex-[0_1_260px] flex-col gap-3.5"
        >
          <label
            for="postcard-file"
            class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-sand/15 bg-driftwood-dark px-5 py-3 text-center font-body text-[1.22rem] font-semibold text-sand transition-colors hover:border-accent-deep focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sand"
          >
            Choose a photo
          </label>

          <input
            id="postcard-file"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="handleFileChange"
          />

          <div class="flex flex-col gap-1.5">
            <label
              for="postcard-caption"
              class="font-['IBM_Plex_Mono',monospace] text-[0.84rem] uppercase tracking-widest text-sand/70"
            >
              Caption
            </label>

            <select
              id="postcard-caption"
              v-model="caption"
              class="min-h-11 w-full rounded-[10px] border border-sand/30 bg-beige/85 px-3 py-2.5 font-body text-[1.1rem] text-sand focus:outline-2 focus:outline-offset-1 focus:outline-sand"
            >
              <option
                v-for="captionOption in captions"
                :key="captionOption"
                :value="captionOption"
              >
                {{
                  captionOption ||
                  'None — photo only'
                }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="postcard-shape"
              class="font-['IBM_Plex_Mono',monospace] text-[0.84rem] uppercase tracking-widest text-sand/70"
            >
              Shape
            </label>

            <select
              id="postcard-shape"
              v-model="shape"
              class="min-h-11 w-full rounded-[10px] border border-sand/30 bg-beige/85 px-3 py-2.5 font-body text-[1.1rem] text-sand focus:outline-2 focus:outline-offset-1 focus:outline-sand"
            >
              <option value="landscape">
                Landscape
              </option>

              <option value="portrait">
                Portrait
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              for="postcard-design"
              class="font-['IBM_Plex_Mono',monospace] text-[0.84rem] uppercase tracking-widest text-sand/70"
            >
              Design
            </label>

            <select
              id="postcard-design"
              v-model="design"
              class="min-h-11 w-full rounded-[10px] border border-sand/30 bg-beige/85 px-3 py-2.5 font-body text-[1.1rem] text-sand focus:outline-2 focus:outline-offset-1 focus:outline-sand"
            >
              <option value="towel">
                Beach towel
              </option>

              <option value="sunset">
                Sunset
              </option>

              <option value="postmark">
                Vintage postmark
              </option>

              <option value="night">
                Island night
              </option>
            </select>
          </div>

          <button
            v-if="hasImage"
            type="button"
            :disabled="isRendering"
            class="inline-flex min-h-11 items-center justify-center rounded-full bg-coral px-5 py-3 text-center font-body text-[1.22rem] font-bold text-sand transition-colors hover:bg-coral-dim disabled:cursor-wait disabled:opacity-60"
            @click="savePostcard"
          >
            {{
              isRendering
                ? 'Rendering…'
                : 'Save your postcard'
            }}
          </button>

          <p
            v-if="imageError"
            role="alert"
            class="text-base font-semibold leading-6 text-gold-deep"
          >
            {{ imageError }}
          </p>
        </div>

        <div
          class="min-w-0 flex-[1_1_620px]"
        >
          <canvas
            ref="canvasRef"
            :class="{
              hidden: !hasImage,
              block: hasImage,
            }"
            width="900"
            height="620"
            class="h-auto w-full max-w-225 rounded-lg border border-sand/15 bg-driftwood-dark shadow-[0_10px_26px_rgba(6,48,56,0.16)]"
          />

          <div
            v-if="!hasImage"
            class="flex min-h-70 w-full max-w-225 items-center justify-center rounded-lg border-2 border-dashed border-sand/25 bg-beige/25 px-6 text-center"
          >
            <p
              class="max-w-107.5 font-body text-[1.2rem] leading-normal text-sand/70"
            >
              Choose a photo to preview your finished
              Foxy's postcard here.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>