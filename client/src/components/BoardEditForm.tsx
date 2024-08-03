import { doc, onSnapshot } from "firebase/firestore"
import { Pen } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

import { db } from "@/firebase"
import { Board } from "@/types/db"

export const BoardEditForm = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board | null>(null)
  const [formData, setFormData] = useState({
    title: board?.title || "",
    description: board?.description || "",
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const docRef = doc(db, "boards", params.boardId!)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setBoard(docSnapshot.data() as Board)
          setFormData(
            docSnapshot.data() as { title: string; description: string }
          )
        } else {
          setBoard(null)
        }
      },
      (error) => {
        console.error("Error fetching board: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBoardUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOpen(!open)
    try {
      const res = await fetch(`/api/boards/${params.boardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      await res.json()
    } catch (error) {
      console.error("Error updating board: ", error)
    }
  }

  const handleBoardDelete = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    try {
      await fetch(`/api/boards/${params.boardId}`, {
        method: "DELETE",
      })

      console.log("Board deleted")
      navigate("/")
    } catch (error) {
      console.error("Error deleting board: ", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="p-3">
          <Pen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-2">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">
            Edit board details
          </DialogTitle>
          <DialogDescription>
            Update the title and description of your board.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <form
            onSubmit={handleBoardUpdate}
            className="flex flex-col w-full gap-3"
          >
            <div className="grid grid-cols-7 items-center gap-2">
              <Label className="text-md col-span-2" htmlFor="title">
                Title
              </Label>
              <Input
                className="col-span-5"
                id="title"
                type="text"
                required
                placeholder="Enter board title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-7 items-center gap-2">
              <Label className="text-md col-span-2" htmlFor="description">
                Description
              </Label>
              <Input
                className="col-span-5"
                id="description"
                type="text"
                required
                placeholder="Enter board description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
          <Button
            onClick={handleBoardDelete}
            variant="destructive"
            className="w-full mt-1"
          >
            Delete Board
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
