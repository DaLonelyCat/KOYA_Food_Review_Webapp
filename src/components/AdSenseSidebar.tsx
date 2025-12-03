import AdSense from "./AdSense";

/**
 * AdSense Sidebar Component
 * 
 * IMPORTANT: Replace "your-ad-slot-id-1" and "your-ad-slot-id-2" with your actual
 * Google AdSense ad unit slot IDs. You can find these in your Google AdSense dashboard
 * after creating ad units.
 * 
 * To get your ad slot IDs:
 * 1. Go to Google AdSense dashboard
 * 2. Navigate to Ads > Overview
 * 3. Create a new ad unit or use an existing one
 * 4. Copy the "data-ad-slot" value from the ad code
 */
export default function AdSenseSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-48 flex-none space-y-5 lg:block xl:w-56">
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <AdSense
          adSlot="your-ad-slot-id-1"
          adFormat="auto"
          className="min-h-[250px]"
        />
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <AdSense
          adSlot="your-ad-slot-id-2"
          adFormat="auto"
          className="min-h-[250px]"
        />
      </div>
    </div>
  );
}
