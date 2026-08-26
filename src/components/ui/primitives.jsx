import { Icon } from './icons'

const avatarSizes = { sm: 'h-7 w-7 text-[9px]', md: 'h-[38px] w-[38px] text-xs', xl: 'h-[62px] w-[62px] text-[17px]' }
const avatarTones = { blue: 'bg-gradient-to-br from-[#1580b8] to-[#07376e]', indigo: 'bg-gradient-to-br from-[#6653b7] to-[#263b77]' }
const badgeTones = { blue: 'bg-[#eaf2ff] text-[#1764c0]', high: 'bg-[#fff0f1] text-[#dc4455]', medium: 'bg-[#fff7e8] text-[#c98311]', low: 'bg-[#edf9f2] text-[#25845a]', category: 'bg-[#f0f4fa] text-[#5e6b80]', neutral: 'bg-[#eff2f6] text-[#59677c]' }

export function Card({ className = '', children }) { return <section className={`rounded-xl border border-line bg-surface shadow-sm ${className}`}>{children}</section> }
export function Avatar({ name, size = 'md', tone = 'blue' }) { const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join(''); return <span className={`inline-grid shrink-0 place-items-center rounded-full border-2 border-white font-bold text-white shadow-[0_0_0_1px_#dfe6f0] ${avatarSizes[size]} ${avatarTones[tone]}`} aria-label={name}>{initials}</span> }
export function Badge({ children, tone = 'neutral' }) { return <span className={`inline-flex w-max items-center rounded-full px-2 py-0.5 text-[11px] font-bold leading-tight ${badgeTones[tone]}`}>{children}</span> }
export function IconButton({ label, icon, badge, className = '' }) { return <button className={`relative inline-grid h-9 w-9 place-items-center rounded-full border-0 bg-transparent text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800 ${className}`} type="button" aria-label={label}><Icon name={icon} />{badge ? <span className="absolute right-0.5 top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-[#e53541] px-1 text-[9px] font-bold text-white">{badge}</span> : null}</button> }
export function SectionHeader({ title, action = 'See all' }) { return <div className="mb-3 flex items-center justify-between"><h2 className="text-[14px] font-bold tracking-tight text-ink">{title}</h2>{action ? <button type="button" className="border-0 bg-transparent p-0 text-[10px] font-bold text-brand-700">{action}</button> : null}</div> }
