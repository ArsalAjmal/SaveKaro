import React from 'react';

/**
 * Card component - A container with rounded corners and shadow
 */
export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

/**
 * CardContent component - Content wrapper for Card
 */
export const CardContent = ({ children, className = '', ...props }) => {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};
