from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from . import apis as api

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://192.168.1.6:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/uv")
def get_uv(lat: float, long: float):
    """Return the current-hour UV index for the provided lat/long query parameters."""
    response = api.get_uv_info(str(lat), str(long))
    uv_value = api.current_hour_uv(response)
    if uv_value is None:
        raise HTTPException(status_code=502, detail="Could not fetch UV value")
    api.get_uv_info_chart(lat, long, "clear", "chart.png")
    return {"lat": lat, "long": long, "uv": uv_value}

