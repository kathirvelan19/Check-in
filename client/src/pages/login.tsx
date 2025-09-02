import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { localStorage_instance } from "@/lib/storage";
import { Staff } from "@shared/schema";

interface LoginProps {
  onLogin: (staff: Staff) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [staffCode, setStaffCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!staffCode.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please enter both staff code and password",
          variant: "destructive",
        });
        return;
      }

      // Check if staff exists
      let staff = localStorage_instance.getStaffByCode(staffCode);
      
      if (staff) {
        // Existing user - verify password
        if (staff.password === password) {
          localStorage_instance.setCurrentUser(staff);
          onLogin(staff);
          toast({
            title: "Success",
            description: "Login successful!",
          });
        } else {
          toast({
            title: "Error",
            description: "Invalid password",
            variant: "destructive",
          });
        }
      } else {
        // New user - create account
        staff = {
          id: `staff_${staffCode}_${Date.now()}`,
          code: staffCode,
          password: password,
        };
        
        localStorage_instance.saveStaff(staff);
        localStorage_instance.setCurrentUser(staff);
        onLogin(staff);
        
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 px-4">
      <Card className="w-full max-w-md mx-auto border shadow-xl">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clipboard-check text-2xl text-primary-foreground"></i>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Class Attendance</h1>
            <p className="text-muted-foreground">Fast & Offline Attendance Tracking</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="staffCode" className="block text-sm font-medium text-foreground mb-2">
                Staff Code
              </Label>
              <Input
                id="staffCode"
                type="text"
                value={staffCode}
                onChange={(e) => setStaffCode(e.target.value)}
                placeholder="Enter your staff code"
                required
                data-testid="input-staff-code"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Please wait..." : "Sign In / Sign Up"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>First time? Enter a new code to create your account</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
