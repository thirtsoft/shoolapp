export interface NotificationConfigurationResponse {
  id: number;
  uuid: string;
  applicationMetierCode?: string;
  notificationProviderUuid?: string;
  providerCode?: string;
  providerLibelle: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  replyTo: string;
  defaultConfiguration: boolean;
  active: boolean;
}