"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/hooks/use-language"
import { Home, Phone, Info, HelpCircle, Map, Users, Shield, UserPlus, LogIn } from "lucide-react"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2 text-xs lg:text-sm space-y-2 lg:space-y-0">
            <div className="flex items-center">
              <span className="truncate">{t("govHeader")}</span>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4 overflow-x-auto">
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200 whitespace-nowrap">
                <Home className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{t("home")}</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200 whitespace-nowrap">
                <Phone className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{t("contactUs")}</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200 whitespace-nowrap">
                <Info className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{t("aboutUs")}</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200 whitespace-nowrap">
                <HelpCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{t("faqsHelp")}</span>
              </Link>
              <Link href="#" className="flex items-center space-x-1 hover:text-purple-200 whitespace-nowrap">
                <Map className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{t("siteMap")}</span>
              </Link>
            </div>
          </div>
          <div className="border-t border-purple-700 py-2 text-xs lg:text-sm">
            <span className="truncate">{t("govHeaderHindi")}</span>
          </div>
        </div>
      </header>

      {/* Main Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <Image
                src="/government-logo.jpg"
                alt="Government Logo"
                width={60}
                height={60}
                className="lg:w-20 lg:h-20 rounded-full"
              />
              <div className="text-center lg:text-left">
                <h1 className="text-sm lg:text-lg font-semibold text-gray-800">{t("deptHindi")}</h1>
                <div className="text-blue-600 font-bold text-xs lg:text-base">{t("deptOf")}</div>
                <div className="text-blue-800 font-bold text-xs lg:text-base">{t("adminReforms")}</div>
                <div className="text-blue-800 font-bold text-xs lg:text-base">{t("publicGrievances")}</div>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <div className="bg-blue-900 text-white px-4 py-2 lg:px-6 lg:py-3 rounded">
                <div className="text-lg lg:text-2xl font-bold">{t("cpgrams")}</div>
                <div className="text-xs lg:text-sm">{t("cpgramsDesc")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-purple-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 space-y-3 lg:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-6 overflow-x-auto">
              <Link href="#" className="hover:text-purple-200 whitespace-nowrap text-sm lg:text-base">
                {t("viewStatus")}
              </Link>
              <Link href="#" className="hover:text-purple-200 whitespace-nowrap text-sm lg:text-base">
                {t("nodalPGOfficers")}
              </Link>
              <Link href="#" className="hover:text-purple-200 whitespace-nowrap text-sm lg:text-base">
                {t("redressProcess")}
              </Link>
              <Link href="#" className="hover:text-purple-200 whitespace-nowrap text-sm lg:text-base">
                {t("grievance")}
              </Link>
              <Link href="#" className="hover:text-purple-200 whitespace-nowrap text-sm lg:text-base">
                {t("nodalAuthority")}
              </Link>
            </div>
            <div className="flex items-center justify-between lg:justify-end space-x-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-6">Welcome to CPGRAMS Portal</h1>
          <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto">
            Centralized Public Grievance Redress and Monitoring System - Your voice matters to us. Lodge your grievances
            and track their resolution in a transparent and efficient manner.
          </p>
        </div>
      </section>

      {/* Access Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Access Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* User Sign Up */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <UserPlus className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl">New User Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Create a new account to access grievance services</p>
                <Link href="/signup" className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* User Login */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Citizen Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Access your account and manage grievances</p>
                <Link href="/signin" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Admin Portal */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Admin Portal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Administrative access for authorized personnel</p>
                <Link href="/admin/signin" className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">&copy; 2024 Government of India - Ministry of Personnel, Public Grievances & Pensions</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="#" className="hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gray-300">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-gray-300">
              Contact Us
            </Link>
            <Link href="#" className="hover:text-gray-300">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
