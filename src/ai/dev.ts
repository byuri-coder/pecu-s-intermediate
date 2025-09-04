import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-credit-price.ts';
import '@/ai/flows/financial-agent-flow.ts';
import '@/ai/tools/calculator-tool.ts';
