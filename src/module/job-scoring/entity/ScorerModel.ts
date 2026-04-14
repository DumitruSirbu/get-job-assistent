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
     * - "ollama": local Ollama instance
     * - "openai": OpenAI API
     * - "anthropic": Anthropic API
     * - "google": Google AI API
     */
    @Column({ name: 'scorer_provider', type: 'varchar' })
    scorerProvider: string;

    /**
     * Specific model or version identifier used for scoring.
     * - "algo-v1": first version of the internal algorithm
     * - "gemma4": local Gemma 4 via Ollama
     * - "gpt-4.1": OpenAI GPT-4.1
     */
    @Column({ name: 'scorer_model', type: 'varchar' })
    scorerModel: string;
}
