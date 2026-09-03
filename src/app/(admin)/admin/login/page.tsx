import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-ink">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="font-display text-2xl tracking-wide text-ivory">DR DSLR</p>
          <p className="mt-1 text-xs text-stone-dim">Studio admin</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
