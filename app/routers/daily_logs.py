from fastapi import APIRouter

router = APIRouter(prefix="/daily-logs", tags=["Daily Logs"])

fake_db = []

@router.get("/")
def get_logs():
    return fake_db

@router.post("/")
def create_log(log: dict):
    fake_db.append(log)
    return {"message": "Log creado", "data": log}
