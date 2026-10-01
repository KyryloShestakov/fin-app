import csv
import sys
from pathlib import Path
from datetime import datetime
from decimal import Decimal, InvalidOperation

from sqlalchemy import text

# ============================================================
# PATHS
# ============================================================

FINANCIAL_CSV = Path(
    "/Users/kyrylo_shestakov/PycharmProjects/financial_tool/"
    "data/analysis/financial_data_2023_2024.csv"
)

RES_DATA_CSV = Path(
    "/Users/kyrylo_shestakov/PycharmProjects/financial_tool/"
    "data/input/res_data.csv"
)

# ============================================================
# BACKEND
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[3]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import engine


# ============================================================
# CONFIG
# ============================================================

BATCH_SIZE = 500

FINANCIAL_YEARS = (2023, 2024)

FINANCIAL_DELIMITER = ";"
RES_DELIMITER = ","


# ============================================================
# FINANCIAL CSV -> DATABASE METRICS
# ============================================================

FINANCIAL_FIELDS = {
    "assets":
        "Aktiva",

    "fixed_assets":
        "Stálá aktiva",

    "current_assets":
        "Oběžná aktiva",

    "inventory":
        "Zásoby",

    "receivables":
        "Pohledávky",

    "cash":
        "Peněžní prostředky",

    "liabilities":
        "Závazky",

    "current_liabilities":
        "Krátkodobé závazky",

    "bank_liabilities":
        "Závazky k úvěrovým institucím",

    "tax_liabilities":
        "Stát daňové závazky a dotace",

    "revenue_products_services":
        "Tržby za výrobky a služby",

    "revenue_goods":
        "Tržby za zboží",

    "operating_consumption":
        "Výkonová spotřeba",

    "inventory_change":
        "Změna stavu zásob vlastní činnosti",

    "activation":
        "Aktivace",

    "personnel_costs":
        "Osobní náklady",

    "operating_adjustments":
        "Úpravy hodnot v provozní oblasti",

    "depreciation_permanent":
        "Úpravy hodnot dlouhodobého nehmotného a hmotného majetku trvalé",

    "depreciation_temporary":
        "Úpravy hodnot dlouhodobého nehmotného a hmotného majetku dočasné",

    "other_operating_costs":
        "Ostatní provozní náklady",

    "net_profit":
        "Výsledek hospodaření po zdanění",

    "net_turnover":
        "Čistý obrat za účetní období",
}


# ============================================================
# HELPERS
# ============================================================

def normalize_ico(value):
    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    if value.isdigit():
        value = value.zfill(8)

    return value


def clean_string(value):
    if value is None:
        return None

    value = str(value).strip()

    if value == "":
        return None

    return value


def parse_decimal(value):
    value = clean_string(value)

    if value is None:
        return None

    if value in {"-", "—", "null", "NULL", "None"}:
        return None

    value = value.replace("\xa0", "")
    value = value.replace(" ", "")

    if "," in value and "." not in value:
        value = value.replace(",", ".")

    try:
        return Decimal(value)
    except InvalidOperation:
        return None


def parse_int(value):
    value = clean_string(value)

    if not value:
        return None

    try:
        return int(value)
    except ValueError:
        return None


