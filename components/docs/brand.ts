// components/docs/brand.ts
// Shared brand tokens — matches FAQAccordion gradient border system

export const BRAND_GRADIENT =
    'linear-gradient(to right, rgb(2, 132, 199), rgb(5, 150, 105), rgb(225, 29, 72))';

export const brandGradientBorder: React.CSSProperties = {
    background: `${BRAND_GRADIENT} border-box`,
    border: '2px solid transparent',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 1,
    clipPath: 'polygon(0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px)',
};

// Tailwind-safe gradient text helper — apply as className
export const GRADIENT_TEXT_CLASS =
    'bg-gradient-to-r from-sky-600 via-emerald-600 to-rose-500 bg-clip-text text-transparent';
