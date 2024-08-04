import { DndProvider } from "react-dnd"
import { TouchBackend } from "react-dnd-touch-backend"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import App from "@/App"
import { ThemeProvider } from "@/components/ThemeProvider"
import { persistor, store } from "@/redux/store"

import "@/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </PersistGate>
    </DndProvider>
  </Provider>
)
