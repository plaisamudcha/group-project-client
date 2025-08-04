import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Eye, Search, Calendar, User, Database, Filter, RefreshCw, AlertCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import admintoApi from "@/src/api/adminApi";

dayjs.extend(relativeTime);

function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('ALL')
  const [filterTable, setFilterTable] = useState('ALL')
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  })

  const isToday = (date) => {
    return dayjs(date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  }

  const getOperationType = (log) => {
    if (log.relatedId && log.relatedId !== 0) {
      return `Record #${log.relatedId}`
    }
    return 'System Operation'
  }

  const truncateText = (text, maxLength = 20) => {
    if (!text) return 'N/A'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getTableDisplayName = (table) => {
    const tableNames = {
      'AnnualLeaveEntitlement': 'Annual Leave',
      'workPolicy': 'Work Policy',
      'LeaveRequest': 'Leave Request',
      'User': 'User Account',
      'Holiday': 'Holiday',
      'shift': 'Work Shift',
      'EmployeeProfile': 'Employee Profile'
    }
    return tableNames[table] || table
  }

  // Helper function to get user display name
  const getUserDisplayName = (log) => {
    if (log.user && log.user.name) {
      return log.user.name
    }
    return `User ${log.userId || 'Unknown'}`
  }

  // Helper function to get user initials for avatar
  const getUserInitials = (log) => {
    if (log.user && log.user.name) {
      const nameParts = log.user.name.split(' ')
      if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
      }
      return nameParts[0].charAt(0).toUpperCase()
    }
    return log.userId ? log.userId.toString().charAt(0) : 'U'
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [auditLogs, searchTerm, filterAction, filterTable, dateRange])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await admintoApi.fetchAuditLogs()
      
      let logs = []
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          logs = response.data
        } else if (response.data.auditLog && Array.isArray(response.data.auditLog)) {
          logs = response.data.auditLog
        } else if (response.data.auditLogs && Array.isArray(response.data.auditLogs)) {
          logs = response.data.auditLogs
        }
      }
      
      if (Array.isArray(logs) && logs.length > 0) {
        const sortedLogs = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setAuditLogs(sortedLogs)
      } else {
        setAuditLogs([])
      }
      
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (!Array.isArray(auditLogs)) {
      setFilteredLogs([])
      return
    }

    let filtered = [...auditLogs]

    if (searchTerm) {
      filtered = filtered.filter(log => 
        (log.detail && log.detail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.relatedTable && log.relatedTable.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.userId && log.userId.toString().includes(searchTerm)) ||
        (log.user && log.user.name && log.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (filterAction !== 'ALL') {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (filterTable !== 'ALL') {
      filtered = filtered.filter(log => log.relatedTable === filterTable)
    }

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(log => {
        if (!log.createdAt) return false
        const logDate = dayjs(log.createdAt).format('YYYY-MM-DD')
        return logDate >= dateRange.startDate && logDate <= dateRange.endDate
      })
    }

    setFilteredLogs(filtered)
  }

  const handleViewDetail = (log) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'bg-green-100 text-green-800 border-green-200',
      'UPDATE': 'bg-blue-100 text-blue-800 border-blue-200',
      'DELETE': 'bg-red-100 text-red-800 border-red-200',
      'APPROVE': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'REJECT': 'bg-orange-100 text-orange-800 border-orange-200',
      'LOGIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'LOGOUT': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTableIcon = (table) => {
    const icons = {
      'AnnualLeaveEntitlement': '📋',
      'workPolicy': '📝',
      'LeaveRequest': '🏖️',
      'User': '👤',
      'Holiday': '🎉',
      'shift': '⏰',
      'EmployeeProfile': '👤'
    }
    return icons[table] || '📄'
  }

  const uniqueActions = Array.isArray(auditLogs) ? [...new Set(auditLogs.map(log => log.action).filter(Boolean))] : []
  const uniqueTables = Array.isArray(auditLogs) ? [...new Set(auditLogs.map(log => log.relatedTable).filter(Boolean))] : []
  const uniqueUsers = Array.isArray(auditLogs) ? [...new Set(auditLogs.map(log => log.userId).filter(Boolean))] : []

  const resetFilters = () => {
    setSearchTerm('')
    setFilterAction('ALL')
    setFilterTable('ALL')
    setDateRange({
      startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-4 md:px-8 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Audit Log
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Track all system activities and user actions for security and compliance
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Logs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredLogs.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Today's Activities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {Array.isArray(filteredLogs) ? filteredLogs.filter(log => log.createdAt && isToday(log.createdAt)).length : 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueUsers.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tables Affected</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueTables.length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* Toolbar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {filteredLogs.length} records
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={fetchAuditLogs}
                    disabled={loading}
                    className="hover:bg-blue-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetFilters}
                    className="hover:bg-gray-100"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ALL">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>

                <select
                  value={filterTable}
                  onChange={(e) => setFilterTable(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ALL">All Tables</option>
                  {uniqueTables.map(table => (
                    <option key={table} value={table}>{getTableDisplayName(table)}</option>
                  ))}
                </select>

                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                  <TableHead className="font-bold text-gray-800 py-4">Timestamp</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Action</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Table</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Target</TableHead>
                  <TableHead className="font-bold text-gray-800">User</TableHead>
                  <TableHead className="text-center font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading audit logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(filteredLogs) && filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <TableRow key={log.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">
                            {log.createdAt ? dayjs(log.createdAt).format('MMM DD, YYYY') : 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.createdAt ? dayjs(log.createdAt).format('HH:mm:ss') : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-xs ${getActionColor(log.action)}`}>
                          {log.action || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg">{getTableIcon(log.relatedTable)}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {truncateText(getTableDisplayName(log.relatedTable), 12)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          {truncateText(getOperationType(log), 10)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">
                              {getUserInitials(log)}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-medium text-gray-900 text-sm truncate">
                              {getUserDisplayName(log)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {log.userId || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetail(log)}
                          className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="text-xs">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Activity className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No audit logs found</p>
                          <p className="text-gray-500 mt-1">
                            {auditLogs.length > 0 
                              ? "Try adjusting your filters" 
                              : "No data available"
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Simple Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Audit Log Details
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Operation details for Log #{selectedLog?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedLog && (
              <div className="py-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Detail:</h3>
                  <p className="text-gray-800 leading-relaxed">
                    {selectedLog.detail || 'No detailed description available for this operation.'}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                onClick={() => setDetailDialogOpen(false)}
                className="px-6 py-2"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AuditLogPage;