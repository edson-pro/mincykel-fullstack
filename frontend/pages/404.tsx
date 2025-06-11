import React from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-18rem)] flex items-center justify-center ">
      <div className="max-w-md mx-auto text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Page not found
        </h2>
        <p className="text-gray-500 text-sm leading-7 mb-8">
          Sorry, we couldn't find the page you're looking for. Perhaps you've
          mistyped the URL or the page has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="sm">
            <Home className="h-4 w-4 mr-3" />
            Back to Home
          </Button>
          <Button size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
