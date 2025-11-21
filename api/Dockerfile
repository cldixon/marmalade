# Use the Python 3 alpine official image
# https://hub.docker.com/_/python
FROM python:3-alpine

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Create and change to the app directory.
WORKDIR /api

# Copy local code to the container image.
COPY . .


# Install dependencies using 'uv'
RUN uv sync --frozen --no-cache


# Run the web service on container startup.
CMD ["uv", "run", "hypercorn", "main:app", "--bind", "::"]
