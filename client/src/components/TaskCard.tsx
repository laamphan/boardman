import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useDrag } from "react-dnd"
import { useParams } from "react-router-dom"

import { AssigneeAddForm } from "@/components/AssigneeAddForm"
import { CustomDragLayer } from "@/components/CustomDragLayer"
import { GithubRepoForm } from "@/components/GithubRepoForm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button, buttonVariants } from "@/components/ui/Button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

import { db } from "@/firebase"
import { cn } from "@/lib/utils"
import { Assignment, Attachment, Task, TaskStatus, User } from "@/types/db"
import { ItemTypes } from "@/types/dnd"

type TaskCardProps = {
  task: Task
  members: User[]
  cardTitle: string
}

export const TaskCard = ({ task, members, cardTitle }: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [assignees, setAssignees] = useState<User[] | null>(null)
  const [attachments, setAttachments] = useState<Attachment[] | null>(null)
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
  })
  const params = useParams()

  useEffect(() => {
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("taskId", "==", task.id)
    )

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Assignment[]
        if (docs.length) {
          const userIds = docs.map((doc) => doc.memberId)
          if (userIds.length === 0) {
            return
          }
          const userQuery = query(
            collection(db, "users"),
            where("id", "in", userIds)
          )
          const userSnapshot = await getDocs(userQuery)
          const users = userSnapshot.docs.map((doc) => doc.data())
          setAssignees(users.map((user) => user as User))
        } else {
          setAssignees(null)
        }
      },
      (error) => {
        console.error("Error fetching assignment: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const attachmentsQuery = query(
      collection(db, "attachments"),
      where("taskId", "==", task.id)
    )

    const unsubscribe = onSnapshot(
      attachmentsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        }))
        setAttachments(docs as Attachment[])
      },
      (error) => {
        console.error("Error fetching attachments: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    item: { taskId: task.id },
  }))

  const handleTaskUpdate = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsOpen(false)
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )
      if (res.ok) {
        console.log("Task updated")
      }
    } catch (error) {
      console.error("Error updating task: ", error)
    }
  }

  const handleTaskDelete = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsOpen(false)

    try {
      await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      )

      console.log("Task deleted")
    } catch (error) {
      console.error("Error deleting task: ", error)
    }
  }

  const handleAssigneeRemove = async (id: string) => {
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}/assign/${id}`,
        {
          method: "DELETE",
        }
      )
      if (res.ok) {
        console.log("Assignee removed")
      }
    } catch (error) {
      console.error("Error removing assignee: ", error)
    }
  }

  const handleAttachmentRemove = async (id: string) => {
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}/github-attachments/${id}`,
        {
          method: "DELETE",
        }
      )
      if (res.ok) {
        console.log("Attachment removed")
      }
    } catch (error) {
      console.error("Error removing attachment: ", error)
    }
  }

  const availableMembers = members.filter(
    (member) => !assignees?.find((assignee) => assignee.id === member.id)
  )
  const pulls = attachments?.filter(
    (attachment) => attachment.type === "pull_request"
  )
  const commits = attachments?.filter(
    (attachment) => attachment.type === "commit"
  )
  const issues = attachments?.filter(
    (attachment) => attachment.type === "issue"
  )

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <CustomDragLayer />
      <DrawerTrigger
        ref={drag}
        className={cn(
          "w-full select-none",
          isDragging ? "opacity-50" : "opacity-100"
        )}
      >
        <div
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "w-full flex justify-between items-center overflow-hidden"
          )}
        >
          <div className="text-ellipsis whitespace-nowrap overflow-hidden">
            {task.title}
          </div>
          <div className="flex items-center gap-1">
            {assignees &&
              assignees.length < 3 &&
              assignees.map((assignee) => (
                <Avatar key={assignee.id} className="h-5 w-5">
                  <AvatarImage src={assignee.avatar} alt="User avatar" />
                  <AvatarFallback className="bg-background text-xs">
                    {assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            {assignees &&
              assignees.length >= 3 &&
              assignees.slice(0, 2).map((assignee) => (
                <Avatar key={assignee.id} className="h-5 w-5">
                  <AvatarImage src={assignee.avatar} alt="User avatar" />
                  <AvatarFallback className="bg-background text-xs">
                    {assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            {assignees && assignees.length >= 3 && (
              <div className="h-5 w-5 flex items-center justify-center bg-background rounded-full">
                +{assignees.length - 2}
              </div>
            )}
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="max-h-[calc(100vh-5rem)] ">
        <DrawerTitle />
        <DrawerDescription />
        <div className="mx-auto px-10 w-full max-w-3xl min-h-[100vh-20rem]  overflow-x-auto">
          <div className="flex flex-col">
            <Input
              autoFocus
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Add a title..."
              className="border-0 p-0 text-3xl font-bold focus-visible:outline-none focus-visible:ring-transparent"
            />
            <p className="mt-2">in list {cardTitle}</p>
          </div>
          <div className="mt-6">
            <div className="mt-3 grid grid-cols-2">
              <div className="col-span-1">
                <h2 className="font-bold">Assigned</h2>
                <div className="flex gap-3 mt-2.5">
                  {assignees?.map((assignee) => {
                    return (
                      <div
                        className="relative cursor-pointer"
                        onClick={() => handleAssigneeRemove(assignee.id)}
                        key={assignee.id}
                      >
                        <Avatar key={assignee.id}>
                          <AvatarImage
                            className="h-10 w-10"
                            src={assignee.avatar}
                            alt="User avatar"
                          />
                          <AvatarFallback className="">
                            {assignee.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant={"outline"}
                          className="rounded-full absolute bottom-[-0.2rem] right-[-0.2rem] p-0.5 h-4 w-4"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                  <AssigneeAddForm task={task} assignees={availableMembers} />
                </div>
              </div>
              <div className="col-span-1">
                <h2 className="font-bold">Status</h2>
                <Select
                  defaultValue="todo"
                  value={formData.status}
                  onValueChange={(e) => {
                    setFormData({ ...formData, status: e as TaskStatus })
                    console.log(formData)
                  }}
                >
                  <SelectTrigger className="mt-3 w-[20ch]">
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
            </div>
            <div className="mt-6">
              <h2 className="font-bold mb-3">Attachments</h2>
              {(!attachments || attachments.length === 0) && (
                <p className="text-muted-foreground">No attachments</p>
              )}
              {pulls && pulls.length > 0 && (
                <h3 className="font-semibold">Pull requests</h3>
              )}
              {pulls &&
                pulls.map((pull) => (
                  <div
                    key={pull.id}
                    className="flex justify-between items-center mt-1"
                  >
                    <div className="text-ellipsis whitespace-nowrap overflow-hidden mr-3">
                      Link:{" "}
                      <a
                        className="text-blue-400"
                        href={pull.repoUrl + `/pull/${pull.number}`}
                      >
                        {pull.repoUrl + `/pull/${pull.number}`}
                      </a>
                    </div>
                    <Button
                      onClick={() => handleAttachmentRemove(pull.id)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              {issues && issues.length > 0 && (
                <h3 className="font-semibold">Issues</h3>
              )}
              {issues &&
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex justify-between items-center mt-1"
                  >
                    <div className="text-ellipsis whitespace-nowrap overflow-hidden mr-3">
                      Link:{" "}
                      <a
                        className="text-blue-400"
                        href={issue.repoUrl + `/issues/${issue.number}`}
                      >
                        {issue.repoUrl + `/issues/${issue.number}`}
                      </a>
                    </div>
                    <Button
                      onClick={() => handleAttachmentRemove(issue.id)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              {commits && commits.length > 0 && (
                <h3 className="font-semibold">Commits</h3>
              )}
              {commits &&
                commits.map((commit) => (
                  <div
                    key={commit.id}
                    className="flex justify-between items-center mt-1"
                  >
                    <div className="text-ellipsis whitespace-nowrap overflow-hidden mr-3">
                      Link:{" "}
                      <a
                        className="text-blue-400"
                        href={commit.repoUrl + `/commit/${commit.number}`}
                      >
                        {commit.repoUrl + `/commit/${commit.number}`}
                      </a>
                    </div>
                    <Button
                      onClick={() => handleAttachmentRemove(commit.id)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
            </div>
            <div className="mt-6">
              <h2 className="mb-4 font-bold">Add Github Attachments</h2>
              <GithubRepoForm task={task} />
            </div>
            <div className="mt-5">
              <h2>Description</h2>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add a more detailed description..."
                className="w-full border-2 rounded-lg p-3 mt-3"
              ></Input>
            </div>
          </div>
          <DrawerFooter className="px-0">
            <Button className="w-full" onClick={handleTaskUpdate}>
              Submit
            </Button>
            <DrawerClose asChild>
              <Button onClick={handleTaskDelete} variant="destructive">
                Delete
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
