export class WhereFilter {
	constructor(propPath: string, comparison: string, value: string) {
		this.propPath = propPath;
		this.comparison = comparison;
		this.value = value;
	}
	propPath: string;
	comparison: string;
	value: string;
}

export class QueryRequest {
	constructor(initialData?: Partial<QueryRequest>) {
		this.Extend(initialData);
	}
	key: string;
	path: string;
	whereFilters: WhereFilter[];
}