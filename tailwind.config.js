export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    fontFamily: { syne:['Syne','sans-serif'], mono:['"DM Mono"','monospace'], outfit:['Outfit','sans-serif'] },
    colors: { bg:'#050508', surface:'#0d0d14', surface2:'#13131e', accent:'#6366f1', accent2:'#06ffa5', accent3:'#f059da', danger:'#ff4757', warn:'#ffa502' },
    animation: { 'pulse-slow':'pulse 3s ease-in-out infinite', 'fade-in':'fadeIn 0.3s ease', 'slide-up':'slideUp 0.25s ease' },
    keyframes: { fadeIn:{from:{opacity:'0'},to:{opacity:'1'}}, slideUp:{from:{opacity:'0',transform:'translateY(10px)'},to:{opacity:'1',transform:'translateY(0)'}} },
  }},
  plugins: [],
};
