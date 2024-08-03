import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"

import { db } from "@/firebase"
import { cn } from "@/lib/utils"
import { RootState } from "@/redux/store"
import { changeView } from "@/redux/user/userSlice"
import { Membership, User } from "@/types/db"

export const SideBar = () => {
  const [members, setMembers] = useState<User[]>([])
  const params = useParams()
  const dispatch = useDispatch()
  const { view } = useSelector((state: RootState) => state.user)

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

  return (
    <div className="w-72 flex-shrink-0 min-h-full hidden lg:flex bg-navbar">
      <div className="p-4">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => dispatch(changeView("board"))}
        >
          All Tasks
        </h1>
        <h1 className="text-xl font-bold mt-5">Members</h1>
        <div className="flex flex-col mt-4 gap-1">
          {members.map((member) => (
            <div
              key={member.id}
              className={cn(
                "flex gap-2 items-center overflow-hidden cursor-pointer py-3 px-4 rounded-lg hover:bg-muted",
                view === member.id && "bg-muted"
              )}
              onClick={() => dispatch(changeView(member.id))}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} alt="User avatar" />
                <AvatarFallback className="">
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p>{member.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
