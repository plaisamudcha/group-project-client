import React, { useState, useEffect } from 'react';
import employeeApi from "@/src/api/employeeApi";

// =======================================================================
// FILE: src/pages/EmployeePages/LeaveEntitlementPage.jsx
// =======================================================================
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";


function LeaveEntitlementPage() {
    const [entitlements, setEntitlements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const translateLeaveType = (type) => {
    const leaveTypes = {
        'SICK': 'วันลาป่วย',
        'PERSONAL': 'วันลากิจ',
        'VACATION': 'วันลาพักร้อน',
        'MATERNITY': 'วันลาคลอด',
        'UNPAID': 'วันลางานไม่รับเงินเดือน',
    };
    return leaveTypes[type] || type;
};

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeApi.getLeaveEntitlements();
            // --- FIX 1: เพิ่ม console.log เพื่อดูข้อมูลที่ได้รับจาก API ---
            console.log('API Response for Entitlements:', response.data);

            

            const entitlementsData = response.data.entitlements || response.data;
            
            if (Array.isArray(entitlementsData)) {
                setEntitlements(entitlementsData);
            } else {
                throw new Error("โครงสร้างข้อมูลสิทธิ์วันลาไม่ถูกต้อง");
            }

            

        } catch (err) {
            setError(err.message || err.response?.data?.message || "ไม่สามารถโหลดข้อมูลได้");
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

    if (entitlements.length === 0) {
        return (
            <Card  className="w-150 max-w-2xl mx-auto animate-fade-in"  >
                <CardHeader>
                    <CardTitle>สิทธิ์วันลา</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">ไม่พบข้อมูลสิทธิ์วันลา</p>
                </CardContent>
            </Card>
        );
    }

     return (
        <Card className="w-150 max-w-2xl mx-auto animate-fade-in">
            <CardHeader>
                <CardTitle>สิทธิ์วันลาคงเหลือ</CardTitle>
                <CardDescription>สรุปสิทธิ์วันลาคงเหลือประจำปีของคุณ</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entitlements.length > 0 ? entitlements.map((item, index) => {
                    const total = item.entitledDays;
                    const used = item.leaveDaysUsed || 0;
                    const remaining = total - used;
                    const percentage = total > 0 ? (used / total) * 100 : 0;
                    return (
                        <Card key={index}>
                            <CardHeader><CardTitle className="text-lg font-medium">{translateLeaveType(item.leaveType)}</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold">{remaining}<span className="text-lg font-normal text-muted-foreground"> / {total} วัน</span></p>
                                <Progress value={percentage} className="mt-4" />
                                <p className="text-xs text-muted-foreground mt-2">ใช้ไปแล้ว {used} วัน</p>
                            </CardContent>
                        </Card>
                    );
                }) : <p className="text-center text-muted-foreground col-span-full py-8">ไม่พบข้อมูลสิทธิ์วันลา</p>}
            </CardContent>
        </Card>
    );
}
export default LeaveEntitlementPage;
