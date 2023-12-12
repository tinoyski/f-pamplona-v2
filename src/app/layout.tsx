import "./globals.css";
import "react-toastify/ReactToastify.css";
import { Poppins } from "next/font/google";
import { Provider } from "./providers";
import { ToastContainer } from "react-toastify";
import NavbarComponent from "@/components/Navbar";
import FooterComponent from "@/components/FooterComponent";
import { Metadata, Viewport } from "next";

const fontStyle = Poppins({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F. Pamplona's Refrigeration and Air Conditioning Services",
};

export const viewport: Viewport = {
  height: "device-height",
  width: "device-width",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={fontStyle.className}>
        <ToastContainer
          bodyClassName="dark:bg-gray-700 dark:text-white"
          toastClassName="dark:bg-gray-700 dark:text-white"
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
        />
        <Provider attribute="class">
          <div className="flex flex-col min-h-screen">
            <NavbarComponent />
            <div className="flex-1">{children}</div>
            <FooterComponent />
          </div>
        </Provider>
      </body>
    </html>
  );
}
