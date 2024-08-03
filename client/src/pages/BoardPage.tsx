import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useParams } from "react-router-dom"

import { BoardEditForm } from "@/components/BoardEditForm"
import { CardCard } from "@/components/CardCard"
import { CardCreateForm } from "@/components/CardCreateForm"
import { MemberForm } from "@/components/MemberForm"
import { SideBar } from "@/components/SideBar"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"

import { db } from "@/firebase"
import { changeView } from "@/redux/user/userSlice"
import { Board, Card as CardDB, Membership, User } from "@/types/db"

const BoardPage = () => {
  const params = useParams()
  const [board, setBoard] = useState<Board | null>(null)
  const [cards, setCards] = useState<CardDB[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      },
      (error) => {
        console.error("Error fetching cards: ", error)
      }
    )

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="flex">
        {board && <SideBar />}

        <div className="flex flex-col grow overflow-hidden">
          <div className="flex justify-between items-center h-fit bg-secondary p-3">
            {board && (
              <div
                className="cursor-pointer"
                onClick={() => dispatch(changeView("board"))}
              >
                <h1 className="text-xl font-semibold ml-2 text-ellipsis whitespace-nowrap overflow-hidden">
                  {board?.title}
                </h1>
              </div>
            )}
            <div className="flex items-center gap-3 mr-1">
              <MemberForm />
              <BoardEditForm />
            </div>
          </div>
          <div className="flex h-[calc(100vh-8rem)] bg-background">
            <div className="flex max-h-full p-3 gap-3 overflow-x-auto overflow-y-hidden">
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
