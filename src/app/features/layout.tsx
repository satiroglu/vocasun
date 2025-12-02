import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Özellikler",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
