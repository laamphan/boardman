import crypto from "crypto"
import jwt from "jsonwebtoken"
import { v4 as uuidV4 } from "uuid"

import { db } from "../db/firebaseConfig"
import { transporter } from "../index"

export const signUp = async (req: any, res: any, next: any) => {
  try {
    const { name, email, avatar, ghToken } = req.body

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" })
    }

    const userRef = db.collection("users").doc(email)
    const userSnap = await userRef.get()

    if (userSnap.exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" })
    }

    const code = crypto.randomBytes(16).toString("hex")
    const expiration = Date.now() + 1000 * 60 * 15

    const tempUserRef = db.collection("codes").doc(email)
    const tempUserSnap = await tempUserRef.get()

    if (tempUserSnap.exists) {
      await db.collection("codes").doc(email).delete()
    }

    await db
      .collection("codes")
      .doc(email)
      .set({
        name: name || email,
        email,
        avatar: avatar || "",
        code,
        expiration,
      })

    const mailOptions = {
      from: "tlaamphan@gmail.com",
      to: email,
      subject: "One-time Sign-In Code",
      text: `Use this code to sign in: ${code}`,
    }
    await transporter.sendMail(mailOptions)

    // sign ghToken to preserve it while waiting for verification code
    // sign email mostly another layer of security
    if (ghToken) {
      const token = jwt.sign(
        {
          email,
          ghToken,
        },
        process.env.JWT_SECRET!
      )

      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({
          name: name || email,
          email,
          avatar: avatar || "",
        })
    } else {
      const token = jwt.sign(
        {
          email,
        },
        process.env.JWT_SECRET!
      )

      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({
          name: name || email,
          email,
          avatar: avatar || "",
        })
    }
  } catch (error) {
    next(error)
  }
}

export const signIn = async (req: any, res: any, next: any) => {
  try {
    const { email, ghToken } = req.body
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" })
    }

    const userRef = db.collection("users").doc(email)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      return res.status(400).json({ success: false, message: "User not found" })
    }

    const code = crypto.randomBytes(16).toString("hex")
    const expiration = Date.now() + 1000 * 60 * 15
    await db.collection("codes").doc(email).set({
      code,
      expiration,
    })

    const mailOptions = {
      from: process.env.NODEMAILER_SENDER,
      to: email,
      subject: "One-time Sign-In Code",
      text: `Use this code to sign in: ${code}`,
    }
    await transporter.sendMail(mailOptions)

    if (ghToken) {
      const token = jwt.sign(
        {
          email,
          ghToken,
        },
        process.env.JWT_SECRET!
      )
      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(userSnap.data())
    } else {
      const token = jwt.sign(
        {
          email,
        },
        process.env.JWT_SECRET!
      )
      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(userSnap.data())
    }
  } catch (error) {
    next(error)
  }
}

export const signOut = async (req: any, res: any, next: any) => {
  try {
    res.clearCookie("access_token")
    res.status(200).json("Signed out")
  } catch (err) {
    next(err)
  }
}

export const verify = async (req: any, res: any, next: any) => {
  const body = req.body
  const { email, ghToken } = req.user
  if (!body.email || !body.code) {
    return res
      .status(400)
      .json({ success: false, message: "Email and code are required" })
  }

  if (body.email !== email) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address" })
  }

  try {
    const doc = await db.collection("codes").doc(email).get()
    if (!doc.exists) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid request" })
    }

    const data = doc.data()
    if (data?.code !== body.code) {
      return res.status(400).json({ success: false, message: "Invalid code" })
    }

    if (data?.expiration < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Code expired. Please sign in again" })
    }

    const userRef = db.collection("users").doc(email)
    const userSnap = await userRef.get()

    const tempUserRef = db.collection("codes").doc(email)
    const tempUserSnap = await tempUserRef.get()

    if (!userSnap.exists && !tempUserSnap.exists) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (userSnap.exists) {
      const token = ghToken
        ? jwt.sign(
            {
              id: userSnap.data()!.id,
              ghToken,
            },
            process.env.JWT_SECRET!
          )
        : jwt.sign(
            {
              id: userSnap.data()!.id,
            },
            process.env.JWT_SECRET!
          )

      await db.collection("codes").doc(email).delete()
      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(userSnap.data())
    }

    if (tempUserSnap.exists) {
      const userData = tempUserSnap.data()
      if (userData && "avatar" in userData && "name" in userData) {
        const { name, avatar } = userData
        const id = uuidV4()
        await db.collection("users").doc(email).set({
          id,
          name,
          email,
          avatar,
        })

        const token = ghToken
          ? jwt.sign(
              {
                id,
                ghToken,
              },
              process.env.JWT_SECRET!
            )
          : jwt.sign(
              {
                id,
              },
              process.env.JWT_SECRET!
            )

        await db.collection("codes").doc(email).delete()

        return res
          .cookie("access_token", token, { httpOnly: true })
          .status(200)
          .json({
            id,
            name,
            email,
            avatar,
          })
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user data" })
      }
    }
  } catch (error) {
    next(error)
  }
}
