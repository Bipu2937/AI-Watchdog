import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

const MAX_USERNAME_LENGTH = 128;

const Verdict = z.object({
    allow: z.boolean(),
    risk: z.enum(['low', 'medium', 'high']),
    reason: z.string(),
});

type VerdictShape = z.infer<typeof Verdict>;

const SYSTEM_PROMPT = `You are a login risk assessor for a demo web application.

Given a username string submitted at a login form, return a verdict on whether to allow the session.

Deny (allow: false) when the username shows hallmarks of abuse or clearly isn't a real person:
- Obvious attacker handles: "hacker", "root", "admin'--", "administrator"
- Injection payloads: SQL fragments, shell metacharacters, angle brackets, null bytes
- Credential-stuffing tells: random hex strings, emails with known breach corpora
- Extreme length, non-printable characters, or encoded payloads

Allow (allow: true) for anything that looks like a plausible real username.

Set "risk" to "low" for clean allows, "medium" for borderline allows, "high" for denies.
Keep "reason" to one short sentence — it will be surfaced in logs, not to the end user.`;

const FAILSAFE: VerdictShape = {
    allow: false,
    risk: 'high',
    reason: 'validation unavailable',
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<VerdictShape>,
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json(FAILSAFE);
    }

    const username = typeof req.body?.username === 'string' ? req.body.username : '';
    if (!username || username.length > MAX_USERNAME_LENGTH) {
        return res.status(400).json(FAILSAFE);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('[validate] ANTHROPIC_API_KEY is not set');
        return res.status(500).json(FAILSAFE);
    }

    try {
        const client = new Anthropic({ apiKey });
        const message = await client.messages.parse({
            model: 'claude-opus-4-7',
            max_tokens: 1024,
            thinking: { type: 'adaptive' },
            system: SYSTEM_PROMPT,
            output_config: { format: zodOutputFormat(Verdict) },
            messages: [
                {
                    role: 'user',
                    content: `Assess this login attempt.\nusername: ${JSON.stringify(username)}`,
                },
            ],
        });

        if (!message.parsed_output) {
            return res.status(200).json(FAILSAFE);
        }

        return res.status(200).json(message.parsed_output);
    } catch (err) {
        console.error('[validate] anthropic call failed', err);
        return res.status(200).json(FAILSAFE);
    }
}
