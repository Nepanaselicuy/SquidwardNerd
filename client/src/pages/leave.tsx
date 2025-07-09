import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Thermometer, AlertTriangle, Watch, NotebookPen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const leaveRequestSchema = z.object({
  type: z.string().min(1, "Pilih jenis izin/cuti"),
  startDate: z.string().min(1, "Pilih tanggal mulai"),
  endDate: z.string().min(1, "Pilih tanggal selesai"),
  duration: z.string().min(1, "Pilih durasi"),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
});

export default function Leave() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ["/api/employee", 1],
  });

  const { data: leaveRequests, isLoading: leaveLoading } = useQuery({
    queryKey: ["/api/leave", 1],
  });

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      type: "",
      startDate: "",
      endDate: "",
      duration: "full",
      reason: "",
    },
  });

  const submitLeaveMutation = useMutation({
    mutationFn: (data: z.infer<typeof leaveRequestSchema>) => 
      apiRequest("POST", "/api/leave", { 
        ...data, 
        employeeId: 1,
        status: "pending"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave"] });
      form.reset();
      toast({
        title: "Pengajuan Berhasil",
        description: "Pengajuan izin/cuti Anda telah dikirim untuk review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Pengajuan Gagal",
        description: error.message || "Terjadi kesalahan saat mengajukan izin/cuti.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof leaveRequestSchema>) => {
    submitLeaveMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-success-green">Disetujui</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-600">Ditolak</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-600">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: "Cuti Tahunan",
      sick: "Cuti Sakit",
      personal: "Izin Pribadi",
      emergency: "Izin Mendadak",
    };
    return types[type] || type;
  };

  if (employeeLoading || leaveLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
        <h1 className="text-2xl font-bold text-red-800 flex items-center">
          <div className="w-3 h-8 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-4"></div>
          Izin & Cuti
        </h1>
        <p className="text-red-600 ml-7">Kelola pengajuan izin dan cuti Anda</p>
      </div>

      {/* Leave Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <Calendar className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Cuti Tahunan</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {employee?.annualLeaveBalance || 0}/12
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <Thermometer className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Cuti Sakit</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {employee?.sickLeaveBalance || 0}/12
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <AlertTriangle className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Izin Mendadak</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {employee?.emergencyLeaveBalance || 0}/6
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift border-red-100 hover:border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-md">
                <Watch className="text-primary-red w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-600">Izin Pribadi</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {employee?.personalLeaveBalance || 0}/12
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Request Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ajukan Izin/Cuti Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Izin/Cuti</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis izin/cuti" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="annual">Cuti Tahunan</SelectItem>
                          <SelectItem value="sick">Cuti Sakit</SelectItem>
                          <SelectItem value="personal">Izin Pribadi</SelectItem>
                          <SelectItem value="emergency">Izin Mendadak</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full">Seharian</SelectItem>
                          <SelectItem value="half">Setengah hari</SelectItem>
                          <SelectItem value="hours">Per jam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Jelaskan alasan pengajuan izin/cuti Anda"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitLeaveMutation.isPending}
                  className="bg-primary-red hover:bg-red-700"
                >
                  <NotebookPen className="w-4 h-4 mr-2" />
                  Ajukan Permohonan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Ajuan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alasan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests?.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(request.submittedAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLeaveTypeLabel(request.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.startDate).toLocaleDateString('id-ID')} - {new Date(request.endDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                  </tr>
                ))}
                
                {(!leaveRequests || leaveRequests.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Belum ada pengajuan izin/cuti
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
