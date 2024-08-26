import { FirebaseAuthError } from "firebase-admin/auth"
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

import { app } from "@/firebase"
import { RootState } from "@/redux/store"
import {
  signUpFailure,
  signUpStart,
  signUpSuccess,
} from "@/redux/user/userSlice"

export default function SignUpForm() {
  const { error } = useSelector((state: RootState) => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")

  const handleGoogleSignUp = async () => {
    dispatch(signUpStart({}))
    try {
      const provider = new GoogleAuthProvider()
      const auth = getAuth(app)

      const result = await signInWithPopup(auth, provider)

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        dispatch(signUpFailure(data.message))
        navigate("/signin")
        return
      }

      dispatch(signUpSuccess(data))
      navigate("/verify")
    } catch (error) {
      dispatch(signUpFailure("Error signing up with Google"))
      console.log("Error signing up with Google: ", error)
    }
  }

  const handleGitHubSignUp = async () => {
    dispatch(signUpStart({}))
    try {
      const provider = new GithubAuthProvider()
      const auth = getAuth(app)

      const result = await signInWithPopup(auth, provider)

      const credential = GithubAuthProvider.credentialFromResult(result)
      if (!credential) {
        dispatch(signUpFailure("Error signing up with GitHub"))
        return
      }
      const token = credential.accessToken

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: result.user.displayName || result.user.email,
          email: result.user.email,
          avatar: result.user.photoURL,
          ghToken: token,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        dispatch(signUpFailure(data.message))
        navigate("/signin")
        return
      }

      dispatch(signUpSuccess(data))
      navigate("/verify")
    } catch (error) {
      if (
        (error as FirebaseAuthError).code ===
        "auth/account-exists-with-different-credential"
      ) {
        dispatch(signUpFailure("Email already associated with another account"))
      } else {
        dispatch(signUpFailure("Error signing up with GitHub"))
      }
      console.log("Error signing up with GitHub: ", error)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    dispatch(signUpStart({}))

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await res.json()
      if (data.success === false) {
        dispatch(signUpFailure(data.message))
        return
      }

      dispatch(signUpSuccess(data))
      navigate("/verify")
    } catch (error) {
      dispatch(signUpFailure("Error signing up with email"))
      console.log("Error signing up with email: ", error)
    }
  }

  return (
    <Card className="text-center p-3">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col mt-2 gap-y-4">
        <div className="flex flex-col gap-y-3">
          <Button onClick={handleGoogleSignUp} type="button">
            Sign Up with Google
          </Button>
          <Button onClick={handleGitHubSignUp} type="button">
            Sign Up with GitHub
          </Button>
        </div>
        <p>or</p>
        <form onSubmit={handleEmailSignUp} className="flex flex-col gap-y-2">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Sign Up with Email
          </Button>
        </form>
        <p>
          Already have an account?{" "}
          <Link
            className="
        text-blue-600
        "
            to={"/signin"}
          >
            Sign in
          </Link>{" "}
          instead!
        </p>
        {error && <p className="text-red-500">{error}</p>}
      </CardContent>
    </Card>
  )
}
