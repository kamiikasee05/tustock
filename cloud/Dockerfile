FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY config.py models.py api.py dashboard.html payments.py audit.py ./

EXPOSE 8000

ENV PORT=8000

CMD uvicorn api:app --host 0.0.0.0 --port $PORT
