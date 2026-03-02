import { getAllPosts, extractAllTags, extractAllCategories, sortPostsByDate } from '@/lib/posts'
import { PostList } from '@/components/PostList'

export default function Home() {
  const posts = sortPostsByDate(getAllPosts(false, false))
  const allTags = extractAllTags(posts)
  const allCategories = extractAllCategories(posts)

  return <PostList posts={posts} allTags={allTags} allCategories={allCategories} />
}
