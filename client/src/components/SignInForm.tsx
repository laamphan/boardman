import { FirebaseAuthError } from "firebase-admin/auth"
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

import { app } from "@/firebase"
import { RootState } from "@/redux/store"
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "@/redux/user/userSlice"

export default function SignInForm() {
  const { error } = useSelector((state: RootState) => state.user)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(signInSuccess(null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [email, setEmail] = useState("")

  const handleGoogleSignIn = async () => {
    dispatch(signInStart({}))
    try {
      const provider = new GoogleAuthProvider()
      const auth = getAuth(app)

      const result = await signInWithPopup(auth, provider)

      const res = await fetch("/api/auth/signin", {
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
        dispatch(signInFailure(data.message))
        return
      }

      dispatch(signInSuccess(data))
      navigate("/verify")
    } catch (error) {
      dispatch(signInFailure("Error signing in with Google"))
      console.log("Error signing in with Google: ", error)
    }
  }

  const handleGitHubSignIn = async () => {
    dispatch(signInStart({}))
    try {
      const provider = new GithubAuthProvider()
      const auth = getAuth(app)

      const result = await signInWithPopup(auth, provider)
      const credential = GithubAuthProvider.credentialFromResult(result)
      if (!credential) {
        dispatch(signInFailure("Error signing in with GitHub"))
        return
      }
      const token = credential.accessToken

      const res = await fetch("/api/auth/signin", {
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
        dispatch(signInFailure(data.message))
        return
      }

      dispatch(signInSuccess(data))
      navigate("/verify")
    } catch (error) {
      if (
        (error as FirebaseAuthError).code ===
        "auth/account-exists-with-different-credential"
      ) {
        dispatch(signInFailure("Email already associated with another account"))
      } else {
        dispatch(signInFailure("Error signing in with GitHub"))
      }
      console.log("Error signing in with GitHub: ", error)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    dispatch(signInStart({}))

    try {
      const res = await fetch("/api/auth/signin", {
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
        dispatch(signInFailure(data.message))
        return
      }

      dispatch(signInSuccess(data))
      navigate("/verify")
    } catch (error) {
      dispatch(signInFailure("Error signing in with email"))
      console.log("Error signing in with email: ", error)
    }
  }

  return (
    <Card className="text-center p-3">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col mt-2 gap-y-4">
        <div className="flex flex-col gap-y-3">
          <Button onClick={handleGoogleSignIn} type="button">
            Sign In with Google
          </Button>
          <Button onClick={handleGitHubSignIn} type="button">
            Sign In with GitHub
          </Button>
        </div>
        <p>or</p>
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-y-2">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" type="submit">
            Sign In with Email
          </Button>
        </form>
        <p>
          You just arrived?{" "}
          <Link
            className="
          text-blue-600
          "
            to={"/signup"}
          >
            Sign up
          </Link>{" "}
          instead!
        </p>
        {error && <p className="text-red-500 mb-0">{error}</p>}
      </CardContent>
    </Card>
  )
}
