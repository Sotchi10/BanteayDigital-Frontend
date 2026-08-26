import { currentUser } from "../../data/mockCommunity";
import { Avatar, Badge, Card, Icon } from "../ui";

const secondaryNavigation = [
  
];

const utilityNavigation = [
  { label: "Settings", icon: "settings" },
  { label: "Help & Support", icon: "help" },
];

const Nav = ({ items }) => (
  <nav className="grid gap-0.5">
    {items.map((item) => (
      <button
        key={item.label}
        className="flex items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left text-[13px] font-semibold text-[#3e4c63] hover:bg-[#eef4fc] hover:text-[#0c4698]"
      >
        <Icon name={item.icon} size={18} />
        {item.label}
      </button>
    ))}
  </nav>
);
export function LeftSidebar() {
  return (
    <aside className="hidden min-h-0 flex-col gap-3.5 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex">
      <Card className="p-[18px] text-center">
        <Avatar name={currentUser.name} size="xl" />
        <h2 className="mt-2 text-[15px] font-bold">{currentUser.name}</h2>
        <Badge tone="blue">Community member</Badge>
        <dl className="mt-4 grid gap-2 border-t border-[#e5eaf1] pt-3 text-left text-[12px] text-[#6c7890]">
          <div className="flex">
            <dt>
              <Icon name="edit" size={14} /> Reports
            </dt>
            <dd className="ml-auto font-bold text-[#15233b]">
              {currentUser.reports}
            </dd>
          </div>
          <div>
            <dt>
              <Icon name="chart" size={14} /> {currentUser.joined}
            </dt>
          </div>
        </dl>
      </Card>
      <Nav items={secondaryNavigation} />
      <div className="mx-2 h-px bg-[#e5eaf1]" />
      <Nav items={utilityNavigation} />
      <Card className="p-4 text-center">
        <Icon name="shield" size={30} />
        <strong className="block text-[14px] text-[#082f6b]">
          Be smart. Be safe.
        </strong>
        <p className="text-[12px] text-[#6c7890]">
          Check before you trust. Think before you click.
        </p>
        <button className="border-0 bg-transparent p-0 text-[12px] font-bold text-[#1764c0]">
          Learn more
        </button>
      </Card>
    </aside>
  );
}
