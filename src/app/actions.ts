'use server';

import { del } from '@vercel/blob';

export async function deleteBlobs(urls: string[]) {
    await del(urls);
}