def parse_date(value):
    value = clean_string(value)

    if not value:
        return None

    formats = [
        "%Y-%m-%d",
        "%d.%m.%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            pass

    return None


# ============================================================
# LOAD FINANCIAL CSV
# ============================================================

def load_financial_csv():

    print()
    print("=" * 70)
    print("READING FINANCIAL CSV")
    print("=" * 70)

    if not FINANCIAL_CSV.exists():
        raise FileNotFoundError(
            f"File not found:\n{FINANCIAL_CSV}"
        )

    rows = []

    with FINANCIAL_CSV.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(
            file,
            delimiter=FINANCIAL_DELIMITER
        )

        if not reader.fieldnames:
            raise RuntimeError(
                "Financial CSV has no header"
            )

        required = {
            "company_id",
            "sector",
            "size",
        }

        missing = required - set(reader.fieldnames)

        if missing:
            raise RuntimeError(
                f"Missing columns: {missing}"
            )

        for row in reader:

            ico = normalize_ico(
                row.get("company_id")
            )

            if not ico:
                continue

            row["_ico"] = ico

            rows.append(row)

    print(
        f"Financial companies loaded: {len(rows):,}"
    )

    return rows


# ============================================================
# LOAD LOOKUP TABLES
# ============================================================

def load_lookup_tables(connection):

    # --------------------------------------------------------
    # Sectors
    # --------------------------------------------------------

    sectors = {}

    result = connection.execute(
        text("""
            SELECT id, code
            FROM sectors
        """)
    ).mappings()

    for row in result:
        sectors[row["code"]] = row["id"]

    # --------------------------------------------------------
    # Sizes
    # --------------------------------------------------------

    sizes = {}

    result = connection.execute(
        text("""
            SELECT id, code
            FROM company_sizes
        """)
    ).mappings()

    for row in result:
        sizes[row["code"]] = row["id"]

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    metrics = {}

    result = connection.execute(
        text("""
            SELECT id, code
            FROM financial_metrics
        """)
    ).mappings()

    for row in result:
        metrics[row["code"]] = row["id"]

    # --------------------------------------------------------
    # Sources
    # --------------------------------------------------------

    sources = {}

    result = connection.execute(
        text("""
            SELECT id, name
            FROM data_sources
        """)
    ).mappings()

    for row in result:
        sources[row["name"]] = row["id"]

    return {
        "sectors": sectors,
        "sizes": sizes,
        "metrics": metrics,
        "sources": sources,
    }


# ============================================================
# IMPORT ONE FINANCIAL BATCH
# ============================================================

def import_financial_batch(
    rows,
    lookup
):

    with engine.begin() as connection:

        sectors = lookup["sectors"]
        sizes = lookup["sizes"]
        metrics = lookup["metrics"]
        sources = lookup["sources"]

        csv_source_id = sources.get("CSV import")

        # ====================================================
        # 1. COMPANIES
        # ====================================================

        company_params = []

        for row in rows:

            sector_code = clean_string(
                row.get("sector")
            )

            if sector_code:
                sector_code = sector_code.upper()

            sector_id = sectors.get(
                sector_code,
                sectors.get("OTHER")
            )

            company_params.append({
                "ico": row["_ico"],
                "name": row["_ico"],
                "sector_id": sector_id,
            })

        connection.execute(
            text("""
                INSERT INTO companies (
                    ico,
                    name,
                    sector_id
                )
                VALUES (
                    :ico,
                    :name,
                    :sector_id
                )
                ON CONFLICT (ico)
                DO UPDATE SET
                    sector_id = COALESCE(
                        EXCLUDED.sector_id,
                        companies.sector_id
                    ),
                    updated_at = NOW()
            """),
            company_params
        )

        # ====================================================
        # 2. GET COMPANY IDS
        # ====================================================

        ico_list = [
            row["_ico"]
            for row in rows
        ]

        company_result = connection.execute(
            text("""
                SELECT id, ico
                FROM companies
                WHERE ico = ANY(:icos)
            """),
            {
                "icos": ico_list
            }
        ).mappings()

        company_ids = {
            row["ico"]: row["id"]
            for row in company_result
        }

        # ====================================================
        # 3. FINANCIAL STATEMENTS
        # ====================================================

        statement_params = []

        for row in rows:

            company_id = company_ids[row["_ico"]]

            for year in FINANCIAL_YEARS:

                statement_params.append({
                    "company_id": company_id,
                    "year": year,
                    "source_id": csv_source_id,
                })

        connection.execute(
            text("""
                INSERT INTO financial_statements (
                    company_id,
                    fiscal_year,
                    statement_type,
                    currency,
                    source_id
                )
                VALUES (
                    :company_id,
                    :year,
                    'annual',
                    'CZK',
                    :source_id
                )
                ON CONFLICT (
                    company_id,
                    fiscal_year,
                    statement_type
                )
                DO UPDATE SET
                    source_id = EXCLUDED.source_id
            """),
            statement_params
        )

        # ====================================================
        # 4. GET STATEMENT IDS
        # ====================================================

        company_id_list = list(
            company_ids.values()
        )

        statement_result = connection.execute(
            text("""
                SELECT
                    id,
                    company_id,
                    fiscal_year
                FROM financial_statements
                WHERE company_id = ANY(:company_ids)
                  AND statement_type = 'annual'
                  AND fiscal_year IN (2023, 2024)
            """),
            {
                "company_ids": company_id_list
            }
        ).mappings()

        statement_ids = {}

        for row in statement_result:

            statement_ids[
                (
                    row["company_id"],
                    row["fiscal_year"]
                )
            ] = row["id"]

        # ====================================================
        # 5. FINANCIAL VALUES
        # ====================================================

        value_params = []

        for row in rows:

            company_id = company_ids[row["_ico"]]

            for year in FINANCIAL_YEARS:

                statement_id = statement_ids[
                    (
                        company_id,
                        year
                    )
                ]

                for metric_code, csv_prefix in FINANCIAL_FIELDS.items():

                    metric_id = metrics.get(metric_code)

                    if not metric_id:
                        continue

                    csv_column = (
                        f"{csv_prefix}_{year}"
                    )

                    value = parse_decimal(
                        row.get(csv_column)
                    )

                    value_params.append({
                        "statement_id": statement_id,
                        "metric_id": metric_id,
                        "value": value,
                        "source_id": csv_source_id,
                    })

        connection.execute(
            text("""
                INSERT INTO financial_values (
                    statement_id,
                    metric_id,
                    value,
                    source_id
                )
                VALUES (
                    :statement_id,
                    :metric_id,
                    :value,
                    :source_id
                )
                ON CONFLICT (
                    statement_id,
                    metric_id
                )
                DO UPDATE SET
                    value = EXCLUDED.value,
                    source_id = EXCLUDED.source_id
            """),
            value_params
        )

        # ====================================================
        # 6. COMPANY SIZE
        # ====================================================

        size_params = []

        for row in rows:

            size_code = clean_string(
                row.get("size")
            )

            if size_code:
                size_code = size_code.upper()

            size_id = sizes.get(size_code)

            if not size_id:
                continue

            size_params.append({
                "company_id": company_ids[row["_ico"]],
                "size_id": size_id,
            })

        if size_params:

            connection.execute(
                text("""
                    INSERT INTO company_size_classifications (
                        company_id,
                        fiscal_year,
                        size_id,
                        source_id
                    )
                    VALUES (
                        :company_id,
                        2024,
                        :size_id,
                        :source_id
                    )
                    ON CONFLICT (
                        company_id,
                        fiscal_year
                    )
                    DO UPDATE SET
                        size_id = EXCLUDED.size_id,
                        source_id = EXCLUDED.source_id
                """),
                [
                    {
                        **params,
                        "source_id": csv_source_id,
                    }
                    for params in size_params
                ]
            )


# ============================================================
# IMPORT ALL FINANCIAL DATA
# ============================================================

def import_financial_data(rows):

    print()
    print("=" * 70)
    print("IMPORTING FINANCIAL DATA")
    print("=" * 70)

    with engine.connect() as connection:
        lookup = load_lookup_tables(connection)

    total = len(rows)

    processed = 0

    for start in range(
        0,
        total,
        BATCH_SIZE
    ):

        batch = rows[
            start:start + BATCH_SIZE
        ]

        import_financial_batch(
            batch,
            lookup
        )

        processed += len(batch)

        percent = (
            processed / total * 100
            if total
            else 100
        )

        print(
            f"Financial: "
            f"{processed:,}/{total:,} "
            f"({percent:.1f}%) | "
            f"COMMIT"
        )

    print()
    print(
        f"Financial import complete: "
        f"{processed:,} companies"
    )


# ============================================================
# LOAD COMPANY IDS
# ============================================================

def load_company_ids():

    with engine.connect() as connection:

        result = connection.execute(
            text("""
                SELECT id, ico
                FROM companies
            """)
        ).mappings()

        return {
            row["ico"]: row["id"]
            for row in result
        }


# ============================================================
# PREPARE NACE CODES
# ============================================================

def prepare_nace_batch(
    connection,
    rows
):

    nace_params = {}

    for row in rows:

        nace = clean_string(
            row.get("NACE")
        )

        nace2025 = clean_string(
            row.get("NACE2025")
        )

        if nace:

            nace_params[
                (nace, "NACE")
            ] = {
                "code": nace,
                "version": "NACE",
            }

        if nace2025:

            nace_params[
                (nace2025, "NACE2025")
            ] = {
                "code": nace2025,
                "version": "NACE2025",
            }

    if nace_params:

        connection.execute(
            text("""
                INSERT INTO nace_codes (
                    code,
                    version
                )
                VALUES (
                    :code,
                    :version
                )
                ON CONFLICT (
                    code,
                    version
                )
                DO NOTHING
            """),
            list(nace_params.values())
        )

    return nace_params


# ============================================================
# IMPORT ONE REGISTRY BATCH
# ============================================================

def import_registry_batch(
    rows,
    company_ids
):

    if not rows:
        return 0

    with engine.begin() as connection:

        # ====================================================
        # NACE
        # ====================================================

        prepare_nace_batch(
            connection,
            rows
        )

        nace_result = connection.execute(
            text("""
                SELECT
                    id,
                    code,
                    version
                FROM nace_codes
            """)
        ).mappings()

        nace_ids = {
            (
                row["code"],
                row["version"]
            ): row["id"]
            for row in nace_result
        }

        # ====================================================
        # LEGAL FORMS
        # ====================================================

        forma_values = set()

        for row in rows:

            forma = clean_string(
                row.get("FORMA")
            )

            if forma:
                try:
                    forma_values.add(
                        int(forma)
                    )
                except ValueError:
                    pass

        if forma_values:

            connection.execute(
                text("""
                    INSERT INTO legal_forms (
                        code
                    )
                    VALUES (
                        :code
                    )
                    ON CONFLICT (code)
                    DO NOTHING
                """),
                [
                    {"code": code}
                    for code in forma_values
                ]
            )

        legal_result = connection.execute(
            text("""
                SELECT id, code
                FROM legal_forms
            """)
        ).mappings()

        legal_forms = {
            row["code"]: row["id"]
            for row in legal_result
        }

        # ====================================================
        # UPDATE COMPANIES
        # ====================================================

        company_updates = []

        for row in rows:

            ico = normalize_ico(
                row.get("ICO")
            )

            company_id = company_ids.get(ico)

            if not company_id:
                continue

            forma = clean_string(
                row.get("FORMA")
            )

            forma_code = None

            if forma:

                try:
                    forma_code = int(forma)
                except ValueError:
                    pass

            company_updates.append({
                "company_id": company_id,
                "name": clean_string(
                    row.get("FIRMA")
                ),
                "legal_form_id": legal_forms.get(
                    forma_code
                ),
                "ciss2010": parse_int(
                    row.get("CISS2010")
                ),
                "iczuj": parse_int(
                    row.get("ICZUJ")
                ),
            })

        if company_updates:

            connection.execute(
                text("""
                    UPDATE companies
                    SET
                        name = COALESCE(
                            :name,
                            name
                        ),

                        legal_form_id = COALESCE(
                            :legal_form_id,
                            legal_form_id
                        ),

                        ciss2010 = COALESCE(
                            :ciss2010,
                            ciss2010
                        ),

                        iczuj = COALESCE(
                            :iczuj,
                            iczuj
                        ),

                        updated_at = NOW()

                    WHERE id = :company_id
                """),
                company_updates
            )

        # ====================================================
        # ADDRESSES
        # ====================================================

        address_rows = []

        for row in rows:

            ico = normalize_ico(
                row.get("ICO")
            )

            company_id = company_ids.get(ico)

            if not company_id:
                continue

            address_rows.append({
                "company_id": company_id,

                "kodadm": clean_string(
                    row.get("KODADM")
                ),

                "text_address": clean_string(
                    row.get("TEXTADR")
                ),

                "psc": clean_string(
                    row.get("PSC")
                ),

                "municipality": clean_string(
                    row.get("OBEC_TEXT")
                ),

                "district_part": clean_string(
                    row.get("COBCE_TEXT")
                ),

                "street": clean_string(
                    row.get("ULICE_TEXT")
                ),

                "house_type": clean_string(
                    row.get("TYPCDOM")
                ),

                "house_number": clean_string(
                    row.get("CDOM")
                ),

                "orientation_number": clean_string(
                    row.get("COR")
                ),

                "okres_lau": clean_string(
                    row.get("OKRESLAU")
                ),
            })

        # ----------------------------------------------------
        # Update existing registered addresses
        # ----------------------------------------------------

        if address_rows:

            connection.execute(
                text("""
                    UPDATE company_addresses
                    SET
                        kodadm = :kodadm,
                        text_address = :text_address,
                        psc = :psc,
                        municipality = :municipality,
                        district_part = :district_part,
                        street = :street,
                        house_type = :house_type,
                        house_number = :house_number,
                        orientation_number =
                            :orientation_number,
                        okres_lau = :okres_lau

                    WHERE company_id = :company_id
                      AND address_type = 'registered'
                """),
                address_rows
            )

            # ------------------------------------------------
            # Insert only companies without address
            # ------------------------------------------------

            connection.execute(
                text("""
                    INSERT INTO company_addresses (
                        company_id,
                        address_type,
                        kodadm,
                        text_address,
                        psc,
                        municipality,
                        district_part,
                        street,
                        house_type,
                        house_number,
                        orientation_number,
                        okres_lau
                    )
                    SELECT
                        :company_id,
                        'registered',
                        :kodadm,
                        :text_address,
                        :psc,
                        :municipality,
                        :district_part,
                        :street,
                        :house_type,
                        :house_number,
                        :orientation_number,
                        :okres_lau
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM company_addresses
                        WHERE company_id = :company_id
                          AND address_type = 'registered'
                    )
                """),
                address_rows
            )

        # ====================================================
        # REGISTRY DATA
        # ====================================================

        source_id = connection.execute(
            text("""
                SELECT id
                FROM data_sources
                WHERE name = 'ARES'
                LIMIT 1
            """)
        ).scalar_one_or_none()

        registry_rows = []

        for row in rows:

            ico = normalize_ico(
                row.get("ICO")
            )

            company_id = company_ids.get(ico)

            if not company_id:
                continue

            registry_rows.append({
                "company_id": company_id,

                "ddatvzn": parse_date(
                    row.get("DDATVZN")
                ),

                "ddatzan": parse_date(
                    row.get("DDATZAN")
                ),

                "zpzan": parse_date(
                    row.get("ZPZAN")
                ),

                "ddatpakt": parse_date(
                    row.get("DDATPAKT")
                ),

                "datplat": parse_date(
                    row.get("DATPLAT")
                ),

                "priznak": clean_string(
                    row.get("PRIZNAK")
                ),

                "source_id": source_id,
            })

        if registry_rows:

            # Update latest existing registry record
            connection.execute(
                text("""
                    UPDATE company_registry_data
                    SET
                        ddatvzn = :ddatvzn,
                        ddatzan = :ddatzan,
                        zpzan = :zpzan,
                        ddatpakt = :ddatpakt,
                        datplat = :datplat,
                        priznak = :priznak,
                        source_id = :source_id
                    WHERE id IN (
                        SELECT id
                        FROM company_registry_data r2
                        WHERE r2.company_id =
                              company_registry_data.company_id
                        ORDER BY r2.id DESC
                        LIMIT 1
                    )
                """),
                registry_rows
            )

            # Insert records for companies without registry data
            connection.execute(
                text("""
                    INSERT INTO company_registry_data (
                        company_id,
                        ddatvzn,
                        ddatzan,
                        zpzan,
                        ddatpakt,
                        datplat,
                        priznak,
                        source_id
                    )
                    SELECT
                        :company_id,
                        :ddatvzn,
                        :ddatzan,
                        :zpzan,
                        :ddatpakt,
                        :datplat,
                        :priznak,
                        :source_id
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM company_registry_data
                        WHERE company_id = :company_id
                    )
                """),
                registry_rows
            )

        # ====================================================
        # COMPANY NACE
        # ====================================================

        nace_links = []

        for row in rows:

            ico = normalize_ico(
                row.get("ICO")
            )

            company_id = company_ids.get(ico)

            if not company_id:
                continue

            nace = clean_string(
                row.get("NACE")
            )

            nace2025 = clean_string(
                row.get("NACE2025")
            )

            if nace:

                nace_id = nace_ids.get(
                    (
                        nace,
                        "NACE"
                    )
                )

                if nace_id:

                    nace_links.append({
                        "company_id": company_id,
                        "nace_id": nace_id,
                        "is_primary": True,
                    })

            if nace2025:

                nace_id = nace_ids.get(
                    (
                        nace2025,
                        "NACE2025"
                    )
                )

                if nace_id:

                    nace_links.append({
                        "company_id": company_id,
                        "nace_id": nace_id,
                        "is_primary": False,
                    })

        if nace_links:

            connection.execute(
                text("""
                    INSERT INTO company_nace (
                        company_id,
                        nace_id,
                        is_primary
                    )
                    VALUES (
                        :company_id,
                        :nace_id,
                        :is_primary
                    )
                    ON CONFLICT (
                        company_id,
                        nace_id
                    )
                    DO UPDATE SET
                        is_primary =
                            EXCLUDED.is_primary
                """),
                nace_links
            )

    return len(rows)


# ============================================================
# IMPORT RES_DATA.CSV
# ============================================================

def import_registry_data():

    print()
    print("=" * 70)
    print("IMPORTING RES_DATA.CSV")
    print("=" * 70)

    if not RES_DATA_CSV.exists():
        raise FileNotFoundError(
            f"File not found:\n{RES_DATA_CSV}"
        )

    company_ids = load_company_ids()

    wanted_icos = set(
        company_ids.keys()
    )

    print(
        f"Companies to find: "
        f"{len(wanted_icos):,}"
    )

    processed = 0
    matched = 0
    imported = 0

    batch = []

    with RES_DATA_CSV.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(
            file,
            delimiter=RES_DELIMITER
        )

        if not reader.fieldnames:
            raise RuntimeError(
                "res_data.csv has no header"
            )

        for row in reader:

            processed += 1

            ico = normalize_ico(
                row.get("ICO")
            )

            if not ico:
                continue

            # ------------------------------------------------
            # CRITICAL FILTER
            # ------------------------------------------------

            if ico not in wanted_icos:
                continue

            matched += 1

            batch.append(row)

            # ------------------------------------------------
            # BULK COMMIT
            # ------------------------------------------------

            if len(batch) >= BATCH_SIZE:

                import_registry_batch(
                    batch,
                    company_ids
                )

                imported += len(batch)

                print(
                    f"RES: scanned "
                    f"{processed:,} rows | "
                    f"matched {matched:,} | "
                    f"imported {imported:,} | "
                    f"COMMIT"
                )

                batch.clear()

        # ----------------------------------------------------
        # LAST BATCH
        # ----------------------------------------------------

        if batch:

            import_registry_batch(
                batch,
                company_ids
            )

            imported += len(batch)

            print(
                f"RES: scanned "
                f"{processed:,} rows | "
                f"matched {matched:,} | "
                f"imported {imported:,} | "
                f"COMMIT"
            )

    print()
    print("=" * 70)
    print("RES IMPORT COMPLETE")
    print("=" * 70)

    print(
        f"Rows scanned:       {processed:,}"
    )

    print(
        f"Companies matched:  {matched:,}"
    )

    print(
        f"Companies imported: {imported:,}"
    )


# ============================================================
# FINAL STATISTICS
# ============================================================

def print_statistics():

    print()
    print("=" * 70)
    print("DATABASE STATISTICS")
    print("=" * 70)

    with engine.connect() as connection:

        queries = {
            "companies":
                "SELECT COUNT(*) FROM companies",

            "addresses":
                "SELECT COUNT(*) FROM company_addresses",

            "NACE codes":
                "SELECT COUNT(*) FROM nace_codes",

            "company NACE":
                "SELECT COUNT(*) FROM company_nace",

            "registry":
                "SELECT COUNT(*) FROM company_registry_data",

            "statements":
                "SELECT COUNT(*) FROM financial_statements",

            "financial values":
                "SELECT COUNT(*) FROM financial_values",

            "documents":
                "SELECT COUNT(*) FROM documents",
        }

        for name, query in queries.items():

            count = connection.execute(
                text(query)
            ).scalar_one()

            print(
                f"{name:<25} {count:,}"
            )

        print()
        print("Financial statements:")

        result = connection.execute(
            text("""
                SELECT
                    fiscal_year,
                    COUNT(*) AS count
                FROM financial_statements
                GROUP BY fiscal_year
                ORDER BY fiscal_year
            """)
        ).mappings()

        for row in result:

            print(
                f"  {row['fiscal_year']}: "
                f"{row['count']:,}"
            )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("FIN-APP DATABASE IMPORT")
    print("=" * 70)

    print()
    print("Financial CSV:")
    print(FINANCIAL_CSV)

    print()
    print("Registry CSV:")
    print(RES_DATA_CSV)

    # --------------------------------------------------------
    # 1. LOAD FINANCIAL CSV
    # --------------------------------------------------------

    financial_rows = load_financial_csv()

    # --------------------------------------------------------
    # 2. FINANCIAL IMPORT
    # --------------------------------------------------------

    import_financial_data(
        financial_rows
    )

    # --------------------------------------------------------
    # 3. RES / ARES IMPORT
    # --------------------------------------------------------

    import_registry_data()

    # --------------------------------------------------------
    # 4. FINAL STATS
    # --------------------------------------------------------

    print_statistics()

    print()
    print("=" * 70)
    print("ALL IMPORTS COMPLETED")
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()