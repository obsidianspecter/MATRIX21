import DrawingApp from "@/components/DrawingApp"

export default function DrawingPage() {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Interactive Drawing Board</h1>
      <DrawingApp />
    </div>
  )
}

