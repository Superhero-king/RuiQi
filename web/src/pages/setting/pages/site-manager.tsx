import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GridView } from "./site-manager/grid-view";
import { TableView } from "./site-manager/table-view";
import { AddSiteDialog } from "./site-manager/add-site-dialog";

export function SiteManager() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">站点管理</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        添加站点
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="grid">
                <TabsList className="mb-4">
                    <TabsTrigger value="grid">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 2h4v4H2V2zm6 0h4v4H8V2zm6 0h4v4h-4V2zM2 8h4v4H2V8zm6 0h4v4H8V8zm6 0h4v4h-4V8zM2 14h4v4H2v-4zm6 0h4v4H8v-4zm6 0h4v4h-4v-4z"/>
                        </svg>
                    </TabsTrigger>
                    <TabsTrigger value="table">
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 4h16v2H2V4zm0 5h16v2H2V9zm0 5h16v2H2v-2z"/>
                        </svg>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="grid">
                    <GridView />
                </TabsContent>
                <TabsContent value="table">
                    <TableView />
                </TabsContent>
            </Tabs>

            <AddSiteDialog 
                open={isAddDialogOpen} 
                onOpenChange={setIsAddDialogOpen}
            />
        </Card>
    );
}