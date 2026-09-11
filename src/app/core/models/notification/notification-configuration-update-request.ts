export interface NotificationConfigurationUpdateRequest {
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  replyTo?: string;
}