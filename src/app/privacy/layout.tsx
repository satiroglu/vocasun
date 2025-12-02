import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gizlilik Politikası",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
