import { Link } from "react-router-dom"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"

import { Board } from "@/types/db"

type BoardCardProps = {
  board: Board
}

export const BoardCard = ({ board }: BoardCardProps) => {
  return (
    <Link to={`/boards/${board.id}`}>
      <Card className="h-36 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">{board.title}</CardTitle>
          <CardDescription className="text-sm break-words">
            {board.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
