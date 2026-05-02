import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Team Collaborator',
  description: 'Real-time team coordination and task management platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="background-effects" aria-hidden="true">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
