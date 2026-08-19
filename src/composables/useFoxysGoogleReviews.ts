import { ref } from 'vue'
import {
  importLibrary,
  setOptions,
} from '@googlemaps/js-api-loader'

export interface FoxysGoogleReviewAuthor {
  displayName: string
  uri: string | null
  photoURI: string | null
}

export interface FoxysGoogleReview {
  id: string
  rating: number
  text: string
  relativePublishTimeDescription: string
  publishTime: string | null
  googleMapsURI: string | null
  flagContentURI: string | null
  author: FoxysGoogleReviewAuthor
}

export interface FoxysGoogleAttribution {
  provider: string
  providerURI: string | null
}

export interface FoxysGooglePlace {
  displayName: string
  rating: number | null
  userRatingCount: number
  googleMapsURI: string | null
  reviews: FoxysGoogleReview[]
  attributions: FoxysGoogleAttribution[]
}

/*
 * Module-level state makes this a singleton.
 *
 * The Reviews section and Visit section can both use it without
 * making two Google requests.
 */
const foxysGooglePlace = ref<FoxysGooglePlace | null>(null)
const foxysGoogleReviewsLoading = ref(false)
const foxysGoogleReviewsError = ref('')

let loaderConfigured = false
let loadingPromise: Promise<void> | null = null

function configureGoogleMaps(): string {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()

  const placeId =
    import.meta.env.VITE_FOXYS_PLACE_ID?.trim()

  if (!apiKey) {
    throw new Error(
      'VITE_GOOGLE_MAPS_API_KEY is not configured.',
    )
  }

  if (!placeId) {
    throw new Error(
      'VITE_FOXYS_PLACE_ID is not configured.',
    )
  }

  if (!loaderConfigured) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'en',
      region: 'VG',
      authReferrerPolicy: 'origin',
    })

    loaderConfigured = true
  }

  return placeId
}

export async function loadFoxysGoogleReviews(): Promise<void> {
  if (foxysGooglePlace.value) {
    return
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    foxysGoogleReviewsLoading.value = true
    foxysGoogleReviewsError.value = ''

    try {
      const placeId = configureGoogleMaps()

      const placesLibrary =
        await importLibrary('places')

      const { Place } =
        placesLibrary as google.maps.PlacesLibrary

      const place = new Place({
        id: placeId,
        requestedLanguage: 'en',
        requestedRegion: 'vg',
      })

      await place.fetchFields({
        fields: [
          'displayName',
          'rating',
          'userRatingCount',
          'reviews',
          'googleMapsURI',
        ],
      })

      const reviews: FoxysGoogleReview[] =
        (place.reviews ?? []).flatMap(
          (review, index) => {
            const author =
              review.authorAttribution

            /*
             * Do not display reviews without the required
             * author attribution.
             */
            if (
              !author?.displayName ||
              !review.text
            ) {
              return []
            }

            const publishTime =
              review.publishTime?.toISOString() ??
              null

            return [
              {
                id: [
                  author.displayName,
                  publishTime ?? 'unknown-date',
                  index,
                ].join('-'),

                rating: review.rating ?? 0,
                text: review.text,

                relativePublishTimeDescription:
                  review.relativePublishTimeDescription ??
                  '',

                publishTime,

                googleMapsURI:
                  review.googleMapsURI ?? null,

                flagContentURI:
                  review.flagContentURI ?? null,

                author: {
                  displayName:
                    author.displayName,

                  uri:
                    author.uri ?? null,

                  photoURI:
                    author.photoURI ?? null,
                },
              },
            ]
          },
        )

      const attributions: FoxysGoogleAttribution[] =
        (place.attributions ?? [])
          .map((attribution) => ({
            provider:
              attribution.provider ?? '',

            providerURI:
              attribution.providerURI ?? null,
          }))
          .filter(
            (attribution) =>
              attribution.provider.length > 0,
          )

      foxysGooglePlace.value = {
        displayName:
          place.displayName ??
          `Foxy's Tamarind Bar`,

        rating:
          place.rating ?? null,

        userRatingCount:
          place.userRatingCount ?? 0,

        googleMapsURI:
          place.googleMapsURI ?? null,

        reviews,
        attributions,
      }
    } catch (error) {
      console.error(
        'Unable to load Foxy’s Google reviews:',
        error,
      )

      foxysGoogleReviewsError.value =
        error instanceof Error
          ? error.message
          : `Foxy's Google reviews could not be loaded.`
    } finally {
      foxysGoogleReviewsLoading.value = false
    }
  })()

  try {
    await loadingPromise
  } finally {
    loadingPromise = null
  }
}

export function useFoxysGoogleReviews() {
  return {
    foxysGooglePlace,
    foxysGoogleReviewsLoading,
    foxysGoogleReviewsError,
    loadFoxysGoogleReviews,
  }
}