import crypto from "crypto"
import jwt from "jsonwebtoken"
import { v4 as uuidV4 } from "uuid"

import { db } from "../db/firebaseConfig"
import { transporter } from "../index"

/**
 * sign up with multiple providers
 * create a temporary user with user data & code
 * then send verification code to email
 */
export const signUp = async (req: any, res: any, next: any) => {
  const { name, email, avatar, ghToken } = req.body
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    })
  }

  try {
    const dbUser = await db.collection("users").doc(email).get()
    if (dbUser.exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" })
    }

    const code = crypto.randomBytes(16).toString("hex")
    const expiration = Date.now() + 1000 * 60 * 15
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

    /**
     * sign github token - ghToken : preserve it while waiting for verification code
     * sign email : prevent email spoofing
     * jwt token will be replaced after verification
     */
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
    }

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
  } catch (error) {
    next(error)
  }
}

/**
 * sign in with multiple providers & send verification code to email
 */
export const signIn = async (req: any, res: any, next: any) => {
  const { email, ghToken } = req.body
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" })
  }

  try {
    const user = await db.collection("users").doc(email).get()
    if (!user.exists) {
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
        .json(user.data())
    }

    const token = jwt.sign(
      {
        email,
      },
      process.env.JWT_SECRET!
    )
    return res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(user.data())
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
    return res.status(400).json({
      success: false,
      message: "Invalid request - different email from token",
    })
  }

  try {
    const code = await db.collection("codes").doc(email).get()
    if (!code.exists) {
      return res.status(404).json({ success: false, message: "Invalid email" })
    }

    const data = code.data()
    if (data?.code !== body.code) {
      return res.status(400).json({ success: false, message: "Invalid code" })
    }
    if (data?.expiration < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Code expired. Please sign in again" })
    }

    const user = await db.collection("users").doc(email).get()
    const tempUser = await db.collection("codes").doc(email).get()

    if (!user.exists && !tempUser.exists) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    if (user.exists) {
      const token = ghToken
        ? jwt.sign(
            {
              id: user.data()!.id,
              ghToken,
            },
            process.env.JWT_SECRET!
          )
        : jwt.sign(
            {
              id: user.data()!.id,
            },
            process.env.JWT_SECRET!
          )

      await db.collection("codes").doc(email).delete()
      return res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(user.data())
    }

    if (tempUser.exists) {
      const userData = tempUser.data()
      if (!userData || !("avatar" in userData) || !("name" in userData)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid user data" })
      }

      const { name, avatar } = userData
      const id = uuidV4()

      // create new user from temp user's data
      await db.collection("users").doc(email).set({
        id,
        name,
        email,
        avatar,
      })

      // sign github token if exists
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
    }
  } catch (error) {
    next(error)
  }
}
