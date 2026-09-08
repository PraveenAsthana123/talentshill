import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveConfig,
  createConfig,
  activateConfig,
  getConfigHistory,
} from '@/lib/db/rag-run-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const active = getActiveConfig();
    const history = getConfigHistory();

    return NextResponse.json({ active: active || null, history });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, config } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config object is required' }, { status: 400 });
    }

    const requiredFields = ['chunkSize', 'chunkOverlap', 'embeddingModel', 'retrievalK'];
    const missingFields = requiredFields.filter(
      (field) => config[field] === undefined || config[field] === null
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required config fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const id = createConfig({
      name: name.trim(),
      config,
      changedBy: userId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create config' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required to activate a config version' }, { status: 400 });
    }

    activateConfig(id);

    const active = getActiveConfig();
    return NextResponse.json({ active });
  } catch {
    return NextResponse.json({ error: 'Failed to activate config' }, { status: 500 });
  }
}
