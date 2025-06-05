import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

console.log(">>> POSTCSS LOADED");

export default {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};

