import { db } from "@/Dexie";
import { useEffect, useState } from "react";
import type { Icons } from "@/Dexie";

type IconImgProps = {
  keyName: string; // ⛔ `key` is a reserved prop in React, so rename it
  onClick?: any;
};

export function DbIcon({ keyName, onClick }: IconImgProps) {
  const [url, setUrl] = useState<string | null>(null); // use null to avoid empty string issues

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        if (!keyName) return;

        const icon: Icons | undefined = await db.Icons.where("value")
          .equals(keyName)
          .first();
        const placeholder: Icons | undefined = await db.Icons.where("value")
          .equals("placeholder")
          .first();

        setUrl(icon?.url || placeholder?.url || null);
      } catch (err) {
        console.error("Error fetching icon:", err);
        setUrl(null);
      }
    };

    fetchIcon();
  }, [keyName]);

  // ✅ Only render <img> if url exists
  if (!url) return null;

  return (
    <img
      onClick={onClick}
      className="h-7 aspect-square"
      src={url}
      alt={keyName}
    />
  );
}
