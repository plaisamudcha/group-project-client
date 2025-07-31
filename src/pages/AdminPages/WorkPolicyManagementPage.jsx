import { SearchForm } from "@/components/search-form.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import workPolicyToApi from "@/src/api/workPolicyApi.js";
import { useEffect, useState } from "react";


function WorkPolicyManagementPage() {
  const [policies, setPolicies] = useState({})

  const fetchPolicies = async () => {
    try {
      const response = await workPolicyToApi.fetchPolicies()
      setPolicies(response.data) 
      return response
    } catch (error) {
      console.error("Error fetching policies:", error)
    }
  }

  useEffect(() => {
    fetchPolicies().then(res => console.log(res.data))
  }, [])

  return (
    <div className="p-4 md:px-24">
      <p className="text-4xl font-bold mt-8">Work Policies</p>
      <p className="my-4 font-semibold text-black/50">Manage company policies related to employment, conduct, and operations.</p>
      <SearchForm autoComplete="off" placeholder="Search Work Policies" />
      <p className="text-xl font-bold my-4">Policies</p>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead >Policy Name</TableHead>
              <TableHead >Start Time</TableHead>
              <TableHead >End Time</TableHead>
              <TableHead >Allowed Late <span className="text-xs text-black/40 hidden md:inline">minute/month</span></TableHead>
              <TableHead >Deduct Late</TableHead>
              <TableHead >Half Day <span className="text-xs text-black/40 hidden md:inline">minute/month</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Values</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
export default WorkPolicyManagementPage;
