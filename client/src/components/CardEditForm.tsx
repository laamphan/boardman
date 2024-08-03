import { doc, onSnapshot } from "firebase/firestore"
import { Pen } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

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
import { Card } from "@/types/db"

type CardEditFormProps = {
  cardProp: Card
}

export const CardEditForm = ({ cardProp }: CardEditFormProps) => {
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [card, setCard] = useState<Card>(cardProp)
  const [formData, setFormData] = useState({
    title: card?.title || "",
    description: card?.description || "",
  })

  useEffect(() => {
    const docRef = doc(db, "cards", card!.id)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setCard(docSnapshot.data() as Card)
          setFormData(
            docSnapshot.data() as { title: string; description: string }
          )
        }
      },
      (error) => {
        console.error("Error fetching card: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCardUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOpen(!open)
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${card.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )
      if (res.ok) {
        console.log("Card updated")
      }
    } catch (error) {
      console.error("Error updating card: ", error)
    }
  }

  const handleCardDelete = async () => {
    setOpen(!open)
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${card.id}`,
        {
          method: "DELETE",
        }
      )
      if (res.ok) {
        console.log("Card deleted")
      }
    } catch (error) {
      console.error("Error deleting card: ", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="h-8 w-8 p-1">
          <Pen className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-2">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">Edit card details</DialogTitle>
          <DialogDescription>
            Update the title and description of your card.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <form
            onSubmit={handleCardUpdate}
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
                placeholder="Enter card title"
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
                placeholder="Enter card description"
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
            onClick={handleCardDelete}
            variant="destructive"
            className="w-full mt-1"
          >
            Delete Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
