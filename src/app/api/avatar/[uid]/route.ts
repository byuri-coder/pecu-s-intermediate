
// src/app/api/avatar/[uid]/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Usuario } from '@/models/Usuario';

export const runtime = 'nodejs';

function returnTransparentPixel() {
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(pixel, {
        status: 200,
        headers: { 'Content-Type': 'image/gif' },
    });
}

// This route now serves the image data directly from the Base64 URI or a transparent pixel as a fallback.
export async function GET(req: Request, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    if (!uid) {
        return returnTransparentPixel();
    }
    
    await connectDB();
    const user = await Usuario.findOne({ uidFirebase: uid }).lean();

    if (user && user.profilePhoto && user.profilePhoto.url) {
        const imageUrl = user.profilePhoto.url;
        
        // Handle Base64 Data URI
        if (imageUrl.startsWith('data:image')) {
            const [header, base64Data] = imageUrl.split(',');
            if (!header || !base64Data) {
                return returnTransparentPixel();
            }
            const contentType = header.replace('data:', '').replace(';base64', '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            return new NextResponse(buffer, {
                status: 200,
                headers: { 
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
            });
        }
    }
    
    // If no photo URL exists, or it's not a data URI, return a transparent pixel.
    return returnTransparentPixel();

  } catch (err: any) {
    console.error('Erro ao buscar avatar:', err);
    // In case of any error, return the transparent pixel.
    return returnTransparentPixel();
  }
}
