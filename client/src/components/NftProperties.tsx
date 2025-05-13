import { Card } from "@/components/ui/card";

interface Property {
  type: string;
  value: string;
  rarity: string;
}

interface NftPropertiesProps {
  properties: Property[];
}

export function NftProperties({ properties }: NftPropertiesProps) {
  // Default properties if none are provided
  const defaultProperties: Property[] = [
    { type: "CHARACTER", value: "Darth Pixel", rarity: "4% have this" },
    { type: "WEAPON", value: "Light Saber", rarity: "12% have this" },
    { type: "RARITY", value: "Legendary", rarity: "2% have this" },
    { type: "BACKGROUND", value: "Teal", rarity: "8% have this" },
    { type: "ANIMATION", value: "Interactive", rarity: "5% have this" },
  ];

  const displayProperties = properties.length > 0 ? properties : defaultProperties;

  return (
    <Card className="bg-neutral-dark rounded-xl p-6">
      <h2 className="font-semibold text-lg mb-4">Properties</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayProperties.map((prop, index) => (
          <div key={index} className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <p className="text-xs text-primary mb-1">{prop.type}</p>
            <p className="font-medium">{prop.value}</p>
            <p className="text-xs text-neutral-light/70 mt-1">{prop.rarity}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
