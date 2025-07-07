"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error" | "warning";
  message: string;
  details?: string;
}

export function SystemTest() {
  const { user, isAdmin } = useAdminAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const addTest = (test: TestResult) => {
    setTests((prev) => [...prev, test]);
  };

  const runFullSystemTest = async () => {
    setRunning(true);
    setTests([]);

    // Test 1: Firebase Connection
    try {
      await getDocs(collection(db, "test"));
      addTest({
        name: "Firebase Connection",
        status: "success",
        message: "Connected to Firebase successfully",
      });
    } catch (error: any) {
      addTest({
        name: "Firebase Connection",
        status: "error",
        message: "Failed to connect to Firebase",
        details: error.message,
      });
    }

    // Test 2: Authentication
    if (user && isAdmin) {
      addTest({
        name: "Admin Authentication",
        status: "success",
        message: `Authenticated as admin: ${user.email}`,
      });
    } else {
      addTest({
        name: "Admin Authentication",
        status: "warning",
        message: "Not authenticated as admin",
      });
    }

    // Test 3: Bookings Collection
    try {
      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      addTest({
        name: "Bookings Collection",
        status: "success",
        message: `Found ${bookingsSnapshot.docs.length} bookings`,
      });
    } catch (error: any) {
      addTest({
        name: "Bookings Collection",
        status: "error",
        message: "Failed to read bookings",
        details: error.message,
      });
    }

    // Test 4: Clients Collection
    try {
      const clientsSnapshot = await getDocs(collection(db, "clients"));
      addTest({
        name: "Clients Collection",
        status: "success",
        message: `Found ${clientsSnapshot.docs.length} clients`,
      });
    } catch (error: any) {
      addTest({
        name: "Clients Collection",
        status: "error",
        message: "Failed to read clients",
        details: error.message,
      });
    }

    // Test 5: Conversations Collection
    try {
      const conversationsSnapshot = await getDocs(
        collection(db, "conversations"),
      );
      addTest({
        name: "Conversations Collection",
        status: "success",
        message: `Found ${conversationsSnapshot.docs.length} conversations`,
      });
    } catch (error: any) {
      addTest({
        name: "Conversations Collection",
        status: "error",
        message: "Failed to read conversations",
        details: error.message,
      });
    }

    // Test 6: Messages Collection with Query
    try {
      const messagesQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      addTest({
        name: "Messages Query",
        status: "success",
        message: `Found ${messagesSnapshot.docs.length} messages with proper indexing`,
      });
    } catch (error: any) {
      addTest({
        name: "Messages Query",
        status: "error",
        message: "Failed to query messages",
        details: error.message,
      });
    }

    // Test 7: Real-time Listeners
    try {
      const unsubscribe = onSnapshot(
        collection(db, "bookings"),
        (snapshot) => {
          addTest({
            name: "Real-time Listeners",
            status: "success",
            message: `Real-time listener working (${snapshot.docs.length} docs)`,
          });
          unsubscribe();
        },
        (error) => {
          addTest({
            name: "Real-time Listeners",
            status: "error",
            message: "Real-time listener failed",
            details: error.message,
          });
        },
      );
    } catch (error: any) {
      addTest({
        name: "Real-time Listeners",
        status: "error",
        message: "Failed to setup real-time listener",
        details: error.message,
      });
    }

    // Test 8: Write Permissions (if admin)
    if (isAdmin) {
      try {
        const testDoc = await addDoc(collection(db, "test"), {
          timestamp: Timestamp.now(),
          test: "system-test",
          user: user?.uid,
        });
        addTest({
          name: "Write Permissions",
          status: "success",
          message: "Successfully wrote test document",
        });
      } catch (error: any) {
        addTest({
          name: "Write Permissions",
          status: "error",
          message: "Failed to write test document",
          details: error.message,
        });
      }
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>System Health Check</CardTitle>
        <CardDescription>
          Comprehensive test of all BeautyExpress systems and functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              User: {user?.email || "Not authenticated"}
              {isAdmin && <Badge className="ml-2">Admin</Badge>}
            </p>
          </div>
          <Button onClick={runFullSystemTest} disabled={running}>
            {running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run System Test"
            )}
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{test.name}</span>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    {test.details && (
                      <p className="text-xs text-red-600 mt-1 font-mono">
                        {test.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded">
          <p>
            <strong>This test checks:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Firebase connection and authentication</li>
            <li>Database collections access and permissions</li>
            <li>Real-time listeners functionality</li>
            <li>Query indexes and performance</li>
            <li>Write permissions for admin users</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
