// file ProfilePage
import React from 'react';
import PersonalInfoForm from '../../../components/profile/PersonalInfoForm';


const PersonalInfoPage = () => {


    return (
            <div className="bg-white p-6 shadow-lg rounded-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin tài khoản</h2>
                <PersonalInfoForm />
            </div>
    );
};

export default PersonalInfoPage;