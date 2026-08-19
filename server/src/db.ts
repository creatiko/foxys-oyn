import mysql from 'mysql2/promise'
import 'dotenv/config'

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const db = mysql.createPool({
  host: requiredEnvironmentValue('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 3306),
  database: requiredEnvironmentValue('DB_NAME'),
  user: requiredEnvironmentValue('DB_USER'),
  password: requiredEnvironmentValue('DB_PASSWORD'),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})