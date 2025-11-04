"use server"
import { createClient } from "@/lib/supabase/server"

export async function createEvent(formData: FormData) {
    const title = formData.get('title')
    const description = formData.get('description')
    const startDate = formData.get('startDate')
    const startTime = formData.get('startTime')
    const endDate = formData.get('endDate')
    const endTime = formData.get('endTime')
    const importance = formData.get('importance')?.toString().toUpperCase() || 'none'

    console.log('Form Data:')
    console.log('Title:', title)
    console.log('Description:', description)
    console.log('Start Date:', startDate)
    console.log('Start Time:', startTime)
    console.log('End Date:', endDate)
    console.log('End Time:', endTime)
    console.log('Importance:', importance)
    console.log('---')


    const start = `${startDate}T${startTime}` 
    const end = `${endDate}T${endTime}`

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase.from('calendar_items').insert([
        {
            user_id: user.id,
            event_name: title,
            Description: description,
            start_datetime: start,
            end_datetime: end,
            importance: importance,
        },
    ])

    if (error) {
        console.error('Error inserting event:', error.message)
        return { success: false, error: error.message }
    }
    return { success: true }

    // // Test: return success if title equals "hello"
    // if (title === 'hello') {
    //     return { success: true }
    // } else {
    //     return { success: false, error: 'Title must be "hello" for this test' }
    // }
    console.log('---')
}