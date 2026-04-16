import { execFile } from 'child_process';
import { mkdtemp, readFile, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';

const execFileAsync = promisify(execFile);

async function convertWithSips(buffer: Buffer, outName: string): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'heic-'));
  const inPath = join(dir, 'input.heic');
  const outPath = join(dir, outName);
  try {
    await writeFile(inPath, buffer);
    await execFileAsync('sips', ['-s', 'format', 'jpeg', inPath, '--out', outPath]);
    return await readFile(outPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function convertWithSharp(buffer: Buffer): Promise<Buffer> {
  const sharp = (await import('sharp')).default;
  return sharp(buffer).jpeg({ quality: 90 }).toBuffer();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const outName = file.name.replace(/\.(heic|heif)$/i, '.jpg');

  let jpegBuffer: Buffer;

  if (process.platform === 'darwin') {
    jpegBuffer = await convertWithSips(buffer, outName);
  } else {
    jpegBuffer = await convertWithSharp(buffer);
  }

  return new NextResponse(jpegBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="${outName}"`,
    },
  });
}
