import InstagramIcon from "./InstagramIcon";
import FacebookIcon from "./FacebookIcon";
import YoutubeIcon from "./YoutubeIcon";
import WhatsappIcon from "./WhatsappIcon";
import TiktokIcon from "./TiktokIcon";
import { Globe, Mail, Phone } from "lucide-react";

export default function SocialIcon({ platform, size = 18, className = "" }: { platform: string; size?: number; className?: string }) {
  const p = platform.toLowerCase().trim();
  if (p === "instagram") return <InstagramIcon size={size} className={className} />;
  if (p === "facebook") return <FacebookIcon size={size} className={className} />;
  if (p === "youtube") return <YoutubeIcon size={size} className={className} />;
  if (p === "whatsapp") return <WhatsappIcon size={size} className={className} />;
  if (p === "tiktok") return <TiktokIcon size={size} className={className} />;
  if (p === "email" || p === "mail") return <Mail size={size} className={className} />;
  if (p === "phone" || p === "tel") return <Phone size={size} className={className} />;
  return <Globe size={size} className={className} />;
}
