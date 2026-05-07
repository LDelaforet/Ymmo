import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[#e5d8c8] bg-[#efe4d6]">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-[#6a5443] sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <p className="font-black text-[#2f241f]">Ymmo Real Estate</p>
                    <p className="mt-1">
                        Contact: hello@ymmo.local - 123 Estate Street, Lyon
                    </p>
                    <p className="mt-1">
                        (c) 2026 Ymmo. Mentions legales et confidentialite.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 font-bold text-[#5a4738]">
                    <Link href="/properties" className="hover:text-[#8b6b4f]">
                        Properties
                    </Link>
                    <Link href="/agents" className="hover:text-[#8b6b4f]">
                        Agents
                    </Link>
                    <Link href="/agencies" className="hover:text-[#8b6b4f]">
                        Agencies
                    </Link>
                    <Link href="/login" className="hover:text-[#8b6b4f]">
                        Login
                    </Link>
                </div>
            </div>
        </footer>
    );
}
