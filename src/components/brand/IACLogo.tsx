'use client';

import React from 'react';
import Image from 'next/image';

interface IACLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showTagline?: boolean;
    className?: string;
}

const dimensions = {
    sm: { h: 48, w: 80 },
    md: { h: 72, w: 120 },
    lg: { h: 96, w: 160 },
    xl: { h: 140, w: 240 },
};

export default function IACLogo({ size = 'md', showTagline = false, className = '' }: IACLogoProps) {
    const { h, w } = dimensions[size];
    const [imgError, setImgError] = React.useState(false);

    return (
        <div className={`inline-flex flex-col items-center select-none ${className}`}>
            {!imgError ? (
                <div className="relative" style={{ width: w, height: h }}>
                    <Image src="/logo-iac.png" alt="IAC - Ingeniería Asistida por Computador" fill className="object-contain" priority onError={() => setImgError(true)} />
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline">
                        <span className="font-extrabold text-4xl tracking-tighter text-accent">i</span>
                        <span className="font-extrabold text-4xl tracking-tighter text-foreground">ac</span>
                    </div>
                    <div className="text-[9px] font-bold tracking-tight -mt-0.5 whitespace-nowrap">
                        <span className="text-accent">Ingeniería</span>{' '}
                        <span className="text-foreground">Asistida Por Computador</span>
                    </div>
                </div>
            )}
            {showTagline && (
                <p className="text-[10px] text-muted tracking-wider text-center leading-tight max-w-[280px] font-medium mt-2">
                    Ingeniería Asistida por Computador — 30 años elevando la eficiencia de los negocios
                </p>
            )}
        </div>
    );
}

export function IACLogoMark({ className = '' }: { className?: string }) {
    return (
        <div className={`relative w-10 h-5 ${className}`}>
            <Image src="/logo-iac.png" alt="IAC" fill className="object-contain" />
        </div>
    );
}
