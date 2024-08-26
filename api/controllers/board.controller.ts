import { v4 as uuidV4 } from "uuid"

import { transporter } from ".."
import { db } from "../db/firebaseConfig"

export const getBoardsByUserId = async (req: any, res: any, next: any) => {
  const userId = req.user.id
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const memberships = await db
      .collection("memberships")
      .where("memberId", "==", userId)
      .get()
    if (memberships.empty) {
      return res.status(200).json([])
    }

    const boardIds = memberships.docs.map((doc) => doc.data().boardId)
    const boards = await db.getAll(
      ...boardIds.map((id) => db.collection("boards").doc(id))
    )
    const boardsData = boards.map((board) => board.data())
    return res.status(200).json(boardsData)
  } catch (error) {
    next(error)
  }
}

export const getBoard = async (req: any, res: any, next: any) => {
  const { boardId } = req.params
  const userId = req.user.id

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }
  if (!boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }

  try {
    const membership = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", userId)
      .get()
    if (membership.empty) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const board = await db.collection("boards").doc(boardId).get()
    if (!board.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    return res.status(200).json(board.data())
  } catch (error) {
    next(error)
  }
}

export const createBoard = async (req: any, res: any, next: any) => {
  const { ownerId, title, description } = req.body
  const userId = req.user.id

  if (!title || !ownerId || !description) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (userId !== ownerId) {
    return res.status(403).json({ success: false, message: "Forbidden" })
  }

  try {
    // TODO transaction
    const boardId = uuidV4()
    await db.collection("boards").doc(boardId).set({
      id: boardId,
      ownerId,
      title,
      description,
    })

    const membershipId = uuidV4()
    await db.collection("memberships").doc(membershipId).set({
      id: membershipId,
      boardId,
      memberId: ownerId,
    })

    return res.status(201).json({
      id: boardId,
      ownerId,
      title,
      description,
    })
  } catch (error) {
    next(error)
  }
}

