import { createFileRoute, redirect } from '@tanstack/react-router'

// Old app versions link here from settings. Translations are AI-generated now.
export const Route = createFileRoute('/translate')({
  beforeLoad: () => {
    throw redirect({ to: '/contact', statusCode: 301 })
  },
})
