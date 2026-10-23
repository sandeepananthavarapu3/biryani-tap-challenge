import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#0a0a0a] py-6 text-center text-gray-400">
      <div className="container mx-auto px-4">
        <p>Biryani Tap Challenge &copy; {new Date().getFullYear()}</p>
        <div className="mt-2 flex justify-center space-x-4 text-sm">
          <Link href="/terms" className="hover:text-amber-500">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-500">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
