import { collection, onSnapshot, query, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"

import InviteManageForm from "@/components/InviteManageForm"
import { ModeToggle } from "@/components/ModeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

import { db } from "@/firebase"
import { RootState } from "@/redux/store"
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "@/redux/user/userSlice"
import { Invitation } from "@/types/db"

export const UserNav = () => {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [invitations, setInvitations] = useState<Invitation[]>([])

  useEffect(() => {
    const invitationsQuery = query(
      collection(db, "invitations"),
      where("memberEmail", "==", currentUser!.email)
    )

    const unsubscribe = onSnapshot(
      invitationsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Invitation[]
        setInvitations(docs)
      },
      (error) => {
        console.error("Error fetching invitations: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!currentUser) {
    return null
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart({}))
      const res = await fetch("/api/auth/signout")
      const data = await res.json()
      if (data.success === false) {
        dispatch(signOutFailure(data.message))
        return
      }
      dispatch(signOutSuccess({}))
    } catch (err) {
      dispatch(signOutFailure("Error signing out"))
      console.log(err)
    }
  }

  return (
    <>
      <nav className="fixed top-0 inset-x-0 flex justify-between items-center h-fit bg-background py-2">
        <div>
          <Link to="/" className="ml-4 font-bold text-2xl text-foreground">
            boardman
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <InviteManageForm invitations={invitations} />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger>
              <Avatar className="my-1 mx-3">
                <AvatarImage src={currentUser.avatar} alt="User avatar" />
                <AvatarFallback className="">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {currentUser.name && (
                    <p className="font-medium">{currentUser.name}</p>
                  )}
                  {currentUser.email &&
                    currentUser.email != currentUser.name && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {currentUser.email}
                      </p>
                    )}
                </div>
              </div>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  handleSignOut()
                }}
                className="cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="pb-16" />
    </>
  )
}
