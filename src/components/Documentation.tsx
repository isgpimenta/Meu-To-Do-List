"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsPanel } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Documentation = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsPanel value="frontend">Frontend</TabsPanel>
            <TabsPanel value="backend">Backend</TabsPanel>
          </TabsList>
          <TabsContent value="frontend" className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Documentação Frontend</h3>
            <p className="text-gray-600">
              Este é o front matter para o projeto. Contém informações sobre a arquitetura e componentes do frontend.
            </p>
          </TabsContent>
          <TabsContent value="backend" className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Documentação Backend</h3>
            <p className="text-gray-600">
              Este é o back matter para o projeto. Contém informações sobre a API e integrações.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Documentation;