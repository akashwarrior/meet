import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell>
            <DashboardHeader heading="Connect" text="Start a new screen sharing session or join an existing one." />
            {children}
        </DashboardShell>
    )
}