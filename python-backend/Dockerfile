# Dockerfile for FN7 Python Backend
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
# Install fn7-sdk from custom registry first
RUN pip install --no-cache-dir fn7-sdk --extra-index-url https://fn7.io/.fn7-sdk/python/
# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Set environment to production
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

