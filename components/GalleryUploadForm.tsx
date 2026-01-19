"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { galleryImageSchema } from "@/schema";
import Image from "next/image";
import { deleteGalleryImage, addGalleryImage } from "@/action/gallery";
import { MdDelete, MdCloudUpload } from "react-icons/md";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const GALLERY_CATEGORIES = [
  { value: "development", label: "Development Projects" },
  { value: "events", label: "Community Events" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "culture", label: "Cultural Heritage" },
  { value: "officials", label: "Official Events" },
  { value: "daily-life", label: "Daily Life" },
];

const GalleryUploadForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof galleryImageSchema>>({
    resolver: zodResolver(galleryImageSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setUploading(false);
        return;
      }

      if (data.success) {
        setImageUrl(data.url);
        setCloudinaryPublicId(data.publicId);
        setSuccess("Image uploaded successfully");
      }
    } catch (error) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!cloudinaryPublicId) return;
    try {
      const res = await deleteGalleryImage(cloudinaryPublicId);
      if (res?.success) {
        setImageUrl("");
        setCloudinaryPublicId("");
        setSuccess("Image successfully removed");
      } else {
        setError(res?.error || "Failed to remove image");
      }
    } catch (error) {
      setError("Failed to remove image");
    }
  };

  const onSubmit = async (values: z.infer<typeof galleryImageSchema>) => {
    if (!imageUrl || !cloudinaryPublicId) {
      setError("Please upload an image first");
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    const { title, description, category } = values;
    
    startTransition(() => {
      addGalleryImage(title, description || "", category, cloudinaryPublicId, imageUrl)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
            setImageUrl("");
            setCloudinaryPublicId("");
          }
          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            setImageUrl("");
            setCloudinaryPublicId("");
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {success && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter image title"
                    type="text"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter image description"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GALLERY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full">
              <label htmlFor="gallery-image-upload" className="cursor-pointer">
                <input
                  id="gallery-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || isPending}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading || isPending}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <MdCloudUpload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !imageUrl || uploading}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Image"
              )}
            </Button>
          </div>
        </form>
      </Form>
      {imageUrl && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          <div className="relative aspect-video">
            <Image
              src={imageUrl}
              alt="Uploaded image"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <Button
            onClick={handleRemove}
            variant="destructive"
            className="mt-2 w-full"
          >
            <MdDelete className="mr-2" size={20} />
            Remove Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default GalleryUploadForm;

