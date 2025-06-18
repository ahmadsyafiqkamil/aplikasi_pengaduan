
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppConfig } from '../hooks/useAppConfig';
import Button from '../components/common/Button';
import PageWrapper from '../components/layout/PageWrapper'; 
import { APP_NAME } from '../constants'; // Added import

const LandingPage: React.FC = () => {
  const { config } = useAppConfig();

  const FacebookIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" />
    </svg>
  );

  const TwitterIcon = () => ( // X icon - No longer used directly in the X slot, but kept for potential other uses
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const InstagramIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.001 1.802c-2.447 0-2.77.01-3.722.055-.943.044-1.522.2-2.018.388a3.109 3.109 0 00-1.153.748 3.109 3.109 0 00-.748 1.153c-.188.496-.344 1.075-.388 2.018-.046.952-.056 1.275-.056 3.722s.01 2.77.056 3.722c.044.943.2 1.522.388 2.018a3.109 3.109 0 00.748 1.153 3.109 3.109 0 001.153.748c.496.188 1.075.344 2.018.388.952.046 1.275.056 3.722.056s2.77-.01 3.722-.056c.943-.044 1.522.2 2.018-.388a3.109 3.109 0 001.153-.748 3.109 3.109 0 00.748-1.153c.188-.496.344-1.075.388-2.018.046-.952-.056-1.275-.056-3.722s-.01-2.77-.056-3.722c-.044-.943-.2-1.522-.388-2.018a3.109 3.109 0 00-.748-1.153 3.109 3.109 0 00-1.153-.748c-.496-.188-1.075-.344-2.018-.388-.952-.046-1.275-.056-3.722-.056zM12 6.836a5.164 5.164 0 100 10.328 5.164 5.164 0 000-10.328zm0 1.802a3.362 3.362 0 110 6.724 3.362 3.362 0 010-6.724zM16.336 5.702a1.148 1.148 0 100 2.296 1.148 1.148 0 000-2.296z" clipRule="evenodd" />
    </svg>
  );

  const YouTubeIcon = () => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.78 22 12 22 12s0 3.22-.42 4.814a2.597 2.597 0 0 1-1.768 1.768c-1.59.42-7.594.42-7.594.42s-5.99-.01-7.584-.42a2.597 2.597 0 0 1-1.768-1.768C2 15.22 2 12 2 12s0-3.22.42-4.814a2.597 2.597 0 0 1 1.768-1.768C5.634 5 11.63 5 11.63 5s5.988-.01 7.584.42ZM9.736 15.545V8.455l6.264 3.545z" clipRule="evenodd" />
    </svg>
  );

  const WebsiteIcon = () => ( // Globe Icon
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM8.204 4.778a.75.75 0 0 0-1.126-.954l-.688 .447a8.215 8.215 0 0 0-1.612 2.838c.02.029.04.057.062.085a.75.75 0 0 0 1.1-.977 6.716 6.716 0 0 1 1.338-2.23l.626-.209ZM12 3.75A8.25 8.25 0 0 0 3.75 12a.75.75 0 0 0 1.5 0A6.75 6.75 0 0 1 12 5.25a.75.75 0 0 0 0-1.5ZM13.796 4.778a.75.75 0 0 0-.872-.627l-.76.253a6.715 6.715 0 0 1-.721 2.577.75.75 0 1 0 1.354.644 5.215 5.215 0 0 0 .54-2.062l.46-.183ZM17.063 6.128a.75.75 0 0 0-1.009-.219l-.64.349a6.745 6.745 0 0 1-2.434 2.434l-.35.64a.75.75 0 0 0 .219 1.009l2.75 1.5a.75.75 0 0 0 1.008-.219l.904-1.656a6.72 6.72 0 0 1 .278-2.385.75.75 0 0 0-.775-.775 5.22 5.22 0 0 0-2.385.278L13.2 8.796a5.245 5.245 0 0 0 1.53 1.53l1.656-.904a.75.75 0 0 0 .219-1.008l-1.5-2.75ZM6.128 6.937a.75.75 0 0 0-.219 1.009l1.5 2.75a.75.75 0 0 0 1.009.219l1.656-.904a5.245 5.245 0 0 0 1.53-1.53L10.204 6.8l-2.385-.278a.75.75 0 0 0-.775.775c.07.868.29 1.7.615 2.448l.088.197a.75.75 0 1 0 1.307-.678 5.18 5.18 0 0 0-.482-1.074l-.18-.367-.349-.64Z M5.106 8.204a.75.75 0 0 0-.954 1.126l.447.688a8.215 8.215 0 0 0 2.838 1.612c.029-.02.057-.04.085-.062a.75.75 0 0 0-.977-1.1 6.716 6.716 0 0 1-2.23-1.338l-.209-.626ZM18.872 17.063a.75.75 0 0 0 .219-1.009l-1.5-2.75a.75.75 0 0 0-1.009-.219l-1.656.904a5.245 5.245 0 0 0-1.53 1.53l1.404 1.656 2.385.278a.75.75 0 0 0 .775-.775 5.22 5.22 0 0 0-.278-2.385l.904-1.656a6.72 6.72 0 0 1 2.385-.278.75.75 0 0 0 .775.775c-.07.868-.29 1.7-.615 2.448l-.088.197a.75.75 0 1 0 1.307-.678 5.18 5.18 0 0 0 .482-1.074l.18-.367.349.64Zm-5.086-3.277a.75.75 0 0 0-1.06 0L12 14.439l-.717-.717a.75.75 0 0 0-1.06 1.06l1.25 1.25a.75.75 0 0 0 1.06 0l1.25-1.25a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
    </svg>
  );

  // Helper to parse complaint flow description for better display
  const renderComplaintFlowSteps = (description: string) => {
    const steps = description.split(/→|\n/).map(step => step.trim()).filter(step => step.length > 0);
    if (steps.length > 1 && steps.every(step => /^\d+\./.test(step.trim()))) { // Check if it looks like a numbered list
      return (
        <ol className="list-decimal list-inside space-y-2 text-gray-700 text-left max-w-xl mx-auto">
          {steps.map((step, index) => (
            <li key={index} className="text-lg">{step.replace(/^\d+\.\s*/, '')}</li>
          ))}
        </ol>
      );
    }
    return <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto whitespace-pre-line">{description}</p>;
  };


  return (
    <div className="flex flex-col min-h-screen"> {/* Ensure footer stays at bottom */}
      {/* Banner Section */}
      <div 
        className="bg-cover bg-center h-[calc(100vh-150px)] min-h-[350px] md:min-h-[450px] flex items-center justify-center text-white relative" 
        style={{ backgroundImage: `url(${config.bannerImageUrl || 'https://picsum.photos/1200/500'})` }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div> {/* Overlay */}
        <div className="text-center z-10 p-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">{config.bannerTitle}</h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-sm">{config.bannerDescription}</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/buat-pengaduan">
              <Button variant="secondary" size="lg" className="px-8 py-3 text-lg">
                Buat Pengaduan Sekarang
              </Button>
            </Link>
            <Link to="/lacak-pengaduan">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-white border-white hover:bg-white hover:text-primary px-8 py-3 text-lg"
              >
                Lacak Pengaduan Anda
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Complaint Flow Section - Conditionally Rendered */}
      {config.showComplaintFlowSection && (config.complaintFlowTitle || config.complaintFlowDescription) && (
        <section className="py-12 md:py-16 bg-light-bg text-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {config.complaintFlowTitle && (
              <h2 className="text-3xl md:text-4xl font-semibold text-dark-text mb-6 md:mb-8">
                {config.complaintFlowTitle}
              </h2>
            )}
            {config.complaintFlowDescription && renderComplaintFlowSteps(config.complaintFlowDescription)}
          </div>
        </section>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center p-8 mt-auto">
        <div className="container mx-auto">
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Ikuti Kami</h4>
            <div className="flex justify-center space-x-6 mt-3">
              {config.socialMediaFacebookUrl && (
                <a href={config.socialMediaFacebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook" className="text-white hover:text-accent transition-colors duration-200">
                  <FacebookIcon />
                </a>
              )}
              {config.socialMediaTwitterUrl && (
                <a href={config.socialMediaTwitterUrl} target="_blank" rel="noopener noreferrer" title="YouTube" className="text-white hover:text-accent transition-colors duration-200">
                  <YouTubeIcon /> {/* Changed from TwitterIcon to YouTubeIcon */}
                </a>
              )}
              {config.socialMediaInstagramUrl && (
                <a href={config.socialMediaInstagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram" className="text-white hover:text-accent transition-colors duration-200">
                  <InstagramIcon />
                </a>
              )}
              {config.socialMediaYoutubeUrl && ( // This is the original YouTube link
                <a href={config.socialMediaYoutubeUrl} target="_blank" rel="noopener noreferrer" title="YouTube" className="text-white hover:text-accent transition-colors duration-200">
                  <YouTubeIcon />
                </a>
              )}
              {config.socialMediaWebsiteUrl && (
                <a href={config.socialMediaWebsiteUrl} target="_blank" rel="noopener noreferrer" title="Website Resmi" className="text-white hover:text-accent transition-colors duration-200">
                  <WebsiteIcon />
                </a>
              )}
            </div>
             {!(config.socialMediaFacebookUrl || config.socialMediaTwitterUrl || config.socialMediaInstagramUrl || config.socialMediaYoutubeUrl || config.socialMediaWebsiteUrl) && (
                <p className="text-sm text-gray-400 mt-2">(Tautan media sosial & website belum diatur oleh Admin)</p>
             )}
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} {APP_NAME}. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;