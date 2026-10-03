"use client";

import Link from "next/link";
import { useState } from "react";

const navigation = [
    { label: "Overview", href: "/" },
    { label: "Companies", href: "/companies" },
    { label: "Analytics", href: "/analytics" },
];

export default function Tabs() {
    const [open, setOpen] = useState(false);

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
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mobile-menu-header">
                            <div className="mobile-menu-brand">
                                <div className="logo-mark">F</div>

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
                                    className="mobile-nav-item"
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