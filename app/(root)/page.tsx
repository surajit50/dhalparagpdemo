import HousingListButton from "@/components/HousingListButton";
import HeroSection from "@/components/hero-section";
import AdminMarquee from "@/components/AdminMarquee";
import PayPropertyTaxButton from "@/components/PayPropertyTaxButton";
import { db } from "@/lib/db";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import LatestNewsUpdate from "@/components/latest-news-update";
import { AdUnit } from "@/components/adsense-provider";

type AdminMessage = {
  id: string;
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header Section */}

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto relative z-10">
          <HeroSection />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <PayPropertyTaxButton />
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <HousingListButton />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Serving our community with dedication and transparency
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "15,247", label: "Total Population", color: "blue" },
              { value: "12", label: "Villages Covered", color: "green" },
              { value: "₹2.5Cr", label: "Annual Budget", color: "purple" },
              { value: "45+", label: "Development Projects", color: "orange" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div
                    className={`text-3xl font-bold text-${stat.color}-600 mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Message from Prodhan */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8">
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  Message from the Prodhan
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Leadership committed to community development
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                      <Image
                        src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
                        alt="Prodhan Photo"
                        width={140}
                        height={140}
                        className="rounded-full border-4 border-white shadow-lg relative z-10"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <blockquote className="text-lg text-slate-700 mb-6 italic leading-relaxed">
                      &quot;Welcome to Dhalpara Gram Panchayat. We are committed
                      to serving our community and working towards sustainable
                      development. Our goal is to improve the quality of life
                      for all residents through transparent governance,
                      inclusive growth, and community-driven initiatives.&quot;
                    </blockquote>
                    <div className="border-t border-slate-200 pt-6">
                      <p className="font-bold text-slate-900 text-lg">
                        Smt. Bithika Ghosh
                      </p>
                      <p className="text-slate-600 mb-2">
                        Prodhan, Dhalpara Gram Panchayat
                      </p>
                      <p className="text-sm text-slate-500 bg-slate-100 rounded-lg px-3 py-1 inline-block">
                        Elected: 2023 | Experience: 8 years in local governance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Our Services
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Comprehensive services designed to meet the diverse needs of our
              community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Birth & Death Certificates",
                icon: <Users className="h-5 w-5" />,
                description:
                  "Quick and efficient processing of birth and death certificates with online tracking facility.",
                color: "blue",
              },
              {
                title: "Property Tax Services",
                icon: <MapPin className="h-5 w-5" />,
                description:
                  "Online property tax payment, assessment, and grievance redressal services.",
                color: "green",
              },
              {
                title: "Welfare Schemes",
                icon: <Calendar className="h-5 w-5" />,
                description:
                  "Information and application process for various government welfare schemes and benefits.",
                color: "purple",
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <CardHeader>
                  <div
                    className={`p-3 bg-${service.color}-100 rounded-xl w-fit mb-4 group-hover:bg-${service.color}-200 transition-colors`}
                  >
                    <div className={`text-${service.color}-600`}>
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <Button
                    variant="ghost"
                    className={`p-0 text-${service.color}-600 hover:text-${service.color}-700 hover:bg-transparent`}
                  >
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent News & Updates */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              Latest News & Updates
            </h3>
            <p className="text-lg text-slate-600">
              Stay informed about recent developments and announcements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                badge: "Development",
                title: "New Water Supply Project Launched",
                date: "January 15, 2025",
                description:
                  "A comprehensive water supply project covering 8 villages has been initiated with a budget of ₹50 lakhs.",
                color: "blue",
              },
              {
                badge: "Meeting",
                title: "Monthly Gram Sabha Meeting",
                date: "January 20, 2025",
                description:
                  "Next Gram Sabha meeting scheduled to discuss budget allocation and ongoing development projects.",
                color: "green",
              },
              {
                badge: "Scheme",
                title: "PM Awas Yojana Applications",
                date: "January 10, 2025",
                description:
                  "New round of applications for PM Awas Yojana housing scheme now open for eligible beneficiaries.",
                color: "purple",
              },
            ].map((news, index) => (
              <Card
                key={index}
                className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader>
                  <Badge
                    className={`w-fit mb-3 bg-${news.color}-100 text-${news.color}-800 hover:bg-${news.color}-100 border-0`}
                  >
                    {news.badge}
                  </Badge>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {news.title}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {news.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{news.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Latest News Update Component */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <LatestNewsUpdate />
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-lg">
                    Dhalpara Gram Panchayat Office, Dhalpara, West Bengal -
                    733126
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-lg">+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 bg-white/20 rounded-lg mr-4">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-lg">info@dhalparagp.in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">Office Hours</h3>
              <div className="bg-white/10 rounded-xl p-6">
                <div className="space-y-3 text-lg">
                  <p>
                    <strong>Monday - Friday:</strong> 10:00 AM - 5:00 PM
                  </p>
                  <p>
                    <strong>Saturday:</strong> 10:00 AM - 2:00 PM
                  </p>
                  <p>
                    <strong>Sunday:</strong> Closed
                  </p>
                  <p className="text-blue-100 text-sm mt-4 bg-white/10 rounded-lg p-3">
                    Emergency services available 24/7
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Unit */}
          <div className="mt-12 bg-white/10 rounded-xl p-6">
            <AdUnit
              slot="8324866123"
              format="auto"
              responsive={true}
              style={{ minHeight: "250px" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
