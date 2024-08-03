import express from "express"

import {
  createBoard,
  deleteBoard,
  deleteMembership,
  getBoard,
  getBoardsByUserId,
  inviteAccept,
  inviteReject,
  inviteUser,
  updateBoard,
} from "../controllers/board.controller"
import { verifyToken } from "../utils/verifyUser"

const router = express.Router()

router.post("/", verifyToken, createBoard)
router.get("/", verifyToken, getBoardsByUserId)
router.get("/:boardId", verifyToken, getBoard)
router.put("/:boardId", verifyToken, updateBoard)
router.delete("/:boardId", verifyToken, deleteBoard)

router.post("/:boardId/invite", verifyToken, inviteUser)
router.delete(
  "/:boardId/invite/accept/:invitationId",
  verifyToken,
  inviteAccept
)
router.delete(
  "/:boardId/invite/reject/:invitationId",
  verifyToken,
  inviteReject
)
router.delete("/:boardId/members/:memberId", verifyToken, deleteMembership)

export default router
