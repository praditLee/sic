import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // 1. นำเข้า glob loader เพิ่มเติม

const coursesCollection = defineCollection({
    // 2. ใช้ loader แทน type: 'content' และระบุตำแหน่งโฟลเดอร์ให้ชัดเจน
    loader: glob({ pattern: "**/*.md", base: "./src/content/courses" }), 
    schema: z.object({
        title: z.string(),
        category: z.string(),
        description: z.string(),
        image: z.string(), 
        pubDate: z.date(),
        thinkificUrl: z.string().url(), 
    }),
});

export const collections = {
    'courses': coursesCollection,
};