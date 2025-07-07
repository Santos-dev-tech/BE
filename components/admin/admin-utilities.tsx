"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, RefreshCw, Database, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FunctionalityTest } from "@/components/test/functionality-test";

export function AdminUtilities() {
  const [loading, setLoading] = useState(false);

  const clearSampleData = () => {
    localStorage.removeItem("sampleDataInitialized");
    toast.success("Sample data flag cleared - refresh to reinitialize data");
  };

  const clearAllLocalData = () => {
    setLoading(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast.success("All local data cleared");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Failed to clear local data");
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Utilities for managing sample data and application state
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={clearSampleData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Sample Data</span>
            </Button>

            <Button
              variant="outline"
              onClick={forceRefresh}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Force Refresh</span>
            </Button>

            <Button
              variant="destructive"
              onClick={clearAllLocalData}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All Data</span>
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Reset Sample Data:</strong> Clears the initialization flag
              to allow sample data to be recreated on next load.
              <br />
              <strong>Clear All Data:</strong> Removes all local storage data
              and refreshes the page - use with caution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current application state and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Sample Data Initialized:</p>
              <p className="text-gray-600">
                {localStorage.getItem("sampleDataInitialized") ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="font-medium">Environment:</p>
              <p className="text-gray-600">{process.env.NODE_ENV}</p>
            </div>
            <div>
              <p className="font-medium">Local Storage Items:</p>
              <p className="text-gray-600">
                {Object.keys(localStorage).length} items
              </p>
            </div>
            <div>
              <p className="font-medium">Page Load Time:</p>
              <p className="text-gray-600">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
