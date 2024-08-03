import React, { useState } from "react"

import { AttachmentAddForm } from "@/components/AttachmentAddForm"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

import { Task } from "@/types/db"

type GithubRepoFormProps = {
  task: Task
}

export const GithubRepoForm = ({ task }: GithubRepoFormProps) => {
  const [repo, setRepo] = useState("")
  const [repoData, setRepoData] = useState<any | null>(null)

  const handleRepoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/repositories/github-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repoUrl: repo }),
      })
      const data = await res.json()
      setRepoData(data)
      console.log(data)
    } catch (error) {
      console.error("Error fetching repo: ", error)
    }
  }

  return (
    <>
      <form onSubmit={handleRepoSubmit}>
        <Input
          type="text"
          placeholder="Insert Repo URL"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
        <Button className="mt-3" type="submit">
          Get Repo
        </Button>
      </form>

      <AttachmentAddForm repoData={repoData} task={task} />
    </>
  )
}
