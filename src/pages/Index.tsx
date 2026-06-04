"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Palette, Rocket } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bem-vindo ao seu App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Um projeto moderno construído com React, TypeScript e shadcn/ui
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Code className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>Tipagem segura e código mais confiável</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Palette className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>shadcn/ui</CardTitle>
              <CardDescription>Componentes bonitos e acessíveis</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Rocket className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Rapido</CardTitle>
              <CardDescription>Desenvolvimento ágil e eficiente</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Começar a construir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;