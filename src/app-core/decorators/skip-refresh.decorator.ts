import { SetMetadata } from '@nestjs/common';

export const SKIP_TOKEN_REFRESH = 'skipTokenRefresh';
export const SkipTokenRefresh = () => SetMetadata(SKIP_TOKEN_REFRESH, true);
