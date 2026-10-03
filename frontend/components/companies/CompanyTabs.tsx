"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    useEffect,
    useRef,
    useState,
} from "react";

type CompanyTabsProps = {
    ico: string;
};

const tabs = [
    { label: "Overview", suffix: "" },
    { label: "Financials", suffix: "/financials" },
    { label: "Analytics", suffix: "/analytics" },
    { label: "Registry", suffix: "/registry" },
    { label: "Documents", suffix: "/documents" },
];

export default function CompanyTabs({
                                        ico,
                                    }: CompanyTabsProps) {
    const pathname = usePathname();

    const tabsRef = useRef<HTMLDivElement>(null);

    const [canScrollRight, setCanScrollRight] =
        useState(false);

    const basePath = `/companies/${ico}`;

    const updateScrollState = () => {
        const element = tabsRef.current;

        if (!element) {
            return;
        }

        const hasOverflow =
            element.scrollWidth >
            element.clientWidth + 1;

        const hasMoreToScroll =
            element.scrollLeft <
            element.scrollWidth -
            element.clientWidth -
            1;

        setCanScrollRight(
            hasOverflow && hasMoreToScroll,
        );
    };

    useEffect(() => {
        const element = tabsRef.current;

        if (!element) {
            return;
        }

        const check = () => {
            updateScrollState();
        };

        check();

        const resizeObserver =
            new ResizeObserver(check);

        resizeObserver.observe(element);

        window.addEventListener(
            "resize",
            check,
        );

        element.addEventListener(
            "scroll",
            check,
            { passive: true },
        );

        const timeout = window.setTimeout(
            check,
            100,
        );

        return () => {
            resizeObserver.disconnect();

            window.removeEventListener(
                "resize",
                check,
            );

            element.removeEventListener(
                "scroll",
                check,
            );

            window.clearTimeout(timeout);
        };
    }, []);

    const scrollRight = () => {
        const element = tabsRef.current;

        if (!element) {
            return;
        }

        element.scrollBy({
            left: 160,
            behavior: "smooth",
        });
    };

    return (
        <div className="company-tabs-container">
            <div
                ref={tabsRef}
                className="company-tabs"
            >
                <nav
                    className="company-tabs-nav"
                    aria-label="Company navigation"
                >
                    {tabs.map((tab) => {
                        const href =
                            `${basePath}${tab.suffix}`;

                        const active =
                            tab.suffix === ""
                                ? pathname === basePath
                                : pathname.startsWith(href);

                        return (
                            <Link
                                key={tab.label}
                                href={href}
                                className={`company-tab ${
                                    active ? "active" : ""
                                }`}
                                aria-current={
                                    active
                                        ? "page"
                                        : undefined
                                }
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {canScrollRight && (
                <button
                    type="button"
                    className="company-tabs-scroll-button"
                    onClick={scrollRight}
                    aria-label="Show more company sections"
                >
                    →
                </button>
            )}
        </div>
    );
}