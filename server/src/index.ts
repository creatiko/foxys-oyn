import cors from 'cors'
import 'dotenv/config'
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import {
  type ResultSetHeader,
  type RowDataPacket,
} from 'mysql2'

import { db } from './db.js'

interface BurgeeRow extends RowDataPacket {
  id: number
  name: string
  location: string
  sort_order: number
  active: number
  created_at: Date | null
  updated_at: Date | null
}

interface BurgeeInput {
  name: string
  location: string
  sortOrder: number
  active: boolean
}

const app = express()
const port = Number(process.env.PORT ?? 3001)

const frontendOrigin =
  process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'

app.use(helmet())

app.use(
  cors({
    origin: frontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'X-Admin-Key',
    ],
  }),
)

app.use(express.json({ limit: '20kb' }))

const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
})

function requireAdminKey(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const configuredKey = process.env.ADMIN_API_KEY
  const suppliedKey = request.header('X-Admin-Key')

  if (!configuredKey) {
    response.status(500).json({
      message: 'The admin API key is not configured.',
    })

    return
  }

  if (!suppliedKey || suppliedKey !== configuredKey) {
    response.status(401).json({
      message: 'Invalid admin key.',
    })

    return
  }

  next()
}

function validateBurgeeInput(body: unknown): BurgeeInput {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body.')
  }

  const input = body as Record<string, unknown>

  const name =
    typeof input.name === 'string'
      ? input.name.trim()
      : ''

  const location =
    typeof input.location === 'string'
      ? input.location.trim()
      : ''

  const sortOrder =
    input.sort_order === undefined
      ? 0
      : Number(input.sort_order)

  const active =
    input.active === undefined
      ? true
      : input.active

  if (!name || name.length > 100) {
    throw new Error(
      'Vessel name is required and cannot exceed 100 characters.',
    )
  }

  if (!location || location.length > 150) {
    throw new Error(
      'Location is required and cannot exceed 150 characters.',
    )
  }

  if (
    !Number.isInteger(sortOrder) ||
    sortOrder < 0
  ) {
    throw new Error(
      'Display order must be a positive whole number.',
    )
  }

  if (typeof active !== 'boolean') {
    throw new Error('Active must be true or false.')
  }

  return {
    name,
    location,
    sortOrder,
    active,
  }
}

interface EntertainmentScheduleRow extends RowDataPacket {
  id: number
  day_of_week: number | null
  repeats_daily: number
  item_type: 'performer' | 'event' | 'event alt'
  time_label: string | null
  weekly_display_mode: 'item' | 'badge' | 'hidden'
  event_type: string | null
  headline_text: string
  display_text: string
  badge_text: string | null
  sort_order: number
}

const weeklyDayNames: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

const weeklyDayOrder = [1, 2, 3, 4, 5, 6, 0] as const

function getBviDayOfWeek(): number {
  const dayName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Tortola',
    weekday: 'long',
  }).format(new Date())

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  return dayNames.indexOf(dayName)
}

app.get(
  '/api/schedule',
  async (_request: Request, response: Response) => {
    try {
      const [rows] =
        await db.execute<EntertainmentScheduleRow[]>(
          `
            SELECT
              id,
              day_of_week,
              repeats_daily,
              item_type,
              time_label,
              weekly_display_mode,
              event_type,
              headline_text,
              display_text,
              badge_text,
              sort_order
            FROM entertainment_schedule
            WHERE active = 1
            ORDER BY
              CASE day_of_week
                WHEN 1 THEN 1
                WHEN 2 THEN 2
                WHEN 3 THEN 3
                WHEN 4 THEN 4
                WHEN 5 THEN 5
                WHEN 6 THEN 6
                WHEN 0 THEN 7
                ELSE 8
              END,
              sort_order ASC,
              id ASC
          `,
        )
        

      const currentDayOfWeek = getBviDayOfWeek()

      const mapItem = (
        row: EntertainmentScheduleRow,
      ) => ({
        apiVersion: 'event-type-test-2026-08-04',
        id: row.id,
        type: row.item_type,
        eventType: row.event_type ?? null,
        headlineText: row.headline_text,
        displayText: row.display_text,
        timeLabel: row.time_label,
        repeatsDaily: row.repeats_daily === 1,
        sortOrder: row.sort_order,
      })

      const dailyItems = rows
        .filter((row) => row.repeats_daily === 1)
        .map(mapItem)

      const week = weeklyDayOrder.map((dayOfWeek) => {
        const dayRows = rows.filter(
          (row) =>
            row.repeats_daily === 0 &&
            row.day_of_week === dayOfWeek,
        )

        const visibleItems = dayRows.filter(
          (row) =>
            row.weekly_display_mode === 'item',
        )

        const badge = dayRows.find(
          (row) =>
            row.weekly_display_mode === 'badge' &&
            row.badge_text,
        )

        const headlineItems = dayRows
          .filter(
            (row) =>
              row.weekly_display_mode !== 'hidden',
          )
          .map((row) => row.headline_text)
          .filter(Boolean)

        return {
          dayOfWeek,
          dayName: weeklyDayNames[dayOfWeek],
          headline:
            headlineItems.length > 0
              ? `Today is ${weeklyDayNames[dayOfWeek]}: ${headlineItems.join(', ')}`
              : `Today is ${weeklyDayNames[dayOfWeek]}`,
          badgeText: badge?.badge_text ?? null,
          items: visibleItems.map(mapItem),
        }
      })

      const currentDay =
        week.find(
          (day) =>
            day.dayOfWeek === currentDayOfWeek,
        ) ?? {
          dayOfWeek: currentDayOfWeek,
          dayName:
            weeklyDayNames[currentDayOfWeek],
          headline: `Today is ${weeklyDayNames[currentDayOfWeek]}`,
          badgeText: null,
          items: [],
        }

      response.json({
        today: {
          ...currentDay,

          // Include daily performers in Happening Today.
          items: [
            ...dailyItems,
            ...currentDay.items,
          ],
        },

        week,
        dailyItems,
      })
    } catch (error) {
      console.error(
        'Unable to load entertainment schedule:',
        error,
      )

      response.status(500).json({
        message:
          'The entertainment schedule could not be loaded.',
      })
    }
  },
)



