import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { base_path } from '@/api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { setCookie } from 'typescript-cookie';

const VpnLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    mutation.mutate(formData)
  };

  const mutation = useMutation({
    mutationFn: async (formData: { username: string, password: string }) => {
      const response = await fetch(`${base_path}/api/users/login`, {
        method: 'POST',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      return response.json();
    },
    onError: (error) => {
      setLoading(false);
      toast.error(`Login failed: ${error.message}`);
    },
    onSuccess: (data) => {
      setLoading(false);
      toast.success('Login successful!');
      setCookie('authToken', data.access_token, {
        path: '/',
        domain: window.location.hostname,
      });
      navigate('/');
      console.log(data);
    }
  })

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center animate-float">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-foreground">SecureVPN</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enter your credentials to access your secure connection
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-12 border-border/50 focus:border-vpn-primary transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 pr-12 border-border/50 focus:border-vpn-primary transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border/50 text-vpn-primary focus:ring-vpn-primary"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a href="#" className="text-vpn-primary hover:text-vpn-secondary transition-colors">
              Forgot password?
            </a>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full text-base"
            disabled={loading}
          >
            <Lock className="w-5 h-5" />
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="#" className="text-vpn-primary hover:text-vpn-secondary transition-colors font-medium">
              Sign up now
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VpnLoginForm;