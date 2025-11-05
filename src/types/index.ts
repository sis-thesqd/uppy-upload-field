export interface BaseQuestionConfig {
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
}

export interface FileUploadConfig extends BaseQuestionConfig {
  accept?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}
