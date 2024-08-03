import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { redirect, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

import { RootState } from "@/redux/store"
import {
  verifyFailure,
  verifyStart,
  verifySuccess,
} from "@/redux/user/userSlice"

export const VerifyForm = () => {
  const { error } = useSelector((state: RootState) => state.user)

  const { currentUser } = useSelector((state: RootState) => state.user)
  const [code, setCode] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!currentUser) {
    redirect("/signin")
    return
  }

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    dispatch(verifyStart({}))

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser.email,
          code,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        dispatch(verifyFailure(data.message))
        return
      }

      dispatch(verifySuccess(data))
      navigate("/")
    } catch (error) {
      dispatch(verifyFailure("Error verifying code"))
      console.log("Error verifying code: ", error)
    }
  }

  return (
    <Card className="text-center p-3">
      <CardHeader className="gap-y-5">
        <CardTitle>Enter your verification code</CardTitle>
        <CardDescription>
          A verification code has been sent to your email address. Please enter
          the code below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-y-3">
          <Input
            type="text"
            required
            placeholder="Verification Code"
            className="text-center"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Verify
          </Button>
        </form>

        {error && <p className="text-red-500 mt-5">{error}</p>}
      </CardContent>
    </Card>
  )
}
