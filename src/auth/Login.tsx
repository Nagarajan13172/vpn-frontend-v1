"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function LoginPage() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen bg-background overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto">
        <Card className="bg-card/80 backdrop-blur-sm border-border/40">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Secure Login</CardTitle>
            <CardDescription>Enter your credentials to access your VPN dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" required className="bg-background/70" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
               
                </div>
                <Input id="password" type="password" required className="bg-background/70" />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
