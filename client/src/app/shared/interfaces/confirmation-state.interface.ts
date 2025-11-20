export interface ConfirmationState {
  message: string;
  resolve: (value: boolean) => void;
}
