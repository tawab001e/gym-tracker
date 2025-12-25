import './globals.css'

export const metadata = {
  title: 'Gym Tracker Pro',
  description: 'Track your workouts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
