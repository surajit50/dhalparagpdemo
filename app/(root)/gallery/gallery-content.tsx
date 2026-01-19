"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Download,
  Share2,
} from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  createdAt: Date;
}

interface GalleryContentProps {
  imagesByCategory: Record<string, GalleryImage[]>;
  defaultTab: string;
}

const GALLERY_CATEGORIES: Record<string, { label: string; description: string }> = {
  development: {
    label: "Development Projects",
    description: "Progress documentation of major infrastructure and development initiatives",
  },
  events: {
    label: "Community Events",
    description: "Celebrations, meetings, and community gatherings throughout the year",
  },
  infrastructure: {
    label: "Infrastructure",
    description: "Completed infrastructure projects and public facilities",
  },
  culture: {
    label: "Cultural Heritage",
    description: "Traditional festivals, arts, and cultural activities",
  },
  officials: {
    label: "Official Events",
    description: "Government visits, inaugurations, and official ceremonies",
  },
  "daily-life": {
    label: "Daily Life",
    description: "Everyday activities and life in our villages",
  },
};

export default function GalleryContent({ imagesByCategory, defaultTab }: GalleryContentProps) {
  const renderImageGrid = (images: GalleryImage[], category: string) => {
    if (!images || images.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No images available in this category yet.</p>
          <p className="text-sm mt-2">Check back soon for updates!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Dialog key={image.id}>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer group aspect-square overflow-hidden rounded-lg">
                <Image
                  src={image.imageUrl}
                  alt={image.title || "Gallery image"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <Eye className="text-white opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity" />
                </div>
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs font-medium truncate">{image.title}</p>
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{image.title || "Gallery Image"}</DialogTitle>
                {image.description && (
                  <DialogDescription>{image.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="relative aspect-video mt-4">
                <Image
                  src={image.imageUrl}
                  alt={image.title || "Gallery image"}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = image.imageUrl;
                    link.download = image.title || "gallery-image";
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: image.title,
                        text: image.description || "Check out this image from our gallery!",
                        url: image.imageUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(image.imageUrl);
                      alert("Image URL copied to clipboard!");
                    }
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
        <TabsTrigger value="development">Development</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        <TabsTrigger value="culture">Culture</TabsTrigger>
        <TabsTrigger value="officials">Officials</TabsTrigger>
        <TabsTrigger value="daily-life">Daily Life</TabsTrigger>
      </TabsList>

      {Object.entries(GALLERY_CATEGORIES).map(([categoryKey, categoryInfo]) => {
        const images = imagesByCategory[categoryKey] || [];
        return (
          <TabsContent key={categoryKey} value={categoryKey} className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {categoryInfo.label}
              </h2>
              <p className="text-xl text-gray-600">{categoryInfo.description}</p>
              {images.length > 0 && (
                <Badge variant="secondary" className="mt-2">
                  {images.length} {images.length === 1 ? "Photo" : "Photos"}
                </Badge>
              )}
            </div>
            {renderImageGrid(images, categoryKey)}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

