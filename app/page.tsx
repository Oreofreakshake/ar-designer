import { Camera } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">AR Designer</h1>
      
      <div className="flex flex-col items-center gap-4">
        <Camera className="w-16 h-16" />
        <p className="text-lg text-center max-w-md">
          Welcome to AR Designer. Get started by allowing camera access to begin designing in augmented reality.
        </p>
      </div>
    </main>
  )
}
