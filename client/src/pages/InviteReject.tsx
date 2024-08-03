import { useNavigate, useParams } from "react-router-dom"

const InviteReject = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { boardId, invitationId } = params

  const rejectInvite = async () => {
    try {
      const res = await fetch(
        `/api/boards/${boardId}/invite/reject/${invitationId}`,
        {
          method: "DELETE",
        }
      )
      if (res.ok) {
        navigate("/")
      }
    } catch (error) {
      console.error("Error rejecting invitation: ", error)
    }
  }

  rejectInvite()

  return null
}

export default InviteReject
