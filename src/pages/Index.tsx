"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, LogIn, UserPlus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Minha Lista de Tarefas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organize suas tarefas diárias com nossa aplicação simples e eficiente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <ListTodo className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Tarefas Simples</CardTitle>
              <CardDescription>Crie, edite e organize suas tarefas facilmente</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <UserPlus className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Cadastro Rápido</CardTitle>
              <CardDescription>Crie sua conta em segundos e comece a usar</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <LogIn className="h-10 w-10 text-indigo-600 mb-2" />
              <CardTitle>Seguro</CardTitle>
              <CardDescription>Suas informações protegidas com autenticação moderna</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            <LogIn className="h-5 w-5 mr-2" />
            Fazer Login
          </Button>
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-700 underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;