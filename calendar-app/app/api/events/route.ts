import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get month parameter from query string (format: YYYY-MM)
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month')
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'Invalid month format. Expected YYYY-MM' },
        { status: 400 }
      )
    }

    // Parse month to get start and end dates
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999)

    // Fetch events for this user in the given month
    const { data: events, error: dbError } = await supabase
      .from('calendar_items')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_datetime', startDate.toISOString())
      .lte('end_datetime', endDate.toISOString())
      .order('start_datetime', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Transform to match CalendarEvent type
    const formattedEvents = (events || []).map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}