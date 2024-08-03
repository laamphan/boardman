import express from "express"

import {
  addAttachment,
  assignTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  removeAttachment,
  unassignTask,
  updateTask,
  updateTaskCard,
} from "../controllers/task.controller"
import { verifyToken } from "../utils/verifyUser"

const router = express.Router()

router.get("/:boardId/cards/:cardId/tasks/:taskId", verifyToken, getTask)
router.get("/:boardId/cards/:cardId/tasks", verifyToken, getTasks)
router.post("/:boardId/cards/:cardId/tasks", verifyToken, createTask)
router.put("/:boardId/cards/:cardId/tasks/:taskId", verifyToken, updateTask)
router.put(
  "/:boardId/cards/:cardId/tasks/:taskId/newCard",
  verifyToken,
  updateTaskCard
)
router.delete("/:boardId/cards/:cardId/tasks/:taskId", verifyToken, deleteTask)

router.post(
  "/:boardId/cards/:cardId/tasks/:taskId/assign",
  verifyToken,
  assignTask
)
router.delete(
  "/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId",
  verifyToken,
  unassignTask
)

router.post(
  "/:boardId/cards/:cardId/tasks/:taskId/github-attach",
  verifyToken,
  addAttachment
)
router.delete(
  "/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId",
  verifyToken,
  removeAttachment
)

export default router
