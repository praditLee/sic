import { defineCollection, z } from 'astro:content';

const coursesCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        category: z.string(),
        description: z.string(),
        image: z.string(), // path to image, e.g., /images/course-1.jpg
        pubDate: z.date(),
        thinkificUrl: z.string().url(), 
    }),
});

export const collections = {
    'courses': coursesCollection,
};