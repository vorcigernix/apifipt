import { Injectable } from '@nestjs/common';
import { ApifyDatasetLoader } from 'langchain/document_loaders/web/apify_dataset';
import { Document } from 'langchain/document';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RetrievalQAChain } from 'langchain/chains';
import { OpenAI } from 'langchain/llms/openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    return 'Nah, nope';
  }
  async askGPT(question: string): Promise<string> {
    const loader = new ApifyDatasetLoader(
      this.configService.get<string>('APIFY_DOC_TOKEN'),
      {
        datasetMappingFunction: (item) =>
          new Document({
            pageContent: (item.text || '') as string,
            metadata: { source: item.url },
          }),
        clientOptions: {
          token: this.configService.get<string>('APIFY_API_TOKEN'),
        },
      },
    );

    const docs = await loader.load();
    const vectorStore = await HNSWLib.fromDocuments(
      docs,
      new OpenAIEmbeddings(),
    );

    const model = new OpenAI({
      temperature: 0,
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
      returnSourceDocuments: true,
    });
    const res = await chain.call({ query: question });
    return res.text;
  }
}
