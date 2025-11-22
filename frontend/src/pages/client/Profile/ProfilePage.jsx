
import React from 'react';
import PersonalInfoForm from '../../../components/profile/PersonalInfoForm';

import { useLocation } from 'react-router-dom';

const PersonalInfoPage = () => {
    // const location = useLocation();
    // const activePath = location.pathname;

    return (
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin tài khoản</h2>
                <PersonalInfoForm />
            </div>
    );
};

export default PersonalInfoPage;