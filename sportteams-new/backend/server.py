#!/usr/bin/env python3
"""
Proxy server to redirect requests to Laravel backend
This ensures the platform preview works correctly
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import os

app = FastAPI(title="SportTeams Proxy", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Laravel backend URL
LARAVEL_BACKEND_URL = "http://localhost:8002"

@app.middleware("http")
async def proxy_requests(request: Request, call_next):
    """Proxy all requests to Laravel backend"""
    try:
        # Skip health check endpoint
        if request.url.path == "/health":
            return await call_next(request)
        
        # Prepare the proxied request
        url = f"{LARAVEL_BACKEND_URL}{request.url.path}"
        if request.url.query:
            url = f"{url}?{request.url.query}"
        
        # Forward request headers
        headers = dict(request.headers)
        # Remove host header to avoid conflicts
        headers.pop("host", None)
        
        # Get request body if present
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
        
        # Make the proxied request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                follow_redirects=True
            )
        
        # Return the response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
        
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": "Laravel backend is not available",
                "laravel_url": LARAVEL_BACKEND_URL
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error", 
                "message": f"Proxy error: {str(e)}"
            }
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if Laravel backend is accessible
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{LARAVEL_BACKEND_URL}/api/v1/test")
            laravel_healthy = response.status_code == 200
    except:
        laravel_healthy = False
    
    return {
        "status": "healthy" if laravel_healthy else "partial",
        "proxy": "running",
        "laravel_backend": "healthy" if laravel_healthy else "unavailable",
        "laravel_url": LARAVEL_BACKEND_URL
    }

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        workers=1,
        reload=True
    )