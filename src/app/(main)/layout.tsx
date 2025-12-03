import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import AdSense from "@/components/AdSense";
import MenuBar from "./MenuBar";
import Navbar from "./Navbar";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-[90rem] grow gap-5 p-5">
          <div className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 sm:block xl:w-80">
            <MenuBar className="space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm lg:px-5" />
            <div className="rounded-2xl p-3 shadow-sm lg:p-5">
              <AdSense
                adSlot="3211308650"
                adFormat="auto"
                style={{ display: "block" }}
              />
            </div>
          </div>
          {children}
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
