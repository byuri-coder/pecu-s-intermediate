
// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

async function fetchAndReturnImage(url: string) {
    try {
        const imageResponse = await fetch(url);
        if (!imageResponse.ok || !imageResponse.body) {
            throw new Error(`Failed to fetch image from storage: ${imageResponse.statusText}`);
        }
        const contentType = imageResponse.headers.get('content-type') || 'image/png';
        return new NextResponse(imageResponse.body, {
            status: 200,
            headers: { 'Content-Type': contentType },
        });
    } catch (error) {
        console.error("Error fetching image from storage:", error);
        return returnTransparentPixel();
    }
}

function returnTransparentPixel() {
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(pixel, {
        status: 200,
        headers: { 'Content-Type': 'image/gif' },
    });
}

// This route now serves the image data directly or a transparent pixel as a fallback.
export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
        return returnTransparentPixel();
    }
    
    await connectDB();
    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    if (user && user.profilePhoto && user.profilePhoto.url) {
        // The URL should be the direct, public URL from the storage service.
        // For simulation where the stored URL might be relative, we'll try fetching it.
        // In a real scenario, this would just be a redirect or a direct serve if it's an internal URL.
        const imageUrl = user.profilePhoto.url;
        
        // This logic is a bit complex for a simple avatar endpoint. 
        // In a real app, `user.profilePhoto.url` would be a public URL from S3/Firebase Storage, and we would just redirect.
        // To make the current setup work without a real storage service, we'll assume the URL needs to be fetched by the server.
        // If it points back to our own API, we need to avoid an infinite loop.
        
        // A better approach for the current simulation:
        // The URL stored is a base64 data URI. We can decode it and serve it.
        if (imageUrl.startsWith('data:image')) {
            const [header, base64Data] = imageUrl.split(',');
            const contentType = header.replace('data:', '').replace(';base64', '');
            const buffer = Buffer.from(base64Data, 'base64');
            return new NextResponse(buffer, {
                status: 200,
                headers: { 'Content-Type': contentType },
            });
        }
    }
    
    // If no photo URL exists, return a transparent pixel to avoid showing broken images or unwanted placeholders.
    return returnTransparentPixel();

  } catch (err: any) {
    console.error('Erro ao buscar avatar:', err);
    // In case of any error, return the transparent pixel.
    return returnTransparentPixel();
  }
}
