import { SetMetadata } from '@nestjs/common';

export const BYPASS_RESPONSE_FORMAT_KEY = 'bypassResponseFormat';
export const BypassResponseFormat = () => SetMetadata(BYPASS_RESPONSE_FORMAT_KEY, true);