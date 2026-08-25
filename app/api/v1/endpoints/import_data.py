from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import require_permission
from app.core.database import get_db
from app.imports import build_template, import_workbook
from app.schemas.import_data import ImportResultRead

router = APIRouter()

_XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.get("/template", dependencies=[Depends(require_permission("data_import.manage"))])
def download_template():
    content = build_template()
    return Response(
        content=content,
        media_type=_XLSX_MEDIA_TYPE,
        headers={"Content-Disposition": 'attachment; filename="campus-suite-import-template.xlsx"'},
    )


@router.post("", response_model=ImportResultRead, dependencies=[Depends(require_permission("data_import.manage"))])
async def import_data(db: Session = Depends(get_db), file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please upload an .xlsx file (the downloaded template format).")
    contents = await file.read()
    try:
        result = import_workbook(db, contents)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    return ImportResultRead(counts=result.counts, errors=result.errors)
