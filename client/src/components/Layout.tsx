import { Outlet } from "react-router-dom"

import { UserNav } from "@/components/UserNav"

const Layout = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <UserNav />
      <Outlet />
    </div>
  )
}

export default Layout
