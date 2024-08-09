import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useParams } from "react-router-dom"

import { BoardEditForm } from "@/components/BoardEditForm"
import { CardCard } from "@/components/CardCard"
import { CardCreateForm } from "@/components/CardCreateForm"
import { MemberForm } from "@/components/MemberForm"
import { SideBar } from "@/components/SideBar"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"

import { Skeleton } from "@/components/ui/Skeleton"
import { db } from "@/firebase"
import { changeView } from "@/redux/user/userSlice"
import { Board, Card as CardDB, Membership, User } from "@/types/db"

const BoardPage = () => {
  const params = useParams()
  const [board, setBoard] = useState<Board | null>(null)
  const [cards, setCards] = useState<CardDB[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch()

  useEffect(() => {
    const docRef = doc(db, "boards", params.boardId!)

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setBoard(docSnapshot.data() as Board)
        } else {
          setBoard(null)
        }
      },
      (error) => {
        console.error("Error fetching board: ", error)
      }
    )

    return () => unsubscribe()
  }, [params.boardId])

  useEffect(() => {
    const cardsQuery = query(
      collection(db, "cards"),
      where("boardId", "==", params.boardId)
    )

    const unsubscribe = onSnapshot(
      cardsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as CardDB[]
        setCards(docs)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching cards: ", error)
      }
    )

    return () => unsubscribe()
  }, [params.boardId])

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
        const users = userSnapshot.docs.map((doc) => doc.data()) as User[]
        setMembers(users.map((user) => user))
      },
      (error) => {
        console.error("Error fetching members: ", error)
      }
    )

    return () => unsubscribe()
  }, [params.boardId])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = (event: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX
      const element = scrollRef.current

      if (element) {
        const rect = element.getBoundingClientRect()
        const scrollAmount = 15

        if (clientX < rect.left + 50) {
          element.scrollBy(-scrollAmount, 0)
        } else if (clientX > rect.right - 50) {
          element.scrollBy(scrollAmount, 0)
        }
      }
    }

    const handleMouseDown = () => {
      setIsDragging(true)
    }
    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        handleScroll(event)
      }
    }
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchMove = (event: TouchEvent) => {
      handleScroll(event)
    }

    const element = scrollRef.current
    if (element) {
      element.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      element.addEventListener("touchmove", handleTouchMove, { passive: true })
    }

    return () => {
      if (element) {
        element.removeEventListener("mousedown", handleMouseDown)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)

        element.removeEventListener("touchmove", handleTouchMove)
      }
    }
  }, [isDragging])

  return (
    <>
      <div className="flex">
        {board ? (
          <SideBar />
        ) : (
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
                <div className="flex items-center py-3 px-4 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3.5 w-32 ml-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col grow overflow-hidden">
          <div className="flex justify-between items-center h-fit bg-secondary p-3">
            <div
              className="cursor-pointer"
              onClick={() => dispatch(changeView("board"))}
            >
              <h1 className="text-xl font-semibold ml-2 text-ellipsis whitespace-nowrap overflow-hidden">
                {board?.title || (
                  <Skeleton className="h-3 w-32 bg-muted-foreground" />
                )}
              </h1>
            </div>
            <div className="flex items-center gap-3 mr-1">
              <MemberForm />
              <BoardEditForm />
            </div>
          </div>
          <div className="flex h-[calc(100vh-8rem)] bg-background">
            <div
              ref={scrollRef}
              className="flex max-h-full p-3 gap-3 overflow-x-auto overflow-y-hidden"
            >
              {isLoading && (
                <Card className="w-60 flex-shrink-0 h-fit">
                  <div className="px-3 h-full w-full">
                    <Skeleton className="mt-8 h-4 w-full" />
                    <div className="mt-7 mb-5">
                      <Skeleton className="mt-2 h-3 w-full" />
                      <Skeleton className="mt-2 h-3 w-full" />
                    </div>
                  </div>
                </Card>
              )}
              {cards.map((card) => (
                <CardCard card={card} key={card.id} members={members} />
              ))}
              {isEditing && <CardCreateForm setIsEditing={setIsEditing} />}
              {!isEditing && (
                <Card
                  className="w-60 flex-shrink-0 h-fit cursor-pointer"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <CardHeader>
                    <CardTitle className="text-muted-foreground text-lg">
                      + Add another card
                    </CardTitle>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BoardPage
