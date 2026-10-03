export default function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <div className="header-breadcrumb">
                    Financial Intelligence
                </div>

                <h1 className="header-title">
                    Czech Companies
                </h1>
            </div>

            <div className="header-actions">
                <button
                    type="button"
                    className="header-search"
                >
          <span className="header-search-label">
            Search companies
          </span>


                    <span className="header-search-shortcut">
            ⌘ K
          </span>
                </button>

                <button
                    type="button"
                    className="profile-button"
                    aria-label="Open profile"
                >
                    KS
                </button>
            </div>
        </header>
    );
}