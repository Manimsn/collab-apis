// app/components/PublicLayout.tsx

import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
