export const currentUser = { name: 'Sreynich Chan', handle: '@sreynich', reports: 128, joined: 'Joined Apr 2025' }


export const posts = [
  {
    id: 'telegram-prize', author: 'Sokchea', time: '2 hours ago', risk: 'High', category: 'Phishing',
    title: 'Fake prize claim on Telegram', description: 'They claim you qualify for a prize but first ask for a shipping fee and personal information. Do not share your details. Becareful when seeing something like this. I dont want anyone to face the same trouble or you might lose lots of money', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    evidence: { type: 'message', heading: 'Congratulations!', body: 'You won $1000. Click the link below to claim your prize.', link: 'https://claim-now.cc/win-prize' }, helpful: 87, comments: 15, shares: 31,
  },
  {
    id: 'shop-page', author: 'Rathana', time: '5 hours ago', risk: 'Medium', category: 'Online Shop Scam',
    title: 'Suspicious Facebook page', description: 'This page is selling phones at very low prices. Many people already lost money after paying a deposit.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    evidence: { type: 'link', heading: 'Tech Store Cambodia', body: 'Big sale — 50% off electronics', link: 'facebook.com/techstorecambodia' }, helpful: 51, comments: 8, shares: 12,
  },
  {
    id: 'sms-alert', author: 'Panha', time: '8 hours ago', risk: 'Low', category: 'SMS Scam',
    title: 'Suspicious SMS received', description: 'Received this message asking me to update my bank information. The link looks suspicious.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
    evidence: { type: 'message', heading: 'ABA Security Notice', body: 'Your account will be suspended. Please update your information here:', link: 'http://aba-support.info' }, helpful: 34, comments: 4, shares: 6,
  },
]

export const statistics = [
  { label: 'Reports', value: '1,245', icon: 'alert', tone: 'red' }, { label: 'Verified', value: '842', icon: 'shield', tone: 'blue' },
  { label: 'Pending Review', value: '356', icon: 'chart', tone: 'indigo' }, { label: 'Communities Protected', value: '120', icon: 'users', tone: 'violet' },
]

export const trendingScams = [{ label: 'Phishing', value: 45 }, { label: 'Online Shop Scam', value: 25 }, { label: 'Investment Scam', value: 15 }, { label: 'Romance Scam', value: 10 }, { label: 'Others', value: 5 }]

export const recentAlerts = [
  { risk: 'High', title: 'Fake bank SMS — account suspension', time: '1 hour ago' },
  { risk: 'Medium', title: 'Suspicious crypto investment platform', time: '3 hours ago' },
  { risk: 'High', title: 'Fake delivery fee request via messaging apps', time: '5 hours ago' },
]

export const contributors = [{ name: 'Liyhour', count: 128 }, { name: 'Sophea', count: 96 }, { name: 'Vicheka', count: 74 }]
