import mongoose, { Document } from 'mongoose';
import { PromptName } from '../index';

export namespace WhiteModels {
  export namespace Accounts {
    export interface WhiteToken extends Document {
      owner: mongoose.Types.ObjectId;
      transaction: number;
      description: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }

  export namespace Auth {
    export interface WhiteRequestForAccount extends Document {
      email: string;
      key: string;
      idea?: string;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface WhiteRequestForPassChange extends Document {
      email: string;
      key: string;
      createdAt: Date;
      updatedAt: Date;
    }

    export interface WhiteUser extends Document {
      email: string;
      passwordHash: string;
      name: string;
      subscription: 'free' | 'basic' | 'premium';
      createdAt: Date;
      updatedAt: Date;
    }
  }

  export namespace Data {
    export namespace Ideas {
      export interface WhiteIdea extends Document {
        owner: mongoose.Types.ObjectId;
        idea: string;
        archived: boolean;
        createdAt: Date;
        updatedAt: Date;
      }
    }

    export namespace Prompts {
      export interface WhitePromptResult extends Document {
        owner: mongoose.Types.ObjectId;
        ideaID: string;
        promptName: string;
        reason: 'run' | 'feedback' | 'save';
        data: string;
        createdAt: Date;
        updatedAt: Date;
      }

      export interface WhiteTask extends Document {
        owner: mongoose.Types.ObjectId;
        ideaID: string;
        promptName: string;
        taskId: number;
        createdAt: Date;
        updatedAt: Date;
      }
    }

    export namespace Critiq {
      export interface WhiteCritiq extends Document {
        owner: mongoose.Types.ObjectId;
        steps: Step[];
        archived: boolean;
        createdAt: Date;
        updatedAt: Date;
      }

      interface Step {
        title: string;
        answers: Answer[];
        createdAt: Date;
        updatedAt: Date;
      }

      interface Answer {
        question: string;
        selectedOption: string;
        additionalDetail?: string;
        createdAt: Date;
        updatedAt: Date;
      }
    }
  }

  export namespace ABTest {
    export interface EmailModel extends Document {
      email?: string;
      product?: string;
      emailSent?: string;
      deleted?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }

  export namespace Tasks {
    export interface OpenAITaskModel extends Document {
      startTime: Date;
      finishTime?: Date;
      status: String;
      promptResIDOrReason?: String;
      userID: string;
      promptName: PromptName;
    }
  }
}
