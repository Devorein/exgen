export interface IContextFreeGrammar {
	variables: string[];
	terminals: string[];
	productionRules: Record<string, string[]>;
	startVariable: string;
}