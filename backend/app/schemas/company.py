from pydantic import BaseModel, ConfigDict


class SectorResponse(BaseModel):
    code: str
    name: str

    model_config = ConfigDict(from_attributes=True)


class LegalFormResponse(BaseModel):
    code: int
    name: str | None = None
    short_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AddressResponse(BaseModel):
    id: int
    type: str
    text: str | None = None
    psc: str | None = None
    municipality: str | None = None
    district_part: str | None = None
    street: str | None = None
    house_type: str | None = None
    house_number: str | None = None
    orientation_number: str | None = None
    okres_lau: str | None = None


class NaceResponse(BaseModel):
    code: str
    version: str
    name: str | None = None
    is_primary: bool


class CompanySizeResponse(BaseModel):
    fiscal_year: int
    code: str
    name: str


class CompanyListResponse(BaseModel):
    id: int
    ico: str
    name: str
    sector: SectorResponse | None = None
    legal_form: LegalFormResponse | None = None


class CompanyDetailResponse(BaseModel):
    id: int
    ico: str
    name: str

    ciss2010: int | None = None
    iczuj: int | None = None

    sector: SectorResponse | None = None
    legal_form: LegalFormResponse | None = None

    addresses: list[AddressResponse] = []
    nace: list[NaceResponse] = []
    size_classifications: list[CompanySizeResponse] = []