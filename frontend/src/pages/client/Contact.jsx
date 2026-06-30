import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Smartphone, Shield, Users, ChevronRight, Sparkles, Lock, Truck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

// Typing Effect Component với khả năng reset
const TypingEffect = ({ text, speed = 20, onComplete, resetKey }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset khi resetKey thay đổi
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [resetKey]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return (
    <span>
      {displayText}
      {!isComplete && <span className="animate-pulse text-cyan-400">|</span>}
    </span>
  );
};

// Policy Typing Effect - với mục lớn in đậm
const PolicyTypingEffect = ({ text, speed = 20, resetKey }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Reset khi resetKey thay đổi
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [resetKey]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
    }
  }, [currentIndex, text, speed, isComplete]);

  // Render text với mục lớn in đậm
  const renderFormattedText = () => {
    const lines = displayText.split('\n');
    return lines.map((line, index) => {
      // Kiểm tra nếu là mục lớn (bắt đầu bằng số + dấu chấm)
      const isMainSection = /^\d+\.\s/.test(line);
      // Kiểm tra nếu là tiêu đề chính (toàn chữ in hoa hoặc có dấu)
      const isTitle = line === line.toUpperCase() && line.length > 5;
      
      return (
        <React.Fragment key={index}>
          {isTitle ? (
            <span className="font-bold text-cyan-400 text-lg">{line}</span>
          ) : isMainSection ? (
            <span className="font-bold text-white">{line}</span>
          ) : (
            <span>{line}</span>
          )}
          {index < lines.length - 1 && '\n'}
        </React.Fragment>
      );
    });
  };

  return (
    <span>
      {renderFormattedText()}
      {!isComplete && <span className="animate-pulse text-cyan-400">|</span>}
    </span>
  );
};

const Contact = () => {
  const { t } = useLanguage();

  // Policies Content
  const policiesContent = [
    {
      id: 'privacy',
      title: t('contact.policies.privacy.title'),
      icon: Lock,
      content: t('contact.policies.privacy.content')
    },
    {
      id: 'warranty',
      title: t('contact.policies.warranty.title'),
      icon: Shield,
      content: t('contact.policies.warranty.content')
    },
    {
      id: 'shipping',
      title: t('contact.policies.shipping.title'),
      icon: Truck,
      content: t('contact.policies.shipping.content')
    }
  ];

  // About Us Content
  const aboutUsContent = {
    title: t('contact.aboutUs.title'),
    sections: [
      {
        icon: Smartphone,
        title: t('contact.aboutUs.sections.aboutUs.title'),
        content: t('contact.aboutUs.sections.aboutUs.content')
      },
      {
        icon: Shield,
        title: t('contact.aboutUs.sections.quality.title'),
        content: t('contact.aboutUs.sections.quality.content')
      },
      {
        icon: Users,
        title: t('contact.aboutUs.sections.customer.title'),
        content: t('contact.aboutUs.sections.customer.content')
      }
    ]
  };
  const [showSections, setShowSections] = useState([true, false, false]); // Section đầu hiển thị ngay
  const [resetKey, setResetKey] = useState(0);
  
  // Policy state
  const [selectedPolicy, setSelectedPolicy] = useState(0);
  const [policyResetKey, setPolicyResetKey] = useState(0);

  // Reset typing effect mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setResetKey(prev => prev + 1);
      setShowSections([true, false, false]);
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, []);

  // Handle section typing complete - hiển thị section tiếp theo khi typing xong
  const handleSectionTypingComplete = (index) => {
    // Hiển thị section tiếp theo sau 300ms
    if (index < aboutUsContent.sections.length - 1) {
      setTimeout(() => {
        setShowSections(prev => {
          const newState = [...prev];
          newState[index + 1] = true;
          return newState;
        });
      }, 300);
    }
  };

  // Handle policy tab change
  const handlePolicyChange = (index) => {
    if (index !== selectedPolicy) {
      setSelectedPolicy(index);
      setPolicyResetKey(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-10">
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">{t('contact.hero.support24_7')}</span>
          </div>
          {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Liên Hệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">FShop</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn mọi lúc mọi nơi
          </p> */}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-5xl mx-auto">
          {/* Hotline Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('contact.hotline.title')}</h3>
              <a href="tel:0705432115" className="text-xl font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                0705 432 115
              </a>
              <p className="text-slate-500 text-sm mt-2">{t('contact.hotline.description')}</p>
            </div>
          </div>

          {/* Address Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('contact.address.title')}</h3>
              <p className="text-slate-300 font-medium">{t('contact.address.location')}</p>
              <p className="text-slate-500 text-sm mt-1">{t('contact.address.district')}</p>
            </div>
          </div>

          {/* Email Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('contact.email.title')}</h3>
              <a href="mailto:support@fshop.com" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                support@fshop.com
              </a>
              <p className="text-slate-500 text-sm mt-2">{t('contact.email.description')}</p>
            </div>
          </div>

          {/* Business Hours Card */}
          <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-cyan-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('contact.businessHours.title')}</h3>
              <div className="space-y-1">
                <p className="text-slate-300 text-sm"><span className="text-slate-500">{t('contact.businessHours.weekdays')}:</span> 08:00 - 17:30</p>
                <p className="text-slate-300 text-sm"><span className="text-slate-500">{t('contact.businessHours.weekends')}:</span> 09:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map and About Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Map Section */}
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center px-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-slate-400 text-sm font-medium">{t('contact.map.title')}</span>
            </div>
            <div className="pt-12">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.6752041535174!2d108.2572200732794!3d15.9783291418687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3142110023f5878b%3A0x9e6c2df5f05f377!2sFShop!5e0!3m2!1svi!2s!4v1764490025998!5m2!1svi!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FShop Location"
                className=""
              />
            </div>
          </div>

          {/* About Us Section with Typing Effect */}
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center px-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-slate-400 text-sm font-medium">{t('contact.aboutUs.title')}</span>
            </div>
            
            <div className="pt-12 p-6 h-[400px] overflow-y-auto custom-scrollbar">
              {/* Sections with Sequential Typing Effect */}
              <div className="space-y-6 pt-4">
                {aboutUsContent.sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={index}
                      className={`transform transition-all duration-500 ${
                        showSections[index]
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                            {section.title}
                            <ChevronRight className="w-4 h-4 text-cyan-400" />
                          </h3>
                          <p className="text-slate-400 leading-relaxed text-sm">
                            {showSections[index] && (
                              <TypingEffect 
                                text={section.content} 
                                speed={15} 
                                resetKey={resetKey}
                                onComplete={() => handleSectionTypingComplete(index)}
                              />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Decorative Element */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-cyan-400 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">{t('contact.aboutUs.tagline')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Policy Tabs Header */}
          <div className="grid grid-cols-3 border-b border-slate-700/50">
            {policiesContent.map((policy, index) => {
              const Icon = policy.icon;
              return (
                <button
                  key={policy.id}
                  onClick={() => handlePolicyChange(index)}
                  className={`flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all duration-300 ${
                    selectedPolicy === index
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{policy.title}</span>
                  <span className="sm:hidden text-xs">{policy.title.replace(t('contact.policies.prefix'), '')}</span>
                </button>
              );
            })}
          </div>

          {/* Policy Content */}
          <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const Icon = policiesContent[selectedPolicy].icon;
                return (
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                );
              })()}
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {policiesContent[selectedPolicy].title}
              </h2>
            </div>
            
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">
              <PolicyTypingEffect 
                text={policiesContent[selectedPolicy].content} 
                speed={5}
                resetKey={policyResetKey}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Contact;