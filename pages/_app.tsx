import "../styles/globals.css"
import type { AppProps } from "next/app"
import { ThemeConfigProvider } from "@/contexts/theme-config-context"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthProvider } from "@/contexts/auth-context" // Import AuthProvider

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {/* Wrap with AuthProvider */}
      <ThemeConfigProvider>
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeConfigProvider>
    </AuthProvider>
  )
}
