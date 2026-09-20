import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const resultado = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 10,
      })
    );

    return NextResponse.json({
      sucesso: true,
      arquivos: resultado.Contents?.map((item) => ({
        chave: item.Key,
        tamanho: item.Size,
      })) ?? [],
    });
  } catch (error: any) {
    console.error("Erro no teste R2:", error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: error.message,
      },
      { status: 500 }
    );
  }
}
