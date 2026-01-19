"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

type Designation = "All" | "Prodhan" | "Staff" | "Casual";

const teamMembers = [
  {
    name: "Rajesh Kumar",
    position: "Prodhan (Gram Pradhan)",
    category: "Prodhan",
    phone: "9999999999",
  },
  {
    name: "Bithika Ghosh",
    position: "Prodhan",
    category: "Prodhan",
    phone: "99999999999",
  },
  {
    name: "Mostafijul Mondal",
    position: "Up-Pradhan",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Bappa Laha",
    position: "Nirman Sahayak",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Basanti Hembram",
    position: "Executive Assistant",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Arpan Sarkar",
    position: "Sahayak",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Bablu Oraw",
    position: "GP Karmee",
    category: "Staff",
    phone: "999999999",
  },
  {
    name: "Asraful Mondal",
    position: "VLE",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Bikram Mandal",
    position: "GRS",
    category: "Staff",
    phone: "9999999999",
  },
  {
    name: "Biswajit Ghosh",
    position: "Casual Staff",
    category: "Casual",
    phone: "-",
  },
  {
    name: "Surajit Shil",
    position: "Casual Staff",
    category: "Casual",
    phone: "-",
  },
  {
    name: "Swapan Mahata",
    position: "Casual Staff",
    category: "Casual",
    phone: "-",
  },
];

export default function Team() {
  const [filter, setFilter] = useState<Designation>("All");

  const filteredMembers =
    filter === "All"
      ? teamMembers
      : teamMembers.filter((m) => m.category === filter);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Our Team</h1>
        <p className="text-muted-foreground">
          Officials and staff of Dhalpara Gram Panchayat
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["All", "Prodhan", "Staff", "Casual"] as Designation[]).map(
          (item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          )
        )}
      </div>

      {/* Team Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member, index) => (
          <Card
            key={index}
            className="hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarImage src="/icons/avatar.png" />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription className="text-primary font-medium">
                  {member.position}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>
                  {member.phone !== "-" ? member.phone : "Not Available"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Join Section */}
      <Card className="mt-12 bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Join Our Team
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground max-w-xl mx-auto">
            Contact the Gram Panchayat office for volunteer opportunities,
            recruitment details, or election-related information.
          </p>
          <a
            href="/contact"
            className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Contact Us
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
