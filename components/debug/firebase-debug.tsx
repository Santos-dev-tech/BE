"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function FirebaseDebug() {
  const { user, isAdmin } = useAdminAuth();
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  const testPermissions = async () => {
    setTesting(true);
    const results: Record<string, string> = {};

    // Test reading collections
    const collections = [
      "bookings",
      "clients",
      "conversations",
      "messages",
      "notifications",
    ];

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        results[`read_${collectionName}`] =
          `✅ Success (${snapshot.docs.length} docs)`;
      } catch (error: any) {
        results[`read_${collectionName}`] = `❌ ${error.code || "Error"}`;
      }
    }

    // Test writing to a collection
    try {
      await addDoc(collection(db, "test"), {
        timestamp: new Date(),
        user: user?.uid,
      });
      results["write_test"] = "✅ Write Success";
    } catch (error: any) {
      results["write_test"] = `❌ Write ${error.code || "Error"}`;
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase Permissions Debug</CardTitle>
        <CardDescription>
          Test Firestore permissions and connectivity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">User Status:</p>
            <Badge variant={user ? "default" : "destructive"}>
              {user ? `Authenticated: ${user.email}` : "Not Authenticated"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Admin Status:</p>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Admin User" : "Regular User"}
            </Badge>
          </div>
        </div>

        <Button onClick={testPermissions} disabled={testing || !user}>
          {testing ? "Testing..." : "Test Permissions"}
        </Button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {Object.entries(testResults).map(([test, result]) => (
              <div
                key={test}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-mono text-sm">{test}</span>
                <span className="text-sm">{result}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-yellow-50 rounded">
          <p>
            <strong>If you see permission errors:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Check that Firestore security rules are deployed</li>
            <li>Verify the admin UID matches in the rules</li>
            <li>See FIREBASE_SETUP.md for detailed instructions</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
