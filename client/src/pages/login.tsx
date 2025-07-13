import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, LogIn, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle successful login with animation
  useEffect(() => {
    if (isAuthenticated && !shouldRedirect) {
      setShouldRedirect(true);
      
      // Add fade out animation
      const card = document.querySelector('.login-card');
      if (card) {
        card.classList.add('animate-fade-out');
      }
      
      // Redirect to dashboard after animation using React Router
      setTimeout(() => {
        setLocation("/dashboard");
      }, 600);
    }
  }, [isAuthenticated, shouldRedirect, setLocation]);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoggingIn(true);
      await login(data.email, data.password);
    } catch (error) {
      setIsLoggingIn(false);
      // Error handling is done in AuthContext
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-700 ease-in-out ${
      shouldRedirect 
        ? 'bg-gradient-to-br from-green-50 to-white animate-fade-out' 
        : 'bg-gradient-red-subtle'
    }`}>
      <Card className={`login-card w-full max-w-md shadow-xl transition-all duration-500 ease-in-out ${
        shouldRedirect 
          ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' 
          : 'border-secondary-red-medium bg-white'
      }`}>
        <CardHeader className="text-center pb-6">
          {/* Company Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="https://intek.co.id/wp-content/uploads/Logo-Intek-RED-logogram-300x203.png" 
              alt="PT Intek Solusi Indonesia Logo" 
              className="h-16 object-contain"
            />
          </div>
          
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
            shouldRedirect 
              ? 'bg-gradient-to-br from-green-500 to-green-600 scale-110 rotate-12' 
              : 'bg-gradient-to-br from-primary-red to-red-600'
          }`}>
            {shouldRedirect ? (
              <CheckCircle className="w-8 h-8 text-white transition-all duration-500 scale-110" />
            ) : (
              <LogIn className="w-8 h-8 text-white transition-all duration-500" />
            )}
          </div>
          <CardTitle className={`text-2xl font-bold transition-all duration-500 ${
            shouldRedirect ? 'text-green-800 scale-105' : 'text-red-800'
          }`}>
            {shouldRedirect ? 'Login Berhasil!' : 'Selamat Datang'}
          </CardTitle>
          <p className={`mt-2 transition-all duration-500 ${
            shouldRedirect ? 'text-green-600 opacity-0' : 'text-red-600'
          }`}>
            {shouldRedirect ? 'Mengarahkan ke dashboard...' : 'Silakan login untuk melanjutkan'}
          </p>
        </CardHeader>
        
        <CardContent className={`transition-all duration-500 ${shouldRedirect ? 'opacity-0 pointer-events-none' : ''}`}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                                     <FormItem>
                     <FormLabel className="text-primary-red-dark font-medium">Email</FormLabel>
                     <FormControl>
                       <Input
                         {...field}
                         type="email"
                         placeholder="Masukkan email Anda"
                         className="border-secondary-red-medium focus:border-primary-red focus:ring-primary-red/20"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                                     <FormItem>
                     <FormLabel className="text-primary-red-dark font-medium">Password</FormLabel>
                     <FormControl>
                       <div className="relative">
                         <Input
                           {...field}
                           type={showPassword ? "text" : "password"}
                           placeholder="Masukkan password Anda"
                           className="border-secondary-red-medium focus:border-primary-red focus:ring-primary-red/20 pr-10"
                         />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                             <Button
                 type="submit"
                 className={`w-full bg-gradient-red hover:bg-primary-red-dark text-white transition-all duration-300 ${isLoggingIn ? 'scale-95' : ''} shadow-md hover:shadow-lg`}
                 disabled={isLoggingIn}
               >
                {isLoggingIn ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="animate-pulse">Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className={`mt-6 text-center transition-all duration-500 ${shouldRedirect ? 'opacity-0' : ''}`}>
            <p className="text-sm text-gray-600">
              Demo Account:
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Email: ahmad.sutrisno@intek.co.id
            </p>
            <p className="text-xs text-gray-500">
              Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 