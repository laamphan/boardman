import { X } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

type CardCreateFormProps = {
  setIsEditing: (isEditing: boolean) => void
}

export const CardCreateForm = ({ setIsEditing }: CardCreateFormProps) => {
  const params = useParams()
  const [formData, setFormData] = useState<{
    title: string
    description: string
  }>({ title: "", description: "" })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsEditing(false)

    try {
      const res = await fetch(`/api/boards/${params.boardId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        return
      }

      setFormData({ title: "", description: "" })
      console.log("Card created: ", data)
    } catch (error) {
      console.log("Error creating card: ", error)
    }
  }

  return (
    <Card className="w-60 flex-shrink-0 h-fit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Input
            autoFocus
            className="border-0"
            type="text"
            required
            placeholder="Card title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Input
            className="border-0"
            type="text"
            required
            placeholder="Card description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex items-center m-1.5 gap-1">
          <Button className="grow" type="submit">
            Create Card
          </Button>
          <Button className="h-10 w-10 p-2" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}