app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
  })
})

app.get(
  '/api/health/database',
  async (_request: Request, response: Response) => {
    try {
      await db.execute('SELECT 1')

      response.json({
        status: 'ok',
        database: 'connected',
      })
    } catch (error) {
      console.error('Database health check failed:', error)

      response.status(500).json({
        status: 'error',
        database: 'disconnected',
        message:
          error instanceof Error
            ? error.message
            : 'Database connection failed.',
      })
    }
  },
)

app.get(
  '/api/burgees',
  async (_request: Request, response: Response) => {
    try {
      const [rows] = await db.execute<BurgeeRow[]>(
        `
          SELECT
            id,
            name,
            location,
            sort_order,
            active,
            created_at,
            updated_at
          FROM burgees
          WHERE active = 1
          ORDER BY sort_order ASC, id ASC
        `,
      )

      response.json(
        rows.map((row) => ({
          ...row,
          active: Boolean(row.active),
        })),
      )
    } catch (error) {
      console.error('Unable to load burgees:', error)

      response.status(500).json({
        message: 'Unable to load burgees.',
      })
    }
  },
)

app.post(
  '/api/burgees',
  writeRateLimiter,
  requireAdminKey,
  async (request: Request, response: Response) => {
    try {
      const input = validateBurgeeInput(request.body)

      const [result] =
        await db.execute<ResultSetHeader>(
          `
            INSERT INTO burgees (
              name,
              location,
              sort_order,
              active
            )
            VALUES (?, ?, ?, ?)
          `,
          [
            input.name,
            input.location,
            input.sortOrder,
            input.active ? 1 : 0,
          ],
        )

      response.status(201).json({
        id: result.insertId,
        name: input.name,
        location: input.location,
        sort_order: input.sortOrder,
        active: input.active,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to add burgee.'

      response.status(422).json({
        message,
      })
    }
  },
)

app.put(
  '/api/burgees/:id',
  writeRateLimiter,
  requireAdminKey,
  async (request: Request, response: Response) => {
    try {
      const id = Number(request.params.id)
      const input = validateBurgeeInput(request.body)

      if (!Number.isInteger(id) || id < 1) {
        response.status(400).json({
          message: 'Invalid burgee ID.',
        })

        return
      }

      const [result] =
        await db.execute<ResultSetHeader>(
          `
            UPDATE burgees
            SET
              name = ?,
              location = ?,
              sort_order = ?,
              active = ?
            WHERE id = ?
          `,
          [
            input.name,
            input.location,
            input.sortOrder,
            input.active ? 1 : 0,
            id,
          ],
        )

      if (result.affectedRows === 0) {
        response.status(404).json({
          message: 'Burgee not found.',
        })

        return
      }

      response.json({
        id,
        name: input.name,
        location: input.location,
        sort_order: input.sortOrder,
        active: input.active,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update burgee.'

      response.status(422).json({
        message,
      })
    }
  },
)

app.delete(
  '/api/burgees/:id',
  writeRateLimiter,
  requireAdminKey,
  async (request: Request, response: Response) => {
    try {
      const id = Number(request.params.id)

      if (!Number.isInteger(id) || id < 1) {
        response.status(400).json({
          message: 'Invalid burgee ID.',
        })

        return
      }

      const [result] =
        await db.execute<ResultSetHeader>(
          'DELETE FROM burgees WHERE id = ?',
          [id],
        )

      if (result.affectedRows === 0) {
        response.status(404).json({
          message: 'Burgee not found.',
        })

        return
      }

      response.json({
        message: 'Burgee deleted.',
      })
    } catch (error) {
      console.error('Unable to delete burgee:', error)

      response.status(500).json({
        message: 'Unable to delete burgee.',
      })
    }
  },
)

app.use(
  (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error('Unexpected API error:', error)

    response.status(500).json({
      message: 'An unexpected server error occurred.',
    })
  },
)

app.listen(port, () => {
  console.log(
    `Foxy's API is running at http://localhost:${port}`,
  )
})