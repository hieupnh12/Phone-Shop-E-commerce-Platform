import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderV2 from '../../components/layout/HeaderV2'
import FooterV2 from '../../components/layout/FooterV2'

export default function UserHomePage() {
  return (
    <div>
        <HeaderV2 />
        <Outlet></Outlet>
        <FooterV2 />
    </div>
  )
}
