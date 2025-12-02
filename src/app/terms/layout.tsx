import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kullanım Şartları",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
