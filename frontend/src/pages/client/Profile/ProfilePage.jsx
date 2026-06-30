// file ProfilePage
import React from 'react';
import PersonalInfoForm from '../../../components/profile/PersonalInfoForm';
import { useLanguage } from '../../../contexts/LanguageContext';


const PersonalInfoPage = () => {
    const { t } = useLanguage();

    return (
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">{t('profile.accountInfo')}</h2>
                <PersonalInfoForm />
            </div>
    );
};

export default PersonalInfoPage;