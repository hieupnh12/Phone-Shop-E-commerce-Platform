import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About FShop */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-bold">FShop</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.about')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link to="/user/products" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  {t('navigation.products')}
                </Link>
              </li>
              <li>
                <Link to="/user/feedbacks" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  {t('navigation.feedbacks')}
                </Link>
              </li>
              <li>
                <Link to="/user/contact" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.contactInfo')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:0705432115" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                    0705 432 115
                  </a>
                  <p className="text-slate-500 text-xs">{t('footer.supportHotline')}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@fshop.com" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                  support@fshop.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">
                  FShop, FPT City<br />
                  Ngũ Hành Sơn, Đà Nẵng
                </span>
              </li>
            </ul>
          </div>
          
          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.businessHours')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-slate-400">
                    <span className="text-slate-500">{t('footer.weekdays')}:</span> 08:00 - 17:30
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">{t('footer.weekends')}:</span> 09:00 - 17:00
                  </p>
                </div>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="mt-6">
              <p className="text-sm text-slate-500 mb-3">{t('footer.connectWithUs')}</p>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com/minhtran324" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg flex items-center justify-center transition-all"
                >
                  <Facebook className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                </a>
                <a 
                  href="https://zalo.me/0705432115" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg flex items-center justify-center transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/user/contact" className="text-slate-500 hover:text-cyan-400 transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link to="/user/contact" className="text-slate-500 hover:text-cyan-400 transition-colors">
                {t('footer.termsOfUse')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
