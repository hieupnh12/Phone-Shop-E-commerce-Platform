import React from 'react'
import { useTokenExtractor } from "../../hooks/useTokenExtractor";

export default function HomeClient() {

  useTokenExtractor();
  return (
    <div>Check Home</div>
  )
}

