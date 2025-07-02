"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Component() {
  const [defaultExpanded, setDefaultExpanded] = useState(true)
  const [schemasExpanded, setSchemasExpanded] = useState(true)
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([])
  const [expandedSchemas, setExpandedSchemas] = useState<string[]>([])

  const toggleEndpoint = (endpoint: string) => {
    setExpandedEndpoints((prev) => (prev.includes(endpoint) ? prev.filter((e) => e !== endpoint) : [...prev, endpoint]))
  }

  const toggleSchema = (schema: string) => {
    setExpandedSchemas((prev) => (prev.includes(schema) ? prev.filter((s) => s !== schema) : [...prev, schema]))
  }

  const endpoints = [
    {
      method: "POST",
      path: "/todos/",
      description: "Create Todo Endpoint",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      method: "GET",
      path: "/todos/",
      description: "Read Todos Endpoint",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      method: "GET",
      path: "/todos/{todo_id}",
      description: "Read Todo Endpoint",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      method: "PUT",
      path: "/todos/{todo_id}",
      description: "Update Todo Endpoint",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      method: "DELETE",
      path: "/todos/{todo_id}",
      description: "Delete Todo Endpoint",
      color: "bg-red-500 hover:bg-red-600",
    },
  ]

  const schemas = [
    { name: "HTTPValidationError", type: "object" },
    { name: "ToDo", type: "object" },
    { name: "ToDoCreate", type: "object" },
    { name: "ToDoUpdate", type: "object" },
    { name: "ValidationError", type: "object" },
  ]

  return (
    <div className="min-h-screen bg-white relative">
      {/* Clean whiteboard-style background with subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]"></div>

      <div className="relative max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/30">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">REST API</h1>
            <p className="text-blue-600 text-sm font-medium">openapi.json</p>
          </div>

          {/* Default Section */}
          <div className="border-b border-gray-100">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
              onClick={() => setDefaultExpanded(!defaultExpanded)}
            >
              <h2 className="text-lg font-semibold text-gray-800">default</h2>
              {defaultExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {defaultExpanded && (
              <div className="pb-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="mx-4 mb-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] transition-all duration-200">
                      <Button
                        className={`${endpoint.color} text-white font-medium px-4 py-2 rounded-none border-0 min-w-[80px] text-sm`}
                      >
                        {endpoint.method}
                      </Button>
                      <div className="flex-1 flex items-center justify-between px-4 py-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm text-gray-700">{endpoint.path}</span>
                          <span className="text-sm text-gray-600">{endpoint.description}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {endpoint.method === "DELETE" && <Trash2 className="w-4 h-4 text-gray-400" />}
                          <button
                            onClick={() => toggleEndpoint(`${endpoint.method}-${endpoint.path}`)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedEndpoints.includes(`${endpoint.method}-${endpoint.path}`) && (
                      <Card className="mt-3 ml-20 mr-4 bg-white border-gray-200 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">
                            <p className="mb-2">
                              <strong>Description:</strong> {endpoint.description}
                            </p>
                            <p className="mb-2">
                              <strong>Method:</strong> {endpoint.method}
                            </p>
                            <p>
                              <strong>Path:</strong> {endpoint.path}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schemas Section */}
          <div>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
              onClick={() => setSchemasExpanded(!schemasExpanded)}
            >
              <h2 className="text-lg font-semibold text-gray-800">Schemas</h2>
              {schemasExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {schemasExpanded && (
              <div className="pb-4">
                {schemas.map((schema, index) => (
                  <div key={index} className="mx-4 mb-3">
                    <div
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] cursor-pointer hover:bg-gray-50/30 hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)] transition-all duration-200"
                      onClick={() => toggleSchema(schema.name)}
                    >
                      <div className="flex items-center space-x-3">
                        {expandedSchemas.includes(schema.name) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="font-semibold text-gray-800">{schema.name}</span>
                        <span className="text-sm text-gray-500">Expand all</span>
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          {schema.type}
                        </span>
                      </div>
                    </div>

                    {expandedSchemas.includes(schema.name) && (
                      <Card className="mt-3 ml-6 bg-white border-gray-200 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                        <CardContent className="p-4">
                          <div className="text-sm text-gray-600">
                            <p className="mb-2">
                              <strong>Type:</strong> {schema.type}
                            </p>
                            <p className="mb-2">
                              <strong>Properties:</strong>
                            </p>
                            <div className="ml-4 space-y-1">
                              <p>• id: integer</p>
                              <p>• title: string</p>
                              <p>• completed: boolean</p>
                              <p>• created_at: string (date-time)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
