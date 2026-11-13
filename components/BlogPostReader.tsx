"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { BlogPost } from "@/data/blogs";
import styles from "@/styles/shared/blog-post.module.css";

export default function BlogPostReader({
  post,
  content,
}: {
  post: BlogPost;
  content: string;
}) {
  return (
    <article className={styles.post}>
      <h1 className={styles.title} id="blog-modal-title">
        {post.title}
      </h1>
      <p className={styles.date}>{post.date}</p>
      <div className={styles.body}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
