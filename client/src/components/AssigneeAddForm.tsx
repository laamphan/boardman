import { Plus } from "lucide-react"
import { useParams } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { buttonVariants } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

import { cn } from "@/lib/utils"
import { Task, User } from "@/types/db"

type AssigneeAddFormProps = {
  assignees: User[]
  task: Task
}

export const AssigneeAddForm = ({ assignees, task }: AssigneeAddFormProps) => {
  const params = useParams()
  const handleAssigneeAdd = async (id: string) => {
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignee: id }),
        }
      )
      if (res.ok) {
        console.log("Assignees updated")
      }
    } catch (error) {
      console.error("Error updating assignees: ", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "rounded-full h-10 w-10 p-3"
          )}
        >
          <Plus />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {assignees.map((assignee) => (
          <DropdownMenuItem
            key={assignee.id}
            onClick={() => handleAssigneeAdd(assignee.id)}
          >
            <div className="flex items-center">
              <Avatar key={assignee.id} className="h-10 w-10">
                <AvatarImage src={assignee.avatar} alt="User avatar" />
                <AvatarFallback>
                  {assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2">{assignee.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
        {assignees.length === 0 && (
          <DropdownMenuItem>
            <div className="flex items-center">
              <span className="ml-2">No members available to assign</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
