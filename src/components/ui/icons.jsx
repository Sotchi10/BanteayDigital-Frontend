import {
  FiAlertTriangle,
  FiAward,
  FiBarChart2,
  FiBell,
  FiBookmark,
  FiBookOpen,
  FiChevronRight,
  FiEdit3,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiImage,
  FiLink,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSettings,
  FiShare2,
  FiShield,
  FiUsers,
} from 'react-icons/fi'

const icons = {
  alert: FiAlertTriangle,
  bell: FiBell,
  book: FiBookOpen,
  bookmark: FiBookmark,
  chart: FiBarChart2,
  chevron: FiChevronRight,
  edit: FiEdit3,
  heart: FiHeart,
  help: FiHelpCircle,
  home: FiHome,
  image: FiImage,
  link: FiLink,
  message: FiMessageCircle,
  more: FiMoreHorizontal,
  search: FiSearch,
  settings: FiSettings,
  share: FiShare2,
  shield: FiShield,
  trophy: FiAward,
  users: FiUsers,
}

export function Icon({ name, size = 18, className }) {
  const ReactIcon = icons[name]

  return ReactIcon ? <ReactIcon aria-hidden="true" size={size} className={className} /> : null
}
