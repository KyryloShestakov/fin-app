import Link from "next/link";
import type { Company } from "@/types/company";

type CompaniesTableProps = {
    companies: Company[];
    loading?: boolean;
};

export default function CompaniesTable({
                                           companies,
                                           loading = false,
                                       }: CompaniesTableProps) {
    return (
        <div className="companies-table-wrapper">
            <table className="companies-table">
                <thead>
                <tr>
                    <th>Company</th>
                    <th>IČO</th>
                    <th>Sector</th>
                    <th>Legal form</th>
                    <th></th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index}>
                            <td colSpan={5}>
                                <div className="table-loading-row">
                                    Loading company data...
                                </div>
                            </td>
                        </tr>
                    ))
                ) : companies.length === 0 ? (
                    <tr>
                        <td colSpan={5}>
                            <div className="table-empty">
                                No companies found.
                            </div>
                        </td>
                    </tr>
                ) : (
                    companies.map((company) => (
                        <tr key={company.id}>
                            <td>
                                <Link
                                    href={`/companies/${company.ico}`}
                                    className="company-name-link"
                                >
                                    {company.name}
                                </Link>
                            </td>

                            <td>
                  <span className="company-ico">
                    {company.ico}
                  </span>
                            </td>

                            <td>
                                {company.sector ? (
                                    <div className="sector-cell">
                      <span className="sector-code">
                        {company.sector.code}
                      </span>

                                        <span className="sector-name">
                        {company.sector.name}
                      </span>
                                    </div>
                                ) : (
                                    <span className="muted-value">—</span>
                                )}
                            </td>

                            <td>
                                {company.legal_form ? (
                                    <span className="legal-form">
                      {company.legal_form.short_name ||
                          company.legal_form.code}
                    </span>
                                ) : (
                                    <span className="muted-value">—</span>
                                )}
                            </td>

                            <td>
                                <Link
                                    href={`/companies/${company.ico}`}
                                    className="table-arrow"
                                >
                                    →
                                </Link>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}