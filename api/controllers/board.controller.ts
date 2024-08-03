import { v4 as uuidV4 } from "uuid"

import { transporter } from ".."
import { db } from "../db/firebaseConfig"

export const getBoardsByUserId = async (req: any, res: any, next: any) => {
  const userId = req.user.id
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
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
    const boardData = boards.map((board) => board.data())
    return res.status(200).json(boardData)
  } catch (error) {
    next(error)
  }
}

export const getBoard = async (req: any, res: any, next: any) => {
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
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized request" })
    }

    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
    return res.status(200).json(boardData)
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
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized request" })
  }

  try {
    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
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

  try {
    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

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

  try {
    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    if (userId !== boardData.ownerId) {
      return res.status(403).json({ success: false, message: "Forbidden" })
    }

    const senderQuery = await db
      .collection("users")
      .where("id", "==", userId)
      .get()
    if (senderQuery.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Sender not found" })
    }
    const senderData = senderQuery.docs[0].data()

    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get()
    if (userQuery.empty) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const userData = userQuery.docs[0].data()

    const membershipQuery = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", userData.id)
      .get()
    if (!membershipQuery.empty) {
      return res
        .status(400)
        .json({ success: false, message: "User is already a member" })
    }

    const previousInvitationQuery = await db
      .collection("invitations")
      .where("boardId", "==", boardId)
      .where("memberEmail", "==", email)
      .get()
    if (!previousInvitationQuery.empty) {
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

    // send email
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

  try {
    const invitationDoc = await db
      .collection("invitations")
      .doc(invitationId)
      .get()
    const invitationData = invitationDoc.data()
    if (!invitationData) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" })
    }

    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    const userDoc = await db.collection("users").where("id", "==", userId).get()
    const userData = userDoc.docs[0].data()
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (userData.email !== invitationData.memberEmail) {
      return res.status(403).json({ success: false, message: "Forbidden" })
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

  try {
    const invitationDoc = await db
      .collection("invitations")
      .doc(invitationId)
      .get()
    const invitationData = invitationDoc.data()
    if (!invitationData) {
      return res
        .status(404)
        .json({ success: false, message: "Invitation not found" })
    }

    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
    if (!boardData) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" })
    }

    const userDoc = await db.collection("users").where("id", "==", userId).get()
    const userData = userDoc.docs[0].data()
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (userData.email !== invitationData.memberEmail) {
      return res.status(403).json({ success: false, message: "Forbidden" })
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

  try {
    const boardDoc = await db.collection("boards").doc(boardId).get()
    const boardData = boardDoc.data()
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

    const membershipQuery = await db
      .collection("memberships")
      .where("boardId", "==", boardId)
      .where("memberId", "==", memberId)
      .get()
    if (membershipQuery.empty) {
      return res
        .status(404)
        .json({ success: false, message: "Membership not found" })
    }

    const cardsQuery = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get()
    if (!cardsQuery.empty) {
      const cardIds = cardsQuery.docs.map((doc) => doc.id)
      const tasksQuery = await db
        .collection("tasks")
        .where("cardId", "in", cardIds)
        .get()
      if (!tasksQuery.empty) {
        const taskIds = tasksQuery.docs.map((doc) => doc.id)
        const assignmentsQuery = await db
          .collection("assignments")
          .where("taskId", "in", taskIds)
          .where("memberId", "==", memberId)
          .get()
        if (!assignmentsQuery.empty) {
          assignmentsQuery.forEach((assignment) => {
            db.collection("assignments").doc(assignment.id).delete()
          })
        }
      }
    }

    membershipQuery.forEach((membership) => {
      db.collection("memberships").doc(membership.id).delete()
    })

    return res.status(204).json()
  } catch (error) {
    next(error)
  }
}
