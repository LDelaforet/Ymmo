import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-white">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-stone-600 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                    <p className="font-black text-stone-950">Ymmo Real Estate</p>
                    <p className="mt-1">
                        Contact: hello@ymmo.local - 123 Estate Street, Lyon
                    </p>
                    <p className="mt-1">
                        (c) 2026 Ymmo. Mentions legales et confidentialite.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 font-bold text-stone-800">
                    <Link href="/properties" className="hover:text-emerald-700">
                        Properties
                    </Link>
                    <Link href="/agents" className="hover:text-emerald-700">
                        Agents
                    </Link>
                    <Link href="/agencies" className="hover:text-emerald-700">
                        Agencies
                    </Link>
                    <Link href="/login" className="hover:text-emerald-700">
                        Login
                    </Link>
                </div>
            </div>
        </footer>
    );
}
