export interface PostFrontmatter {
  title: string
  date: string
  summary: string
  tags: string[]
  backlinks?: string[]
  category?: string
  draft?: boolean
  hidden?: boolean
  disableUtterances?: boolean
}

export interface Post {
  slug: string
  content: string
  frontmatter: PostFrontmatter
}
