import express from "express"

import { signIn, signOut, signUp, verify } from "../controllers/auth.controller"
import { verifyToken } from "../utils/verifyUser"

const router = express.Router()

router.post("/signup", signUp)
router.post("/signin", signIn)
router.post("/verify", verifyToken, verify)
router.get("/signout", signOut)

export default router
