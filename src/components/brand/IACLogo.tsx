'use client';

import React from 'react';
import Image from 'next/image';

interface IACLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTagline?: boolean;
    className?: string;
}

const dimensions = {
    sm: { h: 60, w: 100 },
    md: { h: 90, w: 150 },
    lg: { h: 120, w: 200 },
    xl: { h: 180, w: 300 },
};

export default function IACLogo({
    size = 'md',
    showTagline = false,
    className = '',
}: IACLogoProps) {
    const { h, w } = dimensions[size];
    const [imgError, setImgError] = React.useState(false);

    return (
        <div className={`inline-flex flex-col items-center select-none ${className}`}>
            {!imgError ? (
                <div className="relative" style={{ width: w, height: h }}>
                    <Image
                        src="/logo-iac.png"
                        alt="IAC - Ingeniería Asistida por Computador"
                        fill
                        className="object-contain"
                        priority
                        onError={() => setImgError(true)}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline mb-0">
                        <span className="font-extrabold text-5xl tracking-tighter" style={{ color: '#FDB813' }}>i</span>
                        <span className="font-extrabold text-5xl tracking-tighter" style={{ color: '#231F20' }}>ac</span>
                    </div>
                    <div className="text-[10px] font-bold tracking-tight -mt-1 mb-1 whitespace-nowrap">
                        <span style={{ color: '#FDB813' }}>Ingeniería</span>{' '}
                        <span style={{ color: '#231F20' }}>Asistida Por Computador</span>
                    </div>
                </div>
            )}

            {showTagline && (
                <p className="text-[11px] text-text-muted tracking-wider text-center leading-tight max-w-[300px] font-medium mt-2">
                    Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                </p>
            )}
        </div>
    );
}

export function IACLogoMark({ className = '' }: { className?: string }) {
    return (
        <div className="relative w-12 h-6">
            <Image
                src="/logo-iac.png"
                alt="IAC"
                fill
                className="object-contain"
            />
        </div>
    );
}
