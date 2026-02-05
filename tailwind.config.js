/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx,js,jsx}"
    ],
    theme: {
        extend: {
            screens: {
                'xs': '480px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
