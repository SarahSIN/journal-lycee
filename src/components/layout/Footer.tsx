export default function Footer() {
  return (
    <footer className="bg-slate-900 py-6 mt-8">
      <div className="container mx-auto text-center text-gray-300">
        <p>&copy; {new Date().getFullYear()} Journal du Lycée. Tous droits réservés.</p>
      </div>
    </footer>
  );
}