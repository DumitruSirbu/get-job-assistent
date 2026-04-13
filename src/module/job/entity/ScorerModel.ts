import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'scorer_model', synchronize: false })
export class ScorerModel {
    @PrimaryGeneratedColumn({ name: 'scorer_model_id' })
    scorerModelId: number;

    /**
     * Category of the scorer.
     * - "algorithm": deterministic rule-based scorer, no external API calls
     * - "llm": AI language model scorer via external provider API
     */
    @Column({ name: 'scorer_type', type: 'varchar' })
    scorerType: string;

    /**
     * Organisation or system that provides the scorer.
     * - "internal": built-in deterministic algorithm
     * - "openai": OpenAI API (e.g. GPT models)
     * - "anthropic": Anthropic API (e.g. Claude models)
     * - "google": Google AI API (e.g. Gemini models)
     */
    @Column({ name: 'scorer_provider', type: 'varchar' })
    scorerProvider: string;

    /**
     * Specific model or version identifier used for scoring.
     * - "algo-v1": first version of the internal algorithm
     * - "gpt-4.1": OpenAI GPT-4.1
     * - "claude-sonnet-4": Anthropic Claude Sonnet 4
     * - "gemini-2.5-pro": Google Gemini 2.5 Pro
     */
    @Column({ name: 'scorer_model', type: 'varchar' })
    scorerModel: string;
}
