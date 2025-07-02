"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle, ExternalLink, Terminal, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function CORSSetupGuide() {
  const [copied, setCopied] = useState<string | null>(null)

  const corsCode = `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware FIRST - BEFORE any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use your specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your routes AFTER CORS middleware
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/users/")
async def create_user(user: UserCreate):
    # Your user creation logic
    pass

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Your login logic
    pass`

  const requirementsCode = `fastapi
uvicorn
python-multipart
python-jose[cryptography]
passlib[bcrypt]
sqlalchemy
alembic`

  const copyCode = async (code: string, type: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const openRailwayDocs = () => {
    window.open("https://docs.railway.app/guides/fastapi", "_blank")
  }

  const openCORSDocs = () => {
    window.open("https://fastapi.tiangolo.com/tutorial/cors/", "_blank")
  }

  return (
    <Card className="mb-6 border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />🚨 Authentication Endpoints Blocked by CORS!
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Critical Issue */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>🔴 Critical Issue:</strong> Your authentication is working in demo mode only:
              <ul className="mt-2 text-sm list-disc list-inside space-y-1">
                <li>✅ Health endpoint: Working</li>
                <li>❌ /users/ endpoint: CORS blocked</li>
                <li>❌ /token endpoint: CORS blocked</li>
                <li>🎭 Result: Demo mode authentication only</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Step 1: Fix CORS Order */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </span>
              CRITICAL: Add CORS middleware BEFORE all routes
            </h3>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{corsCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
                onClick={() => copyCode(corsCode, "cors")}
              >
                {copied === "cors" ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied === "cors" ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>

          {/* Step 2: Update Requirements */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                2
              </span>
              Update your requirements.txt:
            </h3>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
                <code>{requirementsCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-gray-800 border-gray-600 hover:bg-gray-700"
                onClick={() => copyCode(requirementsCode, "requirements")}
              >
                {copied === "requirements" ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied === "requirements" ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Step 3: Deploy */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                3
              </span>
              Deploy to Railway
            </h3>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2">Push your changes to trigger a new Railway deployment:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  git add . && git commit -m "Fix CORS for auth endpoints" && git push
                </code>
                <p className="mt-2 text-sm">Railway will automatically redeploy your app with CORS enabled.</p>
              </AlertDescription>
            </Alert>
          </div>

          {/* Step 4: Test */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                4
              </span>
              Test Real Authentication
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              After deployment, try signing up again. Check the browser console for "REAL registration" messages.
            </p>
          </div>

          {/* Debug Commands */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                🔍
              </span>
              Debug Commands
            </h3>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2">Test your auth endpoints directly:</p>
                <div className="space-y-2">
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    curl -X OPTIONS "https://web-production-56fee.up.railway.app/users/" -H "Origin: https://v0.dev" -v
                  </code>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    curl -X OPTIONS "https://web-production-56fee.up.railway.app/token" -H "Origin: https://v0.dev" -v
                  </code>
                </div>
                <p className="mt-2 text-sm">Both should return 200 OK with CORS headers.</p>
              </AlertDescription>
            </Alert>
          </div>

          {/* Helpful Links */}
          <div className="flex gap-3">
            <Button onClick={openRailwayDocs} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Railway FastAPI Guide
            </Button>
            <Button onClick={openCORSDocs} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              FastAPI CORS Docs
            </Button>
          </div>

          {/* Current Status */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>📊 Current Status:</strong> The frontend now attempts REAL API calls first, then falls back to
              demo mode if CORS fails. Check the console for "REAL registration" vs "Demo mode" messages.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
