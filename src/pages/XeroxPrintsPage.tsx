import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesSection from "@/components/ServicesSection";

/** Xerox and Prints — print shop services (only reachable from the category card or nav). */
const XeroxPrintsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-transparent via-transparent to-primary/5 overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <ServicesSection searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
};

export default XeroxPrintsPage;
