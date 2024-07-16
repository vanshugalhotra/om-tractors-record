import { Inter } from "next/font/google";
import { SidebarProvider } from "@/context/SidebarContext";
import Layout from "@/components/Layout/Layout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Om Tractors",
  description: "Om Tractors Record",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <Layout>
            {children}
            <section className="my-[20vh]"></section>
          </Layout>
        </SidebarProvider>
      </body>
    </html>
  );
}
