// src/app/controllers/ChatController.ts

import { Response } from "express";
import { CustomRequest } from "@/types/customRequest";
import { IResponseDTO } from "@/domain/dtos/response.dto";
import { ERRORMESSAGES } from "@/domain/constants/errorMessages.constant";
import { MESSAGES } from "@/domain/constants/messages.constant";
import { HttpStatus } from "@/domain/enums/httpStatus.enum";
import { IGetConversationMessagesUseCase } from "@/app/useCases/chat/interfaces/IGetConversationMessagesUseCase";
import { IGetChatSummaryUseCase } from "@/app/useCases/chat/interfaces/IGetChatSummaryUseCase";
import { ChatParticipantType } from "@/domain/enums/ChatParticipantType";

export class ChatController {
  constructor(
    private roleType: "user" | "trainer",
    private getConversationMessagesUseCase: IGetConversationMessagesUseCase,
    private getChatSummaryUseCase: IGetChatSummaryUseCase
  ) {}

  private sendResponse<T>(res: Response, result: IResponseDTO<T>): void {
    res.status(result.status).json({
      success: result.success,
      message: result.message ?? (result.success ? MESSAGES.SUCCESS : undefined),
      ...(result.success ? { data: result.data } : { error: result.error }),
    });
  }

    async getConversationMessagesChatHistory(req: CustomRequest, res: Response): Promise<void> {
    try {
       const userId = this.roleType === "user" ? req.user?.id : req.trainer?.id;
      if (!userId) {
        this.sendResponse(res, {
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          error: { code: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.code, message: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message },
        });
        return;
      }

   const conversationId = req.params.id;
      if (!conversationId) {
        this.sendResponse(res, {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          error: { code: ERRORMESSAGES.INVALID_INPUT_CHAT.code, message: ERRORMESSAGES.INVALID_INPUT_CHAT.message },
        });
        return;
      }

      // query params
     const before = req.query.before as string | undefined;
      const after = req.query.after as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.getConversationMessagesUseCase.execute({
        userId,
        conversationId,
        before,
        after,
        limit,
      });

      this.sendResponse(res, result);

    } catch (error) {
      console.error("Error fetching chat history:", error);
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: { code: ERRORMESSAGES.SERVER_ERROR_CHAT.code, message: ERRORMESSAGES.SERVER_ERROR_CHAT.message },
      });
    }
  }
async getChatSummary(req: CustomRequest, res: Response): Promise<void> {
  try {
    const participantId = this.roleType === "user" ? req.user?.id : req.trainer?.id;
    const participantRole = this.roleType === "user" ? ChatParticipantType.USER : ChatParticipantType.TRAINER;

    if (!participantId) {
      this.sendResponse(res, {
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        error: {
          code: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.code,
          message: ERRORMESSAGES.AUTH_USER_NOT_AUTHENTICATED.message,
        },
      });
      return;
    }

    const result = await this.getChatSummaryUseCase.execute(
      participantId,
      participantRole,
    );

    this.sendResponse(res, result);
  } catch (error) {
    console.error("Error fetching chat summary:", error);
    this.sendResponse(res, {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: {
        code: ERRORMESSAGES.SERVER_ERROR_CHAT.code,
        message: ERRORMESSAGES.SERVER_ERROR_CHAT.message,
      },
    });
  }
}
}