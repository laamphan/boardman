import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"

import { db } from "@/firebase"
import { Board, Invitation } from "@/types/db"

type InviteManageFormProps = {
  invitations: Invitation[]
}

const InviteManageForm = ({ invitations }: InviteManageFormProps) => {
  const [boards, setBoards] = useState<Board[]>([])

  const boardIds = invitations.map((invitation) => invitation.boardId)

  // subscribe to board infos from invitations
  useEffect(() => {
    if (boardIds.length === 0) {
      return
    }
    const boardsQuery = query(
      collection(db, "boards"),
      where("id", "in", boardIds)
    )

    const unsubscribe = onSnapshot(
      boardsQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Board[]
        setBoards(docs)
      },
      (error) => {
        console.error("Error fetching boards: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitations])

  const handleInviteRes = async (res: string, id: string, boardId: string) => {
    if (res === "accept") {
      try {
        await fetch(`/api/boards/${boardId}/invite/accept/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      } catch (error) {
        console.error("Error responding to invitation: ", error)
      }
    } else if (res === "reject") {
      try {
        await fetch(`/api/boards/${boardId}/invite/reject/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: "reject",
          }),
        })
      } catch (error) {
        console.error("Error responding to invitation: ", error)
      }
    } else {
      console.log("Invalid request")
    }
  }

  const getBoardTitleFromId = (id: string) => {
    const board = boards.find((board) => board.id === id)
    return board?.title || "Unknown board"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-8 w-8" variant={"secondary"}>
          {invitations.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-2 pb-2">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">
            Received invitations
          </DialogTitle>
          <DialogDescription>
            Accept the invitations to join boards.
          </DialogDescription>
        </DialogHeader>
        <div className="py-5">
          <h1 className="font-bold text-xl">Invitations</h1>
          <div className="flex flex-col gap-2 mt-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex justify-between items-center gap-2"
              >
                <p className="text-lg">
                  {getBoardTitleFromId(invitation.boardId)}
                </p>
                <div className="flex gap-2 items-center">
                  <Button
                    onClick={async () => {
                      handleInviteRes(
                        "accept",
                        invitation.id,
                        invitation.boardId
                      )
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={async () => {
                      handleInviteRes(
                        "reject",
                        invitation.id,
                        invitation.boardId
                      )
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {invitations.length === 0 && (
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">No invitations</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InviteManageForm
