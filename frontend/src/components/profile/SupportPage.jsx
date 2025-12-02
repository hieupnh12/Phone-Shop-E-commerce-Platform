import React from 'react';
import { MessageCircle, Phone, Home, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const SupportPage = () => {
    const { t } = useLanguage();
    
    return (
        <div className="bg-white p-6 shadow-lg rounded-xl">
            <div className="flex items-center mb-6">
                <MessageCircle size={24} className="text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">{t('profile.support')}</h2>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">{t('profile.supportPage.contactInfo')}</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Phone size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">{t('profile.supportPage.phone')}</p>
                                <p className="text-gray-700 text-lg font-semibold">0705432115</p>
                                <p className="text-sm text-gray-500 mt-1">{t('profile.supportPage.support24_7')}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Home size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">{t('profile.supportPage.storeAddress')}</p>
                                <p className="text-gray-700">FShop, FPT City, Ngũ Hành Sơn, Đà Nẵng</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Clock size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">{t('profile.supportPage.businessHours')}</p>
                                <p className="text-gray-700">{t('profile.supportPage.businessHoursDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">{t('profile.supportPage.services')}</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p>{t('profile.supportPage.servicesDesc')}</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>{t('profile.supportPage.service1')}</li>
                            <li>{t('profile.supportPage.service2')}</li>
                            <li>{t('profile.supportPage.service3')}</li>
                            <li>{t('profile.supportPage.service4')}</li>
                            <li>{t('profile.supportPage.service5')}</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3 text-lg">{t('profile.supportPage.feedback')}</h3>
                    <div className="text-sm text-gray-700">
                        <p>{t('profile.supportPage.feedbackDesc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;

