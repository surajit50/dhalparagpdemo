"use client";

import React, { useEffect, useState } from "react";
import { getAllGalleryImages, deleteGalleryImage } from "@/action/gallery";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GALLERY_CATEGORIES: Record<string, string> = {
  development: "Development Projects",
  events: "Community Events",
  infrastructure: "Infrastructure",
  culture: "Cultural Heritage",
  officials: "Official Events",
  "daily-life": "Daily Life",
};

const GalleryImageList = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const data = await getAllGalleryImages();
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (cloudinaryPublicId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const result = await deleteGalleryImage(cloudinaryPublicId);
      if (result?.success) {
        await fetchImages();
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading images...</div>;
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No gallery images found. Upload your first image above.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={image.imageUrl}
              alt={image.title || "Gallery image"}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{image.title}</CardTitle>
                <CardDescription className="mt-1">
                  {image.description || "No description"}
                </CardDescription>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                {GALLERY_CATEGORIES[image.category] || image.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => handleDelete(image.cloudinaryPublicId)}
            >
              <MdDelete className="mr-2" size={16} />
              Delete
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GalleryImageList;

