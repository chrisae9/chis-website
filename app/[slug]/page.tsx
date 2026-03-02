import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, getPostBySlugCaseInsensitive } from '@/lib/posts'
import { PostPage } from '@/components/PostPage'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const allPosts = getAllPosts(false, true)
  return allPosts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug) || getPostBySlugCaseInsensitive(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.frontmatter.title} | Blog`,
    description: post.frontmatter.summary,
  }
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug) || getPostBySlugCaseInsensitive(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts(false, true)

  return <PostPage post={post} allPosts={allPosts} />
}
