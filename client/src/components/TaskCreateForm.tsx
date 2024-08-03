import { SelectValue } from "@radix-ui/react-select"
import { X } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select"

type TaskCreateFormProps = {
  setIsAddingTask: (isAddingTask: boolean) => void
  cardId: string
}

export const TaskCreateForm = ({
  setIsAddingTask,
  cardId,
}: TaskCreateFormProps) => {
  const params = useParams()
  const { boardId } = params
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAddingTask(false)

    try {
      const res = await fetch(`/api/boards/${boardId}/cards/${cardId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cardId,
          title: formData.title,
          description: formData.description,
          status: formData.status,
        }),
      })
      if (res.ok) {
        console.log("Task created")
      }
    } catch (error) {
      console.error("Error creating task: ", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-1">
        <Input
          autoFocus
          className="border-0"
          type="text"
          placeholder="Task title"
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          className="border-0"
          type="text"
          placeholder="Task description"
          required
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <Select
          defaultValue="todo"
          onValueChange={(e) => {
            setFormData({ ...formData, status: e })
            console.log(formData)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <Button className="grow" type="submit">
          Create Task
        </Button>
        <Button
          className="h-10 w-10 p-2"
          onClick={() => setIsAddingTask(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
