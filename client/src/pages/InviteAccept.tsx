import { useNavigate, useParams } from "react-router-dom"

const InviteAccept = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { boardId, invitationId } = params

  const acceptInvite = async () => {
    try {
      await fetch(`/api/boards/${boardId}/invite/accept/${invitationId}`, {
        method: "DELETE",
      })

      navigate(`/boards/${boardId}`)
    } catch (error) {
      console.error("Error accepting invitation: ", error)
    }
  }

  acceptInvite()

  return null
}

export default InviteAccept
