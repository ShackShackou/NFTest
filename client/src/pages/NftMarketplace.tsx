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
    { label: "Shackers OGs", href: "/collections/shackers" },
    { label: nft?.name || "S.H.A.C.K.E.R. #01", isActive: true }
  ];

  return (
    <>
      <Helmet>
        <title>S.H.A.C.K.E.R. #01 | PIXELNFT Marketplace</title>
        <meta name="description" content="S.H.A.C.K.E.R. #01 - Demon avec des yeux jaunes flamboyants et des petites cornes. Un NFT rare de la collection Shackers OG sur Ethereum." />
        <meta property="og:title" content="S.H.A.C.K.E.R. #01 | PIXELNFT Marketplace" />
        <meta property="og:description" content="S.H.A.C.K.E.R. #01 - Demon avec des yeux jaunes flamboyants et des petites cornes. Un NFT rare de la collection Shackers OG sur Ethereum." />
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
