


import React from 'react';
import { FaFacebook, FaInstagram ,FaYoutube , FaTwitter, FaWhatsapp, FaLinkedin} from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-6 relative">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Contact Info - 2cm from left */}
        <div className="md:ml-[2cm] mb-4 md:mb-0 text-left">
          <h3 className="font-semibold mb-1">Contact us</h3>
          <p className="text-sm">Helpline No. 080-68333999</p>
          <p className="text-sm">info@samarthanam.org</p>
          <p className="text-sm">kumar@samarthanam.org</p>
          <p className="text-sm">+91 80 25721444 / 9922</p>
        </div>

        {/* Centered copyright and links - now properly aligned */}
        <div className="order-first md:order-none flex flex-col absolute left-[15cm] top-8 mb-4 md:mb-0">
          <p className="mb-1">&copy; {new Date().getFullYear()} Samarthanam. All rights reserved.</p>
          <div className="flex space-x-2">
            <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
          </div>
        </div>

        {/* Social Media section - adjusted positioning */}

        <div className="md:absolute left-[30cm] top-6 mb-4 md:mb-0">
          <h3 className="font-semibold mb-2 text-center md:text-left">SOCIAL MEDIA</h3>
          <div className="grid grid-cols-3 gap-3 w-max mx-auto md:mx-0">
            {/* Row 1 */}
            <a 
              href="https://www.facebook.com/samarthanaminfo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-500" 
              aria-label="Facebook"
            >
              <FaFacebook size={20} />
            </a>
            <a 
              href="https://www.instagram.com/samarthanamtrustforthedisabled/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-pink-500" 
              aria-label="Instagram"
            >
              <FaInstagram size={20} />
            </a>
            <a 
              href="https://www.youtube.com/channel/UCXWyda3dsdkjaZzfg6qX0ew" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-red-500" 
              aria-label="YouTube"
            >
              <FaYoutube size={20} />
            </a>
            
            {/* Row 2 */}
            <a 
              href="https://x.com/SamarthanamTFTD" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400" 
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </a>
            <a 
              href="https://www.linkedin.com/company/samarthanam-trust/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-blue-600" 
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;