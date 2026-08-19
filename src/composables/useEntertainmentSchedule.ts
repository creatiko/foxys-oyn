import {
  ref,
} from 'vue'

import { API_URL } from '@/config/api'

export type EntertainmentItemType =
  | 'performer'
  | 'event'
  | 'event-alt'

export interface EntertainmentScheduleItem {
  id: number
  type: EntertainmentItemType
  eventType: string | null
  headlineText: string
  displayText: string | null
  timeLabel: string | null
}

export interface EntertainmentScheduleDay {
  dayOfWeek: number
  dayName: string
  isToday: boolean
  badgeText: string | null
  items: EntertainmentScheduleItem[]
}

export interface EntertainmentScheduleResponse {
  timezone: string
  today: EntertainmentScheduleDay | null
  week: EntertainmentScheduleDay[]
}

/*
 * Module-level state makes the schedule shared
 * by every component using this composable.
 */
const schedule =
  ref<EntertainmentScheduleResponse | null>(
    null,
  )

const scheduleLoading = ref(false)
const scheduleError = ref('')
const scheduleLoaded = ref(false)

export function formatEntertainmentItem(
  item: EntertainmentScheduleItem,
): string {
  const performer =
    item.headlineText.trim()

  const eventType =
    item.eventType?.trim() ?? ''

  const displayText =
    item.displayText?.trim() ?? ''

  let text = performer

  if (
    item.type === 'event'
    && eventType
  ) {
    text = performer
      ? `${eventType} with ${performer}`
      : eventType
  } else if (
    item.type === 'event-alt'
    && eventType
  ) {
    text = performer
      ? `${eventType} ${performer}`
      : eventType
  }

  if (displayText) {
    text =
      `${text} ${displayText}`.trim()
  }

  return text
}

export function useEntertainmentSchedule() {
  async function loadEntertainmentSchedule(
    force = false,
  ): Promise<void> {
    /*
     * Why Here and After Dark may mount
     * at effectively the same time.
     *
     * Do not make duplicate API requests.
     */
    if (
      scheduleLoading.value
      || (
        scheduleLoaded.value
        && !force
      )
    ) {
      return
    }

    scheduleLoading.value = true
    scheduleError.value = ''

    try {
      const response = await fetch(
        `${API_URL}/entertainment`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      const data =
        (await response.json()) as
          | EntertainmentScheduleResponse
          | { message?: string }

      if (!response.ok) {
        throw new Error(
          'message' in data
          && data.message
            ? data.message
            : 'Unable to load the entertainment schedule.',
        )
      }

      schedule.value =
        data as EntertainmentScheduleResponse

      scheduleLoaded.value = true
    } catch (error) {
      console.error(
        'Unable to load entertainment schedule:',
        error,
      )

      scheduleError.value =
        error instanceof Error
          ? error.message
          : 'Unable to load the entertainment schedule.'
    } finally {
      scheduleLoading.value = false
    }
  }

  return {
    schedule,
    scheduleLoading,
    scheduleError,
    loadEntertainmentSchedule,
  }
}