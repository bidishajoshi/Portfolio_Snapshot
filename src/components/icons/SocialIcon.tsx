import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaGithub, FaEnvelope, FaPhone, FaGlobe, FaTiktok, FaWhatsapp } from "react-icons/fa";

export default function SocialIcon({ platform, size = 18, className = "" }: { platform: string; size?: number; className?: string }) {
  const p = platform.toLowerCase().trim();
  if (p === "instagram") return <FaInstagram size={size} className={className} />;
  if (p === "facebook") return <FaFacebook size={size} className={className} />;
  if (p === "twitter" || p === "x") return <FaTwitter size={size} className={className} />;
  if (p === "linkedin") return <FaLinkedin size={size} className={className} />;
  if (p === "youtube") return <FaYoutube size={size} className={className} />;
  if (p === "github") return <FaGithub size={size} className={className} />;
  if (p === "tiktok" || p === "toktok") return <FaTiktok size={size} className={className} />;
  if (p === "whatsapp" || p === "whatsaapp") return <FaWhatsapp size={size} className={className} />;
  if (p === "email" || p === "mail") return <FaEnvelope size={size} className={className} />;
  if (p === "phone" || p === "tel") return <FaPhone size={size} className={className} />;
  return <FaGlobe size={size} className={className} />;
}
