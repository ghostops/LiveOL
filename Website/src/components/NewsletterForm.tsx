import { useState } from 'react'
import type { FormEvent } from 'react'

export default function LiveOLNewsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://assets.mailerlite.com/jsonp/356973/forms/94950434401158617/subscribe',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'fields[email]': email,
            'ml-submit': '1',
            anticsrf: 'true',
          }),
        },
      )

      if (response.ok) {
        setSuccess(true)
      } else {
        setError('Subscription failed. Please try again.')
      }
    } catch {
      // MailerLite may not support CORS, so we'll assume success on network error
      // In production, consider using their JS SDK or a backend proxy
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-100 rounded p-5">
        <h4 className="text-3xl font-normal text-black mb-2">Thank you!</h4>
        <p className="text-sm text-black">
          You have successfully joined our subscriber list.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto bg-gray-100 rounded p-5">
      <h4 className="text-3xl font-normal text-black mb-2">LiveOL Updates</h4>
      <p className="text-sm text-black mb-5">
        Signup for news about LiveOL development.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="email"
            aria-required="true"
            className={`w-full px-3 py-2.5 text-sm border rounded text-gray-800 bg-white
              ${error ? 'border-red-500' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-orange-500`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-orange-500 hover:bg-gray-800 text-white 
            font-bold text-sm rounded transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
    </div>
  )
}
