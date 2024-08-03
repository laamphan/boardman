import { v4 as uuidV4 } from "uuid"

import { Card } from "../../client/src/types/db"
import { db } from "../db/firebaseConfig"

export const getCards = async (req: any, res: any, next: any) => {
  const { boardId } = req.params
  const userId = req.user.id

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
  }

  if (!boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }

  try {
    const membershipQuery = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", userId)
      .get()
    if (membershipQuery.empty) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const cardsQuery = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get()
    const cards = cardsQuery.docs.map((doc) => doc.data()) as Card[]

    return res.status(200).json(cards)
  } catch (error) {
    next(error)
  }
}

export const createCard = async (req: any, res: any, next: any) => {
  const { boardId } = req.params

  const { title, description } = req.body
  const userId = req.user.id

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
  }

  if (!title || !description || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }

  const boardDoc = await db.collection("boards").doc(boardId).get()
  const boardData = boardDoc.data()
  if (!boardData) {
    return res.status(404).json({ success: false, message: "Board not found" })
  }

  try {
    const cardId = uuidV4()

    await db.collection("cards").doc(cardId).set({
      id: cardId,
      boardId,
      title,
      description,
    })

    const cardDoc = await db.collection("cards").doc(cardId).get()
    const cardData = cardDoc.data()

    res.status(201).json(cardData)
    return
  } catch (error) {
    next(error)
  }
}

export const updateCard = async (req: any, res: any, next: any) => {
  const { cardId } = req.params
  const { title, description } = req.body
  const userId = req.user.id

  if (!title || !description || !cardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
  }

  try {
    const cardDoc = await db.collection("cards").doc(cardId).get()
    const cardData = cardDoc.data()
    if (!cardData) {
      return res.status(404).json({ success: false, message: "Card not found" })
    }

    await db.collection("cards").doc(cardId).update({
      title,
      description,
    })

    return res.status(200).json({
      id: cardId,
      boardId: cardData.boardId,
      title,
      description,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteCard = async (req: any, res: any, next: any) => {
  const { cardId } = req.params
  const userId = req.user.id

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
  }

  if (!cardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }

  try {
    const cardDoc = await db.collection("cards").doc(cardId).get()
    const cardData = cardDoc.data()
    if (!cardData) {
      return res.status(404).json({ success: false, message: "Card not found" })
    }

    const tasks = await db
      .collection("tasks")
      .where("cardId", "==", cardId)
      .get()
    if (!tasks.empty) {
      const taskIds = tasks.docs.map((doc) => doc.id)

      const attachments = await db
        .collection("attachments")
        .where("taskId", "in", taskIds)
        .get()
      if (!attachments.empty) {
        attachments.forEach((attachment) => {
          db.collection("attachments").doc(attachment.id).delete()
        })
      }
      const assignments = await db
        .collection("assignments")
        .where("taskId", "in", taskIds)
        .get()
      if (!assignments.empty) {
        assignments.forEach((assignment) => {
          db.collection("assignments").doc(assignment.id).delete()
        })
      }

      tasks.forEach((task) => {
        db.collection("tasks").doc(task.id).delete()
      })
    }

    await db.collection("cards").doc(cardId).delete()

    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}
