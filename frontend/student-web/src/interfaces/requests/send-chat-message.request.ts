/**
 * Type: Request
 * Description: Payload for sending a new text message in a chat conversation.
 */
export interface SendChatMessageRequest {
    /**
     * Content of the message to send
     */
    content: string;
}