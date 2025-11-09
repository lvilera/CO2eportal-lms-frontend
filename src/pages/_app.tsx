import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <UIProvider>
        <Component {...pageProps} />
      </UIProvider>
    </AuthProvider>
  );
}
