export type User = {
  id: string
  name: string
  email: string
  avatar: string
}

export type Board = {
  id: string
  ownerId: string
  title: string
  description: string
}

export type Card = {
  id: string
  boardId: string
  title: string
  description: string
}

export type TaskStatus = "todo" | "in-progress" | "done" | "canceled"

export type Task = {
  id: string
  cardId: string
  title: string
  description: string
  status: TaskStatus
}

export type Invitation = {
  id: string
  boardOwnerId: string
  boardId: string
  memberEmail: string
}

export type Membership = {
  id: string
  boardId: string
  memberId: string
}

export type Assignment = {
  id: string
  taskId: string
  memberId: string
}

export type Attachment = {
  id: string
  number: string
  repoId: string
  repoUrl: string
  taskId: string
  type: "issue" | "pull_request" | "commit"
}
