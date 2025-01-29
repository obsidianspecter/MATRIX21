import Link from "next/link"
import { Home, PenTool, Image, Table, Video } from "lucide-react"

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <Home className="mr-2" />
              Home
            </Link>
          </li>
          <li>
            <Link href="/drawing" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <PenTool className="mr-2" />
              Drawing
            </Link>
          </li>
          <li>
            <Link href="/image-manipulation" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <Image className="mr-2" />
              Image Manipulation
            </Link>
          </li>
          <li>
            <Link href="/table" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <Table className="mr-2" />
              Table
            </Link>
          </li>
          <li>
            <Link href="/video-call" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <Video className="mr-2" />
              Video Call
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

