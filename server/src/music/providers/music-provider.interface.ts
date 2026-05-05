export interface MusicProviderRequest {
  prompt: string;
  lyrics?: string;
  tags?: string;
  duration?: number;
  model?: string;
}

export interface MusicProviderResponse {
  audioUrl: string;
  title?: string;
  lyrics?: string;
  duration?: number;
  tags?: string;
  providerTaskId?: string;
}

export interface IMusicProvider {
  generate(request: MusicProviderRequest): Promise<MusicProviderResponse>;
  checkStatus?(taskId: string): Promise<MusicProviderResponse | null>;
}
