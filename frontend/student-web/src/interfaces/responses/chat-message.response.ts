/**
 * Type: Response
 * Description: Represents a single message exchanged within a chat conversation between a student and a teacher.
 */
export interface ChatMessageResponse {
    /**
     * Unique identifier for the message
     */
    id: string;
    /**
     * Identifier of the chat conversation (teacher) the message belongs to
     */
    chatId: string;
    /**
     * Sender of the message: the student or the teacher
     */
    sentBy: "student" | "teacher";
    /**
     * Content of the message
     */
    content: string;
    /**
     * ISO date string of when the message was sent
     */
    sentAt: string;
}