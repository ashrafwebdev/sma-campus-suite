from pydantic import BaseModel


class ImportResultRead(BaseModel):
    counts: dict[str, int] = {}
    errors: list[str] = []
