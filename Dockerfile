FROM python:3.9

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y tesseract-ocr

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 5000 8501
CMD ["sh", "-c", "python backend/app.py & streamlit run frontend/app.py --server.port 8501"]