import { CSSProperties } from "react"
import { useDragLayer } from "react-dnd"

export function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset(),
  }))

  if (!isDragging) return null

  const style: CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    left: currentOffset!.x,
    top: currentOffset!.y,
    transform: "translate(-50%, -50%)",
    border: "2px solid",
    borderRadius: "8px",
    width: "13.5rem",
    height: "2.5rem",
    zIndex: 1000,
  }

  return <div style={style}>{item.name}</div>
}
