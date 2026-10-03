import Link from "next/link";
import Tabs from "@/components/layout/tabs";

const navigation = [
    { label: "Overview", href: "/" },
    { label: "Companies", href: "/companies" },
    { label: "Analytics", href: "/analytics" },
];

const dataNavigation = [
    { label: "Registry", href: "/companies" },
    { label: "Financials", href: "/companies" },
    { label: "Documents", href: "/companies" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-brand">
                    <div className="logo-mark">F</div>

                    <div>
                        <div className="logo-title">FinScope</div>
                        <div className="logo-subtitle">
                            Company Intelligence
                        </div>
                    </div>
                </div>

                <Tabs />
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-title">Workspace</div>

                {navigation.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="nav-item"
                    >
                        <span>{item.label}</span>
                    </Link>
                ))}

                <div className="nav-section-title">Data</div>

                {dataNavigation.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="nav-item"
                    >
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <div className="data-status">
                    <div className="status-dot" />

                    <div>
                        <div className="status-title">Data connected</div>

                        <div className="status-text">
                            Supabase PostgreSQL
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}