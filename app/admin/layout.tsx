import AdminNav from "@/components/admin/AdminNav";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap admin-wrap">
      <AdminNav />
      {children}
    </div>
  );
}
