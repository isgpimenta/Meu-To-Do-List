"use client";

import React from "react";

/**
 * Centered spinner used while auth state or data is loading.
 */
export const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full border-4 border-primary border-t-transparent w-12 h-12" />
  </div>
);