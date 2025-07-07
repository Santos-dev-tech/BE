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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Calendar,
  MessageSquare,
  User,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useClientAuth } from "@/hooks/use-client-auth";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message: string;
  details?: any;
}

export function ClientTest() {
  const { clientProfile } = useClientAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateTest = (
    name: string,
    status: TestResult["status"],
    message: string,
    details?: any,
  ) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const runClientTest = async () => {
    if (!clientProfile) {
      toast.error("Please sign in as a client to run this test");
      return;
    }

    setRunning(true);
    setTests([]);
    setProgress(0);

    const testSteps = [
      "Client Authentication",
      "Profile Data Check",
      "Booking Creation Test",
      "Booking Retrieval Test",
      "Message Sending Test",
      "Notification System Test",
      "Real-time Updates Test",
    ];

    let currentStep = 0;

    for (const step of testSteps) {
      setCurrentTest(step);
      setProgress((currentStep / testSteps.length) * 100);

      try {
        switch (step) {
          case "Client Authentication":
            await testClientAuth();
            break;
          case "Profile Data Check":
            await testProfileData();
            break;
          case "Booking Creation Test":
            await testBookingCreation();
            break;
          case "Booking Retrieval Test":
            await testBookingRetrieval();
            break;
          case "Message Sending Test":
            await testMessageSending();
            break;
          case "Notification System Test":
            await testNotificationSystem();
            break;
          case "Real-time Updates Test":
            await testRealTimeUpdates();
            break;
        }
      } catch (error: any) {
        updateTest(step, "error", `Failed: ${error.message}`, error);
      }

      currentStep++;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setProgress(100);
    setCurrentTest("");
    setRunning(false);
    toast.success("Client test completed! 🎉");
  };

  const testClientAuth = async () => {
    updateTest(
      "Client Authentication",
      "running",
      "Checking client authentication...",
    );

    if (!clientProfile) {
      throw new Error("No client profile found");
    }

    updateTest(
      "Client Authentication",
      "success",
      `✅ Client authenticated: ${clientProfile.displayName} (${clientProfile.email})`,
      {
        uid: clientProfile.uid,
        email: clientProfile.email,
        displayName: clientProfile.displayName,
        phone: clientProfile.phone,
      },
    );
  };

  const testProfileData = async () => {
    updateTest("Profile Data Check", "running", "Validating profile data...");

    if (!clientProfile?.displayName || !clientProfile?.email) {
      throw new Error("Incomplete profile data");
    }

    updateTest(
      "Profile Data Check",
      "success",
      "✅ Profile data is complete and valid",
      {
        hasName: !!clientProfile.displayName,
        hasEmail: !!clientProfile.email,
        hasPhone: !!clientProfile.phone,
        isClient: clientProfile.isClient,
      },
    );
  };

  const testBookingCreation = async () => {
    updateTest("Booking Creation Test", "running", "Creating test booking...");

    const testBooking = {
      customerId: clientProfile!.uid,
      customerName: clientProfile!.displayName,
      customerEmail: clientProfile!.email,
      customerPhone: clientProfile!.phone || "+254700000000",
      service: "Test Manicure Service",
      stylist: "Test Stylist",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      status: "pending",
      notes: "Test booking from client test",
      price: 500,
      duration: 45,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "bookings"), testBooking);

    updateTest(
      "Booking Creation Test",
      "success",
      "✅ Test booking created successfully",
      { bookingId: docRef.id, booking: testBooking },
    );
  };

  const testBookingRetrieval = async () => {
    updateTest(
      "Booking Retrieval Test",
      "running",
      "Retrieving client bookings...",
    );

    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", clientProfile!.uid),
    );
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    updateTest(
      "Booking Retrieval Test",
      "success",
      `✅ Found ${bookings.length} bookings for this client`,
      { count: bookings.length, bookings: bookings.slice(0, 3) },
    );
  };

  const testMessageSending = async () => {
    updateTest("Message Sending Test", "running", "Testing message system...");

    const testConversationId = `${clientProfile!.uid}_admin`;

    // Create test conversation
    await setDoc(doc(db, "conversations", testConversationId), {
      id: testConversationId,
      customerName: clientProfile!.displayName,
      customerEmail: clientProfile!.email,
      customerId: clientProfile!.uid,
      lastMessage: "Test message from client",
      lastMessageTime: Timestamp.now(),
      unreadCount: 1,
    });

    // Create test message
    await addDoc(collection(db, "messages"), {
      text: "Test message from client test",
      senderId: clientProfile!.uid,
      senderName: clientProfile!.displayName,
      senderType: "customer",
      conversationId: testConversationId,
      timestamp: Timestamp.now(),
    });

    updateTest(
      "Message Sending Test",
      "success",
      "✅ Message sent successfully",
      { conversationId: testConversationId },
    );
  };

  const testNotificationSystem = async () => {
    updateTest(
      "Notification System Test",
      "running",
      "Testing notification creation...",
    );

    await addDoc(collection(db, "notifications"), {
      userId: clientProfile!.uid,
      title: "Test Notification",
      message: "This is a test notification from the client test",
      type: "message",
      read: false,
      createdAt: Timestamp.now(),
    });

    updateTest(
      "Notification System Test",
      "success",
      "✅ Notification created successfully",
    );
  };

  const testRealTimeUpdates = async () => {
    updateTest(
      "Real-time Updates Test",
      "running",
      "Testing real-time capabilities...",
    );

    // This test verifies that the client can listen to real-time updates
    const testPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Real-time listener timeout"));
      }, 3000);

      // Test that we can listen to bookings
      import("firebase/firestore").then(({ onSnapshot }) => {
        const q = query(
          collection(db, "bookings"),
          where("customerId", "==", clientProfile!.uid),
        );
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            clearTimeout(timeout);
            unsubscribe();
            resolve(snapshot.docs.length);
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          },
        );
      });
    });

    const bookingCount = await testPromise;

    updateTest(
      "Real-time Updates Test",
      "success",
      `✅ Real-time listener working (${bookingCount} bookings detected)`,
    );
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const passedTests = tests.filter((t) => t.status === "success").length;
  const failedTests = tests.filter((t) => t.status === "error").length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Client Experience Test</span>
          </CardTitle>
          <CardDescription>
            Complete test of the client-side experience including booking and
            messaging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-x-4 flex">
              <Badge variant="outline" className="bg-purple-50">
                <Heart className="h-3 w-3 mr-1 text-purple-600" />
                Client Side
              </Badge>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                Bookings
              </Badge>
              <Badge variant="outline">
                <MessageSquare className="h-3 w-3 mr-1" />
                Messages
              </Badge>
              <Badge variant="outline">
                <User className="h-3 w-3 mr-1" />
                Profile
              </Badge>
            </div>
            <Button
              onClick={runClientTest}
              disabled={running || !clientProfile}
            >
              {running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Client Test
                </>
              )}
            </Button>
          </div>

          {!clientProfile && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                Please sign in as a client to run this test. Go to{" "}
                <strong>/auth/client/signin</strong> or create a new account.
              </AlertDescription>
            </Alert>
          )}

          {running && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {currentTest}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {tests.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Test Results:</h4>
                <div className="space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    ✅ {passedTests} passed
                  </Badge>
                  {failedTests > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      ❌ {failedTests} failed
                    </Badge>
                  )}
                </div>
              </div>

              {tests.map((test, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{test.name}</span>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {test.message}
                        </p>
                        {test.details && (
                          <div className="mt-2 text-xs">
                            <details className="cursor-pointer">
                              <summary className="text-purple-600 hover:text-purple-800">
                                View Details
                              </summary>
                              <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                                {JSON.stringify(test.details, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              This test verifies: Client authentication, Profile validation,
              Booking creation/retrieval, Messaging system, Notifications, and
              Real-time updates from the client perspective.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
