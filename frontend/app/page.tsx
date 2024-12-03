"use client";
import React from "react";
import GrowingTree from "../hooks/tide";

export default function Page() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <GrowingTree />
    </div>
  );
}
