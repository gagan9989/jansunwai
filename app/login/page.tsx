import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Home, Phone, Info, HelpCircle, Map, Eye } from "lucide-react"

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="flex items-center space-x-4">
              <span>भारत सरकार | कार्मिक, लोक शिकायत और पेंशन मंत्रालय</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200">
                <Phone className="w-4 h-4" />
                <span>Contact Us</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200">
                <Info className="w-4 h-4" />
                <span>About Us</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200">
                <HelpCircle className="w-4 h-4" />
                <span>FAQs/Help</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200">
                <Map className="w-4 h-4" />
                <span>Site Map</span>
              </Link>
            </div>
          </div>
          <div className="border-t border-purple-700 py-2 text-sm">
            <span>Government of India | Ministry of Personnel, Public Grievances & Pensions</span>
          </div>
        </div>
      </header>

      {/* Main Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/government-logo.jpg" alt="Government Logo" width={80} height={80} className="rounded-full" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800">प्रशासनिक सुधार और लोक शिकायत विभाग</h1>
                <div className="text-blue-600 font-bold">DEPARTMENT OF</div>
                <div className="text-blue-800 font-bold">ADMINISTRATIVE REFORMS</div>
                <div className="text-blue-800 font-bold">& PUBLIC GRIEVANCES</div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-900 text-white px-6 py-3 rounded">
                <div className="text-2xl font-bold">CPGRAMS</div>
                <div className="text-sm">Centralized Public Grievance Redress And Monitoring System</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">Login to CPGRAMS</CardTitle>
              <p className="text-gray-600">Access your grievance dashboard</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username / Email</Label>
                  <Input id="username" type="text" placeholder="Enter your username or email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type="password" placeholder="Enter your password" required />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>

                <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800">
                  Login
                </Button>
              </form>

              <div className="text-center">
                <Link href="#" className="text-sm text-blue-600 hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent">
                  Login with Aadhaar
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Login with DigiLocker
                </Button>
              </div>

              <div className="text-center text-sm">
                {"Don't have an account? "}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  Register here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
