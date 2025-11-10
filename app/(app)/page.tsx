import PostList from "@/components/post/PostList";


export default function Home() {
  return (
   <>
   <section className="__bg-white border-b">
  <div className="mx-auto max-w-Zx1 px-4 py-6">
    <div className="!tx items-center">
    </div>
    <h1 className="text-Zx1 font-bold">Home</h1>
    <p className="text-sm [text-gray-600">
      Recent posts from all communities
    </p>
  </div>
</section>

<section className="my-8">
  <div className="mx-auto fpx-w-7x1 px-4">
    <div className="flex flex-col gap-4">
      <PostList />
    </div>
  </div>
</section>
   </>
  );
}
