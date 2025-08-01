import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336"];

export default function DashboardPage() {
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = {
          employeeCount: 35,
          todayStatus: [
            { label: "มา", count: 12 },
            { label: "ลา", count: 3 },
            { label: "ขาด", count: 2 },
          ],
          leaveRequests: [
            { label: "อนุมัติ", count: 10 },
            { label: "รออนุมัติ", count: 6 },
            { label: "ไม่อนุมัติ", count: 4 },
          ],
          todayLeaves: [
            {
              name: "สมชาย ใจดี",
              leaveType: "ลาป่วย",
              startDate: "2025-07-31",
              endDate: "2025-07-31",
            },
            {
              name: "สุดารัตน์ มีใจ",
              leaveType: "ลากิจ",
              startDate: "2025-07-31",
              endDate: "2025-07-31",
            },
          ],
        };
        setStats(stats);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">ภาพรวมการเข้างานพนักงาน</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* จำนวนพนักงาน */}
        <Card>
          <CardHeader>
            <CardTitle>จำนวนพนักงานทั้งหมด</CardTitle>
            <CardDescription>รวมพนักงานในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {stats.employeeCount} คน
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ข้อมูลล่าสุดเมื่อ {new Date().toLocaleDateString("th-TH")}
            </p>
          </CardContent>
        </Card>

        {/* รายชื่อพนักงานที่ลา */}
        <Card>
          <CardHeader>
            <CardTitle>พนักงานที่ลาวันนี้</CardTitle>
            <CardDescription>รายการพนักงานที่ลาวันนี้</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats?.todayLeaves?.length > 0 ? (
              stats.todayLeaves.map((emp, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {emp.leaveType} •{" "}
                      {emp.startDate === emp.endDate
                        ? new Date(emp.startDate).toLocaleDateString("th-TH", {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          })
                        : `ตั้งแต่ ${new Date(emp.startDate).toLocaleDateString(
                            "th-TH"
                          )} - ${new Date(emp.endDate).toLocaleDateString(
                            "th-TH"
                          )}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                ไม่มีพนักงานลาวันนี้
              </p>
            )}
          </CardContent>
        </Card>

        {/* แผนภูมิ: สถานะเข้างานวันนี้ */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะเข้างานวันนี้</CardTitle>
            <CardDescription>
              ข้อมูลสรุปพนักงานที่มาทำงาน ลา และขาดงานในวันนี้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.todayStatus}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {stats?.todayStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* แผนภูมิ: ใบลาในระบบ */}
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลรวมใบลา</CardTitle>
            <CardDescription>
              ใบลาทั้งหมดในระบบ แบ่งตามสถานะการอนุมัติ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.leaveRequests}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count">
                  {stats?.leaveRequests.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
