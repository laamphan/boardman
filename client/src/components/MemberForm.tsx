import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
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

import { db } from "@/firebase"
import { Membership, User } from "@/types/db"

export const MemberForm = () => {
  const [email, setEmail] = useState("")
  const [members, setMembers] = useState<User[]>([])
  const params = useParams()

  useEffect(() => {
    const membersQuery = query(
      collection(db, "memberships"),
      where("boardId", "==", params.boardId)
    )

    const unsubscribe = onSnapshot(
      membersQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Membership[]

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
        setMembers(users.map((user) => user as User))
      },
      (error) => {
        console.error("Error fetching members: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/boards/${params.boardId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      setEmail("")
      if (res.ok) {
        console.log("Invite sent")
      }
    } catch (error) {
      console.error("Error sending invite: ", error)
    }
  }

  const handleMemberRemove = async (memberId: string) => {
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      )
      if (res.ok) {
        console.log("Member removed")
      }
    } catch (error) {
      console.error("Error removing member: ", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" /> Manage members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-2 pb-2">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2">
            Manage & invite members
          </DialogTitle>
          <DialogDescription>
            Enter email to send an invitation to this board.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div>
            <h1 className="font-bold text-xl">Members</h1>
            <div className="flex flex-col gap-2 mt-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex justify-between items-center gap-2"
                >
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt="User avatar" />
                      <AvatarFallback>
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p>{member.name}</p>
                  </div>
                  <Button
                    onClick={() => handleMemberRemove(member.id)}
                    variant="outline"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <form
              onSubmit={handleInviteSubmit}
              className="flex flex-col w-full gap-3"
            >
              <Input
                type="email"
                required
                value={email}
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="w-full">
                Send invite
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
