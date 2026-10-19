"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAccountAvatar } from "@/components/visual/identity/generated-account-avatar";

export function AccountAvatar({ identity, image }: { identity: string; image?: string | null }) {
  return (
    <Avatar size="lg" className="yw-account-avatar" aria-hidden="true">
      {image && <AvatarImage src={image} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback><GeneratedAccountAvatar address={identity} size={40} /></AvatarFallback>
    </Avatar>
  );
}
