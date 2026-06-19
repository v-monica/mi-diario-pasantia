from fastapi import FastAPI
from app.routers import daily_logs

app = FastAPI(title="Internship Performance API")

app.include_router(daily_logs.router)

@app.get("/")
def root():
    return {"message": "Internship Performance API"}
