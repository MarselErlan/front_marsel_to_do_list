"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, RefreshCw, ExternalLink } from "lucide-react"

interface DemoModeBannerProps {
  onRetryConnection: () => void
  isRetrying: boolean
}

export function DemoModeBanner({ onRetryConnection, isRetrying }: DemoModeBannerProps) {
  const openBackendUrl = () => {
    window.open("https://web-production-56fee.up.railway.app", "_blank")
  }

  return (
    <Alert className="mb-6 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                🔍 Debugging Mode
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🎭 Demo Active
              </Badge>
            </div>
            <p className="text-orange-700 text-sm mb-3">
              <strong>Connection Status:</strong> Your backend is running but the frontend can't connect due to CORS.
            </p>
            <div className="space-y-1 text-sm text-orange-700">
              <p>✅ Backend URL: Responding</p>
              <p>✅ Railway deployment: Active</p>
              <p>❌ CORS headers: Missing or incorrect</p>
              <p>🔧 Solution: Add CORS middleware to FastAPI</p>
            </div>

            <div className="mt-3 p-2 bg-orange-100 rounded text-xs">
              <strong>Quick Test:</strong> Open browser dev tools (F12) → Network tab → Try "Retry Connection" to see
              the exact error.
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Button size="sm" onClick={onRetryConnection} disabled={isRetrying} variant="outline">
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Retry Connection
            </Button>
            <Button size="sm" onClick={openBackendUrl} variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Test Backend
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
