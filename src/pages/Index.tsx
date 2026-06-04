"use client";

import React from "react";
import MadeWithDyad from "@/components/made-with-dyad";
import Documentation from "@/components/Documentation";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-6">
          Start building your amazing project here!
        </p>
        <Documentation />
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;