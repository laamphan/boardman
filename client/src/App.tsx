import { BrowserRouter, Route, Routes } from "react-router-dom"

import Layout from "@/components/Layout"
import PrivateRoute from "@/components/PrivateRoute"

import BoardPage from "@/pages/BoardPage"
import Home from "@/pages/Home"
import InviteAccept from "@/pages/InviteAccept"
import InviteReject from "@/pages/InviteReject"
import SignIn from "@/pages/SignIn"
import SignUp from "@/pages/SignUp"
import Verify from "@/pages/Verify"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route element={<PrivateRoute />}>
          <Route path="/verify" element={<Verify />}></Route>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />}></Route>
            <Route path="/boards/:boardId" element={<BoardPage />}></Route>
          </Route>
          <Route
            path="/boards/:boardId/invite/accept/:invitationId"
            element={<InviteAccept />}
          ></Route>
          <Route
            path="/boards/:boardId/invite/reject/:invitationId"
            element={<InviteReject />}
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
