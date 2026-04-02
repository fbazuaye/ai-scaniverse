import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-8 sm:mt-12 pb-4 sm:pb-6 text-center text-xs sm:text-sm text-muted-foreground px-4 sm:px-6">
      <div className="max-w-7xl mx-auto border-t border-border pt-4 sm:pt-6 space-y-2">
        <p>Designed by Frank Bazuaye. Powered By LiveGig Ltd</p>
        <nav aria-label="Footer" className="flex items-center justify-center gap-4">
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;