export const updateBoard = async (req: any, res: any, next: any) => {
  const { boardId } = req.params
  const { title, description } = req.body
  const userId = req.user.id

  if (!title || !description || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }
    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    await db.collection("boards").doc(boardId).update({
      title,
      description,
    })

    return res.status(200).json({
      id: boardId,
      ownerId: boardData.ownerId,
      title,
      description,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteBoard = async (req: any, res: any, next: any) => {
  const { boardId } = req.params
  const userId = req.user.id

  if (!boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }
    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    // TODO transaction
    const memberships = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .get()
    if (!memberships.empty) {
      memberships.forEach((membership) => {
        db.collection("memberships").doc(membership.id).delete()
      })
    }

    const invitations = await db
      .collection("invitations")
      .where("boardId", "==", boardId)
      .get()
    if (!invitations.empty) {
      invitations.forEach((invitation) => {
        db.collection("invitations").doc(invitation.id).delete()
      })
    }

    const cards = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get()
    if (!cards.empty) {
      const cardIds = cards.docs.map((doc) => doc.id)

      const tasks = await db
        .collection("tasks")
        .where("cardId", "in", cardIds)
        .get()
      if (!tasks.empty) {
        const taskIds = tasks.docs.map((doc) => doc.id)

        const assignments = await db
          .collection("assignments")
          .where("taskId", "in", taskIds)
          .get()
        if (!assignments.empty) {
          assignments.forEach((assignment) => {
            db.collection("assignments").doc(assignment.id).delete()
          })
        }

        const attachments = await db
          .collection("attachments")
          .where("taskId", "in", taskIds)
          .get()
        if (!attachments.empty) {
          attachments.forEach((attachment) => {
            db.collection("attachments").doc(attachment.id).delete()
          })
        }

        tasks.forEach((task) => {
          db.collection("tasks").doc(task.id).delete()
        })
      }

      cards.forEach((card) => {
        db.collection("cards").doc(card.id).delete()
      })
    }

    await db.collection("boards").doc(boardId).delete()
    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}

export const inviteUser = async (req: any, res: any, next: any) => {
  const { boardId } = req.params
  const { email } = req.body
  const userId = req.user.id

  if (!boardId || !email) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }
    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const sender = await db.collection("users").where("id", "==", userId).get()
    if (sender.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Sender not found" })
    }
    const senderData = sender.docs[0].data()

    const invitee = await db
      .collection("users")
      .where("email", "==", email)
      .get()
    if (invitee.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Invitee not found" })
    }

    const inviteeData = invitee.docs[0].data()

    const membership = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", inviteeData.id)
      .get()
    if (!membership.empty) {
      return res
        .status(400)
        .json({ success: false, message: "User is already a member" })
    }

    const previousInvitation = await db
      .collection("invitations")
      .where("boardId", "==", boardId)
      .where("memberEmail", "==", email)
      .get()
    if (!previousInvitation.empty) {
      return res
        .status(400)
        .json({ success: false, message: "User has already been invited" })
    }

    const invitationId = uuidV4()
    await db.collection("invitations").doc(invitationId).set({
      id: invitationId,
      boardOwnerId: userId,
      boardId: boardId,
      memberEmail: email,
    })

    // send invitation email
    const mailOptions = {
      from: process.env.NODEMAILER_SENDER,
      to: email,
      subject: "Board Invitation",
      text: `You have been invited to join ${boardData.title} on Boardman by ${senderData.email}.\n Use this link to accept the invitation. ${process.env.CLIENT_URL}/boards/${boardId}/invite/accept/${invitationId}\n Or use this link to reject the invitation. ${process.env.CLIENT_URL}/boards/${boardId}/invite/reject/${invitationId}`,
    }
    await transporter.sendMail(mailOptions)

    return res.status(201).json({ success: true, message: "Invite sent" })
  } catch (error) {
    next(error)
  }
}

export const inviteAccept = async (req: any, res: any, next: any) => {
  const { invitationId, boardId } = req.params
  const userId = req.user.id

  if (!invitationId || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const user = await db.collection("users").where("id", "==", userId).get()
    const userData = user.docs[0].data()
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const invitation = await db
      .collection("invitations")
      .doc(invitationId)
      .get()
    const invitationData = invitation.data()
    if (!invitationData) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" })
    }
    if (invitationData.memberEmail !== userData.email) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    const membershipId = uuidV4()
    await db.collection("memberships").doc(membershipId).set({
      id: membershipId,
      boardId: invitationData.boardId,
      memberId: userId,
    })

    await db.collection("invitations").doc(invitationId).delete()

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}

export const inviteReject = async (req: any, res: any, next: any) => {
  const { invitationId, boardId } = req.params
  const userId = req.user.id

  if (!invitationId || !boardId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const user = await db.collection("users").where("id", "==", userId).get()
    const userData = user.docs[0].data()
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const invitation = await db
      .collection("invitations")
      .doc(invitationId)
      .get()
    const invitationData = invitation.data()
    if (!invitationData) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" })
    }
    if (invitationData.memberEmail !== userData.email) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    await db.collection("invitations").doc(invitationId).delete()

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}

export const deleteMembership = async (req: any, res: any, next: any) => {
  const { boardId, memberId } = req.params
  const userId = req.user.id

  if (!boardId || !memberId) {
    return res.status(400).json({ success: false, message: "Invalid request" })
  }
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  try {
    const board = await db.collection("boards").doc(boardId).get()
    const boardData = board.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }
    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }
    if (userId === memberId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cannot remove yourself as owner",
      })
    }

    const membership = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", memberId)
      .get()
    if (membership.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Membership not found" })
    }

    const cards = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get()
    if (!cards.empty) {
      const cardIds = cards.docs.map((doc) => doc.id)
      const tasks = await db
        .collection("tasks")
        .where("cardId", "in", cardIds)
        .get()
      if (!tasks.empty) {
        const taskIds = tasks.docs.map((doc) => doc.id)
        const assignments = await db
          .collection("assignments")
          .where("taskId", "in", taskIds)
          .where("memberId", "==", memberId)
          .get()
        if (!assignments.empty) {
          assignments.forEach((assignment) => {
            db.collection("assignments").doc(assignment.id).delete()
          })
        }
      }
    }

    membership.forEach((membership) => {
      db.collection("memberships").doc(membership.id).delete()
    })

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}
