"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TableData {
  id: number
  name: string
  age: number
  email: string
}

export default function TablePage() {
  const [data, setData] = useState<TableData[]>([
    { id: 1, name: "John Doe", age: 30, email: "john@example.com" },
    { id: 2, name: "Jane Smith", age: 25, email: "jane@example.com" },
  ])

  const [newRow, setNewRow] = useState<Omit<TableData, "id">>({ name: "", age: 0, email: "" })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewRow((prev) => ({ ...prev, [name]: name === "age" ? Number.parseInt(value) : value }))
  }

  const handleAddRow = () => {
    setData((prev) => [...prev, { ...newRow, id: prev.length + 1 }])
    setNewRow({ name: "", age: 0, email: "" })
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Data Table</h1>
      <div className="mb-4 flex gap-2">
        <Input type="text" name="name" placeholder="Name" value={newRow.name} onChange={handleInputChange} />
        <Input type="number" name="age" placeholder="Age" value={newRow.age} onChange={handleInputChange} />
        <Input type="email" name="email" placeholder="Email" value={newRow.email} onChange={handleInputChange} />
        <Button onClick={handleAddRow}>Add Row</Button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Age</th>
            <th className="border border-gray-300 p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td className="border border-gray-300 p-2">{row.id}</td>
              <td className="border border-gray-300 p-2">{row.name}</td>
              <td className="border border-gray-300 p-2">{row.age}</td>
              <td className="border border-gray-300 p-2">{row.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

