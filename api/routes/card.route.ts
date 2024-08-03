import express from "express"

import {
  createCard,
  deleteCard,
  getCards,
  updateCard,
} from "../controllers/card.controller"
import { verifyToken } from "../utils/verifyUser"

const router = express.Router()

router.get("/:boardId/cards", verifyToken, getCards)
router.post("/:boardId/cards", verifyToken, createCard)
router.put("/:boardId/cards/:cardId", verifyToken, updateCard)
router.delete("/:boardId/cards/:cardId", verifyToken, deleteCard)

export default router
