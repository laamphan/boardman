import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import nodemailer from "nodemailer"
import path from "path"

import authRouter from "./routes/auth.route"
import boardRouter from "./routes/board.route"
import cardRouter from "./routes/card.route"
import repoRouter from "./routes/repo.route"
import taskRouter from "./routes/task.route"

dotenv.config()

const resolvedPath = path.resolve(__dirname)

const app = express()
app.use(express.json())
app.use(cors({ origin: true }))
app.use(cookieParser())

app.listen(3000, () => {
  console.log("Server is running on port 3000!!!")
})

app.use("/api/auth", authRouter)
app.use("/api/boards", boardRouter)
app.use("/api/boards", cardRouter)
app.use("/api/boards", taskRouter)
app.use("/api/repositories", repoRouter)

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
})

app.use(express.static(path.join(resolvedPath, "/client/dist")))

app.get("*", (req, res) => {
  res.sendFile(path.join(resolvedPath, "client", "dist", "index.html"))
})

export interface HttpError {
  statusCode?: number
  message?: string
}

app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    })
  }
)
