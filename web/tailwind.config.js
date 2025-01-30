/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					100: '#2d2d2d',
					200: '#565656',
					300: '#b2b2b2'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					100: '#fbecec',
					200: '#978a8a',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				surface: {
					100: '#ffffff',
					200: '#f5f5f5',
					300: '#cccccc',
				},
				black: {
					DEFAULT: '#000000',
					100: '#f4f4f5',
					200: '#e4e4e7',
					300: '#d4d4d8',
					400: '#a1a1aa',
					500: '#71717a',
					550: '#79747e',
					600: '#27272a',
					700: '#18181b',
					800: '#09090b',
				},
				green: {
					DEFAULT: '#16A34A',
					600: '#16A34A',
					700: '#15803d',
					800: '#166534',
				},
				orange: {
					DEFAULT: '#ea580c',
					600: '#ea580c',
					700: '#c2410c'
				},
				red: {
					DEFAULT: '#dc2626',
					600: '#dc2626',
					700: '#b91c1c'
				},
				slate: {
					DEFAULT: '#94A3bb',
					400: '#94A3bb',
					500: '#64748b',
					600: '#475569'
				},
				content: {
					DEFAULT: '#333333',
					100: '#333333',
					200: '#5c5c5c'
				},
				white: {
					DEFAULT: '#ffffff',
					100: '#f8fafc',
					200: '#f1f5f9',
				}
			},
			keyframes: {
				'icon-shake': {
					'0%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(-12deg)' },
					'50%': { transform: 'rotate(10deg)' },
					'75%': { transform: 'rotate(-6deg)' },
					'85%': { transform: 'rotate(3deg)' },
					'92%': { transform: 'rotate(-2deg)' },
					'100%': { transform: 'rotate(0deg)' }
				}
			},
			animation: {
				'icon-shake': 'icon-shake 0.7s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}

