import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import { X, Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

export default function Page() {
  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
          <section>
            <h1 className="mb-3 text-center text-2xl font-bold">
              Welcome to KOYA
            </h1>
            <p className="text-center text-muted-foreground">
              The only dedicated social media platform where food enthusiasts
              connect, share, and discover.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">
              What you can do on KOYA
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <strong>Share Your Experiences:</strong> Post reviews and photos
                of your favorite restaurants.
              </li>
              <li>
                <strong>Discover:</strong> Find trending restaurants and new
                food spots.
              </li>
              <li>
                <strong>Connect:</strong> Follow fellow food enthusiasts and
                explore their recommendations.
              </li>
              <li>
                <strong>Organize:</strong> Bookmark posts and reviews to save
                for later.
              </li>
              <li>
                <strong>Search:</strong> Easily find restaurants and reviews.
              </li>
              <li>
                <strong>Join the Community:</strong> Connect with a diverse
                group of food lovers.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              We believe that food brings people together. Our Mission is to
              build an active community where food lovers can share their
              passion, discover incredible culinary experiences and connect with
              others over their mutual love for food.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">Connect with US</h2>
            <p className="mb-4 text-muted-foreground">
              Follow us on Social media for the latest information related to
              KOYA and Food.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="https://x.com/KoyaAppOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 transition-colors hover:bg-accent"
              >
                <X className="h-5 w-5" />
                <span>X</span>
              </Link>
              <Link
                href="https://www.instagram.com/koya_app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 transition-colors hover:bg-accent"
              >
                <Instagram className="h-5 w-5" />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://www.facebook.com/share/179czLWCBZ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 transition-colors hover:bg-accent"
              >
                <Facebook className="h-5 w-5" />
                <span>Facebook</span>
              </Link>
            </div>
          </section>
        </div>
        <div className="rounded-2xl bg-card p-5 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Koya. All rights reserved.
          </p>
        </div>
      </div>
      <TrendsSidebar />
    </main>
  );
}
