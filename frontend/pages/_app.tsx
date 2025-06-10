import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Outfit } from "next/font/google";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/auth.context";
import { QueryClient, QueryClientProvider } from "react-query";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Router from "next/router";

NProgress.configure({ showSpinner: false });

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID}
      >
        <Toaster
          toastOptions={{
            classNames: {
              error: "!bg-red-50 !text-red-400 border-red-500",
              info: "bg-blue-400",
              success: "!bg-green-50 !text-green-400 !border-green-500",
              warning: "bg-orange-400 border-green-500",
              toast: "bg-blue-400",
              title: `text-sm font-sans ${outfit.className}`,
              actionButton: "bg-zinc-400",
              cancelButton: "bg-orange-400",
              closeButton: "bg-lime-400",
            },
          }}
        />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Head>
              <title>MinCykel - Redefining Cycling.</title>
              <meta
                name="description"
                content="MinCykel is a private leasing and rental platform, offering bike registration for added safety. We promote sustainable transportation and make cycling accessible to all."
              />
            </Head>
            <div className={`${outfit.className} ${outfit.variable}`}>
              <Navigation />
              <div className="mt-12">
                <Component {...pageProps} />
              </div>
              <Footer />
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </>
  );
}
