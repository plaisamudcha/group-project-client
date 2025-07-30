import React, { useState, useEffect } from 'react';
import employeeApi from '@/api/employeeApi'; // สมมติว่า path นี้ถูกต้อง

// =======================================================================
// FILE: src/pages/EmployeePages/LeaveEntitlementPage.jsx
// =======================================================================
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";


function LeaveEntitlementPage() {
    const [entitlements, setEntitlements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeApi.getLeaveEntitlements();
            setEntitlements(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-5 w-2/4" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-2 w-full" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>เกิดข้อผิดพลาด!</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }
       return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {entitlements.map((item, index) => {
                const remaining = item.total - item.used;
                const percentage = item.total > 0 ? ((item.used / item.total)) * 100 : 0;
                return (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium">{item.type}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">
                                {remaining}
                                <span className="text-lg font-normal text-muted-foreground"> / {item.total} วัน</span>
                            </p>
                            <Progress value={percentage} className="mt-4" />
                            <p className="text-xs text-muted-foreground mt-2">ใช้ไปแล้ว {item.used} วัน</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
export default LeaveEntitlementPage;
