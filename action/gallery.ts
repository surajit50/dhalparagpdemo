"use server";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export const addGalleryImage = async (
  title: string,
  description: string,
  category: string,
  cloudinaryPublicId: string,
  imageUrl: string
) => {
  try {
    const image = await db.galleryImage.create({
      data: {
        title,
        description,
        category,
        cloudinaryPublicId,
        imageUrl,
      },
    });
    revalidateTag("gallery");
    return { success: "Image uploaded successfully" };
  } catch (error) {
    console.error("Error adding gallery image:", error);
    return { error: "Failed to upload image" };
  }
};

export const getAllGalleryImages = async () => {
  try {
    const images = await db.galleryImage.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return images;
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
};

export const deleteGalleryImage = async (cloudinaryPublicId: string) => {
  try {
    // Delete from Cloudinary
    const deleteResult = await deleteFromCloudinary(cloudinaryPublicId);
    
    if (!deleteResult.success) {
      return { error: deleteResult.error || "Failed to delete image from Cloudinary" };
    }

    // Delete from database
    await db.galleryImage.delete({
      where: {
        cloudinaryPublicId,
      },
    });
    
    revalidateTag("gallery");
    return { success: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return { error: "Failed to delete image" };
  }
};

