import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: employee, isLoading } = useQuery({
    queryKey: ["/api/employee", 1],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Kelola informasi personal Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-red rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {employee ? getInitials(employee.name) : "AS"}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {employee?.name || "Ahmad Sutrisno"}
              </h2>
              <p className="text-gray-600">{employee?.position || "IT Developer"}</p>
              <p className="text-gray-500">{employee?.employeeId || "EMP-2024-001"}</p>
              <div className="flex items-center mt-2">
                <Badge className="bg-green-100 text-success-green">
                  {employee?.status === "active" ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </div>
            <Button className="bg-primary-red hover:bg-red-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information & Job Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input 
                id="fullName"
                value={employee?.name || "Ahmad Sutrisno"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={employee?.email || "ahmad.sutrisno@intek.co.id"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="phone">No. Telepon</Label>
              <Input 
                id="phone"
                type="tel" 
                value={employee?.phone || "+62 812-3456-7890"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea 
                id="address"
                rows={3} 
                value={employee?.address || "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220"} 
                readOnly 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="employeeId">ID Karyawan</Label>
              <Input 
                id="employeeId"
                value={employee?.employeeId || "EMP-2024-001"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="position">Posisi</Label>
              <Input 
                id="position"
                value={employee?.position || "IT Developer"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="department">Departemen</Label>
              <Input 
                id="department"
                value={employee?.department || "Information Technology"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="joinDate">Tanggal Bergabung</Label>
              <Input 
                id="joinDate"
                value={employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('id-ID') : "1 Maret 2023"} 
                readOnly 
              />
            </div>
            <div>
              <Label htmlFor="manager">Manager</Label>
              <Input 
                id="manager"
                value={employee?.manager || "Budi Setiawan"} 
                readOnly 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifikasi Email</h4>
              <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Reminder Check Out</h4>
              <p className="text-sm text-gray-500">Ingatkan untuk check out</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
