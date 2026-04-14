import { NextResponse } from 'next/server';
import { syncMatchesFromAPI } from '@/lib/syncMundial';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Brak uprawnień' }, { status: 401 });
  }

  try {
    const result = await syncMatchesFromAPI();
    return NextResponse.json({ 
      success: true, 
      message: 'Baza meczów zsynchronizowana.',
      ...result 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
