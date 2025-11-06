"use server"

import { createClient } from "@/lib/supabase/server"

export async function editEvent(formData: FormData) {
    const title = formData.get('title')
    const description = formData.get('description')
    const startDate = formData.get('startDate')
    const startTime = formData.get('startTime')
    const endDate = formData.get('endDate')
    const endTime = formData.get('endTime')
    const importance = formData.get('importance')?.toString().toUpperCase() || 'none'
    const isTask = false

    const buildLocalDateTime = (dateStr: string, timeStr: string) => {
        const dt = new Date(`${dateStr}T${timeStr}`)

        // Calculate timezone offset
        const tzOffset = -dt.getTimezoneOffset()
        const offsetSign = tzOffset >= 0 ? '+' : '-'
        const offsetHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0')
        const offsetMins = String(Math.abs(tzOffset) % 60).padStart(2, '0')
        // Build ISO-8601 string with timezone
        const year = dt.getFullYear()
        const month = String(dt.getMonth() + 1).padStart(2, '0')
        const day = String(dt.getDate()).padStart(2, '0')
        const hour = String(dt.getHours()).padStart(2, '0')
        const min = String(dt.getMinutes()).padStart(2, '0')
        const sec = String(dt.getSeconds()).padStart(2, '0')

        return `${year}-${month}-${day}T${hour}:${min}:${sec}${offsetSign}${offsetHours}:${offsetMins}`
    }

    const start = buildLocalDateTime(startDate as string, startTime as string)
    const end = buildLocalDateTime(endDate as string, endTime as string)

    console.log("Sending Edit Event Data:")
    console.log('Form Data:')
    console.log('Title:', title)
    console.log('Description:', description)
    console.log('Start Date:', startDate)
    console.log('Start Time:', startTime)
    console.log('End Date:', endDate)
    console.log('End Time:', endTime)
    console.log('Importance:', importance)
    console.log('---')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    const eventId = formData.get('eventId') as string

    const { error } = await supabase.from('calendar_items').update({
        event_name: title,
        Description: description,
        start_datetime: start,
        end_datetime: end,
        importance: importance.toUpperCase(),
        is_task: false
    }).eq('id', eventId).eq('user_id', user.id)

    if (error) {
        console.error('Error updating event:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}