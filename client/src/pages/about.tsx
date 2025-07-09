import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Target, Lightbulb, Users, Award, Shield } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Pengalaman", value: "5+", suffix: "Tahun", icon: Award },
    { label: "Produk", value: "18+", suffix: "Solusi", icon: Lightbulb },
    { label: "Partner Langsung", value: "5+", suffix: "Perusahaan", icon: Users },
    { label: "Dukungan", value: "60%", suffix: "Coverage", icon: Shield }
  ];

  const missions = [
    "Menyediakan produk yang dapat menghasilkan solusi terbaik di bidang Teknologi Informasi dan Peralatan Intelligence",
    "Melakukan riset & pengembangan berkelanjutan dalam menghasilkan produk terbaik buatan anak bangsa",
    "Terus mengikuti perkembangan teknologi intelligence di berbagai negara"
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-red-50 to-white p-6 rounded-xl border border-red-100">
        <h1 className="text-2xl font-bold text-red-800 flex items-center">
          <div className="w-3 h-8 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-4"></div>
          Tentang PT Intek Solusi Indonesia
        </h1>
        <p className="text-red-600 ml-7">Sistem Solusi Cerdas dan Terintegrasi Untuk Keamanan Anda</p>
      </div>

      {/* Hero Section */}
      <Card className="mb-8 border-red-100 shadow-lg bg-gradient-to-br from-white to-red-50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-red to-red-700 rounded-full mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-red-800 mb-4">
              Intelligent and Integrated System Solution
            </h2>
            <p className="text-xl text-red-600 mb-6">
              For Your Safety and Security
            </p>
            <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed">
              <p className="text-lg">
                PT Solusi Intek Indonesia adalah perusahaan berbasis Indonesia yang bertujuan menjadi 
                perusahaan partner terbaik yang menyediakan dukungan tugas operasi intelligence untuk 
                implementasi informasi keamanan real-time dalam menjaga stabilitas dan keamanan 
                Republik Indonesia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift border-red-100 hover:border-red-200">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mb-4">
                  <Icon className="w-6 h-6 text-primary-red" />
                </div>
                <div className="text-3xl font-bold text-red-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-red-600 font-medium mb-1">
                  {stat.suffix}
                </div>
                <div className="text-xs text-gray-600">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Vision */}
        <Card className="border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-red-800 flex items-center">
                <Target className="w-6 h-6 mr-2 text-primary-red" />
                Visi Perusahaan
              </h3>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-transparent p-4 rounded-lg border-l-4 border-primary-red">
              <p className="text-gray-700 leading-relaxed">
                Menjadi perusahaan partner terbaik yang menyediakan dukungan tugas operasi intelligence 
                untuk implementasi informasi keamanan real-time dalam menjaga stabilitas dan keamanan 
                Republik Indonesia.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mission */}
        <Card className="border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-3"></div>
              <h3 className="text-xl font-bold text-red-800 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-primary-red" />
                Misi Perusahaan
              </h3>
            </div>
            <div className="space-y-3">
              {missions.map((mission, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-primary-red rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700 leading-relaxed text-sm">{mission}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <Card className="border-red-100 hover:border-red-200 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-primary-red to-red-600 rounded-full mr-3"></div>
            <h3 className="text-xl font-bold text-red-800">Nilai-Nilai Perusahaan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-red-800 mb-2">Keamanan</h4>
              <p className="text-sm text-gray-600">Mengutamakan keamanan dan stabilitas dalam setiap solusi</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-red-800 mb-2">Inovasi</h4>
              <p className="text-sm text-gray-600">Terus berinovasi mengikuti perkembangan teknologi</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-red to-red-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-red-800 mb-2">Kualitas</h4>
              <p className="text-sm text-gray-600">Menghasilkan produk berkualitas tinggi buatan anak bangsa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Badge */}
      <div className="mt-8 text-center">
        <Badge className="bg-gradient-to-r from-primary-red to-red-600 text-white px-6 py-2 text-sm">
          PT Intek Solusi Indonesia - Trusted Security Partner
        </Badge>
      </div>
    </div>
  );
}