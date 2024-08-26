import { v4 as uuidV4 } from "uuid"

import { db } from "../db/firebaseConfig"

export const getTask = async (req: any, res: any, next: any) => {
  const { taskId, boardId } = req.params
  const userId = req.user.id

  if (!taskId || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const memberships = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .get()
    if (memberships.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    return res.status(200).json(taskData)
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req: any, res: any, next: any) => {
  const { cardId, boardId } = req.params
  const userId = req.user.id

  if (!cardId || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const memberships = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", userId)
      .get()
    if (memberships.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const tasks = await db
      .collection("tasks")
      .where("cardId", "==", cardId)
      .get()
    const tasksData = tasks.docs.map((task) => task.data())

    return res.status(200).json(tasksData)
  } catch (error) {
    next(error)
  }
}

export const createTask = async (req: any, res: any, next: any) => {
  const { cardId, title, description, status } = req.body
  const userId = req.user.id

  if (!title || !cardId || !status) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const memberships = await db
      .collection("memberships")
      .where("memberId", "==", userId)
      .get()
    if (memberships.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const taskId = uuidV4()
    await db
      .collection("tasks")
      .doc(taskId)
      .set({
        id: taskId,
        cardId,
        title,
        description: description || "",
        status,
      })

    return res.status(201).json({
      id: taskId,
      cardId,
      title,
      description: description || "",
      status,
    })
  } catch (error) {
    next(error)
  }
}

export const updateTaskCard = async (req: any, res: any, next: any) => {
  const { taskId, cardId } = req.params
  const userId = req.user.id

  if (!cardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    const card = await db.collection("cards").doc(cardId).get()
    const cardData = card.data()
    if (!cardData) {
      return res.status(404).json({ success: false, message: "Card not found" })
    }

    await db.collection("tasks").doc(taskId).update({
      cardId,
    })

    const updatedTask = await db.collection("tasks").doc(taskId).get()

    return res.status(200).json(updatedTask.data())
  } catch (error) {
    next(error)
  }
}

export const updateTask = async (req: any, res: any, next: any) => {
  const { taskId, boardId } = req.params
  const { title, description, status } = req.body
  const userId = req.user.id

  if (!title || !description || !taskId || !status) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const membership = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .get()
    if (membership.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    await db.collection("tasks").doc(taskId).update({
      title,
      description,
      status,
    })

    return res.status(200).json({
      id: taskId,
      cardId: taskData.cardId,
      title,
      description,
      status,
    })
  } catch (error) {
    next(error)
  }
}

export const assignTask = async (req: any, res: any, next: any) => {
  const { taskId } = req.params
  const { assignee } = req.body
  const userId = req.user.id

  if (!taskId || !assignee) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    const assignment = await db
      .collection("assignments")
      .where("taskId", "==", taskId)
      .where("memberId", "==", assignee)
      .get()
    if (!assignment.empty) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists",
      })
    }

    const assignmentId = uuidV4()
    await db.collection("assignments").doc(assignmentId).set({
      id: assignmentId,
      taskId,
      memberId: assignee,
    })

    return res.status(201).json({
      taskId,
      memberId: assignee,
    })
  } catch (error) {
    next(error)
  }
}

export const unassignTask = async (req: any, res: any, next: any) => {
  const { taskId, memberId } = req.params
  const userId = req.user.id

  if (!taskId || !memberId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    const assignments = await db
      .collection("assignments")
      .where("taskId", "==", taskId)
      .where("memberId", "==", memberId)
      .get()
    if (assignments.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" })
    }

    await db.collection("assignments").doc(assignments.docs[0].id).delete()

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req: any, res: any, next: any) => {
  const { taskId } = req.params
  const userId = req.user.id

  if (!taskId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    const card = await db.collection("cards").doc(taskData.cardId).get()
    const cardData = card.data()
    if (!cardData) {
      return res.status(404).json({ success: false, message: "Card not found" })
    }

    const board = await db.collection("boards").doc(cardData.boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }
    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const assignments = await db
      .collection("assignments")
      .where("taskId", "==", taskId)
      .get()
    if (!assignments.empty) {
      assignments.forEach((assignment) => {
        db.collection("assignments").doc(assignment.id).delete()
      })
    }
    const attachments = await db
      .collection("attachments")
      .where("taskId", "==", taskId)
      .get()
    if (!attachments.empty) {
      attachments.forEach((attachment) => {
        db.collection("attachments").doc(attachment.id).delete()
      })
    }

    await db.collection("tasks").doc(taskId).delete()

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}

export const addAttachment = async (req: any, res: any, next: any) => {
  const { taskId } = req.params
  const { type, number, repoId, repoUrl } = req.body
  const userId = req.user.id

  if (!taskId || !type || !number || !repoId || !repoUrl) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  if (type !== "pull_request" && type !== "commit" && type !== "issue") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid attachment type" })
  }

  try {
    const task = await db.collection("tasks").doc(taskId).get()
    const taskData = task.data()
    if (!taskData) {
      return res.status(404).json({ success: false, message: "Task not found" })
    }

    const attachmentId = uuidV4()
    await db.collection("attachments").doc(attachmentId).set({
      id: attachmentId,
      taskId,
      type,
      number,
      repoId,
      repoUrl,
    })

    return res.status(201).json({
      id: attachmentId,
      taskId,
      type,
      number,
      repoId,
      repoUrl,
    })
  } catch (error) {
    next(error)
  }
}

export const removeAttachment = async (req: any, res: any, next: any) => {
  const { attachmentId } = req.params
  const userId = req.user.id

  if (!attachmentId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const attachment = await db
      .collection("attachments")
      .doc(attachmentId)
      .get()
    const attachmentData = attachment.data()
    if (!attachmentData) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" })
    }

    await db.collection("attachments").doc(attachmentId).delete()

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}
