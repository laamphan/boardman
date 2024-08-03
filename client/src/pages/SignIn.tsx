import { useSelector } from "react-redux"
import { redirect } from "react-router-dom"

import SignInForm from "@/components/SignInForm"

import { RootState } from "@/redux/store"

export default function SignIn() {
  const { currentUser } = useSelector((state: RootState) => state.user)
  if (!currentUser) {
    redirect("/")
  }

  return (
    <div className="container mx-auto max-w-lg mt-10 sm:mt-40">
      <SignInForm />
    </div>
  )
}
