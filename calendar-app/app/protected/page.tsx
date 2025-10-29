import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login (middleware should handle this, but double-check)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Protected Page
        </h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              User Information
            </h2>
            <div className="mt-2 space-y-2 rounded-md bg-gray-100 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">User ID:</span> {user.id}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Created:</span>{' '}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
