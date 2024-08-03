import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useDrop } from "react-dnd"
import { useSelector } from "react-redux"
import { Assignment, Card as DBCard, Task, User } from "../types/db"

import { CardEditForm } from "@/components/CardEditForm"
import { TaskCard } from "@/components/TaskCard"
import { TaskCreateForm } from "@/components/TaskCreateForm"
import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { db } from "@/firebase"
import { RootState } from "@/redux/store"
import { ItemTypes } from "@/types/dnd"

type CardCardProps = {
  card: DBCard
  members: User[]
}

export const CardCard = ({ card, members }: CardCardProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const { view } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const tasksQuery = query(
      collection(db, "tasks"),
      where("cardId", "==", card.id)
    )

    const unsubscribe = onSnapshot(
      tasksQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Task[]

        if (view !== "board") {
          const taskIds = docs.map((doc) => doc.id)
          const assignmentsQuery = query(
            collection(db, "assignments"),
            where("taskId", "in", taskIds)
          )

          const assignmentsSnapshot = await getDocs(assignmentsQuery)
          const assignments = assignmentsSnapshot.docs.map((doc) => ({
            ...doc.data(),
          })) as Assignment[]
          const assignmentsForAssignee = assignments.filter(
            (assignment) => assignment.memberId === view
          )
          const assignedTasks = docs.filter((task) =>
            assignmentsForAssignee.some(
              (assignment) => assignment.taskId === task.id
            )
          )
          setTasks(assignedTasks)
        } else {
          setTasks(docs)
        }
      },
      (error) => {
        console.error("Error fetching tasks: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { taskId: string }) => {
      if (item && item.taskId) {
        handleTaskUpdate({ taskId: item.taskId })
      }
    },
  }))

  const handleTaskUpdate = async ({ taskId }: { taskId: string }) => {
    try {
      const res = await fetch(
        `/api/boards/${card.boardId}/cards/${card.id}/tasks/${taskId}/newCard`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      if (res.ok) {
        console.log("Task updated")
      }
    } catch (error) {
      console.error("Error updating task: ", error)
    }
  }

  return (
    <div className="flex flex-col w-60 h-full">
      <Card ref={drop} className="w-60 overflow-hidden flex flex-col">
        <CardHeader className="pl-5 pr-3 pt-5 pb-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{card.title}</CardTitle>
            <CardEditForm cardProp={card} />
          </div>
        </CardHeader>
        <CardContent className="p-3 pb-0 flex flex-col overflow-y-auto flex-1">
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                cardTitle={card.title}
                task={task}
                members={members}
                key={task.id}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-1.5">
          {isAddingTask && (
            <TaskCreateForm
              setIsAddingTask={setIsAddingTask}
              cardId={card.id}
            />
          )}
          {!isAddingTask && (
            <Button
              variant={"ghost"}
              onClick={() => setIsAddingTask(true)}
              className="w-full justify-start text-muted-foreground"
            >
              + Add Task
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
