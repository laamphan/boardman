import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { redirect } from "react-router-dom"

import { BoardCard } from "@/components/BoardCard"
import { BoardCreateForm } from "@/components/BoardCreateForm"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { db } from "@/firebase"
import { RootState } from "@/redux/store"
import { Board, Membership } from "@/types/db"

const Home = () => {
  const [boards, setBoards] = useState<Board[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const { currentUser } = useSelector((state: RootState) => state.user)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      redirect("/signin")
      return
    }

    const membershipsQuery = query(
      collection(db, "memberships"),
      where("memberId", "==", currentUser.id)
    )
    const unsubscribe = onSnapshot(
      membershipsQuery,
      async (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Membership[]
        if (docs.length) {
          const boardIds = docs.map((doc) => doc.boardId)
          if (boardIds.length === 0) {
            return
          }
          const boardQuery = query(
            collection(db, "boards"),
            where("id", "in", boardIds)
          )
          const boardSnapshot = await getDocs(boardQuery)
          const boards = boardSnapshot.docs.map((doc) => doc.data())
          setBoards(boards.map((board) => board as Board))
          setIsLoading(false)
        } else {
          setBoards([])
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Error fetching boards: ", error)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [currentUser])

  return (
    <>
      <div className="container mb-4">
        <h1 className="font-bold text-2xl py-9">Your workspace</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {isLoading && (
            <Card className="flex items-center justify-center h-36">
              <div className="px-6 h-full w-full">
                <Skeleton className="mt-8 h-5 w-full" />
                <div className="mt-3">
                  <Skeleton className="mt-2 h-3 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-3/4" />
                </div>
              </div>
            </Card>
          )}
          {boards.map((board) => (
            <BoardCard board={board} key={board.id} />
          ))}
          {isEditing ? (
            <BoardCreateForm setIsEditing={setIsEditing} />
          ) : (
            <Card
              className="flex items-center justify-center h-36"
              onClick={() => setIsEditing(!isEditing)}
            >
              <CardHeader>
                <CardTitle className="text-muted-foreground text-lg">
                  + Create a new board
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
