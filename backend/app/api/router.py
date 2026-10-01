from fastapi import APIRouter

from app.api.routes.companies import router as companies_router
from app.api.routes.sectors import router as sectors_router
from app.api.routes.legal_forms import router as legal_forms_router
from app.api.routes.company_sizes import router as company_sizes_router
from app.api.routes.nace import router as nace_router
from app.api.routes.financial_metrics import router as financial_metrics_router
from app.api.routes.financials import router as financials_router
from app.api.routes.documents import router as documents_router
from app.api.routes.registry import router as registry_router


api_router = APIRouter()

api_router.include_router(companies_router)
api_router.include_router(sectors_router)
api_router.include_router(legal_forms_router)
api_router.include_router(company_sizes_router)
api_router.include_router(nace_router)
api_router.include_router(financial_metrics_router)
api_router.include_router(financials_router)
api_router.include_router(documents_router)
api_router.include_router(registry_router)