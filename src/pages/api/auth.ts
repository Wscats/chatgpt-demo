import type { APIRoute } from 'astro'

/** Comma-separated list of valid site passwords from environment. */
const realPassword = import.meta.env.SITE_PASSWORD || ''
const passList = realPassword.split(',') || []

/** POST /api/auth - Verify site password. Returns { code: 0 } on success, { code: -1 } on failure. */
export const post: APIRoute = async(context) => {
  const body = await context.request.json()
  const { pass } = body
  const isValid = !realPassword || pass === realPassword || passList.includes(pass)
  return new Response(JSON.stringify({
    code: isValid ? 0 : -1,
  }))
}
