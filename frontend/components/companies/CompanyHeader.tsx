type CompanyHeaderProps = {
    name: string;
    ico: string;
    sector?: {
        code: string;
        name: string;
    } | null;
    legalForm?: {
        code: number;
        name: string | null;
        short_name: string | null;
    } | null;
};

export default function CompanyHeader({
                                          name,
                                          ico,
                                          sector,
                                          legalForm,
                                      }: CompanyHeaderProps) {
    return (
        <section className="company-profile-header">
            <div className="company-profile-heading">
                <div className="panel-eyebrow">
                    COMPANY PROFILE
                </div>
                <h2>{name}</h2>

                <div className="company-profile-meta">
                    <span>IČO {ico}</span>

                    {sector && (
                        <span>
              {sector.code} · {sector.name}
            </span>
                    )}

                    {legalForm && (
                        <span>
              {legalForm.short_name ||
                  legalForm.name ||
                  `Form ${legalForm.code}`}
            </span>
                    )}
                </div>
            </div>

            <div className="company-profile-actions">
                <button
                    type="button"
                    className="company-action-button"
                >
                    Registry
                </button>

                <button
                    type="button"
                    className="company-action-button"
                >
                    Documents
                </button>
            </div>
        </section>
    );
}