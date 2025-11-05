import {createClient} from '@supabase/supabase-js'
import {NextResponse} from 'next/server'
import {NextRequest} from 'next/server'

const client = createClient(    
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const getUserID = async () => {
    // get user id from supabase auth
    const {
        data: { user },
    } = await client.auth.getUser()
    return user?.id
}

export async function GET(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({error: 'Missing userId parameter'}, {status: 400})
    }

    const {data, error} = await client
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', {ascending: false})

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
    
    return NextResponse.json({events: data})
}

export async function POST(request: NextRequest) {
    // Parse the request body
    const {title, description, start, end, importance} = await request.json()

    // Insert the new event into the database
    const {error} = await client.from('events').insert([
        {
            user_id: await getUserID(),
            event_name: title,
            Description: description,
            start_datetime: start,
            end_datetime: end,
            importance: importance,
        },
    ])
    
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json({status: 200})
}