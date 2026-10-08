
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
    { label: "Overview", href: "/" },
    { label: "Companies", href: "/companies" },
    { label: "Analytics", href: "/analytics" },
];

const dataNavigation = [
    { label: "Registry", href: "/companies" },
    { label: "Financials", href: "/financials" },
    { label: "Documents", href: "/companies" },
];

export default function Tabs() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }

        return (
            pathname === href ||
            pathname.startsWith(`${href}/`)
        );
    };

    return (
        <>
            <button
                type="button"
                className="mobile-menu-button"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
                aria-expanded={open}
            >
                <span />
                <span />
                <span />
            </button>

            {open && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setOpen(false)}
                >
                    <aside
                        className="mobile-menu"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="mobile-menu-header">
                            <div className="mobile-menu-brand">
                                <div className="logo-mark">
                                    F
                                </div>

                                <div>
                                    <div className="logo-title">
                                        FinScope
                                    </div>

                                    <div className="logo-subtitle">
                                        Company Intelligence
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mobile-menu-close"
                                onClick={() => setOpen(false)}
                                aria-label="Close navigation"
                            >
                                ×
                            </button>
                        </div>

                        <nav className="mobile-menu-nav">
                            <div className="nav-section-title">
                                Workspace
                            </div>

                            {navigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`mobile-nav-item ${
                                        isActive(item.href)
                                            ? "active"
                                            : ""
                                    }`}
                                    aria-current={
                                        isActive(item.href)
                                            ? "page"
                                            : undefined
                                    }
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="nav-section-title">
                                Data
                            </div>

                            {dataNavigation.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`mobile-nav-item ${
                                        isActive(item.href)
                                            ? "active"
                                            : ""
                                    }`}
                                    aria-current={
                                        isActive(item.href)
                                            ? "page"
                                            : undefined
                                    }
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mobile-menu-bottom">
                            <div className="data-status">
                                <div className="status-dot" />

                                <div>
                                    <div className="status-title">
                                        Data connected
                                    </div>

                                    <div className="status-text">
                                        Supabase PostgreSQL
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
