FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ARG SPLASH_SCORING_PORT

ENV PORT=${SPLASH_SCORING_PORT}


EXPOSE ${PORT}

CMD sh -c "uvicorn app.api:app --host 0.0.0.0 --port $PORT"