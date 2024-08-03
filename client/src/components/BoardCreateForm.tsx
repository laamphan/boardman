import { X } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

import { RootState } from "../redux/store"

type BoardCreateFormProps = {
  setIsEditing: (isEditing: boolean) => void
}

export const BoardCreateForm = ({ setIsEditing }: BoardCreateFormProps) => {
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [formData, setFormData] = useState<{
    title: string
    description: string
  }>({ title: "", description: "" })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEditing(false)

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          ownerId: currentUser!.id,
          description: formData.description,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        return
      }

      setFormData({ title: "", description: "" })
      console.log("Board created: ", data)
    } catch (error) {
      console.log("Error creating board: ", error)
    }
  }

  return (
    <Card className="h-36">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between h-full"
      >
        <div className="flex flex-col gap-1 px-1">
          <Input
            autoFocus
            className="border-0"
            type="text"
            required
            placeholder="Board title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            className="border-0"
            type="text"
            required
            placeholder="Board description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex items-center m-1.5 gap-1">
          <Button className="grow" type="submit">
            Create Board
          </Button>
          <Button className="h-10 w-10 p-2" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
