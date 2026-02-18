'use client'
import React from 'react';

const LoadingScreen = ({ faviconUrl = "/favicon.ico" }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      {/* Simple bouncing favicon */}
      <img 
        src={faviconUrl}
        alt="Loading"
        style={{
          width: '48px',
          height: '48px',
          animation: 'bounce 0.8s ease-in-out infinite'
        }}
      />
      
      {/* CSS keyframe animation */}
      <style>{`
        @keyframes bounce {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;