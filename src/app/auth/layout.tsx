import { ReactNode } from "react"

export default function AuthLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center dark:bg-black/50 bg-muted relative overflow-hidden">
            <div className="absolute w-full h-full overflow-visible z-0 top-0 left-0 origin-center animate-bg-effect">
                <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full" />
                <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full" />
            </div>
            {children}
        </main>
    )
}