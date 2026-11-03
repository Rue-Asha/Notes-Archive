export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends Error {
	constructor(public what: string) {
		super(`${what} not found`);
		this.name = 'NotFoundError';
	}
}

export class UploadError extends Error {
	constructor(public code: 'too-large' | 'not-image' | 'file-too-large') {
		super(code);
		this.name = 'UploadError';
	}
}

export class FetchError extends Error {
	constructor(
		public code:
			| 'invalid-url'
			| 'private-address'
			| 'status'
			| 'not-html'
			| 'too-large'
			| 'timeout'
			| 'redirects'
			| 'network'
	) {
		super(code);
		this.name = 'FetchError';
	}
}
