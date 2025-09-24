import { apiInfoResponse } from '@/lib/api-response'

// GET /api - API information and documentation
export async function GET() {
  return apiInfoResponse()
}