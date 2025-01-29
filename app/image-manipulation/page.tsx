"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export default function ImageManipulationPage() {
  const [image, setImage] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Image Manipulation</h1>
      <div className="mb-4">
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      {image && (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <img
              src={image || "/placeholder.svg"}
              alt="Uploaded image"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
              }}
              className="max-w-full h-auto"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block mb-2">Brightness</label>
              <Slider
                min={0}
                max={200}
                step={1}
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
              />
            </div>
            <div>
              <label className="block mb-2">Contrast</label>
              <Slider min={0} max={200} step={1} value={[contrast]} onValueChange={(value) => setContrast(value[0])} />
            </div>
            <div>
              <label className="block mb-2">Saturation</label>
              <Slider
                min={0}
                max={200}
                step={1}
                value={[saturation]}
                onValueChange={(value) => setSaturation(value[0])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

