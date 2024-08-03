import express from "express"

import { getRepoInfo } from "../controllers/repo.controller"
import { verifyToken } from "../utils/verifyUser"

const router = express.Router()

router.post("/github-info", verifyToken, getRepoInfo)

export default router
