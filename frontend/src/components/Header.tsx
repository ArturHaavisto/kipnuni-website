interface HeaderProps {
  title?: string;
}

function Header({ title = 'Kipnuni' }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <ul className="flex space-x-6">
            <li>
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
