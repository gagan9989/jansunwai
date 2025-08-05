"use client"

import Link from "next/link"
import Image from "next/image"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/hooks/use-language"
import { NotificationCenter } from "@/components/notification-center"
import { Home, Phone, Info, HelpCircle, Map } from "lucide-react"

export function Header() {
  const { t } = useLanguage()

  return (
    <>
      {/* Top Header */}
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
              <NotificationCenter userId="current-user-id" />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
