import { Document } from "mongoose";

export namespace OCModels {
  export interface ExpressRequest extends Document {
    uuid: string;
    stringifiedReq: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface ExpressResponse extends Document {
    uuid: string;
    stringifiedRes: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export namespace Auth {
    export interface SigninReq extends Document {
      reqUUID: string;
      successfull: boolean;
      userEmail: string;
      time: Date;
      reason?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }

  export namespace Data {
    export namespace Prompts {
      export interface OpenAICall extends Document {
        reqUUID: string;
        stringifiedParams: string;
        stringifiedCompletion: string;
        createdAt: Date;
        updatedAt: Date;
      }

      export interface InvalidPrompt extends Document {
        openAICallReqUUID: string;
        prompt: string;
        result: string;
        promptName: string;
        ideaID: string;
        createdAt: Date;
        updatedAt: Date;
      }

      export interface PromptPrice extends Document {
        openAICallReqUUID: string;
        promptName: string;
        forAVGPriceInOpenAITokens: number;
        createdAt: Date;
        updatedAt: Date;
      }
    }
  }

  export namespace ClientAnalytics {
    export interface PageRedner extends Document {
      page: string;
      createdAt: Date;
      updatedAt: Date;
    }
    export interface SidebarClick extends Document {
      route: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}
