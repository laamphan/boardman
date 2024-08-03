import { useParams } from "react-router-dom"

import { buttonVariants } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

import { cn } from "@/lib/utils"
import { Task } from "@/types/db"

type AttachmentAddFormProps = {
  repoData: any
  task: Task
}

export const AttachmentAddForm = ({
  repoData,
  task,
}: AttachmentAddFormProps) => {
  const params = useParams()

  if (!repoData) {
    return null
  }

  const handleAttachmentAdd = async (
    number: string,
    type: "pull_request" | "commit" | "issue"
  ) => {
    try {
      const res = await fetch(
        `/api/boards/${params.boardId}/cards/${task.cardId}/tasks/${task.id}/github-attach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl: repoData.repoUrl,
            repoId: repoData.repoId,
            type,
            number,
          }),
        }
      )
      if (res.ok) {
        console.log("Attachment added")
      }
    } catch (error) {
      console.error("Error adding attachment: ", error)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2 w-full mt-4">
      <DropdownMenu>
        {repoData.pulls && repoData.pulls.length > 0 && (
          <DropdownMenuTrigger className="col-span-1">
            <div
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Add Pull Request
            </div>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent className="max-h-60 overflow-scroll">
          {repoData.pulls &&
            repoData.pulls.map((pull: any) => (
              <DropdownMenuItem
                key={pull.number}
                onClick={() => handleAttachmentAdd(pull.number, "pull_request")}
              >
                <span className="ml-2">{pull.title}</span>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        {repoData.issues && repoData.issues.length > 0 && (
          <DropdownMenuTrigger className="col-span-1">
            <div
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Add Issue
            </div>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent className="max-h-60 overflow-scroll">
          {repoData.issues &&
            repoData.issues.map((issue: any) => (
              <DropdownMenuItem
                key={issue.number}
                onClick={() => handleAttachmentAdd(issue.number, "issue")}
              >
                <span className="ml-2">{issue.title}</span>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        {repoData.commits && repoData.commits.length > 0 && (
          <DropdownMenuTrigger className="col-span-1">
            <div
              className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
            >
              Add Commit
            </div>
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent className="max-h-60 overflow-scroll">
          {repoData.commits &&
            repoData.commits.map((commit: any) => (
              <DropdownMenuItem
                key={commit.sha}
                onClick={() => handleAttachmentAdd(commit.sha, "commit")}
              >
                <span className="ml-2">{commit.message}</span>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
