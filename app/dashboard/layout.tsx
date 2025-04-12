import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardShell>
            <DashboardHeader heading="Dashboard" text="Manage your connections and view recent activity.">
                <Link href="/connect">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Connection
                    </Button>
                </Link>
            </DashboardHeader>
            {children}
        </DashboardShell>
    )
}