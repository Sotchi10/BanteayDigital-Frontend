import { posts } from "../../../data/mockCommunity";
import { PostComposer } from "./PostComposer";
import { ScamPostCard } from "./ScamPostCard";
export function CommunityFeed() {
  return (
    <main className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
      <PostComposer />
      <div className="flex items-end justify-between px-1 pt-2">
        <div>
          <p className="m-0 text-[15px] font-bold uppercase tracking-wide text-black">
            Community feed
          </p>
        </div>
        <button className="rounded-lg border border-[#dfe5ed] bg-white px-2.5 py-1.5 text-[12px] text-[#53627a]">
          Most recent
        </button>
      </div>
      {posts.map((post) => (
        <ScamPostCard key={post.id} post={post} />
      ))}
    </main>
  );
}
