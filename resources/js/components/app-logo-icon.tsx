import { ImgHTMLAttributes } from 'react';


export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img {...props} src="/images/Logo.svg" alt="Logo" className="h-8 w-8" />
    );
}