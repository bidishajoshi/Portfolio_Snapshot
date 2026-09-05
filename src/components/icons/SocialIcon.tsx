import { FaFacebook, FaInstagram, FaXTwitter, FaLinkedin, FaYoutube, FaGithub, FaGlobe } from "react-icons/fa6";
import { MdEmail, MdPhone } from "react-icons/md";

export default function SocialIcon({ platform, size = 18, className = "" }: { platform: string; size?: number; className?: string }) {
  const p = platform.toLowerCase().trim();
  if (p === "instagram") return <FaInstagram size={size} className={className} />;
  if (p === "facebook") return <FaFacebook size={size} className={className} />;
  if (p === "twitter" || p === "x") return <FaXTwitter size={size} className={className} />;
  if (p === "linkedin") return <FaLinkedin size={size} className={className} />;
  if (p === "youtube") return <FaYoutube size={size} className={className} />;
  if (p === "github") return <FaGithub size={size} className={className} />;
  if (p === "email" || p === "mail") return <MdEmail size={size} className={className} />;
  if (p === "phone" || p === "tel") return <MdPhone size={size} className={className} />;
  return <FaGlobe size={size} className={className} />;
}
