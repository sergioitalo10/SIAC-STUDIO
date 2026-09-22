"use client";

import { Suspense } from "react";
import SubmitContent from "./submit-content";

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-center"><p className="text-xl text-gray-400 animate-pulse">Carregando...</p></div></div>}>
      <SubmitContent />
    </Suspense>
  );
}
