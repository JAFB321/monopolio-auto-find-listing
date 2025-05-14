
import { NextResponse } from 'next/server'

import { ScrapingBeeClient } from 'scrapingbee'

const apiKey = process.env.SCRAPINGBEE_API_KEY ?? ''

export async function GET(request: Request) {

  const notFoundResponse = NextResponse.json({ error: 'No description found' }, { status: 400 })

  try {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }
  
  var client = new ScrapingBeeClient(apiKey)
  var response = await client.get({
    url: url,
    params: {
      json_response: true,
      render_js: true
    }
  })
  
  if (typeof response?.data === 'object') {
    const data = JSON.parse(response?.data)
    const rawDescription = data?.body?.match(
      /<meta\s+property="og:description"\s+content="([^"]*)"/i
    ) ?? []
  
    const description = rawDescription[1]?.replace(/^[^:]*:\s*/, '')
    if (description) {
      return NextResponse.json({ description }, { status: 200 })
    }
    return notFoundResponse
  }
    return notFoundResponse
  } catch (error) {
    console.error('ScrapingBee API error:', error)
    return NextResponse.json({ error: 'Failed to scrape Instagram description' }, { status: 500 })
  }
}