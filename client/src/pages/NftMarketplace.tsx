import { useQuery } from "@tanstack/react-query";
import { NftDisplay } from "@/components/NftDisplay";
import { NftDetails } from "@/components/NftDetails";
import { RelatedNfts } from "@/components/RelatedNfts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Helmet } from "react-helmet";

export default function NftMarketplace() {
  // Fetch NFT data
  const { data: nft } = useQuery({
    queryKey: ['/api/nfts/42'],
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Pixel Collection", href: "/collections/pixel" },
    { label: nft?.name || "DARTHBATER #42", isActive: true }
  ];

  return (
    <>
      <Helmet>
        <title>DARTHBATER #42 | PIXELNFT Marketplace</title>
        <meta name="description" content="Interactive pixel art NFT from the Pixel Warriors collection. Hover to pause animation, click to advance frames. Unique on-chain properties." />
        <meta property="og:title" content="DARTHBATER #42 | PIXELNFT Marketplace" />
        <meta property="og:description" content="Interactive pixel art NFT from the Pixel Warriors collection with special features and rarity traits." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          <NftDisplay />
          <NftDetails nftId={42} />
        </div>
        
        <RelatedNfts collectionId={1} />
      </main>
      
      <Footer />
    </>
  );
}
