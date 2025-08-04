import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  RefreshCw,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Filter
} from "lucide-react";
import admintoApi from "@/src/api/adminApi";

// การกำหนดประเภทการลา
const LEAVE_TYPES = {
  VACATION: 'ลาพักร้อน',
  PERSONAL: 'ลากิจ',
  SICK: 'ลาป่วย',
  MATERNITY: 'ลาคลอด',
  UNPAID: 'ลาโดยไม่รับค่าจ้าง',
};

const STATUS_OPTIONS = {
  PENDING: 'รอดำเนินการ',
  APPROVED: 'อนุมัติ',
  REJECTED: 'ปฏิเสธ',
};

const currentYear = dayjs().year();
const availableYears = [currentYear - 1, currentYear, currentYear + 1];

function LeaveRequestPage() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedStatus, setSelectedStatus] = useState("PENDING"); // Default filter

  const [actionTarget, setActionTarget] = useState(null); // { request, action: 'APPROVE' | 'REJECT' }
  const [viewingRequest, setViewingRequest] = useState(null); // State for details dialog

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await admintoApi.getAllLeaveRequst();
      const yearFilteredData = response.data.filter(req => dayjs(req.startDate).year() === parseInt(selectedYear));
      setAllRequests(yearFilteredData);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลใบลาได้:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง");
      setAllRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  useEffect(() => {
    let requests = [...allRequests];
    if (selectedStatus !== "ALL") {
      requests = requests.filter(r => r.status === selectedStatus);
    }
    setFilteredRequests(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, [allRequests, selectedStatus]);

  const handleRefresh = () => {
    loadLeaveRequests();
  };

  const handleActionClick = (request, action) => {
    setActionTarget({ request, action });
  };

  const handleConfirmAction = async () => {
    if (!actionTarget || isUpdating) return;

    const { request, action } = actionTarget;
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    setIsUpdating(true);
    try {
      await admintoApi.updateLeaveStatus(request.id, { status: newStatus });
      setActionTarget(null);
      loadLeaveRequests(); // Reload data
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", err);
      alert("ไม่สามารถอัปเดตสถานะได้: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate stats
  const totalRequests = allRequests.length;
  const pendingRequests = allRequests.filter(r => r.status === 'PENDING').length;
  const approvedRequests = allRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedRequests = allRequests.filter(r => r.status === 'REJECTED').length;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => loadLeaveRequests()} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:px-8 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Leave Request Management
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Review and manage employee leave requests and approvals
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalRequests}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{pendingRequests}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{approvedRequests}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{rejectedRequests}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Leave Requests</h2>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredRequests.length} requests in {selectedYear}
                </Badge>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-28 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <Button 
                variant={selectedStatus === 'PENDING' ? 'default' : 'outline'} 
                onClick={() => setSelectedStatus('PENDING')}
                className={selectedStatus === 'PENDING' ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300'}
              >
                <Clock className="mr-2 h-4 w-4" />
                Pending ({pendingRequests})
              </Button>
              <Button 
                variant={selectedStatus === 'APPROVED' ? 'default' : 'outline'} 
                onClick={() => setSelectedStatus('APPROVED')}
                className={selectedStatus === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approved ({approvedRequests})
              </Button>
              <Button 
                variant={selectedStatus === 'REJECTED' ? 'default' : 'outline'} 
                onClick={() => setSelectedStatus('REJECTED')}
                className={selectedStatus === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejected ({rejectedRequests})
              </Button>
              <Button 
                variant={selectedStatus === 'ALL' ? 'default' : 'outline'} 
                onClick={() => setSelectedStatus('ALL')}
                className={selectedStatus === 'ALL' ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'}
              >
                <Filter className="mr-2 h-4 w-4" />
                All ({totalRequests})
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4 min-w-[180px]">Employee</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[120px]">Leave Type</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[200px]">Date Range</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[100px]">Days</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[150px]">Status</TableHead>
                  <TableHead className="text-center font-bold text-gray-800 min-w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading leave requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {req.user?.name?.charAt(0).toUpperCase() || 'N'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{req.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">Submitted: {dayjs(req.createdAt).format('DD/MM/YYYY')}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {LEAVE_TYPES[req.leaveType]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">
                            {dayjs(req.startDate).format('DD MMM YYYY')} - {dayjs(req.endDate).format('DD MMM YYYY')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-lg text-gray-900">{req.leaveDays}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            req.status === 'APPROVED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                              req.status === 'REJECTED' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }
                        >
                          {STATUS_OPTIONS[req.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setViewingRequest(req)}
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="mr-1 h-4 w-4" /> View
                          </Button>
                          {req.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-green-600 hover:bg-green-100 hover:text-green-700" 
                                onClick={() => handleActionClick(req, 'APPROVE')}
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:bg-red-100 hover:text-red-700" 
                                onClick={() => handleActionClick(req, 'REJECT')}
                              >
                                <XCircle className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:bg-red-100 hover:text-red-700" 
                              onClick={() => handleActionClick(req, 'REJECT')}
                            >
                              <XCircle className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No leave requests found</p>
                          <p className="text-gray-500 mt-1">No requests match the selected criteria</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* View Request Details Dialog */}
        <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Leave Request Details</DialogTitle>
              <DialogDescription className="text-gray-600">
                Request from {viewingRequest?.user?.name || 'N/A'}
              </DialogDescription>
            </DialogHeader>
            {viewingRequest && (
              <div className="flex flex-col gap-5 py-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-700">Employee</span>
                  <span className="text-right">{viewingRequest.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-700">Leave Type</span>
                  <span className="text-right">{LEAVE_TYPES[viewingRequest.leaveType]}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-700">Date Range</span>
                  <span className="text-right">{dayjs(viewingRequest.startDate).format('DD MMM YYYY')} - {dayjs(viewingRequest.endDate).format('DD MMM YYYY')}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-700">Total Days</span>
                  <span className="text-right font-bold">{viewingRequest.leaveDays} days</span>
                </div>
                <div className="flex flex-col items-start space-y-2">
                  <span className="font-semibold text-gray-700">Reason</span>
                  <p className="w-full text-left p-3 bg-gray-50 rounded-md border">{viewingRequest.reason}</p>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-700">Status</span>
                  <Badge
                    className={
                      viewingRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        viewingRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }
                  >
                    {STATUS_OPTIONS[viewingRequest.status]}
                  </Badge>
                </div>
                {viewingRequest.remark && (
                  <div className="flex flex-col items-start space-y-2">
                    <span className="font-semibold text-gray-700">Manager Remarks</span>
                    <p className="w-full text-left p-3 bg-red-50 text-red-700 rounded-md border border-red-200">{viewingRequest.remark}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Confirm {actionTarget?.action === 'APPROVE' ? 'Approval' : 'Rejection'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to {actionTarget?.action === 'APPROVE' ? 'approve' : 'reject'} the leave request from <strong>{actionTarget?.request?.user?.name || 'N/A'}</strong>?
                <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                  <div className="text-sm text-gray-700">
                    <div><strong>Type:</strong> {LEAVE_TYPES[actionTarget?.request?.leaveType]}</div>
                    <div><strong>Period:</strong> {dayjs(actionTarget?.request?.startDate).format('DD/MM/YY')} - {dayjs(actionTarget?.request?.endDate).format('DD/MM/YY')} ({actionTarget?.request?.leaveDays} days)</div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                disabled={isUpdating}
                className={actionTarget?.action === 'REJECT' ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm ${actionTarget?.action === 'APPROVE' ? 'Approval' : 'Rejection'}`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default LeaveRequestPage;