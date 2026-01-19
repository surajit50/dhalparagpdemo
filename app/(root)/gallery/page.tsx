import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
} from "lucide-react";
import { getAllGalleryImages } from "@/action/gallery";
import GalleryContent from "./gallery-content";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const defaultTab = params.tab || "development";
  
  const images = await getAllGalleryImages();
  
  // Group images by category
  const imagesByCategory = images.reduce((acc, image) => {
    const category = image.category || "development";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(image);
    return acc;
  }, {} as Record<string, typeof images>);

  // Calculate statistics
  const totalPhotos = images.length;
  const developmentCount = imagesByCategory.development?.length || 0;
  const eventsCount = imagesByCategory.events?.length || 0;
  const infrastructureCount = imagesByCategory.infrastructure?.length || 0;
  const cultureCount = imagesByCategory.culture?.length || 0;
  const officialsCount = imagesByCategory.officials?.length || 0;
  const dailyLifeCount = imagesByCategory["daily-life"]?.length || 0;
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Photo Gallery</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Visual journey through our community&apos;s development, events, and
            daily life
          </p>
        </div>
      </section>

      {/* Gallery Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalPhotos}</div>
              <div className="text-gray-600">Total Photos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{developmentCount}</div>
              <div className="text-gray-600">Development Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{eventsCount}</div>
              <div className="text-gray-600">Community Events</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {Object.keys(imagesByCategory).length}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input placeholder="Search photos by event, project, or location..." />
              </div>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <GalleryContent 
            imagesByCategory={imagesByCategory}
            defaultTab={defaultTab}
          />
        </div>
      </section>

      {/* Photo Submission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Share Your Photos
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Have photos of community events or development projects? Share
              them with us to be featured in our gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Upload className="mr-2 h-5 w-5" />
                Submit Photos
              </Button>
              <Button size="lg" variant="outline">
                Photo Guidelines
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Email: photos@dhalparagp.in | WhatsApp: +91 98765 43210
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Request Photos or Information
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Looking for specific photos or need high-resolution images for
            official use? Contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Call: +91 98765 43210
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-indigo-600"
            >
              Email: gallery@dhalparagp.in
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
