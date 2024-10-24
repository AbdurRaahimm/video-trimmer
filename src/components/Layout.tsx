import { Toaster } from "@/components/ui/toaster";


interface LayoutProps {     
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
        <main>{children} </main>
        <Toaster />
    </>
  )
}
