FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first 
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ARG BACKEND_PORT
ARG METSERVICE_API_KEY

ENV PORT=${BACKEND_PORT}
ENV METSERVICE_API_KEY = ${METSERVICE_API_KEY}

EXPOSE ${PORT}

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port $PORT"