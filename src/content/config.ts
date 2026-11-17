import { defineCollection, z } from 'astro:content';

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.date(),
  updatedDate: z.date().optional(),
  author: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string(),
  readingTime: z.string().optional(),
  draft: z.boolean().default(false),
  related: z.array(z.string()).default([]),
});

const journal = defineCollection({ schema: blogSchema });
const aiResearch = defineCollection({ schema: blogSchema });
const academy = defineCollection({ schema: blogSchema });

const authorsSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
});

const authors = defineCollection({ schema: authorsSchema });

export const collections = {
  journal,
  'ai-research': aiResearch,
  academy,
  authors,
};