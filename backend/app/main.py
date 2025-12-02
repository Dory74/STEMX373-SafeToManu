from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from . import apis as api
import os
from dotenv import load_dotenv


app = FastAPI()

load_dotenv()
# VITE_FRONTEND_URL = os.getenv("VITE_FRONTEND_URL")
# VITE_API_URL = os.getenv("VITE_API_URL")


origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://192.168.1.6:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.6:8230",
    "http://192.168.1.6:5080:",

    # Cloudflare Zero Trust / deployed frontend hosts
    "https://manu.byteme.pro",
    "http://manu.byteme.pro",
    "https://api.manu.byteme.pro",
    "http://api.manu.byteme.pro",
    # VITE_API_URL,
    # VITE_FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
def root():
    return {"message": "Backend is running"}

@app.get("/api/uv")
def get_uv(lat: float, long: float):
    """Return the current-hour UV index for the provided lat/long query parameters."""
    response = api.get_uv_info(str(lat), str(long))
    uv_value = api.current_hour_uv(response)
    if uv_value is None:
        raise HTTPException(status_code=502, detail="Could not fetch UV value")
    api.get_uv_info_chart(lat, long, "clear", "chart.png")
    return {"lat": lat, "long": long, "uv": uv_value}
